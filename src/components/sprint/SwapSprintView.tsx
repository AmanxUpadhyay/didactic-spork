import { Card } from '@/components/ui'

interface SwapSprintViewProps {
  sprintId: string
  userId: string
  partnerId: string | null
  weekStart?: string
  myName: string
  partnerName: string
  partnerHabits?: { title: string; completed: boolean }[]
  myScore?: number
  timezone?: string
}

export function SwapSprintView({
  partnerName,
  partnerHabits = [],
  myScore = 0,
}: SwapSprintViewProps) {
  const completed = partnerHabits.filter((h) => h.completed).length
  const total = partnerHabits.length

  return (
    <div className="space-y-4">
      <Card className="!bg-violet-50 dark:!bg-violet-950/20 border border-violet-200 dark:border-violet-800">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔄</span>
          <div>
            <p className="text-sm font-medium text-violet-700 dark:text-violet-400">
              Swap Week
            </p>
            <p className="text-xs text-violet-600/80 dark:text-violet-500/80">
              You're doing {partnerName}'s habits this week!
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <p className="text-sm font-medium text-text-primary mb-3">
          {partnerName}'s Habits ({completed}/{total})
        </p>
        <div className="space-y-2">
          {partnerHabits.map((habit, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 p-2 rounded-lg ${
                habit.completed
                  ? 'bg-green-50 dark:bg-green-950/20'
                  : 'bg-surface-secondary'
              }`}
            >
              <span className="text-sm">{habit.completed ? '✅' : '⬜'}</span>
              <span className={`text-sm ${habit.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                {habit.title}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="text-center">
        <p className="text-xs text-text-secondary">Your Score So Far</p>
        <p className="text-2xl font-bold text-text-primary mt-1">{myScore.toFixed(0)}</p>
      </Card>
    </div>
  )
}
