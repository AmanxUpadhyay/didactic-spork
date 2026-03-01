import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface OptOut {
  feature: string
  opted_out: boolean
}

export function useOptOut() {
  const { profile } = useAuth()
  const [optOuts, setOptOuts] = useState<OptOut[]>([])
  const [loading, setLoading] = useState(true)
  const [migrated, setMigrated] = useState(false)

  const fetchOptOuts = useCallback(async () => {
    if (!profile?.id) return

    const { data } = await (supabase
      .from('feature_opt_outs' as any) as any)
      .select('feature, opted_out')
      .eq('user_id', profile.id)

    if (data) setOptOuts(data as OptOut[])
    setLoading(false)
  }, [profile?.id])

  // Migrate localStorage opt-outs to DB on first load
  useEffect(() => {
    if (!profile?.id || migrated) return

    const migrateFromLocalStorage = async () => {
      const features = ['mystery_box', 'decaying_points', 'streak_hostage']
      for (const feature of features) {
        const key = `optout_${feature}`
        const value = localStorage.getItem(key)
        if (value === '1') {
          await (supabase.from('feature_opt_outs' as any) as any).upsert(
            { user_id: profile.id, feature, opted_out: true },
            { onConflict: 'user_id,feature' },
          )
          localStorage.removeItem(key)
        }
      }
      setMigrated(true)
      fetchOptOuts()
    }

    migrateFromLocalStorage()
  }, [profile?.id, migrated, fetchOptOuts])

  useEffect(() => {
    if (migrated) fetchOptOuts()
  }, [migrated, fetchOptOuts])

  const isOptedOut = useCallback(
    (feature: string) => {
      return optOuts.some((o) => o.feature === feature && o.opted_out)
    },
    [optOuts],
  )

  const toggleOptOut = useCallback(
    async (feature: string) => {
      if (!profile?.id) return

      const current = isOptedOut(feature)
      await (supabase.from('feature_opt_outs' as any) as any).upsert(
        { user_id: profile.id, feature, opted_out: !current, opted_out_at: new Date().toISOString() },
        { onConflict: 'user_id,feature' },
      )
      fetchOptOuts()
    },
    [profile?.id, isOptedOut, fetchOptOuts],
  )

  return { isOptedOut, toggleOptOut, optOuts, loading }
}
