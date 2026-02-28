import { useState } from 'react'
import { Card } from '@/components/ui'
import { ScoreComparison } from './ScoreComparison'
import { ScoreBreakdown } from './ScoreBreakdown'
import { formatWeekRange, getDaysRemainingInSprint } from '@/lib/dates'
import type { ScoreBreakdown as ScoreBreakdownType } from '@/hooks/useSprint'

interface ActiveSprintViewProps {
  weekStart: string
  myName: string
  partnerName: string
  myBreakdown: { breakdown: ScoreBreakdownType; total: number; tasks_due: number; tasks_completed: number } | null
  partnerBreakdown: { breakdown: ScoreBreakdownType; total: number } | null
  timezone: string
}

export function ActiveSprintView({
  weekStart,
  myName,
  partnerName,
  myBreakdown,
  partnerBreakdown,
  timezone,
}: ActiveSprintViewProps) {
  const [expanded, setExpanded] = useState(false)
  const daysRemaining = getDaysRemainingInSprint(weekStart, timezone)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">Sprint</h1>
          <p className="text-sm text-text-secondary">{formatWeekRange(weekStart)}</p>
        </div>
        <div className="text-right">
          <span className="font-accent text-2xl font-bold text-primary tabular-nums">
            {daysRemaining}
          </span>
          <p className="text-xs text-text-secondary">
            {daysRemaining === 1 ? 'day left' : 'days left'}
          </p>
        </div>
      </div>

      {/* Score comparison */}
      <Card>
        <ScoreComparison
          myScore={myBreakdown?.total ?? 0}
          partnerScore={partnerBreakdown?.total ?? 0}
          myName={myName}
          partnerName={partnerName}
        />
      </Card>

      {/* My breakdown (expandable) */}
      {myBreakdown && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium text-primary mb-2 active:scale-[0.98]"
          >
            {expanded ? 'Hide' : 'Show'} my breakdown
          </button>
          {expanded && (
            <ScoreBreakdown
              completion={myBreakdown.breakdown.completion}
              difficulty={myBreakdown.breakdown.difficulty}
              consistency={myBreakdown.breakdown.consistency}
              streak={myBreakdown.breakdown.streak}
              total={myBreakdown.breakdown.total}
            />
          )}
        </div>
      )}

      {/* Task summary */}
      {myBreakdown && (
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Tasks completed</span>
            <span className="font-accent font-bold text-text-primary tabular-nums">
              {myBreakdown.tasks_completed}/{myBreakdown.tasks_due}
            </span>
          </div>
        </Card>
      )}
    </div>
  )
}
