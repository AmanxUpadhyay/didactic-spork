import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSprint } from '@/hooks/useSprint'
import { useKira } from '@/hooks/useKira'

type SprintMode = 'competitive' | 'cooperative' | 'swap'

export function useSprintMode() {
  const { profile } = useAuth()
  const { sprint: activeSprint } = useSprint(profile?.id)
  const { invoke } = useKira()
  const [mode, setMode] = useState<SprintMode>('competitive')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // sprint_mode column added in migration 018; cast needed until types are regenerated
    const sprintMode = (activeSprint as Record<string, unknown> | null)?.sprint_mode as SprintMode | undefined
    if (sprintMode) {
      setMode(sprintMode)
    }
    setLoading(false)
  }, [activeSprint])

  const switchMode = useCallback(
    async (newMode: SprintMode): Promise<{ success: boolean; message?: string }> => {
      if (!profile?.id) return { success: false }

      const result = await invoke('switch_sprint_mode', { mode: newMode })

      if (result?.success) {
        setMode(newMode)
        return {
          success: true,
          message: result.data?.kira_message as string | undefined,
        }
      }

      return { success: false }
    },
    [profile?.id, invoke],
  )

  return { mode, switchMode, loading }
}
