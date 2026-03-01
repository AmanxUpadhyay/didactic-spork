import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useTierUnlocks } from '@/hooks/useTierUnlocks'

export interface DayCompletion {
  date: string // YYYY-MM-DD
  count: number
}

export interface SprintTrendPoint {
  weekStart: string // YYYY-MM-DD
  myScore: number
  partnerScore: number
}

export interface HabitStreakRecord {
  taskId: string
  title: string
  bestDays: number
  currentDays: number
}

export interface CoupleStats {
  daysSinceFirst: number
  totalCompletions: number
  totalSprints: number
  longestStreak: number
}

export interface AnalyticsData {
  completionGrid: DayCompletion[]   // last 84 days
  sprintTrend: SprintTrendPoint[]   // last 8 completed sprints
  habitStreaks: HabitStreakRecord[]
  coupleStats: CoupleStats
  loading: boolean
  isGated: boolean // heatmap restricted to 28 days for seedling/sprout
}

export function useAnalytics(): AnalyticsData {
  const { profile } = useAuth()
  const { tier } = useTierUnlocks()
  const [data, setData] = useState<Omit<AnalyticsData, 'loading' | 'isGated'>>({
    completionGrid: [],
    sprintTrend: [],
    habitStreaks: [],
    coupleStats: { daysSinceFirst: 0, totalCompletions: 0, totalSprints: 0, longestStreak: 0 },
  })
  const [loading, setLoading] = useState(true)

  const isGated = tier === 'seedling' || tier === 'sprout'

  const fetch = useCallback(async () => {
    if (!profile?.id) return
    setLoading(true)

    const userId = profile.id
    const now = new Date()
    const cutoff84 = new Date(now)
    cutoff84.setDate(now.getDate() - 83) // inclusive: today + 83 prior days = 84

    const cutoffDate = cutoff84.toISOString().slice(0, 10)

    // 1. Habit completions grid (last 84 days)
    const completionsQ = supabase
      .from('habit_completions')
      .select('completed_date')
      .eq('user_id', userId)
      .gte('completed_date', cutoffDate)
      .order('completed_date', { ascending: true })

    // 2. Completed sprints (last 8)
    const sprintsQ = supabase
      .from('sprints')
      .select('week_start, score_a, score_b')
      .eq('status', 'completed')
      .order('week_start', { ascending: false })
      .limit(8)

    // 3. Partner pair — to determine user position (a or b)
    const pairQ = supabase
      .from('partner_pairs')
      .select('user_a, user_b')
      .eq('active', true)
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .limit(1)
      .maybeSingle()

    // 4. Streaks joined with tasks
    const streaksQ = supabase
      .from('streaks')
      .select('task_id, best_days, current_days, tasks(title)')
      .eq('user_id', userId)
      .eq('streak_type', 'individual')
      .order('best_days', { ascending: false })

    // 5. Couple stats aggregates
    const statsQ = supabase
      .from('habit_completions')
      .select('completed_date')
      .eq('user_id', userId)
      .order('completed_date', { ascending: true })
      .limit(1)

    const [completionsRes, sprintsRes, pairRes, streaksRes, firstRes] = await Promise.all([
      completionsQ,
      sprintsQ,
      pairQ,
      streaksQ,
      statsQ,
    ])

    // --- Completion grid ---
    const countByDate = new Map<string, number>()
    for (const row of completionsRes.data ?? []) {
      const d = row.completed_date
      countByDate.set(d, (countByDate.get(d) ?? 0) + 1)
    }
    const grid: DayCompletion[] = []
    for (let i = 83; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      grid.push({ date: key, count: countByDate.get(key) ?? 0 })
    }

    // --- Sprint trend ---
    const isUserA = pairRes.data?.user_a === userId
    const trend: SprintTrendPoint[] = (sprintsRes.data ?? [])
      .reverse()
      .map((s) => ({
        weekStart: s.week_start,
        myScore: (isUserA ? s.score_a : s.score_b) ?? 0,
        partnerScore: (isUserA ? s.score_b : s.score_a) ?? 0,
      }))

    // --- Habit streaks ---
    const habitStreaks: HabitStreakRecord[] = (streaksRes.data ?? [])
      .map((s) => {
        const tasks = s.tasks as { title: string } | null
        return {
          taskId: s.task_id ?? '',
          title: tasks?.title ?? 'Unknown habit',
          bestDays: s.best_days,
          currentDays: s.current_days,
        }
      })
      .filter((s) => s.taskId)

    // --- Couple stats ---
    const firstDate = firstRes.data?.[0]?.completed_date
    const daysSinceFirst = firstDate
      ? Math.floor((now.getTime() - new Date(firstDate).getTime()) / 86_400_000)
      : 0

    const longestStreak = habitStreaks.reduce((max, h) => Math.max(max, h.bestDays), 0)

    setData({
      completionGrid: grid,
      sprintTrend: trend,
      habitStreaks,
      coupleStats: {
        daysSinceFirst,
        totalCompletions: completionsRes.data?.length ?? 0,
        totalSprints: sprintsRes.data?.length ?? 0,
        longestStreak,
      },
    })
    setLoading(false)
  }, [profile?.id])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { ...data, loading, isGated }
}
