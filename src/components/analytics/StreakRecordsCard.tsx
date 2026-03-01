import { useState } from 'react'
import type { HabitStreakRecord } from '@/hooks/useAnalytics'

interface StreakRecordsCardProps {
  streaks: HabitStreakRecord[]
}

export function StreakRecordsCard({ streaks }: StreakRecordsCardProps) {
  const [showAll, setShowAll] = useState(false)

  if (streaks.length === 0) {
    return (
      <p className="text-sm text-text-secondary text-center py-2">
        No streaks yet — start tracking habits!
      </p>
    )
  }

  const visible = showAll ? streaks : streaks.slice(0, 5)

  return (
    <div className="space-y-2">
      {visible.map((h) => (
        <div key={h.taskId} className="flex items-center justify-between py-1">
          <span className="text-sm text-text-primary truncate max-w-[180px]">{h.title}</span>
          <div className="flex items-center gap-2 shrink-0">
            {h.currentDays > 0 && (
              <span className="text-xs text-primary font-semibold">
                {h.currentDays} now
              </span>
            )}
            <span className="text-xs font-bold text-text-primary bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              🔥 {h.bestDays}d best
            </span>
          </div>
        </div>
      ))}

      {streaks.length > 5 && (
        <button
          className="text-xs text-primary mt-1"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? 'Show less' : `+${streaks.length - 5} more`}
        </button>
      )}
    </div>
  )
}
