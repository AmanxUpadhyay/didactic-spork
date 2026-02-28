import { Card, Button } from '@/components/ui'
import { KiraAvatar } from '@/components/kira/KiraAvatar'
import { useCoupleRescue } from '@/hooks/useCoupleRescue'

interface StreakRescuePromptProps {
  className?: string
}

export function StreakRescuePrompt({ className = '' }: StreakRescuePromptProps) {
  const {
    canRescue,
    partnerStreakInDanger,
    activeRescue,
    onCooldown,
    generating,
    initiateRescue,
    completeRescue,
  } = useCoupleRescue()

  // Active rescue in progress
  if (activeRescue && !activeRescue.completed) {
    return (
      <Card className={`!bg-pink-50 !border-pink-200 ${className}`}>
        <div className="flex items-start gap-3">
          <KiraAvatar mood="empathetic" size="sm" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-pink-800 mb-1">Rescue in progress</h4>
            <p className="text-xs text-pink-700 mb-3">
              Complete this task to save your partner's streak:
            </p>
            <p className="text-sm font-medium text-text-primary mb-3">
              {activeRescue.rescueTaskTitle}
            </p>
            <Button onClick={completeRescue} className="w-full">
              Mark complete
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // Can initiate a rescue
  if (canRescue && partnerStreakInDanger) {
    return (
      <Card className={`!bg-rose-50 !border-rose-200 ${className}`}>
        <div className="flex items-start gap-3">
          <KiraAvatar mood="empathetic" size="sm" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-rose-800 mb-1">
              {partnerStreakInDanger.partnerName}'s streak is broken
            </h4>
            <p className="text-xs text-rose-700 mb-1">
              "{partnerStreakInDanger.streakTaskTitle}" streak at{' '}
              {partnerStreakInDanger.streakDays} days
            </p>
            <p className="text-xs text-text-secondary mb-3">
              Complete a rescue task to save their streak (resets to day 1)
            </p>
            <Button
              onClick={() => initiateRescue(partnerStreakInDanger.streakId)}
              disabled={generating}
              className="w-full"
            >
              {generating ? 'Getting rescue task...' : 'Rescue their streak'}
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // On cooldown
  if (onCooldown) {
    return null // Don't show anything when on cooldown
  }

  return null
}
