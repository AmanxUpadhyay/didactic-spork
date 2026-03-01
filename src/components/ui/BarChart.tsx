import { m } from 'motion/react'
import { cn } from '@/lib/cn'
import { useReducedMotion, kawaiiSpring } from '@/lib/animations'

interface BarChartBar {
  label: string
  value: number
  completed?: boolean
}

interface BarChartProps {
  bars: BarChartBar[]
  maxValue?: number
  height?: number
  className?: string
}

export function BarChart({ bars, maxValue: maxProp, height = 160, className }: BarChartProps) {
  const maxValue = maxProp ?? Math.max(...bars.map((b) => b.value), 1)
  const reducedMotion = useReducedMotion()

  return (
    <div className={cn('flex items-end gap-2', className)} style={{ height }}>
      {bars.map((bar, i) => {
        const pct = Math.max((bar.value / maxValue) * 100, 4)
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1 h-full justify-end">
            {bar.completed && (
              <span className="text-xs" role="img" aria-label="completed">
                ✨
              </span>
            )}
            {bar.value > 0 && (
              <span className="font-accent text-xs font-bold text-text-secondary">{bar.value}</span>
            )}
            <m.div
              className="relative w-full min-w-[28px] rounded-t-[var(--radius-small)]"
              style={{
                height: `${pct}%`,
                background: `linear-gradient(to top, var(--color-chart-a), var(--color-chart-b))`,
                originY: 1,
              }}
              initial={reducedMotion ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={reducedMotion ? { duration: 0 } : {
                ...kawaiiSpring,
                delay: i * 0.06,
              }}
            />
            <span className="text-xs text-text-secondary font-medium truncate max-w-full">
              {bar.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
