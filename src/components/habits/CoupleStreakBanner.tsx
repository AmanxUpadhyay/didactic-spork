import { Card } from '@/components/ui'
import type { Streak } from '@/types/habits'

interface CoupleStreakBannerProps {
  streak: Streak
  className?: string
}

export function CoupleStreakBanner({ streak, className }: CoupleStreakBannerProps) {
  return (
    <Card className={className}>
      <div className="flex items-center gap-3">
        <span className="text-2xl" role="img" aria-label="couple streak">
          💕
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">Couple Streak</p>
          <p className="text-xs text-text-secondary truncate">You're both keeping it up!</p>
        </div>
        <div className="text-right">
          <span className="font-accent text-xl font-bold text-primary tabular-nums">
            {streak.current_days}
          </span>
          <p className="text-xs text-text-secondary">
            {streak.current_days === 1 ? 'day' : 'days'}
          </p>
        </div>
      </div>
    </Card>
  )
}
