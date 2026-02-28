import { type ReactNode } from 'react'
import { cn } from '@/lib/cn'

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
          <button
            onClick={onFabClick}
            className={cn(
              'flex items-center justify-center',
              'w-14 h-14 -mt-7',
              'rounded-full bg-primary text-white',
              'shadow-[var(--shadow-button)]',
              'transition-all duration-200 ease-[var(--ease-bouncy)]',
              'active:scale-90 active:shadow-[var(--shadow-button-active)]',
            )}
          >
            {fabIcon}
          </button>
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
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-0.5',
        'w-16 h-full',
        'transition-all duration-200 ease-[var(--ease-bouncy)]',
        active ? 'text-primary' : 'text-text-secondary',
      )}
    >
      <span
        className={cn(
          'flex items-center justify-center',
          'w-10 h-8 rounded-[var(--radius-pill)]',
          'transition-all duration-200 ease-[var(--ease-bouncy)]',
          active && 'bg-primary/10 scale-110',
        )}
      >
        {icon}
      </span>
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </button>
  )
}
