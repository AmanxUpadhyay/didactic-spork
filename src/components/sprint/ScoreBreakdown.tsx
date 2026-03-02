import { m } from 'motion/react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui'
import { kawaiiSpring } from '@/lib/animations'

interface ScoreBreakdownProps {
  completion: number
  difficulty: number
  consistency: number
  streak: number
  bonus?: number
  total: number
  className?: string
}

const GRID_ITEMS = [
  { key: 'completion', label: 'Completion', weight: '30%' },
  { key: 'difficulty', label: 'Difficulty', weight: '20%' },
  { key: 'consistency', label: 'Consistency', weight: '30%' },
  { key: 'streak', label: 'Streak', weight: '15%' },
] as const

export function ScoreBreakdown({
  completion,
  difficulty,
  consistency,
  streak,
  bonus,
  total,
  className,
}: ScoreBreakdownProps) {
  const scores: Record<string, number> = { completion, difficulty, consistency, streak }

  return (
    <Card className={cn(className)}>
      <div className="grid grid-cols-2 gap-2">
        {GRID_ITEMS.map(({ key, label, weight }, i) => {
          const value = scores[key] ?? 0
          return (
            <m.div
              key={key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...kawaiiSpring, delay: i * 0.06 }}
              className="bg-background rounded-[var(--radius-card)] p-3"
            >
              <p className="text-xs text-text-secondary font-medium leading-tight">
                {label}{' '}
                <span className="text-text-tertiary">{weight}</span>
              </p>
              <p className="font-heading text-2xl font-bold text-text-primary mt-0.5 tabular-nums">
                {value.toFixed(1)}
              </p>
              <div className="h-1 rounded-[var(--radius-pill)] mt-2 bg-border overflow-hidden">
                <m.div
                  className="h-full rounded-[var(--radius-pill)]"
                  style={{ background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(value, 100)}%` }}
                  transition={{ ...kawaiiSpring, delay: i * 0.06 + 0.1 }}
                />
              </div>
            </m.div>
          )
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-border space-y-1.5">
        {(bonus ?? 0) > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-tertiary">Daily Bonus (5%)</span>
            <span className="font-accent text-sm font-semibold text-text-secondary tabular-nums">
              +{(bonus ?? 0).toFixed(1)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-text-primary">Total Score</span>
          <span className="font-heading text-xl font-bold text-primary tabular-nums">
            {total.toFixed(1)}
          </span>
        </div>
      </div>
    </Card>
  )
}
