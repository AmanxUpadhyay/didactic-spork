import { useRef } from 'react'
import { m, useMotionValue, useTransform, animate } from 'motion/react'
import { cn } from '@/lib/cn'
import { StreakCounter } from '@/components/ui/StreakCounter'
import { AnimatedCheckbox } from '@/components/ui/AnimatedCheckbox'
import { kawaiiSpring, deleteSnapSpring, haptics } from '@/lib/animations'
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
  onDelete?: () => void
  isFocused?: boolean
  isDimmed?: boolean
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
  onDelete,
  isFocused,
  isDimmed,
  ifTrigger,
  thenAction,
}: HabitCardProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)
  const didDrag = useRef(false)

  // Swipe gesture values
  const x = useMotionValue(0)

  // Swipe RIGHT — complete
  const checkOpacity = useTransform(x, [0, 80, 200], [0, 0.4, 1])
  const successOpacity = useTransform(x, [0, 100, 200], [0, 0.3, 0.85])

  // Swipe LEFT — delete
  const deleteOpacity = useTransform(x, [-60, -180], [0, 1])
  const deleteIconScale = useTransform(x, [-100, -180], [0.8, 1.2])

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
      style={{
        x,
        touchAction: 'pan-y',
        position: 'relative',
        overflow: 'hidden',
        opacity: isDimmed ? 0.5 : 1,
        scale: isFocused ? 1.04 : 1,
      }}
      animate={{
        opacity: isDimmed ? 0.5 : 1,
        scale: isFocused ? 1.04 : 1,
      }}
      transition={kawaiiSpring}
      className={cn(
        'w-full rounded-[var(--radius-card)] overflow-hidden',
        !isDueToday && 'opacity-40',
      )}
      drag={isDueToday && !completed ? 'x' : false}
      dragConstraints={{ left: -220, right: 220 }}
      dragElastic={{ left: 0.2, right: 0.25 }}
      whileTap={isDueToday && !completed ? { scale: 0.98 } : undefined}
      onDragStart={() => {
        didDrag.current = true
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current)
          longPressTimer.current = null
        }
      }}
      onDrag={(_, info) => {
        // Haptic warning at delete threshold
        if (info.offset.x < -120 && info.offset.x > -125) {
          haptics.light()
        }
      }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 200 || info.velocity.x > 500) {
          // Swipe right — complete
          haptics.success()
          onToggle()
          onComplete?.()
          animate(x, 0, { type: 'spring', stiffness: 400, damping: 25, mass: 0.8 })
        } else if (info.offset.x < -180 || info.velocity.x < -500) {
          // Swipe left — delete
          haptics.error()
          animate(x, -window.innerWidth, {
            ...deleteSnapSpring,
            onComplete: () => { onDelete?.() },
          })
        } else {
          animate(x, 0, kawaiiSpring)
        }
      }}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Delete zone — positioned behind card, left side */}
      <m.div
        className="absolute inset-y-0 left-0 right-0 rounded-[var(--radius-card)] flex items-center pl-5 pointer-events-none"
        style={{
          backgroundColor: 'var(--color-error, #ef4444)',
          opacity: deleteOpacity,
        }}
      >
        <m.div style={{ scale: deleteIconScale }} className="text-white">
          <svg viewBox="0 0 20 20" fill="currentColor" width="24" height="24">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </m.div>
      </m.div>

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
