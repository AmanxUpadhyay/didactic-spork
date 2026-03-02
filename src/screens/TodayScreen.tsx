import { useState, useCallback, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useHabits } from '@/hooks/useHabits'
import { useCompletions } from '@/hooks/useCompletions'
import { useStreaks } from '@/hooks/useStreaks'
import { useSprint } from '@/hooks/useSprint'
import { useLiveScores } from '@/hooks/useLiveScores'
import { useToast } from '@/components/ui/ToastProvider'
import { EmptyState, ConfirmDialog, BottomSheet } from '@/components/ui'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { ConfettiCelebration } from '@/components/ui/ConfettiCelebration'
import { FeatureGate } from '@/components/ui/FeatureGate'
import { HabitList } from '@/components/habits/HabitList'
import { HabitCardSkeleton } from '@/components/habits/HabitCardSkeleton'
import { HabitActionMenu } from '@/components/habits/HabitActionMenu'
import { CoupleStreakBanner } from '@/components/habits/CoupleStreakBanner'
import { SprintStatusBanner } from '@/components/sprint/SprintStatusBanner'
import { StreakRescuePrompt } from '@/components/rescue/StreakRescuePrompt'
import { KiraMoodResponse } from '@/components/kira/KiraMoodResponse'
import { KiraExcuseVerdict } from '@/components/kira/KiraExcuseVerdict'
import { KiraAvatar } from '@/components/kira/KiraAvatar'
import { getTodayInTimezone, formatDateDisplay, isHabitDueToday, getDaysRemainingInSprint } from '@/lib/dates'
import { DecayingPointBank } from '@/components/psych/DecayingPointBank'
import { MondayHeadStart } from '@/components/psych/MondayHeadStart'
import { TomorrowTeaser } from '@/components/psych/TomorrowTeaser'
import { usePairing } from '@/contexts/PairingContext'
import { useDecayingPoints } from '@/hooks/useDecayingPoints'
import { useFreshStart } from '@/hooks/useFreshStart'
import { m } from 'motion/react'
import { useCelebration, kawaiiSpring, haptics } from '@/lib/animations'
import { useCatchUp } from '@/hooks/useCatchUp'
import { GracePeriodBanner } from '@/components/guardrails/GracePeriodBanner'
import { CatchUpIndicator } from '@/components/sprint/CatchUpIndicator'
import { MochiMoodStrip } from '@/components/ui/MochiMoodStrip'
import { ScrollPhysicsContainer } from '@/components/ui/ScrollPhysicsContainer'
import type { Task } from '@/types/habits'

interface TodayScreenProps {
  onEditHabit?: (habit: Task) => void
  onNavigateToSprint?: () => void
  onHabitComplete?: (completionId: string) => void
}

export function TodayScreen({ onEditHabit, onNavigateToSprint, onHabitComplete }: TodayScreenProps) {
  const { profile } = useAuth()
  const { partnerProfile } = usePairing()
  const tz = profile?.timezone || 'UTC'
  const { habits, loading: habitsLoading, archiveHabit, reorderHabits, refetch: refetchHabits } = useHabits(profile?.id)
  const { isCompletedToday, toggleCompletion } = useCompletions(profile?.id, tz)
  const { getStreakForTask, bestCoupleStreak } = useStreaks(profile?.id)
  const { toast } = useToast()

  const { sprint } = useSprint(profile?.id)
  const { myBreakdown, partnerBreakdown } = useLiveScores(
    profile?.id,
    sprint?.status === 'active' ? sprint?.id : undefined,
  )

  const [actionHabit, setActionHabit] = useState<Task | null>(null)
  const [confirmArchive, setConfirmArchive] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [moodSheetOpen, setMoodSheetOpen] = useState(false)
  const [excuseHabit, setExcuseHabit] = useState<Task | null>(null)

  const { bank } = useDecayingPoints()
  const { bonus, isMonday: isFreshStartMonday } = useFreshStart()
  const { celebrate } = useCelebration()
  const { tier: catchUpTier } = useCatchUp()

  // Entry-point confetti: fire once on load if already all-done
  const entryConfettiFiredRef = useRef(false)
  useEffect(() => {
    if (!habitsLoading && !entryConfettiFiredRef.current) {
      entryConfettiFiredRef.current = true
      if (dueHabits.length > 0 && completedCount === dueHabits.length) {
        celebrate('large')
        setShowConfetti(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitsLoading])

  const dismissConfetti = useCallback(() => setShowConfetti(false), [])

  const today = getTodayInTimezone(tz)
  const dueHabits = habits.filter((h) => isHabitDueToday(h.recurrence, h.custom_days, tz))
  const completedCount = dueHabits.filter((h) => isCompletedToday(h.id)).length
  const progress = dueHabits.length > 0 ? completedCount / dueHabits.length : 0

  const currentHour = new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: tz })
  const isEvening = parseInt(currentHour) >= 21
  // Rough count of tomorrow's habits (daily habits are always due)
  const tomorrowTaskCount = habits.filter((h) => !h.recurrence || h.recurrence === 'daily').length || dueHabits.length

  function isDue(task: Task) {
    return isHabitDueToday(task.recurrence, task.custom_days, tz)
  }

  async function handleToggle(taskId: string) {
    const result = await toggleCompletion(taskId)
    if (result.completed) {
      if (result.milestone) {
        // Streak milestones → escalating celebration intensities
        const streak = result.milestone
        if (streak >= 100) {
          celebrate('epic')
        } else if (streak >= 30) {
          celebrate('large')
        } else if (streak >= 7) {
          celebrate('medium')
        } else {
          celebrate('small')
        }
        toast(`${result.milestone}-day streak! Keep it up!`, 'success')
        setShowConfetti(true)
      } else {
        const msg = result.streak && result.streak > 1
          ? `Done! ${result.streak} day streak`
          : 'Done!'
        toast(msg, 'success')
      }

      // Check if all habits now complete
      const newCompleted = completedCount + 1
      if (newCompleted === dueHabits.length && dueHabits.length > 1) {
        entryConfettiFiredRef.current = true  // prevent double-fire from entry effect
        celebrate('large')
        setShowConfetti(true)
        toast('All done for today!', 'success')
      }
    }
  }

  function handleLongPress(habit: Task) {
    setActionHabit(habit)
  }

  function handleEdit() {
    if (actionHabit && onEditHabit) {
      onEditHabit(actionHabit)
    }
    setActionHabit(null)
  }

  function handleArchiveRequest() {
    setConfirmArchive(true)
  }

  function handleArchiveConfirm() {
    if (actionHabit) {
      archiveHabit(actionHabit.id)
      toast('Habit archived', 'success')
    }
    setConfirmArchive(false)
    setActionHabit(null)
  }

  if (habitsLoading) {
    return (
      <div className="px-5 pt-6 pb-24 space-y-3">
        <HabitCardSkeleton />
        <HabitCardSkeleton />
        <HabitCardSkeleton />
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 pb-24">
      <ConfettiCelebration show={showConfetti} onComplete={dismissConfetti} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-[var(--tracking-display)] text-text-primary">Today</h1>
          <p className="text-sm text-text-secondary">{formatDateDisplay(today)}</p>
        </div>
        {dueHabits.length > 0 && (
          <ProgressRing progress={progress} />
        )}
      </div>

      <div className="space-y-4">
      {/* Streak rescue prompt (if partner's streak is broken) */}
      <FeatureGate feature="couple_rescue" fallback={null}>
        <StreakRescuePrompt />
      </FeatureGate>

      {/* Grace period banner (self-contained) */}
      <GracePeriodBanner />

      {/* Catch-up indicator (trailing partner only) */}
      {catchUpTier > 0 && (
        <div className="flex justify-center">
          <CatchUpIndicator />
        </div>
      )}

      {/* Couple streak banner */}
      {bestCoupleStreak && (
        <CoupleStreakBanner
          streak={bestCoupleStreak}
          atRisk={completedCount === 0 && dueHabits.length > 0}
        />
      )}

      {/* Sprint banner */}
      {sprint?.status === 'active' && (
        <SprintStatusBanner
          myScore={myBreakdown?.total ?? 0}
          partnerScore={partnerBreakdown?.total ?? 0}
          myName={profile?.name || 'You'}
          partnerName={partnerProfile?.name || 'Partner'}
          daysRemaining={getDaysRemainingInSprint(sprint.week_start, tz)}
          onTap={onNavigateToSprint}
        />
      )}

      {/* Mochi mood strip */}
      {dueHabits.length > 0 && (
        <MochiMoodStrip
          progress={progress}
          remaining={dueHabits.length - completedCount}
          onMicroCelebrate={() => celebrate('micro' as any)}
        />
      )}

      {/* Decaying point bank (active sprint only) */}
      {sprint?.status === 'active' && bank && (
        <DecayingPointBank
          currentPoints={bank.currentPoints}
          initialPoints={bank.initialPoints}
          floorPoints={bank.floorPoints}
        />
      )}

      {/* Monday head start (Mondays only) */}
      {isFreshStartMonday && bonus && (
        <MondayHeadStart
          bonusPoints={bonus.bonusPoints}
          reason={bonus.reason}
        />
      )}

      {habits.length === 0 ? (
        <EmptyState
          title="No habits yet"
          description="Tap the + button to add your first habit"
        />
      ) : dueHabits.length === 0 ? (
        <EmptyState
          variant="all-done"
          title="Nothing due today"
          description="Enjoy your day off!"
        />
      ) : (
        <div data-no-tab-swipe>
          {completedCount === dueHabits.length && (
            <m.div
              initial={{ opacity: 0, scale: 0.8, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={kawaiiSpring}
              className="text-center mb-4"
            >
              <p className="font-accent text-2xl font-bold text-primary">All done today! ✨</p>
              <p className="text-xs text-text-secondary mt-0.5">You're on a roll</p>
            </m.div>
          )}
          <PullToRefresh onRefresh={async () => { await refetchHabits() }}>
            <ScrollPhysicsContainer>
            <HabitList
              habits={habits}
              isCompletedToday={isCompletedToday}
              isDueToday={isDue}
              getStreak={getStreakForTask}
              onToggle={handleToggle}
              onLongPress={handleLongPress}
              onComplete={onHabitComplete}
              onReorder={reorderHabits}
              onDelete={(id) => { archiveHabit(id); toast('Habit removed', 'success') }}
              focusedHabitId={actionHabit?.id}
            />
            </ScrollPhysicsContainer>
          </PullToRefresh>
        </div>
      )}

      {/* Tomorrow teaser (after 9PM) */}
      {isEvening && <TomorrowTeaser tomorrowTaskCount={tomorrowTaskCount} />}

      {/* Mood check-in entry point */}
      <m.button
        onClick={() => setMoodSheetOpen(true)}
        whileTap={{ scale: 0.96 }}
        transition={kawaiiSpring}
        onPointerDown={() => haptics.light()}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
      >
        <KiraAvatar mood="empathetic" size="sm" />
        <span className="text-sm font-medium text-primary">Mood check-in</span>
      </m.button>
      </div>{/* end space-y-4 */}

      <HabitActionMenu
        open={!!actionHabit && !confirmArchive}
        onClose={() => setActionHabit(null)}
        habitTitle={actionHabit?.title ?? ''}
        isCompletedToday={actionHabit ? isCompletedToday(actionHabit.id) : false}
        onEdit={handleEdit}
        onArchive={handleArchiveRequest}
        onExcuse={() => {
          setExcuseHabit(actionHabit)
          setActionHabit(null)
        }}
      />

      <ConfirmDialog
        open={confirmArchive}
        onClose={() => {
          setConfirmArchive(false)
          setActionHabit(null)
        }}
        title="Archive habit?"
        message={`"${actionHabit?.title}" will be removed from your daily list. Your streak data is kept.`}
        confirmLabel="Archive"
        cancelLabel="Keep"
        onConfirm={handleArchiveConfirm}
        destructive
      />

      <BottomSheet open={moodSheetOpen} onClose={() => setMoodSheetOpen(false)}>
        <div className="px-5 py-4">
          <KiraMoodResponse onComplete={() => setMoodSheetOpen(false)} />
        </div>
      </BottomSheet>

      <BottomSheet open={!!excuseHabit} onClose={() => setExcuseHabit(null)}>
        <div className="px-5 py-4">
          {excuseHabit && (
            <KiraExcuseVerdict
              taskId={excuseHabit.id}
              taskTitle={excuseHabit.title}
              onClose={() => setExcuseHabit(null)}
            />
          )}
        </div>
      </BottomSheet>
    </div>
  )
}
