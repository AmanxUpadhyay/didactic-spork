import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { verifyUserJwt, corsHeaders } from "../_shared/auth.ts";
import { callBedrock, parseJsonResponse } from "../_shared/bedrock-client.ts";
import { assembleUserContext } from "../_shared/context-assembler.ts";
import { selectMood } from "../_shared/mood-selector.ts";
import { assembleSystemPrompt, buildUserMessage } from "../_shared/prompts.ts";
import { storeResponse } from "../_shared/response-store.ts";
import { callWithRetry } from "../_shared/fallback.ts";
import { getModelConfig } from "../_shared/types.ts";
import type { KiraFunctionType, InteractiveRequestBody } from "../_shared/types.ts";
import { rollMysteryBox } from "../_shared/psych-engines.ts";
import { recordInteraction } from "../_shared/health-monitor.ts";

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

  // Verify user JWT
  const auth = await verifyUserJwt(req.headers.get("Authorization"));
  if (auth.error) return auth.error;
  const { client: supabase, userId } = auth;

  let body: InteractiveRequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const functionType = body.function_type as KiraFunctionType;
  const payload = body.payload || {};

  try {
    switch (functionType) {
      case "task_suggest":
        return await handleTaskSuggest(supabase, userId, payload);
      case "excuse_eval":
        return await handleExcuseEval(supabase, userId, payload);
      case "mood_response":
        return await handleMoodResponse(supabase, userId, payload);
      case "date_plan":
        return await handleDatePlan(supabase, userId, payload);
      case "date_rate":
        return await handleDateRate(supabase, userId, payload);
      case "rescue_task":
        return await handleRescueTask(supabase, userId, payload);
      case "mystery_box_roll":
        return await handleMysteryBoxRoll(supabase, userId, payload);
      case "health_check_response":
        return await handleHealthCheckResponse(supabase, userId, payload);
      case "activate_grace":
        return await handleActivateGrace(supabase, userId, payload);
      case "switch_sprint_mode":
        return await handleSwitchSprintMode(supabase, userId, payload);
      default:
        return new Response(
          JSON.stringify({ error: `Unknown function_type: ${functionType}` }),
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (err) {
    console.error(`kira-interactive error (${functionType}):`, err);
    return new Response(
      JSON.stringify({ error: "Internal error", detail: String(err) }),
      { status: 500, headers: corsHeaders }
    );
  }
});

// --- Task Suggestions Handler ---

async function handleTaskSuggest(
  supabase: ReturnType<typeof import("jsr:@supabase/supabase-js@2").createClient>,
  userId: string,
  payload: Record<string, unknown>
) {
  const userContext = await assembleUserContext(supabase, userId);

  // Get current active tasks for context
  const { data: currentTasks } = await supabase
    .from("tasks")
    .select("title, difficulty, task_type, recurrence")
    .eq("user_id", userId)
    .eq("active", true);

  const now = new Date();
  const mood = selectMood({
    completionRate7d: userContext.completions.completionRate7d,
    streakActive: userContext.streaks.bestIndividual > 0,
    recentStreakBreak: userContext.streaks.recentBreaks > 0,
    avgMoodScore: userContext.recentMood.avgMood7d,
    hourOfDay: now.getUTCHours(),
    dayOfWeek: now.getUTCDay(),
  });

  const config = getModelConfig("task_suggest");
  const systemPrompt = assembleSystemPrompt(mood, "task_suggest");
  const userMessage = buildUserMessage("task_suggest", userContext, undefined, {
    ...payload,
    currentTasks: currentTasks || [],
  });

  const result = await callWithRetry(
    () => callBedrock(config.modelId, systemPrompt, userMessage, config.maxTokens),
    "task_suggest"
  );

  let structuredData: Record<string, unknown>;
  try {
    structuredData = parseJsonResponse(result.text);
  } catch {
    structuredData = { suggestions: [], raw: result.text };
  }

  const responseId = await storeResponse(supabase, {
    functionType: "task_suggest",
    responseText: result.text,
    structuredData,
    modelUsed: result.isFallback ? "fallback" : config.modelId,
    personalityMode: mood,
    tokensInput: result.tokensInput,
    tokensOutput: result.tokensOutput,
    userId,
  });

  return new Response(
    JSON.stringify({
      success: true,
      response_id: responseId,
      mood,
      data: structuredData,
      fallback: result.isFallback,
    }),
    { status: 200, headers: corsHeaders }
  );
}

// --- Excuse Evaluation Handler ---

async function handleExcuseEval(
  supabase: ReturnType<typeof import("jsr:@supabase/supabase-js@2").createClient>,
  userId: string,
  payload: Record<string, unknown>
) {
  const excuse = payload.excuse as string;
  const taskTitle = payload.task_title as string;
  const taskId = payload.task_id as string;

  if (!excuse) {
    return new Response(
      JSON.stringify({ error: "Missing 'excuse' in payload" }),
      { status: 400, headers: corsHeaders }
    );
  }

  const userContext = await assembleUserContext(supabase, userId);

  // Count past excuses for pattern detection
  const { count: excuseCount } = await supabase
    .from("ai_responses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("function_type", "excuse_eval");

  const now = new Date();
  const mood = selectMood({
    completionRate7d: userContext.completions.completionRate7d,
    streakActive: userContext.streaks.bestIndividual > 0,
    recentStreakBreak: userContext.streaks.recentBreaks > 0,
    avgMoodScore: userContext.recentMood.avgMood7d,
    hourOfDay: now.getUTCHours(),
    dayOfWeek: now.getUTCDay(),
  });

  const config = getModelConfig("excuse_eval");
  const systemPrompt = assembleSystemPrompt(mood, "excuse_eval");
  const userMessage = buildUserMessage("excuse_eval", userContext, undefined, {
    excuse,
    taskTitle: taskTitle || "Unknown task",
    taskId,
    excuseCount: excuseCount ?? 0,
  });

  const result = await callWithRetry(
    () => callBedrock(config.modelId, systemPrompt, userMessage, config.maxTokens),
    "excuse_eval"
  );

  let structuredData: Record<string, unknown>;
  try {
    structuredData = parseJsonResponse(result.text);
  } catch {
    structuredData = {
      classification: "PARTIAL",
      rationale: "Could not parse response",
      response: result.text,
    };
  }

  const responseId = await storeResponse(supabase, {
    functionType: "excuse_eval",
    responseText:
      (structuredData as { response?: string }).response || result.text,
    structuredData,
    modelUsed: result.isFallback ? "fallback" : config.modelId,
    personalityMode: mood,
    tokensInput: result.tokensInput,
    tokensOutput: result.tokensOutput,
    userId,
  });

  return new Response(
    JSON.stringify({
      success: true,
      response_id: responseId,
      mood,
      data: structuredData,
      fallback: result.isFallback,
    }),
    { status: 200, headers: corsHeaders }
  );
}

// --- Mood Response Handler (manual) ---

async function handleMoodResponse(
  supabase: ReturnType<typeof import("jsr:@supabase/supabase-js@2").createClient>,
  userId: string,
  payload: Record<string, unknown>
) {
  const moodScore = payload.mood_score as number;
  const journalText = payload.journal_text as string | undefined;
  const depth = (payload.depth as string) || "quick";

  if (moodScore === undefined || moodScore < 1 || moodScore > 5) {
    return new Response(
      JSON.stringify({ error: "mood_score must be 1-5" }),
      { status: 400, headers: corsHeaders }
    );
  }

  const userContext = await assembleUserContext(supabase, userId);

  // Determine if deep mode should be used
  const isDeep =
    depth === "deep" ||
    (userContext.recentMood.trend7d !== null && userContext.recentMood.trend7d < -0.5);

  const now = new Date();
  const mood = selectMood({
    completionRate7d: userContext.completions.completionRate7d,
    streakActive: userContext.streaks.bestIndividual > 0,
    recentStreakBreak: userContext.streaks.recentBreaks > 0,
    avgMoodScore: moodScore,
    hourOfDay: now.getUTCHours(),
    dayOfWeek: now.getUTCDay(),
  });

  const config = getModelConfig("mood_response", isDeep);
  const systemPrompt = assembleSystemPrompt(mood, "mood_response");
  const userMessage = buildUserMessage("mood_response", userContext, undefined, {
    moodScore,
    journalText: journalText || "",
    depth: isDeep ? "deep" : "quick",
  });

  const result = await callWithRetry(
    () => callBedrock(config.modelId, systemPrompt, userMessage, config.maxTokens),
    "mood_response"
  );

  let structuredData: Record<string, unknown>;
  try {
    structuredData = parseJsonResponse(result.text);
  } catch {
    structuredData = { response: result.text, followUp: null };
  }

  // Store the mood entry
  await supabase.from("mood_entries").insert({
    user_id: userId,
    mood_score: moodScore,
    journal_text: journalText || null,
    mood_depth: isDeep ? "deep" : "quick",
  });

  const responseId = await storeResponse(supabase, {
    functionType: "mood_response",
    responseText:
      (structuredData as { response?: string }).response || result.text,
    structuredData,
    modelUsed: result.isFallback ? "fallback" : config.modelId,
    personalityMode: mood,
    tokensInput: result.tokensInput,
    tokensOutput: result.tokensOutput,
    userId,
  });

  return new Response(
    JSON.stringify({
      success: true,
      response_id: responseId,
      mood,
      data: structuredData,
      fallback: result.isFallback,
    }),
    { status: 200, headers: corsHeaders }
  );
}

// --- Date Plan Handler (Enhanced for Phase 4) ---

async function handleDatePlan(
  supabase: ReturnType<typeof import("jsr:@supabase/supabase-js@2").createClient>,
  userId: string,
  payload: Record<string, unknown>
) {
  const sprintId = payload.sprint_id as string;
  const vetoRegenerate = payload.veto_regenerate as boolean | undefined;
  const vetoedIndices = payload.vetoed_indices as number[] | undefined;
  const existingOptions = payload.existing_options as unknown[] | undefined;

  if (!sprintId) {
    return new Response(
      JSON.stringify({ error: "Missing 'sprint_id' in payload" }),
      { status: 400, headers: corsHeaders }
    );
  }

  const userContext = await assembleUserContext(supabase, userId);

  // Get sprint data with user info
  const { data: sprint } = await supabase
    .from("sprints")
    .select("score_a, score_b, winner_id, relative_performance_index, user_a, user_b")
    .eq("id", sprintId)
    .single();

  if (!sprint) {
    return new Response(
      JSON.stringify({ error: "Sprint not found" }),
      { status: 404, headers: corsHeaders }
    );
  }

  // Calculate completion rates for mutual failure / both-win detection
  const scoreA = sprint.score_a ?? 0;
  const scoreB = sprint.score_b ?? 0;
  const isMutualFailure = scoreA < 30 && scoreB < 30;
  const isBothWin = scoreA >= 85 && scoreB >= 85;

  // Determine intensity from RPI
  const rpi = Math.abs(sprint.relative_performance_index ?? 0);
  let intensity: string;
  let budget: number;

  if (isMutualFailure) {
    intensity = "gentle";
    budget = 30;
  } else if (isBothWin) {
    intensity = "moderate";
    budget = 60;
  } else if (rpi < 10) {
    intensity = "gentle";
    budget = 30;
  } else if (rpi < 25) {
    intensity = "moderate";
    budget = 60;
  } else {
    intensity = "spicy";
    budget = 100;
  }

  // Query date_memory_state for rotation
  const { data: memoryState } = await supabase
    .from("date_memory_state")
    .select("*")
    .limit(1)
    .maybeSingle();

  // Quality safeguard: downgrade intensity if consecutive low ratings >= 2
  if (memoryState && memoryState.consecutive_low_ratings >= 2) {
    if (intensity === "spicy") {
      intensity = "moderate";
      budget = 60;
    } else if (intensity === "moderate") {
      intensity = "gentle";
      budget = 30;
    }
  }

  // Calculate winner's veto count from completion rate
  const winnerScore = Math.max(scoreA, scoreB);
  let vetoesGranted: number;
  if (winnerScore >= 85) {
    vetoesGranted = 3;
  } else if (winnerScore >= 70) {
    vetoesGranted = 2;
  } else {
    vetoesGranted = 1;
  }

  // Tier 3+ (mighty_oak) users get +1 veto
  const winnerId = sprint.winner_id;
  if (winnerId) {
    const { data: tierUnlocks } = await supabase.rpc("get_tier_unlocks", {
      p_user_id: winnerId,
    });
    if (tierUnlocks?.unlocks?.bonus_veto) {
      vetoesGranted += 1;
    }
  }

  // Surprise element eligibility (mighty_oak+)
  let surpriseEligible = false;
  if (winnerId) {
    const { data: tierUnlocks } = await supabase.rpc("get_tier_unlocks", {
      p_user_id: winnerId,
    });
    surpriseEligible = !!tierUnlocks?.unlocks?.surprise_dates;
  }

  // Get recent date history to avoid repeats
  const { data: recentDates } = await supabase
    .from("date_history")
    .select("venue_name, activity_type, cuisine_type")
    .order("created_at", { ascending: false })
    .limit(8);

  const now = new Date();
  // For mutual failure, use disappointed mood; for both-win, use hype_man
  let mood;
  if (isMutualFailure) {
    mood = "disappointed" as const;
  } else if (isBothWin) {
    mood = "hype_man" as const;
  } else {
    mood = selectMood({
      completionRate7d: userContext.completions.completionRate7d,
      streakActive: userContext.streaks.bestIndividual > 0,
      recentStreakBreak: userContext.streaks.recentBreaks > 0,
      avgMoodScore: userContext.recentMood.avgMood7d,
      hourOfDay: now.getUTCHours(),
      dayOfWeek: now.getUTCDay(),
    });
  }

  const config = getModelConfig("date_plan");
  const systemPrompt = assembleSystemPrompt(mood, "date_plan");
  const userMessage = buildUserMessage("date_plan", userContext, undefined, {
    budget,
    intensity,
    recentDates: recentDates || [],
    sprintId,
    isMutualFailure,
    isBothWin,
    surpriseEligible,
    vetoRegenerate: vetoRegenerate || false,
    vetoedIndices: vetoedIndices || [],
    existingOptions: existingOptions || [],
    memoryState: memoryState
      ? {
          lastCategories: memoryState.last_categories,
          lastCuisines: memoryState.last_cuisines,
          lastVenues: memoryState.last_venues,
          intensityWavePosition: memoryState.intensity_wave_position,
        }
      : null,
  });

  const result = await callWithRetry(
    () =>
      callBedrock(config.modelId, systemPrompt, userMessage, config.maxTokens),
    "date_plan"
  );

  let structuredData: Record<string, unknown>;
  try {
    structuredData = parseJsonResponse(result.text);
  } catch {
    structuredData = { options: [], raw: result.text };
  }

  // Extract surprise element if present
  const surpriseElement =
    (structuredData as { surprise_element?: unknown }).surprise_element || null;

  // Upsert punishment record
  await supabase.from("punishments").upsert(
    {
      sprint_id: sprintId,
      loser_id: isMutualFailure ? sprint.user_a : userId,
      winner_id: winnerId,
      intensity: intensity as "gentle" | "moderate" | "spicy",
      budget_gbp: budget,
      date_plan: structuredData,
      vetoes_granted: vetoesGranted,
      surprise_element: surpriseElement,
      is_mutual_failure: isMutualFailure,
      is_both_win: isBothWin,
    },
    { onConflict: "sprint_id" }
  );

  const responseId = await storeResponse(supabase, {
    functionType: "date_plan",
    responseText: result.text,
    structuredData,
    modelUsed: result.isFallback ? "fallback" : config.modelId,
    personalityMode: mood,
    tokensInput: result.tokensInput,
    tokensOutput: result.tokensOutput,
    userId,
    sprintId,
  });

  return new Response(
    JSON.stringify({
      success: true,
      response_id: responseId,
      mood,
      data: structuredData,
      intensity,
      budget,
      vetoes_granted: vetoesGranted,
      is_mutual_failure: isMutualFailure,
      is_both_win: isBothWin,
      fallback: result.isFallback,
    }),
    { status: 200, headers: corsHeaders }
  );
}

// --- Date Rating Handler ---

async function handleDateRate(
  supabase: ReturnType<typeof import("jsr:@supabase/supabase-js@2").createClient>,
  userId: string,
  payload: Record<string, unknown>
) {
  const punishmentId = payload.punishment_id as string;
  const rating = payload.rating as number;
  const highlights = payload.highlights as string | undefined;
  const improvements = payload.improvements as string | undefined;

  if (!punishmentId || !rating || rating < 1 || rating > 5) {
    return new Response(
      JSON.stringify({ error: "punishment_id and rating (1-5) required" }),
      { status: 400, headers: corsHeaders }
    );
  }

  // Get the punishment to find linked date_history
  const { data: punishment } = await supabase
    .from("punishments")
    .select("id, sprint_id")
    .eq("id", punishmentId)
    .single();

  if (!punishment) {
    return new Response(
      JSON.stringify({ error: "Punishment not found" }),
      { status: 404, headers: corsHeaders }
    );
  }

  // Find or create date_history entry
  let { data: dateHistory } = await supabase
    .from("date_history")
    .select("id")
    .eq("punishment_id", punishmentId)
    .maybeSingle();

  if (!dateHistory) {
    const { data: newEntry } = await supabase
      .from("date_history")
      .insert({ punishment_id: punishmentId, category: "dinner" })
      .select("id")
      .single();
    dateHistory = newEntry;
  }

  if (!dateHistory) {
    return new Response(
      JSON.stringify({ error: "Failed to create date history entry" }),
      { status: 500, headers: corsHeaders }
    );
  }

  // Insert rating
  await supabase.from("date_ratings").upsert(
    {
      date_history_id: dateHistory.id,
      user_id: userId,
      rating,
      highlights: highlights || null,
      improvements: improvements || null,
    },
    { onConflict: "date_history_id,user_id" }
  );

  // Check if both partners have rated
  const { data: allRatings } = await supabase
    .from("date_ratings")
    .select("rating, user_id")
    .eq("date_history_id", dateHistory.id);

  const bothRated = (allRatings?.length ?? 0) >= 2;
  const partnerRating = allRatings?.find((r) => r.user_id !== userId)?.rating;

  // If both rated, update date_memory_state
  if (bothRated && allRatings) {
    const avgRating =
      allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    // Update or create date_memory_state
    const { data: memState } = await supabase
      .from("date_memory_state")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (memState) {
      const newConsecutiveLow =
        avgRating < 3 ? memState.consecutive_low_ratings + 1 : 0;
      const newWavePos = (memState.intensity_wave_position + 1) % 3;

      await supabase
        .from("date_memory_state")
        .update({
          consecutive_low_ratings: newConsecutiveLow,
          intensity_wave_position: newWavePos,
          total_dates_completed: memState.total_dates_completed + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", memState.id);
    } else {
      await supabase.from("date_memory_state").insert({
        consecutive_low_ratings: avgRating < 3 ? 1 : 0,
        intensity_wave_position: 1,
        total_dates_completed: 1,
      });
    }

    // Update date_history rating
    await supabase
      .from("date_history")
      .update({ rating: Math.round(avgRating) })
      .eq("id", dateHistory.id);
  }

  // Generate AI response
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

  const config = getModelConfig("date_rate");
  const systemPrompt = assembleSystemPrompt(mood, "date_rate");
  const userMessage = buildUserMessage("date_rate", userContext, undefined, {
    rating,
    highlights,
    improvements,
    bothRated,
    partnerRating: partnerRating || null,
  });

  const result = await callWithRetry(
    () =>
      callBedrock(config.modelId, systemPrompt, userMessage, config.maxTokens),
    "date_rate"
  );

  let structuredData: Record<string, unknown>;
  try {
    structuredData = parseJsonResponse(result.text);
  } catch {
    structuredData = { response: result.text, quality_note: "" };
  }

  const responseId = await storeResponse(supabase, {
    functionType: "date_rate",
    responseText:
      (structuredData as { response?: string }).response || result.text,
    structuredData,
    modelUsed: result.isFallback ? "fallback" : config.modelId,
    personalityMode: mood,
    tokensInput: result.tokensInput,
    tokensOutput: result.tokensOutput,
    userId,
  });

  return new Response(
    JSON.stringify({
      success: true,
      response_id: responseId,
      mood,
      data: structuredData,
      both_rated: bothRated,
      fallback: result.isFallback,
    }),
    { status: 200, headers: corsHeaders }
  );
}

// --- Rescue Task Handler ---

async function handleRescueTask(
  supabase: ReturnType<typeof import("jsr:@supabase/supabase-js@2").createClient>,
  userId: string,
  payload: Record<string, unknown>
) {
  const streakId = payload.streak_id as string;

  if (!streakId) {
    return new Response(
      JSON.stringify({ error: "Missing 'streak_id' in payload" }),
      { status: 400, headers: corsHeaders }
    );
  }

  // Verify tier >= mighty_oak
  const { data: tierUnlocks } = await supabase.rpc("get_tier_unlocks", {
    p_user_id: userId,
  });

  if (!tierUnlocks?.unlocks?.couple_rescue) {
    return new Response(
      JSON.stringify({ error: "Couple rescue requires Mighty Oak tier or higher" }),
      { status: 403, headers: corsHeaders }
    );
  }

  // Verify partner has broken streak
  const { data: streak } = await supabase
    .from("streaks")
    .select("id, user_id, current_days, task_id, couple_rescue_available")
    .eq("id", streakId)
    .single();

  if (!streak || !streak.couple_rescue_available) {
    return new Response(
      JSON.stringify({ error: "Streak not eligible for rescue" }),
      { status: 400, headers: corsHeaders }
    );
  }

  // Verify this is the partner's streak, not the rescuer's own
  if (streak.user_id === userId) {
    return new Response(
      JSON.stringify({ error: "Cannot rescue your own streak" }),
      { status: 400, headers: corsHeaders }
    );
  }

  // Check rescuer cooldown (7 days between rescues)
  const { data: recentRescue } = await supabase
    .from("couple_rescues")
    .select("cooldown_until")
    .eq("rescuer_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recentRescue && new Date(recentRescue.cooldown_until) > new Date()) {
    return new Response(
      JSON.stringify({
        error: "Rescue on cooldown",
        cooldown_until: recentRescue.cooldown_until,
      }),
      { status: 429, headers: corsHeaders }
    );
  }

  // Get task title for context
  let streakTaskTitle = "Unknown habit";
  if (streak.task_id) {
    const { data: task } = await supabase
      .from("tasks")
      .select("title")
      .eq("id", streak.task_id)
      .single();
    if (task) streakTaskTitle = task.title;
  }

  // Generate rescue task via AI
  const userContext = await assembleUserContext(supabase, userId);
  const mood = "empathetic" as const;
  const config = getModelConfig("rescue_task");
  const systemPrompt = assembleSystemPrompt(mood, "rescue_task");
  const userMessage = buildUserMessage("rescue_task", userContext, undefined, {
    streakTaskTitle,
    streakDays: streak.current_days,
    rescuerName: userContext.name,
  });

  const result = await callWithRetry(
    () =>
      callBedrock(config.modelId, systemPrompt, userMessage, config.maxTokens),
    "rescue_task"
  );

  let structuredData: Record<string, unknown>;
  try {
    structuredData = parseJsonResponse(result.text);
  } catch {
    structuredData = {
      task: "Write a short appreciation note",
      description: "Write a quick note to your partner expressing support.",
      timeEstimate: "10 mins",
    };
  }

  const rescueTaskTitle =
    (structuredData as { task?: string }).task || "Complete rescue task";

  // Create couple_rescues row
  const cooldownUntil = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  await supabase.from("couple_rescues").insert({
    streak_id: streakId,
    rescuer_id: userId,
    rescue_task_title: rescueTaskTitle,
    cooldown_until: cooldownUntil,
  });

  const responseId = await storeResponse(supabase, {
    functionType: "rescue_task",
    responseText: result.text,
    structuredData,
    modelUsed: result.isFallback ? "fallback" : config.modelId,
    personalityMode: mood,
    tokensInput: result.tokensInput,
    tokensOutput: result.tokensOutput,
    userId,
  });

  return new Response(
    JSON.stringify({
      success: true,
      response_id: responseId,
      mood,
      data: structuredData,
      cooldown_until: cooldownUntil,
      fallback: result.isFallback,
    }),
    { status: 200, headers: corsHeaders }
  );
}

// --- Mystery Box Roll Handler ---

async function handleMysteryBoxRoll(
  supabase: ReturnType<typeof import("jsr:@supabase/supabase-js@2").createClient>,
  userId: string,
  payload: Record<string, unknown>
) {
  const completionId = payload.completion_id as string;

  if (!completionId) {
    return new Response(
      JSON.stringify({ error: "Missing 'completion_id' in payload" }),
      { status: 400, headers: corsHeaders }
    );
  }

  // Check if already rolled for this completion
  const { data: existing } = await supabase
    .from("variable_rewards")
    .select("id, reward_type, triggered")
    .eq("completion_id", completionId)
    .maybeSingle();

  if (existing) {
    return new Response(
      JSON.stringify({
        success: true,
        already_rolled: true,
        triggered: existing.triggered,
        reward: existing.triggered ? { type: existing.reward_type } : null,
      }),
      { status: 200, headers: corsHeaders }
    );
  }

  const result = await rollMysteryBox(userId, completionId, supabase);

  return new Response(
    JSON.stringify({
      success: true,
      ...result,
    }),
    { status: 200, headers: corsHeaders }
  );
}

// --- Health Check Response Handler ---

async function handleHealthCheckResponse(
  supabase: ReturnType<typeof import("jsr:@supabase/supabase-js@2").createClient>,
  userId: string,
  payload: Record<string, unknown>
) {
  const chosenAction = payload.action as string;
  const signalId = payload.signal_id as string | undefined;

  if (!chosenAction || !["cooperative", "grace", "fine"].includes(chosenAction)) {
    return new Response(
      JSON.stringify({ error: "action must be 'cooperative', 'grace', or 'fine'" }),
      { status: 400, headers: corsHeaders }
    );
  }

  // Resolve the health signal if provided
  if (signalId) {
    await supabase
      .from("relationship_health_signals")
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        intervention_type: chosenAction,
      })
      .eq("id", signalId);
  }

  // Apply the chosen action
  if (chosenAction === "cooperative") {
    // Store pending mode for next sprint
    const { data: nextSprint } = await supabase
      .from("sprints")
      .select("id")
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (nextSprint) {
      // Mark current sprint to switch mode next week
      await supabase.from("sprints").update({
        sprint_mode: "cooperative",
      }).eq("id", nextSprint.id);
    }
  } else if (chosenAction === "grace") {
    await supabase.rpc("activate_monthly_free_grace", { p_user_id: userId });
  }

  // Generate Kira response
  const userContext = await assembleUserContext(supabase, userId);
  const mood = "empathetic" as const;
  const config = getModelConfig("health_check_response");
  const systemPrompt = assembleSystemPrompt(mood, "health_check_response");
  const userMessage = buildUserMessage("health_check_response", userContext, undefined, {
    chosenAction,
    signalType: payload.signal_type || "unknown",
    context: payload.context || "",
  });

  const result = await callWithRetry(
    () => callBedrock(config.modelId, systemPrompt, userMessage, config.maxTokens),
    "health_check_response"
  );

  let structuredData: Record<string, unknown>;
  try {
    structuredData = parseJsonResponse(result.text);
  } catch {
    structuredData = { response: "Got it. I'll keep an eye on things.", action_confirmed: true };
  }

  await recordInteraction(supabase, userId, "health_check_response", "positive", "in_app", {
    action: chosenAction,
  });

  const responseId = await storeResponse(supabase, {
    functionType: "health_check_response",
    responseText: (structuredData as { response?: string }).response || result.text,
    structuredData,
    modelUsed: result.isFallback ? "fallback" : config.modelId,
    personalityMode: mood,
    tokensInput: result.tokensInput,
    tokensOutput: result.tokensOutput,
    userId,
  });

  return new Response(
    JSON.stringify({
      success: true,
      response_id: responseId,
      mood,
      data: structuredData,
      action: chosenAction,
      fallback: result.isFallback,
    }),
    { status: 200, headers: corsHeaders }
  );
}

// --- Activate Grace Period Handler ---

async function handleActivateGrace(
  supabase: ReturnType<typeof import("jsr:@supabase/supabase-js@2").createClient>,
  userId: string,
  payload: Record<string, unknown>
) {
  const reason = (payload.reason as string) || "manual";
  const days = (payload.days as number) || 7;

  let graceResult;

  if (reason === "monthly_free") {
    const { data } = await supabase.rpc("activate_monthly_free_grace", {
      p_user_id: userId,
    });
    graceResult = data;
  } else {
    // Manual grace period
    const endsAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const { data, error } = await supabase.from("grace_periods").insert({
      user_id: userId,
      reason,
      starts_at: new Date().toISOString().slice(0, 10),
      ends_at: endsAt,
      auto_triggered: false,
    }).select().single();

    if (error) {
      return new Response(
        JSON.stringify({ error: "Failed to activate grace period", detail: error.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    graceResult = { success: true, grace_id: data.id, starts_at: data.starts_at, ends_at: data.ends_at, days };
  }

  if (graceResult && !graceResult.success) {
    return new Response(
      JSON.stringify({ success: false, reason: graceResult.reason }),
      { status: 400, headers: corsHeaders }
    );
  }

  // Generate Kira acknowledgment
  const userContext = await assembleUserContext(supabase, userId);
  const config = getModelConfig("activate_grace");
  const systemPrompt = assembleSystemPrompt("empathetic", "activate_grace");
  const userMessage = buildUserMessage("activate_grace", userContext, undefined, {
    graceReason: reason,
    graceDays: days,
  });

  const result = await callWithRetry(
    () => callBedrock(config.modelId, systemPrompt, userMessage, config.maxTokens),
    "activate_grace"
  );

  let message: string;
  try {
    const parsed = parseJsonResponse(result.text);
    message = (parsed as { message?: string }).message || "Take the time you need. Your streaks are safe.";
  } catch {
    message = "Take the time you need. Your streaks are safe.";
  }

  await recordInteraction(supabase, userId, "grace_activated", "positive", "in_app", {
    reason,
    days,
  });

  return new Response(
    JSON.stringify({
      success: true,
      grace: graceResult,
      kira_message: message,
    }),
    { status: 200, headers: corsHeaders }
  );
}

// --- Switch Sprint Mode Handler ---

async function handleSwitchSprintMode(
  supabase: ReturnType<typeof import("jsr:@supabase/supabase-js@2").createClient>,
  userId: string,
  payload: Record<string, unknown>
) {
  const newMode = payload.mode as string;

  if (!newMode || !["competitive", "cooperative", "swap"].includes(newMode)) {
    return new Response(
      JSON.stringify({ error: "mode must be 'competitive', 'cooperative', or 'swap'" }),
      { status: 400, headers: corsHeaders }
    );
  }

  // Get the current active sprint to determine its mode
  const { data: activeSprint } = await supabase
    .from("sprints")
    .select("id, sprint_mode")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  const currentMode = activeSprint?.sprint_mode || "competitive";

  // Mode change applies to the NEXT sprint, not current
  // Store it as metadata on the pair for the weekly sprint creation to pick up
  const { data: pair } = await supabase
    .from("partner_pairs")
    .select("id")
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (!pair) {
    return new Response(
      JSON.stringify({ error: "No active pair found" }),
      { status: 404, headers: corsHeaders }
    );
  }

  // If there's an active sprint, update it (mode changes take effect immediately
  // for next sprint, but we store the pending mode on the current sprint)
  if (activeSprint) {
    await supabase.from("sprints").update({
      sprint_mode: newMode,
    }).eq("id", activeSprint.id);
  }

  // Generate Kira response
  const userContext = await assembleUserContext(supabase, userId);
  const config = getModelConfig("switch_sprint_mode");
  const systemPrompt = assembleSystemPrompt("cheerful", "switch_sprint_mode");
  const userMessage = buildUserMessage("switch_sprint_mode", userContext, undefined, {
    currentMode,
    newMode,
  });

  const result = await callWithRetry(
    () => callBedrock(config.modelId, systemPrompt, userMessage, config.maxTokens),
    "switch_sprint_mode"
  );

  let message: string;
  try {
    const parsed = parseJsonResponse(result.text);
    message = (parsed as { message?: string }).message || `Switched to ${newMode} mode.`;
  } catch {
    message = `Switched to ${newMode} mode.`;
  }

  await recordInteraction(supabase, userId, "mode_switch", "neutral", "in_app", {
    from: currentMode,
    to: newMode,
  });

  return new Response(
    JSON.stringify({
      success: true,
      previous_mode: currentMode,
      new_mode: newMode,
      kira_message: message,
    }),
    { status: 200, headers: corsHeaders }
  );
}
