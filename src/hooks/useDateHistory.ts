import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useKira } from '@/hooks/useKira'

export interface DateHistoryItem {
  id: string
  punishmentId: string
  category: string
  venueName: string | null
  cuisineType: string | null
  activityType: string | null
  dateAt: string | null
  rating: number | null
  notes: string | null
  createdAt: string
}

export function useDateHistory() {
  const { profile } = useAuth()
  const { invoke, loading: submitting } = useKira()
  const [dates, setDates] = useState<DateHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDates = useCallback(async () => {
    const { data } = await supabase
      .from('date_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) {
      setDates(
        data.map((d) => ({
          id: d.id,
          punishmentId: d.punishment_id,
          category: d.category,
          venueName: d.venue_name,
          cuisineType: d.cuisine_type,
          activityType: d.activity_type,
          dateAt: d.date_at,
          rating: d.rating,
          notes: d.notes,
          createdAt: d.created_at,
        }))
      )
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchDates()
  }, [fetchDates])

  const submitRating = useCallback(
    async (punishmentId: string, rating: number, highlights?: string, improvements?: string) => {
      if (!profile?.id) return null

      const result = await invoke('date_rate', {
        punishment_id: punishmentId,
        rating,
        highlights,
        improvements,
      })

      // Refresh date history after rating
      fetchDates()
      return result
    },
    [profile?.id, invoke, fetchDates]
  )

  return {
    dates,
    loading,
    submitting,
    submitRating,
    refresh: fetchDates,
  }
}
