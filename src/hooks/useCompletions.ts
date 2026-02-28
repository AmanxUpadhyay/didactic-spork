import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getTodayInTimezone } from '@/lib/dates'
import type { HabitCompletion } from '@/types/habits'

export function useCompletions(userId: string | undefined, timezone: string) {
  const [completions, setCompletions] = useState<HabitCompletion[]>([])
  const [loading, setLoading] = useState(true)

  const today = getTodayInTimezone(timezone)

  const fetchCompletions = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', userId)
      .eq('completed_date', today)
    if (data) setCompletions(data)
    setLoading(false)
  }, [userId, today])

  useEffect(() => {
    fetchCompletions()
  }, [fetchCompletions])

  // Realtime for own completions
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('my-completions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habit_completions', filter: `user_id=eq.${userId}` },
        () => { fetchCompletions() },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, fetchCompletions])

  function isCompletedToday(taskId: string): boolean {
    return completions.some((c) => c.task_id === taskId)
  }

  async function toggleCompletion(taskId: string): Promise<{ completed: boolean; streak?: number }> {
    if (!userId) return { completed: false }

    const existing = completions.find((c) => c.task_id === taskId)

    if (existing) {
      // Undo completion
      await supabase.from('habit_completions').delete().eq('id', existing.id)
      setCompletions((prev) => prev.filter((c) => c.id !== existing.id))
      // Update streak
      await supabase.rpc('update_streak_for_task', { p_task_id: taskId })
      return { completed: false }
    } else {
      // Complete
      const { data } = await supabase
        .from('habit_completions')
        .insert({ user_id: userId, task_id: taskId, completed_date: today })
        .select()
        .single()
      if (data) {
        setCompletions((prev) => [...prev, data])
      }
      // Update streak and get result
      const { data: streakResult } = await supabase.rpc('update_streak_for_task', { p_task_id: taskId })
      const result = streakResult as { success: boolean; current_days?: number } | null
      return { completed: true, streak: result?.current_days }
    }
  }

  return { completions, loading, isCompletedToday, toggleCompletion, refetch: fetchCompletions }
}
