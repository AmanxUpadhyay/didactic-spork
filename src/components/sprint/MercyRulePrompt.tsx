import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import { useSprintMode } from '@/hooks/useSprintMode'
import { useGracePeriod } from '@/hooks/useGracePeriod'

interface MercyRulePromptProps {
  consecutiveLosses?: number
  onDismiss?: () => void
  className?: string
}

export function MercyRulePrompt({ consecutiveLosses = 0, onDismiss, className = '' }: MercyRulePromptProps) {
  const { switchMode } = useSprintMode()
  const { activateMonthlyFree } = useGracePeriod()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleFreshStart = async () => {
    setLoading(true)
    await activateMonthlyFree()
    setMessage("Grace week activated — fresh start incoming!")
    setLoading(false)
  }

  const handleCooperative = async () => {
    setLoading(true)
    const result = await switchMode('cooperative')
    setMessage(result.message || "Switched to cooperative mode.")
    setLoading(false)
  }

  return (
    <Card className={`!bg-purple-50 dark:!bg-purple-950/20 border border-purple-200 dark:border-purple-800 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">💜</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
            {consecutiveLosses} weeks in a row — want to shake things up?
          </p>

          {message ? (
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">{message}</p>
          ) : (
            <div className="space-y-2 mt-3">
              <Button size="sm" className="w-full" onClick={handleFreshStart} disabled={loading}>
                Fresh Start Week
              </Button>
              <Button size="sm" variant="ghost" className="w-full" onClick={handleCooperative} disabled={loading}>
                Switch to Cooperative
              </Button>
              <Button size="sm" variant="ghost" className="w-full text-text-secondary" onClick={onDismiss} disabled={loading}>
                Keep Going
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
