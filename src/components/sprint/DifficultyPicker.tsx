import { m } from 'motion/react'
import { cn } from '@/lib/cn'
import { kawaiiSpring, haptics } from '@/lib/animations'
import type { DifficultyLevel } from '@/types/habits'

const LEVELS: { value: DifficultyLevel; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  { value: 'hard', label: 'Hard', color: 'bg-orange-100 text-orange-700' },
  { value: 'legendary', label: 'Legend', color: 'bg-rose-100 text-rose-700' },
]

interface DifficultyPickerProps {
  value: DifficultyLevel
  onChange: (level: DifficultyLevel) => void
  className?: string
}

export function DifficultyPicker({ value, onChange, className }: DifficultyPickerProps) {
  return (
    <div className={cn('flex gap-1.5', className)}>
      {LEVELS.map((level) => (
        <m.button
          key={level.value}
          type="button"
          onClick={() => onChange(level.value)}
          onPointerDown={() => haptics.light()}
          whileTap={{ scale: 0.88 }}
          animate={{ scale: value === level.value ? 1.05 : 1 }}
          transition={kawaiiSpring}
          className={cn(
            'px-2.5 py-1 rounded-[var(--radius-pill)] text-xs font-medium',
            value === level.value
              ? cn(level.color, 'ring-1 ring-current/30')
              : 'bg-surface text-text-secondary hover:bg-border/30',
          )}
        >
          {level.label}
        </m.button>
      ))}
    </div>
  )
}
