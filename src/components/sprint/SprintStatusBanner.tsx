import { cn } from '@/lib/cn'

interface SprintStatusBannerProps {
  myScore: number
  partnerScore: number
  daysRemaining: number
  onTap?: () => void
  className?: string
}

export function SprintStatusBanner({
  myScore,
  partnerScore,
  daysRemaining,
  onTap,
  className,
}: SprintStatusBannerProps) {
  return (
    <button
      onClick={onTap}
      className={cn(
        'w-full px-4 py-2.5 rounded-[16px]',
        'bg-primary/10 border border-primary/20',
        'flex items-center justify-between',
        'active:scale-[0.98] transition-transform duration-100',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">⚡</span>
        <span className="text-sm font-medium text-text-primary">
          Sprint:
          <span className="font-accent font-bold ml-1 tabular-nums">
            {myScore.toFixed(1)}
          </span>
          <span className="text-text-secondary mx-1">-</span>
          <span className="font-accent font-bold tabular-nums">
            {partnerScore.toFixed(1)}
          </span>
        </span>
      </div>
      <span className="text-xs text-text-secondary">
        {daysRemaining === 0 ? 'Last day' : `${daysRemaining}d left`}
      </span>
    </button>
  )
}
