interface VetoCounterProps {
  total: number
  used: number
  className?: string
}

export function VetoCounter({ total, used, className = '' }: VetoCounterProps) {
  const remaining = total - used

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-xs font-medium text-text-secondary mr-1">Vetoes:</span>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            i < remaining
              ? 'bg-primary scale-100'
              : 'bg-surface-secondary scale-90'
          }`}
        />
      ))}
      <span className="text-xs text-text-secondary ml-1">
        {remaining} left
      </span>
    </div>
  )
}
