import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'
import { ScoreComparison } from './ScoreComparison'
import { ScoreBreakdown } from './ScoreBreakdown'
import { DifficultyPicker } from './DifficultyPicker'
import { DailyProgressChart } from './DailyProgressChart'
import { KiraTaskSuggestions } from '@/components/kira/KiraTaskSuggestions'
import { supabase } from '@/lib/supabase'
import { formatWeekRange, getDaysRemainingInSprint } from '@/lib/dates'
import type { ScoreBreakdown as ScoreBreakdownType } from '@/hooks/useSprint'
import type { DifficultyLevel } from '@/types/habits'

interface SprintTaskWithTitle {
  id: string
  task_id: string
  difficulty_rating: DifficultyLevel
  task_title: string
}

interface ActiveSprintViewProps {
  sprintId: string
  userId: string
  partnerId: string | null
  weekStart: string
  myName: string
  partnerName: string
  myBreakdown: { breakdown: ScoreBreakdownType; total: number; tasks_due: number; tasks_completed: number } | null
  partnerBreakdown: { breakdown: ScoreBreakdownType; total: number } | null
  timezone: string
}

export function ActiveSprintView({
  sprintId,
  userId,
  partnerId,
  weekStart,
  myName,
  partnerName,
  myBreakdown,
  partnerBreakdown,
  timezone,
}: ActiveSprintViewProps) {
  const { toast } = useToast()
  const [expanded, setExpanded] = useState(false)
  const [tasks, setTasks] = useState<SprintTaskWithTitle[]>([])
  const daysRemaining = getDaysRemainingInSprint(weekStart, timezone)

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase
      .from('sprint_tasks')
      .select('id, task_id, difficulty_rating, tasks(title)')
      .eq('sprint_id', sprintId)
      .eq('user_id', userId)

    if (data) {
      setTasks(
        data.map((d: any) => ({
          id: d.id,
          task_id: d.task_id,
          difficulty_rating: d.difficulty_rating,
          task_title: d.tasks?.title ?? 'Unknown',
        })),
      )
    }
  }, [sprintId, userId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  async function handleDifficultyChange(sprintTaskId: string, level: DifficultyLevel) {
    setTasks((prev) =>
      prev.map((t) => (t.id === sprintTaskId ? { ...t, difficulty_rating: level } : t)),
    )
    await supabase.from('sprint_tasks').update({ difficulty_rating: level }).eq('id', sprintTaskId)
  }

  async function handleAcceptSuggestion(suggestion: { title: string; description: string; difficulty: DifficultyLevel }) {
    // 1. Create task in tasks table
    const { data: newTask, error: taskError } = await supabase
      .from('tasks')
      .insert({
        title: suggestion.title,
        description: suggestion.description,
        difficulty: suggestion.difficulty,
        task_type: 'one_time' as const,
        recurrence: 'daily' as const,
        user_id: userId,
      })
      .select('id')
      .single()

    if (taskError || !newTask) {
      toast('Failed to add task', 'error')
      return
    }

    // 2. Link to current sprint
    const { error: sprintTaskError } = await supabase.from('sprint_tasks').insert({
      sprint_id: sprintId,
      task_id: newTask.id,
      user_id: userId,
      difficulty_rating: suggestion.difficulty,
    })

    if (sprintTaskError) {
      toast('Task created but failed to add to sprint', 'error')
      return
    }

    toast('Task added to sprint!', 'success')
    fetchTasks()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">Sprint</h1>
          <p className="text-sm text-text-secondary">{formatWeekRange(weekStart)}</p>
        </div>
        <div className="text-right">
          <span className="font-accent text-2xl font-bold text-primary tabular-nums">
            {daysRemaining}
          </span>
          <p className="text-xs text-text-secondary">
            {daysRemaining === 1 ? 'day left' : 'days left'}
          </p>
        </div>
      </div>

      {/* Score comparison */}
      <Card>
        <ScoreComparison
          myScore={myBreakdown?.total ?? 0}
          partnerScore={partnerBreakdown?.total ?? 0}
          myName={myName}
          partnerName={partnerName}
        />
      </Card>

      {/* Daily progress chart */}
      <DailyProgressChart
        sprintId={sprintId}
        weekStart={weekStart}
        userId={userId}
        partnerId={partnerId}
      />

      {/* My breakdown (expandable) */}
      {myBreakdown && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium text-primary mb-2 active:scale-[0.98]"
          >
            {expanded ? 'Hide' : 'Show'} my breakdown
          </button>
          {expanded && (
            <ScoreBreakdown
              completion={myBreakdown.breakdown.completion}
              difficulty={myBreakdown.breakdown.difficulty}
              consistency={myBreakdown.breakdown.consistency}
              streak={myBreakdown.breakdown.streak}
              bonus={myBreakdown.breakdown.bonus}
              total={myBreakdown.breakdown.total}
            />
          )}
        </div>
      )}

      {/* Tasks with difficulty pickers */}
      {tasks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-secondary">My Tasks</h3>
            {myBreakdown && (
              <span className="font-accent text-sm font-bold text-text-primary tabular-nums">
                {myBreakdown.tasks_completed}/{myBreakdown.tasks_due}
              </span>
            )}
          </div>
          {tasks.map((task) => (
            <Card key={task.id} className="!py-3">
              <p className="text-sm font-medium text-text-primary mb-2 truncate">
                {task.task_title}
              </p>
              <DifficultyPicker
                value={task.difficulty_rating}
                onChange={(level) => handleDifficultyChange(task.id, level)}
              />
            </Card>
          ))}
        </div>
      )}

      {/* Kira task suggestions */}
      <KiraTaskSuggestions onAccept={handleAcceptSuggestion} />
    </div>
  )
}
