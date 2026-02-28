import type { Database } from './database'

export type DifficultyLevel = Database['public']['Enums']['difficulty_level']
export type RecurrencePattern = Database['public']['Enums']['recurrence_pattern']
export type TaskType = Database['public']['Enums']['task_type']

export type Task = Database['public']['Tables']['tasks']['Row']
export type HabitCompletion = Database['public']['Tables']['habit_completions']['Row']
export type Streak = Database['public']['Tables']['streaks']['Row']

export interface HabitInput {
  title: string
  task_type: TaskType
  recurrence: RecurrencePattern
  custom_days?: number[]
  difficulty: DifficultyLevel
  if_trigger?: string
  then_action?: string
}

export interface HabitWithStatus extends Task {
  completedToday: boolean
  streak: Streak | null
  isDueToday: boolean
}
