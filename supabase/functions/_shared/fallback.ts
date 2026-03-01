import type { KiraFunctionType } from "./types.ts";

/**
 * Pre-written fallback responses per function type.
 * Used when Bedrock is unavailable after retries.
 */
const FALLBACK_RESPONSES: Record<KiraFunctionType, string> = {
  sprint_judge: JSON.stringify({
    narrative:
      "The sprint results are in! I had some trouble putting my thoughts together this time, but the scores speak for themselves. Check the breakdown above — and gear up for next week!",
    headline: "Results are in!",
  }),

  date_plan: JSON.stringify({
    options: [
      {
        title: "Cozy Evening Out",
        activity: "Explore a local cafe or restaurant you haven't tried",
        food: "Chef's choice at a local spot",
        extras: ["Post-dinner walk"],
        estimatedCost: 40,
        rationale: "Simple and sweet — sometimes the classics hit hardest.",
      },
    ],
  }),

  daily_notification: JSON.stringify({
    title: "New day, new chance",
    body: "Your habits are waiting. Let's make today count!",
  }),

  weekly_summary: JSON.stringify({
    summary:
      "Another week in the books! Check your sprint scores for the full picture. Keep building those streaks and showing up every day.",
  }),

  mood_response: JSON.stringify({
    response:
      "Thanks for checking in. I appreciate you sharing — keep tracking how you feel, it helps paint the bigger picture.",
    followUp: null,
  }),

  task_suggest: JSON.stringify({
    suggestions: [
      {
        title: "10-minute morning stretch",
        description: "Start your day with gentle stretching to wake up your body",
        difficulty: "easy",
        timeEstimate: "10 mins",
        rationale: "Low barrier, high consistency potential.",
      },
      {
        title: "Read for 15 minutes",
        description: "Any book, any genre — just 15 focused minutes",
        difficulty: "easy",
        timeEstimate: "15 mins",
        rationale: "Builds a reading habit without pressure.",
      },
      {
        title: "Cook one meal from scratch",
        description: "Pick a recipe and make it yourself — no takeout today",
        difficulty: "medium",
        timeEstimate: "45 mins",
        rationale: "Practical skill that compounds over time.",
      },
    ],
  }),

  excuse_eval: JSON.stringify({
    classification: "PARTIAL",
    rationale:
      "I couldn't fully evaluate this one, but here's my take: life happens, and sometimes things get in the way. The important thing is getting back on track.",
    response:
      "I'll give you the benefit of the doubt this time. But let's make sure tomorrow is different, yeah?",
  }),

  date_rate: JSON.stringify({
    response:
      "Thanks for rating the date! Your feedback helps me plan better ones in the future.",
    quality_note: "Noted for next time.",
  }),

  rescue_task: JSON.stringify({
    task: "Write a short appreciation note",
    description:
      "Write a quick note to your partner about something they did this week that you appreciated. Leave it somewhere they'll find it.",
    timeEstimate: "10 mins",
  }),

  streak_warning: JSON.stringify({
    title: "Your streak needs you!",
    body: "Don't let your progress slip — check in and complete a habit today.",
  }),

  schedule_daily: JSON.stringify({
    title: "Good morning!",
    body: "Your habits are waiting. Make today count!",
  }),

  deadline_escalation: JSON.stringify({
    title: "Task deadline approaching",
    body: "You have a task due soon. Don't let it slip!",
  }),

  point_bank_decay: JSON.stringify({
    title: "Points are decaying!",
    body: "Complete your habits to protect your point bank.",
    decayed: 0,
  }),

  fresh_start_calc: JSON.stringify({
    title: "Fresh start bonus!",
    body: "New week, new energy. You earned a head start!",
    bonus: 10,
    reason: "Starting fresh",
  }),

  mystery_box_roll: JSON.stringify({
    triggered: false,
    reward: null,
  }),
};

/**
 * Get a fallback response for when AI is unavailable.
 */
export function getFallbackResponse(functionType: KiraFunctionType): string {
  return FALLBACK_RESPONSES[functionType];
}

/**
 * Call Bedrock with retry logic (3 attempts, exponential backoff).
 * Returns the response text or falls back to pre-written content.
 */
export async function callWithRetry(
  fn: () => Promise<{ text: string; tokensInput: number; tokensOutput: number }>,
  functionType: KiraFunctionType,
  maxRetries = 3
): Promise<{
  text: string;
  tokensInput: number;
  tokensOutput: number;
  isFallback: boolean;
}> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fn();
      return { ...result, isFallback: false };
    } catch (err) {
      lastError = err as Error;
      const status = (err as { status?: number }).status;

      // Only retry on 429 (rate limit) or 5xx (server error)
      if (status && status !== 429 && status < 500) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  console.error(
    `Bedrock call failed after ${maxRetries} attempts:`,
    lastError?.message
  );

  return {
    text: getFallbackResponse(functionType),
    tokensInput: 0,
    tokensOutput: 0,
    isFallback: true,
  };
}
