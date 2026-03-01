import { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useSprintMode } from '@/hooks/useSprintMode'
import { useOptOut } from '@/hooks/useOptOut'

export function ScoreGapCircuitBreaker() {
  const { profile } = useAuth()
  const { switchMode } = useSprintMode()
  const { isOptedOut, toggleOptOut } = useOptOut()
  const [triggered, setTriggered] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [acting, setActing] = useState(false)

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

  if (!triggered || dismissed || isOptedOut('score_gap_warnings')) return null

  const handleCooperative = async () => {
    setActing(true)
    await switchMode('cooperative')
    setDismissed(true)
    setActing(false)
  }

  const handleDismiss = () => {
    setDismissed(true)
  }

  const handleDontShow = () => {
    toggleOptOut('score_gap_warnings')
    setDismissed(true)
  }

  return (
    <Card className="!bg-amber-50 dark:!bg-amber-950/20 border border-amber-200 dark:border-amber-800">
      <div className="flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Score gap detected</p>
          <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">
            The gap has been 30+ points for multiple weeks. Want to try something different?
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Button size="sm" onClick={handleCooperative} disabled={acting}>
              Switch to Cooperative
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              I'm Fine
            </Button>
          </div>
          <button
            className="text-[10px] text-text-tertiary mt-2 hover:underline"
            onClick={handleDontShow}
          >
            Don't show again
          </button>
        </div>
      </div>
    </Card>
  )
}
