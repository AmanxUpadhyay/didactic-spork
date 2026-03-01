import { Card } from '@/components/ui'
import { useTrainingWheels } from '@/hooks/useTrainingWheels'

export function TrainingWheelsBanner({ className = '' }: { className?: string }) {
  const { isTraining, sprintNumber, loading } = useTrainingWheels()

  if (loading || !isTraining) return null

  return (
    <Card className={`!bg-primary/8 border border-primary/20 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="text-xl">🌱</span>
        <div>
          <p className="text-sm font-medium text-primary">
            Week {sprintNumber} — Warming Up
          </p>
          <p className="text-xs text-primary/70">
            No punishment dates yet — just getting into the groove. Have fun!
          </p>
        </div>
      </div>
    </Card>
  )
}
