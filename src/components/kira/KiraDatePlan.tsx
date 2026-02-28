import { useState } from 'react'
import { Card } from '@/components/ui'
import { KiraAvatar } from './KiraAvatar'
import { KiraCommentary } from './KiraCommentary'
import { useKira } from '@/hooks/useKira'
import { useKiraResponse } from '@/hooks/useKiraResponse'

interface DateOption {
  title: string
  activity: string
  food: string
  extras: string[]
  estimatedCost: number
  rationale: string
}

interface KiraDatePlanProps {
  sprintId: string
  onAccept?: (option: DateOption) => void
  className?: string
}

/**
 * Displays Kira's date plan suggestions with accept/veto flow.
 */
export function KiraDatePlan({ sprintId, onAccept, className = '' }: KiraDatePlanProps) {
  const { planDate, loading: generating, error: genError } = useKira()
  const { latest, loading: fetchLoading } = useKiraResponse({
    sprintId,
    functionType: 'date_plan',
    limit: 1,
  })

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [vetoed, setVetoed] = useState<Set<number>>(new Set())

  // Parse existing plan or generate new one
  const existingPlan = latest?.structured_data as { options?: DateOption[] } | null
  const options = existingPlan?.options || []
  const mood = (latest?.personality_mode as never) || 'cheerful'

  async function handleGenerate() {
    await planDate(sprintId)
  }

  function handleVeto(index: number) {
    setVetoed((prev) => new Set([...prev, index]))
    if (selectedIndex === index) setSelectedIndex(null)
  }

  function handleAccept(option: DateOption) {
    onAccept?.(option)
  }

  if (fetchLoading) {
    return (
      <Card className={`!bg-primary/5 animate-pulse ${className}`}>
        <div className="h-20" />
      </Card>
    )
  }

  // No plan yet — show generate button
  if (options.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <KiraAvatar mood="cheerful" size="lg" className="mx-auto mb-3" />
        <h3 className="font-heading text-lg font-semibold text-text-primary mb-1">
          Time for a date plan
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          Kira will suggest some options based on the sprint results
        </p>
        {genError && <p className="text-xs text-rose-500 mb-2">{genError}</p>}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-medium disabled:opacity-50"
        >
          {generating ? 'Planning...' : 'Generate date ideas'}
        </button>
      </div>
    )
  }

  const visibleOptions = options.filter((_, i) => !vetoed.has(i))

  // All vetoed — offer regeneration
  if (visibleOptions.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <KiraCommentary
          text="All options vetoed? Fine, let me try again..."
          mood="sarcastic"
        />
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="mt-4 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-medium disabled:opacity-50"
        >
          {generating ? 'Replanning...' : 'Regenerate options'}
        </button>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <KiraAvatar mood={mood} size="sm" />
        <p className="text-sm font-medium text-text-primary">Kira's date ideas:</p>
      </div>

      {visibleOptions.map((option) => {
        const originalIndex = options.indexOf(option)
        const isSelected = selectedIndex === originalIndex

        return (
          <Card
            key={originalIndex}
            className={`!p-3 cursor-pointer transition-all ${
              isSelected ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedIndex(originalIndex)}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-sm font-semibold text-text-primary">{option.title}</h4>
              <span className="text-xs font-accent font-bold text-primary whitespace-nowrap">
                £{option.estimatedCost}
              </span>
            </div>

            <div className="space-y-1 mb-2">
              <p className="text-xs text-text-secondary">
                <span className="font-medium">Activity:</span> {option.activity}
              </p>
              <p className="text-xs text-text-secondary">
                <span className="font-medium">Food:</span> {option.food}
              </p>
              {option.extras.length > 0 && (
                <p className="text-xs text-text-secondary">
                  <span className="font-medium">Extras:</span> {option.extras.join(', ')}
                </p>
              )}
            </div>

            <p className="text-xs text-text-secondary italic mb-3">{option.rationale}</p>

            {isSelected && (
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAccept(option)
                  }}
                  className="flex-1 text-xs font-medium py-1.5 rounded-full bg-primary text-white"
                >
                  Accept this plan
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleVeto(originalIndex)
                  }}
                  className="flex-1 text-xs font-medium py-1.5 rounded-full bg-rose-100 text-rose-600"
                >
                  Veto
                </button>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
