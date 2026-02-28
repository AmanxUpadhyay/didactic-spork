import { useMemo } from 'react'
import { cn } from '@/lib/cn'

interface LineChartPoint {
  label: string
  value: number
}

interface LineChartProps {
  points: LineChartPoint[]
  height?: number
  className?: string
}

function buildSplinePath(pts: { x: number; y: number }[], tension = 0.4): string {
  if (pts.length < 2) return ''
  const d = [`M ${pts[0]!.x} ${pts[0]!.y}`]
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)]!
    const p1 = pts[i]!
    const p2 = pts[i + 1]!
    const p3 = pts[Math.min(i + 2, pts.length - 1)]!
    const cp1x = p1.x + ((p2.x - p0.x) * tension) / 3
    const cp1y = p1.y + ((p2.y - p0.y) * tension) / 3
    const cp2x = p2.x - ((p3.x - p1.x) * tension) / 3
    const cp2y = p2.y - ((p3.y - p1.y) * tension) / 3
    d.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`)
  }
  return d.join(' ')
}

export function LineChart({ points, height = 140, className }: LineChartProps) {
  const padding = { top: 16, right: 12, bottom: 24, left: 12 }
  const width = 320

  const { linePath, areaPath, dots } = useMemo(() => {
    if (points.length === 0) return { linePath: '', areaPath: '', dots: [] }
    const maxVal = Math.max(...points.map((p) => p.value), 1)
    const plotW = width - padding.left - padding.right
    const plotH = height - padding.top - padding.bottom

    const pts = points.map((p, i) => ({
      x: padding.left + (i / Math.max(points.length - 1, 1)) * plotW,
      y: padding.top + plotH - (p.value / maxVal) * plotH,
    }))

    const line = buildSplinePath(pts)
    const lastPt = pts[pts.length - 1]!
    const firstPt = pts[0]!
    const area = `${line} L ${lastPt.x} ${height - padding.bottom} L ${firstPt.x} ${height - padding.bottom} Z`
    return { linePath: line, areaPath: area, dots: pts }
  }, [points, height])

  return (
    <div className={cn('w-full', className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="line-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-a)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-chart-a)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {areaPath && <path d={areaPath} fill="url(#line-fill)" />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="var(--color-chart-a)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r="5"
            fill="var(--color-chart-a)"
            stroke="var(--color-surface)"
            strokeWidth="3"
          />
        ))}
      </svg>
      <div className="flex justify-between px-3">
        {points.map((p, i) => (
          <span key={i} className="text-xs text-text-secondary">
            {p.label}
          </span>
        ))}
      </div>
    </div>
  )
}
