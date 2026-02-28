import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useKira } from '@/hooks/useKira'
import type { DateOption } from '@/types/punishment'

interface UseVetoSystemProps {
  punishmentId: string | undefined
  sprintId: string | undefined
  vetoesGranted: number
  vetoesUsed: number
  options: DateOption[]
}

export function useVetoSystem({
  punishmentId,
  sprintId,
  vetoesGranted,
  vetoesUsed,
  options,
}: UseVetoSystemProps) {
  const { profile } = useAuth()
  const { loading: regenerating, invoke } = useKira()
  const [localVetoesUsed, setLocalVetoesUsed] = useState(vetoesUsed)
  const vetoesRemaining = vetoesGranted - localVetoesUsed

  const vetoOption = useCallback(async (optionIndex: number) => {
    if (!punishmentId || !sprintId || !profile?.id) return null
    if (vetoesRemaining <= 0) return null

    const vetoedOption = options[optionIndex]
    if (!vetoedOption) return null

    // Record veto
    await supabase.from('veto_records').insert({
      punishment_id: punishmentId,
      user_id: profile.id,
      vetoed_option: JSON.parse(JSON.stringify(vetoedOption)),
      veto_number: localVetoesUsed + 1,
    })

    // Update vetoes_used on punishment
    const newVetoesUsed = localVetoesUsed + 1
    await supabase
      .from('punishments')
      .update({ vetoes_used: newVetoesUsed, updated_at: new Date().toISOString() })
      .eq('id', punishmentId)

    setLocalVetoesUsed(newVetoesUsed)

    // Request regeneration of the vetoed option
    const keepOptions = options.filter((_, i) => i !== optionIndex)
    const result = await invoke('date_plan', {
      sprint_id: sprintId,
      veto_regenerate: true,
      vetoed_indices: [optionIndex],
      existing_options: keepOptions,
    })

    return result
  }, [punishmentId, sprintId, profile?.id, vetoesRemaining, options, localVetoesUsed, invoke])

  return {
    vetoesRemaining,
    vetoesUsed: localVetoesUsed,
    vetoOption,
    regenerating,
  }
}
