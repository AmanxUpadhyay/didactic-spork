import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type AppreciationNote = Database['public']['Tables']['appreciation_notes']['Row']

interface AppreciationGate {
  my_note_written: boolean
  partner_note_written: boolean
  gate_passed: boolean
}

export function useAppreciation(
  userId: string | undefined,
  partnerId: string | undefined,
  sprintId: string | undefined,
) {
  const [gate, setGate] = useState<AppreciationGate | null>(null)
  const [myNote, setMyNote] = useState<AppreciationNote | null>(null)
  const [partnerNote, setPartnerNote] = useState<AppreciationNote | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchGate = useCallback(async () => {
    if (!userId || !sprintId) {
      setLoading(false)
      return
    }

    const { data } = await supabase.rpc('check_appreciation_gate', {
      p_sprint_id: sprintId,
    })

    if (data) {
      setGate(data as unknown as AppreciationGate)
    }
    setLoading(false)
  }, [userId, sprintId])

  const fetchNotes = useCallback(async () => {
    if (!userId || !sprintId) return

    const { data } = await supabase
      .from('appreciation_notes')
      .select('*')
      .eq('sprint_id', sprintId)

    if (data) {
      setMyNote(data.find((n) => n.author_id === userId) ?? null)
      setPartnerNote(data.find((n) => n.author_id !== userId) ?? null)
    }
  }, [userId, sprintId])

  useEffect(() => {
    fetchGate()
    fetchNotes()
  }, [fetchGate, fetchNotes])

  // Realtime subscription on appreciation_notes
  useEffect(() => {
    if (!userId || !sprintId) return

    const channel = supabase
      .channel('appreciation-notes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'appreciation_notes' },
        () => {
          fetchGate()
          fetchNotes()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, sprintId, fetchGate, fetchNotes])

  async function submitNote(content: string): Promise<{ success: boolean; error?: string }> {
    if (!userId || !partnerId || !sprintId) {
      return { success: false, error: 'Missing context' }
    }

    const { error } = await supabase.from('appreciation_notes').insert({
      sprint_id: sprintId,
      author_id: userId,
      recipient_id: partnerId,
      content,
    })

    if (error) return { success: false, error: error.message }

    await fetchGate()
    await fetchNotes()
    return { success: true }
  }

  return { gate, myNote, partnerNote, loading, submitNote }
}
