import { useCatchUp } from '@/hooks/useCatchUp'

export function CatchUpIndicator({ className = '' }: { className?: string }) {
  const { tier, comebackMultiplier, loading } = useCatchUp()

  if (loading || tier === 0) return null

  const tierConfig = {
    1: { icon: '🔥', label: 'Comeback Mode' },
    2: { icon: '⚡', label: 'Rally Mode' },
    3: { icon: '🌟', label: 'Full Recovery' },
  }[tier] || { icon: '🔥', label: 'Comeback Mode' }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 ${className}`}>
      <span className="text-sm">{tierConfig.icon}</span>
      <span className="text-xs font-medium text-amber-700 dark:text-amber-400">{tierConfig.label}</span>
      {comebackMultiplier > 1 && (
        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{comebackMultiplier}x</span>
      )}
    </div>
  )
}
