import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Task, HabitInput } from '@/types/habits'

export function useHabits(userId: string | undefined) {
  const [habits, setHabits] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHabits = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', { ascending: true })
    if (data) setHabits(data)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  // Realtime subscription for own habits
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('my-habits')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
        () => { fetchHabits() },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, fetchHabits])

  async function archiveHabit(taskId: string) {
    await supabase
      .from('tasks')
      .update({ active: false, archived_at: new Date().toISOString() })
      .eq('id', taskId)
  }

  async function updateHabit(taskId: string, data: Partial<HabitInput>) {
    await supabase
      .from('tasks')
      .update({
        title: data.title,
        task_type: data.task_type,
        recurrence: data.recurrence,
        custom_days: data.custom_days ?? null,
        difficulty: data.difficulty,
        if_trigger: data.if_trigger ?? null,
        then_action: data.then_action ?? null,
      })
      .eq('id', taskId)
  }

  return { habits, loading, archiveHabit, updateHabit, refetch: fetchHabits }
}
