import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type AiResponse = Database['public']['Tables']['ai_responses']['Row'] & {
  sprint_id?: string | null
  structured_data?: Record<string, unknown> | null
}

type AiFunctionType = Database['public']['Enums']['ai_function_type']

/**
 * Hook to fetch and subscribe to Kira AI responses.
 * Can filter by function_type and/or sprint_id.
 */
export function useKiraResponse(opts: {
  userId?: string
  functionType?: AiFunctionType
  sprintId?: string
  limit?: number
}) {
  const [responses, setResponses] = useState<AiResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [latest, setLatest] = useState<AiResponse | null>(null)

  const fetchResponses = useCallback(async () => {
    if (!opts.userId && !opts.sprintId) {
      setLoading(false)
      return
    }

    let query = supabase
      .from('ai_responses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(opts.limit ?? 5)

    if (opts.userId) {
      query = query.eq('user_id', opts.userId)
    }
    if (opts.functionType) {
      query = query.eq('function_type', opts.functionType)
    }
    if (opts.sprintId) {
      query = query.eq('sprint_id', opts.sprintId)
    }

    const { data } = await query

    if (data) {
      setResponses(data as AiResponse[])
      setLatest((data[0] as AiResponse) ?? null)
    }
    setLoading(false)
  }, [opts.userId, opts.functionType, opts.sprintId, opts.limit])

  useEffect(() => {
    fetchResponses()
  }, [fetchResponses])

  // Realtime subscription for new AI responses
  useEffect(() => {
    if (!opts.userId && !opts.sprintId) return

    const filter = opts.sprintId
      ? `sprint_id=eq.${opts.sprintId}`
      : `user_id=eq.${opts.userId}`

    const channel = supabase
      .channel(`kira-responses-${opts.functionType || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_responses',
          filter,
        },
        (payload) => {
          const newResponse = payload.new as AiResponse
          // Only add if it matches our function_type filter
          if (opts.functionType && newResponse.function_type !== opts.functionType) {
            return
          }
          setResponses((prev) => [newResponse, ...prev].slice(0, opts.limit ?? 5))
          setLatest(newResponse)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [opts.userId, opts.sprintId, opts.functionType, opts.limit])

  const submitFeedback = useCallback(
    async (responseId: string, rating: number, text?: string) => {
      await supabase
        .from('ai_responses')
        .update({ feedback_rating: rating, feedback_text: text ?? null })
        .eq('id', responseId)
    },
    []
  )

  return { responses, latest, loading, refetch: fetchResponses, submitFeedback }
}
