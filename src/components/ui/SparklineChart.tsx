import { m } from 'motion/react'
import { cn } from '@/lib/cn'
import { useReducedMotion } from '@/lib/animations'

interface SparklineSeries {
  values: number[]
  colorVar: string  // CSS var name e.g. '--color-primary'
  label: string
}

interface SparklineChartProps {
  series: SparklineSeries[]
  labels: string[]
  className?: string
}

const VIEW_W = 280
const VIEW_H = 80
const PAD_X = 12
const PAD_TOP = 6
const PAD_BOT = 18
const CHART_W = VIEW_W - PAD_X * 2
const CHART_H = VIEW_H - PAD_TOP - PAD_BOT

function xAt(i: number, n: number) {
  return PAD_X + (n <= 1 ? 0 : (i / (n - 1)) * CHART_W)
}

function yAt(value: number, max: number) {
  const clamped = max > 0 ? Math.min(value / max, 1) : 0
  return PAD_TOP + CHART_H - clamped * CHART_H
}

function smoothLinePath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return ''
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let d = `M ${pts[0]!.x.toFixed(1)} ${pts[0]!.y.toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1]
    const c = pts[i]
    if (!p || !c) continue
    const mx = ((p.x + c.x) / 2).toFixed(1)
    d += ` C ${mx} ${p.y.toFixed(1)} ${mx} ${c.y.toFixed(1)} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`
  }
  return d
}

function areaPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return ''
  const baseline = (PAD_TOP + CHART_H).toFixed(1)
  const line = smoothLinePath(pts)
  return `${line} L ${pts[pts.length - 1]!.x.toFixed(1)} ${baseline} L ${pts[0]!.x.toFixed(1)} ${baseline} Z`
}

export function SparklineChart({ series, labels, className }: SparklineChartProps) {
  const reducedMotion = useReducedMotion()

  const maxValue = Math.max(
    1,
    ...series.flatMap((s) => s.values),
  )

  const baseline = PAD_TOP + CHART_H

  return (
    <div className={cn('w-full', className)}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {/* Subtle baseline */}
        <line
          x1={PAD_X}
          y1={baseline}
          x2={VIEW_W - PAD_X}
          y2={baseline}
          stroke="var(--color-border)"
          strokeWidth="1"
        />

        {series.map((s) => {
          const pts = s.values.map((v, i) => ({
            x: xAt(i, s.values.length),
            y: yAt(v, maxValue),
          }))
          const linePath = smoothLinePath(pts)
          const fill = areaPath(pts)
          const color = `var(${s.colorVar})`

          return (
            <g key={s.label}>
              {/* Area fill */}
              <path
                d={fill}
                fill={color}
                fillOpacity={0.12}
                strokeWidth="0"
              />

              {/* Line */}
              <m.path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
              />

              {/* Dots */}
              {pts.map((pt, i) => (
                <m.circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r={s.values[i]! > 0 ? 3 : 1.5}
                  fill={color}
                  opacity={s.values[i]! > 0 ? 1 : 0.35}
                  initial={reducedMotion ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={reducedMotion ? { duration: 0 } : { delay: 0.6 + i * 0.04, type: 'spring', stiffness: 400, damping: 20 }}
                />
              ))}
            </g>
          )
        })}

        {/* X-axis labels */}
        {labels.map((label, i) => (
          <text
            key={i}
            x={xAt(i, labels.length)}
            y={VIEW_H - 2}
            textAnchor="middle"
            fontSize="9"
            fill="var(--color-text-secondary)"
            fontFamily="var(--font-body)"
          >
            {label}
          </text>
        ))}
      </svg>

      {/* Legend */}
      {series.length > 1 && (
        <div className="flex items-center gap-4 mt-1 px-1">
          {series.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span
                className="w-3 h-0.5 rounded-full inline-block"
                style={{ background: `var(${s.colorVar})` }}
              />
              <span className="text-xs text-text-secondary">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
