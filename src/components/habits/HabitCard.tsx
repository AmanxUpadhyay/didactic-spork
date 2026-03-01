import { useRef } from 'react'
import { m, useMotionValue, useTransform } from 'motion/react'
import { cn } from '@/lib/cn'
import { StreakCounter } from '@/components/ui/StreakCounter'
import { AnimatedCheckbox } from '@/components/ui/AnimatedCheckbox'
import { kawaiiSpring, haptics } from '@/lib/animations'
import type { DifficultyLevel, Streak } from '@/types/habits'

const DIFFICULTY_STYLES: Record<DifficultyLevel, string> = {
  easy: 'border border-text-tertiary/25 text-text-tertiary text-xs px-2 py-0.5',
  medium: 'bg-secondary/15 text-secondary text-xs font-medium px-2 py-0.5',
  hard: 'bg-primary/20 text-primary text-sm font-semibold px-2.5 py-1',
  legendary: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white ring-2 ring-amber-300/50 shadow-md text-sm font-bold px-3 py-1.5',
}

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  legendary: '★ Legendary',
}

interface HabitCardProps {
  title: string
  difficulty: DifficultyLevel
  completed: boolean
  streak: Streak | null
  isDueToday: boolean
  onToggle: () => void
  onComplete?: () => void
  onLongPress?: () => void
  ifTrigger?: string
  thenAction?: string
}

export function HabitCard({
  title,
  difficulty,
  completed,
  streak,
  isDueToday,
  onToggle,
  onComplete,
  onLongPress,
  ifTrigger,
  thenAction,
}: HabitCardProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)
  const didDrag = useRef(false)

  // Swipe gesture values
  const x = useMotionValue(0)
  const checkOpacity = useTransform(x, [0, 80, 200], [0, 0.4, 1])
  const successOpacity = useTransform(x, [0, 100, 200], [0, 0.3, 0.85])

  function handlePointerDown() {
    haptics.light()
    didLongPress.current = false
    didDrag.current = false
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true
      onLongPress?.()
      longPressTimer.current = null
    }, 300)
  }

  function handlePointerUp() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  function handleClick() {
    if (didLongPress.current || didDrag.current) {
      didLongPress.current = false
      return
    }
    if (!isDueToday) return
    onToggle()
    if (!completed) {
      onComplete?.()
    }
  }

  return (
    <m.div
      style={{ x, touchAction: 'pan-y', position: 'relative', overflow: 'hidden' }}
      className={cn(
        'w-full rounded-[var(--radius-card)] overflow-hidden',
        !isDueToday && 'opacity-40',
      )}
      drag={isDueToday && !completed ? 'x' : false}
      dragConstraints={{ left: -60, right: 220 }}
      dragElastic={{ left: 0.1, right: 0.25 }}
      whileTap={isDueToday && !completed ? { scale: 0.98 } : undefined}
      transition={kawaiiSpring}
      onDragStart={() => { didDrag.current = true }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 200 || info.velocity.x > 500) {
          haptics.success()
          onToggle()
          onComplete?.()
        }
        x.set(0)
      }}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Success overlay — reveals on swipe right */}
      <m.div
        className="absolute inset-0 rounded-[var(--radius-card)] flex items-center pl-4 pointer-events-none"
        style={{
          backgroundColor: 'var(--color-success, #4ade80)',
          opacity: successOpacity,
        }}
      >
        <m.div style={{ opacity: checkOpacity }} className="text-white">
          <svg viewBox="0 0 20 20" fill="none" width="28" height="28">
            <m.path
              d="M4 10L8 14L16 6"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </m.div>
      </m.div>

      {/* Card content */}
      <div
        className={cn(
          'text-left',
          'rounded-[var(--radius-card)] bg-surface',
          'border-2 p-4',
          'select-none cursor-pointer',
          completed
            ? 'border-primary/30 opacity-60'
            : 'border-border shadow-[var(--shadow-elevated)]',
          !isDueToday && 'cursor-not-allowed',
        )}
      >
        <div className="flex items-center gap-3">
          {/* Animated checkbox — visual only, swipe/tap drives toggle */}
          <div className="pointer-events-none">
            <AnimatedCheckbox
              checked={completed}
              onChange={() => {}}
              size={40}
              disabled={!isDueToday}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'font-medium text-text-primary truncate',
                completed && 'line-through',
              )}
            >
              {title}
            </p>
            {ifTrigger && thenAction && (
              <p className="text-xs text-text-secondary truncate">
                If {ifTrigger} → {thenAction}
              </p>
            )}
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={cn(
                  'rounded-[var(--radius-pill)]',
                  DIFFICULTY_STYLES[difficulty],
                )}
              >
                {DIFFICULTY_LABELS[difficulty]}
              </span>
              {streak && streak.current_days > 0 && (
                <StreakCounter current={streak.current_days} freezeAvailable={streak.freeze_available} size="sm" />
              )}
            </div>
          </div>
        </div>
      </div>
    </m.div>
  )
}
