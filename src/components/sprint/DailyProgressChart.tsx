import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui'
import { BarChart } from '@/components/ui/BarChart'
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
  const [myBars, setMyBars] = useState<{ label: string; value: number }[]>([])
  const [partnerBars, setPartnerBars] = useState<{ label: string; value: number }[]>([])

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
    setMyBars(myCounts.map((v: number, i: number) => ({ label: DAY_LABELS[i]!, value: v })))

    if (partnerId) {
      const partnerCounts = await countsForUser(partnerId)
      setPartnerBars(partnerCounts.map((v: number, i: number) => ({ label: DAY_LABELS[i]!, value: v })))
    }
  }, [sprintId, weekStart, userId, partnerId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (myBars.length === 0) return null

  const maxValue = Math.max(
    ...myBars.map((b) => b.value),
    ...partnerBars.map((b) => b.value),
    1,
  )

  return (
    <Card className={className}>
      <h3 className="text-sm font-medium text-text-secondary mb-3">Daily Completions</h3>
      <div className="space-y-4">
        <div>
          <p className="text-xs text-text-secondary mb-1">You</p>
          <BarChart bars={myBars} maxValue={maxValue} height={100} />
        </div>
        {partnerBars.length > 0 && (
          <div>
            <p className="text-xs text-text-secondary mb-1">Partner</p>
            <BarChart bars={partnerBars} maxValue={maxValue} height={100} />
          </div>
        )}
      </div>
    </Card>
  )
}
