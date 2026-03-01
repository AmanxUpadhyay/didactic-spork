import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface GracePeriod {
  active: boolean
  reason: string
  starts_at: string
  ends_at: string
  days_remaining: number
}

export function useGracePeriod() {
  const { profile } = useAuth()
  const [gracePeriod, setGracePeriod] = useState<GracePeriod | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchGrace = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false)
      return
    }

    const { data } = await supabase.rpc('check_active_grace_period' as any, {
      p_user_id: profile.id,
    })

    setGracePeriod(data as unknown as GracePeriod | null)
    setLoading(false)
  }, [profile?.id])

  useEffect(() => {
    fetchGrace()
  }, [fetchGrace])

  const activateMonthlyFree = useCallback(async (): Promise<{
    success: boolean
    error?: string
  }> => {
    if (!profile?.id) return { success: false, error: 'Not authenticated' }

    const { data, error } = await supabase.rpc('activate_monthly_free_grace' as any, {
      p_user_id: profile.id,
    })

    if (error) return { success: false, error: error.message }
    const result = data as any
    if (result && !result.success) return { success: false, error: result.reason }

    await fetchGrace()
    return { success: true }
  }, [profile?.id, fetchGrace])

  const isActive = gracePeriod?.active ?? false
  const daysRemaining = gracePeriod?.days_remaining ?? 0

  return { gracePeriod, isActive, daysRemaining, activateMonthlyFree, loading, refetch: fetchGrace }
}
