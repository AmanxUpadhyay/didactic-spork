import { useState, useRef } from 'react'
import { cn } from '@/lib/cn'
import { StreakCounter } from '@/components/ui/StreakCounter'
import { AnimatedCheckbox } from '@/components/ui/AnimatedCheckbox'
import type { DifficultyLevel, Streak } from '@/types/habits'

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  easy: 'bg-success/15 text-success',
  medium: 'bg-warning/15 text-warning',
  hard: 'bg-secondary/15 text-secondary',
  legendary: 'bg-error/15 text-error',
}

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  legendary: 'Legendary',
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
  const [animating, setAnimating] = useState(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)

  function handleTap() {
    if (didLongPress.current) {
      didLongPress.current = false
      return
    }
    if (!isDueToday) return
    if (!completed) {
      setAnimating(true)
      setTimeout(() => setAnimating(false), 600)
    }
    onToggle()
    if (!completed) {
      onComplete?.()
    }
  }

  function handlePointerDown() {
    didLongPress.current = false
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

  function handlePointerLeave() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  return (
    <button
      type="button"
      onClick={handleTap}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      disabled={!isDueToday}
      className={cn(
        'w-full text-left',
        'rounded-[var(--radius-card)] bg-surface',
        'border-2 p-4',
        'transition-all duration-200 ease-[var(--ease-bouncy)]',
        'active:scale-[0.98] cursor-pointer',
        'select-none',
        completed
          ? 'border-primary/30 opacity-60'
          : 'border-border shadow-[var(--shadow-elevated)]',
        !isDueToday && 'opacity-40 cursor-not-allowed',
        animating && 'animate-[bloom_400ms_var(--ease-bouncy)]',
      )}
    >
      <div className="flex items-center gap-3">
        {/* Animated checkbox — visual only, outer button drives toggle */}
        <div className="pointer-events-none">
          <AnimatedCheckbox
            checked={completed}
            onChange={() => {}}
            size={28}
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
                'text-xs font-semibold px-2 py-0.5 rounded-[var(--radius-pill)]',
                DIFFICULTY_COLORS[difficulty],
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
    </button>
  )
}
