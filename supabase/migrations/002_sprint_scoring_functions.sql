-- Source-control copy of deployed sprint scoring functions
-- Deployed to Supabase project qfqyojetycefdwadralg
-- Functions: calculate_live_scores, check_appreciation_gate, get_sprint_history
-- NOTE: calculate_live_scores is superseded by 008_add_daily_bonus_scoring.sql (adds 5% bonus)

-- 4-factor weighted scoring with MAD consistency metric (original version, see 008 for current)
CREATE OR REPLACE FUNCTION public.calculate_live_scores(p_sprint_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_sprint_id uuid;
  v_week_start date;
  v_week_end date;
  v_pair record;
  v_user_a uuid;
  v_user_b uuid;
  v_result jsonb := '{}'::jsonb;
  v_user_id uuid;
  v_task record;
  v_day date;
  v_dow int;
  v_due boolean;
  v_completed boolean;
  v_total_due int;
  v_total_completed int;
  v_weighted_possible float;
  v_weighted_completed float;
  v_daily_completions int[];
  v_day_idx int;
  v_weight float;
  v_completion float;
  v_difficulty float;
  v_consistency float;
  v_streak float;
  v_mean float;
  v_mad float;
  v_max_mad float;
  v_streak_sum float;
  v_streak_count int;
  v_current_streak int;
  v_total float;
  v_user_key text;
  v_breakdown jsonb;
BEGIN
  IF p_sprint_id IS NOT NULL THEN
    SELECT id, week_start INTO v_sprint_id, v_week_start
    FROM sprints WHERE id = p_sprint_id;
  ELSE
    SELECT id, week_start INTO v_sprint_id, v_week_start
    FROM sprints WHERE status = 'active' ORDER BY week_start DESC LIMIT 1;
  END IF;

  IF v_sprint_id IS NULL THEN
    RAISE EXCEPTION 'No active sprint found';
  END IF;

  v_week_end := v_week_start + 6;

  SELECT user_a, user_b INTO v_user_a, v_user_b
  FROM partner_pairs WHERE active = true LIMIT 1;

  IF v_user_a IS NULL THEN
    RAISE EXCEPTION 'No active partner pair found';
  END IF;

  FOR v_user_id IN SELECT unnest(ARRAY[v_user_a, v_user_b])
  LOOP
    v_total_due := 0;
    v_total_completed := 0;
    v_weighted_possible := 0;
    v_weighted_completed := 0;
    v_daily_completions := ARRAY[0,0,0,0,0,0,0];
    v_streak_sum := 0;
    v_streak_count := 0;

    FOR v_task IN
      SELECT st.task_id, st.difficulty_rating, t.recurrence, t.custom_days
      FROM sprint_tasks st
      JOIN tasks t ON t.id = st.task_id
      WHERE st.sprint_id = v_sprint_id AND st.user_id = v_user_id
    LOOP
      v_weight := CASE v_task.difficulty_rating
        WHEN 'easy' THEN 0.5
        WHEN 'medium' THEN 1.0
        WHEN 'hard' THEN 1.5
        WHEN 'legendary' THEN 2.0
        ELSE 1.0
      END;

      v_day := v_week_start;
      v_day_idx := 1;
      WHILE v_day <= v_week_end LOOP
        v_dow := EXTRACT(DOW FROM v_day)::int;

        v_due := CASE
          WHEN v_task.recurrence IS NULL OR v_task.recurrence = 'daily' THEN true
          WHEN v_task.recurrence = 'weekdays' THEN v_dow BETWEEN 1 AND 5
          WHEN v_task.recurrence = 'weekends' THEN v_dow IN (0, 6)
          WHEN v_task.recurrence = 'custom' AND v_task.custom_days IS NOT NULL THEN
            v_dow = ANY(v_task.custom_days)
          ELSE true
        END;

        IF v_due THEN
          v_total_due := v_total_due + 1;
          v_weighted_possible := v_weighted_possible + v_weight;

          SELECT EXISTS(
            SELECT 1 FROM habit_completions
            WHERE task_id = v_task.task_id
              AND user_id = v_user_id
              AND completed_date = v_day
          ) INTO v_completed;

          IF v_completed THEN
            v_total_completed := v_total_completed + 1;
            v_weighted_completed := v_weighted_completed + v_weight;
            v_daily_completions[v_day_idx] := v_daily_completions[v_day_idx] + 1;
          END IF;
        END IF;

        v_day := v_day + 1;
        v_day_idx := v_day_idx + 1;
      END LOOP;

      SELECT COALESCE(s.current_days, 0) INTO v_current_streak
      FROM streaks s
      WHERE s.task_id = v_task.task_id
        AND s.user_id = v_user_id
        AND s.streak_type = 'individual'
      LIMIT 1;
      v_streak_sum := v_streak_sum + COALESCE(v_current_streak, 0);
      v_streak_count := v_streak_count + 1;
    END LOOP;

    IF v_total_due > 0 THEN
      v_completion := (v_total_completed::float / v_total_due) * 100;
    ELSE
      v_completion := 0;
    END IF;

    IF v_weighted_possible > 0 THEN
      v_difficulty := (v_weighted_completed / v_weighted_possible) * 100;
    ELSE
      v_difficulty := 0;
    END IF;

    v_mean := 0;
    FOR i IN 1..7 LOOP
      v_mean := v_mean + v_daily_completions[i];
    END LOOP;
    v_mean := v_mean / 7.0;

    v_mad := 0;
    FOR i IN 1..7 LOOP
      v_mad := v_mad + ABS(v_daily_completions[i] - v_mean);
    END LOOP;
    v_mad := v_mad / 7.0;

    v_max_mad := GREATEST(v_mean * 6.0 / 7.0, 0.001);
    v_consistency := GREATEST(100.0 * (1.0 - v_mad / v_max_mad), 0);

    IF v_total_completed = 0 THEN
      v_consistency := 0;
    END IF;

    IF v_streak_count > 0 THEN
      v_streak := LEAST(25.0 * LN(GREATEST(v_streak_sum / v_streak_count, 1)) / LN(30), 100);
    ELSE
      v_streak := 0;
    END IF;

    v_total := 0.30 * v_completion + 0.20 * v_difficulty + 0.30 * v_consistency + 0.15 * v_streak;
    v_total := ROUND(v_total::numeric, 1);
    v_completion := ROUND(v_completion::numeric, 1);
    v_difficulty := ROUND(v_difficulty::numeric, 1);
    v_consistency := ROUND(v_consistency::numeric, 1);
    v_streak := ROUND(v_streak::numeric, 1);

    v_breakdown := jsonb_build_object(
      'completion', v_completion,
      'difficulty', v_difficulty,
      'consistency', v_consistency,
      'streak', v_streak,
      'total', v_total
    );

    IF v_user_id = v_user_a THEN
      v_user_key := 'user_a';
    ELSE
      v_user_key := 'user_b';
    END IF;

    v_result := v_result || jsonb_build_object(
      v_user_key, jsonb_build_object(
        'user_id', v_user_id,
        'breakdown', v_breakdown,
        'total', v_total,
        'tasks_due', v_total_due,
        'tasks_completed', v_total_completed
      )
    );
  END LOOP;

  RETURN v_result;
END;
$function$;


-- Appreciation gate check using auth.uid()
CREATE OR REPLACE FUNCTION public.check_appreciation_gate(p_sprint_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_partner_id uuid;
  v_my_note boolean;
  v_partner_note boolean;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get partner
  SELECT
    CASE WHEN user_a = v_user_id THEN user_b ELSE user_a END
    INTO v_partner_id
  FROM partner_pairs
  WHERE active = true AND (user_a = v_user_id OR user_b = v_user_id)
  LIMIT 1;

  -- Check if my note exists
  SELECT EXISTS(
    SELECT 1 FROM appreciation_notes
    WHERE sprint_id = p_sprint_id AND author_id = v_user_id
  ) INTO v_my_note;

  -- Check if partner's note exists
  SELECT EXISTS(
    SELECT 1 FROM appreciation_notes
    WHERE sprint_id = p_sprint_id AND author_id = v_partner_id
  ) INTO v_partner_note;

  RETURN jsonb_build_object(
    'my_note_written', v_my_note,
    'partner_note_written', v_partner_note,
    'gate_passed', v_my_note AND v_partner_note
  );
END;
$function$;


-- Perspective-adjusted sprint history
CREATE OR REPLACE FUNCTION public.get_sprint_history(p_limit integer DEFAULT 10)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_user_a uuid;
  v_user_b uuid;
  v_is_user_a boolean;
  v_sprint record;
  v_results jsonb := '[]'::jsonb;
  v_my_score float;
  v_partner_score float;
  v_my_breakdown jsonb;
  v_partner_breakdown jsonb;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get pair info
  SELECT pp.user_a, pp.user_b INTO v_user_a, v_user_b
  FROM partner_pairs pp
  WHERE pp.active = true AND (pp.user_a = v_user_id OR pp.user_b = v_user_id)
  LIMIT 1;

  v_is_user_a := (v_user_id = v_user_a);

  FOR v_sprint IN
    SELECT * FROM sprints
    WHERE status = 'completed'
    ORDER BY week_start DESC
    LIMIT p_limit
  LOOP
    IF v_is_user_a THEN
      v_my_score := COALESCE(v_sprint.score_a, 0);
      v_partner_score := COALESCE(v_sprint.score_b, 0);
      v_my_breakdown := v_sprint.score_breakdown_a;
      v_partner_breakdown := v_sprint.score_breakdown_b;
    ELSE
      v_my_score := COALESCE(v_sprint.score_b, 0);
      v_partner_score := COALESCE(v_sprint.score_a, 0);
      v_my_breakdown := v_sprint.score_breakdown_b;
      v_partner_breakdown := v_sprint.score_breakdown_a;
    END IF;

    v_results := v_results || jsonb_build_object(
      'id', v_sprint.id,
      'week_start', v_sprint.week_start,
      'my_score', v_my_score,
      'partner_score', v_partner_score,
      'my_breakdown', v_my_breakdown,
      'partner_breakdown', v_partner_breakdown,
      'i_won', v_sprint.winner_id = v_user_id,
      'is_tie', v_sprint.winner_id IS NULL AND v_sprint.score_a IS NOT NULL
    );
  END LOOP;

  RETURN v_results;
END;
$function$;
