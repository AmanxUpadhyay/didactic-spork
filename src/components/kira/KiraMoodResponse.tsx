import { useState, type ReactNode } from 'react'
import { m } from 'motion/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Sad01Icon, SadDizzyIcon, NeutralIcon, SmileIcon, HappyIcon } from '@hugeicons/core-free-icons'
import { Card } from '@/components/ui'
import { KiraAvatar } from './KiraAvatar'
import { KiraCommentary } from './KiraCommentary'
import { useKira } from '@/hooks/useKira'
import { cn } from '@/lib/cn'
import { kawaiiSpring, haptics } from '@/lib/animations'

interface KiraMoodResponseProps {
  onComplete?: () => void
  className?: string
}

const MOOD_LABELS: Array<{ score: number; icon: ReactNode; label: string }> = [
  { score: 1, icon: <HugeiconsIcon icon={Sad01Icon} size={24} />, label: 'Rough' },
  { score: 2, icon: <HugeiconsIcon icon={SadDizzyIcon} size={24} />, label: 'Meh' },
  { score: 3, icon: <HugeiconsIcon icon={NeutralIcon} size={24} />, label: 'Okay' },
  { score: 4, icon: <HugeiconsIcon icon={SmileIcon} size={24} />, label: 'Good' },
  { score: 5, icon: <HugeiconsIcon icon={HappyIcon} size={24} />, label: 'Great' },
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
          <span className="flex justify-center">{MOOD_LABELS[selectedMood! - 1]?.icon}</span>
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
          <Card className="bg-primary/5 border border-primary/15">
            <p className="text-sm text-text-primary italic">{response.followUp}</p>
          </Card>
        )}

        {onComplete && (
          <m.button
            type="button"
            onClick={onComplete}
            onPointerDown={() => haptics.light()}
            whileTap={{ scale: 0.94, transition: kawaiiSpring }}
            className="w-full py-2.5 rounded-full bg-primary text-white text-sm font-medium"
          >
            Done
          </m.button>
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
        {MOOD_LABELS.map(({ score, icon, label }) => (
          <m.button
            key={score}
            type="button"
            onClick={() => setSelectedMood(score)}
            onPointerDown={() => haptics.light()}
            whileTap={{ scale: 0.88, transition: kawaiiSpring }}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-2xl transition-colors',
              selectedMood === score
                ? 'bg-primary/10'
                : 'hover:bg-primary/8',
            )}
          >
            <m.span
              className="flex items-center"
              animate={selectedMood === score ? { scale: 1.1 } : { scale: 1 }}
              transition={kawaiiSpring}
            >
              {icon}
            </m.span>
            <span className="text-xs text-text-secondary">{label}</span>
          </m.button>
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

      <m.button
        type="button"
        onClick={handleSubmit}
        disabled={loading || selectedMood === null}
        onPointerDown={() => { if (!loading && selectedMood !== null) haptics.light() }}
        whileTap={loading || selectedMood === null ? undefined : { scale: 0.94, transition: kawaiiSpring }}
        className="w-full py-2.5 rounded-full bg-primary text-white text-sm font-medium disabled:opacity-50 transition-opacity"
      >
        {loading ? 'Kira is thinking...' : 'Check in'}
      </m.button>
    </div>
  )
}
