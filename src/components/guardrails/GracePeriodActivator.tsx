import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import { useGracePeriod } from '@/hooks/useGracePeriod'

export function GracePeriodActivator() {
  const { isActive, daysRemaining, activateMonthlyFree, loading } = useGracePeriod()
  const [activating, setActivating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleActivate = async () => {
    setActivating(true)
    setError(null)
    const result = await activateMonthlyFree()
    if (!result.success) {
      setError(result.error === 'already_used_this_month'
        ? 'Already used this month — resets next month.'
        : result.error || 'Something went wrong')
    }
    setActivating(false)
  }

  if (loading) return null

  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="text-xl">🛡️</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">Grace Week</p>
          {isActive ? (
            <p className="text-xs text-sky-600 dark:text-sky-400 mt-1">
              Active — {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining. Streaks & TP protected.
            </p>
          ) : (
            <>
              <p className="text-xs text-text-secondary mt-1">
                1 free week per month. Streaks stay safe, no TP loss, notifications paused.
              </p>
              {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
              )}
              <Button
                size="sm"
                className="mt-2"
                onClick={handleActivate}
                disabled={activating}
              >
                {activating ? 'Activating...' : 'Activate Grace Week'}
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
