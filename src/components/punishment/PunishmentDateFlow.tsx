import { useState } from 'react'
import { usePunishment } from '@/hooks/usePunishment'
import { useVetoSystem } from '@/hooks/useVetoSystem'
import { useKira } from '@/hooks/useKira'
import { DateIntensityBadge } from './DateIntensityBadge'
import { VetoCounter } from './VetoCounter'
import { DatePlanCard } from './DatePlanCard'
import { DateRatingForm } from './DateRatingForm'
import { MutualFailureView } from './MutualFailureView'
import { KiraAvatar } from '@/components/kira/KiraAvatar'
import { KiraCommentary } from '@/components/kira/KiraCommentary'
import { Card, Button } from '@/components/ui'
import type { DateOption } from '@/types/punishment'

interface PunishmentDateFlowProps {
  sprintId: string
  myScore: number
  partnerScore: number
  myName: string
  partnerName: string
  iWon: boolean
  isTie: boolean
  className?: string
}

export function PunishmentDateFlow({
  sprintId,
  myScore,
  partnerScore,
  myName,
  partnerName,
  iWon,
  isTie,
  className = '',
}: PunishmentDateFlowProps) {
  const { punishment, loading, acceptPlan, scheduleDatePlan, refresh } = usePunishment(sprintId)
  const { planDate, loading: generating } = useKira()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [schedulingDate, setSchedulingDate] = useState('')

  const options = (punishment?.datePlan?.options || []) as DateOption[]

  const vetoSystem = useVetoSystem({
    punishmentId: punishment?.id,
    sprintId,
    vetoesGranted: punishment?.vetoesGranted ?? 1,
    vetoesUsed: punishment?.vetoesUsed ?? 0,
    options,
  })

  // Mutual failure — special view
  if (punishment?.isMutualFailure) {
    return (
      <MutualFailureView
        myName={myName}
        partnerName={partnerName}
        myScore={myScore}
        partnerScore={partnerScore}
        className={className}
      />
    )
  }

  // Both win — celebratory
  if (punishment?.isBothWin) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card className="!bg-primary/5 !border-primary/20">
          <div className="flex items-start gap-3">
            <KiraAvatar mood="hype_man" size="md" />
            <div>
              <h3 className="font-heading text-base font-semibold text-primary mb-1">
                Both winners!
              </h3>
              <p className="text-sm text-text-secondary">
                Both of you crushed it this week. No punishment — celebrate together!
              </p>
            </div>
          </div>
        </Card>
        {options.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">Kira's reward date ideas:</p>
            {options.map((opt, i) => (
              <DatePlanCard
                key={i}
                option={opt}
                index={i}
                selected={selectedIndex === i}
                onSelect={() => setSelectedIndex(i)}
                onAccept={() => acceptPlan(i)}
                onVeto={() => {}}
                vetoesRemaining={0}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <div className="h-24" />
      </Card>
    )
  }

  // Already accepted — show scheduling or rating
  if (punishment?.accepted) {
    if (punishment.scheduledDate) {
      return (
        <div className={`space-y-3 ${className}`}>
          <Card className="!bg-primary/5">
            <p className="text-sm text-text-primary font-medium">
              Date plan accepted!
              {punishment.scheduledDate && (
                <span className="text-text-secondary"> Scheduled for {punishment.scheduledDate}</span>
              )}
            </p>
          </Card>
          <DateRatingForm
            onSubmit={(rating, highlights, improvements) => {
              // Rating handled by useDateHistory in parent
              console.log('Rating submitted:', rating, highlights, improvements)
            }}
          />
        </div>
      )
    }

    return (
      <div className={`space-y-3 ${className}`}>
        <Card className="!bg-primary/5">
          <p className="text-sm text-text-primary font-medium mb-3">Date plan accepted!</p>
          <div className="flex gap-2">
            <input
              type="date"
              value={schedulingDate}
              onChange={(e) => setSchedulingDate(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border-2 border-border bg-surface text-sm"
            />
            <Button
              onClick={() => {
                if (schedulingDate) scheduleDatePlan(schedulingDate)
              }}
              disabled={!schedulingDate}
            >
              Schedule
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // No plan yet — generate
  if (options.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <KiraAvatar mood="cheerful" size="lg" className="mx-auto mb-3" />
        <h3 className="font-heading text-lg font-semibold text-text-primary mb-1">
          {iWon ? 'Your prize date' : isTie ? 'Tie-breaker date' : 'Time for the punishment date'}
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          {iWon
            ? `${partnerName} plans a date for you based on the sprint results`
            : 'Kira will suggest date options based on the sprint results'}
        </p>
        <button
          onClick={() => planDate(sprintId)}
          disabled={generating}
          className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-medium disabled:opacity-50"
        >
          {generating ? 'Planning...' : 'Generate date ideas'}
        </button>
      </div>
    )
  }

  // Show options with veto flow
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KiraAvatar mood={(punishment as unknown as { mood?: string })?.mood as never ?? 'cheerful'} size="sm" />
          <p className="text-sm font-medium text-text-primary">
            {iWon ? "Pick your date:" : "Kira's date ideas:"}
          </p>
        </div>
        <DateIntensityBadge
          intensity={punishment?.intensity ?? 'moderate'}
          budget={punishment?.budgetGbp ?? 60}
        />
      </div>

      {iWon && (
        <VetoCounter
          total={punishment?.vetoesGranted ?? 1}
          used={vetoSystem.vetoesUsed}
        />
      )}

      {options.map((opt, i) => (
        <DatePlanCard
          key={i}
          option={opt}
          index={i}
          selected={selectedIndex === i}
          onSelect={() => setSelectedIndex(i)}
          onAccept={() => acceptPlan(i)}
          onVeto={() => vetoSystem.vetoOption(i).then(() => refresh())}
          vetoesRemaining={vetoSystem.vetoesRemaining}
          surpriseBadge={!!punishment?.surpriseElement && i === options.length - 1}
          disabled={vetoSystem.regenerating}
        />
      ))}

      {vetoSystem.regenerating && (
        <KiraCommentary text="Fine, let me think of something else..." mood="sarcastic" />
      )}
    </div>
  )
}
