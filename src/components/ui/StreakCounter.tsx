import { m } from 'motion/react'
import { useAnimatedCounter } from '@/lib/animations'
import { cn } from '@/lib/cn'

interface StreakCounterProps {
  current: number
  best?: number
  showBest?: boolean
  freezeAvailable?: number
  size?: 'sm' | 'md'
  className?: string
}

export function StreakCounter({ current, best, showBest = false, freezeAvailable, size = 'md', className }: StreakCounterProps) {
  const flame = current > 0
  const displayValue = useAnimatedCounter(current)

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'transition-transform duration-300 ease-[var(--ease-bouncy)]',
          flame && 'motion-safe:animate-[float_2s_ease-in-out_infinite]',
          size === 'sm' ? 'text-base' : 'text-xl',
        )}
      >
        {flame ? '\uD83D\uDD25' : '\u2764\uFE0F'}
      </span>
      <m.span
        className={cn(
          'font-accent font-bold text-text-primary',
          size === 'sm' ? 'text-base' : 'text-xl',
        )}
      >
        {displayValue}
      </m.span>
      {freezeAvailable !== undefined && freezeAvailable > 0 && (
        <span
          className={cn(
            'transition-transform duration-300 ease-[var(--ease-bouncy)]',
            size === 'sm' ? 'text-xs' : 'text-sm',
          )}
          title={`${freezeAvailable} streak freeze${freezeAvailable === 1 ? '' : 's'} available`}
        >
          🛡️
        </span>
      )}
      {showBest && best !== undefined && best > 0 && (
        <span className="text-xs text-text-secondary font-medium">
          / {best} best
        </span>
      )}
    </div>
  )
}
