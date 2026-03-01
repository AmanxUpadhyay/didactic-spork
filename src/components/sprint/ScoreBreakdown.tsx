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

const components = [
  { key: 'completion', label: 'Completion', weight: '30%' },
  { key: 'difficulty', label: 'Difficulty', weight: '20%' },
  { key: 'consistency', label: 'Consistency', weight: '30%' },
  { key: 'streak', label: 'Streak Bonus', weight: '15%' },
  { key: 'bonus', label: 'Daily Bonus', weight: '5%' },
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
  const scores: Record<string, number> = { completion, difficulty, consistency, streak, bonus: bonus ?? 0 }

  return (
    <Card className={cn('space-y-3', className)}>
      {components.map(({ key, label, weight }, i) => (
        <div key={key} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">{label} ({weight})</span>
            <span className="font-accent text-sm font-semibold text-text-primary tabular-nums">
              {scores[key]?.toFixed(1)}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-[var(--radius-pill)] bg-border/30 overflow-hidden">
            <m.div
              className="h-full rounded-[var(--radius-pill)]"
              style={{
                width: `${Math.max(scores[key] ?? 0, 2)}%`,
                background: 'linear-gradient(to right, var(--color-chart-a), var(--color-chart-b))',
                originX: 0,
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ ...kawaiiSpring, delay: i * 0.06 }}
            />
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-sm font-medium text-text-primary">Total Score</span>
        <span className="font-accent text-xl font-bold text-primary tabular-nums">
          {total.toFixed(1)}
        </span>
      </div>
    </Card>
  )
}
