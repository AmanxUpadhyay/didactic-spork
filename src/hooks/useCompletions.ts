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

  const MILESTONES = [3, 7, 14, 21, 30, 60, 90]

  async function toggleCompletion(taskId: string): Promise<{
    completed: boolean
    streak?: number
    milestone?: number | null
  }> {
    if (!userId) return { completed: false }

    const existing = completions.find((c) => c.task_id === taskId)

    if (existing) {
      // Optimistically remove before server call
      setCompletions((prev) => prev.filter((c) => c.id !== existing.id))
      const { error } = await supabase.from('habit_completions').delete().eq('id', existing.id)
      if (error) {
        // Rollback
        setCompletions((prev) => [...prev, existing])
        return { completed: true }
      }
      await supabase.rpc('update_streak_for_task', { p_task_id: taskId })
      return { completed: false }
    } else {
      // Optimistically add temp entry — UI responds instantly
      const now = new Date().toISOString()
      const optimistic: HabitCompletion = {
        id: `optimistic-${taskId}-${Date.now()}`,
        user_id: userId,
        task_id: taskId,
        completed_date: today,
        completed_at: now,
        created_at: now,
        notes: null,
      }
      setCompletions((prev) => [...prev, optimistic])

      const { data, error } = await supabase
        .from('habit_completions')
        .insert({ user_id: userId, task_id: taskId, completed_date: today, completed_at: now })
        .select()
        .single()

      if (error) {
        // Rollback
        setCompletions((prev) => prev.filter((c) => c.id !== optimistic.id))
        return { completed: false }
      }

      if (data) {
        // Replace optimistic entry with real server row
        setCompletions((prev) => prev.map((c) => (c.id === optimistic.id ? data : c)))
      }

      // Update streak and get result (background — UI already updated)
      const { data: streakResult } = await supabase.rpc('update_streak_for_task', { p_task_id: taskId })
      const result = streakResult as { success: boolean; current_days?: number } | null
      const days = result?.current_days ?? 0
      const milestone = MILESTONES.includes(days) ? days : null
      return { completed: true, streak: days, milestone }
    }
  }

  return { completions, loading, isCompletedToday, toggleCompletion, refetch: fetchCompletions }
}
