import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface InteractionRatio {
  positive: number
  negative: number
  ratio: number
  healthy: boolean
  surplus_needed: number
  cold_start: boolean
}

export function useInteractionRatio() {
  const { profile } = useAuth()
  const [data, setData] = useState<InteractionRatio | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchRatio = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false)
      return
    }

    const { data: result } = await supabase.rpc('get_interaction_ratio' as any, {
      p_user_id: profile.id,
    })

    if (result) setData(result as unknown as InteractionRatio)
    setLoading(false)
  }, [profile?.id])

  useEffect(() => {
    fetchRatio()
  }, [fetchRatio])

  return {
    positive: data?.positive ?? 0,
    negative: data?.negative ?? 0,
    ratio: data?.ratio ?? 5.0,
    healthy: data?.healthy ?? true,
    surplusNeeded: data?.surplus_needed ?? 0,
    coldStart: data?.cold_start ?? true,
    loading,
    refetch: fetchRatio,
  }
}
