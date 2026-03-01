-- Migration 018: Relationship Health Tables & Enums
-- Phase 6: Anti-Toxicity Guardrails & Relationship Safety

-- 1. Sprint mode enum
CREATE TYPE sprint_mode AS ENUM ('competitive', 'cooperative', 'swap');

-- 2. ALTER sprints table
ALTER TABLE sprints
  ADD COLUMN IF NOT EXISTS sprint_mode sprint_mode NOT NULL DEFAULT 'competitive',
  ADD COLUMN IF NOT EXISTS is_training_wheels boolean NOT NULL DEFAULT false;

-- 3. relationship_health_signals table
CREATE TABLE relationship_health_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id uuid NOT NULL REFERENCES partner_pairs(id),
  signal_type text NOT NULL CHECK (signal_type IN (
    'sustained_losing', 'disengagement', 'score_disparity',
    'low_date_satisfaction', 'one_sided_activity', 'rage_quit'
  )),
  affected_user_id uuid REFERENCES auth.users(id),
  severity integer NOT NULL CHECK (severity BETWEEN 1 AND 3),
  metadata jsonb DEFAULT '{}',
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  intervention_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. feature_opt_outs table
CREATE TABLE feature_opt_outs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  feature text NOT NULL,
  opted_out boolean NOT NULL DEFAULT true,
  opted_out_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature)
);

-- 5. grace_periods table
CREATE TABLE grace_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  reason text NOT NULL CHECK (reason IN ('illness', 'travel', 'exams', 'manual', 'monthly_free')),
  starts_at date NOT NULL DEFAULT CURRENT_DATE,
  ends_at date NOT NULL,
  auto_triggered boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. catch_up_state table
CREATE TABLE catch_up_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  sprint_id uuid NOT NULL REFERENCES sprints(id),
  tier integer NOT NULL DEFAULT 0 CHECK (tier BETWEEN 0 AND 3),
  comeback_multiplier real NOT NULL DEFAULT 1.0,
  wow_bonus integer NOT NULL DEFAULT 0,
  head_to_head_active boolean NOT NULL DEFAULT false,
  wildcard_habit_id uuid REFERENCES habits(id),
  structural_mode text CHECK (structural_mode IN ('fresh_start', 'swap', 'collaborative')),
  UNIQUE(user_id, sprint_id)
);

-- 7. interaction_ledger table
CREATE TABLE interaction_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  interaction_type text NOT NULL,
  valence text NOT NULL CHECK (valence IN ('positive', 'negative', 'neutral')),
  source text NOT NULL CHECK (source IN ('notification', 'in_app', 'kira_message', 'system')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for interaction_ledger
CREATE INDEX idx_interaction_ledger_user_created
  ON interaction_ledger(user_id, created_at DESC);
CREATE INDEX idx_interaction_ledger_user_valence
  ON interaction_ledger(user_id, valence, created_at DESC);

-- Index for health signals lookup
CREATE INDEX idx_health_signals_pair_resolved
  ON relationship_health_signals(pair_id, resolved);

-- Index for grace periods lookup
CREATE INDEX idx_grace_periods_user_active
  ON grace_periods(user_id, active);

-- ==========================================
-- RLS Policies
-- ==========================================

-- relationship_health_signals: SELECT via pair_id check
ALTER TABLE relationship_health_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "health_signals_select_paired" ON relationship_health_signals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM partner_pairs
      WHERE id = relationship_health_signals.pair_id
        AND (user_a = auth.uid() OR user_b = auth.uid())
    )
  );

CREATE POLICY "health_signals_insert_service" ON relationship_health_signals
  FOR INSERT WITH CHECK (false); -- service_role only

CREATE POLICY "health_signals_update_service" ON relationship_health_signals
  FOR UPDATE USING (false); -- service_role only

-- feature_opt_outs: full CRUD for own rows
ALTER TABLE feature_opt_outs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "opt_outs_select_own" ON feature_opt_outs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "opt_outs_insert_own" ON feature_opt_outs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "opt_outs_update_own" ON feature_opt_outs
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "opt_outs_delete_own" ON feature_opt_outs
  FOR DELETE USING (user_id = auth.uid());

-- grace_periods: full CRUD for own rows
ALTER TABLE grace_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grace_periods_select_own" ON grace_periods
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "grace_periods_insert_own" ON grace_periods
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "grace_periods_update_own" ON grace_periods
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "grace_periods_delete_own" ON grace_periods
  FOR DELETE USING (user_id = auth.uid());

-- catch_up_state: SELECT own, INSERT by service_role
ALTER TABLE catch_up_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catch_up_select_own" ON catch_up_state
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "catch_up_insert_service" ON catch_up_state
  FOR INSERT WITH CHECK (false); -- service_role only

CREATE POLICY "catch_up_update_service" ON catch_up_state
  FOR UPDATE USING (false); -- service_role only

-- interaction_ledger: SELECT own, INSERT by service_role
ALTER TABLE interaction_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ledger_select_own" ON interaction_ledger
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "ledger_insert_service" ON interaction_ledger
  FOR INSERT WITH CHECK (false); -- service_role only

-- 30-day retention cleanup (called by cron)
CREATE OR REPLACE FUNCTION cleanup_old_interactions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM interaction_ledger
  WHERE created_at < now() - interval '30 days';
END;
$$;
