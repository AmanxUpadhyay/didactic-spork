import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Streak } from '@/types/habits'

export function useStreaks(userId: string | undefined) {
  const [streaks, setStreaks] = useState<Streak[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStreaks = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
    if (data) setStreaks(data)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchStreaks()
  }, [fetchStreaks])

  // Realtime subscription for streaks
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('my-streaks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'streaks', filter: `user_id=eq.${userId}` },
        () => { fetchStreaks() },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, fetchStreaks])

  function getStreakForTask(taskId: string): Streak | null {
    return streaks.find((s) => s.task_id === taskId && s.streak_type === 'individual') || null
  }

  function getCoupleStreak(taskId: string): Streak | null {
    return streaks.find((s) => s.task_id === taskId && s.streak_type === 'couple') || null
  }

  const coupleStreaks = streaks.filter((s) => s.streak_type === 'couple' && s.current_days > 0)
  const bestCoupleStreak = coupleStreaks.length > 0
    ? coupleStreaks.reduce((a, b) => (a.current_days > b.current_days ? a : b))
    : null

  return { streaks, loading, getStreakForTask, getCoupleStreak, bestCoupleStreak, refetch: fetchStreaks }
}
