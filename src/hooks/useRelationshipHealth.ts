import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface HealthSignal {
  id: string
  pair_id: string
  signal_type: string
  affected_user_id: string | null
  severity: number
  metadata: Record<string, unknown>
  resolved: boolean
  intervention_type: string | null
  created_at: string
}

export function useRelationshipHealth() {
  const { profile } = useAuth()
  const [signals, setSignals] = useState<HealthSignal[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSignals = useCallback(async () => {
    if (!profile?.id) return

    const { data } = await (supabase
      .from('relationship_health_signals' as any) as any)
      .select('*')
      .eq('resolved', false)
      .order('created_at', { ascending: false })

    if (data) setSignals(data as HealthSignal[])
    setLoading(false)
  }, [profile?.id])

  useEffect(() => {
    fetchSignals()
  }, [fetchSignals])

  // Realtime subscription
  useEffect(() => {
    if (!profile?.id) return

    const channel = supabase
      .channel('health-signals')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'relationship_health_signals' },
        () => fetchSignals(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id, fetchSignals])

  const activeCount = signals.length
  const hasWarning = signals.some((s) => s.severity >= 1)
  const hasCritical = signals.some((s) => s.severity >= 3)

  return { signals, activeCount, hasWarning, hasCritical, loading, refetch: fetchSignals }
}
