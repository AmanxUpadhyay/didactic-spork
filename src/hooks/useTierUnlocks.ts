import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { TierName, Feature } from '@/lib/tierGating'
import { isFeatureUnlocked } from '@/lib/tierGating'

interface TierUnlocksState {
  tier: TierName
  tp: number
  prestige: number
  unlocks: Record<Feature, boolean>
}

export function useTierUnlocks() {
  const { profile } = useAuth()
  const [state, setState] = useState<TierUnlocksState>({
    tier: 'seedling',
    tp: 0,
    prestige: 0,
    unlocks: {} as Record<Feature, boolean>,
  })
  const [loading, setLoading] = useState(true)
  const [tierChanged, setTierChanged] = useState<{ from: TierName; to: TierName } | null>(null)
  const prevTier = useRef<TierName>('seedling')

  const fetchTierUnlocks = useCallback(async () => {
    if (!profile?.id) return

    const { data } = await supabase.rpc('get_tier_unlocks', {
      p_user_id: profile.id,
    })

    if (data) {
      const d = data as unknown as { tier: string; tp: number; prestige: number; unlocks: Record<Feature, boolean> }
      const newTier = d.tier as TierName
      if (prevTier.current !== newTier && prevTier.current !== 'seedling') {
        setTierChanged({ from: prevTier.current, to: newTier })
      }
      prevTier.current = newTier

      setState({
        tier: newTier,
        tp: d.tp,
        prestige: d.prestige,
        unlocks: d.unlocks,
      })
    }
    setLoading(false)
  }, [profile?.id])

  useEffect(() => {
    fetchTierUnlocks()
  }, [fetchTierUnlocks])

  // Subscribe to tier_progress changes
  useEffect(() => {
    if (!profile?.id) return

    const channel = supabase
      .channel('tier-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tier_progress',
          filter: `user_id=eq.${profile.id}`,
        },
        () => {
          fetchTierUnlocks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id, fetchTierUnlocks])

  const isUnlocked = useCallback(
    (feature: Feature) => isFeatureUnlocked(state.tier, feature),
    [state.tier]
  )

  const dismissTierChange = useCallback(() => setTierChanged(null), [])

  const triggerPrestige = useCallback(async () => {
    if (!profile?.id || state.tier !== 'unshakeable') return null

    const { data } = await supabase.rpc('trigger_prestige', {
      p_user_id: profile.id,
    })
    const d = data as unknown as { success?: boolean } | null
    if (d?.success) {
      fetchTierUnlocks()
    }
    return d
  }, [profile?.id, state.tier, fetchTierUnlocks])

  return {
    ...state,
    loading,
    isUnlocked,
    tierChanged,
    dismissTierChange,
    triggerPrestige,
    refresh: fetchTierUnlocks,
  }
}
