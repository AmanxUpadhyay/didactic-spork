-- Phase 5: Notification Triggers, Engagement View & Template Seeds
-- Depends on: 014_notification_tables.sql (notification_queue, notification_templates,
--   notification_log, notification_preferences, notif_category, notif_status)
--
-- Creates:
--   1. check_daily_notification_limit() trigger — 10/day per-user cap
--   2. enforce_minimum_gap() trigger — 2h spacing for non-urgent notifications
--   3. notify_partner_on_completion() trigger — partner activity on habit completion
--   4. notification_engagement view — 14-day rolling delivery stats
--   5. Seed data — 20 notification templates across 9 categories

-- ============================================================
-- 1. Trigger: check_daily_notification_limit
--    BEFORE INSERT on notification_queue
--    Enforces per-user daily cap (default 10, configurable via
--    notification_preferences.max_daily_notifications)
-- ============================================================

CREATE OR REPLACE FUNCTION check_daily_notification_limit()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_count integer;
  v_max integer;
BEGIN
  -- Get user's max daily notifications (default 10)
  SELECT COALESCE(max_daily_notifications, 10)
    INTO v_max
    FROM notification_preferences
    WHERE user_id = NEW.user_id;

  IF v_max IS NULL THEN
    v_max := 10;  -- Default for users without preferences
  END IF;

  -- Count today's notifications for this user
  SELECT count(*)
    INTO v_count
    FROM notification_queue
    WHERE user_id = NEW.user_id
      AND created_at >= date_trunc('day', now());

  IF v_count >= v_max THEN
    RAISE EXCEPTION 'Daily notification limit (%) reached for user %', v_max, NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_daily_limit ON notification_queue;
CREATE TRIGGER trg_check_daily_limit
  BEFORE INSERT ON notification_queue
  FOR EACH ROW
  EXECUTE FUNCTION check_daily_notification_limit();


-- ============================================================
-- 2. Trigger: enforce_minimum_gap
--    BEFORE INSERT on notification_queue
--    Ensures at least 2 hours between non-urgent notifications.
--    High-urgency or streak_warning/sprint_results bypass the gap.
-- ============================================================

CREATE OR REPLACE FUNCTION enforce_minimum_gap()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_last_sent timestamptz;
BEGIN
  -- Skip for high-urgency notifications (streak_warning, sprint_results)
  IF NEW.urgency = 'high' OR NEW.category IN ('streak_warning', 'sprint_results') THEN
    RETURN NEW;
  END IF;

  -- Find the most recent non-cancelled notification for this user
  SELECT scheduled_for
    INTO v_last_sent
    FROM notification_queue
    WHERE user_id = NEW.user_id
      AND status NOT IN ('cancelled', 'failed')
      AND id != NEW.id
    ORDER BY scheduled_for DESC
    LIMIT 1;

  -- If there's a recent notification within 2 hours, push this one back
  IF v_last_sent IS NOT NULL AND NEW.scheduled_for < v_last_sent + interval '2 hours' THEN
    NEW.scheduled_for := v_last_sent + interval '2 hours';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_minimum_gap ON notification_queue;
CREATE TRIGGER trg_enforce_minimum_gap
  BEFORE INSERT ON notification_queue
  FOR EACH ROW
  EXECUTE FUNCTION enforce_minimum_gap();


-- ============================================================
-- 3. Trigger: notify_partner_on_completion
--    AFTER UPDATE on habit_completions
--    When a user completes a habit (completed flips to true),
--    queue a partner_activity notification for their partner.
-- ============================================================

CREATE OR REPLACE FUNCTION notify_partner_on_completion()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_partner_id uuid;
  v_task_title text;
  v_user_name text;
BEGIN
  -- Only fire when completed changes to true
  IF NOT (NEW.completed = true AND (OLD.completed IS DISTINCT FROM true)) THEN
    RETURN NEW;
  END IF;

  -- Get the partner's user ID
  SELECT CASE
    WHEN pp.user_a = NEW.user_id THEN pp.user_b
    ELSE pp.user_a
  END INTO v_partner_id
  FROM partner_pairs pp
  WHERE pp.active = true
    AND (pp.user_a = NEW.user_id OR pp.user_b = NEW.user_id)
  LIMIT 1;

  IF v_partner_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get task title and user display name
  SELECT t.title INTO v_task_title FROM tasks t WHERE t.id = NEW.task_id;
  SELECT COALESCE(u.display_name, 'Your partner') INTO v_user_name FROM users u WHERE u.id = NEW.user_id;

  -- Queue the notification
  INSERT INTO notification_queue (user_id, category, title, body, data, tag, urgency)
  VALUES (
    v_partner_id,
    'partner_activity',
    v_user_name || ' crushed it!',
    v_user_name || ' just completed "' || COALESCE(v_task_title, 'a habit') || '"',
    jsonb_build_object('completion_id', NEW.id, 'task_id', NEW.task_id, 'completer_id', NEW.user_id),
    'partner_activity_' || NEW.task_id::text,
    'normal'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_partner_on_completion ON habit_completions;
CREATE TRIGGER trg_notify_partner_on_completion
  AFTER UPDATE ON habit_completions
  FOR EACH ROW
  EXECUTE FUNCTION notify_partner_on_completion();


-- ============================================================
-- 4. View: notification_engagement
--    14-day rolling delivery stats per user.
--    Aggregates from notification_queue.
-- ============================================================

CREATE OR REPLACE VIEW notification_engagement AS
SELECT
  nq.user_id,
  count(*) FILTER (WHERE nq.status = 'delivered') AS total_delivered,
  count(*) FILTER (WHERE nq.status = 'failed') AS total_failed,
  count(*) AS total_queued,
  CASE
    WHEN count(*) > 0 THEN
      round((count(*) FILTER (WHERE nq.status = 'delivered'))::numeric / count(*)::numeric * 100, 1)
    ELSE 0
  END AS delivery_rate_pct,
  count(DISTINCT nq.category) AS categories_used
FROM notification_queue nq
WHERE nq.created_at >= now() - interval '14 days'
GROUP BY nq.user_id;


-- ============================================================
-- 5. Seed: notification_templates
--    20 templates across 9 categories (2-3 variants each).
--    ON CONFLICT DO NOTHING for safe re-runs.
-- ============================================================

INSERT INTO notification_templates (category, title_template, body_template, urgency, tag) VALUES
  -- morning_briefing (3 variants)
  ('morning_briefing', 'Rise and grind, {{name}}!', 'You have {{task_count}} habits waiting. Yesterday you scored {{yesterday_score}}%!', 'normal', 'morning_v1'),
  ('morning_briefing', 'New day, new wins', '{{task_count}} habits on deck today. Your streak is at {{streak}} days!', 'normal', 'morning_v2'),
  ('morning_briefing', 'Good morning!', 'Ready to crush it? {{task_count}} habits to tackle today.', 'normal', 'morning_v3'),

  -- task_deadline (2 variants)
  ('task_deadline', 'Clock''s ticking!', '"{{task_name}}" is due {{deadline}}. Don''t let your streak slip!', 'high', 'deadline_v1'),
  ('task_deadline', 'Deadline approaching', '"{{task_name}}" — {{time_remaining}} left. You got this!', 'high', 'deadline_v2'),

  -- partner_activity (2 variants)
  ('partner_activity', '{{partner_name}} is on fire!', 'They just completed "{{task_name}}". Your move!', 'normal', 'partner_v1'),
  ('partner_activity', 'Your partner crushed it', '{{partner_name}} finished "{{task_name}}". Time to match their energy!', 'normal', 'partner_v2'),

  -- mood_checkin (2 variants)
  ('mood_checkin', 'How are you feeling?', 'Take a sec to check in with yourself. Kira wants to know!', 'normal', 'mood_v1'),
  ('mood_checkin', 'Quick mood check', 'Kira''s curious — what''s your vibe today?', 'normal', 'mood_v2'),

  -- sprint_results (2 variants)
  ('sprint_results', 'Sprint results are in!', 'This week''s winner: {{winner_name}} ({{winner_score}}% vs {{loser_score}}%)!', 'high', 'results_v1'),
  ('sprint_results', 'The verdict is out', 'Sprint Week {{week_number}} has been scored. Tap to see who won!', 'high', 'results_v2'),

  -- streak_warning (2 variants)
  ('streak_warning', 'Your streak is in danger!', 'You haven''t completed any habits today. {{streak}} day streak at risk!', 'high', 'streak_warn_v1'),
  ('streak_warning', 'Don''t break the chain!', '{{streak}} days strong — don''t let it end now. One habit is all it takes.', 'high', 'streak_warn_v2'),

  -- sprint_start (2 variants)
  ('sprint_start', 'New sprint, let''s go!', 'Week {{week_number}} sprint starts now. {{task_count}} habits locked in. Game on!', 'normal', 'sprint_start_v1'),
  ('sprint_start', 'Sprint Week {{week_number}} is live', 'Your {{task_count}} habits are ready. May the best partner win!', 'normal', 'sprint_start_v2'),

  -- nudge (2 variants)
  ('nudge', 'Psst... {{name}}', 'You''re {{percent}}% through the week with {{remaining}} habits to go. Keep pushing!', 'normal', 'nudge_v1'),
  ('nudge', 'Quick reminder', '{{remaining}} habits left today. Small steps, big wins!', 'normal', 'nudge_v2'),

  -- celebration (2 variants)
  ('celebration', 'You''re unstoppable!', '{{streak}} day streak! That''s {{name}} commitment right there.', 'normal', 'celebrate_v1'),
  ('celebration', 'Milestone unlocked!', '{{achievement}} — Kira is seriously impressed!', 'normal', 'celebrate_v2')
ON CONFLICT DO NOTHING;
