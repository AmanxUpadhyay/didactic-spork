import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

/**
 * Psychological engine calculations for variable rewards,
 * point bank decay, and fresh start bonuses.
 */

// --- Mystery Box Roll ---

interface MysteryBoxResult {
  triggered: boolean;
  reward: { type: string; probability: number } | null;
}

export async function rollMysteryBox(
  userId: string,
  completionId: string,
  supabase: SupabaseClient
): Promise<MysteryBoxResult> {
  // Base probability 20%
  let probability = 0.2;

  // Query active sprint to check if user is trailing
  const { data: activeSprint } = await supabase
    .from("sprints")
    .select("id, user_a, user_b, score_a, score_b")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (activeSprint) {
    const isUserA = activeSprint.user_a === userId;
    const userScore = isUserA
      ? (activeSprint.score_a ?? 0)
      : (activeSprint.score_b ?? 0);
    const partnerScore = isUserA
      ? (activeSprint.score_b ?? 0)
      : (activeSprint.score_a ?? 0);

    // If user is trailing (lower score), increase probability by 10%
    if (userScore < partnerScore) {
      probability = 0.3;
    }
  }

  // Roll
  const roll = Math.random();
  const triggered = roll < probability;

  if (!triggered) {
    // Record non-triggered roll
    await supabase.from("variable_rewards").insert({
      user_id: userId,
      completion_id: completionId,
      triggered: false,
      reward_type: null,
      probability,
    });

    return { triggered: false, reward: null };
  }

  // Pick reward from weighted distribution
  const rewardRoll = Math.random();
  let rewardType: string;

  if (rewardRoll < 0.4) {
    rewardType = "2x_points";
  } else if (rewardRoll < 0.6) {
    rewardType = "3x_points";
  } else if (rewardRoll < 0.85) {
    rewardType = "streak_freeze";
  } else {
    rewardType = "spy_peek";
  }

  // Insert triggered reward
  await supabase.from("variable_rewards").insert({
    user_id: userId,
    completion_id: completionId,
    triggered: true,
    reward_type: rewardType,
    probability,
  });

  return {
    triggered: true,
    reward: { type: rewardType, probability },
  };
}

// --- Point Bank Decay Calculator ---

interface PointBankDecayResult {
  decayed: number;
  current: number;
  floor: number;
  uncompleted: number;
}

export async function calculatePointBankDecay(
  userId: string,
  sprintId: string,
  supabase: SupabaseClient
): Promise<PointBankDecayResult> {
  // Query point_bank_snapshots for user + sprint
  const { data: snapshot } = await supabase
    .from("point_bank_snapshots")
    .select("initial_points, current_points")
    .eq("user_id", userId)
    .eq("sprint_id", sprintId)
    .maybeSingle();

  if (!snapshot) {
    return { decayed: 0, current: 200, floor: 100, uncompleted: 0 };
  }

  // Calculate uncompleted habits today
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setUTCHours(23, 59, 59, 999);

  // Get user's sprint tasks
  const { data: sprintTasks } = await supabase
    .from("sprint_tasks")
    .select("id, task_id")
    .eq("sprint_id", sprintId)
    .eq("user_id", userId);

  const totalTasks = sprintTasks?.length ?? 0;

  // Get today's completions
  const { data: completions } = await supabase
    .from("habit_completions")
    .select("task_id")
    .eq("user_id", userId)
    .gte("completed_at", todayStart.toISOString())
    .lte("completed_at", todayEnd.toISOString());

  const completedTaskIds = new Set(
    (completions || []).map((c) => c.task_id)
  );
  const uncompleted = totalTasks - completedTaskIds.size;

  // Deduct 5 points per uncompleted habit
  const decayAmount = Math.max(0, uncompleted) * 5;

  // Floor = 50% of initial_points
  const floor = Math.floor(snapshot.initial_points * 0.5);

  // Current = max(current_points - decay, floor)
  const current = Math.max(snapshot.current_points - decayAmount, floor);

  return {
    decayed: decayAmount,
    current,
    floor,
    uncompleted: Math.max(0, uncompleted),
  };
}

// --- Fresh Start Bonus Calculator ---

interface FreshStartBonusResult {
  bonus: number;
  reason: string;
}

export async function calculateFreshStartBonus(
  userId: string,
  prevSprintId: string,
  supabase: SupabaseClient
): Promise<FreshStartBonusResult> {
  // Query sprint_scores for user in prev sprint
  const { data: prevScore } = await supabase
    .from("sprint_scores")
    .select("final_score")
    .eq("user_id", userId)
    .eq("sprint_id", prevSprintId)
    .maybeSingle();

  if (!prevScore) {
    return { bonus: 10, reason: "Welcome bonus" };
  }

  const score = prevScore.final_score ?? 0;

  if (score >= 85) {
    return { bonus: 40, reason: "Incredible last week" };
  }
  if (score >= 70) {
    return { bonus: 30, reason: "Strong performance" };
  }
  if (score >= 50) {
    return { bonus: 20, reason: "Good effort" };
  }

  return { bonus: 10, reason: "Fresh week energy" };
}
