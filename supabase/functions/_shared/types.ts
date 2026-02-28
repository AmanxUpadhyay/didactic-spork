// Shared TypeScript interfaces for Kira AI functions

export type KiraFunctionType =
  | "sprint_judge"
  | "date_plan"
  | "daily_notification"
  | "weekly_summary"
  | "mood_response"
  | "task_suggest"
  | "excuse_eval"
  | "date_rate"
  | "rescue_task";

export type PersonalityMode =
  | "cheerful"
  | "sarcastic"
  | "tough_love"
  | "empathetic"
  | "hype_man"
  | "disappointed";

export type ModelTier = "haiku" | "sonnet";

export interface ModelConfig {
  modelId: string;
  maxTokens: number;
}

export const MODEL_IDS: Record<ModelTier, string> = {
  haiku: "eu.anthropic.claude-haiku-4-5-20251001-v1:0",
  sonnet: "eu.anthropic.claude-sonnet-4-20250514-v1:0",
};

export const FUNCTION_MODEL_CONFIG: Record<KiraFunctionType, ModelConfig> = {
  daily_notification: { modelId: MODEL_IDS.haiku, maxTokens: 256 },
  weekly_summary: { modelId: MODEL_IDS.haiku, maxTokens: 512 },
  task_suggest: { modelId: MODEL_IDS.haiku, maxTokens: 1024 },
  mood_response: { modelId: MODEL_IDS.haiku, maxTokens: 512 },
  date_rate: { modelId: MODEL_IDS.haiku, maxTokens: 512 },
  rescue_task: { modelId: MODEL_IDS.haiku, maxTokens: 512 },
  sprint_judge: { modelId: MODEL_IDS.sonnet, maxTokens: 2048 },
  date_plan: { modelId: MODEL_IDS.sonnet, maxTokens: 2048 },
  excuse_eval: { modelId: MODEL_IDS.sonnet, maxTokens: 1024 },
};

// Override mood_response to Sonnet for deep mode
export function getModelConfig(
  functionType: KiraFunctionType,
  deep?: boolean
): ModelConfig {
  if (functionType === "mood_response" && deep) {
    return { modelId: MODEL_IDS.sonnet, maxTokens: 1024 };
  }
  return FUNCTION_MODEL_CONFIG[functionType];
}

export interface UserContext {
  userId: string;
  name: string;
  timezone: string;
  preferences: Record<string, unknown>;
  hardNos: unknown[];
  mildDiscomforts: unknown[];
  aiProfile: {
    personalitySummary: string | null;
    keyPatterns: string | null;
    communicationPreferences: Record<string, unknown> | null;
  } | null;
  recentMood: {
    avgMood7d: number | null;
    trend7d: number | null;
    latestScore: number | null;
    latestJournal: string | null;
  };
  streaks: {
    bestIndividual: number;
    activeCoupleStreak: number;
    recentBreaks: number;
  };
  completions: {
    completionRate7d: number;
    tasksCompleted7d: number;
    tasksDue7d: number;
  };
  weeklySummary: string | null;
}

export interface SprintContext {
  sprintId: string;
  weekStart: string;
  userA: SprintUserData;
  userB: SprintUserData;
  rpi: number;
  winnerId: string | null;
}

export interface SprintUserData {
  userId: string;
  name: string;
  score: number;
  breakdown: {
    completion: number;
    difficulty: number;
    consistency: number;
    streak: number;
    bonus?: number;
    total: number;
  };
  tasksCompleted: number;
  tasksDue: number;
  tpEarned: number;
}

export interface KiraResponse {
  text: string;
  structuredData?: Record<string, unknown>;
  model: string;
  mood: PersonalityMode;
  tokensInput: number;
  tokensOutput: number;
}

export interface DatePlanOption {
  title: string;
  activity: string;
  food: string;
  extras: string[];
  estimatedCost: number;
  rationale: string;
}

export interface TaskSuggestion {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard" | "legendary";
  timeEstimate: string;
  rationale: string;
}

export interface ExcuseVerdict {
  classification: "LEGIT" | "PARTIAL" | "NEEDS_PUSH";
  rationale: string;
  response: string;
}

export interface CronRequestBody {
  function_type: KiraFunctionType;
  sprint_id?: string;
}

export interface InteractiveRequestBody {
  function_type: KiraFunctionType;
  payload?: Record<string, unknown>;
}

export interface DateMemoryState {
  lastCategories: string[];
  lastCuisines: string[];
  lastVenues: string[];
  intensityWavePosition: number;
  consecutiveLowRatings: number;
  totalDatesCompleted: number;
}

export interface RescueTaskResult {
  task: string;
  description: string;
  timeEstimate: string;
}
