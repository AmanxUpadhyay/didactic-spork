import { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function ContemplDetectionPrompt() {
  const { profile } = useAuth()
  const [triggered, setTriggered] = useState(false)
  const [dismissed, setDismissed] = useState(false)

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

  return (
    <Card className="!bg-blue-50 dark:!bg-blue-950/20 border border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <span className="text-xl">💙</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">How's everything going?</p>
          <p className="text-xs text-blue-700/80 dark:text-blue-400/80 mt-1">
            We noticed your activity dipped this week. That's okay — life happens.
            Want to take a lighter approach or chat about it?
          </p>
          <Button size="sm" className="mt-2" variant="ghost" onClick={() => setDismissed(true)}>
            I'm okay, thanks
          </Button>
        </div>
      </div>
    </Card>
  )
}
