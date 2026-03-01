import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface NotificationPreferences {
  enabled: boolean
  quiet_hours_start: string | null
  quiet_hours_end: string | null
  categories_enabled: Record<string, boolean> | null
  max_daily_notifications: number
  timezone: string
}

const DEFAULT_PREFS: NotificationPreferences = {
  enabled: true,
  quiet_hours_start: null,
  quiet_hours_end: null,
  categories_enabled: null,
  max_daily_notifications: 10,
  timezone: 'Europe/London',
}

export function useNotificationPreferences() {
  const { profile } = useAuth()
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return

    async function load() {
      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', profile!.id)
        .maybeSingle()

      if (data) {
        setPrefs({
          enabled: data.enabled ?? true,
          quiet_hours_start: data.quiet_hours_start,
          quiet_hours_end: data.quiet_hours_end,
          categories_enabled: data.categories_enabled as Record<string, boolean> | null,
          max_daily_notifications: data.max_daily_notifications ?? 10,
          timezone: data.timezone ?? 'Europe/London',
        })
      }
      setLoading(false)
    }
    load()
  }, [profile?.id])

  const updatePrefs = useCallback(async (updates: Partial<NotificationPreferences>) => {
    if (!profile?.id) return

    const newPrefs = { ...prefs, ...updates }
    setPrefs(newPrefs)

    await supabase
      .from('notification_preferences')
      .upsert({
        user_id: profile.id,
        ...newPrefs,
        updated_at: new Date().toISOString(),
      })
  }, [profile?.id, prefs])

  const toggleCategory = useCallback(async (category: string, enabled: boolean) => {
    const current = prefs.categories_enabled || {}
    await updatePrefs({
      categories_enabled: { ...current, [category]: enabled },
    })
  }, [prefs.categories_enabled, updatePrefs])

  return {
    prefs,
    loading,
    updatePrefs,
    toggleCategory,
  }
}
