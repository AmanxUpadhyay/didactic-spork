interface PrestigeBadgeProps {
  level: number
  className?: string
}

export function PrestigeBadge({ level, className = '' }: PrestigeBadgeProps) {
  if (level <= 0) return null

  const variant = level >= 3 ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${variant} ${className}`}
    >
      {'\u2605'} P{level}
    </span>
  )
}
