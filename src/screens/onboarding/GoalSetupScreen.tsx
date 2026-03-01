import { useState } from 'react'
import { m } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface GoalSetupScreenProps {
  userId: string
  onNext: () => void
  onSkip: () => void
}

type Difficulty = 'easy' | 'medium' | 'hard'

interface HabitRow {
  title: string
  difficulty: Difficulty
}

const DIFFICULTY_LABELS: Record<Difficulty, { label: string; color: string }> = {
  easy: { label: 'Easy', color: 'text-success' },
  medium: { label: 'Medium', color: 'text-warning' },
  hard: { label: 'Hard', color: 'text-error' },
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

export function GoalSetupScreen({ userId, onNext, onSkip }: GoalSetupScreenProps) {
  const [habits, setHabits] = useState<HabitRow[]>([
    { title: '', difficulty: 'medium' },
    { title: '', difficulty: 'medium' },
  ])
  const [saving, setSaving] = useState(false)

  const updateHabit = (i: number, patch: Partial<HabitRow>) => {
    setHabits((prev) => prev.map((h, idx) => (idx === i ? { ...h, ...patch } : h)))
  }

  const addRow = () => {
    if (habits.length < 3) {
      setHabits((prev) => [...prev, { title: '', difficulty: 'medium' }])
    }
  }

  const save = async () => {
    const toSave = habits.filter((h) => h.title.trim())
    if (toSave.length === 0) {
      onNext()
      return
    }
    setSaving(true)
    try {
      for (const h of toSave) {
        const { data: task } = await supabase
          .from('tasks')
          .insert({
            user_id: userId,
            title: h.title.trim(),
            task_type: 'habit',
            recurrence: 'daily',
            difficulty: h.difficulty,
          })
          .select('id')
          .single()

        if (task?.id) {
          await supabase.from('streaks').insert({
            user_id: userId,
            task_id: task.id,
            streak_type: 'individual',
          })
        }
      }
    } catch (err) {
      console.error('Failed to save habits:', err)
    } finally {
      setSaving(false)
      onNext()
    }
  }

  return (
    <div className="flex flex-col h-full px-6 pt-6 pb-10">
      {/* Skip */}
      <div className="flex justify-end mb-4">
        <button className="text-sm text-text-secondary" onClick={onSkip}>
          Skip
        </button>
      </div>

      <m.div
        className="flex-1 space-y-6"
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="visible"
      >
        <m.div variants={staggerItem} className="space-y-1">
          <h2 className="font-heading text-2xl font-bold text-text-primary">
            Set your first habits
          </h2>
          <p className="text-sm text-text-secondary">
            Add 1–3 habits you both want to track. You can always add more later.
          </p>
        </m.div>

        <m.div variants={staggerItem} className="space-y-3">
          {habits.map((habit, i) => (
            <div key={i} className="space-y-1.5">
              <Input
                placeholder={`Habit ${i + 1}`}
                value={habit.title}
                onChange={(e) => updateHabit(i, { title: e.target.value })}
              />
              {/* Difficulty selector */}
              <div className="flex gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => updateHabit(i, { difficulty: d })}
                    className={[
                      'flex-1 py-1 rounded-[var(--radius-small)] text-xs font-semibold border transition-colors',
                      habit.difficulty === d
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-text-secondary',
                    ].join(' ')}
                  >
                    {DIFFICULTY_LABELS[d].label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {habits.length < 3 && (
            <button
              className="w-full py-2 rounded-[var(--radius-card)] border border-dashed border-border text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors"
              onClick={addRow}
            >
              + Add another habit
            </button>
          )}
        </m.div>
      </m.div>

      <div className="space-y-2 mt-6">
        <Button size="lg" className="w-full" onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Continue'}
        </Button>
        <Button size="sm" variant="ghost" className="w-full text-text-secondary" onClick={onNext}>
          I'll add habits later
        </Button>
      </div>
    </div>
  )
}
