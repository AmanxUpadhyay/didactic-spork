import { useState, useEffect } from 'react'
import { Card } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function SunkCostTimeline({ className = '' }: { className?: string }) {
  const { profile } = useAuth()
  const [totalXP, setTotalXP] = useState(0)
  const [weeksActive, setWeeksActive] = useState(0)
  const [totalHabitsCompleted, setTotalHabitsCompleted] = useState(0)

  useEffect(() => {
    if (!profile?.id) return
    async function load() {
      // Get relationship XP
      const { data: rxp } = await supabase
        .from('relationship_xp')
        .select('total_xp, updated_at')
        .limit(1)
        .maybeSingle()

      if (rxp) {
        setTotalXP(rxp.total_xp ?? 0)
        // Estimate weeks from partner_pairs created_at
        const { data: pair } = await supabase
          .from('partner_pairs')
          .select('paired_at')
          .eq('active', true)
          .limit(1)
          .maybeSingle()
        if (pair) {
          const weeks = Math.max(1, Math.ceil(
            (Date.now() - new Date(pair.paired_at).getTime()) / (7 * 24 * 60 * 60 * 1000)
          ))
          setWeeksActive(weeks)
        }
      }

      // Count total habits completed by both partners (shared growth)
      const { count } = await supabase
        .from('habit_completions')
        .select('id', { count: 'exact', head: true })
        .eq('completed', true)

      setTotalHabitsCompleted(count ?? 0)
    }
    load()
  }, [profile?.id])

  if (totalXP === 0) return null

  // Show only shared growth metrics — NO individual win/loss records
  return (
    <Card className={className}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">💕</span>
        <div className="flex-1">
          <p className="text-xs font-medium text-text-secondary">Growing Together</p>
          <p className="text-lg font-bold font-heading text-primary">{totalXP} XP</p>
          <div className="flex gap-3 mt-1">
            <p className="text-[10px] text-text-secondary/60">
              {weeksActive} week{weeksActive !== 1 ? 's' : ''}
            </p>
            <p className="text-[10px] text-text-secondary/60">
              {totalHabitsCompleted} habits completed together
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
