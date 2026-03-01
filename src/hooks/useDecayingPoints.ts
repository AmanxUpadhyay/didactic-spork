import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useSprint } from '@/hooks/useSprint'

interface PointBank {
  initialPoints: number
  currentPoints: number
  floorPoints: number
  decayLog: Array<{ date: string; amount: number; uncompleted: number }>
}

export function useDecayingPoints() {
  const { profile } = useAuth()
  const { sprint } = useSprint(profile?.id)
  const [bank, setBank] = useState<PointBank | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id || !sprint?.id || sprint.status !== 'active') {
      setLoading(false)
      return
    }

    async function load() {
      const { data } = await supabase
        .from('point_bank_snapshots')
        .select('*')
        .eq('user_id', profile!.id)
        .eq('sprint_id', sprint!.id)
        .maybeSingle()

      if (data) {
        setBank({
          initialPoints: data.initial_points,
          currentPoints: data.current_points,
          floorPoints: data.floor_points,
          decayLog: (data.decay_log || []) as PointBank['decayLog'],
        })
      }
      setLoading(false)
    }
    load()

    // Subscribe to realtime updates
    const channel = supabase
      .channel('point_bank_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'point_bank_snapshots',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          const row = payload.new as any
          setBank({
            initialPoints: row.initial_points,
            currentPoints: row.current_points,
            floorPoints: row.floor_points,
            decayLog: (row.decay_log || []) as PointBank['decayLog'],
          })
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profile?.id, sprint?.id, sprint?.status])

  const healthPercent = bank
    ? Math.round((bank.currentPoints / bank.initialPoints) * 100)
    : 100

  return { bank, loading, healthPercent }
}
