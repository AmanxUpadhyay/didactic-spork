import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ScoreBreakdown } from './useSprint'

interface LiveScoreUser {
  user_id: string
  breakdown: ScoreBreakdown
  total: number
  tasks_due: number
  tasks_completed: number
}

export function useLiveScores(
  userId: string | undefined,
  sprintId: string | undefined,
) {
  const [myBreakdown, setMyBreakdown] = useState<LiveScoreUser | null>(null)
  const [partnerBreakdown, setPartnerBreakdown] = useState<LiveScoreUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchScores = useCallback(async () => {
    if (!userId || !sprintId) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase.rpc('calculate_live_scores', {
      p_sprint_id: sprintId,
    })

    if (error || !data) {
      setLoading(false)
      return
    }

    const scores = data as unknown as { user_a: LiveScoreUser; user_b: LiveScoreUser }

    // Determine which user we are
    if (scores.user_a?.user_id === userId) {
      setMyBreakdown(scores.user_a)
      setPartnerBreakdown(scores.user_b)
    } else {
      setMyBreakdown(scores.user_b)
      setPartnerBreakdown(scores.user_a)
    }
    setLoading(false)
  }, [userId, sprintId])

  useEffect(() => {
    fetchScores()
  }, [fetchScores])

  // Auto-refresh when either user completes a habit
  useEffect(() => {
    if (!userId || !sprintId) return

    const channel = supabase
      .channel('live-scores')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habit_completions' },
        () => {
          fetchScores()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, sprintId, fetchScores])

  return { myBreakdown, partnerBreakdown, loading, refetch: fetchScores }
}
