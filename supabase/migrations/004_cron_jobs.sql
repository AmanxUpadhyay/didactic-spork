-- Source-control copy of deployed cron jobs
-- Deployed to Supabase project qfqyojetycefdwadralg
-- Requires: pg_cron, pg_net extensions, Vault secret 'service_role_key'

-- Auto-create weekly sprint every Monday at 00:01 UTC
SELECT cron.schedule(
  'create-weekly-sprint',
  '1 0 * * 1',
  $$
  DO $do$
  DECLARE
    v_sprint_id uuid;
    v_week_start date;
    v_pair record;
  BEGIN
    -- Calculate Monday of current week
    v_week_start := date_trunc('week', now())::date;

    -- Check if sprint already exists for this week
    IF EXISTS (SELECT 1 FROM sprints WHERE week_start = v_week_start) THEN
      RETURN;
    END IF;

    -- Get active pair
    SELECT user_a, user_b INTO v_pair FROM partner_pairs WHERE active = true LIMIT 1;
    IF v_pair IS NULL THEN
      RETURN;
    END IF;

    -- Create sprint
    INSERT INTO sprints (week_start, status)
    VALUES (v_week_start, 'active')
    RETURNING id INTO v_sprint_id;

    -- Auto-enroll all active tasks for both users
    INSERT INTO sprint_tasks (sprint_id, task_id, user_id, difficulty_rating)
    SELECT v_sprint_id, t.id, t.user_id, t.difficulty
    FROM tasks t
    WHERE t.active = true
      AND t.user_id IN (v_pair.user_a, v_pair.user_b);

  END $do$;
  $$
);

-- Score sprint via Edge Function every Sunday at 22:00 UTC
-- Uses Vault-stored service_role JWT for authentication
SELECT cron.schedule(
  'score-weekly-sprint',
  '0 22 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://qfqyojetycefdwadralg.supabase.co/functions/v1/score-sprint',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
