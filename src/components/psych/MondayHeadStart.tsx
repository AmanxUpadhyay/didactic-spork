import { Card } from '@/components/ui'

interface MondayHeadStartProps {
  bonusPoints: number
  reason: string
  className?: string
}

export function MondayHeadStart({ bonusPoints, reason, className = '' }: MondayHeadStartProps) {
  return (
    <Card className={`!bg-green-50 dark:!bg-green-950/20 border border-green-200 dark:border-green-800 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">🚀</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-700 dark:text-green-400">
            +{bonusPoints} Point Head Start!
          </p>
          <p className="text-xs text-green-600/80 dark:text-green-500/80 mt-0.5">{reason}</p>
        </div>
      </div>
    </Card>
  )
}
