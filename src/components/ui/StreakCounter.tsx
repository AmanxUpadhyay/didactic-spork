import { useEffect, useRef, useState } from 'react'
import { m, useAnimation, useMotionValueEvent } from 'motion/react'
import { useAnimatedCounter, kawaiiSpring } from '@/lib/animations'
import { cn } from '@/lib/cn'

const MILESTONES = new Set([7, 14, 21, 30, 60, 100, 200, 365])

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
  const [displayStr, setDisplayStr] = useState(() => Math.round(current).toLocaleString())
  useMotionValueEvent(displayValue, 'change', setDisplayStr)
  const controls = useAnimation()
  const prevRef = useRef(current)
  const isMilestone = MILESTONES.has(current)

  useEffect(() => {
    if (current > prevRef.current) {
      // Incrementing — spring bounce
      controls.start({
        scale: [1, 1.25, 0.95, 1.1, 1],
        transition: { ...kawaiiSpring, duration: 0.5 },
      })
    }
    prevRef.current = current
  }, [current, controls])

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'transition-transform duration-300 ease-[var(--ease-bouncy)]',
          flame && 'motion-safe:animate-[float_2s_ease-in-out_infinite]',
          size === 'sm' ? 'text-base' : 'text-xl',
        )}
      >
        {flame ? '🔥' : '❤️'}
      </span>
      <m.span
        animate={controls}
        className={cn(
          'relative font-accent font-bold text-text-primary',
          size === 'sm' ? 'text-base' : 'text-xl',
          isMilestone && 'text-primary',
        )}
        style={isMilestone ? {
          textShadow: `0 0 12px color-mix(in srgb, var(--color-primary) 60%, transparent),
                       0 0 24px color-mix(in srgb, var(--color-primary) 30%, transparent)`,
        } : undefined}
      >
        {displayStr}
        {isMilestone && (
          <m.span
            className="absolute -inset-1.5 rounded-full pointer-events-none"
            animate={{
              opacity: [0.6, 0, 0.6],
              scale: [1, 1.4, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 35%, transparent), transparent 70%)',
            }}
          />
        )}
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
