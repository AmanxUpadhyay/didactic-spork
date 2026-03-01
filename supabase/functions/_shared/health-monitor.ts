// Shared health monitoring utilities for Phase 6 guardrails
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { KiraFunctionType, PersonalityMode } from "./types.ts";

/**
 * Record an interaction in the interaction_ledger.
 */
export async function recordInteraction(
  supabase: SupabaseClient,
  userId: string,
  type: string,
  valence: "positive" | "negative" | "neutral",
  source: "notification" | "in_app" | "kira_message" | "system",
  metadata?: Record<string, unknown>
): Promise<void> {
  await supabase.from("interaction_ledger").insert({
    user_id: userId,
    interaction_type: type,
    valence,
    source,
    metadata: metadata ?? {},
  });
}

/**
 * Check if a negative interaction should be suppressed based on the 5:1 ratio.
 * Returns true if ratio < 5.0 (meaning we should suppress negatives).
 */
export async function shouldSuppressNegative(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await supabase.rpc("get_interaction_ratio", {
    p_user_id: userId,
  });

  if (!data) return false;
  // Cold start = healthy, don't suppress
  if (data.cold_start) return false;
  return !data.healthy;
}

/**
 * Inject a positive Kira message when ratio is unhealthy.
 * Generates a brief celebration/encouragement and queues it.
 */
export async function injectPositiveKiraMessage(
  supabase: SupabaseClient,
  userId: string,
  context: {
    recentAchievement?: string;
    streakDays?: number;
    completionRate?: number;
  }
): Promise<void> {
  // Build a simple positive message without AI (fast path)
  const messages = [
    context.recentAchievement
      ? `Nice work on ${context.recentAchievement}! Every bit counts.`
      : null,
    context.streakDays && context.streakDays > 3
      ? `${context.streakDays}-day streak going strong. Keep it rolling!`
      : null,
    context.completionRate && context.completionRate > 0.6
      ? `You're at ${Math.round(context.completionRate * 100)}% this week. Solid effort.`
      : null,
    "You and your partner are building something real. That matters.",
    "Quick reminder: showing up consistently > being perfect.",
  ].filter(Boolean);

  const message = messages[Math.floor(Math.random() * messages.length)]!;

  // Queue as a kira_message notification
  await supabase.from("notification_queue").insert({
    user_id: userId,
    category: "celebration",
    title: "Kira says...",
    body: message,
    urgency: "low",
    data: { source: "positive_injection" },
  });

  // Record as positive interaction
  await recordInteraction(supabase, userId, "positive_injection", "positive", "kira_message", {
    message,
  });
}

/**
 * Check if the pair is in training wheels mode (< 2 completed sprints).
 */
export async function isTrainingWheels(
  supabase: SupabaseClient,
  _userId: string
): Promise<boolean> {
  const { count } = await supabase
    .from("sprints")
    .select("id", { count: "exact", head: true })
    .eq("status", "completed");

  return (count ?? 0) < 2;
}

/**
 * Get catch-up state for a user in a sprint.
 */
export async function getCatchUpState(
  supabase: SupabaseClient,
  userId: string,
  sprintId: string
): Promise<{
  tier: number;
  consecutiveLosses: number;
  comebackMultiplier: number;
  headToHeadActive: boolean;
  wildcardHabit: string | null;
  structuralMode: string | null;
}> {
  const { data: tierData } = await supabase.rpc("get_catch_up_tier", {
    p_user_id: userId,
  });

  const { data: stateData } = await supabase
    .from("catch_up_state")
    .select("*")
    .eq("user_id", userId)
    .eq("sprint_id", sprintId)
    .maybeSingle();

  return {
    tier: tierData?.tier ?? 0,
    consecutiveLosses: tierData?.consecutive_losses ?? 0,
    comebackMultiplier: stateData?.comeback_multiplier ?? 1.0,
    headToHeadActive: stateData?.head_to_head_active ?? false,
    wildcardHabit: stateData?.wildcard_habit_id ?? null,
    structuralMode: stateData?.structural_mode ?? null,
  };
}

/**
 * Check if user has an active grace period.
 */
export async function checkGracePeriod(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  active: boolean;
  reason?: string;
  daysRemaining?: number;
} | null> {
  const { data } = await supabase.rpc("check_active_grace_period", {
    p_user_id: userId,
  });

  if (!data) return null;
  return {
    active: data.active,
    reason: data.reason,
    daysRemaining: data.days_remaining,
  };
}
