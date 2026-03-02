import { useEffect } from 'react'
import { m, useSpring, useTransform, useMotionValue } from 'motion/react'
import { cn } from '@/lib/cn'
import { kawaiiSpring } from '@/lib/animations'

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 4,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedProgress = Math.min(Math.max(progress, 0), 1)
  const targetOffset = circumference * (1 - clampedProgress)
  const percentage = Math.round(clampedProgress * 100)
  const isComplete = percentage >= 100

  // Spring-driven dashoffset for elastic overshoot on habit completion
  const progressMv = useMotionValue(targetOffset)
  const springOffset = useSpring(progressMv, kawaiiSpring)

  useEffect(() => {
    progressMv.set(targetOffset)
  }, [targetOffset, progressMv])

  // Convert MotionValue<number> to a string for strokeDashoffset
  const dashoffset = useTransform(springOffset, (v) => String(v))

  return (
    <m.div
      className={cn('relative inline-flex items-center justify-center', className)}
      animate={isComplete ? {
        filter: [
          'drop-shadow(0 0 0px transparent)',
          'drop-shadow(0 0 8px color-mix(in srgb, var(--color-primary) 60%, transparent))',
          'drop-shadow(0 0 4px color-mix(in srgb, var(--color-primary) 30%, transparent))',
        ]
      } : { filter: 'drop-shadow(0 0 0px transparent)' }}
      transition={isComplete ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle — spring-animated dashoffset */}
        <m.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
        />
      </svg>
      <m.span
        key={isComplete ? 'check' : 'pct'}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="absolute font-accent text-xs font-bold text-text-primary"
      >
        {isComplete ? '✓' : `${percentage}%`}
      </m.span>
    </m.div>
  )
}
