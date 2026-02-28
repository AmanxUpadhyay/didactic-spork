import { Card } from '@/components/ui'
import { useDateHistory } from '@/hooks/useDateHistory'
import type { DateHistoryItem } from '@/hooks/useDateHistory'

interface DateHistoryListProps {
  className?: string
}

function DateCard({ date }: { date: DateHistoryItem }) {
  const stars = date.rating ? '\u2605'.repeat(date.rating) + '\u2606'.repeat(5 - date.rating) : 'Not rated'

  return (
    <Card className="!p-3">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-sm font-semibold text-text-primary">
            {date.venueName || date.activityType || date.category}
          </p>
          {date.cuisineType && (
            <p className="text-xs text-text-secondary">{date.cuisineType}</p>
          )}
        </div>
        <span className="text-xs text-amber-500 tracking-wider">{stars}</span>
      </div>
      {date.dateAt && (
        <p className="text-xs text-text-secondary">
          {new Date(date.dateAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      )}
      {date.notes && (
        <p className="text-xs text-text-secondary mt-1 italic">{date.notes}</p>
      )}
    </Card>
  )
}

export function DateHistoryList({ className = '' }: DateHistoryListProps) {
  const { dates, loading } = useDateHistory()

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse !p-3">
            <div className="h-12" />
          </Card>
        ))}
      </div>
    )
  }

  if (dates.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-sm text-text-secondary">No dates yet. Complete a sprint first!</p>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="font-heading text-base font-semibold text-text-primary mb-2">
        Date History
      </h3>
      {dates.map((date) => (
        <DateCard key={date.id} date={date} />
      ))}
    </div>
  )
}
