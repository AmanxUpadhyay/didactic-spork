import { cn } from '@/lib/cn'

type SkeletonVariant = 'line' | 'circle' | 'card' | 'habit-row'

interface SkeletonProps {
  variant?: SkeletonVariant
  className?: string
  width?: string | number
  height?: string | number
}

export function Skeleton({ variant = 'line', className, width, height }: SkeletonProps) {
  // Uses --color-border for the shimmer base (palette-adaptive, always a muted variant of surface)
  const base = 'relative overflow-hidden bg-[var(--color-border)] rounded-[var(--radius-pill)] animate-pulse'

  if (variant === 'circle') {
    return (
      <span
        className={cn(base, 'rounded-full shrink-0', className)}
        style={{ width: width ?? 40, height: height ?? 40, display: 'block' }}
        aria-hidden="true"
      />
    )
  }

  if (variant === 'card') {
    return (
      <div
        className={cn(
          'rounded-[var(--radius-card)] bg-[var(--color-border)] animate-pulse',
          className,
        )}
        style={{ minHeight: height ?? 120, width: width ?? '100%' }}
        aria-hidden="true"
      />
    )
  }

  if (variant === 'habit-row') {
    return (
      <div className={cn('flex items-center gap-3 w-full', className)} aria-hidden="true">
        <Skeleton variant="circle" width={40} height={40} />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton variant="line" width="60%" height={14} />
          <Skeleton variant="line" width="40%" height={12} />
        </div>
        <Skeleton variant="circle" width={28} height={28} />
      </div>
    )
  }

  // default: line
  return (
    <span
      className={cn(base, className)}
      style={{ width: width ?? '100%', height: height ?? 16, display: 'block' }}
      aria-hidden="true"
    />
  )
}

export function SkeletonLine({ className, width, height }: Omit<SkeletonProps, 'variant'>) {
  return <Skeleton variant="line" className={className} width={width} height={height} />
}

export function SkeletonCircle({ className, width, height }: Omit<SkeletonProps, 'variant'>) {
  return <Skeleton variant="circle" className={className} width={width} height={height} />
}

export function SkeletonCard({ className, height }: Omit<SkeletonProps, 'variant'>) {
  return <Skeleton variant="card" className={className} height={height} />
}

export function SkeletonHabitRow({ className }: Pick<SkeletonProps, 'className'>) {
  return <Skeleton variant="habit-row" className={className} />
}
