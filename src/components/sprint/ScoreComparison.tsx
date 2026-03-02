import { m } from 'motion/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { CrownIcon } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/cn'
import { gentleSpring } from '@/lib/animations'

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
  const myPct = Math.max((myScore / maxScore) * 100, 4)
  const partnerPct = Math.max((partnerScore / maxScore) * 100, 4)
  const iAmAhead = myScore > partnerScore
  const isTied = myScore === partnerScore

  const winnerBar = 'linear-gradient(to right, var(--color-chart-a), var(--color-chart-b))'
  const loserBar = 'color-mix(in srgb, var(--color-border) 60%, transparent)'

  return (
    <div className={cn('space-y-3', className)}>
      {/* My row */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {iAmAhead && <HugeiconsIcon icon={CrownIcon} size={14} className="text-warning" />}
            <span className="text-sm font-medium text-text-primary truncate">{myName}</span>
          </div>
          <span className={cn(
            'font-accent text-4xl font-bold tabular-nums',
            iAmAhead || isTied ? 'text-primary' : 'text-text-secondary',
          )}>
            {myScore.toFixed(1)}
          </span>
        </div>
        <div className="h-2.5 w-full rounded-[var(--radius-pill)] bg-border/20 overflow-hidden">
          <m.div
            className="h-full rounded-[var(--radius-pill)]"
            style={{ background: iAmAhead || isTied ? winnerBar : loserBar }}
            initial={{ width: '0%' }}
            animate={{ width: `${myPct}%` }}
            transition={gentleSpring}
          />
        </div>
      </div>

      {/* Partner row */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {!iAmAhead && !isTied && <HugeiconsIcon icon={CrownIcon} size={14} className="text-warning" />}
            <span className="text-sm font-medium text-text-primary truncate">{partnerName}</span>
          </div>
          <span className={cn(
            'font-accent text-4xl font-bold tabular-nums',
            !iAmAhead || isTied ? 'text-primary' : 'text-text-secondary',
          )}>
            {partnerScore.toFixed(1)}
          </span>
        </div>
        <div className="h-2.5 w-full rounded-[var(--radius-pill)] bg-border/20 overflow-hidden">
          <m.div
            className="h-full rounded-[var(--radius-pill)]"
            style={{ background: !iAmAhead || isTied ? winnerBar : loserBar }}
            initial={{ width: '0%' }}
            animate={{ width: `${partnerPct}%` }}
            transition={{ ...gentleSpring, delay: 0.06 }}
          />
        </div>
      </div>

      {/* Gap summary */}
      {!isTied && (
        <p className="text-xs text-text-secondary pt-0.5">
          {iAmAhead
            ? `You lead by ${(myScore - partnerScore).toFixed(1)} pts`
            : `${partnerName} leads by ${(partnerScore - myScore).toFixed(1)} pts`}
        </p>
      )}
    </div>
  )
}
