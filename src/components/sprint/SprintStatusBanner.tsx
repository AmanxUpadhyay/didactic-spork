import { m } from 'motion/react'
import { cn } from '@/lib/cn'
import { kawaiiSpring, haptics } from '@/lib/animations'

interface SprintStatusBannerProps {
  myScore: number
  partnerScore: number
  myName?: string
  partnerName?: string
  daysRemaining: number
  onTap?: () => void
  className?: string
}

export function SprintStatusBanner({
  myScore,
  partnerScore,
  myName,
  partnerName,
  daysRemaining,
  onTap,
  className,
}: SprintStatusBannerProps) {
  const iAmAhead = myScore > partnerScore

  return (
    <m.button
      onClick={onTap}
      onPointerDown={() => haptics.light()}
      whileTap={{ scale: 0.97 }}
      transition={kawaiiSpring}
      className={cn(
        'w-full px-4 py-3 rounded-2xl relative overflow-visible',
        'bg-gradient-to-r from-primary/15 to-secondary/10',
        'shadow-[0_4px_20px_-4px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]',
        'flex items-center justify-between',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">⚡</span>
        <div>
          <p className="text-xs text-text-secondary leading-none mb-1">Sprint Week</p>
          <div className="flex items-center gap-2">
            <div className="text-center">
              <p className="text-[10px] text-text-tertiary leading-none mb-0.5 truncate max-w-[64px]">
                {myName || 'You'}
              </p>
              <span className={cn('font-accent font-bold text-lg tabular-nums leading-none',
                iAmAhead ? 'text-primary' : 'text-text-secondary')}>
                {myScore.toFixed(1)}
              </span>
            </div>
            <span className="text-text-tertiary font-normal text-base">vs</span>
            <div className="text-center">
              <p className="text-[10px] text-text-tertiary leading-none mb-0.5 truncate max-w-[64px]">
                {partnerName || 'Partner'}
              </p>
              <span className={cn('font-accent font-bold text-lg tabular-nums leading-none',
                !iAmAhead ? 'text-primary' : 'text-text-secondary')}>
                {partnerScore.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="text-right">
        <span className="text-xs font-semibold text-text-secondary">
          {daysRemaining === 0 ? 'Last day' : `${daysRemaining}d left`}
        </span>
      </div>

      {/* Mochi peek — floats at bottom-right corner */}
      <m.img
        src="/image/mochi-idle.png"
        alt=""
        className="absolute -right-2 -bottom-3 w-14 h-14 object-cover object-[center_top] pointer-events-none"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </m.button>
  )
}
