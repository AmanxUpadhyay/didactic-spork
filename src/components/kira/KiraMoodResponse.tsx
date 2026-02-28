import { useState } from 'react'
import { Card } from '@/components/ui'
import { KiraAvatar } from './KiraAvatar'
import { KiraCommentary } from './KiraCommentary'
import { useKira } from '@/hooks/useKira'

interface KiraMoodResponseProps {
  onComplete?: () => void
  className?: string
}

const MOOD_LABELS = [
  { score: 1, emoji: '😢', label: 'Rough' },
  { score: 2, emoji: '😕', label: 'Meh' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '😊', label: 'Great' },
]

/**
 * Mood check-in screen with Kira's AI response.
 * User selects mood score (1-5), optionally writes journal, gets Kira's response.
 */
export function KiraMoodResponse({ onComplete, className = '' }: KiraMoodResponseProps) {
  const { respondToMood, loading, error } = useKira()
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [journal, setJournal] = useState('')
  const [response, setResponse] = useState<{
    response: string
    followUp: string | null
  } | null>(null)
  const [mood, setMood] = useState('empathetic')
  const [responseId, setResponseId] = useState<string | null>(null)

  async function handleSubmit() {
    if (selectedMood === null) return
    const depth = journal.trim().length > 0 ? 'deep' : 'quick'
    const result = await respondToMood(selectedMood, journal.trim() || undefined, depth as 'quick' | 'deep')
    if (result?.data) {
      setResponse(result.data as typeof response)
      setMood(result.mood)
      setResponseId(result.response_id)
    }
  }

  if (response) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Show what the user submitted */}
        <div className="text-center">
          <span className="text-3xl">{MOOD_LABELS[selectedMood! - 1]?.emoji}</span>
          <p className="text-sm text-text-secondary mt-1">
            You're feeling {MOOD_LABELS[selectedMood! - 1]?.label.toLowerCase()}
          </p>
        </div>

        <KiraCommentary
          text={response.response}
          mood={mood as never}
          responseId={responseId || undefined}
        />

        {response.followUp && (
          <Card className="!bg-violet-50 border border-violet-100">
            <p className="text-sm text-text-primary italic">{response.followUp}</p>
          </Card>
        )}

        {onComplete && (
          <button
            onClick={onComplete}
            className="w-full py-2.5 rounded-full bg-primary text-white text-sm font-medium"
          >
            Done
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-5 ${className}`}>
      <div className="text-center">
        <KiraAvatar mood="empathetic" size="lg" className="mx-auto mb-2" />
        <h2 className="font-heading text-xl font-semibold text-text-primary">
          How are you feeling?
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Quick check-in — Kira will respond
        </p>
      </div>

      {/* Mood selector */}
      <div className="flex justify-center gap-3">
        {MOOD_LABELS.map(({ score, emoji, label }) => (
          <button
            key={score}
            onClick={() => setSelectedMood(score)}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
              selectedMood === score
                ? 'bg-primary/10 scale-110'
                : 'hover:bg-surface-secondary'
            }`}
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-xs text-text-secondary">{label}</span>
          </button>
        ))}
      </div>

      {/* Optional journal */}
      {selectedMood !== null && (
        <textarea
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
          placeholder="Want to add some thoughts? (optional)"
          rows={3}
          className="w-full px-4 py-3 text-sm rounded-2xl bg-surface-secondary border border-border focus:border-primary focus:outline-none resize-none"
        />
      )}

      {error && <p className="text-xs text-rose-500 text-center">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || selectedMood === null}
        className="w-full py-2.5 rounded-full bg-primary text-white text-sm font-medium disabled:opacity-50 transition-opacity"
      >
        {loading ? 'Kira is thinking...' : 'Check in'}
      </button>
    </div>
  )
}
