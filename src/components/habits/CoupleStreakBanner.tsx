import { m } from 'motion/react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui'
import { kawaiiSpring } from '@/lib/animations'
import type { Streak } from '@/types/habits'

interface CoupleStreakBannerProps {
  streak: Streak
  atRisk?: boolean
  className?: string
}

export function CoupleStreakBanner({ streak, atRisk = false, className }: CoupleStreakBannerProps) {
  return (
    <Card className={cn(
      atRisk ? '!bg-red-50 dark:!bg-red-950/20 border border-red-200 dark:border-red-800' : '',
      className,
    )}>
      <div className="text-center py-1">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-xl" role="img" aria-label="couple streak">
            {atRisk ? '⏳' : '💕'}
          </span>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-widest">
            Couple Streak
          </p>
        </div>
        <m.span
          key={streak.current_days}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={kawaiiSpring}
          className={cn(
            'font-accent text-5xl font-bold tabular-nums leading-none block',
            atRisk ? 'text-red-500 dark:text-red-400' : 'text-primary',
          )}
        >
          {streak.current_days}
        </m.span>
        <p className="text-sm text-text-secondary mt-1">
          {streak.current_days === 1 ? 'day' : 'days'}
        </p>
        {atRisk ? (
          <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 animate-pulse">
            At risk! Complete a habit before midnight.
          </p>
        ) : (
          <p className="text-xs text-text-secondary mt-0.5">You're both keeping it up!</p>
        )}
      </div>
    </Card>
  )
}
