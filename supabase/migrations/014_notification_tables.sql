-- Phase 5: Push Notification Tables
-- Creates 5 notification tables: push_subscriptions, notification_templates,
-- notification_queue, notification_log, notification_preferences.
-- Also creates enums, indexes, RLS policies, and enables realtime.
-- NOTE: Migration 011 created RLS policies for these tables before the tables
-- existed, so those policies silently failed. We re-create them here.

-- ============================================================
-- Enums
-- ============================================================

DO $$ BEGIN
  CREATE TYPE notif_category AS ENUM (
    'morning_briefing', 'task_deadline', 'partner_activity',
    'mood_checkin', 'sprint_results', 'streak_warning',
    'sprint_start', 'nudge', 'celebration'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notif_status AS ENUM (
    'scheduled', 'pending', 'processing', 'delivered', 'failed', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- push_subscriptions — Web Push API subscription storage
-- ============================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth_key text NOT NULL,
  user_agent text,
  active boolean NOT NULL DEFAULT true,
  last_successful_push timestamptz,
  deactivated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON push_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint
  ON push_subscriptions(endpoint);

-- ============================================================
-- notification_templates — reusable notification content
-- ============================================================
CREATE TABLE IF NOT EXISTS notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category notif_category NOT NULL,
  title_template text NOT NULL,
  body_template text NOT NULL,
  urgency text,
  tag text NOT NULL,
  actions jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- notification_queue — outbound notification queue
-- ============================================================
CREATE TABLE IF NOT EXISTS notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id uuid,
  category notif_category NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  data jsonb,
  actions jsonb,
  tag text,
  urgency text,
  status notif_status NOT NULL DEFAULT 'pending',
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  retry_count integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 3,
  error_message text,
  error_code integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notification_queue_template_id_fkey
    FOREIGN KEY (template_id) REFERENCES notification_templates(id)
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_status_scheduled
  ON notification_queue(status, scheduled_for);

CREATE INDEX IF NOT EXISTS idx_notification_queue_user_created
  ON notification_queue(user_id, created_at DESC);

-- ============================================================
-- notification_log — delivery attempt audit trail
-- ============================================================
CREATE TABLE IF NOT EXISTS notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id uuid,
  subscription_id uuid,
  status text NOT NULL,
  error_message text,
  error_code integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notification_log_queue_id_fkey
    FOREIGN KEY (queue_id) REFERENCES notification_queue(id) ON DELETE CASCADE,
  CONSTRAINT notification_log_subscription_id_fkey
    FOREIGN KEY (subscription_id) REFERENCES push_subscriptions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notification_log_queue_id
  ON notification_log(queue_id);

-- ============================================================
-- notification_preferences — per-user notification settings
-- ============================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  enabled boolean DEFAULT true,
  quiet_hours_start text,          -- HH:MM format
  quiet_hours_end text,            -- HH:MM format
  categories_enabled jsonb,
  max_daily_notifications integer DEFAULT 10,
  timezone text DEFAULT 'Europe/London',
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- RLS Policies
-- Migration 011 attempted to create these but the tables did not
-- exist yet, so they silently failed. We drop-if-exists then
-- re-create to be idempotent.
-- ============================================================

-- push_subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_select_own" ON push_subscriptions;
CREATE POLICY "push_select_own" ON push_subscriptions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "push_insert_own" ON push_subscriptions;
CREATE POLICY "push_insert_own" ON push_subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "push_update_own" ON push_subscriptions;
CREATE POLICY "push_update_own" ON push_subscriptions
  FOR UPDATE USING (user_id = auth.uid());

-- notification_templates
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "templates_select_all" ON notification_templates;
CREATE POLICY "templates_select_all" ON notification_templates
  FOR SELECT USING (true);

-- notification_queue
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif_queue_select_own" ON notification_queue;
CREATE POLICY "notif_queue_select_own" ON notification_queue
  FOR SELECT USING (user_id = auth.uid());

-- Queue inserts/updates are service_role only (cron jobs / Edge Functions)

-- notification_log
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif_log_select_own" ON notification_log;
CREATE POLICY "notif_log_select_own" ON notification_log
  FOR SELECT USING (
    queue_id IN (SELECT id FROM notification_queue WHERE user_id = auth.uid())
  );

-- notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif_prefs_select_own" ON notification_preferences;
CREATE POLICY "notif_prefs_select_own" ON notification_preferences
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notif_prefs_upsert_own" ON notification_preferences;
CREATE POLICY "notif_prefs_upsert_own" ON notification_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notif_prefs_update_own" ON notification_preferences;
CREATE POLICY "notif_prefs_update_own" ON notification_preferences
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- Realtime — subscribe to queue status changes on the client
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE notification_queue;
