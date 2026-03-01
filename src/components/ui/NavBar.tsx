import { type ReactNode } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/cn'
import { kawaiiSpring, snappySpring, haptics } from '@/lib/animations'

interface NavItem {
  icon: ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}

interface NavBarProps {
  items: NavItem[]
  fabIcon?: ReactNode
  onFabClick?: () => void
  className?: string
}

export function NavBar({ items, fabIcon, onFabClick, className }: NavBarProps) {
  const midpoint = Math.floor(items.length / 2)
  const leftItems = items.slice(0, midpoint)
  const rightItems = items.slice(midpoint)

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'bg-surface/92 backdrop-blur-[12px]',
        'border-t border-border',
        'pb-[env(safe-area-inset-bottom)]',
        className,
      )}
    >
      <div className="flex items-center justify-around h-16 px-2 relative">
        {leftItems.map((item, i) => (
          <NavBarItem key={i} {...item} />
        ))}

        {/* Center FAB */}
        {fabIcon && (
          <m.button
            onClick={onFabClick}
            aria-label="Add new habit"
            whileTap={{ scale: 0.85, rotate: 45 }}
            whileHover={{ scale: 1.08 }}
            transition={kawaiiSpring}
            onPointerDown={() => haptics.light()}
            className={cn(
              'flex items-center justify-center',
              'w-14 h-14 -mt-7',
              'rounded-full bg-gradient-to-b from-[color-mix(in_srgb,white_15%,var(--color-primary))] to-primary text-white',
              'shadow-[var(--shadow-button),0_8px_24px_-4px_color-mix(in_srgb,var(--color-primary)_45%,transparent)]',
            )}
          >
            {fabIcon}
          </m.button>
        )}

        {rightItems.map((item, i) => (
          <NavBarItem key={midpoint + i} {...item} />
        ))}
      </div>
    </nav>
  )
}

function NavBarItem({ icon, label, active, onClick }: NavItem) {
  return (
    <m.button
      onClick={onClick}
      onPointerDown={() => haptics.light()}
      whileTap={{ scale: 0.88 }}
      transition={kawaiiSpring}
      className={cn(
        'flex flex-col items-center justify-center gap-0.5',
        'w-16 h-full',
        active ? 'text-primary' : 'text-text-secondary',
      )}
    >
      <span className="relative flex items-center justify-center w-10 h-8">
        {/* Sliding background indicator using layoutId */}
        <AnimatePresence>
          {active && (
            <m.span
              layoutId="tab-indicator"
              className="absolute inset-0 rounded-[var(--radius-pill)] bg-primary/10"
              transition={snappySpring}
            />
          )}
        </AnimatePresence>

        {/* Icon with scale spring */}
        <m.span
          animate={{ scale: active ? 1.1 : 1 }}
          transition={kawaiiSpring}
          className="relative z-10 flex items-center justify-center"
        >
          {icon}
        </m.span>
      </span>
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </m.button>
  )
}
