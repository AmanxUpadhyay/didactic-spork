import { useMemo } from 'react'
import type { SprintTrendPoint } from '@/hooks/useAnalytics'
import { buildSplinePath } from '@/lib/chartUtils'

interface SprintTrendChartProps {
  points: SprintTrendPoint[]
  height?: number
}

export function SprintTrendChart({ points, height = 120 }: SprintTrendChartProps) {
  const padding = { top: 12, right: 8, bottom: 28, left: 8 }
  const width = 320

  const { myPath, partnerPath, dots } = useMemo(() => {
    if (points.length === 0) {
      return { myPath: '', partnerPath: '', dots: { my: [], partner: [] } }
    }
    const allScores = points.flatMap((p) => [p.myScore, p.partnerScore])
    const maxVal = Math.max(...allScores, 1)
    const plotW = width - padding.left - padding.right
    const plotH = height - padding.top - padding.bottom

    const toCoord = (score: number, i: number) => ({
      x: padding.left + (i / Math.max(points.length - 1, 1)) * plotW,
      y: padding.top + plotH - (score / maxVal) * plotH,
    })

    const myPts = points.map((p, i) => toCoord(p.myScore, i))
    const partnerPts = points.map((p, i) => toCoord(p.partnerScore, i))

    return {
      myPath: buildSplinePath(myPts),
      partnerPath: buildSplinePath(partnerPts),
      dots: { my: myPts, partner: partnerPts },
    }
  }, [points, height])

  const formatWeek = (weekStart: string) => {
    const d = new Date(weekStart)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  if (points.length === 0) {
    return (
      <p className="text-sm text-text-secondary text-center py-4">
        No completed sprints yet
      </p>
    )
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* My score path */}
        {myPath && (
          <path
            d={myPath}
            fill="none"
            stroke="var(--color-chart-a)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {/* Partner score path */}
        {partnerPath && (
          <path
            d={partnerPath}
            fill="none"
            stroke="var(--color-chart-b)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 3"
          />
        )}
        {/* My dots */}
        {dots.my.map((d, i) => (
          <circle
            key={`my-${i}`}
            cx={d.x}
            cy={d.y}
            r="4"
            fill="var(--color-chart-a)"
            stroke="var(--color-surface)"
            strokeWidth="2"
          />
        ))}
        {/* Partner dots */}
        {dots.partner.map((d, i) => (
          <circle
            key={`p-${i}`}
            cx={d.x}
            cy={d.y}
            r="4"
            fill="var(--color-chart-b)"
            stroke="var(--color-surface)"
            strokeWidth="2"
          />
        ))}
      </svg>

      {/* Week labels */}
      <div className="flex justify-between px-2">
        {points.map((p, i) => (
          <span key={i} className="text-[9px] text-text-secondary">
            {formatWeek(p.weekStart)}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-[var(--color-chart-a)] rounded" />
          <span className="text-xs text-text-secondary">You</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-[var(--color-chart-b)] rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, var(--color-chart-b) 0, var(--color-chart-b) 4px, transparent 4px, transparent 7px)' }} />
          <span className="text-xs text-text-secondary">Partner</span>
        </div>
      </div>
    </div>
  )
}
