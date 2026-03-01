import { useState, useRef, useEffect } from 'react'
import { m } from 'motion/react'
import { BottomSheet } from '@/components/ui'
import { haptics } from '@/lib/animations'

const HOLD_DURATION = 1500 // ms

interface HabitActionMenuProps {
  open: boolean
  onClose: () => void
  habitTitle: string
  isCompletedToday: boolean
  onEdit: () => void
  onArchive: () => void
  onExcuse?: () => void
}

export function HabitActionMenu({
  open,
  onClose,
  habitTitle,
  isCompletedToday,
  onEdit,
  onArchive,
  onExcuse,
}: HabitActionMenuProps) {
  const [holdProgress, setHoldProgress] = useState(0) // 0–1
  const [holding, setHolding] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(0)

  // Reset progress whenever sheet closes
  useEffect(() => {
    if (!open) {
      cancelHold()
      setHoldProgress(0)
    }
  }, [open])

  function cancelHold() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setHolding(false)
    setHoldProgress(0)
  }

  function startHold(e: React.PointerEvent) {
    e.preventDefault()
    setHolding(true)
    startTimeRef.current = Date.now()
    haptics.light()

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const progress = Math.min(elapsed / HOLD_DURATION, 1)
      setHoldProgress(progress)

      if (progress >= 1) {
        clearInterval(intervalRef.current!)
        intervalRef.current = null
        setHolding(false)
        haptics.medium()
        onArchive()
        onClose()
      }
    }, 16)
  }

  function handleEdit() {
    onEdit()
    onClose()
  }

  function handleExcuse() {
    onExcuse?.()
    onClose()
  }

  // SVG ring geometry
  const size = 28
  const strokeWidth = 2.5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - holdProgress)

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h3 className="font-heading text-lg font-semibold text-text-primary truncate">
        {habitTitle}
      </h3>
      <div className="mt-3 space-y-1">
        <button
          type="button"
          onClick={handleEdit}
          className="w-full text-left px-4 py-3 rounded-[var(--radius-card)] hover:bg-primary/5 flex items-center gap-3 text-text-primary font-medium"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
            <path
              d="M14.85 2.85a1.5 1.5 0 0 1 2.12 0l0.18 0.18a1.5 1.5 0 0 1 0 2.12L7.5 14.8l-3.3.83.83-3.3L14.85 2.85Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Edit
        </button>
        {!isCompletedToday && onExcuse && (
          <button
            type="button"
            onClick={handleExcuse}
            className="w-full text-left px-4 py-3 rounded-[var(--radius-card)] hover:bg-primary/5 flex items-center gap-3 text-primary font-medium"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
              <path
                d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM10 6v5M10 13.5v.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Explain to Kira
          </button>
        )}

        {/* Hold-to-archive button with progress ring */}
        <m.button
          type="button"
          onPointerDown={startHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onPointerCancel={cancelHold}
          animate={{ backgroundColor: holding ? 'color-mix(in srgb, var(--color-error) 8%, transparent)' : 'transparent' }}
          transition={{ duration: 0.15 }}
          className="w-full text-left px-4 py-3 rounded-[var(--radius-card)] flex items-center gap-3 text-error font-medium select-none touch-none"
          style={{ WebkitUserSelect: 'none' }}
        >
          {/* Progress ring wrapper */}
          <span className="relative flex-shrink-0" style={{ width: 20, height: 20 }}>
            {/* Trash icon (shown when not holding or before 50%) */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="absolute inset-0"
              style={{ opacity: holdProgress < 0.05 ? 1 : 1 - holdProgress * 2 }}
            >
              <path
                d="M3 5h14M5 5v11a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V5M8 9v4M12 9v4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {/* Progress ring (shown while holding) */}
            {holdProgress > 0 && (
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="absolute -top-1 -left-1 -rotate-90"
              >
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="var(--color-border)"
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="var(--color-error)"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
            )}
          </span>
          <span>
            {holding
              ? holdProgress > 0.5
                ? 'Keep holding…'
                : 'Hold to archive'
              : 'Archive'}
          </span>
        </m.button>
      </div>
    </BottomSheet>
  )
}
