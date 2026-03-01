import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface MysteryBoxResult {
  triggered: boolean
  reward: { type: string } | null
}

export function useMysteryBox() {
  const { profile } = useAuth()
  const [result, setResult] = useState<MysteryBoxResult | null>(null)
  const [loading, setLoading] = useState(false)

  const rollMysteryBox = useCallback(async (completionId: string) => {
    if (!profile?.id) return null
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('kira-interactive', {
        body: {
          function_type: 'mystery_box_roll',
          payload: { completion_id: completionId },
        },
      })

      if (error) {
        console.error('Mystery box error:', error)
        return null
      }

      const boxResult: MysteryBoxResult = {
        triggered: data?.triggered ?? false,
        reward: data?.reward ?? null,
      }
      setResult(boxResult)
      return boxResult
    } catch (err) {
      console.error('Mystery box error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [profile?.id])

  const clearResult = useCallback(() => setResult(null), [])

  return { result, loading, rollMysteryBox, clearResult }
}
