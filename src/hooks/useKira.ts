import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

type KiraFunctionType = 'task_suggest' | 'excuse_eval' | 'mood_response' | 'date_plan' | 'date_rate' | 'rescue_task'

interface KiraResult {
  success: boolean
  response_id: string | null
  mood: string
  data: Record<string, unknown>
  fallback: boolean
}

/**
 * Hook for invoking kira-interactive Edge Function.
 * Handles task suggestions, excuse eval, mood response, and date planning.
 */
export function useKira() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const invoke = useCallback(
    async (
      functionType: KiraFunctionType,
      payload?: Record<string, unknown>
    ): Promise<KiraResult | null> => {
      setLoading(true)
      setError(null)

      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          'kira-interactive',
          {
            body: { function_type: functionType, payload },
          }
        )

        if (fnError) {
          setError(fnError.message)
          return null
        }

        return data as KiraResult
      } catch (err) {
        setError(String(err))
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const suggestTasks = useCallback(
    () => invoke('task_suggest'),
    [invoke]
  )

  const evaluateExcuse = useCallback(
    (taskId: string, taskTitle: string, excuse: string) =>
      invoke('excuse_eval', { task_id: taskId, task_title: taskTitle, excuse }),
    [invoke]
  )

  const respondToMood = useCallback(
    (moodScore: number, journalText?: string, depth?: 'quick' | 'deep') =>
      invoke('mood_response', { mood_score: moodScore, journal_text: journalText, depth }),
    [invoke]
  )

  const planDate = useCallback(
    (sprintId: string, extra?: Record<string, unknown>) =>
      invoke('date_plan', { sprint_id: sprintId, ...extra }),
    [invoke]
  )

  const rateDate = useCallback(
    (punishmentId: string, rating: number, highlights?: string, improvements?: string) =>
      invoke('date_rate', { punishment_id: punishmentId, rating, highlights, improvements }),
    [invoke]
  )

  const requestRescueTask = useCallback(
    (streakId: string) => invoke('rescue_task', { streak_id: streakId }),
    [invoke]
  )

  return {
    loading,
    error,
    invoke,
    suggestTasks,
    evaluateExcuse,
    respondToMood,
    planDate,
    rateDate,
    requestRescueTask,
  }
}
