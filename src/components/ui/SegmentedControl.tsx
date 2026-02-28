import { cn } from '@/lib/cn'

interface SegmentedControlOption<T extends string> {
  value: T
  label: string
  color?: string
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        'flex rounded-[var(--radius-pill)] bg-border/30 p-1 gap-0.5',
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 px-3 py-2 rounded-[var(--radius-pill)]',
              'text-sm font-medium',
              'transition-all duration-200 ease-[var(--ease-bouncy)]',
              'select-none cursor-pointer',
              isActive
                ? 'bg-surface text-text-primary shadow-[var(--shadow-elevated)]'
                : 'text-text-secondary hover:text-text-primary',
            )}
            style={isActive && option.color ? { backgroundColor: option.color, color: 'white' } : undefined}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
