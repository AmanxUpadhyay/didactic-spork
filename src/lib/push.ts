import { supabase } from '@/lib/supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

/**
 * Convert a URL-safe base64 VAPID key to a Uint8Array
 * for use with PushManager.subscribe().
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Subscribe the current browser to push notifications and persist
 * the subscription in the push_subscriptions table.
 *
 * Returns the PushSubscription on success, null on failure.
 */
export async function subscribeToPush(
  userId: string,
): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })

    const json = subscription.toJSON()
    const endpoint = json.endpoint!
    const p256dh = json.keys?.p256dh ?? ''
    const authKey = json.keys?.auth ?? ''

    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: userId,
        endpoint,
        p256dh,
        auth_key: authKey,
        user_agent: navigator.userAgent,
        active: true,
        deactivated_at: null,
      },
      { onConflict: 'endpoint' },
    )

    if (error) {
      console.error('[push] Failed to upsert subscription:', error)
      return null
    }

    return subscription
  } catch (err) {
    console.error('[push] subscribeToPush failed:', err)
    return null
  }
}

/**
 * Unsubscribe the current browser from push notifications and
 * mark all subscriptions for this user as inactive in the database.
 */
export async function unsubscribeFromPush(userId: string): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .update({
        active: false,
        deactivated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (error) {
      console.error('[push] Failed to deactivate subscriptions:', error)
    }
  } catch (err) {
    console.error('[push] unsubscribeFromPush failed:', err)
  }
}

/**
 * Return the current push permission state.
 *
 * - 'granted'     — user has allowed notifications
 * - 'denied'      — user has blocked notifications
 * - 'default'     — user has not yet been prompted
 * - 'unsupported' — browser/context does not support push
 */
export async function getSubscriptionStatus(): Promise<
  'granted' | 'denied' | 'default' | 'unsupported'
> {
  try {
    if (!('PushManager' in window)) return 'unsupported'
    if (!('Notification' in window)) return 'unsupported'
    return Notification.permission
  } catch (err) {
    console.error('[push] getSubscriptionStatus failed:', err)
    return 'unsupported'
  }
}

/**
 * Returns true when running as a standalone PWA on an iOS device
 * (iOS 16.4+ supports Web Push in standalone mode).
 */
export function isIOSPWA(): boolean {
  try {
    return (
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      (navigator as any).standalone === true
    )
  } catch {
    return false
  }
}

/**
 * Returns true when running on iOS but NOT in standalone mode,
 * meaning the user needs to "Add to Home Screen" before push
 * notifications will work.
 */
export function needsHomeScreenInstall(): boolean {
  try {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    if (!isIOS) return false

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true

    return !isStandalone
  } catch {
    return false
  }
}

/**
 * Re-persist a push subscription after the browser rotates keys
 * (triggered via pushsubscriptionchange → SW postMessage).
 */
export async function updateSubscription(
  subscription: PushSubscription,
): Promise<void> {
  try {
    const json = subscription.toJSON()
    const endpoint = json.endpoint!
    const p256dh = json.keys?.p256dh ?? ''
    const authKey = json.keys?.auth ?? ''

    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        endpoint,
        p256dh,
        auth_key: authKey,
        user_agent: navigator.userAgent,
        active: true,
        deactivated_at: null,
      } as any,
      { onConflict: 'endpoint' },
    )

    if (error) {
      console.error('[push] Failed to update subscription:', error)
    }
  } catch (err) {
    console.error('[push] updateSubscription failed:', err)
  }
}
