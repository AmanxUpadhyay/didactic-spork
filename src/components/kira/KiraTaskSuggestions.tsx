import { useState } from 'react'
import { Card } from '@/components/ui'
import { KiraAvatar } from './KiraAvatar'
import { useKira } from '@/hooks/useKira'

interface TaskSuggestion {
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary'
  timeEstimate: string
  rationale: string
}

interface KiraTaskSuggestionsProps {
  onAccept?: (suggestion: TaskSuggestion) => void
  className?: string
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-rose-100 text-rose-700',
  legendary: 'bg-violet-100 text-violet-700',
}

/**
 * Displays Kira's task suggestions with accept/reject cards.
 * User taps "Get Suggestions" to trigger an AI call.
 */
export function KiraTaskSuggestions({ onAccept, className = '' }: KiraTaskSuggestionsProps) {
  const { suggestTasks, loading, error } = useKira()
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([])
  const [mood, setMood] = useState<string>('cheerful')
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())
  const [hasAsked, setHasAsked] = useState(false)

  async function handleGetSuggestions() {
    const result = await suggestTasks()
    if (result?.data) {
      const data = result.data as { suggestions?: TaskSuggestion[] }
      setSuggestions(data.suggestions || [])
      setMood(result.mood)
      setDismissed(new Set())
      setHasAsked(true)
    }
  }

  function handleDismiss(index: number) {
    setDismissed((prev) => new Set([...prev, index]))
  }

  function handleAccept(suggestion: TaskSuggestion) {
    onAccept?.(suggestion)
  }

  const visibleSuggestions = suggestions.filter((_, i) => !dismissed.has(i))

  if (!hasAsked) {
    return (
      <button
        onClick={handleGetSuggestions}
        disabled={loading}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors ${className}`}
      >
        <KiraAvatar mood="cheerful" size="sm" />
        <span className="text-sm font-medium text-primary">
          {loading ? 'Thinking...' : 'Get task suggestions from Kira'}
        </span>
      </button>
    )
  }

  if (error) {
    return (
      <Card className={`!bg-rose-50 ${className}`}>
        <p className="text-sm text-rose-600">Something went wrong: {error}</p>
        <button
          onClick={handleGetSuggestions}
          className="text-sm text-primary font-medium mt-2"
        >
          Try again
        </button>
      </Card>
    )
  }

  if (visibleSuggestions.length === 0 && hasAsked) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-sm text-text-secondary">All suggestions handled!</p>
        <button
          onClick={handleGetSuggestions}
          disabled={loading}
          className="text-sm text-primary font-medium mt-1"
        >
          {loading ? 'Thinking...' : 'Get more'}
        </button>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <KiraAvatar mood={mood as never} size="sm" />
        <p className="text-sm font-medium text-text-primary">Kira suggests:</p>
      </div>

      {visibleSuggestions.map((s) => {
        const originalIndex = suggestions.indexOf(s)
        return (
          <Card key={originalIndex} className="!p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-sm font-semibold text-text-primary">{s.title}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLORS[s.difficulty]}`}>
                {s.difficulty}
              </span>
            </div>
            <p className="text-xs text-text-secondary mb-1">{s.description}</p>
            <p className="text-xs text-text-secondary italic mb-3">
              {s.timeEstimate} — {s.rationale}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleAccept(s)}
                className="flex-1 text-xs font-medium py-1.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Add task
              </button>
              <button
                onClick={() => handleDismiss(originalIndex)}
                className="flex-1 text-xs font-medium py-1.5 rounded-full bg-surface-secondary text-text-secondary hover:bg-surface-secondary/80 transition-colors"
              >
                Skip
              </button>
            </div>
          </Card>
        )
      })}

      <button
        onClick={handleGetSuggestions}
        disabled={loading}
        className="w-full text-xs text-primary font-medium py-2"
      >
        {loading ? 'Thinking...' : 'Refresh suggestions'}
      </button>
    </div>
  )
}
