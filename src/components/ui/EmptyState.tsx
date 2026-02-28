import { type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Button } from './Button'
import { MochiAvatar } from './MochiAvatar'

type EmptyStateVariant = 'no-data' | 'all-done'

interface EmptyStateProps {
  variant?: EmptyStateVariant
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  children?: ReactNode
  className?: string
}

export function EmptyState({
  variant = 'no-data',
  title,
  description,
  action,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-12 px-6 text-center',
        className,
      )}
    >
      <MochiAvatar
        size="xl"
        alt={variant === 'all-done' ? 'Mochi celebrating' : 'Mochi sleeping'}
        className={cn(
          variant === 'all-done'
            ? 'animate-[bouncy_600ms_var(--ease-bouncy)]'
            : 'opacity-60 grayscale-[30%]',
        )}
      />
      <div className="space-y-1.5">
        <h3 className="text-lg font-heading font-semibold text-text-primary">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-text-secondary max-w-[260px]">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Button size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
      {children}
    </div>
  )
}
