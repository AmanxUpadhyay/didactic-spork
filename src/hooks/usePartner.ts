import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface PartnerProfile {
  id: string
  name: string
  avatar_url: string | null
  timezone: string
}

export function usePartner(userId: string | undefined) {
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(null)
  const [isPaired, setIsPaired] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchPartner = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    const { data } = await supabase.rpc('get_partner_id')
    if (data) {
      setPartnerId(data)
      setIsPaired(true)
      const { data: profile } = await supabase
        .from('users')
        .select('id, name, avatar_url, timezone')
        .eq('id', data)
        .single()
      if (profile) setPartnerProfile(profile)
    } else {
      setPartnerId(null)
      setIsPaired(false)
      setPartnerProfile(null)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchPartner()
  }, [fetchPartner])

  // Listen for pairing events in realtime
  useEffect(() => {
    if (!userId || isPaired) return

    const channel = supabase
      .channel('pairing')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'partner_pairs' },
        (payload) => {
          const row = payload.new as { user_a: string; user_b: string }
          if (row.user_a === userId || row.user_b === userId) {
            fetchPartner()
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, isPaired, fetchPartner])

  async function generateInviteCode(): Promise<{ success: boolean; code?: string; error?: string }> {
    const { data, error } = await supabase.rpc('generate_invite_code')
    if (error) return { success: false, error: error.message }
    const result = data as { success: boolean; code?: string; error?: string }
    return result
  }

  async function claimInviteCode(code: string): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await supabase.rpc('claim_invite_code', { p_code: code.toUpperCase() })
    if (error) return { success: false, error: error.message }
    const result = data as { success: boolean; pair_id?: string; error?: string }
    if (result.success) {
      await fetchPartner()
    }
    return result
  }

  return {
    partnerId,
    partnerProfile,
    isPaired,
    loading,
    generateInviteCode,
    claimInviteCode,
    refetch: fetchPartner,
  }
}
