import { Card } from '@/components/ui'
import { useGracePeriod } from '@/hooks/useGracePeriod'

export function GracePeriodBanner({ className = '' }: { className?: string }) {
  const { isActive, daysRemaining, gracePeriod, loading } = useGracePeriod()

  if (loading || !isActive || daysRemaining <= 0) return null

  return (
    <Card className={`!bg-success/10 border border-success/30 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="text-xl">🛡️</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-success">Grace Period Active</p>
          <p className="text-xs text-success/80">
            Your streaks are protected for {daysRemaining} more day{daysRemaining !== 1 ? 's' : ''}.
            {gracePeriod?.reason === 'monthly_free' && ' (monthly free week)'}
          </p>
        </div>
      </div>
    </Card>
  )
}
