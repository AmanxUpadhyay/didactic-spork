import { type HTMLAttributes, forwardRef } from 'react'
import { m } from 'motion/react'
import { cn } from '@/lib/cn'
import { gentleSpring } from '@/lib/animations'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, children, ...props }, ref) => {
    return (
      <m.div
        ref={ref}
        whileTap={hoverable ? { scale: 0.98 } : undefined}
        whileHover={hoverable ? { scale: 1.01, y: -2 } : undefined}
        transition={gentleSpring}
        className={cn(
          'rounded-[var(--radius-card)] bg-surface',
          'border-2 border-border p-5',
          'shadow-[var(--shadow-elevated)]',
          className,
        )}
        {...(props as object)}
      >
        {children}
      </m.div>
    )
  },
)

Card.displayName = 'Card'
