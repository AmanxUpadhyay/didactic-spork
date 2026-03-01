import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { verifyServiceRole, corsHeaders } from "../_shared/auth.ts";
import { callBedrock } from "../_shared/bedrock-client.ts";
import { assembleUserContext, assembleSprintContext } from "../_shared/context-assembler.ts";
import { selectMood } from "../_shared/mood-selector.ts";
import { assembleSystemPrompt, buildUserMessage } from "../_shared/prompts.ts";
import { storeResponse } from "../_shared/response-store.ts";
import { callWithRetry } from "../_shared/fallback.ts";
import { getModelConfig } from "../_shared/types.ts";
import type { KiraFunctionType, CronRequestBody, PersonalityMode } from "../_shared/types.ts";
import { selectTemplate, interpolateTemplate, buildNotificationPayload } from "../_shared/notification-templates.ts";
import { recordInteraction, shouldSuppressNegative, injectPositiveKiraMessage, checkGracePeriod } from "../_shared/health-monitor.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  // Verify service_role JWT
  const auth = verifyServiceRole(req.headers.get("Authorization"));
  if (auth.error) return auth.error;
  const supabase = auth.client;

  let body: CronRequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const functionType = body.function_type as KiraFunctionType;

  try {
    switch (functionType) {
      case "sprint_judge":
        return await handleSprintJudge(supabase, body.sprint_id);
      case "daily_notification":
        return await handleDailyNotification(supabase);
      case "mood_response":
        return await handleMoodPrompt(supabase);
      case "weekly_summary":
        return await handleWeeklySummary(supabase);
      case "streak_warning":
        return await handleStreakWarning(supabase);
      case "schedule_daily":
        return await handleScheduleDaily(supabase);
      case "deadline_escalation":
        return await handleDeadlineEscalation(supabase);
      case "point_bank_decay":
        return await handlePointBankDecay(supabase);
      case "fresh_start_calc":
        return await handleFreshStartCalc(supabase);
      case "health_check":
        return await handleHealthCheck(supabase);
      case "positive_injection":
        return await handlePositiveInjection(supabase);
      case "friday_teaser":
        return await handleFridayTeaser(supabase);
      default:
        return new Response(
          JSON.stringify({ error: `Unknown function_type: ${functionType}` }),
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (err) {
    console.error(`kira-cron error (${functionType}):`, err);
    return new Response(
      JSON.stringify({ error: "Internal error", detail: String(err) }),
      { status: 500, headers: corsHeaders }
    );
  }
});

// --- Sprint Judge Handler ---

async function handleSprintJudge(
  supabase: ReturnType<typeof import("jsr:@supabase/supabase-js@2").createClient>,
  explicitSprintId?: string
) {
  // Find the most recently completed sprint
  let sprintId = explicitSprintId;
  if (!sprintId) {
    const { data } = await supabase
      .from("sprints")
      .select("id")
      .eq("status", "completed")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) {
      return new Response(
        JSON.stringify({ error: "No completed sprint found" }),
        { status: 404, headers: corsHeaders }
      );
    }
    sprintId = data.id;
  }

  // Check if we already judged this sprint
  const { data: existing } = await supabase
    .from("ai_responses")
    .select("id")
    .eq("function_type", "sprint_judge")
    .eq("sprint_id", sprintId)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return new Response(
      JSON.stringify({ message: "Sprint already judged", response_id: existing.id }),
      { status: 200, headers: corsHeaders }
    );
  }

  const sprintContext = await assembleSprintContext(supabase, sprintId!);
  if (!sprintContext) {
    return new Response(
      JSON.stringify({ error: "Could not assemble sprint context" }),
      { status: 500, headers: corsHeaders }
    );
  }

  // Pick mood based on overall sprint performance
  const avgScore = (sprintContext.userA.score + sprintContext.userB.score) / 2;
  const now = new Date();
  const mood = selectMood({
    completionRate7d: avgScore / 100,
    streakActive: true,
    recentStreakBreak: false,
    avgMoodScore: null,
    hourOfDay: now.getUTCHours(),
    dayOfWeek: now.getUTCDay(),
  });

  const config = getModelConfig("sprint_judge");
  const systemPrompt = assembleSystemPrompt(mood, "sprint_judge");
  const userMessage = buildUserMessage("sprint_judge", null, sprintContext);

  const result = await callWithRetry(
    () => callBedrock(config.modelId, systemPrompt, userMessage, config.maxTokens),
    "sprint_judge"
  );

  // Parse structured data from response
  let structuredData: Record<string, unknown> | undefined;
  try {
    structuredData = JSON.parse(result.text);
  } catch {
    structuredData = { narrative: result.text, headline: "Sprint Results" };
  }

  const responseId = await storeResponse(supabase, {
    functionType: "sprint_judge",
    responseText: (structuredData as { narrative?: string })?.narrative || result.text,
    structuredData,
    modelUsed: result.isFallback ? "fallback" : config.modelId,
    personalityMode: mood,
    tokensInput: result.tokensInput,
    tokensOutput: result.tokensOutput,
    sprintId: sprintId!,
  });

  return new Response(
    JSON.stringify({
      success: true,
      response_id: responseId,
      mood,
      fallback: result.isFallback,
    }),
    { status: 200, headers: corsHeaders }
  );
}

// --- Daily Notification Handler ---

async function handleDailyNotification(
  supabase: ReturnType<typeof import("jsr:@supabase/supabase-js@2").createClient>
) {
  // Get both users from the active pair
  const { data: pair } = await supabase
    .from("partner_pairs")
    .select("user_a, user_b")
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (!pair) {
    return new Response(
      JSON.stringify({ error: "No active pair" }),
      { status: 404, headers: corsHeaders }
    );
  }

  const results = [];

  for (const userId of [pair.user_a, pair.user_b]) {
    // Check daily notification limit (max 5/day)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("notification_queue")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", todayStart.toISOString());

    if ((count ?? 0) >= 5) {
      results.push({ userId, skipped: "daily limit reached" });
      continue;
    }

    // Check 5:1 ratio — suppress negative-valence notifications if unhealthy
    const suppressNeg = await shouldSuppressNegative(supabase, userId);

    const userContext = await assembleUserContext(supabase, userId);
    const now = new Date();
    const mood = selectMood({
      completionRate7d: userContext.completions.completionRate7d,
      streakActive: userContext.streaks.bestIndividual > 0,
      recentStreakBreak: userContext.streaks.recentBreaks > 0,
      avgMoodScore: userContext.recentMood.avgMood7d,
      hourOfDay: now.getUTCHours(),
      dayOfWeek: now.getUTCDay(),
    });

    const config = getModelConfig("daily_notification");
    const systemPrompt = assembleSystemPrompt(mood, "daily_notification");
    const userMessage = buildUserMessage("daily_notification", userContext);

    const result = await callWithRetry(
      () => callBedrock(config.modelId, systemPrompt, userMessage, config.maxTokens),
      "daily_notification"
    );

    let notifData: { title: string; body: string };
    try {
      notifData = JSON.parse(result.text);
    } catch {
      notifData = { title: "Good morning!", body: "Time to check in on your habits." };
    }

    // If ratio is unhealthy and this would be negative, inject positive instead
    if (suppressNeg) {
      await injectPositiveKiraMessage(supabase, userId, {
        completionRate: userContext.completions.completionRate7d,
        streakDays: userContext.streaks.bestIndividual,
      });
      results.push({ userId, redirected: "positive_injection" });
      continue;
    }

    // Insert into notification_queue
    await supabase.from("notification_queue").insert({
      user_id: userId,
      category: "morning_briefing",
      title: notifData.title.slice(0, 60),
      body: notifData.body.slice(0, 120),
      scheduled_for: new Date().toISOString(),
      status: "pending",
    });

    // Store AI response
    await storeResponse(supabase, {
      functionType: "daily_notification",
      responseText: `${notifData.title}: ${notifData.body}`,
      structuredData: notifData,
      modelUsed: result.isFallback ? "fallback" : config.modelId,
      personalityMode: mood,
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      userId,
    });

    results.push({ userId, sent: true, mood });
  }

  return new Response(JSON.stringify({ success: true, results }), {
    status: 200,
    headers: corsHeaders,
  });
}

// --- Nightly Mood Prompt Handler ---

async function handleMoodPrompt(
  supabase: ReturnType<typeof import("jsr:@supabase/supabase-js@2").createClient>
) {
  const { data: pair } = await supabase
    .from("partner_pairs")
    .select("user_a, user_b")
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (!pair) {
    return new Response(
      JSON.stringify({ error: "No active pair" }),
      { status: 404, headers: corsHeaders }
    );
  }

  const results = [];

  for (const userId of [pair.user_a, pair.user_b]) {
    // Check if user already logged mood today
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const { data: todayMood } = await supabase
      .from("mood_entries")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", todayStart.toISOString())
      .limit(1)
      .maybeSingle();

    if (todayMood) {
      results.push({ userId, skipped: "mood already logged today" });
      continue;
    }

    // Send mood check-in notification
    await supabase.from("notification_queue").insert({
      user_id: userId,
      category: "mood_checkin",
      title: "How are you feeling?",
      body: "Take a moment to check in with yourself tonight.",
      scheduled_for: new Date().toISOString(),
      status: "pending",
    });

    results.push({ userId, prompted: true });
  }

  return new Response(JSON.stringify({ success: true, results }), {
    status: 200,
    headers: corsHeaders,
  });
}

// --- Weekly Summary Handler ---

async function handleWeeklySummary(
  supabase: ReturnType<typeof import("jsr:@supabase/supabase-js@2").createClient>
) {
  const { data: pair } = await supabase
    .from("partner_pairs")
    .select("user_a, user_b")
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (!pair) {
    return new Response(
      JSON.stringify({ error: "No active pair" }),
      { status: 404, headers: corsHeaders }
    );
  }

  const results = [];

  for (const userId of [pair.user_a, pair.user_b]) {
    const userContext = await assembleUserContext(supabase, userId);
    const now = new Date();
    const mood = selectMood({
      completionRate7d: userContext.completions.completionRate7d,
      streakActive: userContext.streaks.bestIndividual > 0,
      recentStreakBreak: userContext.streaks.recentBreaks > 0,
      avgMoodScore: userContext.recentMood.avgMood7d,
      hourOfDay: now.getUTCHours(),
      dayOfWeek: now.getUTCDay(),
    });

    const config = getModelConfig("weekly_summary");
    const systemPrompt = assembleSystemPrompt(mood, "weekly_summary");
    const userMessage = buildUserMessage("weekly_summary", userContext);

    const result = await callWithRetry(
      () => callBedrock(config.modelId, systemPrompt, userMessage, config.maxTokens),
      "weekly_summary"
    );

    let summaryData: { summary: string };
    try {
      summaryData = JSON.parse(result.text);
    } catch {
      summaryData = { summary: result.text };
    }

    // Store as context summary for future reference
    const weekStart = new Date();
    weekStart.setUTCDate(weekStart.getUTCDate() - 7);
    await supabase.from("ai_context_summaries").insert({
      user_id: userId,
      period_type: "weekly",
      period_start: weekStart.toISOString().slice(0, 10),
      period_end: new Date().toISOString().slice(0, 10),
      summary_text: summaryData.summary,
    });

    await storeResponse(supabase, {
      functionType: "weekly_summary",
      responseText: summaryData.summary,
      structuredData: summaryData,
      modelUsed: result.isFallback ? "fallback" : config.modelId,
      personalityMode: mood,
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      userId,
    });

    results.push({ userId, mood, fallback: result.isFallback });
  }

  return new Response(JSON.stringify({ success: true, results }), {
    status: 200,
    headers: corsHeaders,
  });
}

// --- Type alias for Supabase admin client ---

type SupabaseAdmin = ReturnType<typeof import("jsr:@supabase/supabase-js@2").createClient>;

// --- Streak Warning Handler ---

async function handleStreakWarning(supabase: SupabaseAdmin) {
  const { data: pair } = await supabase
    .from("partner_pairs")
    .select("user_a, user_b")
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (!pair) {
    return new Response(JSON.stringify({ error: "No active pair" }), {
      status: 404, headers: corsHeaders,
    });
  }

  const results = [];
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  for (const userId of [pair.user_a, pair.user_b]) {
    // Check if user completed any habits today
    const { count } = await supabase
      .from("habit_completions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true)
      .gte("date", todayStart.toISOString().slice(0, 10));

    if ((count ?? 0) > 0) {
      results.push({ userId, skipped: "already completed today" });
      continue;
    }

    // Get their streak info
    const { data: streakData } = await supabase
      .from("user_streaks")
      .select("current_streak")
      .eq("user_id", userId)
      .maybeSingle();

    const streak = streakData?.current_streak ?? 0;
    if (streak === 0) {
      results.push({ userId, skipped: "no active streak" });
      continue;
    }

    // Get user display name
    const { data: user } = await supabase
      .from("users")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle();

    // Check grace period — skip warning if active
    const grace = await checkGracePeriod(supabase, userId);
    if (grace?.active) {
      results.push({ userId, skipped: "grace period active" });
      continue;
    }

    // Check 5:1 ratio — if unhealthy, send encouraging message instead
    const suppressNeg = await shouldSuppressNegative(supabase, userId);
    if (suppressNeg) {
      await injectPositiveKiraMessage(supabase, userId, {
        streakDays: streak,
        recentAchievement: `${streak}-day streak`,
      });
      results.push({ userId, redirected: "positive_instead_of_warning" });
      continue;
    }

    // Select and interpolate template
    const template = await selectTemplate(supabase, "streak_warning", userId);
    let title = "Your streak is in danger!";
    let body = `${streak} day streak at risk! Complete a habit before midnight.`;

    if (template) {
      const vars = {
        name: user?.display_name || "there",
        streak: String(streak),
      };
      title = interpolateTemplate(template.title_template, vars);
      body = interpolateTemplate(template.body_template, vars);
    }

    const payload = buildNotificationPayload({
      userId,
      category: "streak_warning",
      title: title.slice(0, 60),
      body: body.slice(0, 120),
      data: { url: "/today", streak },
      tag: "streak_warning",
      urgency: "high",
      templateId: template?.id,
    });

    await supabase.from("notification_queue").insert(payload);
    results.push({ userId, warned: true, streak });
  }

  return new Response(JSON.stringify({ success: true, results }), {
    status: 200, headers: corsHeaders,
  });
}

// --- Schedule Daily Handler ---

async function handleScheduleDaily(supabase: SupabaseAdmin) {
  const { data: pair } = await supabase
    .from("partner_pairs")
    .select("user_a, user_b")
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (!pair) {
    return new Response(JSON.stringify({ error: "No active pair" }), {
      status: 404, headers: corsHeaders,
    });
  }

  const results = [];

  for (const userId of [pair.user_a, pair.user_b]) {
    const { data: user } = await supabase
      .from("users")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle();

    // Count today's active tasks
    const { data: activeSprint } = await supabase
      .from("sprints")
      .select("id")
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    let taskCount = 0;
    if (activeSprint) {
      const { count } = await supabase
        .from("sprint_tasks")
        .select("id", { count: "exact", head: true })
        .eq("sprint_id", activeSprint.id)
        .eq("user_id", userId);
      taskCount = count ?? 0;
    }

    // Get streak
    const { data: streakData } = await supabase
      .from("user_streaks")
      .select("current_streak")
      .eq("user_id", userId)
      .maybeSingle();

    const vars = {
      name: user?.display_name || "there",
      task_count: String(taskCount),
      streak: String(streakData?.current_streak ?? 0),
    };

    // Morning briefing notification
    const template = await selectTemplate(supabase, "morning_briefing", userId);
    let title = "Good morning!";
    let body = `${taskCount} habits on deck today.`;

    if (template) {
      title = interpolateTemplate(template.title_template, vars);
      body = interpolateTemplate(template.body_template, vars);
    }

    const payload = buildNotificationPayload({
      userId,
      category: "morning_briefing",
      title: title.slice(0, 60),
      body: body.slice(0, 120),
      data: { url: "/today", task_count: taskCount },
      tag: "morning_briefing",
      urgency: "normal",
      templateId: template?.id,
    });

    await supabase.from("notification_queue").insert(payload);
    results.push({ userId, scheduled: true, taskCount });
  }

  return new Response(JSON.stringify({ success: true, results }), {
    status: 200, headers: corsHeaders,
  });
}

// --- Deadline Escalation Handler ---

async function handleDeadlineEscalation(supabase: SupabaseAdmin) {
  // Find tasks with deadlines approaching in the next 24h
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, user_id, deadline")
    .eq("active", true)
    .not("deadline", "is", null)
    .lte("deadline", tomorrow.toISOString())
    .gte("deadline", now.toISOString());

  if (!tasks || tasks.length === 0) {
    return new Response(JSON.stringify({ success: true, results: [] }), {
      status: 200, headers: corsHeaders,
    });
  }

  const results = [];

  for (const task of tasks) {
    const deadline = new Date(task.deadline);
    const hoursLeft = Math.max(0, Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)));

    const template = await selectTemplate(supabase, "task_deadline", task.user_id);
    let title = "Deadline approaching";
    let body = `"${task.title}" — ${hoursLeft}h left.`;

    if (template) {
      const vars = {
        task_name: task.title,
        deadline: deadline.toLocaleDateString(),
        time_remaining: `${hoursLeft}h`,
      };
      title = interpolateTemplate(template.title_template, vars);
      body = interpolateTemplate(template.body_template, vars);
    }

    const payload = buildNotificationPayload({
      userId: task.user_id,
      category: "task_deadline",
      title: title.slice(0, 60),
      body: body.slice(0, 120),
      data: { url: "/today", task_id: task.id, hours_left: hoursLeft },
      tag: `deadline_${task.id}`,
      urgency: hoursLeft <= 6 ? "high" : "normal",
      templateId: template?.id,
    });

    await supabase.from("notification_queue").insert(payload);
    results.push({ taskId: task.id, userId: task.user_id, hoursLeft });
  }

  return new Response(JSON.stringify({ success: true, results }), {
    status: 200, headers: corsHeaders,
  });
}

// --- Point Bank Decay Handler ---

async function handlePointBankDecay(supabase: SupabaseAdmin) {
  // Get the active sprint
  const { data: sprint } = await supabase
    .from("sprints")
    .select("id")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!sprint) {
    return new Response(JSON.stringify({ success: true, results: [], message: "No active sprint" }), {
      status: 200, headers: corsHeaders,
    });
  }

  const { data: pair } = await supabase
    .from("partner_pairs")
    .select("user_a, user_b")
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (!pair) {
    return new Response(JSON.stringify({ error: "No active pair" }), {
      status: 404, headers: corsHeaders,
    });
  }

  const results = [];
  const today = new Date().toISOString().slice(0, 10);

  for (const userId of [pair.user_a, pair.user_b]) {
    // Get or create point bank snapshot
    let { data: bank } = await supabase
      .from("point_bank_snapshots")
      .select("*")
      .eq("user_id", userId)
      .eq("sprint_id", sprint.id)
      .maybeSingle();

    if (!bank) {
      // Create initial snapshot
      const { data: newBank } = await supabase
        .from("point_bank_snapshots")
        .insert({
          user_id: userId,
          sprint_id: sprint.id,
          initial_points: 200,
          current_points: 200,
          floor_points: 100,
        })
        .select()
        .single();
      bank = newBank;
    }

    if (!bank) {
      results.push({ userId, error: "Could not create bank" });
      continue;
    }

    // Count uncompleted habits today
    const { data: sprintTasks } = await supabase
      .from("sprint_tasks")
      .select("task_id")
      .eq("sprint_id", sprint.id)
      .eq("user_id", userId);

    const taskIds = (sprintTasks || []).map((t: { task_id: string }) => t.task_id);

    let uncompleted = 0;
    if (taskIds.length > 0) {
      const { count: completedCount } = await supabase
        .from("habit_completions")
        .select("id", { count: "exact", head: true })
        .in("task_id", taskIds)
        .eq("completed", true)
        .eq("date", today);

      uncompleted = taskIds.length - (completedCount ?? 0);
    }

    // Decay: -5 points per uncompleted habit
    const decayAmount = uncompleted * 5;
    if (decayAmount === 0) {
      results.push({ userId, decayed: 0, current: bank.current_points });
      continue;
    }

    const newPoints = Math.max(bank.floor_points, bank.current_points - decayAmount);
    const actualDecay = bank.current_points - newPoints;

    // Update the bank
    const decayEntry = { date: today, amount: actualDecay, uncompleted };
    await supabase
      .from("point_bank_snapshots")
      .update({
        current_points: newPoints,
        decay_log: [...(bank.decay_log || []), decayEntry],
        updated_at: new Date().toISOString(),
      })
      .eq("id", bank.id);

    // Send notification if points decayed
    if (actualDecay > 0) {
      const payload = buildNotificationPayload({
        userId,
        category: "nudge",
        title: `${actualDecay} points lost!`,
        body: `You missed ${uncompleted} habit${uncompleted > 1 ? "s" : ""} today. ${newPoints} points remaining.`,
        data: { url: "/today", decayed: actualDecay, remaining: newPoints },
        tag: "point_decay",
        urgency: newPoints <= bank.floor_points + 20 ? "high" : "normal",
      });
      await supabase.from("notification_queue").insert(payload);
    }

    results.push({ userId, decayed: actualDecay, current: newPoints, uncompleted });
  }

  return new Response(JSON.stringify({ success: true, results }), {
    status: 200, headers: corsHeaders,
  });
}

// --- Fresh Start Calc Handler ---

async function handleFreshStartCalc(supabase: SupabaseAdmin) {
  // Get the most recently completed sprint (last week's)
  const { data: lastSprint } = await supabase
    .from("sprints")
    .select("id, week_start")
    .eq("status", "completed")
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Get the current active sprint
  const { data: currentSprint } = await supabase
    .from("sprints")
    .select("id")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!currentSprint) {
    return new Response(JSON.stringify({ success: true, message: "No active sprint" }), {
      status: 200, headers: corsHeaders,
    });
  }

  const { data: pair } = await supabase
    .from("partner_pairs")
    .select("user_a, user_b")
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (!pair) {
    return new Response(JSON.stringify({ error: "No active pair" }), {
      status: 404, headers: corsHeaders,
    });
  }

  const results = [];

  for (const userId of [pair.user_a, pair.user_b]) {
    // Check if bonus already given for this sprint
    const { data: existing } = await supabase
      .from("fresh_start_bonuses")
      .select("id")
      .eq("user_id", userId)
      .eq("sprint_id", currentSprint.id)
      .maybeSingle();

    if (existing) {
      results.push({ userId, skipped: "bonus already applied" });
      continue;
    }

    let bonus = 10; // Minimum bonus
    let reason = "Fresh week energy!";

    if (lastSprint) {
      // Calculate based on last week's performance
      const { data: scores } = await supabase
        .from("sprint_scores")
        .select("final_score")
        .eq("sprint_id", lastSprint.id)
        .eq("user_id", userId)
        .maybeSingle();

      const lastScore = scores?.final_score ?? 0;

      if (lastScore >= 85) {
        bonus = 40;
        reason = "Incredible last week (85%+)! Major head start earned.";
      } else if (lastScore >= 70) {
        bonus = 30;
        reason = "Strong performance last week. Solid head start!";
      } else if (lastScore >= 50) {
        bonus = 20;
        reason = "Good effort last week. Fresh start bonus!";
      } else {
        bonus = 10;
        reason = "New week, new opportunities. Small head start!";
      }
    }

    // Insert fresh start bonus
    await supabase.from("fresh_start_bonuses").insert({
      user_id: userId,
      sprint_id: currentSprint.id,
      bonus_points: bonus,
      reason,
    });

    // Also create/update point bank snapshot with bonus
    const { data: bank } = await supabase
      .from("point_bank_snapshots")
      .select("*")
      .eq("user_id", userId)
      .eq("sprint_id", currentSprint.id)
      .maybeSingle();

    if (bank) {
      await supabase
        .from("point_bank_snapshots")
        .update({
          current_points: bank.current_points + bonus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bank.id);
    } else {
      await supabase.from("point_bank_snapshots").insert({
        user_id: userId,
        sprint_id: currentSprint.id,
        initial_points: 200 + bonus,
        current_points: 200 + bonus,
        floor_points: 100,
      });
    }

    // Send celebration notification
    const { data: user } = await supabase
      .from("users")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle();

    const payload = buildNotificationPayload({
      userId,
      category: "celebration",
      title: `+${bonus} point head start!`,
      body: reason,
      data: { url: "/today", bonus, sprint_id: currentSprint.id },
      tag: "fresh_start",
      urgency: "normal",
    });
    await supabase.from("notification_queue").insert(payload);

    results.push({ userId, bonus, reason });
  }

  return new Response(JSON.stringify({ success: true, results }), {
    status: 200, headers: corsHeaders,
  });
}

// --- Health Check Handler ---

async function handleHealthCheck(supabase: SupabaseAdmin) {
  // Run signal detection
  const { data: signalResult } = await supabase.rpc("detect_relationship_health_signals");

  // Get all unresolved signals
  const { data: signals } = await supabase
    .from("relationship_health_signals")
    .select("*")
    .eq("resolved", false)
    .order("created_at", { ascending: false });

  if (!signals || signals.length === 0) {
    return new Response(
      JSON.stringify({ success: true, signals_detected: signalResult?.signals_created ?? 0, interventions: 0 }),
      { status: 200, headers: corsHeaders }
    );
  }

  const { data: pair } = await supabase
    .from("partner_pairs")
    .select("user_a, user_b")
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (!pair) {
    return new Response(JSON.stringify({ error: "No active pair" }), {
      status: 404, headers: corsHeaders,
    });
  }

  const interventions = [];

  // If 3+ unresolved signals, send proactive Kira push to both users
  if (signals.length >= 3) {
    for (const userId of [pair.user_a, pair.user_b]) {
      const userContext = await assembleUserContext(supabase, userId);
      const mood = "empathetic" as const;
      const config = getModelConfig("health_check");
      const systemPrompt = assembleSystemPrompt(mood, "health_check");

      // Get interaction ratio for context
      const { data: ratioData } = await supabase.rpc("get_interaction_ratio", {
        p_user_id: userId,
      });

      const userMessage = buildUserMessage("health_check", userContext, undefined, {
        signals: signals.map((s: Record<string, unknown>) => ({
          type: s.signal_type,
          severity: s.severity,
          metadata: s.metadata,
        })),
        activeCount: signals.length,
        interactionRatio: ratioData,
      });

      const result = await callWithRetry(
        () => callBedrock(config.modelId, systemPrompt, userMessage, config.maxTokens),
        "health_check"
      );

      let structuredData: Record<string, unknown>;
      try {
        structuredData = JSON.parse(result.text);
      } catch {
        structuredData = {
          message: "Hey — Kira here. I've noticed some patterns that might be worth talking about. Want to take a look?",
          suggested_action: "none",
          severity: "gentle",
        };
      }

      // Queue proactive push notification
      await supabase.from("notification_queue").insert({
        user_id: userId,
        category: "health_check",
        title: "Kira wants to check in",
        body: ((structuredData as { message?: string }).message || "").slice(0, 120),
        scheduled_for: new Date().toISOString(),
        status: "pending",
        urgency: "normal",
        data: { url: "/settings", type: "health_check", signals: signals.length },
      });

      // Record positive interaction (Kira reaching out is caring)
      await recordInteraction(supabase, userId, "kira_health_check", "positive", "kira_message", {
        signals_count: signals.length,
      });

      await storeResponse(supabase, {
        functionType: "health_check",
        responseText: (structuredData as { message?: string }).message || result.text,
        structuredData,
        modelUsed: result.isFallback ? "fallback" : config.modelId,
        personalityMode: mood,
        tokensInput: result.tokensInput,
        tokensOutput: result.tokensOutput,
        userId,
      });

      interventions.push({ userId, type: "proactive_push", signals: signals.length });
    }
  }

  // For individual signals, activate catch-up mechanics
  for (const signal of signals) {
    if (signal.signal_type === "sustained_losing" && signal.affected_user_id) {
      // Auto-activate catch-up for sustained loser
      const { data: sprint } = await supabase
        .from("sprints")
        .select("id")
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (sprint) {
        const { data: tierData } = await supabase.rpc("get_catch_up_tier", {
          p_user_id: signal.affected_user_id,
        });

        if (tierData && tierData.tier > 0) {
          await supabase.from("catch_up_state").upsert(
            {
              user_id: signal.affected_user_id,
              sprint_id: sprint.id,
              tier: tierData.tier,
              comeback_multiplier: tierData.tier >= 2 ? 1.2 : 1.15,
            },
            { onConflict: "user_id,sprint_id" }
          );
          interventions.push({
            userId: signal.affected_user_id,
            type: "catch_up_activated",
            tier: tierData.tier,
          });
        }
      }
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      signals_detected: signalResult?.signals_created ?? 0,
      unresolved_count: signals.length,
      interventions,
    }),
    { status: 200, headers: corsHeaders }
  );
}

// --- Friday Teaser Handler ---

async function handleFridayTeaser(supabase: SupabaseAdmin) {
  // Find active pair
  const { data: pair } = await supabase
    .from("partner_pairs")
    .select("user_a, user_b")
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (!pair) {
    return new Response(JSON.stringify({ error: "No active pair" }), {
      status: 404, headers: corsHeaders,
    });
  }

  // Find latest punishment with a date plan that hasn't been completed
  // (punishments table has no status column — presence of date_plan = pending)
  const { data: punishment } = await supabase
    .from("punishments")
    .select("id, sprint_id, loser_id, winner_id, intensity, scheduled_date, is_mutual_failure")
    .not("date_plan", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!punishment) {
    return new Response(
      JSON.stringify({ success: true, message: "No pending punishment date" }),
      { status: 200, headers: corsHeaders }
    );
  }

  // Deduplication: skip if teaser already sent this week for this punishment
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentTeaser } = await supabase
    .from("ai_responses")
    .select("id")
    .eq("function_type", "friday_teaser")
    .eq("sprint_id", punishment.sprint_id)
    .gte("created_at", weekAgo)
    .limit(1)
    .maybeSingle();

  if (recentTeaser) {
    return new Response(
      JSON.stringify({ success: true, message: "Teaser already sent this week" }),
      { status: 200, headers: corsHeaders }
    );
  }

  // Get user display names
  const [loserRes, winnerRes] = await Promise.all([
    supabase.from("users").select("display_name").eq("id", punishment.loser_id).maybeSingle(),
    punishment.winner_id
      ? supabase.from("users").select("display_name").eq("id", punishment.winner_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const loserName = (loserRes.data as { display_name?: string } | null)?.display_name || "Partner";
  const winnerName = (winnerRes.data as { display_name?: string } | null)?.display_name || "Partner";

  // Days until scheduled date (if set)
  let daysUntilDate: number | undefined;
  if (punishment.scheduled_date) {
    const diff = new Date(punishment.scheduled_date).getTime() - Date.now();
    daysUntilDate = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // Intensity → mood map: gentle→cheerful, moderate→tough_love, spicy→sarcastic
  const intensityMoodMap: Record<string, PersonalityMode> = {
    gentle: "cheerful",
    moderate: "tough_love",
    spicy: "sarcastic",
  };
  const mood = intensityMoodMap[punishment.intensity] || "sarcastic";

  // Call Kira for teaser messages
  const config = getModelConfig("friday_teaser");
  const systemPrompt = assembleSystemPrompt(mood, "friday_teaser");
  const userMessage = buildUserMessage("friday_teaser", null, undefined, {
    loserName,
    winnerName,
    punishmentIntensity: punishment.intensity,
    daysUntilDate,
  });

  let teaserData: { loser: { title: string; body: string }; winner: { title: string; body: string } };
  try {
    const result = await callWithRetry(
      () => callBedrock(config.modelId, systemPrompt, userMessage, config.maxTokens),
      "friday_teaser"
    );
    teaserData = JSON.parse(result.text);
  } catch {
    teaserData = {
      loser: {
        title: `Something is coming, ${loserName}...`,
        body: "Kira is keeping secrets. The date is being planned. Sleep well.",
      },
      winner: {
        title: "Your prize is almost ready",
        body: "The date is being arranged. Good things come to those who crushed the sprint.",
      },
    };
  }

  // Store AI response for deduplication tracking
  await storeResponse(supabase, {
    functionType: "friday_teaser",
    responseText: JSON.stringify(teaserData),
    structuredData: teaserData as unknown as Record<string, unknown>,
    modelUsed: config.modelId,
    personalityMode: mood,
    tokensInput: 0,
    tokensOutput: 0,
    sprintId: punishment.sprint_id,
  });

  const results = [];

  // Queue notification for loser
  try {
    await supabase.from("notification_queue").insert({
      user_id: punishment.loser_id,
      category: "friday_teaser",
      title: teaserData.loser.title.slice(0, 60),
      body: teaserData.loser.body.slice(0, 120),
      scheduled_for: new Date().toISOString(),
      status: "pending",
      urgency: "normal",
      data: { url: "/sprint", type: "friday_teaser" },
      tag: "friday_teaser",
    });
    results.push({ userId: punishment.loser_id, role: "loser", sent: true });
  } catch (err) {
    results.push({ userId: punishment.loser_id, role: "loser", error: String(err) });
  }

  // Queue notification for winner (skip if mutual failure — no winner)
  if (punishment.winner_id && !punishment.is_mutual_failure) {
    try {
      await supabase.from("notification_queue").insert({
        user_id: punishment.winner_id,
        category: "friday_teaser",
        title: teaserData.winner.title.slice(0, 60),
        body: teaserData.winner.body.slice(0, 120),
        scheduled_for: new Date().toISOString(),
        status: "pending",
        urgency: "normal",
        data: { url: "/sprint", type: "friday_teaser" },
        tag: "friday_teaser",
      });
      results.push({ userId: punishment.winner_id, role: "winner", sent: true });
    } catch (err) {
      results.push({ userId: punishment.winner_id, role: "winner", error: String(err) });
    }
  }

  return new Response(
    JSON.stringify({ success: true, results }),
    { status: 200, headers: corsHeaders }
  );
}

// --- Positive Injection Handler ---

async function handlePositiveInjection(supabase: SupabaseAdmin) {
  const { data: pair } = await supabase
    .from("partner_pairs")
    .select("user_a, user_b")
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (!pair) {
    return new Response(JSON.stringify({ error: "No active pair" }), {
      status: 404, headers: corsHeaders,
    });
  }

  const results = [];

  for (const userId of [pair.user_a, pair.user_b]) {
    const { data: ratioData } = await supabase.rpc("get_interaction_ratio", {
      p_user_id: userId,
    });

    // Only inject for unhealthy ratios (skip cold start)
    if (!ratioData || ratioData.cold_start || ratioData.healthy) {
      results.push({ userId, skipped: "ratio healthy or cold start" });
      continue;
    }

    // Get recent achievements for personalization
    const userContext = await assembleUserContext(supabase, userId);

    await injectPositiveKiraMessage(supabase, userId, {
      completionRate: userContext.completions.completionRate7d,
      streakDays: userContext.streaks.bestIndividual,
      recentAchievement: userContext.streaks.bestIndividual > 3
        ? `${userContext.streaks.bestIndividual}-day streak`
        : undefined,
    });

    results.push({ userId, injected: true, ratio: ratioData.ratio });
  }

  return new Response(JSON.stringify({ success: true, results }), {
    status: 200, headers: corsHeaders,
  });
}
