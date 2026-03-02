export function HabitCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-card)] bg-surface border-2 border-border p-4">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full skeleton-shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded w-3/4 skeleton-shimmer" />
          <div className="h-3 rounded w-1/3 skeleton-shimmer" />
        </div>
      </div>
    </div>
  )
}
