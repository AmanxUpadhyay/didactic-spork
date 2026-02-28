-- Add completed_at timestamp to habit_completions for time-of-day tracking
-- Enables future Phase 5 analytics (optimal timing, consistency patterns)

ALTER TABLE habit_completions ADD COLUMN IF NOT EXISTS completed_at timestamptz DEFAULT now();
