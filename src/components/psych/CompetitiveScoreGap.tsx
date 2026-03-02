import { cn } from '@/lib/cn'
import { useSprintMode } from '@/hooks/useSprintMode'

interface CompetitiveScoreGapProps {
  myScore: number
  partnerScore: number
  myName: string
  partnerName: string
  className?: string
}

export function CompetitiveScoreGap({
  myScore, partnerScore, myName: _myName, partnerName, className = '',
}: CompetitiveScoreGapProps) {
  const { mode } = useSprintMode()
  if (mode === 'cooperative') return null

  const gap = myScore - partnerScore
  const isLeading = gap > 0
  const isTied = gap === 0
  if (isTied) return null

  return (
    <p className={cn('text-xs text-text-secondary text-center', className)}>
      {isLeading
        ? `You're ahead by ${gap.toFixed(1)} pts. Keep going.`
        : `${partnerName} leads by ${Math.abs(gap).toFixed(1)} pts. Time to catch up.`}
    </p>
  )
}
