import { useState, useEffect } from 'react'
import { m, useMotionValue, useTransform, AnimatePresence } from 'motion/react'
import { supabase } from '@/lib/supabase'
import { haptics, kawaiiSpring } from '@/lib/animations'
import { cn } from '@/lib/cn'

interface CompletedTask {
  id: string
  title: string
  difficulty: string
  completed_date: string
}

interface SprintTaskStackProps {
  weekStart: string
  className?: string
}

export function SprintTaskStack({ weekStart, className }: SprintTaskStackProps) {
  const [tasks, setTasks] = useState<CompletedTask[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [decisions, setDecisions] = useState<Record<string, 'done' | 'review'>>({})
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    async function fetchCompletions() {
      // Build week date range (7 days from weekStart)
      const start = new Date(weekStart)
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      const endStr = end.toISOString().slice(0, 10)

      const { data, error } = await supabase
        .from('habit_completions')
        .select('id, completed_date, tasks(id, title, difficulty)')
        .gte('completed_date', weekStart)
        .lte('completed_date', endStr)
        .order('completed_date', { ascending: true })
        .limit(30)

      if (error || !data) return

      const mapped: CompletedTask[] = data
        .filter((row) => row.tasks)
        .map((row) => ({
          id: row.id,
          title: (row.tasks as any).title ?? 'Habit',
          difficulty: (row.tasks as any).difficulty ?? 'easy',
          completed_date: row.completed_date ?? weekStart,
        }))

      // Deduplicate by task title (show each habit once)
      const seen = new Set<string>()
      const unique = mapped.filter((t) => {
        if (seen.has(t.title)) return false
        seen.add(t.title)
        return true
      })
      setTasks(unique)
    }

    fetchCompletions()
  }, [weekStart])

  function decide(decision: 'done' | 'review') {
    const task = tasks[currentIdx]
    if (!task) return
    setDecisions((prev) => ({ ...prev, [task.id]: decision }))
    haptics.light()
    if (currentIdx >= tasks.length - 1) {
      setComplete(true)
    } else {
      setCurrentIdx((i) => i + 1)
    }
  }

  if (tasks.length === 0) return null

  const doneCount = Object.values(decisions).filter((d) => d === 'done').length
  const reviewCount = Object.values(decisions).filter((d) => d === 'review').length

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold text-text-primary">
          Sprint Review
        </h3>
        <span className="text-xs text-text-secondary">
          {currentIdx + 1} / {tasks.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {complete ? (
          <m.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={kawaiiSpring}
            className="rounded-[var(--radius-card)] bg-primary/5 border-2 border-primary/20 p-5 text-center"
          >
            <p className="text-2xl mb-2">🎉</p>
            <p className="font-heading font-semibold text-text-primary">Review complete!</p>
            <div className="flex justify-center gap-6 mt-3">
              <div className="text-center">
                <p className="font-accent text-xl font-bold text-success">{doneCount}</p>
                <p className="text-xs text-text-secondary">Done ✓</p>
              </div>
              <div className="text-center">
                <p className="font-accent text-xl font-bold text-warning">{reviewCount}</p>
                <p className="text-xs text-text-secondary">To review</p>
              </div>
            </div>
          </m.div>
        ) : (
          <div className="relative h-40" style={{ perspective: '800px', perspectiveOrigin: 'center center' }}>
            {/* Stack peek — next 2 cards shown behind */}
            {[2, 1].map((offset) => {
              const idx = currentIdx + offset
              const card = tasks[idx]
              if (!card) return null
              return (
                <div
                  key={idx}
                  className="absolute inset-x-0 rounded-[var(--radius-card)] bg-surface border-2 border-border"
                  style={{
                    top: `${offset * 6}px`,
                    transform: `scale(${1 - offset * 0.04})`,
                    opacity: 1 - offset * 0.25,
                    zIndex: 10 - offset,
                  }}
                />
              )
            })}

            {/* Active top card */}
            <AnimatePresence>
              {tasks[currentIdx] && (
                <SwipeCard
                  key={tasks[currentIdx]!.id}
                  task={tasks[currentIdx]!}
                  onDecide={decide}
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>

      {!complete && (
        <div className="flex gap-3">
          <button
            onClick={() => decide('review')}
            className="flex-1 py-2.5 rounded-[var(--radius-pill)] border-2 border-warning/40 text-warning text-sm font-medium"
          >
            🔍 Needs work
          </button>
          <button
            onClick={() => decide('done')}
            className="flex-1 py-2.5 rounded-[var(--radius-pill)] bg-success/15 border-2 border-success/40 text-success text-sm font-medium"
          >
            ✓ Done
          </button>
        </div>
      )}

      <p className="text-xs text-text-tertiary text-center">Swipe right = done · Swipe left = review</p>
    </div>
  )
}

interface SwipeCardProps {
  task: CompletedTask
  onDecide: (d: 'done' | 'review') => void
}

function SwipeCard({ task, onDecide }: SwipeCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-160, 0, 160], [-12, 0, 12])
  const doneOpacity = useTransform(x, [20, 120], [0, 1])
  const reviewOpacity = useTransform(x, [-120, -20], [1, 0])
  const cardOpacity = useTransform(x, [-200, -160, 0, 160, 200], [0, 1, 1, 1, 0])

  const DIFFICULTY_COLORS: Record<string, string> = {
    easy: 'text-text-tertiary',
    medium: 'text-secondary',
    hard: 'text-primary',
    legendary: 'text-amber-500',
  }

  return (
    <m.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      style={{ x, rotate, opacity: cardOpacity, position: 'absolute', inset: 0, zIndex: 20 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120 || info.velocity.x > 600) {
          onDecide('done')
        } else if (info.offset.x < -120 || info.velocity.x < -600) {
          onDecide('review')
        }
      }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
      className="rounded-[var(--radius-card)] bg-surface border-2 border-border shadow-[var(--shadow-elevated)] p-4 cursor-grab active:cursor-grabbing select-none"
    >
      {/* DONE stamp */}
      <m.div
        style={{ opacity: doneOpacity }}
        className="absolute top-3 right-3 rotate-12 border-2 border-success rounded-lg px-2 py-0.5 pointer-events-none"
      >
        <span className="text-success text-xs font-bold tracking-widest">DONE ✓</span>
      </m.div>

      {/* REVIEW stamp */}
      <m.div
        style={{ opacity: reviewOpacity }}
        className="absolute top-3 left-3 -rotate-12 border-2 border-warning rounded-lg px-2 py-0.5 pointer-events-none"
      >
        <span className="text-warning text-xs font-bold tracking-widest">REVIEW 🔍</span>
      </m.div>

      <div className="flex flex-col justify-between h-full">
        <p className="font-heading font-semibold text-text-primary text-base mt-4">
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className={cn('text-xs font-medium capitalize', DIFFICULTY_COLORS[task.difficulty] ?? 'text-text-secondary')}>
            {task.difficulty}
          </span>
          <span className="text-xs text-text-secondary">·</span>
          <span className="text-xs text-text-secondary">
            {new Date(task.completed_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </m.div>
  )
}
