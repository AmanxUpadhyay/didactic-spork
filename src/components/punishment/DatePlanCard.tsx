import { Card } from '@/components/ui'
import type { DateOption } from '@/types/punishment'

interface DatePlanCardProps {
  option: DateOption
  index: number
  selected: boolean
  onSelect: () => void
  onAccept: () => void
  onVeto: () => void
  vetoesRemaining: number
  surpriseBadge?: boolean
  disabled?: boolean
}

export function DatePlanCard({
  option,
  index,
  selected,
  onSelect,
  onAccept,
  onVeto,
  vetoesRemaining,
  surpriseBadge = false,
  disabled = false,
}: DatePlanCardProps) {
  return (
    <Card
      className={`!p-4 cursor-pointer transition-all ${
        selected ? 'ring-2 ring-primary' : ''
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
            {index + 1}
          </span>
          <h4 className="text-sm font-semibold text-text-primary">{option.title}</h4>
        </div>
        <div className="flex items-center gap-1.5">
          {surpriseBadge && (
            <span className="px-1.5 py-0.5 rounded-md bg-violet-100 text-violet-700 text-[10px] font-bold">
              SURPRISE
            </span>
          )}
          <span className="text-xs font-accent font-bold text-primary whitespace-nowrap">
            £{option.estimatedCost}
          </span>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex gap-2">
          <span className="text-xs font-medium text-text-secondary w-14 shrink-0">Activity</span>
          <span className="text-xs text-text-primary">{option.activity}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-xs font-medium text-text-secondary w-14 shrink-0">Food</span>
          <span className="text-xs text-text-primary">{option.food}</span>
        </div>
        {option.extras.length > 0 && (
          <div className="flex gap-2">
            <span className="text-xs font-medium text-text-secondary w-14 shrink-0">Extras</span>
            <span className="text-xs text-text-primary">{option.extras.join(', ')}</span>
          </div>
        )}
      </div>

      <p className="text-xs text-text-secondary italic mb-3">{option.rationale}</p>

      {selected && (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAccept()
            }}
            className="flex-1 text-xs font-medium py-2 rounded-full bg-primary text-white"
          >
            Accept this plan
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onVeto()
            }}
            disabled={vetoesRemaining <= 0}
            className="flex-1 text-xs font-medium py-2 rounded-full bg-rose-100 text-rose-600 disabled:opacity-40"
          >
            Veto {vetoesRemaining <= 0 ? '(none left)' : ''}
          </button>
        </div>
      )}
    </Card>
  )
}
