import { useState, type ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkCircle01Icon, AlertCircleIcon, BodyPartMuscleIcon } from '@hugeicons/core-free-icons'
import { Card } from '@/components/ui'
import { KiraAvatar } from './KiraAvatar'
import { useKira } from '@/hooks/useKira'

interface KiraExcuseVerdictProps {
  taskId: string
  taskTitle: string
  onClose?: () => void
  className?: string
}

const VERDICT_STYLES: Record<string, { bg: string; label: string; icon: ReactNode }> = {
  LEGIT: { bg: 'bg-emerald-50 border-emerald-200', label: 'Legit', icon: <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="text-emerald-600" /> },
  PARTIAL: { bg: 'bg-amber-50 border-amber-200', label: 'Partial', icon: <HugeiconsIcon icon={AlertCircleIcon} size={20} className="text-amber-600" /> },
  NEEDS_PUSH: { bg: 'bg-rose-50 border-rose-200', label: 'Needs Push', icon: <HugeiconsIcon icon={BodyPartMuscleIcon} size={20} className="text-rose-600" /> },
}

/**
 * Excuse evaluation UI: submit an excuse, get Kira's verdict.
 */
export function KiraExcuseVerdict({
  taskId,
  taskTitle,
  onClose,
  className = '',
}: KiraExcuseVerdictProps) {
  const { evaluateExcuse, loading, error } = useKira()
  const [excuse, setExcuse] = useState('')
  const [verdict, setVerdict] = useState<{
    classification: string
    rationale: string
    response: string
  } | null>(null)
  const [mood, setMood] = useState('cheerful')

  async function handleSubmit() {
    if (!excuse.trim()) return
    const result = await evaluateExcuse(taskId, taskTitle, excuse.trim())
    if (result?.data) {
      setVerdict(result.data as typeof verdict)
      setMood(result.mood)
    }
  }

  if (verdict) {
    const style = VERDICT_STYLES[verdict.classification] ?? { bg: 'bg-amber-50 border-amber-200', label: 'Partial', icon: <HugeiconsIcon icon={AlertCircleIcon} size={20} className="text-amber-600" /> }

    return (
      <div className={`space-y-3 ${className}`}>
        <Card className={`border ${style.bg}`}>
          <div className="flex items-center gap-2 mb-2">
            {style.icon}
            <span className="text-sm font-semibold text-text-primary">{style.label}</span>
          </div>
          <p className="text-xs text-text-secondary mb-2">{verdict.rationale}</p>
        </Card>

        <Card className="!bg-primary/5 border border-primary/10">
          <div className="flex gap-3">
            <KiraAvatar mood={mood as never} size="sm" />
            <p className="text-sm text-text-primary leading-relaxed flex-1">
              {verdict.response}
            </p>
          </div>
        </Card>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full text-sm font-medium py-2 text-text-secondary"
          >
            Done
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <KiraAvatar mood="cheerful" size="sm" />
        <p className="text-sm font-medium text-text-primary">
          Why couldn't you do "{taskTitle}"?
        </p>
      </div>

      <textarea
        value={excuse}
        onChange={(e) => setExcuse(e.target.value)}
        placeholder="Tell Kira what happened..."
        rows={3}
        className="w-full px-4 py-3 text-sm rounded-2xl bg-surface-secondary border border-border focus:border-primary focus:outline-none resize-none"
      />

      {error && <p className="text-xs text-rose-500">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || !excuse.trim()}
        className="w-full py-2.5 rounded-full bg-primary text-white text-sm font-medium disabled:opacity-50 transition-opacity"
      >
        {loading ? 'Kira is judging...' : 'Submit excuse'}
      </button>
    </div>
  )
}
