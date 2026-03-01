import { useInteractionRatio } from '@/hooks/useInteractionRatio'

export function RatioHealthBar({ className = '' }: { className?: string }) {
  const { ratio, positive, negative, coldStart, loading } = useInteractionRatio()

  if (loading || coldStart) return null

  const color = ratio >= 5 ? 'bg-green-400' : ratio >= 3 ? 'bg-amber-400' : 'bg-red-400'
  const textColor = ratio >= 5
    ? 'text-green-700 dark:text-green-400'
    : ratio >= 3
    ? 'text-amber-700 dark:text-amber-400'
    : 'text-red-700 dark:text-red-400'
  const label = ratio >= 5 ? 'Healthy' : ratio >= 3 ? 'Watch' : 'Low'
  const pct = Math.min(100, (ratio / 7) * 100) // 7:1 = 100%

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">Interaction Balance</span>
        <span className={`text-xs font-medium ${textColor}`}>
          {ratio.toFixed(1)}:1 — {label}
        </span>
      </div>
      <div className="h-1.5 bg-surface-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-text-tertiary">
        <span>{positive} positive</span>
        <span>{negative} negative</span>
      </div>
    </div>
  )
}
