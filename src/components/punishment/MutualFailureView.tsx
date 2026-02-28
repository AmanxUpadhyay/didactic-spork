import { Card } from '@/components/ui'
import { KiraAvatar } from '@/components/kira/KiraAvatar'
import { KiraCommentary } from '@/components/kira/KiraCommentary'

interface MutualFailureViewProps {
  myName: string
  partnerName: string
  myScore: number
  partnerScore: number
  className?: string
}

export function MutualFailureView({
  myName,
  partnerName,
  myScore,
  partnerScore,
  className = '',
}: MutualFailureViewProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="!bg-amber-50 !border-amber-200">
        <div className="flex items-start gap-3">
          <KiraAvatar mood="disappointed" size="md" />
          <div className="flex-1">
            <h3 className="font-heading text-base font-semibold text-amber-800 mb-1">
              Mutual Failure
            </h3>
            <p className="text-sm text-amber-700">
              Both {myName} ({myScore}) and {partnerName} ({partnerScore}) scored under 30.
              No winner, no loser — just a shared L.
            </p>
          </div>
        </div>
      </Card>

      <KiraCommentary
        text="Right. Neither of you showed up this week. No date planning needed — instead, you're both doing a joint task. Consider this a collaborative redemption arc."
        mood="disappointed"
      />

      <Card>
        <h4 className="text-sm font-semibold text-text-primary mb-2">Joint Task</h4>
        <p className="text-sm text-text-secondary">
          Plan a free activity together this week: a walk, cooking a meal, or a game night.
          The point is showing up for each other. Budget: £30 if you want to go out.
        </p>
      </Card>
    </div>
  )
}
