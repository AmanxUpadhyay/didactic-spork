import { cn } from '@/lib/cn'
import { MochiAvatar } from './MochiAvatar'

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-12',
        className,
      )}
    >
      <MochiAvatar size="lg" className="motion-safe:animate-[float_3s_ease-in-out_infinite]" alt="Mochi loading" />
      <p className="text-sm text-text-secondary font-medium animate-pulse">
        {message}
      </p>
    </div>
  )
}

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
}

// Warm palette shimmer skeleton — palette-aware via CSS vars
export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)]',
        'skeleton-shimmer',
        className,
      )}
      style={{ width, height: height ?? '1rem' }}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-[var(--radius-card)] bg-surface border-2 border-border p-4 space-y-3', className)}>
      <Skeleton height="1.25rem" width="60%" />
      <Skeleton height="0.875rem" width="40%" />
      <Skeleton height="0.875rem" width="80%" />
    </div>
  )
}
