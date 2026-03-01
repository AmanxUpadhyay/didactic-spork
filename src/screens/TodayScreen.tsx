import { useState, useCallback } from 'react'
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
import { StreakHostageDisplay } from '@/components/psych/StreakHostageDisplay'
import { useDecayingPoints } from '@/hooks/useDecayingPoints'
import { useFreshStart } from '@/hooks/useFreshStart'
import type { Task } from '@/types/habits'

interface TodayScreenProps {
  onEditHabit?: (habit: Task) => void
  onNavigateToSprint?: () => void
  onHabitComplete?: (completionId: string) => void
}

export function TodayScreen({ onEditHabit, onNavigateToSprint, onHabitComplete }: TodayScreenProps) {
  const { profile } = useAuth()
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
        toast(`${result.milestone}-day streak! Keep it up!`, 'success')
        setShowConfetti(true)
      } else {
        const msg = result.streak && result.streak > 1
          ? `Done! ${result.streak} day streak`
          : 'Done!'
        toast(msg, 'success')
      }

      // Check if all habits now complete (need +1 since state may not have updated yet)
      const newCompleted = completedCount + 1
      if (newCompleted === dueHabits.length && dueHabits.length > 1) {
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
          <h1 className="font-heading text-2xl font-semibold text-text-primary">Today</h1>
          <p className="text-sm text-text-secondary">{formatDateDisplay(today)}</p>
        </div>
        {dueHabits.length > 0 && (
          <ProgressRing progress={progress} />
        )}
      </div>

      {/* Streak rescue prompt (if partner's streak is broken) */}
      <FeatureGate feature="couple_rescue">
        <StreakRescuePrompt className="mb-4" />
      </FeatureGate>

      {/* Couple streak banner */}
      {bestCoupleStreak && (
        <CoupleStreakBanner streak={bestCoupleStreak} className="mb-4" />
      )}

      {/* Streak hostage display */}
      {bestCoupleStreak && bestCoupleStreak.current_days > 0 && (
        <StreakHostageDisplay
          streak={bestCoupleStreak.current_days}
          atRisk={completedCount === 0 && dueHabits.length > 0}
          className="mb-4"
        />
      )}

      {/* Sprint banner */}
      {sprint?.status === 'active' && (
        <SprintStatusBanner
          myScore={myBreakdown?.total ?? 0}
          partnerScore={partnerBreakdown?.total ?? 0}
          daysRemaining={getDaysRemainingInSprint(sprint.week_start, tz)}
          onTap={onNavigateToSprint}
          className="mb-4"
        />
      )}

      {/* Decaying point bank (active sprint only) */}
      {sprint?.status === 'active' && bank && (
        <DecayingPointBank
          currentPoints={bank.currentPoints}
          initialPoints={bank.initialPoints}
          floorPoints={bank.floorPoints}
          className="mb-4"
        />
      )}

      {/* Monday head start (Mondays only) */}
      {isFreshStartMonday && bonus && (
        <MondayHeadStart
          bonusPoints={bonus.bonusPoints}
          reason={bonus.reason}
          className="mb-4"
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
        <PullToRefresh onRefresh={async () => { await refetchHabits() }}>
          <HabitList
            habits={habits}
            isCompletedToday={isCompletedToday}
            isDueToday={isDue}
            getStreak={getStreakForTask}
            onToggle={handleToggle}
            onLongPress={handleLongPress}
            onComplete={onHabitComplete}
            onReorder={reorderHabits}
          />
        </PullToRefresh>
      )}

      {dueHabits.length > 0 && completedCount === dueHabits.length && (
        <div className="mt-6 text-center">
          <p className="font-heading text-lg font-semibold text-primary animate-[bouncy_600ms_var(--ease-bouncy)]">
            All done for today!
          </p>
        </div>
      )}

      {/* Tomorrow teaser (after 9PM) */}
      {isEvening && <TomorrowTeaser tomorrowTaskCount={tomorrowTaskCount} className="mt-4" />}

      {/* Mood check-in entry point */}
      <button
        onClick={() => setMoodSheetOpen(true)}
        className="w-full flex items-center gap-3 mt-4 px-4 py-3 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
      >
        <KiraAvatar mood="empathetic" size="sm" />
        <span className="text-sm font-medium text-primary">Mood check-in</span>
      </button>

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
