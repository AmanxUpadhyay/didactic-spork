import { cn } from '@/lib/cn'
import type { DifficultyLevel } from '@/types/habits'

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

interface PartnerHabitCardProps {
  title: string
  difficulty: DifficultyLevel
  completed: boolean
}

export function PartnerHabitCard({ title, difficulty, completed }: PartnerHabitCardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] bg-surface',
        'border-2 p-4',
        'transition-all duration-200',
        completed
          ? 'border-primary/30 opacity-60'
          : 'border-border shadow-[var(--shadow-elevated)]',
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0',
            completed
              ? 'bg-primary border-primary'
              : 'border-border',
          )}
        >
          {completed && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('font-medium text-text-primary truncate', completed && 'line-through')}>
            {title}
          </p>
          <span
            className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-[var(--radius-pill)] mt-0.5 inline-block',
              DIFFICULTY_COLORS[difficulty],
            )}
          >
            {DIFFICULTY_LABELS[difficulty]}
          </span>
        </div>
        {completed && (
          <span className="text-lg flex-shrink-0">✨</span>
        )}
      </div>
    </div>
  )
}
