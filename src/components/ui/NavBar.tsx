import { type ReactNode } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/cn'
import { kawaiiSpring, gentleSpring, haptics } from '@/lib/animations'
interface NavItem {
  icon: ReactNode
  label: string
  active?: boolean
  onClick?: () => void
  onClickWithCoords?: (x: number, y: number) => void
}

interface NavBarProps {
  items: NavItem[]
  fabIcon?: ReactNode
  onFabClick?: () => void
  className?: string
  onTabChange?: (tabId: string, x: number, y: number) => void
  flashTabIndex?: number
}

export function NavBar({ items, fabIcon, onFabClick, className, onTabChange, flashTabIndex }: NavBarProps) {
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
          <NavBarItem key={i} {...item} tabIndex={i} onTabChange={onTabChange} flashTabIndex={flashTabIndex} />
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
          <NavBarItem key={midpoint + i} {...item} tabIndex={midpoint + i} onTabChange={onTabChange} flashTabIndex={flashTabIndex} />
        ))}
      </div>
    </nav>
  )
}

interface NavBarItemInternalProps extends NavItem {
  tabIndex: number
  onTabChange?: (tabId: string, x: number, y: number) => void
  flashTabIndex?: number
}

function NavBarItem({ icon, label, active, onClick, tabIndex, onTabChange, flashTabIndex }: NavBarItemInternalProps) {
  function handleClick(e: React.MouseEvent) {
    haptics.light()
    if (onTabChange) {
      onTabChange(String(tabIndex), e.clientX, e.clientY)
    }
    onClick?.()
  }

  return (
    <m.button
      onClick={handleClick}
      whileTap={{ scale: 0.88 }}
      transition={kawaiiSpring}
      className={cn(
        'flex flex-col items-center justify-center gap-0.5',
        'w-16 h-full',
        active ? 'text-primary' : 'text-text-secondary',
      )}
    >
      {/* Icon with scale spring */}
      <span className="relative flex items-center justify-center w-10 h-8 overflow-visible">
        <m.span
          animate={{ scale: active ? 1.1 : 1 }}
          transition={kawaiiSpring}
          className="flex items-center justify-center"
        >
          {icon}
        </m.span>
        <AnimatePresence>
          {tabIndex === flashTabIndex && (
            <m.span
              key="ripple"
              className="absolute inset-0 rounded-full border-2 border-primary pointer-events-none"
              initial={{ scale: 0.6, opacity: 0.8 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{}}
              transition={{ duration: 0.6, ease: [0.0, 0.6, 0.4, 1.0] }}
            />
          )}
        </AnimatePresence>
      </span>
      <span className="text-[10px] font-medium leading-none">{label}</span>

      {/* Sliding indicator — layoutId causes Motion to animate position between active tabs */}
      <div className="mt-0.5 h-1.5 w-6 flex items-center justify-center">
        <AnimatePresence>
          {active && (
            <m.div
              layoutId="tab-indicator"
              className="w-1.5 h-1.5 rounded-full bg-primary"
              transition={gentleSpring}
            />
          )}
        </AnimatePresence>
      </div>
    </m.button>
  )
}
