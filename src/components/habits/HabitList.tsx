import { HabitCard } from './HabitCard'
import type { Task, Streak } from '@/types/habits'

interface HabitListProps {
  habits: Task[]
  isCompletedToday: (taskId: string) => boolean
  isDueToday: (task: Task) => boolean
  getStreak: (taskId: string) => Streak | null
  onToggle: (taskId: string) => void
  onComplete?: (taskId: string) => void
  onLongPress?: (habit: Task) => void
}

export function HabitList({ habits, isCompletedToday, isDueToday, getStreak, onToggle, onComplete, onLongPress }: HabitListProps) {
  // Sort: due + pending first, then due + completed, then not due
  const sorted = [...habits].sort((a, b) => {
    const aDue = isDueToday(a)
    const bDue = isDueToday(b)
    const aDone = isCompletedToday(a.id)
    const bDone = isCompletedToday(b.id)

    if (aDue && !bDue) return -1
    if (!aDue && bDue) return 1
    if (aDone && !bDone) return 1
    if (!aDone && bDone) return -1
    return 0
  })

  return (
    <div className="space-y-3">
      {sorted.map((habit) => (
        <HabitCard
          key={habit.id}
          title={habit.title}
          difficulty={habit.difficulty}
          completed={isCompletedToday(habit.id)}
          streak={getStreak(habit.id)}
          isDueToday={isDueToday(habit)}
          onToggle={() => onToggle(habit.id)}
          onComplete={onComplete ? () => onComplete(habit.id) : undefined}
          onLongPress={onLongPress ? () => onLongPress(habit) : undefined}
          ifTrigger={habit.if_trigger ?? undefined}
          thenAction={habit.then_action ?? undefined}
        />
      ))}
    </div>
  )
}
