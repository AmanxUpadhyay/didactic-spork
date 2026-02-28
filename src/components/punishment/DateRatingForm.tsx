import { useState } from 'react'
import { Card, Button } from '@/components/ui'

interface DateRatingFormProps {
  onSubmit: (rating: number, highlights?: string, improvements?: string) => void
  partnerRating?: number | null
  loading?: boolean
  className?: string
}

export function DateRatingForm({
  onSubmit,
  partnerRating,
  loading = false,
  className = '',
}: DateRatingFormProps) {
  const [rating, setRating] = useState(0)
  const [highlights, setHighlights] = useState('')
  const [improvements, setImprovements] = useState('')

  function handleSubmit() {
    if (rating < 1) return
    onSubmit(rating, highlights || undefined, improvements || undefined)
  }

  return (
    <Card className={className}>
      <h3 className="font-heading text-base font-semibold text-text-primary mb-3">
        Rate the date
      </h3>

      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`w-10 h-10 rounded-full text-lg transition-all ${
              star <= rating
                ? 'bg-primary text-white scale-110'
                : 'bg-surface-secondary text-text-secondary'
            }`}
          >
            {star <= rating ? '\u2605' : '\u2606'}
          </button>
        ))}
      </div>

      <textarea
        placeholder="What were the highlights?"
        value={highlights}
        onChange={(e) => setHighlights(e.target.value)}
        rows={2}
        className="w-full rounded-xl border-2 border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 mb-2 resize-none"
      />

      <textarea
        placeholder="Anything to improve next time?"
        value={improvements}
        onChange={(e) => setImprovements(e.target.value)}
        rows={2}
        className="w-full rounded-xl border-2 border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 mb-3 resize-none"
      />

      <Button
        onClick={handleSubmit}
        disabled={rating < 1 || loading}
        className="w-full"
      >
        {loading ? 'Submitting...' : 'Submit rating'}
      </Button>

      {partnerRating !== null && partnerRating !== undefined && (
        <p className="text-xs text-text-secondary text-center mt-2">
          Your partner rated it {partnerRating}/5
        </p>
      )}
    </Card>
  )
}
