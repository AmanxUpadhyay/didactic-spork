import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface InAppNotification {
  id: string
  title: string
  body: string
  category: string
  data: Record<string, unknown> | null
  created_at: string
}

export function useRealtimeNotifications() {
  const { profile } = useAuth()
  const [notifications, setNotifications] = useState<InAppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [latestNotification, setLatestNotification] = useState<InAppNotification | null>(null)

  useEffect(() => {
    if (!profile?.id) return

    // Load recent notifications
    async function loadRecent() {
      const { data } = await supabase
        .from('notification_queue')
        .select('id, title, body, category, data, created_at')
        .eq('user_id', profile!.id)
        .in('status', ['pending', 'delivered'])
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) {
        setNotifications(data as InAppNotification[])
        setUnreadCount(data.length)
      }
    }
    loadRecent()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('notification_queue_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_queue',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          const row = payload.new as InAppNotification
          setNotifications((prev) => [row, ...prev].slice(0, 50))
          setUnreadCount((prev) => prev + 1)
          setLatestNotification(row)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id])

  const clearLatest = useCallback(() => {
    setLatestNotification(null)
  }, [])

  const markAllRead = useCallback(() => {
    setUnreadCount(0)
  }, [])

  return {
    notifications,
    unreadCount,
    latestNotification,
    clearLatest,
    markAllRead,
  }
}
