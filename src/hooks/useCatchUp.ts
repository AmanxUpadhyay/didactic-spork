import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useSprint } from '@/hooks/useSprint'

interface CatchUpTier {
  tier: number
  consecutive_losses: number
  eligible_modes: string[]
}

interface CatchUpState {
  comeback_multiplier: number
  head_to_head_active: boolean
  wildcard_habit_id: string | null
  structural_mode: string | null
}

export function useCatchUp() {
  const { profile } = useAuth()
  const { sprint } = useSprint(profile?.id)
  const [tierData, setTierData] = useState<CatchUpTier | null>(null)
  const [stateData, setStateData] = useState<CatchUpState | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCatchUp = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false)
      return
    }

    const { data: tier } = await supabase.rpc('get_catch_up_tier' as any, {
      p_user_id: profile.id,
    })

    if (tier) setTierData(tier as unknown as CatchUpTier)

    if (sprint?.id) {
      const { data: state } = await (supabase
        .from('catch_up_state' as any) as any)
        .select('comeback_multiplier, head_to_head_active, wildcard_habit_id, structural_mode')
        .eq('user_id', profile.id)
        .eq('sprint_id', sprint.id)
        .maybeSingle()

      if (state) setStateData(state as CatchUpState)
    }

    setLoading(false)
  }, [profile?.id, sprint?.id])

  useEffect(() => {
    fetchCatchUp()
  }, [fetchCatchUp])

  return {
    tier: tierData?.tier ?? 0,
    consecutiveLosses: tierData?.consecutive_losses ?? 0,
    eligibleModes: tierData?.eligible_modes ?? [],
    comebackMultiplier: stateData?.comeback_multiplier ?? 1.0,
    headToHeadActive: stateData?.head_to_head_active ?? false,
    wildcardHabit: stateData?.wildcard_habit_id ?? null,
    structuralMode: stateData?.structural_mode ?? null,
    loading,
  }
}
