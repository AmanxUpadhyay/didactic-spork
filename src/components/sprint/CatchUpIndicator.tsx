import { Card } from '@/components/ui'
import { useCatchUp } from '@/hooks/useCatchUp'

export function CatchUpIndicator({ className = '' }: { className?: string }) {
  const { tier, consecutiveLosses, comebackMultiplier, headToHeadActive, loading } = useCatchUp()

  if (loading || tier === 0) return null

  const tierConfig = {
    1: { icon: '🔥', label: 'Comeback Mode', color: 'amber' },
    2: { icon: '⚡', label: 'Rally Mode', color: 'orange' },
    3: { icon: '🌟', label: 'Full Recovery Mode', color: 'red' },
  }[tier] || { icon: '🔥', label: 'Comeback Mode', color: 'amber' }

  return (
    <Card className={`!bg-${tierConfig.color}-50 dark:!bg-${tierConfig.color}-950/20 border border-${tierConfig.color}-200 dark:border-${tierConfig.color}-800 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{tierConfig.icon}</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">{tierConfig.label}</p>
          <p className="text-xs text-text-secondary mt-0.5">
            {consecutiveLosses} weeks trailing — bonuses active
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {comebackMultiplier > 1 && (
              <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                {comebackMultiplier}x multiplier
              </span>
            )}
            {headToHeadActive && (
              <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full">
                Head-to-head active
              </span>
            )}
            {tier >= 3 && (
              <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
                Structural options available
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
