import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { PunishmentState } from '@/types/punishment'

export function usePunishment(sprintId: string | undefined) {
  const [punishment, setPunishment] = useState<PunishmentState | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPunishment = useCallback(async () => {
    if (!sprintId) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('punishments')
      .select('*')
      .eq('sprint_id', sprintId)
      .maybeSingle()

    if (data) {
      setPunishment({
        id: data.id,
        sprintId: data.sprint_id,
        loserId: data.loser_id,
        winnerId: data.winner_id,
        intensity: data.intensity as PunishmentState['intensity'],
        budgetGbp: Number(data.budget_gbp ?? 60),
        vetoesGranted: data.vetoes_granted,
        vetoesUsed: data.vetoes_used,
        datePlan: data.date_plan as PunishmentState['datePlan'],
        accepted: data.accepted ?? false,
        scheduledDate: data.scheduled_date,
        surpriseElement: data.surprise_element as PunishmentState['surpriseElement'],
        isMutualFailure: data.is_mutual_failure ?? false,
        isBothWin: data.is_both_win ?? false,
        createdAt: data.created_at,
      })
    }
    setLoading(false)
  }, [sprintId])

  useEffect(() => {
    fetchPunishment()
  }, [fetchPunishment])

  const acceptPlan = useCallback(async (optionIndex: number) => {
    if (!punishment) return
    const options = punishment.datePlan?.options || []
    const chosen = options[optionIndex]
    if (!chosen) return

    await supabase
      .from('punishments')
      .update({
        accepted: true,
        date_plan: JSON.parse(JSON.stringify({ ...punishment.datePlan, chosen_index: optionIndex, chosen_option: chosen })),
        updated_at: new Date().toISOString(),
      })
      .eq('id', punishment.id)

    setPunishment((prev) => prev ? { ...prev, accepted: true } : null)
  }, [punishment])

  const scheduleDatePlan = useCallback(async (date: string) => {
    if (!punishment) return

    await supabase
      .from('punishments')
      .update({
        scheduled_date: date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', punishment.id)

    setPunishment((prev) => prev ? { ...prev, scheduledDate: date } : null)
  }, [punishment])

  return {
    punishment,
    loading,
    acceptPlan,
    scheduleDatePlan,
    refresh: fetchPunishment,
  }
}
