import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Sprint = Database['public']['Tables']['sprints']['Row']

export interface UserRelativeSprint extends Sprint {
  my_score: number | null
  partner_score: number | null
  my_breakdown: ScoreBreakdown | null
  partner_breakdown: ScoreBreakdown | null
  i_won: boolean
  is_tie: boolean
}

export interface ScoreBreakdown {
  completion: number
  difficulty: number
  consistency: number
  streak: number
  bonus?: number
  total: number
}

export function useSprint(userId: string | undefined) {
  const [sprint, setSprint] = useState<UserRelativeSprint | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSprint = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    // Get the most recent non-upcoming sprint
    const { data } = await supabase
      .from('sprints')
      .select('*')
      .in('status', ['active', 'scoring', 'completed'])
      .order('week_start', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!data) {
      setSprint(null)
      setLoading(false)
      return
    }

    // Determine user position (a or b) from partner_pairs
    const { data: pair } = await supabase
      .from('partner_pairs')
      .select('user_a, user_b')
      .eq('active', true)
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .limit(1)
      .single()

    const isUserA = pair?.user_a === userId

    setSprint({
      ...data,
      my_score: isUserA ? data.score_a : data.score_b,
      partner_score: isUserA ? data.score_b : data.score_a,
      my_breakdown: (isUserA ? data.score_breakdown_a : data.score_breakdown_b) as ScoreBreakdown | null,
      partner_breakdown: (isUserA ? data.score_breakdown_b : data.score_breakdown_a) as ScoreBreakdown | null,
      i_won: data.winner_id === userId,
      is_tie: data.winner_id === null && data.score_a !== null,
    })
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchSprint()
  }, [fetchSprint])

  // Realtime subscription on sprints table
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('sprint-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sprints' },
        () => {
          fetchSprint()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchSprint])

  return { sprint, loading, refetch: fetchSprint }
}
