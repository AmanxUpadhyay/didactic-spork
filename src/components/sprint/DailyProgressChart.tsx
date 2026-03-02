import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui'
import { SparklineChart } from '@/components/ui/SparklineChart'
import { supabase } from '@/lib/supabase'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface DailyProgressChartProps {
  sprintId: string
  weekStart: string
  userId: string
  partnerId: string | null
  className?: string
}

export function DailyProgressChart({
  sprintId,
  weekStart,
  userId,
  partnerId,
  className,
}: DailyProgressChartProps) {
  const [myValues, setMyValues] = useState<number[]>([])
  const [partnerValues, setPartnerValues] = useState<number[]>([])

  const fetchData = useCallback(async () => {
    const start = new Date(weekStart)
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      return d.toISOString().slice(0, 10)
    })

    async function countsForUser(uid: string) {
      const { data } = await supabase
        .from('habit_completions')
        .select('completed_date')
        .eq('user_id', uid)
        .gte('completed_date', dates[0])
        .lte('completed_date', dates[6])

      const counts = new Array(7).fill(0)
      if (data) {
        for (const row of data) {
          const idx = dates.indexOf(row.completed_date)
          if (idx >= 0) counts[idx]++
        }
      }
      return counts
    }

    const myCounts = await countsForUser(userId)
    setMyValues(myCounts)

    if (partnerId) {
      const partnerCounts = await countsForUser(partnerId)
      setPartnerValues(partnerCounts)
    }
  }, [sprintId, weekStart, userId, partnerId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (myValues.length === 0) return null

  const chartSeries = [
    { values: myValues, colorVar: '--color-primary', label: 'You' },
    ...(partnerValues.length > 0
      ? [{ values: partnerValues, colorVar: '--color-chart-shared', label: 'Partner' }]
      : []),
  ]

  return (
    <Card className={className}>
      <h3 className="text-sm font-medium text-text-secondary mb-3">Daily Completions</h3>
      <SparklineChart series={chartSeries} labels={DAY_LABELS} />
    </Card>
  )
}
