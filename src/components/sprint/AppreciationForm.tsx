import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui'
import { MochiAvatar } from '@/components/ui/MochiAvatar'

interface AppreciationFormProps {
  partnerName: string
  onSubmit: (content: string) => Promise<{ success: boolean; error?: string }>
  className?: string
}

export function AppreciationForm({ partnerName, onSubmit, className }: AppreciationFormProps) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid = content.trim().length >= 20

  async function handleSubmit() {
    if (!isValid || submitting) return
    setSubmitting(true)
    setError(null)

    const result = await onSubmit(content.trim())
    if (!result.success) {
      setError(result.error ?? 'Failed to submit')
    }
    setSubmitting(false)
  }

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <MochiAvatar size="lg" alt="Mochi encouraging you" />

      <div className="text-center space-y-1">
        <h3 className="font-heading text-lg font-semibold text-text-primary">
          Appreciation Time
        </h3>
        <p className="text-sm text-text-secondary max-w-[280px]">
          What did you appreciate about {partnerName} this week?
        </p>
      </div>

      <div className="w-full space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Tell ${partnerName} something kind...`}
          rows={4}
          className={cn(
            'w-full px-4 py-3 text-sm text-text-primary',
            'bg-[var(--color-input-bg,var(--color-surface))]',
            'border-2 border-border rounded-[16px]',
            'placeholder:text-text-secondary/60',
            'focus:outline-none focus:border-primary',
            'transition-colors duration-200',
            'resize-none',
          )}
        />
        <div className="flex items-center justify-between px-1">
          <span className={cn(
            'text-xs',
            content.trim().length < 20 ? 'text-text-secondary' : 'text-success',
          )}>
            {content.trim().length}/20 min
          </span>
          {error && <span className="text-xs text-error">{error}</span>}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!isValid || submitting}
        className="w-full"
      >
        {submitting ? 'Sending...' : 'Send Appreciation'}
      </Button>
    </div>
  )
}
