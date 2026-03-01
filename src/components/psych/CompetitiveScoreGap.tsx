import { Card } from '@/components/ui'

interface CompetitiveScoreGapProps {
  myScore: number
  partnerScore: number
  myName: string
  partnerName: string
  className?: string
}

export function CompetitiveScoreGap({
  myScore, partnerScore, myName, partnerName, className = '',
}: CompetitiveScoreGapProps) {
  const gap = myScore - partnerScore
  const isLeading = gap > 0
  const isTied = gap === 0

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-text-secondary">Score Comparison</span>
        {!isTied && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            isLeading
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {isLeading ? `+${gap.toFixed(0)}` : `${gap.toFixed(0)}`}
          </span>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-secondary w-16 truncate">{myName}</span>
          <div className="flex-1 h-3 rounded-full bg-surface-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, myScore)}%` }}
            />
          </div>
          <span className="text-xs font-bold text-text-primary w-10 text-right">{myScore.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-secondary w-16 truncate">{partnerName}</span>
          <div className="flex-1 h-3 rounded-full bg-surface-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-text-secondary/40 transition-all duration-500"
              style={{ width: `${Math.min(100, partnerScore)}%` }}
            />
          </div>
          <span className="text-xs font-bold text-text-primary w-10 text-right">{partnerScore.toFixed(0)}%</span>
        </div>
      </div>
      {!isTied && (
        <p className="text-[10px] text-text-secondary/60 mt-2">
          {isLeading
            ? `You're ahead by ${gap.toFixed(0)} points. Don't let up!`
            : `${partnerName} leads by ${Math.abs(gap).toFixed(0)} points. Time to catch up!`
          }
        </p>
      )}
    </Card>
  )
}
