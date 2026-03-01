-- Phase 6: Psychological guardrail SQL functions
-- Score gap circuit breaker, notification ratio (Losada), engagement drop-off detection

-- ============================================================
-- check_score_gap_circuit_breaker
-- Returns true if one partner leads by >40% for 2+ consecutive weeks
-- ============================================================
CREATE OR REPLACE FUNCTION check_score_gap_circuit_breaker(p_user_id uuid)
  RETURNS boolean
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_partner_id uuid;
  v_consecutive_gap_weeks integer := 0;
  v_sprint record;
BEGIN
  -- Find partner
  SELECT CASE
    WHEN pp.user_a = p_user_id THEN pp.user_b
    ELSE pp.user_a
  END INTO v_partner_id
  FROM partner_pairs pp
  WHERE pp.active = true
    AND (pp.user_a = p_user_id OR pp.user_b = p_user_id)
  LIMIT 1;

  IF v_partner_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check last 4 completed sprints
  FOR v_sprint IN
    SELECT s.id, s.score_a, s.score_b, s.user_a, s.user_b
    FROM sprints s
    WHERE s.status = 'completed'
    ORDER BY s.week_start DESC
    LIMIT 4
  LOOP
    DECLARE
      v_user_score real;
      v_partner_score real;
      v_gap real;
    BEGIN
      -- Determine which score belongs to which user
      IF v_sprint.user_a = p_user_id THEN
        v_user_score := COALESCE(v_sprint.score_a, 0);
        v_partner_score := COALESCE(v_sprint.score_b, 0);
      ELSE
        v_user_score := COALESCE(v_sprint.score_b, 0);
        v_partner_score := COALESCE(v_sprint.score_a, 0);
      END IF;

      -- Check if gap exceeds 40%
      v_gap := abs(v_user_score - v_partner_score);
      IF v_gap > 40 THEN
        v_consecutive_gap_weeks := v_consecutive_gap_weeks + 1;
      ELSE
        EXIT; -- Gap not present, stop counting
      END IF;
    END;
  END LOOP;

  RETURN v_consecutive_gap_weeks >= 2;
END;
$$;

-- ============================================================
-- get_notification_ratio
-- Returns positive:negative notification ratio for 5:1 Losada enforcement
-- Positive = celebration, partner_activity, sprint_start, sprint_results
-- Negative = streak_warning, nudge, task_deadline
-- ============================================================
CREATE OR REPLACE FUNCTION get_notification_ratio(p_user_id uuid)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_positive integer;
  v_negative integer;
  v_ratio real;
BEGIN
  -- Count positive notifications in last 14 days
  SELECT count(*) INTO v_positive
  FROM notification_queue
  WHERE user_id = p_user_id
    AND created_at >= now() - interval '14 days'
    AND category IN ('celebration', 'partner_activity', 'sprint_start', 'sprint_results');

  -- Count negative/pressure notifications in last 14 days
  SELECT count(*) INTO v_negative
  FROM notification_queue
  WHERE user_id = p_user_id
    AND created_at >= now() - interval '14 days'
    AND category IN ('streak_warning', 'nudge', 'task_deadline');

  -- Calculate ratio (positive / negative)
  IF v_negative = 0 THEN
    v_ratio := COALESCE(v_positive, 0)::real;
  ELSE
    v_ratio := v_positive::real / v_negative::real;
  END IF;

  RETURN jsonb_build_object(
    'positive', v_positive,
    'negative', v_negative,
    'ratio', round(v_ratio::numeric, 2),
    'healthy', v_ratio >= 5.0
  );
END;
$$;

-- ============================================================
-- check_engagement_dropoff
-- Returns true if engagement dropped >50% week-over-week
-- ============================================================
CREATE OR REPLACE FUNCTION check_engagement_dropoff(p_user_id uuid)
  RETURNS boolean
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_this_week integer;
  v_last_week integer;
BEGIN
  -- Completions this week (Mon-Sun)
  SELECT count(*) INTO v_this_week
  FROM habit_completions
  WHERE user_id = p_user_id
    AND completed = true
    AND date >= date_trunc('week', now())::date;

  -- Completions last week
  SELECT count(*) INTO v_last_week
  FROM habit_completions
  WHERE user_id = p_user_id
    AND completed = true
    AND date >= (date_trunc('week', now()) - interval '7 days')::date
    AND date < date_trunc('week', now())::date;

  -- If last week had activity and this week dropped by >50%
  IF v_last_week > 0 AND v_this_week::real < v_last_week::real * 0.5 THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;
