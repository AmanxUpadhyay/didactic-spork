import { useState, useEffect, useCallback } from 'react'
import { getSubscriptionStatus, subscribeToPush, unsubscribeFromPush, needsHomeScreenInstall, isIOSPWA } from '@/lib/push'
import { useAuth } from '@/hooks/useAuth'

export function useNotificationPermission() {
  const { profile } = useAuth()
  const [permission, setPermission] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default')
  const [loading, setLoading] = useState(false)
  const [iosNeedsInstall, setIosNeedsInstall] = useState(false)
  const [isIOSStandalone, setIsIOSStandalone] = useState(false)

  useEffect(() => {
    getSubscriptionStatus().then(setPermission)
    setIosNeedsInstall(needsHomeScreenInstall())
    setIsIOSStandalone(isIOSPWA())
  }, [])

  const requestPermission = useCallback(async () => {
    if (!profile?.id) return false
    setLoading(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result as typeof permission)
      if (result === 'granted') {
        await subscribeToPush(profile.id)
        return true
      }
      return false
    } catch (err) {
      console.error('Failed to request permission:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [profile?.id])

  const disableNotifications = useCallback(async () => {
    if (!profile?.id) return
    setLoading(true)
    try {
      await unsubscribeFromPush(profile.id)
      setPermission('default')
    } catch (err) {
      console.error('Failed to disable notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [profile?.id])

  return {
    permission,
    loading,
    iosNeedsInstall,
    isIOSStandalone,
    isSupported: permission !== 'unsupported',
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    requestPermission,
    disableNotifications,
  }
}
