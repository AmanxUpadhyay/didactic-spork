import { cn } from '@/lib/cn'

interface WeeklyGridDay {
  label: string
  completed: boolean
}

interface WeeklyGridProps {
  days: WeeklyGridDay[]
  className?: string
}

export function WeeklyGrid({ days, className }: WeeklyGridProps) {
  return (
    <div className={cn('grid grid-cols-7 gap-1.5', className)}>
      {days.map((day, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-text-secondary font-medium uppercase tracking-[0.05em]">
            {day.label}
          </span>
          <div
            className={cn(
              'w-8 h-8 rounded-[var(--radius-small)]',
              'transition-all duration-300 ease-[var(--ease-bouncy)]',
              day.completed
                ? 'bg-primary scale-100 animate-[bloom_400ms_var(--ease-bouncy)]'
                : 'bg-border/40',
            )}
          />
        </div>
      ))}
    </div>
  )
}
