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

// --- Date Plan Handler ---

async function handleDatePlan(
  supabase: ReturnType<typeof import("jsr:@supabase/supabase-js@2").createClient>,
  userId: string,
  payload: Record<string, unknown>
) {
  const sprintId = payload.sprint_id as string;
  if (!sprintId) {
    return new Response(
      JSON.stringify({ error: "Missing 'sprint_id' in payload" }),
      { status: 400, headers: corsHeaders }
    );
  }

  const userContext = await assembleUserContext(supabase, userId);

  // Get sprint data for intensity calculation
  const { data: sprint } = await supabase
    .from("sprints")
    .select("score_a, score_b, winner_id, relative_performance_index")
    .eq("id", sprintId)
    .single();

  if (!sprint) {
    return new Response(
      JSON.stringify({ error: "Sprint not found" }),
      { status: 404, headers: corsHeaders }
    );
  }

  // Determine intensity from RPI
  const rpi = Math.abs(sprint.relative_performance_index ?? 0);
  let intensity: string;
  let budget: number;
  if (rpi < 10) {
    intensity = "gentle";
    budget = 30;
  } else if (rpi < 25) {
    intensity = "moderate";
    budget = 60;
  } else {
    intensity = "spicy";
    budget = 100;
  }

  // Get recent date history to avoid repeats
  const { data: recentDates } = await supabase
    .from("date_history")
    .select("venue_name, activity_type, cuisine_type")
    .order("created_at", { ascending: false })
    .limit(8);

  const now = new Date();
  const mood = selectMood({
    completionRate7d: userContext.completions.completionRate7d,
    streakActive: userContext.streaks.bestIndividual > 0,
    recentStreakBreak: userContext.streaks.recentBreaks > 0,
    avgMoodScore: userContext.recentMood.avgMood7d,
    hourOfDay: now.getUTCHours(),
    dayOfWeek: now.getUTCDay(),
  });

  const config = getModelConfig("date_plan");
  const systemPrompt = assembleSystemPrompt(mood, "date_plan");
  const userMessage = buildUserMessage("date_plan", userContext, undefined, {
    budget,
    intensity,
    recentDates: recentDates || [],
    sprintId,
  });

  const result = await callWithRetry(
    () => callBedrock(config.modelId, systemPrompt, userMessage, config.maxTokens),
    "date_plan"
  );

  let structuredData: Record<string, unknown>;
  try {
    structuredData = parseJsonResponse(result.text);
  } catch {
    structuredData = { options: [], raw: result.text };
  }

  // Store in punishments table
  await supabase.from("punishments").upsert(
    {
      sprint_id: sprintId,
      loser_id: userId,
      intensity: intensity as "gentle" | "moderate" | "spicy",
      budget_gbp: budget,
      date_plan: structuredData,
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
      fallback: result.isFallback,
    }),
    { status: 200, headers: corsHeaders }
  );
}
