import { useAuth } from '@/hooks/useAuth'
import { useSprint } from '@/hooks/useSprint'
import { useLiveScores } from '@/hooks/useLiveScores'
import { useAppreciation } from '@/hooks/useAppreciation'
import { useSprintMode } from '@/hooks/useSprintMode'
import { usePairing } from '@/contexts/PairingContext'
import { EmptyState } from '@/components/ui'
import { LoadingState } from '@/components/ui/LoadingState'
import { ActiveSprintView } from '@/components/sprint/ActiveSprintView'
import { CooperativeSprintView } from '@/components/sprint/CooperativeSprintView'
import { SwapSprintView } from '@/components/sprint/SwapSprintView'
import { AppreciationGateView } from '@/components/sprint/AppreciationGateView'
import { SprintResultsView } from '@/components/sprint/SprintResultsView'
import { MercyRulePrompt } from '@/components/sprint/MercyRulePrompt'
import { CompetitiveScoreGap } from '@/components/psych/CompetitiveScoreGap'
import { SunkCostTimeline } from '@/components/psych/SunkCostTimeline'

export function SprintScreen() {
  const { profile } = useAuth()
  const { partnerId, partnerProfile } = usePairing()
  const tz = profile?.timezone || 'UTC'
  const myName = profile?.name || 'You'
  const partnerName = partnerProfile?.name || 'Partner'

  const { sprint, loading: sprintLoading } = useSprint(profile?.id)
  const { mode } = useSprintMode()
  const { myBreakdown, partnerBreakdown } = useLiveScores(
    profile?.id,
    sprint?.status === 'active' ? sprint?.id : undefined,
  )
  const { gate, myNote, partnerNote, submitNote } = useAppreciation(
    profile?.id,
    partnerId ?? undefined,
    sprint?.status === 'completed' ? sprint?.id : undefined,
  )

  if (sprintLoading) {
    return (
      <div className="px-5 pt-6 pb-24">
        <LoadingState message="Loading sprint..." />
      </div>
    )
  }

  if (!sprint) {
    return (
      <div className="px-5 pt-6 pb-24">
        <EmptyState
          title="No sprint yet"
          description="Sprints start automatically every Monday. Check back soon!"
        />
      </div>
    )
  }

  // Active sprint — render based on sprint_mode
  if (sprint.status === 'active' || sprint.status === 'scoring') {
    if (mode === 'cooperative') {
      return (
        <div className="px-5 pt-6 pb-24">
          <CooperativeSprintView
            sprintId={sprint.id}
            userId={profile!.id}
            partnerId={partnerId ?? null}
            weekStart={sprint.week_start}
            myName={myName}
            partnerName={partnerName}
            myBreakdown={myBreakdown}
            partnerBreakdown={partnerBreakdown}
            timezone={tz}
          />
          <div className="mt-4">
            <SunkCostTimeline />
          </div>
        </div>
      )
    }

    if (mode === 'swap') {
      return (
        <div className="px-5 pt-6 pb-24">
          <SwapSprintView
            sprintId={sprint.id}
            userId={profile!.id}
            partnerId={partnerId ?? null}
            weekStart={sprint.week_start}
            myName={myName}
            partnerName={partnerName}
            timezone={tz}
          />
          <div className="mt-4">
            <SunkCostTimeline />
          </div>
        </div>
      )
    }

    // Default: competitive mode
    return (
      <div className="px-5 pt-6 pb-24">
        <ActiveSprintView
          sprintId={sprint.id}
          userId={profile!.id}
          partnerId={partnerId ?? null}
          weekStart={sprint.week_start}
          myName={myName}
          partnerName={partnerName}
          myBreakdown={myBreakdown}
          partnerBreakdown={partnerBreakdown}
          timezone={tz}
        />
        <div className="mt-4">
          <CompetitiveScoreGap
            myScore={myBreakdown?.total ?? 0}
            partnerScore={partnerBreakdown?.total ?? 0}
            myName={myName}
            partnerName={partnerName}
          />
        </div>
        <div className="mt-4">
          <SunkCostTimeline />
        </div>
      </div>
    )
  }

  // Completed sprint — appreciation gate check
  if (sprint.status === 'completed') {
    const gatePassed = gate?.gate_passed ?? false

    if (!gatePassed) {
      return (
        <div className="px-5 pt-6 pb-24">
          <AppreciationGateView
            myNoteWritten={gate?.my_note_written ?? false}
            partnerNoteWritten={gate?.partner_note_written ?? false}
            partnerName={partnerName}
            onSubmitNote={submitNote}
          />
        </div>
      )
    }

    // Gate passed — show results + mercy rule prompt if applicable
    return (
      <div className="px-5 pt-6 pb-24">
        <SprintResultsView
          sprintId={sprint.id}
          myScore={sprint.my_score ?? 0}
          partnerScore={sprint.partner_score ?? 0}
          myName={myName}
          partnerName={partnerName}
          iWon={sprint.i_won}
          isTie={sprint.is_tie}
          myBreakdown={sprint.my_breakdown}
          partnerBreakdown={sprint.partner_breakdown}
          myNote={myNote}
          partnerNote={partnerNote}
        />
        {!sprint.i_won && !sprint.is_tie && (
          <MercyRulePrompt className="mt-4" />
        )}
      </div>
    )
  }

  // Fallback
  return (
    <div className="px-5 pt-6 pb-24">
      <EmptyState title="Sprint loading..." />
    </div>
  )
}
