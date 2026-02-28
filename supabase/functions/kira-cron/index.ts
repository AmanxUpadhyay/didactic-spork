import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { verifyServiceRole, corsHeaders } from "../_shared/auth.ts";
import { callBedrock } from "../_shared/bedrock-client.ts";
import { assembleUserContext, assembleSprintContext } from "../_shared/context-assembler.ts";
import { selectMood } from "../_shared/mood-selector.ts";
import { assembleSystemPrompt, buildUserMessage } from "../_shared/prompts.ts";
import { storeResponse } from "../_shared/response-store.ts";
import { callWithRetry } from "../_shared/fallback.ts";
import { getModelConfig } from "../_shared/types.ts";
import type { KiraFunctionType, CronRequestBody } from "../_shared/types.ts";

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
