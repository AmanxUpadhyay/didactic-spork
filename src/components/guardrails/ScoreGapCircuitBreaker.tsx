import { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function ScoreGapCircuitBreaker() {
  const { profile } = useAuth()
  const [triggered, setTriggered] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!profile?.id) return
    async function check() {
      const { data } = await supabase.rpc('check_score_gap_circuit_breaker', {
        p_user_id: profile!.id,
      })
      setTriggered(!!data)
    }
    check()
  }, [profile?.id])

  if (!triggered || dismissed) return null

  return (
    <Card className="!bg-amber-50 dark:!bg-amber-950/20 border border-amber-200 dark:border-amber-800">
      <div className="flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Score gap detected</p>
          <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">
            One partner has been leading by a big margin. Want to switch to team mode for a week?
            You'll both work toward a shared goal instead.
          </p>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => setDismissed(true)}>Maybe Later</Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
