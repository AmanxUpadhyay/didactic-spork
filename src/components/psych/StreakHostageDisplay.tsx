import { Card } from '@/components/ui'

interface StreakHostageDisplayProps {
  streak: number
  atRisk: boolean
  className?: string
}

export function StreakHostageDisplay({ streak, atRisk, className = '' }: StreakHostageDisplayProps) {
  if (streak === 0) return null

  return (
    <Card className={`${atRisk ? '!bg-red-50 dark:!bg-red-950/20 border border-red-200 dark:border-red-800' : ''} ${className}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{atRisk ? '⏳' : '🔥'}</span>
        <div className="flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-bold font-heading ${atRisk ? 'text-red-600 dark:text-red-400' : 'text-primary'}`}>
              {streak}
            </span>
            <span className="text-sm text-text-secondary">day couple streak</span>
          </div>
          {atRisk && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-0.5 animate-pulse">
              At risk! Complete a habit before midnight.
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
