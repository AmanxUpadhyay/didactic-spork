import { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useGracePeriod } from '@/hooks/useGracePeriod'
import { useKira } from '@/hooks/useKira'

export function ContemplDetectionPrompt() {
  const { profile } = useAuth()
  const { activateMonthlyFree } = useGracePeriod()
  const { invoke } = useKira()
  const [triggered, setTriggered] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [acting, setActing] = useState(false)

  useEffect(() => {
    if (!profile?.id) return
    async function check() {
      const { data } = await supabase.rpc('check_engagement_dropoff', {
        p_user_id: profile!.id,
      })
      setTriggered(!!data)
    }
    check()
  }, [profile?.id])

  if (!triggered || dismissed) return null

  const handleGrace = async () => {
    setActing(true)
    await activateMonthlyFree()
    setDismissed(true)
    setActing(false)
  }

  const handleChat = async () => {
    setActing(true)
    await invoke('health_check_response', {
      action: 'fine',
      signal_type: 'disengagement',
      context: 'User chose to chat with Kira about engagement dip',
    })
    setDismissed(true)
    setActing(false)
  }

  return (
    <Card className="!bg-blue-50 dark:!bg-blue-950/20 border border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <span className="text-xl">💙</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">How's everything going?</p>
          <p className="text-xs text-blue-700/80 dark:text-blue-400/80 mt-1">
            We noticed your activity dipped this week. That's okay — life happens.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Button size="sm" onClick={handleGrace} disabled={acting}>
              Take a Grace Week
            </Button>
            <Button size="sm" variant="ghost" onClick={handleChat} disabled={acting}>
              Chat with Kira
            </Button>
            <Button size="sm" variant="ghost" className="text-text-secondary" onClick={() => setDismissed(true)}>
              I'm okay, thanks
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
