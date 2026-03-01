import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useSprint } from '@/hooks/useSprint'

interface FreshStartBonus {
  bonusPoints: number
  reason: string
  appliedAt: string
}

export function useFreshStart() {
  const { profile } = useAuth()
  const { sprint } = useSprint(profile?.id)
  const [bonus, setBonus] = useState<FreshStartBonus | null>(null)

  useEffect(() => {
    if (!profile?.id || !sprint?.id) return

    async function load() {
      const { data } = await supabase
        .from('fresh_start_bonuses')
        .select('*')
        .eq('user_id', profile!.id)
        .eq('sprint_id', sprint!.id)
        .maybeSingle()

      if (data) {
        setBonus({
          bonusPoints: data.bonus_points,
          reason: data.reason,
          appliedAt: data.applied_at,
        })
      }
    }
    load()
  }, [profile?.id, sprint?.id])

  const isMonday = new Date().getDay() === 1

  return { bonus, isMonday, hasBonus: !!bonus }
}
