import { KiraCommentary } from './KiraCommentary'
import { KiraAvatar } from './KiraAvatar'
import { useKiraResponse } from '@/hooks/useKiraResponse'
import { Card } from '@/components/ui'

type PersonalityMode = 'cheerful' | 'sarcastic' | 'tough_love' | 'empathetic' | 'hype_man' | 'disappointed'

interface KiraSprintVerdictProps {
  sprintId: string
  className?: string
}

/**
 * Displays Kira's sprint judging narrative in the results view.
 * Fetches from ai_responses filtered by sprint_id + function_type.
 */
export function KiraSprintVerdict({ sprintId, className = '' }: KiraSprintVerdictProps) {
  const { latest, loading, submitFeedback } = useKiraResponse({
    sprintId,
    functionType: 'sprint_judge',
    limit: 1,
  })

  if (loading) {
    return (
      <Card className={`!bg-primary/5 animate-pulse ${className}`}>
        <div className="flex items-center gap-3">
          <KiraAvatar mood="cheerful" size="sm" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-primary/10 rounded w-24" />
            <div className="h-3 bg-primary/10 rounded w-full" />
            <div className="h-3 bg-primary/10 rounded w-3/4" />
          </div>
        </div>
      </Card>
    )
  }

  if (!latest) return null

  const structured = latest.structured_data as { headline?: string; narrative?: string } | null
  const headline = structured?.headline
  const narrative = latest.response_text
  const mood = (latest.personality_mode as PersonalityMode) || 'cheerful'

  return (
    <div className={`space-y-2 ${className}`}>
      {headline && (
        <h3 className="font-heading text-lg font-semibold text-primary text-center">
          {headline}
        </h3>
      )}
      <KiraCommentary
        text={narrative}
        mood={mood}
        responseId={latest.id}
        onFeedback={submitFeedback}
      />
    </div>
  )
}
