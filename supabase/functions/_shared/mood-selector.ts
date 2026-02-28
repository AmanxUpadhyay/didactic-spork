import type { PersonalityMode } from "./types.ts";

interface MoodInputs {
  completionRate7d: number; // 0-1
  streakActive: boolean;
  recentStreakBreak: boolean;
  avgMoodScore: number | null; // 1-5
  hourOfDay: number; // 0-23
  dayOfWeek: number; // 0=Sun, 6=Sat
}

interface MoodWeights {
  cheerful: number;
  sarcastic: number;
  tough_love: number;
  empathetic: number;
  hype_man: number;
  disappointed: number;
}

/**
 * Deterministic mood selection algorithm.
 * Runs BEFORE Claude call — picks one of 6 personality modes.
 *
 * Weighted inputs:
 * - Task completion rate, 7-day (30%)
 * - Streak status (25%)
 * - Recent mood score (20%)
 * - Time of day (15%)
 * - Day of week (10%)
 */
export function selectMood(inputs: MoodInputs): PersonalityMode {
  const weights: MoodWeights = {
    cheerful: 0,
    sarcastic: 0,
    tough_love: 0,
    empathetic: 0,
    hype_man: 0,
    disappointed: 0,
  };

  // --- Completion rate (30% weight) ---
  const cr = inputs.completionRate7d;
  if (cr >= 0.8) {
    weights.hype_man += 30;
    weights.cheerful += 20;
  } else if (cr >= 0.6) {
    weights.cheerful += 25;
    weights.sarcastic += 10;
  } else if (cr >= 0.4) {
    weights.tough_love += 20;
    weights.sarcastic += 15;
  } else {
    weights.disappointed += 25;
    weights.tough_love += 15;
  }

  // --- Streak status (25% weight) ---
  if (inputs.streakActive && !inputs.recentStreakBreak) {
    weights.hype_man += 20;
    weights.cheerful += 10;
  } else if (inputs.recentStreakBreak) {
    weights.empathetic += 15;
    weights.tough_love += 10;
    weights.disappointed += 5;
  } else {
    weights.sarcastic += 10;
    weights.cheerful += 5;
  }

  // --- Mood score (20% weight) ---
  const mood = inputs.avgMoodScore;
  if (mood !== null) {
    if (mood >= 4) {
      weights.hype_man += 15;
      weights.cheerful += 10;
    } else if (mood >= 3) {
      weights.cheerful += 10;
      weights.sarcastic += 5;
    } else if (mood >= 2) {
      weights.empathetic += 15;
      weights.tough_love += 5;
    } else {
      weights.empathetic += 20;
    }
  } else {
    // No mood data — default cheerful
    weights.cheerful += 10;
  }

  // --- Time of day (15% weight) ---
  const hour = inputs.hourOfDay;
  if (hour >= 6 && hour < 10) {
    // Morning: energetic
    weights.cheerful += 10;
    weights.hype_man += 5;
  } else if (hour >= 10 && hour < 17) {
    // Midday: balanced
    weights.sarcastic += 5;
    weights.tough_love += 5;
  } else if (hour >= 17 && hour < 21) {
    // Evening: reflective
    weights.empathetic += 8;
    weights.cheerful += 5;
  } else {
    // Night: gentle
    weights.empathetic += 10;
    weights.cheerful += 5;
  }

  // --- Day of week (10% weight) ---
  if (inputs.dayOfWeek === 1) {
    // Monday: motivational
    weights.hype_man += 8;
    weights.tough_love += 5;
  } else if (inputs.dayOfWeek === 5) {
    // Friday: celebratory
    weights.cheerful += 8;
    weights.hype_man += 5;
  } else if (inputs.dayOfWeek === 0) {
    // Sunday: sprint day — competitive
    weights.sarcastic += 5;
    weights.tough_love += 5;
    weights.hype_man += 3;
  } else {
    weights.cheerful += 5;
  }

  // Pick mode with highest weight
  const modes = Object.entries(weights) as [PersonalityMode, number][];
  modes.sort((a, b) => b[1] - a[1]);

  return modes[0][0];
}
