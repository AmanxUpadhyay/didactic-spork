-- Migration 019: Health Monitor Functions & Cron Jobs
-- Phase 6: Anti-Toxicity Guardrails & Relationship Safety
-- 7 SQL functions + 2 cron jobs + retention cleanup cron

-- ============================================================
-- 1. detect_relationship_health_signals()
-- Called by cron. Loops all active pairs, detects 6 signal types.
-- ============================================================
CREATE OR REPLACE FUNCTION detect_relationship_health_signals()
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_pair record;
  v_user_ids uuid[];
  v_uid uuid;
  v_sprint record;
  v_consecutive_same_winner integer;
  v_last_winner uuid;
  v_signals_created integer := 0;
  v_this_week_completions integer;
  v_last_week_completions integer;
  v_gap real;
  v_prev_gap real;
  v_gap_weeks integer;
  v_rating record;
  v_low_ratings integer;
  v_user_a_activity integer;
  v_user_b_activity integer;
  v_rage_count integer;
BEGIN
  FOR v_pair IN SELECT * FROM partner_pairs WHERE active = true
  LOOP
    v_user_ids := ARRAY[v_pair.user_a, v_pair.user_b];

    -- Signal 1: sustained_losing — same winner 3+ consecutive weeks
    v_consecutive_same_winner := 0;
    v_last_winner := NULL;
    FOR v_sprint IN
      SELECT winner_id FROM sprints
      WHERE status = 'completed' AND winner_id IS NOT NULL
      ORDER BY week_start DESC LIMIT 5
    LOOP
      IF v_last_winner IS NULL THEN
        v_last_winner := v_sprint.winner_id;
        v_consecutive_same_winner := 1;
      ELSIF v_sprint.winner_id = v_last_winner THEN
        v_consecutive_same_winner := v_consecutive_same_winner + 1;
      ELSE
        EXIT;
      END IF;
    END LOOP;

    IF v_consecutive_same_winner >= 3 THEN
      -- Affected user is the one NOT winning
      DECLARE
        v_loser uuid;
        v_severity integer;
      BEGIN
        v_loser := CASE WHEN v_last_winner = v_pair.user_a THEN v_pair.user_b ELSE v_pair.user_a END;
        v_severity := CASE
          WHEN v_consecutive_same_winner >= 5 THEN 3
          WHEN v_consecutive_same_winner >= 4 THEN 2
          ELSE 1
        END;
        INSERT INTO relationship_health_signals (pair_id, signal_type, affected_user_id, severity, metadata)
        SELECT v_pair.id, 'sustained_losing', v_loser, v_severity,
          jsonb_build_object('consecutive_losses', v_consecutive_same_winner)
        WHERE NOT EXISTS (
          SELECT 1 FROM relationship_health_signals
          WHERE pair_id = v_pair.id AND signal_type = 'sustained_losing'
            AND resolved = false
        );
        IF FOUND THEN v_signals_created := v_signals_created + 1; END IF;
      END;
    END IF;

    -- Signal 2: disengagement — either user's completions < 50% of prior week
    FOREACH v_uid IN ARRAY v_user_ids
    LOOP
      SELECT count(*) INTO v_this_week_completions
      FROM habit_completions
      WHERE user_id = v_uid AND completed_at IS NOT NULL
        AND completed_date >= date_trunc('week', now())::date;

      SELECT count(*) INTO v_last_week_completions
      FROM habit_completions
      WHERE user_id = v_uid AND completed_at IS NOT NULL
        AND completed_date >= (date_trunc('week', now()) - interval '7 days')::date
        AND completed_date < date_trunc('week', now())::date;

      IF v_last_week_completions > 3 AND v_this_week_completions::real < v_last_week_completions::real * 0.5 THEN
        INSERT INTO relationship_health_signals (pair_id, signal_type, affected_user_id, severity, metadata)
        SELECT v_pair.id, 'disengagement', v_uid, 1,
          jsonb_build_object('this_week', v_this_week_completions, 'last_week', v_last_week_completions)
        WHERE NOT EXISTS (
          SELECT 1 FROM relationship_health_signals
          WHERE pair_id = v_pair.id AND signal_type = 'disengagement'
            AND affected_user_id = v_uid AND resolved = false
        );
        IF FOUND THEN v_signals_created := v_signals_created + 1; END IF;
      END IF;
    END LOOP;

    -- Signal 3: score_disparity — gap > 30% for 2+ consecutive weeks
    v_gap_weeks := 0;
    FOR v_sprint IN
      SELECT score_a, score_b FROM sprints
      WHERE status = 'completed' AND score_a IS NOT NULL AND score_b IS NOT NULL
      ORDER BY week_start DESC LIMIT 4
    LOOP
      v_gap := abs(COALESCE(v_sprint.score_a, 0) - COALESCE(v_sprint.score_b, 0));
      IF v_gap > 30 THEN
        v_gap_weeks := v_gap_weeks + 1;
      ELSE
        EXIT;
      END IF;
    END LOOP;

    IF v_gap_weeks >= 2 THEN
      INSERT INTO relationship_health_signals (pair_id, signal_type, severity, metadata)
      SELECT v_pair.id, 'score_disparity',
        CASE WHEN v_gap_weeks >= 3 THEN 2 ELSE 1 END,
        jsonb_build_object('gap_weeks', v_gap_weeks)
      WHERE NOT EXISTS (
        SELECT 1 FROM relationship_health_signals
        WHERE pair_id = v_pair.id AND signal_type = 'score_disparity'
          AND resolved = false
      );
      IF FOUND THEN v_signals_created := v_signals_created + 1; END IF;
    END IF;

    -- Signal 4: low_date_satisfaction — 2 consecutive < 3/5 ratings
    v_low_ratings := 0;
    FOR v_rating IN
      SELECT rating FROM date_ratings
      WHERE user_id IN (v_pair.user_a, v_pair.user_b)
      ORDER BY created_at DESC LIMIT 4
    LOOP
      IF v_rating.rating < 3 THEN
        v_low_ratings := v_low_ratings + 1;
      ELSE
        EXIT;
      END IF;
    END LOOP;

    IF v_low_ratings >= 2 THEN
      INSERT INTO relationship_health_signals (pair_id, signal_type, severity, metadata)
      SELECT v_pair.id, 'low_date_satisfaction', 2,
        jsonb_build_object('consecutive_low_ratings', v_low_ratings)
      WHERE NOT EXISTS (
        SELECT 1 FROM relationship_health_signals
        WHERE pair_id = v_pair.id AND signal_type = 'low_date_satisfaction'
          AND resolved = false
      );
      IF FOUND THEN v_signals_created := v_signals_created + 1; END IF;
    END IF;

    -- Signal 5: one_sided_activity — only 1 user has completions in last 5 days
    SELECT count(*) INTO v_user_a_activity
    FROM habit_completions
    WHERE user_id = v_pair.user_a AND completed_at IS NOT NULL
      AND completed_date >= (CURRENT_DATE - 5);

    SELECT count(*) INTO v_user_b_activity
    FROM habit_completions
    WHERE user_id = v_pair.user_b AND completed_at IS NOT NULL
      AND completed_date >= (CURRENT_DATE - 5);

    IF (v_user_a_activity > 3 AND v_user_b_activity = 0)
      OR (v_user_b_activity > 3 AND v_user_a_activity = 0) THEN
      DECLARE
        v_inactive_user uuid;
      BEGIN
        v_inactive_user := CASE WHEN v_user_a_activity = 0 THEN v_pair.user_a ELSE v_pair.user_b END;
        INSERT INTO relationship_health_signals (pair_id, signal_type, affected_user_id, severity, metadata)
        SELECT v_pair.id, 'one_sided_activity', v_inactive_user, 2,
          jsonb_build_object('active_completions', GREATEST(v_user_a_activity, v_user_b_activity),
                            'inactive_completions', 0)
        WHERE NOT EXISTS (
          SELECT 1 FROM relationship_health_signals
          WHERE pair_id = v_pair.id AND signal_type = 'one_sided_activity'
            AND resolved = false
        );
        IF FOUND THEN v_signals_created := v_signals_created + 1; END IF;
      END;
    END IF;

    -- Signal 6: rage_quit — aggregated from interaction_ledger
    FOREACH v_uid IN ARRAY v_user_ids
    LOOP
      SELECT count(*) INTO v_rage_count
      FROM interaction_ledger
      WHERE user_id = v_uid
        AND interaction_type = 'rage_quit'
        AND created_at >= now() - interval '7 days';

      IF v_rage_count >= 2 THEN
        INSERT INTO relationship_health_signals (pair_id, signal_type, affected_user_id, severity, metadata)
        SELECT v_pair.id, 'rage_quit', v_uid, 2,
          jsonb_build_object('rage_quit_count_7d', v_rage_count)
        WHERE NOT EXISTS (
          SELECT 1 FROM relationship_health_signals
          WHERE pair_id = v_pair.id AND signal_type = 'rage_quit'
            AND affected_user_id = v_uid AND resolved = false
        );
        IF FOUND THEN v_signals_created := v_signals_created + 1; END IF;
      END IF;
    END LOOP;

  END LOOP;

  RETURN jsonb_build_object('signals_created', v_signals_created);
END;
$$;

-- ============================================================
-- 2. get_catch_up_tier(p_user_id)
-- Returns {tier, consecutive_losses, eligible_modes}
-- 0 = no catch-up, 1-2 = passive (tier 1), 3-4 = tier 2, 5+ = tier 3
-- ============================================================
CREATE OR REPLACE FUNCTION get_catch_up_tier(p_user_id uuid)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_consecutive_losses integer := 0;
  v_sprint record;
  v_tier integer;
  v_modes jsonb;
BEGIN
  FOR v_sprint IN
    SELECT winner_id FROM sprints
    WHERE status = 'completed' AND winner_id IS NOT NULL
    ORDER BY week_start DESC LIMIT 10
  LOOP
    IF v_sprint.winner_id != p_user_id THEN
      v_consecutive_losses := v_consecutive_losses + 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;

  v_tier := CASE
    WHEN v_consecutive_losses >= 5 THEN 3
    WHEN v_consecutive_losses >= 3 THEN 2
    WHEN v_consecutive_losses >= 1 THEN 1
    ELSE 0
  END;

  v_modes := CASE v_tier
    WHEN 0 THEN '[]'::jsonb
    WHEN 1 THEN '["comeback_multiplier"]'::jsonb
    WHEN 2 THEN '["comeback_multiplier", "head_to_head", "wildcard_habit"]'::jsonb
    WHEN 3 THEN '["comeback_multiplier", "head_to_head", "wildcard_habit", "fresh_start", "swap", "collaborative"]'::jsonb
  END;

  RETURN jsonb_build_object(
    'tier', v_tier,
    'consecutive_losses', v_consecutive_losses,
    'eligible_modes', v_modes
  );
END;
$$;

-- ============================================================
-- 3. calculate_catch_up_bonus(p_user_id, p_sprint_id)
-- Returns {comeback_multiplier, wow_bonus, total_bonus}
-- Tier 1: 1.15x if last week <40% and this week >60%; +5 if WoW >15pp
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_catch_up_bonus(p_user_id uuid, p_sprint_id uuid)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_tier_data jsonb;
  v_tier integer;
  v_last_score real;
  v_current_score real;
  v_multiplier real := 1.0;
  v_wow_bonus integer := 0;
  v_improvement real;
  v_is_user_a boolean;
BEGIN
  v_tier_data := get_catch_up_tier(p_user_id);
  v_tier := (v_tier_data->>'tier')::integer;

  IF v_tier = 0 THEN
    RETURN jsonb_build_object('comeback_multiplier', 1.0, 'wow_bonus', 0, 'total_bonus', 0);
  END IF;

  -- Get current sprint score
  SELECT
    CASE WHEN pp.user_a = p_user_id THEN true ELSE false END INTO v_is_user_a
  FROM partner_pairs pp WHERE pp.active = true LIMIT 1;

  SELECT
    CASE WHEN v_is_user_a THEN s.score_a ELSE s.score_b END INTO v_current_score
  FROM sprints s WHERE s.id = p_sprint_id;

  -- Get previous sprint score
  SELECT
    CASE WHEN v_is_user_a THEN s.score_a ELSE s.score_b END INTO v_last_score
  FROM sprints s
  WHERE s.status = 'completed' AND s.id != p_sprint_id
  ORDER BY s.week_start DESC LIMIT 1;

  -- Comeback multiplier: 1.15x if last week < 40 and this week > 60
  IF v_last_score IS NOT NULL AND v_last_score < 40 AND COALESCE(v_current_score, 0) > 60 THEN
    v_multiplier := CASE v_tier
      WHEN 1 THEN 1.15
      WHEN 2 THEN 1.20
      WHEN 3 THEN 1.25
      ELSE 1.0
    END;
  END IF;

  -- WoW improvement bonus: +5 if improvement > 15pp
  IF v_last_score IS NOT NULL AND v_current_score IS NOT NULL THEN
    v_improvement := v_current_score - v_last_score;
    IF v_improvement > 15 THEN
      v_wow_bonus := CASE v_tier
        WHEN 1 THEN 5
        WHEN 2 THEN 8
        WHEN 3 THEN 12
        ELSE 0
      END;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'comeback_multiplier', v_multiplier,
    'wow_bonus', v_wow_bonus,
    'total_bonus', round(((COALESCE(v_current_score, 0) * v_multiplier) - COALESCE(v_current_score, 0) + v_wow_bonus)::numeric, 1)
  );
END;
$$;

-- ============================================================
-- 4. get_interaction_ratio(p_user_id)
-- Returns {positive, negative, ratio, healthy, surplus_needed}
-- Reads interaction_ledger last 14 days. Supersedes get_notification_ratio.
-- ============================================================
CREATE OR REPLACE FUNCTION get_interaction_ratio(p_user_id uuid)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_positive integer;
  v_negative integer;
  v_total integer;
  v_ratio real;
  v_surplus integer;
BEGIN
  SELECT count(*) FILTER (WHERE valence = 'positive'),
         count(*) FILTER (WHERE valence = 'negative')
  INTO v_positive, v_negative
  FROM interaction_ledger
  WHERE user_id = p_user_id
    AND created_at >= now() - interval '14 days';

  v_total := v_positive + v_negative;

  -- Cold start: default to healthy if < 7 interactions
  IF v_total < 7 THEN
    RETURN jsonb_build_object(
      'positive', v_positive,
      'negative', v_negative,
      'ratio', 5.0,
      'healthy', true,
      'surplus_needed', 0,
      'cold_start', true
    );
  END IF;

  IF v_negative = 0 THEN
    v_ratio := v_positive::real;
  ELSE
    v_ratio := v_positive::real / v_negative::real;
  END IF;

  -- surplus_needed: how many more positive interactions needed to reach 5:1
  IF v_ratio < 5.0 THEN
    v_surplus := CEIL(v_negative * 5.0 - v_positive)::integer;
  ELSE
    v_surplus := 0;
  END IF;

  RETURN jsonb_build_object(
    'positive', v_positive,
    'negative', v_negative,
    'ratio', round(v_ratio::numeric, 2),
    'healthy', v_ratio >= 5.0,
    'surplus_needed', v_surplus,
    'cold_start', false
  );
END;
$$;

-- ============================================================
-- 5. check_active_grace_period(p_user_id)
-- Returns jsonb or null
-- ============================================================
CREATE OR REPLACE FUNCTION check_active_grace_period(p_user_id uuid)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_grace record;
BEGIN
  SELECT * INTO v_grace
  FROM grace_periods
  WHERE user_id = p_user_id
    AND active = true
    AND starts_at <= CURRENT_DATE
    AND ends_at >= CURRENT_DATE
  ORDER BY ends_at DESC
  LIMIT 1;

  IF v_grace IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'active', true,
    'reason', v_grace.reason,
    'starts_at', v_grace.starts_at,
    'ends_at', v_grace.ends_at,
    'days_remaining', (v_grace.ends_at - CURRENT_DATE)
  );
END;
$$;

-- ============================================================
-- 6. activate_monthly_free_grace(p_user_id)
-- 1 free 7-day grace period per calendar month
-- ============================================================
CREATE OR REPLACE FUNCTION activate_monthly_free_grace(p_user_id uuid)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_existing boolean;
  v_grace_id uuid;
BEGIN
  -- Check if monthly_free already used this month
  SELECT EXISTS(
    SELECT 1 FROM grace_periods
    WHERE user_id = p_user_id
      AND reason = 'monthly_free'
      AND date_trunc('month', created_at) = date_trunc('month', now())
  ) INTO v_existing;

  IF v_existing THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'already_used_this_month'
    );
  END IF;

  INSERT INTO grace_periods (user_id, reason, starts_at, ends_at, auto_triggered)
  VALUES (p_user_id, 'monthly_free', CURRENT_DATE, CURRENT_DATE + 7, false)
  RETURNING id INTO v_grace_id;

  RETURN jsonb_build_object(
    'success', true,
    'grace_id', v_grace_id,
    'starts_at', CURRENT_DATE,
    'ends_at', CURRENT_DATE + 7,
    'days', 7
  );
END;
$$;

-- ============================================================
-- 7. get_dynamic_threshold(p_user_id)
-- Rolling 4-week average * 0.85, clamped 30-70
-- ============================================================
CREATE OR REPLACE FUNCTION get_dynamic_threshold(p_user_id uuid)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_is_user_a boolean;
  v_scores real[];
  v_sprint record;
  v_avg real;
  v_threshold real;
BEGIN
  SELECT
    CASE WHEN pp.user_a = p_user_id THEN true ELSE false END INTO v_is_user_a
  FROM partner_pairs pp WHERE pp.active = true LIMIT 1;

  v_scores := ARRAY[]::real[];

  FOR v_sprint IN
    SELECT score_a, score_b FROM sprints
    WHERE status = 'completed'
    ORDER BY week_start DESC LIMIT 4
  LOOP
    IF v_is_user_a THEN
      v_scores := v_scores || COALESCE(v_sprint.score_a, 0);
    ELSE
      v_scores := v_scores || COALESCE(v_sprint.score_b, 0);
    END IF;
  END LOOP;

  IF array_length(v_scores, 1) IS NULL OR array_length(v_scores, 1) = 0 THEN
    RETURN jsonb_build_object('threshold', 50, 'rolling_avg', NULL, 'recent_scores', '[]'::jsonb);
  END IF;

  -- Calculate rolling average
  SELECT avg(s) INTO v_avg FROM unnest(v_scores) AS s;

  -- Dynamic threshold = 85% of rolling average, clamped 30-70
  v_threshold := GREATEST(30, LEAST(70, v_avg * 0.85));

  RETURN jsonb_build_object(
    'threshold', round(v_threshold::numeric, 1),
    'rolling_avg', round(v_avg::numeric, 1),
    'recent_scores', to_jsonb(v_scores)
  );
END;
$$;

-- ============================================================
-- Cron Jobs
-- ============================================================

-- Health check cron: daily at 22:00 UTC
SELECT cron.schedule('health-check-daily', '0 22 * * *', $$
  SELECT net.http_post(
    url := 'https://qfqyojetycefdwadralg.supabase.co/functions/v1/kira-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := '{"function_type":"health_check"}'::jsonb
  );
$$);

-- Positive injection cron: daily at 14:00 UTC
SELECT cron.schedule('positive-injection-daily', '0 14 * * *', $$
  SELECT net.http_post(
    url := 'https://qfqyojetycefdwadralg.supabase.co/functions/v1/kira-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := '{"function_type":"positive_injection"}'::jsonb
  );
$$);

-- Interaction ledger cleanup: weekly Sunday 03:00 UTC
SELECT cron.schedule('cleanup-interaction-ledger', '0 3 * * 0', $$
  SELECT cleanup_old_interactions();
$$);
