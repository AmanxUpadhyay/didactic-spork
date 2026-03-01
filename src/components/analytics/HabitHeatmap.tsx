import { m } from 'motion/react'
import type { DayCompletion } from '@/hooks/useAnalytics'
import { staggerContainer } from '@/lib/animations'

interface HabitHeatmapProps {
  grid: DayCompletion[]
  isGated: boolean
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function intensityClass(count: number): string {
  if (count === 0) return 'bg-border/40'
  if (count === 1) return 'bg-primary/20'
  if (count <= 3) return 'bg-primary/40'
  if (count <= 5) return 'bg-primary/60'
  return 'bg-primary'
}

export function HabitHeatmap({ grid, isGated }: HabitHeatmapProps) {
  // Show 28 days for gated, 84 for full
  const visibleCount = isGated ? 28 : 84
  const visibleGrid = grid.slice(-visibleCount)
  const gatedGrid = isGated ? grid.slice(0, 56) : []

  return (
    <div>
      <div className="flex gap-0.5 mb-1">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[9px] text-text-secondary font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Real data grid */}
      <m.div
        className="grid grid-cols-7 gap-0.5"
        variants={staggerContainer(0.008)}
        initial="hidden"
        animate="visible"
      >
        {visibleGrid.map((day) => (
          <m.div
            key={day.date}
            className={[
              'aspect-square rounded-sm',
              intensityClass(day.count),
            ].join(' ')}
            variants={{
              hidden: { opacity: 0, scale: 0.5 },
              visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 20 } },
            }}
            title={`${day.date}: ${day.count} completions`}
          />
        ))}
      </m.div>

      {/* Gated blur overlay */}
      {isGated && gatedGrid.length > 0 && (
        <div className="relative mt-0.5">
          <div className="grid grid-cols-7 gap-0.5 blur-sm pointer-events-none opacity-50">
            {gatedGrid.map((day) => (
              <div
                key={day.date}
                className={['aspect-square rounded-sm', intensityClass(day.count)].join(' ')}
              />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-surface/90 rounded-[var(--radius-card)] px-3 py-2 text-center shadow-md">
              <p className="text-xs font-semibold text-text-primary">
                Full history unlocks at In Sync 🌱
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-1 mt-2 justify-end">
        <span className="text-[9px] text-text-secondary">Less</span>
        {['bg-border/40', 'bg-primary/20', 'bg-primary/40', 'bg-primary/60', 'bg-primary'].map((c, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-sm ${c}`} />
        ))}
        <span className="text-[9px] text-text-secondary">More</span>
      </div>
    </div>
  )
}
