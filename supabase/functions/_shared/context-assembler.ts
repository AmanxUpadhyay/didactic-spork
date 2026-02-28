import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import type { UserContext, SprintContext } from "./types.ts";

/**
 * Assemble a single user's context via parallel Supabase queries.
 */
export async function assembleUserContext(
  supabase: SupabaseClient,
  userId: string
): Promise<UserContext> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000)
    .toISOString()
    .slice(0, 10);

  const [
    userRes,
    aiProfileRes,
    moodRes,
    moodViewRes,
    streakRes,
    completionsRes,
    taskCountRes,
    summaryRes,
  ] = await Promise.all([
    // User profile
    supabase.from("users").select("*").eq("id", userId).single(),
    // AI profile
    supabase
      .from("user_ai_profiles")
      .select("personality_summary, key_patterns, communication_preferences")
      .eq("user_id", userId)
      .maybeSingle(),
    // Recent mood entries (latest 7 days)
    supabase
      .from("mood_entries")
      .select("mood_score, journal_text, created_at")
      .eq("user_id", userId)
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(7),
    // Mood view (aggregated)
    supabase
      .from("mv_user_mood_recent")
      .select("avg_mood_7d, trend_7d")
      .eq("user_id", userId)
      .maybeSingle(),
    // Streaks
    supabase
      .from("streaks")
      .select("current_days, streak_type, broken_at")
      .eq("user_id", userId),
    // Completions in last 7 days
    supabase
      .from("habit_completions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("completed_date", sevenDaysAgo),
    // Total active tasks (for calculating completion rate)
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("active", true),
    // Latest weekly summary
    supabase
      .from("ai_context_summaries")
      .select("summary_text")
      .eq("user_id", userId)
      .eq("period_type", "weekly")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const user = userRes.data;
  const streaks = streakRes.data || [];
  const moodEntries = moodRes.data || [];
  const completionsCount = completionsRes.count ?? 0;
  const taskCount = taskCountRes.count ?? 0;

  // Calculate streak stats
  const individualStreaks = streaks.filter(
    (s) => s.streak_type === "individual"
  );
  const coupleStreaks = streaks.filter((s) => s.streak_type === "couple");
  const bestIndividual = Math.max(
    0,
    ...individualStreaks.map((s) => s.current_days)
  );
  const activeCoupleStreak = Math.max(
    0,
    ...coupleStreaks.map((s) => s.current_days)
  );
  const recentBreaks = streaks.filter(
    (s) => s.broken_at && new Date(s.broken_at) > new Date(sevenDaysAgo)
  ).length;

  // Completion rate: completions / (tasks * 7 days) — approximate
  const tasksDue7d = taskCount * 7;
  const completionRate7d = tasksDue7d > 0 ? completionsCount / tasksDue7d : 0;

  return {
    userId,
    name: user?.name || "User",
    timezone: user?.timezone || "UTC",
    preferences: (user?.preferences as Record<string, unknown>) || {},
    hardNos: (user?.hard_nos as unknown[]) || [],
    mildDiscomforts: (user?.mild_discomforts as unknown[]) || [],
    aiProfile: aiProfileRes.data
      ? {
          personalitySummary: aiProfileRes.data.personality_summary,
          keyPatterns: aiProfileRes.data.key_patterns,
          communicationPreferences:
            aiProfileRes.data.communication_preferences as Record<
              string,
              unknown
            > | null,
        }
      : null,
    recentMood: {
      avgMood7d: moodViewRes.data?.avg_mood_7d ?? null,
      trend7d: moodViewRes.data?.trend_7d ?? null,
      latestScore: moodEntries[0]?.mood_score ?? null,
      latestJournal: moodEntries[0]?.journal_text ?? null,
    },
    streaks: {
      bestIndividual,
      activeCoupleStreak,
      recentBreaks,
    },
    completions: {
      completionRate7d: Math.min(1, completionRate7d),
      tasksCompleted7d: completionsCount,
      tasksDue7d,
    },
    weeklySummary: summaryRes.data?.summary_text ?? null,
  };
}

/**
 * Assemble sprint context for sprint judging (both users).
 */
export async function assembleSprintContext(
  supabase: SupabaseClient,
  sprintId: string
): Promise<SprintContext | null> {
  // Fetch sprint data
  const { data: sprint } = await supabase
    .from("sprints")
    .select("*")
    .eq("id", sprintId)
    .single();

  if (!sprint) return null;

  // Get partner pair
  const { data: pair } = await supabase
    .from("partner_pairs")
    .select("user_a, user_b")
    .eq("active", true)
    .limit(1)
    .single();

  if (!pair) return null;

  // Get user names in parallel
  const [userARes, userBRes, tasksRes] = await Promise.all([
    supabase.from("users").select("name").eq("id", pair.user_a).single(),
    supabase.from("users").select("name").eq("id", pair.user_b).single(),
    supabase
      .from("sprint_tasks")
      .select("user_id, completed")
      .eq("sprint_id", sprintId),
  ]);

  const tasks = tasksRes.data || [];
  const userATasks = tasks.filter((t) => t.user_id === pair.user_a);
  const userBTasks = tasks.filter((t) => t.user_id === pair.user_b);

  return {
    sprintId,
    weekStart: sprint.week_start,
    userA: {
      userId: pair.user_a,
      name: userARes.data?.name || "User A",
      score: sprint.score_a ?? 0,
      breakdown: (sprint.score_breakdown_a as SprintContext["userA"]["breakdown"]) || {
        completion: 0,
        difficulty: 0,
        consistency: 0,
        streak: 0,
        total: 0,
      },
      tasksCompleted: userATasks.filter((t) => t.completed).length,
      tasksDue: userATasks.length,
      tpEarned: 0, // Filled by caller if needed
    },
    userB: {
      userId: pair.user_b,
      name: userBRes.data?.name || "User B",
      score: sprint.score_b ?? 0,
      breakdown: (sprint.score_breakdown_b as SprintContext["userB"]["breakdown"]) || {
        completion: 0,
        difficulty: 0,
        consistency: 0,
        streak: 0,
        total: 0,
      },
      tasksCompleted: userBTasks.filter((t) => t.completed).length,
      tasksDue: userBTasks.length,
      tpEarned: 0,
    },
    rpi: sprint.relative_performance_index ?? 0,
    winnerId: sprint.winner_id,
  };
}
