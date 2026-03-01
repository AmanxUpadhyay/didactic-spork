import { m } from 'motion/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { CrownIcon } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/cn'
import { kawaiiSpring } from '@/lib/animations'

interface ScoreComparisonProps {
  myScore: number
  partnerScore: number
  myName: string
  partnerName: string
  className?: string
}

export function ScoreComparison({
  myScore,
  partnerScore,
  myName,
  partnerName,
  className,
}: ScoreComparisonProps) {
  const maxScore = Math.max(myScore, partnerScore, 1)
  const myPct = Math.max((myScore / maxScore) * 100, 8)
  const partnerPct = Math.max((partnerScore / maxScore) * 100, 8)
  const iAmAhead = myScore > partnerScore
  const isTied = myScore === partnerScore

  return (
    <div className={cn('space-y-3', className)}>
      {/* My score bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {iAmAhead && <HugeiconsIcon icon={CrownIcon} size={16} className="text-warning" />}
            <span className="text-sm font-medium text-text-primary truncate">{myName}</span>
          </div>
          <span className={cn(
            'font-accent text-4xl font-bold tabular-nums',
            iAmAhead || isTied ? 'text-primary' : 'text-text-secondary',
          )}>
            {myScore.toFixed(1)}
          </span>
        </div>
        <div className="h-3 w-full rounded-[var(--radius-pill)] bg-border/30 overflow-hidden">
          <m.div
            className="h-full rounded-[var(--radius-pill)]"
            style={{
              width: `${myPct}%`,
              background: 'linear-gradient(to right, var(--color-chart-a), var(--color-chart-b))',
              originX: 0,
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={kawaiiSpring}
          />
        </div>
      </div>

      {/* Partner score bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {!iAmAhead && !isTied && <HugeiconsIcon icon={CrownIcon} size={16} className="text-warning" />}
            <span className="text-sm font-medium text-text-primary truncate">{partnerName}</span>
          </div>
          <span className={cn(
            'font-accent text-4xl font-bold tabular-nums',
            !iAmAhead || isTied ? 'text-primary' : 'text-text-secondary',
          )}>
            {partnerScore.toFixed(1)}
          </span>
        </div>
        <div className="h-3 w-full rounded-[var(--radius-pill)] bg-border/30 overflow-hidden">
          <m.div
            className="h-full rounded-[var(--radius-pill)]"
            style={{
              width: `${partnerPct}%`,
              background: 'linear-gradient(to right, var(--color-chart-b), var(--color-chart-a))',
              originX: 0,
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ ...kawaiiSpring, delay: 0.08 }}
          />
        </div>
      </div>
    </div>
  )
}
