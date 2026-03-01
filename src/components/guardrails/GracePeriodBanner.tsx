import { Card } from '@/components/ui'

interface GracePeriodBannerProps {
  daysRemaining: number
  className?: string
}

export function GracePeriodBanner({ daysRemaining, className = '' }: GracePeriodBannerProps) {
  if (daysRemaining <= 0) return null

  return (
    <Card className={`!bg-sky-50 dark:!bg-sky-950/20 border border-sky-200 dark:border-sky-800 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="text-xl">🛡️</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-sky-700 dark:text-sky-400">Grace Period Active</p>
          <p className="text-xs text-sky-600/80 dark:text-sky-500/80">
            Your streaks are protected for {daysRemaining} more day{daysRemaining !== 1 ? 's' : ''}.
            Take the break you need.
          </p>
        </div>
      </div>
    </Card>
  )
}
