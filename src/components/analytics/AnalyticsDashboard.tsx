import { m } from 'motion/react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { LoadingState } from '@/components/ui/LoadingState'
import { HabitHeatmap } from './HabitHeatmap'
import { SprintTrendChart } from './SprintTrendChart'
import { StreakRecordsCard } from './StreakRecordsCard'
import { CoupleStatsCard } from './CoupleStatsCard'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface AnalyticsDashboardProps {
  partnerName?: string
}

export function AnalyticsDashboard({ partnerName }: AnalyticsDashboardProps) {
  const { completionGrid, sprintTrend, habitStreaks, coupleStats, loading, isGated } =
    useAnalytics()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingState message="Loading your progress..." />
      </div>
    )
  }

  return (
    <m.div
      className="space-y-6"
      variants={staggerContainer(0.08)}
      initial="hidden"
      animate="visible"
    >
      <m.h2
        variants={staggerItem}
        className="font-heading text-xl font-bold text-text-primary"
      >
        Your Progress
      </m.h2>

      {/* Couple stats */}
      <m.div variants={staggerItem}>
        <CoupleStatsCard stats={coupleStats} partnerName={partnerName} />
      </m.div>

      {/* Habit heatmap */}
      <m.div variants={staggerItem} className="space-y-2">
        <h3 className="text-sm font-semibold text-text-primary">
          Habit Activity
          {isGated && (
            <span className="ml-2 text-xs font-normal text-text-secondary">4 weeks</span>
          )}
          {!isGated && (
            <span className="ml-2 text-xs font-normal text-text-secondary">12 weeks</span>
          )}
        </h3>
        <HabitHeatmap grid={completionGrid} isGated={isGated} />
      </m.div>

      {/* Sprint trend */}
      <m.div variants={staggerItem} className="space-y-2">
        <h3 className="text-sm font-semibold text-text-primary">Sprint Scores</h3>
        <SprintTrendChart points={sprintTrend} />
      </m.div>

      {/* Streak records */}
      <m.div variants={staggerItem} className="space-y-2">
        <h3 className="text-sm font-semibold text-text-primary">Streak Records</h3>
        <StreakRecordsCard streaks={habitStreaks} />
      </m.div>
    </m.div>
  )
}
