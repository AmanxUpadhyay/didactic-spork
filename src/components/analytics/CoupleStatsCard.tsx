import type { CoupleStats } from '@/hooks/useAnalytics'

interface CoupleStatsCardProps {
  stats: CoupleStats
  partnerName?: string
}

interface StatItemProps {
  value: number
  label: string
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="text-center">
      <p className="font-heading text-2xl font-extrabold text-text-primary">{value}</p>
      <p className="text-xs text-text-secondary mt-0.5">{label}</p>
    </div>
  )
}

export function CoupleStatsCard({ stats, partnerName }: CoupleStatsCardProps) {
  return (
    <div className="rounded-[var(--radius-card)] bg-gradient-to-br from-primary/10 to-secondary/10 p-4 space-y-4">
      {partnerName && (
        <p className="text-xs text-text-secondary text-center">
          You &amp; {partnerName}
        </p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <StatItem value={stats.daysSinceFirst} label="days together" />
        <StatItem value={stats.totalCompletions} label="habits done" />
        <StatItem value={stats.totalSprints} label="sprints finished" />
        <StatItem value={stats.longestStreak} label="best streak" />
      </div>
    </div>
  )
}
