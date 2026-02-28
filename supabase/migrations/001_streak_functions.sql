-- Source-control copy of deployed update_streak_for_task function
-- Deployed to Supabase project qfqyojetycefdwadralg
-- Features: 60% threshold, streak freeze, milestone floors

CREATE OR REPLACE FUNCTION public.update_streak_for_task(p_task_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_task RECORD;
  v_streak_days INT := 0;
  v_check_date DATE;
  v_today DATE;
  v_day_of_week INT;
  v_best_days INT;
  v_milestone INT;
  v_milestones INT[] := ARRAY[3, 7, 14, 21, 30, 60, 90];
  v_m INT;
  -- Milestone floor protection
  v_old_milestone_floor INT := 0;
  v_old_current_days INT := 0;
  -- Streak freeze
  v_old_freeze_available INT := 0;
  v_old_freeze_used_at DATE[] := '{}';
  v_freeze_consumed BOOLEAN := FALSE;
  -- 60% threshold
  v_threshold_met BOOLEAN := FALSE;
  v_total_due INT := 0;
  v_total_completed INT := 0;
  v_gap_date DATE := NULL;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Fetch the task
  SELECT * INTO v_task FROM tasks WHERE id = p_task_id AND user_id = v_user_id;
  IF v_task IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Task not found');
  END IF;

  -- Get user's today based on their timezone
  SELECT (now() AT TIME ZONE COALESCE(
    (SELECT timezone FROM users WHERE id = v_user_id), 'UTC'
  ))::date INTO v_today;

  -- Read existing streak data (for milestone floor + freeze)
  SELECT COALESCE(s.milestone_floor, 0),
         COALESCE(s.current_days, 0),
         COALESCE(s.freeze_available, 1),
         COALESCE(s.freeze_used_at, '{}')
    INTO v_old_milestone_floor, v_old_current_days, v_old_freeze_available, v_old_freeze_used_at
    FROM streaks s
   WHERE s.task_id = p_task_id
     AND s.user_id = v_user_id
     AND s.streak_type = 'individual'
   LIMIT 1;

  -- Count consecutive days backward from today
  v_check_date := v_today;

  LOOP
    -- Check if this date has a completion
    IF EXISTS (
      SELECT 1 FROM habit_completions
      WHERE task_id = p_task_id AND user_id = v_user_id AND completed_date = v_check_date
    ) THEN
      v_streak_days := v_streak_days + 1;
      v_check_date := v_check_date - 1;
    ELSE
      -- Check if this day was a non-applicable day (skip it)
      v_day_of_week := EXTRACT(DOW FROM v_check_date)::int;

      IF v_task.recurrence = 'weekdays' AND v_day_of_week IN (0, 6) THEN
        v_check_date := v_check_date - 1;
      ELSIF v_task.recurrence = 'weekends' AND v_day_of_week NOT IN (0, 6) THEN
        v_check_date := v_check_date - 1;
      ELSIF v_task.recurrence = 'custom' AND v_task.custom_days IS NOT NULL
            AND NOT (v_day_of_week = ANY(v_task.custom_days)) THEN
        v_check_date := v_check_date - 1;
      ELSE
        -- Applicable day with no completion
        -- If it's today and not yet completed, check yesterday instead
        IF v_check_date = v_today AND v_streak_days = 0 THEN
          v_check_date := v_check_date - 1;
        ELSE
          -- Before breaking: check 60% daily threshold for this gap date
          v_gap_date := v_check_date;

          -- Count all active due habits for this date
          SELECT COUNT(*) INTO v_total_due
            FROM tasks t
           WHERE t.user_id = v_user_id
             AND t.active = true
             AND (
               t.recurrence = 'daily'
               OR (t.recurrence = 'weekdays' AND EXTRACT(DOW FROM v_gap_date)::int NOT IN (0, 6))
               OR (t.recurrence = 'weekends' AND EXTRACT(DOW FROM v_gap_date)::int IN (0, 6))
               OR (t.recurrence = 'custom' AND t.custom_days IS NOT NULL
                   AND (EXTRACT(DOW FROM v_gap_date)::int = ANY(t.custom_days)))
             );

          -- Count completions for this date
          SELECT COUNT(*) INTO v_total_completed
            FROM habit_completions hc
           WHERE hc.user_id = v_user_id
             AND hc.completed_date = v_gap_date;

          -- Check 60% threshold
          IF v_total_due > 0 AND v_total_completed::numeric / v_total_due >= 0.6 THEN
            v_threshold_met := TRUE;
            -- Threshold met: treat as a pass, continue streak
            v_streak_days := v_streak_days + 1;
            v_check_date := v_check_date - 1;
          ELSE
            -- Threshold not met — streak would break here
            EXIT;
          END IF;
        END IF;
      END IF;
    END IF;

    -- Safety: don't go back more than 365 days
    IF v_today - v_check_date > 365 THEN
      EXIT;
    END IF;
  END LOOP;

  -- If streak is 0 and we had a previous streak, apply protections
  IF v_streak_days = 0 AND v_old_current_days > 0 THEN
    -- First try streak freeze
    IF v_old_freeze_available > 0 THEN
      v_freeze_consumed := TRUE;
      v_old_freeze_available := v_old_freeze_available - 1;
      v_old_freeze_used_at := array_append(v_old_freeze_used_at, v_today);
      -- Keep the streak alive at old value
      v_streak_days := v_old_current_days;
    ELSE
      -- No freeze available — apply milestone floor protection
      IF v_old_milestone_floor > 0 THEN
        v_streak_days := v_old_milestone_floor;
      END IF;
    END IF;
  END IF;

  -- Calculate milestone floor for current streak
  v_milestone := 0;
  FOREACH v_m IN ARRAY v_milestones LOOP
    IF v_streak_days >= v_m THEN
      v_milestone := v_m;
    END IF;
  END LOOP;

  -- Grant additional freeze at milestone thresholds (7, 21, 60)
  -- Only grant if we just crossed the milestone (old days < milestone, new days >= milestone)
  IF v_streak_days >= 7 AND v_old_current_days < 7 THEN
    v_old_freeze_available := v_old_freeze_available + 1;
  END IF;
  IF v_streak_days >= 21 AND v_old_current_days < 21 THEN
    v_old_freeze_available := v_old_freeze_available + 1;
  END IF;
  IF v_streak_days >= 60 AND v_old_current_days < 60 THEN
    v_old_freeze_available := v_old_freeze_available + 1;
  END IF;

  -- Get current best
  SELECT COALESCE(best_days, 0) INTO v_best_days
  FROM streaks
  WHERE task_id = p_task_id AND user_id = v_user_id AND streak_type = 'individual'
  LIMIT 1;

  -- Upsert streak record
  INSERT INTO streaks (
    user_id, task_id, streak_type, current_days, best_days,
    milestone_floor, last_completed_at, updated_at,
    freeze_available, freeze_used_at
  )
  VALUES (
    v_user_id, p_task_id, 'individual', v_streak_days,
    GREATEST(COALESCE(v_best_days, 0), v_streak_days),
    v_milestone,
    CASE WHEN v_streak_days > 0 THEN now() ELSE NULL END,
    now(),
    v_old_freeze_available,
    v_old_freeze_used_at
  )
  ON CONFLICT (user_id, task_id) WHERE task_id IS NOT NULL AND streak_type = 'individual'
  DO UPDATE SET
    current_days = EXCLUDED.current_days,
    best_days = GREATEST(streaks.best_days, EXCLUDED.current_days),
    milestone_floor = EXCLUDED.milestone_floor,
    last_completed_at = EXCLUDED.last_completed_at,
    updated_at = now(),
    broken_at = CASE WHEN EXCLUDED.current_days = 0 THEN now() ELSE NULL END,
    freeze_available = EXCLUDED.freeze_available,
    freeze_used_at = EXCLUDED.freeze_used_at;

  RETURN jsonb_build_object(
    'success', true,
    'current_days', v_streak_days,
    'best_days', GREATEST(COALESCE(v_best_days, 0), v_streak_days),
    'milestone_floor', v_milestone,
    'freeze_available', v_old_freeze_available,
    'freeze_consumed', v_freeze_consumed,
    'threshold_met', v_threshold_met
  );
END;
$function$;
