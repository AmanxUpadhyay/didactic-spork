import { Card } from '@/components/ui'

interface DecayingPointBankProps {
  currentPoints: number
  initialPoints: number
  floorPoints: number
  className?: string
}

export function DecayingPointBank({ currentPoints, initialPoints, floorPoints, className = '' }: DecayingPointBankProps) {
  const percent = Math.round((currentPoints / initialPoints) * 100)
  const fillPercent = Math.max(0, Math.min(100, ((currentPoints - floorPoints) / (initialPoints - floorPoints)) * 100))

  let color = 'bg-green-500'
  let textColor = 'text-green-600'
  if (percent <= 40) {
    color = 'bg-red-500'
    textColor = 'text-red-600'
  } else if (percent <= 65) {
    color = 'bg-yellow-500'
    textColor = 'text-yellow-600'
  }

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-text-secondary">Point Bank</span>
        <span className={`text-sm font-bold ${textColor}`}>{currentPoints} pts</span>
      </div>
      <div className="h-2 rounded-full bg-surface-secondary overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${fillPercent}%` }}
        />
      </div>
      <p className="text-[10px] text-text-secondary/60 mt-1">
        Floor: {floorPoints} pts — Complete habits to protect your bank!
      </p>
    </Card>
  )
}
