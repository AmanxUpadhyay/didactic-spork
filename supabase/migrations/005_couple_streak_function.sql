-- Couple streak: unique index + function
-- Checks if both partners completed the same task today

-- Unique index for couple streaks (mirrors the individual one)
CREATE UNIQUE INDEX IF NOT EXISTS idx_streaks_user_task_couple
  ON streaks (user_id, task_id)
  WHERE task_id IS NOT NULL AND streak_type = 'couple';

CREATE OR REPLACE FUNCTION public.update_couple_streak(p_task_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_partner_id uuid;
  v_today date;
  v_both_completed boolean;
  v_streak_days int := 0;
  v_check_date date;
  v_best_days int;
  v_milestone int;
  v_milestones int[] := ARRAY[3, 7, 14, 21, 30, 60, 90];
  v_m int;
  v_task record;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get partner
  SELECT CASE WHEN user_a = v_user_id THEN user_b ELSE user_a END
    INTO v_partner_id
    FROM partner_pairs
   WHERE active = true AND (user_a = v_user_id OR user_b = v_user_id)
   LIMIT 1;

  IF v_partner_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No partner found');
  END IF;

  -- Check the task exists for both users (shared task = same title)
  SELECT * INTO v_task FROM tasks WHERE id = p_task_id;
  IF v_task IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Task not found');
  END IF;

  -- Get user's today
  SELECT (now() AT TIME ZONE COALESCE(
    (SELECT timezone FROM users WHERE id = v_user_id), 'UTC'
  ))::date INTO v_today;

  -- Count consecutive days where both users completed this task
  v_check_date := v_today;

  LOOP
    SELECT (
      EXISTS(SELECT 1 FROM habit_completions WHERE task_id = p_task_id AND user_id = v_user_id AND completed_date = v_check_date)
      AND
      EXISTS(SELECT 1 FROM habit_completions hc
             JOIN tasks t2 ON t2.id = hc.task_id
             WHERE hc.user_id = v_partner_id
               AND hc.completed_date = v_check_date
               AND t2.title = v_task.title)
    ) INTO v_both_completed;

    IF v_both_completed THEN
      v_streak_days := v_streak_days + 1;
      v_check_date := v_check_date - 1;
    ELSE
      -- If it's today with no completions yet, check yesterday
      IF v_check_date = v_today AND v_streak_days = 0 THEN
        v_check_date := v_check_date - 1;
      ELSE
        EXIT;
      END IF;
    END IF;

    IF v_today - v_check_date > 365 THEN
      EXIT;
    END IF;
  END LOOP;

  -- Calculate milestone floor
  v_milestone := 0;
  FOREACH v_m IN ARRAY v_milestones LOOP
    IF v_streak_days >= v_m THEN
      v_milestone := v_m;
    END IF;
  END LOOP;

  -- Get current best
  SELECT COALESCE(best_days, 0) INTO v_best_days
  FROM streaks
  WHERE task_id = p_task_id AND user_id = v_user_id AND streak_type = 'couple'
  LIMIT 1;

  -- Upsert couple streak record
  INSERT INTO streaks (
    user_id, task_id, streak_type, current_days, best_days,
    milestone_floor, last_completed_at, updated_at
  )
  VALUES (
    v_user_id, p_task_id, 'couple', v_streak_days,
    GREATEST(COALESCE(v_best_days, 0), v_streak_days),
    v_milestone,
    CASE WHEN v_streak_days > 0 THEN now() ELSE NULL END,
    now()
  )
  ON CONFLICT (user_id, task_id) WHERE task_id IS NOT NULL AND streak_type = 'couple'
  DO UPDATE SET
    current_days = EXCLUDED.current_days,
    best_days = GREATEST(streaks.best_days, EXCLUDED.current_days),
    milestone_floor = EXCLUDED.milestone_floor,
    last_completed_at = EXCLUDED.last_completed_at,
    updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'current_days', v_streak_days,
    'best_days', GREATEST(COALESCE(v_best_days, 0), v_streak_days),
    'milestone_floor', v_milestone
  );
END;
$function$;
