import { cn } from '@/lib/cn'

const DAYS = [
  { value: 0, label: 'S' },
  { value: 1, label: 'M' },
  { value: 2, label: 'T' },
  { value: 3, label: 'W' },
  { value: 4, label: 'T' },
  { value: 5, label: 'F' },
  { value: 6, label: 'S' },
]

interface DayPickerProps {
  selected: number[]
  onChange: (days: number[]) => void
  className?: string
}

export function DayPicker({ selected, onChange, className }: DayPickerProps) {
  function toggle(day: number) {
    if (selected.includes(day)) {
      onChange(selected.filter((d) => d !== day))
    } else {
      onChange([...selected, day])
    }
  }

  return (
    <div className={cn('flex gap-2 justify-center', className)}>
      {DAYS.map((day) => {
        const isSelected = selected.includes(day.value)
        return (
          <button
            key={day.value}
            type="button"
            onClick={() => toggle(day.value)}
            className={cn(
              'w-10 h-10 rounded-full',
              'text-sm font-semibold',
              'transition-all duration-200 ease-[var(--ease-bouncy)]',
              'select-none cursor-pointer',
              'border-2',
              isSelected
                ? 'bg-primary border-primary text-white scale-110'
                : 'bg-surface border-border text-text-secondary hover:border-primary/50',
            )}
          >
            {day.label}
          </button>
        )
      })}
    </div>
  )
}
