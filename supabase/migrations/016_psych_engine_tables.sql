-- Phase 5: Psych engine tables, indexes, RLS policies, and cron jobs
-- Creates: variable_rewards, point_bank_snapshots, implementation_intentions, fresh_start_bonuses
-- Adds: 4 cron jobs (notification queue, streak warning, point bank decay, fresh start calc)

-- ============================================================
-- Table: variable_rewards (mystery box tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS variable_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  completion_id uuid NOT NULL REFERENCES habit_completions(id),
  reward_type text NOT NULL CHECK (reward_type IN ('2x_points', '3x_points', 'streak_freeze', 'spy_peek')),
  triggered boolean NOT NULL DEFAULT false,
  probability_used real NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Table: point_bank_snapshots (decaying point bank per sprint)
-- ============================================================
CREATE TABLE IF NOT EXISTS point_bank_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  sprint_id uuid NOT NULL REFERENCES sprints(id),
  initial_points integer NOT NULL DEFAULT 200,
  current_points integer NOT NULL DEFAULT 200,
  floor_points integer NOT NULL DEFAULT 100,
  decay_log jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, sprint_id)
);

-- ============================================================
-- Table: implementation_intentions (if-then plans)
-- ============================================================
CREATE TABLE IF NOT EXISTS implementation_intentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  task_id uuid NOT NULL REFERENCES tasks(id),
  trigger_situation text NOT NULL,
  planned_action text NOT NULL,
  trigger_time time,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Table: fresh_start_bonuses (Monday head start)
-- ============================================================
CREATE TABLE IF NOT EXISTS fresh_start_bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  sprint_id uuid NOT NULL REFERENCES sprints(id),
  bonus_points integer NOT NULL,
  reason text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, sprint_id)
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_variable_rewards_user ON variable_rewards(user_id, created_at DESC);
CREATE INDEX idx_variable_rewards_completion ON variable_rewards(completion_id);
CREATE INDEX idx_point_bank_user_sprint ON point_bank_snapshots(user_id, sprint_id);
CREATE INDEX idx_impl_intentions_user ON implementation_intentions(user_id, active);
CREATE INDEX idx_fresh_start_user_sprint ON fresh_start_bonuses(user_id, sprint_id);

-- ============================================================
-- RLS: variable_rewards
-- ============================================================
ALTER TABLE variable_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "variable_rewards_select_own" ON variable_rewards
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "variable_rewards_insert_service" ON variable_rewards
  FOR INSERT WITH CHECK (false);
  -- Only service_role (Edge Functions) can insert rewards

-- ============================================================
-- RLS: point_bank_snapshots
-- ============================================================
ALTER TABLE point_bank_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "point_bank_select_own" ON point_bank_snapshots
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "point_bank_insert_service" ON point_bank_snapshots
  FOR INSERT WITH CHECK (false);
  -- Only service_role creates snapshots

CREATE POLICY "point_bank_update_service" ON point_bank_snapshots
  FOR UPDATE USING (false);
  -- Only service_role updates snapshots

-- ============================================================
-- RLS: implementation_intentions
-- ============================================================
ALTER TABLE implementation_intentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "impl_intentions_select_own" ON implementation_intentions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "impl_intentions_insert_own" ON implementation_intentions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "impl_intentions_update_own" ON implementation_intentions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "impl_intentions_delete_own" ON implementation_intentions
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- RLS: fresh_start_bonuses
-- ============================================================
ALTER TABLE fresh_start_bonuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fresh_start_select_own" ON fresh_start_bonuses
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "fresh_start_insert_service" ON fresh_start_bonuses
  FOR INSERT WITH CHECK (false);
  -- Only service_role (cron) creates fresh start bonuses

-- ============================================================
-- Cron jobs
-- ============================================================

-- Process notification queue every minute
SELECT cron.schedule('process-notification-queue', '* * * * *', $$
  SELECT net.http_post(
    url := 'https://qfqyojetycefdwadralg.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := jsonb_build_object('type', 'process_queue')
  );
$$);

-- Streak warning check daily at 20:00 UTC
SELECT cron.schedule('streak-warning-check', '0 20 * * *', $$
  SELECT net.http_post(
    url := 'https://qfqyojetycefdwadralg.supabase.co/functions/v1/kira-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := jsonb_build_object('type', 'streak_warning')
  );
$$);

-- Point bank decay daily at 12:00 UTC
SELECT cron.schedule('point-bank-decay', '0 12 * * *', $$
  SELECT net.http_post(
    url := 'https://qfqyojetycefdwadralg.supabase.co/functions/v1/kira-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := jsonb_build_object('type', 'point_bank_decay')
  );
$$);

-- Fresh start calc Monday 00:05 UTC
SELECT cron.schedule('fresh-start-calc', '5 0 * * 1', $$
  SELECT net.http_post(
    url := 'https://qfqyojetycefdwadralg.supabase.co/functions/v1/kira-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := jsonb_build_object('type', 'fresh_start_calc')
  );
$$);
