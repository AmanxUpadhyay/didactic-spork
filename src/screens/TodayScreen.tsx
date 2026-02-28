import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useHabits } from '@/hooks/useHabits'
import { useCompletions } from '@/hooks/useCompletions'
import { useStreaks } from '@/hooks/useStreaks'
import { useToast } from '@/components/ui/ToastProvider'
import { EmptyState, ConfirmDialog } from '@/components/ui'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { HabitList } from '@/components/habits/HabitList'
import { HabitCardSkeleton } from '@/components/habits/HabitCardSkeleton'
import { HabitActionMenu } from '@/components/habits/HabitActionMenu'
import { getTodayInTimezone, formatDateDisplay, isHabitDueToday } from '@/lib/dates'
import type { Task } from '@/types/habits'

interface TodayScreenProps {
  onEditHabit?: (habit: Task) => void
}

export function TodayScreen({ onEditHabit }: TodayScreenProps) {
  const { profile } = useAuth()
  const tz = profile?.timezone || 'UTC'
  const { habits, loading: habitsLoading, archiveHabit } = useHabits(profile?.id)
  const { isCompletedToday, toggleCompletion } = useCompletions(profile?.id, tz)
  const { getStreakForTask } = useStreaks(profile?.id)
  const { toast } = useToast()

  const [actionHabit, setActionHabit] = useState<Task | null>(null)
  const [confirmArchive, setConfirmArchive] = useState(false)

  const today = getTodayInTimezone(tz)
  const dueHabits = habits.filter((h) => isHabitDueToday(h.recurrence, h.custom_days, tz))
  const completedCount = dueHabits.filter((h) => isCompletedToday(h.id)).length
  const progress = dueHabits.length > 0 ? completedCount / dueHabits.length : 0

  function isDue(task: Task) {
    return isHabitDueToday(task.recurrence, task.custom_days, tz)
  }

  async function handleToggle(taskId: string) {
    const result = await toggleCompletion(taskId)
    if (result.completed) {
      const msg = result.streak && result.streak > 1
        ? `Done! ${result.streak} day streak`
        : 'Done!'
      toast(msg, 'success')
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">Today</h1>
          <p className="text-sm text-text-secondary">{formatDateDisplay(today)}</p>
        </div>
        {dueHabits.length > 0 && (
          <ProgressRing progress={progress} />
        )}
      </div>

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
        <HabitList
          habits={habits}
          isCompletedToday={isCompletedToday}
          isDueToday={isDue}
          getStreak={getStreakForTask}
          onToggle={handleToggle}
          onLongPress={handleLongPress}
        />
      )}

      {dueHabits.length > 0 && completedCount === dueHabits.length && (
        <div className="mt-6 text-center">
          <p className="font-heading text-lg font-semibold text-primary animate-[bouncy_600ms_var(--ease-bouncy)]">
            All done for today!
          </p>
        </div>
      )}

      <HabitActionMenu
        open={!!actionHabit && !confirmArchive}
        onClose={() => setActionHabit(null)}
        habitTitle={actionHabit?.title ?? ''}
        onEdit={handleEdit}
        onArchive={handleArchiveRequest}
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
    </div>
  )
}
