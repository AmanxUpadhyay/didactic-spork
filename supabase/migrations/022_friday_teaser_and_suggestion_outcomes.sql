-- Migration 022: Friday Teaser notification templates + cron + Task Suggestion Outcomes
-- Requires migration 021 (enum values) to be applied first.

-- ============================================================
-- Notification templates for Friday teaser
-- ============================================================
INSERT INTO notification_templates (category, title_template, body_template, urgency, tag)
VALUES
  ('friday_teaser', 'Something is coming, {{loser_name}}...', 'Kira is keeping secrets. The date is being planned. Sleep well.', 'normal', 'teaser_loser_v1'),
  ('friday_teaser', 'Your prize is almost ready', 'The date is being arranged. Good things come to those who crushed the sprint.', 'normal', 'teaser_winner_v1')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Friday teaser cron: every Friday at 17:00 UTC (18:00 Sheffield BST)
-- ============================================================
SELECT cron.schedule(
  'kira-friday-teaser',
  '0 17 * * 5',
  $$
  SELECT net.http_post(
    url := 'https://qfqyojetycefdwadralg.supabase.co/functions/v1/kira-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := '{"function_type":"friday_teaser"}'::jsonb
  );
  $$
);

-- ============================================================
-- Table: ai_suggestion_outcomes — tracks which AI task suggestions users accept
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_suggestion_outcomes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ai_response_id   uuid REFERENCES ai_responses(id) ON DELETE SET NULL,
  suggestion_index smallint NOT NULL,
  suggestion_text  text NOT NULL,
  category         text,
  task_type        text,
  accepted         boolean NOT NULL DEFAULT false,
  accepted_at      timestamptz,
  task_id          uuid REFERENCES tasks(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suggestion_outcomes_user
  ON ai_suggestion_outcomes(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_suggestion_outcomes_accepted
  ON ai_suggestion_outcomes(user_id, accepted) WHERE accepted = true;

ALTER TABLE ai_suggestion_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suggestions_select_own" ON ai_suggestion_outcomes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "suggestions_insert_own" ON ai_suggestion_outcomes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "suggestions_update_own" ON ai_suggestion_outcomes
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
