# PWA push notifications for a couples' habit tracker

**Web push notifications in a PWA can deliver near-native notification experiences on Android and desktop, with meaningful (if limited) support on iOS since version 16.4.** This guide provides a complete implementation blueprint for a Supabase-backed couples' accountability app — covering the full stack from VAPID key generation and service worker registration through to an escalation-aware notification scheduler, with specific code for Supabase Edge Functions running on Deno. The two-user constraint simplifies many scaling concerns but introduces a unique dynamic: every notification can reference the partner, making social pressure the app's most powerful engagement lever.

---

## 1. How PWA push notifications actually work

Three browser APIs form the notification stack. **Service Workers** are background JavaScript threads that persist after the tab closes — they listen for incoming push events and display notifications even when the app isn't open. The **Push API** (`PushManager`) creates a subscription with the browser's push service (FCM for Chrome, Mozilla Autopush for Firefox, APNs for Safari), returning a unique endpoint URL. The **Notification API** renders system-level notifications through `self.registration.showNotification()`.

The full lifecycle runs in five steps:

```
Register SW → Request permission → Subscribe to push → Store subscription on server → Server POSTs encrypted payload to endpoint → Service worker receives `push` event → Displays notification
```

Each `PushSubscription` object contains three critical values: an `endpoint` URL (unique per device/browser), a `p256dh` public key for payload encryption, and an `auth` secret for key derivation. The server signs requests with **VAPID keys** (P-256 ECDSA) per RFC 8292, encrypts payloads using **aes128gcm** content encoding per RFC 8291, and POSTs to the endpoint with `TTL`, `Urgency`, and `Topic` headers.

### Service worker registration and push subscription

```typescript
// src/lib/push.ts
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) throw new Error('Service workers unsupported');
  return navigator.serviceWorker.register('/sw.js', { scope: '/' });
}

export async function subscribeToPush(
  registration: ServiceWorkerRegistration,
  userId: string
): Promise<PushSubscription | null> {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  // Store in Supabase
  const sub = subscription.toJSON();
  await supabase.from('push_subscriptions').upsert({
    user_id: userId,
    endpoint: sub.endpoint,
    p256dh: sub.keys!.p256dh,
    auth: sub.keys!.auth,
    user_agent: navigator.userAgent,
    active: true,
  }, { onConflict: 'endpoint' });

  return subscription;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}
```

### The service worker

```javascript
// public/sw.js
self.addEventListener('push', (event) => {
  const payload = event.data?.json() ?? { title: 'Update', body: 'Check in with your partner' };
  
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      image: payload.image || undefined,
      tag: payload.tag || 'default',         // same tag replaces previous
      data: { url: payload.url || '/' },
      actions: payload.actions || [],
      vibrate: [100, 50, 100],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  
  if (event.action === 'log-habit') {
    event.waitUntil(clients.openWindow('/habits/today?action=log'));
  } else if (event.action === 'snooze') {
    // POST to server to reschedule in 30 min
    event.waitUntil(
      fetch('/api/snooze-notification', {
        method: 'POST',
        body: JSON.stringify({ tag: event.notification.tag }),
      })
    );
  } else {
    event.waitUntil(clients.openWindow(targetUrl));
  }
});

// Handle subscription renewal
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY,
    }).then(subscription => {
      return fetch('/api/update-subscription', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          old_endpoint: event.oldSubscription?.endpoint,
          new_subscription: subscription.toJSON(),
        }),
      });
    })
  );
});
```

---

## 2. Browser support landscape — what works where in 2026

**Android and desktop browsers offer full, mature push support.** Chrome, Firefox, Edge, and Samsung Internet on Android all handle web push identically to native notifications — including lock screen display, screen wake, sound, vibration, action buttons, and large images. Desktop Chrome, Firefox, Edge, and Safari (since 16.1 on macOS Ventura) are equally capable.

**iOS is the constraint that shapes every architectural decision.** Apple added PWA web push in **iOS 16.4 (March 2023)** using APNs, but with hard restrictions:

| Capability | Android | iOS (16.4+) | Desktop |
|---|:---:|:---:|:---:|
| Push from browser tab | ✅ | ❌ | ✅ |
| Push from home screen PWA | ✅ | ✅ | ✅ |
| Lock screen display | ✅ | ✅ | N/A |
| Screen wake | ✅ | OS-dependent | N/A |
| Sound | ✅ | ✅ (iOS 17+) | ✅ |
| Vibration API | ✅ | ❌ | N/A |
| Action buttons | ✅ (up to 2) | ❌ | ✅ |
| Large images | ✅ | Limited | ✅ |
| Badge count on icon | ✅ | ✅ | ✅ |
| Apple Watch mirroring | N/A | ✅ | N/A |

The critical iOS constraints for this app are:

- **Home screen installation is mandatory.** The PWA must be added via Safari's Share → Add to Home Screen. The manifest must specify `"display": "standalone"` or `"fullscreen"`. All third-party iOS browsers (Chrome, Firefox, Edge) use WebKit and cannot deliver push — only home-screen apps added via Safari work.
- **No action buttons.** Tapping a notification opens the app; you cannot offer "Log Habit" / "Snooze" buttons on iOS. Handle this by deep-linking through the `data.url` field instead.
- **Permission prompt fires once.** If the user denies, they must manually re-enable in Settings → [App Name] → Notifications. The pre-permission pattern (a custom in-app dialog before triggering the native prompt) is essential.
- **Sound required iOS 17+** and may require the user to delete and re-add the PWA to surface the Sound toggle in notification settings.
- **Apple Intelligence (iOS 18.1+)** may group, summarize, or deprioritize notifications. Non–Time Sensitive notifications could be deferred.

### Maximizing the opt-in flow for two users

Since this app serves exactly two known users (a couple), the opt-in strategy is straightforward but must not waste the one-shot iOS permission prompt. Implement a **pre-permission pattern**:

```typescript
// components/NotificationOptIn.tsx
function NotificationOptIn() {
  const [showPrompt, setShowPrompt] = useState(false);
  
  useEffect(() => {
    if (Notification.permission === 'default') {
      // Show after onboarding, not on first load
      setShowPrompt(true);
    }
  }, []);

  const handleEnable = async () => {
    setShowPrompt(false);
    const reg = await registerServiceWorker();
    await subscribeToPush(reg, currentUser.id);
  };

  if (!showPrompt) return null;
  
  return (
    <Dialog open>
      <h2>Stay accountable together 💪</h2>
      <p>Get notified when {partnerName} completes habits, 
         when deadlines approach, and when your streak is at risk.</p>
      <p>We send 2-3 notifications per day, never during sleep hours.</p>
      <Button onClick={handleEnable}>Enable notifications</Button>
      <Button variant="ghost" onClick={() => setShowPrompt(false)}>
        Maybe later
      </Button>
    </Dialog>
  );
}
```

For iOS users, detect the platform and show a guided installation flow with visual instructions for Add to Home Screen before requesting push permission — push subscription will silently fail if the PWA isn't installed.

### Can push notifications wake the screen?

**On Android, yes — web push notifications wake the screen and appear on the lock screen identically to native notifications.** This is critical for interrupting doomscrolling. On iOS, notifications appear on the lock screen and in Notification Center, but screen wake behavior follows the device's notification settings. Always-On Display devices (iPhone 14 Pro+) show notifications without waking. **Android 15 introduced Notification Cooldown**, which gradually reduces volume/vibration when multiple notifications arrive from the same app in quick succession — a reason to space notifications at least 2 hours apart.

---

## 3. The Supabase notification engine

### VAPID key generation

Generate keys once and store them permanently. Changing keys invalidates all existing subscriptions.

```bash
# Method 1: web-push CLI
npx web-push generate-vapid-keys

# Method 2: OpenSSL
openssl ecparam -genkey -name prime256v1 | openssl ec -out vapid_private.pem

# Store as Supabase secrets
supabase secrets set VAPID_PUBLIC_KEY="BEl62iUYh3..."
supabase secrets set VAPID_PRIVATE_KEY="UUxI4O8-FbR..."
supabase secrets set VAPID_SUBJECT="mailto:hello@yourapp.com"
```

### Database schema

```sql
-- =============================================
-- Push subscription storage
-- =============================================
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_successful_push timestamptz,
  deactivated_at timestamptz
);
CREATE INDEX idx_push_subs_user ON push_subscriptions(user_id) WHERE active = true;

-- =============================================
-- Notification schedule definitions
-- =============================================
CREATE TYPE public.notif_category AS ENUM (
  'morning_briefing', 'task_deadline', 'partner_activity',
  'mood_checkin', 'sprint_results', 'streak_warning',
  'sprint_start', 'nudge', 'celebration'
);

CREATE TABLE public.notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category notif_category NOT NULL,
  title_template text NOT NULL,       -- supports {{partner_name}}, {{streak}}, etc.
  body_template text NOT NULL,
  urgency text DEFAULT 'normal',      -- very-low, low, normal, high
  tag text NOT NULL,                   -- for notification replacement
  actions jsonb DEFAULT '[]',          -- [{action, title, icon}]
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- Notification queue with scheduling
-- =============================================
CREATE TYPE public.notif_status AS ENUM (
  'scheduled', 'pending', 'processing', 'delivered', 'failed', 'cancelled'
);

CREATE TABLE public.notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  template_id uuid REFERENCES notification_templates(id),
  category notif_category NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  data jsonb DEFAULT '{}',
  tag text,
  urgency text DEFAULT 'normal',
  actions jsonb DEFAULT '[]',
  status notif_status NOT NULL DEFAULT 'scheduled',
  scheduled_for timestamptz NOT NULL,
  sent_at timestamptz,
  retry_count int NOT NULL DEFAULT 0,
  max_retries int NOT NULL DEFAULT 3,
  error_code int,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_queue_due ON notification_queue(status, scheduled_for)
  WHERE status IN ('scheduled', 'pending');

-- =============================================
-- Delivery log (audit trail)
-- =============================================
CREATE TABLE public.notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id uuid REFERENCES notification_queue(id),
  subscription_id uuid REFERENCES push_subscriptions(id),
  status text NOT NULL,
  error_code int,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- User notification preferences
-- =============================================
CREATE TABLE public.notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  enabled boolean DEFAULT true,
  quiet_hours_start time DEFAULT '00:00',   -- midnight
  quiet_hours_end time DEFAULT '09:00',     -- 9 AM
  max_daily_notifications int DEFAULT 8,
  categories_enabled jsonb DEFAULT '{
    "morning_briefing": true,
    "task_deadline": true,
    "partner_activity": true,
    "mood_checkin": true,
    "sprint_results": true,
    "streak_warning": true,
    "sprint_start": true,
    "nudge": true,
    "celebration": true
  }',
  timezone text DEFAULT 'Europe/London',
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- Row Level Security
-- =============================================
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own subscriptions" ON push_subscriptions
  FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users read own notifications" ON notification_queue
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users manage own preferences" ON notification_preferences
  FOR ALL TO authenticated USING (user_id = auth.uid());
```

### Edge Function: send push notifications

Since Supabase Edge Functions run on Deno, the standard Node.js `web-push` library doesn't work. Use **`@negrel/webpush`** from JSR (pure Web APIs, designed for edge runtimes):

```typescript
// supabase/functions/send-push/index.ts
import { createClient } from "npm:@supabase/supabase-js@2";
import * as webpush from "jsr:@negrel/webpush";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const vapidKeys = {
  publicKey: Deno.env.get("VAPID_PUBLIC_KEY")!,
  privateKey: Deno.env.get("VAPID_PRIVATE_KEY")!,
};

const appServer = await webpush.ApplicationServer.new({
  contactInformation: "mailto:" + Deno.env.get("VAPID_SUBJECT")!,
  vapidKeys,
});

Deno.serve(async (req) => {
  const { batch_size = 50 } = await req.json();

  // Fetch due notifications
  const { data: items } = await supabase
    .from("notification_queue")
    .select("*, push_subscriptions!inner(*)")
    .in("status", ["scheduled", "pending"])
    .lte("scheduled_for", new Date().toISOString())
    .eq("push_subscriptions.active", true)
    .order("scheduled_for")
    .limit(batch_size);

  if (!items?.length) {
    return new Response(JSON.stringify({ processed: 0 }));
  }

  const results = [];

  for (const item of items) {
    // Fetch all active subscriptions for this user
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", item.user_id)
      .eq("active", true);

    for (const sub of subs || []) {
      try {
        const subscriber = appServer.subscribe({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        });

        await subscriber.pushTextMessage(
          JSON.stringify({
            title: item.title,
            body: item.body,
            tag: item.tag,
            url: item.data?.url || "/",
            actions: item.actions,
            image: item.data?.image,
          }),
          {}
        );

        await supabase.from("notification_log").insert({
          queue_id: item.id,
          subscription_id: sub.id,
          status: "delivered",
        });

        await supabase
          .from("push_subscriptions")
          .update({ last_successful_push: new Date().toISOString() })
          .eq("id", sub.id);

      } catch (err) {
        const code = err.statusCode || err.status || 500;

        // 404/410 = subscription dead — deactivate
        if (code === 404 || code === 410) {
          await supabase
            .from("push_subscriptions")
            .update({ active: false, deactivated_at: new Date().toISOString() })
            .eq("id", sub.id);
        }

        await supabase.from("notification_log").insert({
          queue_id: item.id,
          subscription_id: sub.id,
          status: "failed",
          error_code: code,
          error_message: err.message,
        });
      }
    }

    // Update queue status
    await supabase
      .from("notification_queue")
      .update({ status: "delivered", sent_at: new Date().toISOString() })
      .eq("id", item.id);

    results.push(item.id);
  }

  return new Response(JSON.stringify({ processed: results.length }));
});
```

### Scheduling with pg_cron

Enable the required extensions and schedule the notification processor to run every minute:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Store Edge Function URL in Vault
SELECT vault.create_secret(
  'https://YOUR-PROJECT.supabase.co',
  'project_url'
);
SELECT vault.create_secret(
  'YOUR_SERVICE_ROLE_KEY',
  'service_role_key'
);

-- Process notification queue every minute
SELECT cron.schedule(
  'process-notification-queue',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url')
           || '/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' ||
        (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := '{"batch_size": 50}'::jsonb
  ) AS request_id;
  $$
);

-- Retry failed notifications every 5 minutes
SELECT cron.schedule(
  'retry-failed-notifications',
  '*/5 * * * *',
  $$
  UPDATE notification_queue
  SET status = 'pending',
      scheduled_for = now() + (power(5, retry_count) || ' minutes')::interval,
      retry_count = retry_count + 1
  WHERE status = 'failed'
    AND retry_count < max_retries
    AND error_code IN (429, 500, 502, 503);
  $$
);

-- Clean up old delivered notifications weekly
SELECT cron.schedule(
  'cleanup-old-notifications',
  '0 3 * * 0',
  $$
  DELETE FROM notification_queue
  WHERE status = 'delivered' AND created_at < now() - interval '30 days';
  DELETE FROM notification_log
  WHERE created_at < now() - interval '90 days';
  $$
);
```

### Supabase Realtime as a secondary in-app channel

When the app is open, bypass push entirely and use Realtime for instant in-app updates:

```typescript
// hooks/useRealtimeNotifications.ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeNotifications(userId: string, onNotification: (n: any) => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_queue',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => onNotification(payload.new)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);
}
```

Enable Realtime on the table: `ALTER PUBLICATION supabase_realtime ADD TABLE notification_queue;`

---

## 4. Notification scheduling engine with Claude API integration

The scheduling engine is a Supabase Edge Function (or database function) that runs on a schedule — generating the day's notifications each morning, and event-driven notifications in response to user actions. For a two-user app, the server-side approach is unambiguously correct: client-side scheduling with `setTimeout` dies when the tab closes, and service worker `periodicSync` has no iOS support.

### The notification scheduler

```typescript
// supabase/functions/schedule-daily-notifications/index.ts
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Sheffield UK timezone
const TZ = "Europe/London";

Deno.serve(async () => {
  const { data: users } = await supabase
    .from("profiles")
    .select("id, display_name, partner_id, notification_preferences(*)");

  const today = new Date();
  const dayOfWeek = today.toLocaleDateString("en-GB", { weekday: "long", timeZone: TZ });

  for (const user of users || []) {
    const prefs = user.notification_preferences?.[0];
    if (!prefs?.enabled) continue;

    const notifications = [];

    // 1. Morning briefing (9:30 AM)
    notifications.push({
      user_id: user.id,
      category: "morning_briefing",
      title: dayOfWeek === "Monday" ? "New sprint starts now 🚀" : "Good morning ☀️",
      body: await buildMorningBriefing(user),
      tag: "morning-briefing",
      urgency: "normal",
      scheduled_for: todayAt("09:30", TZ),
      data: { url: "/dashboard" },
    });

    // 2. Mood check-in (11:30 PM)
    if (prefs.categories_enabled?.mood_checkin) {
      notifications.push({
        user_id: user.id,
        category: "mood_checkin",
        title: "How was your day? 🌙",
        body: "Quick mood check-in before bed",
        tag: "mood-checkin",
        urgency: "low",
        scheduled_for: todayAt("23:30", TZ),
        data: { url: "/mood" },
        actions: [
          { action: "mood-good", title: "😊 Good" },
          { action: "mood-bad", title: "😔 Tough" },
        ],
      });
    }

    // 3. Sprint results (Sunday 10 PM)
    if (dayOfWeek === "Sunday") {
      notifications.push({
        user_id: user.id,
        category: "sprint_results",
        title: "Sprint results are in 🏆",
        body: await buildSprintSummary(user),
        tag: "sprint-results",
        urgency: "normal",
        scheduled_for: todayAt("22:00", TZ),
        data: { url: "/sprint/results" },
      });
    }

    // 4. Task deadline escalation — query upcoming deadlines
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("completed", false)
      .gte("deadline", today.toISOString())
      .order("deadline");

    for (const task of tasks || []) {
      const deadlineNotifs = buildDeadlineEscalation(user, task, TZ, prefs);
      notifications.push(...deadlineNotifs);
    }

    // Insert all, ignoring quiet hours violations
    const filtered = notifications.filter(
      (n) => !isDuringQuietHours(n.scheduled_for, prefs, TZ)
    );

    if (filtered.length > 0) {
      await supabase.from("notification_queue").insert(
        filtered.map((n) => ({ ...n, status: "scheduled" }))
      );
    }
  }

  return new Response(JSON.stringify({ ok: true }));
});

function todayAt(time: string, tz: string): string {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  // Convert to target timezone
  const formatted = d.toLocaleDateString("en-CA", { timeZone: tz });
  return new Date(`${formatted}T${time}:00`).toISOString();
}

function isDuringQuietHours(
  isoTime: string, prefs: any, tz: string
): boolean {
  const hour = new Date(isoTime).toLocaleTimeString("en-GB", {
    timeZone: tz, hour: "2-digit", hour12: false,
  });
  const h = parseInt(hour);
  // Default quiet: midnight (0) to 9 AM
  const start = parseInt(prefs.quiet_hours_start?.split(":")[0] || "0");
  const end = parseInt(prefs.quiet_hours_end?.split(":")[0] || "9");
  return h >= start && h < end;
}
```

### Deadline escalation logic

The escalation sequence increases urgency as deadlines approach, with **both tone and frequency** intensifying:

```typescript
function buildDeadlineEscalation(
  user: any, task: any, tz: string, prefs: any
): any[] {
  const deadline = new Date(task.deadline);
  const now = new Date();
  const hoursUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
  const notifications = [];

  const escalation = [
    { hoursBeforeDeadline: 168, title: "📋 {task} due in 1 week",
      body: "Plenty of time — but don't leave it to the last minute",
      urgency: "very-low" },
    { hoursBeforeDeadline: 72, title: "📋 {task} due in 3 days",
      body: "Getting closer — have you started?",
      urgency: "low" },
    { hoursBeforeDeadline: 24, title: "⚠️ {task} due tomorrow!",
      body: "{partner} might ask how it's going...",
      urgency: "normal" },
    { hoursBeforeDeadline: 4, title: "🔴 {task} due in 4 hours",
      body: "Still time. You've got this.",
      urgency: "high" },
    { hoursBeforeDeadline: 1, title: "🚨 {task} due in 1 HOUR",
      body: "Final stretch — {partner} is counting on you",
      urgency: "high" },
    { hoursBeforeDeadline: 0.5, title: "⏰ 30 minutes left for {task}!",
      body: "Now or never!",
      urgency: "high" },
    { hoursBeforeDeadline: -0.01, title: "❌ {task} is overdue",
      body: "{partner} can see this. Time to catch up.",
      urgency: "high" },
  ];

  for (const step of escalation) {
    const sendAt = new Date(deadline.getTime() - step.hoursBeforeDeadline * 3600000);
    if (sendAt > now && !isDuringQuietHours(sendAt.toISOString(), prefs, tz)) {
      notifications.push({
        user_id: user.id,
        category: "task_deadline",
        title: step.title
          .replace("{task}", task.name)
          .replace("{partner}", user.partner_name),
        body: step.body
          .replace("{partner}", user.partner_name),
        tag: `deadline-${task.id}`,  // replaces previous deadline notif for same task
        urgency: step.urgency,
        scheduled_for: sendAt.toISOString(),
        data: { url: `/tasks/${task.id}`, task_id: task.id },
      });
    }
  }

  return notifications;
}
```

### Event-driven notifications via database triggers

Partner activity notifications fire immediately when one user completes a task:

```sql
-- Trigger: notify partner when a habit is completed
CREATE OR REPLACE FUNCTION notify_partner_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  partner record;
  partner_prefs record;
  current_hour int;
BEGIN
  -- Only fire on completion
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    -- Get partner info
    SELECT p.*, np.* INTO partner
    FROM profiles p
    JOIN notification_preferences np ON np.user_id = p.id
    WHERE p.id = (SELECT partner_id FROM profiles WHERE id = NEW.user_id);
    
    -- Quiet hours check (Sheffield time)
    current_hour := EXTRACT(HOUR FROM now() AT TIME ZONE 'Europe/London');
    IF current_hour >= 0 AND current_hour < 9 THEN
      RETURN NEW; -- Skip during quiet hours
    END IF;

    INSERT INTO notification_queue (
      user_id, category, title, body, tag, urgency, scheduled_for, data
    ) VALUES (
      partner.id,
      'partner_activity',
      '✅ ' || (SELECT display_name FROM profiles WHERE id = NEW.user_id) || ' just completed a habit!',
      (SELECT name FROM habits WHERE id = NEW.habit_id) || ' — your turn?',
      'partner-activity',
      'normal',
      now(),
      jsonb_build_object('url', '/habits/today', 'habit_id', NEW.habit_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_habit_completed
  AFTER UPDATE ON habit_completions
  FOR EACH ROW EXECUTE FUNCTION notify_partner_on_completion();
```

Schedule the daily notification generator to run each morning at 9:15 AM UK time:

```sql
SELECT cron.schedule(
  'generate-daily-notifications',
  '15 9 * * *',  -- 9:15 AM UTC (adjust for BST: '15 8 * * *' during summer)
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url')
           || '/functions/v1/schedule-daily-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' ||
        (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
```

---

## 5. The complete notification schedule matrix

All times are in **UK local time (Europe/London)**. Quiet hours enforced from **00:00–09:00**.

| Notification | Time | Trigger | Tag | Urgency | Frequency |
|---|---|---|---|---|---|
| **Morning briefing** | 09:30 | Cron (daily) | `morning-briefing` | Normal | Daily |
| **Sprint start** | 09:30 Mon | Cron (weekly) | `sprint-start` | Normal | Weekly |
| **Partner completed habit** | Real-time | DB trigger | `partner-activity` | Normal | Event-driven |
| **Task deadline: 1 week** | Variable | Scheduler | `deadline-{id}` | Very low | Per task |
| **Task deadline: 3 days** | Variable | Scheduler | `deadline-{id}` | Low | Per task |
| **Task deadline: 1 day** | Variable | Scheduler | `deadline-{id}` | Normal | Per task |
| **Task deadline: 4 hours** | Variable | Scheduler | `deadline-{id}` | High | Per task |
| **Task deadline: 1 hour** | Variable | Scheduler | `deadline-{id}` | High | Per task |
| **Task deadline: 30 min** | Variable | Scheduler | `deadline-{id}` | High | Per task |
| **Task overdue** | Variable | Scheduler | `deadline-{id}` | High | Per task |
| **Streak warning** | 20:00 | Checker (daily) | `streak-warning` | High | When at risk |
| **Sprint results** | 22:00 Sun | Cron (weekly) | `sprint-results` | Normal | Weekly |
| **Mood check-in** | 23:30 | Cron (daily) | `mood-checkin` | Low | Daily |
| **Partner nudge** | Instant | User-initiated | `partner-nudge` | High | On demand |
| **Celebration** | Real-time | DB trigger | `celebration` | Low | Event-driven |

The `tag` field is critical — using `deadline-{taskId}` means each escalation step **replaces** the previous one for the same task, preventing notification pile-up. A user with three pending tasks won't see six stale deadline reminders; they'll see at most three (one per task, the most recent escalation level).

### Daily notification budget

**Hard cap: 8 notifications per user per day.** Typical day distribution:

- Morning briefing: 1
- Partner activity (capped): 2
- Deadline escalation (most urgent only): 2
- Streak warning (if applicable): 1
- Mood check-in: 1
- Buffer for nudges/celebrations: 1

The throttling function checks the daily count before inserting:

```sql
CREATE OR REPLACE FUNCTION check_daily_notification_limit()
RETURNS TRIGGER AS $$
DECLARE
  daily_count int;
  max_daily int;
BEGIN
  SELECT count(*) INTO daily_count
  FROM notification_queue
  WHERE user_id = NEW.user_id
    AND scheduled_for::date = NEW.scheduled_for::date
    AND status != 'cancelled';
    
  SELECT max_daily_notifications INTO max_daily
  FROM notification_preferences
  WHERE user_id = NEW.user_id;
    
  IF daily_count >= COALESCE(max_daily, 8) THEN
    -- Only allow high-urgency notifications to exceed cap
    IF NEW.urgency != 'high' THEN
      NEW.status := 'cancelled';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_daily_limit
  BEFORE INSERT ON notification_queue
  FOR EACH ROW EXECUTE FUNCTION check_daily_notification_limit();
```

---

## 6. Notification content strategy that drives action

Research on notification psychology reveals three principles that matter most for a couples' app: **personalization with partner data boosts engagement by 259%** over generic messages, **partner-referenced notifications feel like human messages** (which are always valued higher than automated ones), and **novelty rotation prevents habituation** (Duolingo's bandit algorithm explicitly demotes recently-seen templates).

### Notification template pool

Rotate through these templates to prevent staleness. Never repeat the same template to the same user within 5 days:

```typescript
const MORNING_TEMPLATES = [
  { title: "Good morning ☀️", body: "You and {{partner}} have {{total_tasks}} habits today" },
  { title: "Rise and shine 🌅", body: "{{partner}} is already up — {{partner_completed}} habits done" },
  { title: "New day, new wins 💪", body: "Your streak is at {{streak}} days. Keep it alive!" },
  { title: "{{streak}}-day streak! 🔥", body: "What's on the agenda today?" },
  { title: "Monday sprint begins 🚀", body: "Fresh week. {{partner}} is counting on you." },
];

const PARTNER_ACTIVITY_TEMPLATES = [
  { title: "✅ {{partner}} just crushed it!", body: "{{habit_name}} — done. Your turn?" },
  { title: "{{partner}} is on fire 🔥", body: "They just completed {{habit_name}}" },
  { title: "{{partner}} checked one off", body: "{{habit_name}} ✓ — match their energy?" },
];

const STREAK_WARNING_TEMPLATES = [
  { title: "🔥 Streak at risk!", body: "{{streak}} days together — don't let it end tonight" },
  { title: "⚠️ {{hours_left}}h left to save your streak", body: "{{incomplete_count}} habits still pending" },
  { title: "{{partner}} already did theirs...", body: "Your {{streak}}-day couple streak needs you" },
];

const DEADLINE_OVERDUE_TEMPLATES = [
  { title: "❌ {{task}} is overdue", body: "{{partner}} can see this. Time to catch up." },
  { title: "Missed deadline: {{task}}", body: "It's not too late — do it now and own it" },
];
```

### Lessons from Duolingo's escalation philosophy

Duolingo's approach — researched across **200 million practice reminders** — provides the best model for this app. Their key insight: **the message announcing notification cessation drives a 3% retention lift**. The sequence moves from friendly → streak-urgent → emotionally provocative → reverse-psychology exit → actual silence. For a couples' app, the partner dynamic replaces the mascot dynamic:

- **Days 1-3 of missed habits**: "Your habits are waiting 🌅"
- **Days 4-7**: "Your {{streak}}-day couple streak is fading 😟"
- **Days 8-14**: "{{partner}} hasn't heard from you in a while..."
- **Day 15+**: "We'll pause reminders for now. {{partner}} can always nudge you directly 💛"
- **Then silence.** Protect the push channel.

### Rich notification capabilities

On Android and desktop, use action buttons to enable one-tap responses:

```javascript
// In service worker — show rich notification
self.registration.showNotification(payload.title, {
  body: payload.body,
  icon: '/icons/icon-192.png',
  badge: '/icons/badge-72.png',
  image: payload.image,           // Large image, Android/desktop only
  tag: payload.tag,               // Replaces same-tag notification
  renotify: true,                 // Vibrate even when replacing
  actions: [
    { action: 'log-habit', title: '✅ Log Mine' },
    { action: 'snooze', title: '⏰ 30 min' },
  ],
  data: { url: payload.url },
  vibrate: [200, 100, 200],
});
```

On iOS, action buttons silently fail, so the notification falls back to title + body + tap-to-open. Design the notification body to be self-contained — the tap action should be obvious from context.

---

## 7. Anti-annoyance architecture

The fastest way to kill a notification channel is to abuse it. With only two users, every dismissed notification is a **50% failure rate**. These safeguards are non-negotiable.

**Quiet hours enforcement** prevents any notification between midnight and 9 AM UK time (matching the stated sleep schedule of 12–1 AM to 9–10 AM, with a safety margin). The database trigger in section 5 checks this before insertion, and the Edge Function double-checks before sending.

**Tag-based replacement** prevents notification pile-up. Every notification category uses a consistent `tag` — a new deadline warning replaces the previous one for the same task, not stacks beside it. Partner activity notifications use a shared tag so only the most recent partner completion is visible.

**Minimum gap enforcement** ensures at least **2 hours between notifications** to the same user (except for user-initiated nudges):

```sql
CREATE OR REPLACE FUNCTION enforce_minimum_gap()
RETURNS TRIGGER AS $$
DECLARE
  last_sent timestamptz;
BEGIN
  -- Skip for high-urgency and nudges
  IF NEW.urgency = 'high' OR NEW.category = 'nudge' THEN
    RETURN NEW;
  END IF;

  SELECT MAX(scheduled_for) INTO last_sent
  FROM notification_queue
  WHERE user_id = NEW.user_id
    AND status IN ('scheduled', 'delivered')
    AND scheduled_for > now() - interval '2 hours'
    AND scheduled_for <= NEW.scheduled_for;

  IF last_sent IS NOT NULL 
     AND NEW.scheduled_for < last_sent + interval '2 hours' THEN
    -- Push this notification forward
    NEW.scheduled_for := last_sent + interval '2 hours';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_gap
  BEFORE INSERT ON notification_queue
  FOR EACH ROW EXECUTE FUNCTION enforce_minimum_gap();
```

**Smart suppression** skips unnecessary notifications. If the user has already completed all daily habits, suppress the streak warning and partner activity reminders — they don't need prodding:

```typescript
// In the scheduler, before inserting partner activity notification
const { count } = await supabase
  .from('habit_completions')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', partnerId)
  .eq('date', today)
  .eq('completed', false);

if (count === 0) {
  // Partner has completed everything — skip "your turn?" notification
  return;
}
```

**Engagement-aware throttling** tracks open rates over a rolling 14-day window. If a user's notification open rate drops below **15%**, reduce to a single daily digest. If it drops below **5%**, trigger the graceful exit sequence. This mirrors Duolingo's channel protection strategy:

```sql
-- View: rolling notification engagement
CREATE VIEW notification_engagement AS
SELECT
  user_id,
  COUNT(*) FILTER (WHERE status = 'delivered') AS sent_14d,
  COUNT(*) FILTER (WHERE status = 'delivered' 
    AND EXISTS (
      SELECT 1 FROM notification_log nl 
      WHERE nl.queue_id = nq.id AND nl.status = 'clicked'
    )) AS opened_14d,
  CASE 
    WHEN COUNT(*) FILTER (WHERE status = 'delivered') > 0 
    THEN ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'delivered' 
      AND EXISTS (
        SELECT 1 FROM notification_log nl 
        WHERE nl.queue_id = nq.id AND nl.status = 'clicked'
      )) / COUNT(*) FILTER (WHERE status = 'delivered'), 1)
    ELSE 0 
  END AS open_rate_pct
FROM notification_queue nq
WHERE scheduled_for > now() - interval '14 days'
GROUP BY user_id;
```

### User preference controls

Expose granular controls in the app settings. With only two users, even a simple preferences panel dramatically reduces annoyance:

- **Per-category toggles**: morning briefing, deadline warnings, partner activity, mood check-in, streak warnings, sprint updates
- **Quiet hours override**: let each user set their own sleep window (default: 00:00–09:00)
- **Daily cap slider**: 3–10 notifications/day (default: 8)
- **Partner nudge cooldown**: minimum time between partner-initiated nudges (default: 2 hours)
- **Vacation mode**: pause all notifications for N days without breaking the system

---

## Conclusion

The architecture described here — **pg_cron triggering a Supabase Edge Function every minute to process a notification queue, with database triggers for real-time partner events** — gives a two-user app the same notification infrastructure that scaled apps use, without the complexity of external message brokers. Three architectural decisions matter most: using **`@negrel/webpush`** instead of the Node.js `web-push` library (Deno compatibility), enforcing **tag-based notification replacement** to prevent pile-up, and implementing the **graceful exit pattern** borrowed from Duolingo to protect the push channel long-term.

The iOS home-screen installation requirement is the single biggest adoption risk. Budget onboarding time to walk both users through the Add to Home Screen flow, and test notification delivery on their specific iOS versions — Apple's implementation has improved significantly from iOS 16.4 through iOS 18, but each version introduced subtle behavioral changes. On Android, web push is functionally equivalent to native push and will wake the screen, vibrate, and display on the lock screen — exactly the interruption capability needed for an accountability app.

The partner dynamic is this app's superpower. **"Alex just finished their morning run — your turn?" is not a notification from an app; it's social pressure from a person the user loves.** Every notification template should leverage this. The most effective notification you can build is the user-initiated partner nudge — a button in the app that sends an immediate push to the other person. Research consistently shows that messages perceived as coming from humans outperform automated notifications by every engagement metric.