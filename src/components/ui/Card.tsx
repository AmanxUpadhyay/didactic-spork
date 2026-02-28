import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[var(--radius-card)] bg-surface',
          'border-2 border-border p-5',
          'shadow-[var(--shadow-elevated)]',
          hoverable && [
            'transition-all duration-200 ease-[var(--ease-bouncy)]',
            'hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(232,135,143,0.12)]',
          ],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

Card.displayName = 'Card'
