import { useState, useEffect } from 'react'
import { m, Reorder } from 'motion/react'
import { HabitCard } from './HabitCard'
import { staggerContainer, staggerItem, kawaiiSpring } from '@/lib/animations'
import type { Task, Streak } from '@/types/habits'

interface HabitListProps {
  habits: Task[]
  isCompletedToday: (taskId: string) => boolean
  isDueToday: (task: Task) => boolean
  getStreak: (taskId: string) => Streak | null
  onToggle: (taskId: string) => void
  onComplete?: (taskId: string) => void
  onLongPress?: (habit: Task) => void
  onReorder?: (orderedHabits: Task[]) => void
}

export function HabitList({ habits, isCompletedToday, isDueToday, getStreak, onToggle, onComplete, onLongPress, onReorder }: HabitListProps) {
  // Local order state for drag-to-reorder
  const [orderedHabits, setOrderedHabits] = useState<Task[]>([])

  // Sort initially: due + pending first, then completed, then not due
  useEffect(() => {
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
    setOrderedHabits(sorted)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits.length])

  function handleReorder(newOrder: Task[]) {
    setOrderedHabits(newOrder)
    onReorder?.(newOrder)
  }

  if (!onReorder) {
    // Non-reorderable: use stagger animation
    return (
      <m.div
        className="space-y-3"
        variants={staggerContainer(0.07)}
        initial="hidden"
        animate="visible"
      >
        {orderedHabits.map((habit) => (
          <m.div key={habit.id} variants={staggerItem}>
            <HabitCard
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
          </m.div>
        ))}
      </m.div>
    )
  }

  // Reorderable version
  return (
    <Reorder.Group
      axis="y"
      values={orderedHabits}
      onReorder={handleReorder}
      className="space-y-3"
    >
      {orderedHabits.map((habit) => (
        <Reorder.Item
          key={habit.id}
          value={habit}
          whileDrag={{
            scale: 1.04,
            boxShadow: `0 12px 40px color-mix(in srgb, var(--color-primary) 25%, transparent)`,
            zIndex: 10,
            cursor: 'grabbing',
          }}
          transition={kawaiiSpring}
          style={{ listStyle: 'none' }}
        >
          <HabitCard
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
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )
}
