import { useState } from 'react'
import { Card } from '@/components/ui'
import { KiraAvatar } from './KiraAvatar'

type PersonalityMode = 'cheerful' | 'sarcastic' | 'tough_love' | 'empathetic' | 'hype_man' | 'disappointed'

interface KiraCommentaryProps {
  text: string
  mood?: PersonalityMode
  responseId?: string
  onFeedback?: (responseId: string, rating: number) => void
  className?: string
}

/**
 * Base component for displaying Kira AI text with mood-based styling.
 * Used as a building block by other Kira components.
 */
export function KiraCommentary({
  text,
  mood = 'cheerful',
  responseId,
  onFeedback,
  className = '',
}: KiraCommentaryProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<number | null>(null)

  function handleFeedback(rating: number) {
    if (responseId && onFeedback) {
      onFeedback(responseId, rating)
      setFeedbackGiven(rating)
    }
  }

  return (
    <Card className={`!bg-primary/5 border border-primary/10 ${className}`}>
      <div className="flex gap-3">
        <KiraAvatar mood={mood} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-primary mb-1">Kira</p>
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
            {text}
          </p>
        </div>
      </div>

      {responseId && onFeedback && (
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-primary/10">
          <span className="text-xs text-text-secondary">Was this helpful?</span>
          <button
            onClick={() => handleFeedback(1)}
            className={`text-sm px-2 py-0.5 rounded-full transition-colors ${
              feedbackGiven === 1 ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-primary'
            }`}
          >
            👍
          </button>
          <button
            onClick={() => handleFeedback(-1)}
            className={`text-sm px-2 py-0.5 rounded-full transition-colors ${
              feedbackGiven === -1 ? 'bg-rose-100 text-rose-500' : 'text-text-secondary hover:text-rose-400'
            }`}
          >
            👎
          </button>
        </div>
      )}
    </Card>
  )
}
