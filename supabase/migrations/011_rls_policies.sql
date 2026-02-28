-- Row Level Security policies for all public tables
-- Each user can only access their own data, except for partner-visible tables

-- Helper: check if two users are partners
CREATE OR REPLACE FUNCTION public.is_partner(p_other_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM partner_pairs
    WHERE active = true
      AND (
        (user_a = auth.uid() AND user_b = p_other_id)
        OR (user_b = auth.uid() AND user_a = p_other_id)
      )
  );
$$;

-- ============================================================
-- users
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_or_partner" ON users
  FOR SELECT USING (
    id = auth.uid() OR is_partner(id)
  );

CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());

-- ============================================================
-- tasks
-- ============================================================
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select_own" ON tasks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "tasks_insert_own" ON tasks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "tasks_update_own" ON tasks
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "tasks_delete_own" ON tasks
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- habit_completions
-- ============================================================
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "completions_select_own" ON habit_completions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "completions_insert_own" ON habit_completions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "completions_delete_own" ON habit_completions
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- streaks (own + partner visible for couple streaks)
-- ============================================================
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "streaks_select_own_or_partner" ON streaks
  FOR SELECT USING (
    user_id = auth.uid() OR is_partner(user_id)
  );

CREATE POLICY "streaks_insert_own" ON streaks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "streaks_update_own" ON streaks
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- sprints (shared between paired users)
-- ============================================================
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sprints_select_paired" ON sprints
  FOR SELECT USING (true);
  -- All authenticated users can see sprints (only 2 users in the app)

CREATE POLICY "sprints_insert_service" ON sprints
  FOR INSERT WITH CHECK (false);
  -- Only cron/service_role creates sprints

CREATE POLICY "sprints_update_service" ON sprints
  FOR UPDATE USING (false);
  -- Only cron/service_role updates sprints

-- ============================================================
-- sprint_tasks (own + partner visible for leaderboard)
-- ============================================================
ALTER TABLE sprint_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sprint_tasks_select_own_or_partner" ON sprint_tasks
  FOR SELECT USING (
    user_id = auth.uid() OR is_partner(user_id)
  );

CREATE POLICY "sprint_tasks_insert_own" ON sprint_tasks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "sprint_tasks_update_own" ON sprint_tasks
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- appreciation_notes (author + recipient can see)
-- ============================================================
ALTER TABLE appreciation_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_select_involved" ON appreciation_notes
  FOR SELECT USING (
    author_id = auth.uid() OR recipient_id = auth.uid()
  );

CREATE POLICY "notes_insert_author" ON appreciation_notes
  FOR INSERT WITH CHECK (author_id = auth.uid());

-- ============================================================
-- partner_pairs (only paired users)
-- ============================================================
ALTER TABLE partner_pairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pairs_select_own" ON partner_pairs
  FOR SELECT USING (
    user_a = auth.uid() OR user_b = auth.uid()
  );

-- ============================================================
-- invite_codes
-- ============================================================
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invites_select_own" ON invite_codes
  FOR SELECT USING (creator_id = auth.uid() OR claimed_by = auth.uid());

CREATE POLICY "invites_insert_own" ON invite_codes
  FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "invites_update_claimable" ON invite_codes
  FOR UPDATE USING (true);
  -- Anyone can claim an invite (the claim function validates the code)

-- ============================================================
-- tier_progress
-- ============================================================
ALTER TABLE tier_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tier_select_own" ON tier_progress
  FOR SELECT USING (user_id = auth.uid());

-- tier_progress is updated by service_role (via update_tier_points function)

-- ============================================================
-- mood_entries
-- ============================================================
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mood_select_own" ON mood_entries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "mood_insert_own" ON mood_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================
-- notification_preferences
-- ============================================================
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_prefs_select_own" ON notification_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notif_prefs_upsert_own" ON notification_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "notif_prefs_update_own" ON notification_preferences
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- notification_queue
-- ============================================================
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_queue_select_own" ON notification_queue
  FOR SELECT USING (user_id = auth.uid());

-- queue inserts/updates are service_role only (cron jobs)

-- ============================================================
-- notification_log
-- ============================================================
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_log_select_own" ON notification_log
  FOR SELECT USING (
    queue_id IN (SELECT id FROM notification_queue WHERE user_id = auth.uid())
  );

-- ============================================================
-- notification_templates (read-only for all authenticated users)
-- ============================================================
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "templates_select_all" ON notification_templates
  FOR SELECT USING (true);

-- ============================================================
-- push_subscriptions
-- ============================================================
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_select_own" ON push_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "push_insert_own" ON push_subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "push_update_own" ON push_subscriptions
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- punishments (shared — linked to sprint)
-- ============================================================
ALTER TABLE punishments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "punishments_select_paired" ON punishments
  FOR SELECT USING (true);
  -- Both partners need to see punishment details

CREATE POLICY "punishments_update_loser" ON punishments
  FOR UPDATE USING (loser_id = auth.uid());

-- ============================================================
-- date_history (shared — linked to punishment)
-- ============================================================
ALTER TABLE date_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "date_history_select_paired" ON date_history
  FOR SELECT USING (true);

CREATE POLICY "date_history_insert_authenticated" ON date_history
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- relationship_health
-- ============================================================
ALTER TABLE relationship_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "health_select_own" ON relationship_health
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- relationship_xp (shared — one row for the couple)
-- ============================================================
ALTER TABLE relationship_xp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rxp_select_all" ON relationship_xp
  FOR SELECT USING (true);

-- ============================================================
-- user_ai_profiles
-- ============================================================
ALTER TABLE user_ai_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_profiles_select_own" ON user_ai_profiles
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- ai_responses
-- ============================================================
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_responses_select_own" ON ai_responses
  FOR SELECT USING (user_id = auth.uid());

-- ai_responses inserts are service_role only (Edge Functions)

-- ============================================================
-- ai_context_summaries
-- ============================================================
ALTER TABLE ai_context_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_summaries_select_own" ON ai_context_summaries
  FOR SELECT USING (user_id = auth.uid());
