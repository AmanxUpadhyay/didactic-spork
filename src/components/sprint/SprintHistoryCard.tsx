import { cn } from '@/lib/cn'
import { Card } from '@/components/ui'
import { formatWeekRange } from '@/lib/dates'

interface SprintHistoryItem {
  id: string
  week_start: string
  my_score: number
  partner_score: number
  i_won: boolean
  is_tie: boolean
}

interface SprintHistoryCardProps {
  sprint: SprintHistoryItem
  className?: string
}

export function SprintHistoryCard({ sprint, className }: SprintHistoryCardProps) {
  const emoji = sprint.is_tie ? '🤝' : sprint.i_won ? '🏆' : '💪'

  return (
    <Card className={cn('flex items-center gap-3 !p-3', className)}>
      <span className="text-xl">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">
          {formatWeekRange(sprint.week_start)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'font-accent text-sm font-bold tabular-nums px-2 py-0.5 rounded-[var(--radius-pill)]',
            sprint.i_won || sprint.is_tie
              ? 'bg-primary/15 text-primary'
              : 'bg-border/30 text-text-secondary',
          )}
        >
          {sprint.my_score.toFixed(1)}
        </span>
        <span className="text-xs text-text-secondary">-</span>
        <span
          className={cn(
            'font-accent text-sm font-bold tabular-nums px-2 py-0.5 rounded-[var(--radius-pill)]',
            !sprint.i_won && !sprint.is_tie
              ? 'bg-secondary/15 text-secondary'
              : 'bg-border/30 text-text-secondary',
          )}
        >
          {sprint.partner_score.toFixed(1)}
        </span>
      </div>
    </Card>
  )
}
