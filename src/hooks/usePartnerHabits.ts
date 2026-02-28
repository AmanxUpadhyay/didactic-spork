import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getTodayInTimezone } from '@/lib/dates'
import type { Task, HabitCompletion } from '@/types/habits'

export function usePartnerHabits(partnerId: string | null, partnerTimezone: string) {
  const [habits, setHabits] = useState<Task[]>([])
  const [completions, setCompletions] = useState<HabitCompletion[]>([])
  const [loading, setLoading] = useState(true)

  const today = getTodayInTimezone(partnerTimezone)

  const fetchPartnerData = useCallback(async () => {
    if (!partnerId) {
      setLoading(false)
      return
    }

    const [habitsRes, completionsRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .eq('user_id', partnerId)
        .eq('active', true)
        .order('created_at', { ascending: true }),
      supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', partnerId)
        .eq('completed_date', today),
    ])

    if (habitsRes.data) setHabits(habitsRes.data)
    if (completionsRes.data) setCompletions(completionsRes.data)
    setLoading(false)
  }, [partnerId, today])

  useEffect(() => {
    fetchPartnerData()
  }, [fetchPartnerData])

  // Realtime for partner's tasks and completions
  useEffect(() => {
    if (!partnerId) return
    const channel = supabase
      .channel('partner-activity')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${partnerId}` },
        () => { fetchPartnerData() },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habit_completions', filter: `user_id=eq.${partnerId}` },
        () => { fetchPartnerData() },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [partnerId, fetchPartnerData])

  function isPartnerCompletedToday(taskId: string): boolean {
    return completions.some((c) => c.task_id === taskId)
  }

  return { habits, completions, loading, isPartnerCompletedToday }
}
