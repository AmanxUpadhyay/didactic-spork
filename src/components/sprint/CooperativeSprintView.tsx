import { Card, ProgressRing } from '@/components/ui'

interface CooperativeSprintViewProps {
  sprintId: string
  userId: string
  partnerId: string | null
  weekStart?: string
  myName: string
  partnerName: string
  myBreakdown?: { total: number } | null
  partnerBreakdown?: { total: number } | null
  timezone?: string
  targetScore?: number
}

export function CooperativeSprintView({
  myName,
  partnerName,
  myBreakdown,
  partnerBreakdown,
  targetScore = 100,
}: CooperativeSprintViewProps) {
  const myScore = myBreakdown?.total ?? 0
  const partnerScore = partnerBreakdown?.total ?? 0
  const combinedScore = (myScore + partnerScore) / 2
  const progress = Math.min(1, combinedScore / targetScore)
  const onTrack = combinedScore >= targetScore * 0.7

  return (
    <div className="space-y-4">
      <Card>
        <div className="text-center space-y-3">
          <p className="text-xs text-text-secondary uppercase tracking-wide">Team Goal</p>
          <div className="flex flex-col items-center justify-center">
            <ProgressRing progress={progress} size={120} strokeWidth={8} />
            <div className="text-center mt-2">
              <p className="text-2xl font-bold text-text-primary">{combinedScore.toFixed(0)}</p>
              <p className="text-xs text-text-secondary">of {targetScore}</p>
            </div>
          </div>
          <p className={`text-sm font-medium ${onTrack ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {onTrack ? 'On track! Keep it up together.' : 'Push a little harder — you got this!'}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="text-xs text-text-secondary">{myName}</p>
          <p className="text-xl font-bold text-text-primary mt-1">{myScore.toFixed(0)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-text-secondary">{partnerName}</p>
          <p className="text-xl font-bold text-text-primary mt-1">{partnerScore.toFixed(0)}</p>
        </Card>
      </div>

      <p className="text-center text-xs text-text-tertiary">
        No winners or losers this week — just shared growth.
      </p>
    </div>
  )
}
