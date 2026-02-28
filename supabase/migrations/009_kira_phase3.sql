-- Phase 3: Kira AI Integration
-- Adds columns, indexes, enum values, and cron jobs for Kira functions

-- Add new ai_function_type enum values for task suggestions and excuse evaluation
ALTER TYPE ai_function_type ADD VALUE IF NOT EXISTS 'task_suggest';
ALTER TYPE ai_function_type ADD VALUE IF NOT EXISTS 'excuse_eval';

-- Link AI responses to sprints
ALTER TABLE ai_responses ADD COLUMN IF NOT EXISTS sprint_id uuid REFERENCES sprints(id);

-- Structured AI output for machine-readable data alongside narrative
ALTER TABLE ai_responses ADD COLUMN IF NOT EXISTS structured_data jsonb;

-- Index for fetching latest response by user + function type
CREATE INDEX IF NOT EXISTS idx_ai_responses_user_function
  ON ai_responses(user_id, function_type, created_at DESC);

-- Index for sprint-specific responses
CREATE INDEX IF NOT EXISTS idx_ai_responses_sprint
  ON ai_responses(sprint_id) WHERE sprint_id IS NOT NULL;

-- Kira sprint judge cron: 5 min after score-sprint (Sunday 22:05 UTC)
SELECT cron.schedule('kira-sprint-judge', '5 22 * * 0', $$
  SELECT net.http_post(
    url := 'https://qfqyojetycefdwadralg.supabase.co/functions/v1/kira-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := '{"function_type":"sprint_judge"}'::jsonb
  );
$$);

-- Kira morning briefing cron: daily at 09:30 UTC
SELECT cron.schedule('kira-morning-briefing', '30 9 * * *', $$
  SELECT net.http_post(
    url := 'https://qfqyojetycefdwadralg.supabase.co/functions/v1/kira-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := '{"function_type":"daily_notification"}'::jsonb
  );
$$);

-- Kira nightly mood prompt cron: daily at 23:30 UTC
SELECT cron.schedule('kira-mood-nightly', '30 23 * * *', $$
  SELECT net.http_post(
    url := 'https://qfqyojetycefdwadralg.supabase.co/functions/v1/kira-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := '{"function_type":"mood_response"}'::jsonb
  );
$$);
