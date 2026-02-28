import { cn } from '@/lib/cn'
import { Card } from '@/components/ui'

interface ScoreBreakdownProps {
  completion: number
  difficulty: number
  consistency: number
  streak: number
  total: number
  className?: string
}

const components = [
  { key: 'completion', label: 'Completion', weight: '30%' },
  { key: 'difficulty', label: 'Difficulty', weight: '20%' },
  { key: 'consistency', label: 'Consistency', weight: '30%' },
  { key: 'streak', label: 'Streak Bonus', weight: '15%' },
] as const

export function ScoreBreakdown({
  completion,
  difficulty,
  consistency,
  streak,
  total,
  className,
}: ScoreBreakdownProps) {
  const scores: Record<string, number> = { completion, difficulty, consistency, streak }

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
            <div
              className="h-full rounded-[var(--radius-pill)] origin-left"
              style={{
                width: `${Math.max(scores[key] ?? 0, 2)}%`,
                background: 'linear-gradient(to right, var(--color-chart-a), var(--color-chart-b))',
                animation: 'bar-grow 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
                animationDelay: `${i * 60}ms`,
              }}
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
