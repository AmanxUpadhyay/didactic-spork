-- Phase 4: Punishment Dates & Gamification — New tables and schema changes

-- Add new ai_function_type enum values
ALTER TYPE ai_function_type ADD VALUE IF NOT EXISTS 'date_rate';
ALTER TYPE ai_function_type ADD VALUE IF NOT EXISTS 'rescue_task';

-- ============================================================
-- date_ratings — per-user ratings for each date
-- ============================================================
CREATE TABLE date_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_history_id uuid NOT NULL REFERENCES date_history(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  highlights text,
  improvements text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(date_history_id, user_id)
);

CREATE INDEX idx_date_ratings_date ON date_ratings(date_history_id);

-- ============================================================
-- tp_audit_log — TP change history for transparency
-- ============================================================
CREATE TABLE tp_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  sprint_id uuid REFERENCES sprints(id),
  tp_before integer NOT NULL,
  tp_after integer NOT NULL,
  tp_delta integer NOT NULL,
  tier_before text NOT NULL,
  tier_after text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tp_audit_user ON tp_audit_log(user_id, created_at DESC);

-- ============================================================
-- veto_records — audit trail for vetoes
-- ============================================================
CREATE TABLE veto_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  punishment_id uuid NOT NULL REFERENCES punishments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  vetoed_option jsonb NOT NULL,
  veto_number smallint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_veto_records_punishment ON veto_records(punishment_id);

-- ============================================================
-- couple_rescues — streak rescue tracking
-- ============================================================
CREATE TABLE couple_rescues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  streak_id uuid NOT NULL REFERENCES streaks(id) ON DELETE CASCADE,
  rescuer_id uuid NOT NULL REFERENCES users(id),
  rescue_task_title text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  cooldown_until timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_couple_rescues_rescuer ON couple_rescues(rescuer_id, created_at DESC);
CREATE INDEX idx_couple_rescues_streak ON couple_rescues(streak_id);

-- ============================================================
-- date_memory_state — single row per couple tracking rotation
-- ============================================================
CREATE TABLE date_memory_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  last_categories text[] NOT NULL DEFAULT '{}',
  last_cuisines text[] NOT NULL DEFAULT '{}',
  last_venues text[] NOT NULL DEFAULT '{}',
  intensity_wave_position smallint NOT NULL DEFAULT 0,
  consecutive_low_ratings smallint NOT NULL DEFAULT 0,
  total_dates_completed integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Alter punishments table — add Phase 4 columns
-- ============================================================
ALTER TABLE punishments ADD COLUMN IF NOT EXISTS winner_id uuid REFERENCES users(id);
ALTER TABLE punishments ADD COLUMN IF NOT EXISTS scheduled_date date;
ALTER TABLE punishments ADD COLUMN IF NOT EXISTS surprise_element jsonb;
ALTER TABLE punishments ADD COLUMN IF NOT EXISTS is_mutual_failure boolean NOT NULL DEFAULT false;
ALTER TABLE punishments ADD COLUMN IF NOT EXISTS is_both_win boolean NOT NULL DEFAULT false;
