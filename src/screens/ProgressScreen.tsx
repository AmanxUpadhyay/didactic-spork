import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useHabits } from '@/hooks/useHabits'
import { useStreaks } from '@/hooks/useStreaks'
import { supabase } from '@/lib/supabase'
import { Card, EmptyState, WeeklyGrid, BarChart } from '@/components/ui'
import { StreakCounter } from '@/components/ui/StreakCounter'
import { getTodayInTimezone, getWeekDates } from '@/lib/dates'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function ProgressScreen() {
  const { profile } = useAuth()
  const tz = profile?.timezone || 'UTC'
  const { habits } = useHabits(profile?.id)
  const { getStreakForTask } = useStreaks(profile?.id)
  const [weekCompletions, setWeekCompletions] = useState<Record<string, number>>({})

  const weekDates = getWeekDates(tz)
  const today = getTodayInTimezone(tz)

  useEffect(() => {
    if (!profile?.id || weekDates.length === 0) return

    async function fetchWeekData() {
      const { data } = await supabase
        .from('habit_completions')
        .select('completed_date')
        .eq('user_id', profile!.id)
        .gte('completed_date', weekDates[0])
        .lte('completed_date', weekDates[6])

      if (data) {
        const counts: Record<string, number> = {}
        for (const row of data) {
          counts[row.completed_date] = (counts[row.completed_date] || 0) + 1
        }
        setWeekCompletions(counts)
      }
    }
    fetchWeekData()
  }, [profile?.id, weekDates[0], weekDates[6]])

  const weeklyGridDays = weekDates.map((date, i) => ({
    label: DAY_LABELS[i] as string,
    completed: (weekCompletions[date] || 0) > 0,
  }))

  const barChartData = weekDates.map((date, i) => ({
    label: DAY_LABELS[i] as string,
    value: weekCompletions[date] || 0,
    completed: date < today || (date === today && (weekCompletions[date] || 0) > 0),
  }))

  const habitsWithStreaks = habits
    .map((h) => ({ habit: h, streak: getStreakForTask(h.id) }))
    .filter((h) => h.streak)

  if (habits.length === 0) {
    return (
      <div className="px-5 pt-6 pb-24">
        <EmptyState
          title="No progress yet"
          description="Create some habits to track your progress"
        />
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 pb-24 space-y-4">
      <h1 className="font-heading text-2xl font-semibold text-text-primary">Your Progress</h1>

      <Card>
        <h2 className="font-heading text-base font-semibold text-text-primary mb-3">This Week</h2>
        <WeeklyGrid days={weeklyGridDays} />
      </Card>

      {habitsWithStreaks.length > 0 && (
        <Card>
          <h2 className="font-heading text-base font-semibold text-text-primary mb-3">Streaks</h2>
          <div className="space-y-3">
            {habitsWithStreaks.map(({ habit, streak }) => (
              <div key={habit.id} className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-primary truncate flex-1">{habit.title}</p>
                <StreakCounter
                  current={streak!.current_days}
                  best={streak!.best_days}
                  freezeAvailable={streak!.freeze_available}
                  showBest
                  size="sm"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h2 className="font-heading text-base font-semibold text-text-primary mb-3">Completions This Week</h2>
        <BarChart bars={barChartData} height={120} />
      </Card>
    </div>
  )
}
