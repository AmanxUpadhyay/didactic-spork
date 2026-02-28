import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { DayPicker } from '@/components/ui/DayPicker'
import { useToast } from '@/components/ui/ToastProvider'
import { supabase } from '@/lib/supabase'
import type { DifficultyLevel, RecurrencePattern, Task, TaskType } from '@/types/habits'

interface HabitSheetProps {
  onClose: () => void
  userId: string
  editHabit?: Task
}

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: 'var(--color-success)' },
  { value: 'medium', label: 'Medium', color: 'var(--color-warning)' },
  { value: 'hard', label: 'Hard', color: 'var(--color-secondary)' },
  { value: 'legendary', label: 'Legend', color: 'var(--color-error)' },
]

export function HabitSheet({ onClose, userId, editHabit }: HabitSheetProps) {
  const isEdit = !!editHabit
  const { toast } = useToast()
  const [step, setStep] = useState<1 | 2>(1)
  const [title, setTitle] = useState(editHabit?.title ?? '')
  const [taskType, setTaskType] = useState<TaskType>(editHabit?.task_type ?? 'habit')
  const [recurrence, setRecurrence] = useState<RecurrencePattern>(editHabit?.recurrence ?? 'daily')
  const [customDays, setCustomDays] = useState<number[]>(editHabit?.custom_days ?? [])
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(editHabit?.difficulty ?? 'medium')
  const [ifTrigger, setIfTrigger] = useState(editHabit?.if_trigger ?? '')
  const [thenAction, setThenAction] = useState(editHabit?.then_action ?? '')
  const [showIntention, setShowIntention] = useState(
    !!(editHabit?.if_trigger || editHabit?.then_action),
  )
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    if (!title.trim()) return
    setSaving(true)

    if (isEdit) {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: title.trim(),
          task_type: taskType,
          recurrence,
          custom_days: recurrence === 'custom' ? customDays : null,
          difficulty,
          if_trigger: ifTrigger.trim() || null,
          then_action: thenAction.trim() || null,
        })
        .eq('id', editHabit.id)

      if (error) {
        toast(error.message, 'error')
        setSaving(false)
        return
      }

      toast('Habit updated!', 'success')
    } else {
      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          title: title.trim(),
          task_type: taskType,
          recurrence,
          custom_days: recurrence === 'custom' ? customDays : null,
          difficulty,
          if_trigger: ifTrigger.trim() || null,
          then_action: thenAction.trim() || null,
        })
        .select()
        .single()

      if (error) {
        toast(error.message, 'error')
        setSaving(false)
        return
      }

      // Create initial streak record
      if (task) {
        await supabase.from('streaks').insert({
          user_id: userId,
          task_id: task.id,
          streak_type: 'individual',
        })
      }

      toast('Habit created!', 'success')
    }

    setSaving(false)
    onClose()
  }

  return (
    <div className="space-y-5">
      <h2 className="font-heading text-xl font-semibold text-text-primary">
        {step === 1 ? (isEdit ? 'Edit Habit' : 'New Habit') : 'Details'}
      </h2>

      {step === 1 && (
        <div className="space-y-4">
          <Input
            label="What's the habit?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Type</label>
            <SegmentedControl
              options={[
                { value: 'habit' as TaskType, label: 'Habit' },
                { value: 'one_time' as TaskType, label: 'One-time' },
              ]}
              value={taskType}
              onChange={setTaskType}
            />
          </div>
          {taskType === 'habit' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Frequency</label>
              <SegmentedControl
                options={[
                  { value: 'daily' as RecurrencePattern, label: 'Daily' },
                  { value: 'weekdays' as RecurrencePattern, label: 'Weekdays' },
                  { value: 'custom' as RecurrencePattern, label: 'Custom' },
                ]}
                value={recurrence}
                onChange={setRecurrence}
              />
              {recurrence === 'custom' && (
                <DayPicker selected={customDays} onChange={setCustomDays} className="mt-2" />
              )}
            </div>
          )}
          <Button
            className="w-full"
            disabled={!title.trim()}
            onClick={() => setStep(2)}
          >
            Next
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Difficulty</label>
            <SegmentedControl
              options={DIFFICULTY_OPTIONS}
              value={difficulty}
              onChange={setDifficulty}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowIntention(!showIntention)}
            className="text-sm text-primary font-medium hover:underline"
          >
            {showIntention ? 'Hide' : 'Add'} implementation intention
          </button>

          {showIntention && (
            <div className="space-y-3">
              <Input
                label="If..."
                value={ifTrigger}
                onChange={(e) => setIfTrigger(e.target.value)}
                placeholder="e.g. it's 7am and I finish breakfast"
              />
              <Input
                label="Then I will..."
                value={thenAction}
                onChange={(e) => setThenAction(e.target.value)}
                placeholder="e.g. meditate for 10 minutes"
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
              {saving
                ? (isEdit ? 'Saving...' : 'Creating...')
                : (isEdit ? 'Save Changes' : 'Create Habit')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
