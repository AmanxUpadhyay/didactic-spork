-- Source-control copy of deployed update_tier_points function
-- Deployed to Supabase project qfqyojetycefdwadralg
-- TP earning/decay: score>=70 -> 10-25TP, 40-69 -> 0-6TP, <40 -> -15TP
-- Tier thresholds: seedling(0), sprout(30), bloom(120), mighty_oak(300), unshakeable(600)

CREATE OR REPLACE FUNCTION public.update_tier_points(p_user_id uuid, p_score real)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_tp_delta integer;
  v_old_tp integer;
  v_new_tp integer;
  v_old_tier tier_name;
  v_new_tier tier_name;
  v_pair_id uuid;
BEGIN
  -- Calculate TP delta based on score
  IF p_score >= 70 THEN
    -- Linear scale: 70->10, 100->25
    v_tp_delta := 10 + round(((p_score - 70) / 30.0) * 15)::integer;
    -- Clamp to 10-25 range
    v_tp_delta := LEAST(25, GREATEST(10, v_tp_delta));
  ELSIF p_score >= 40 THEN
    -- Linear scale: 40->0, 69->6
    v_tp_delta := round(((p_score - 40) / 29.0) * 6)::integer;
    -- Clamp to 0-6 range
    v_tp_delta := LEAST(6, GREATEST(0, v_tp_delta));
  ELSE
    -- Score < 40: lose 15 TP
    v_tp_delta := -15;
  END IF;

  -- Get current TP
  SELECT current_tp, current_tier
  INTO v_old_tp, v_old_tier
  FROM tier_progress
  WHERE user_id = p_user_id;

  -- If no tier_progress row exists, treat as 0
  IF NOT FOUND THEN
    v_old_tp := 0;
    v_old_tier := 'seedling';
  END IF;

  -- Calculate new TP (never below 0)
  v_new_tp := GREATEST(0, v_old_tp + v_tp_delta);

  -- Determine new tier based on TP thresholds
  v_new_tier := CASE
    WHEN v_new_tp >= 600 THEN 'unshakeable'::tier_name
    WHEN v_new_tp >= 300 THEN 'mighty_oak'::tier_name
    WHEN v_new_tp >= 120 THEN 'bloom'::tier_name
    WHEN v_new_tp >= 30  THEN 'sprout'::tier_name
    ELSE 'seedling'::tier_name
  END;

  -- Upsert tier_progress
  INSERT INTO tier_progress (user_id, current_tp, current_tier, tier_history, updated_at)
  VALUES (
    p_user_id,
    v_new_tp,
    v_new_tier,
    CASE WHEN v_old_tier IS DISTINCT FROM v_new_tier THEN
      jsonb_build_array(jsonb_build_object(
        'from', v_old_tier,
        'to', v_new_tier,
        'at', now(),
        'tp', v_new_tp
      ))
    ELSE '[]'::jsonb
    END,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    current_tp = v_new_tp,
    current_tier = v_new_tier,
    tier_history = CASE
      WHEN v_old_tier IS DISTINCT FROM v_new_tier THEN
        tier_progress.tier_history || jsonb_build_array(jsonb_build_object(
          'from', v_old_tier,
          'to', v_new_tier,
          'at', now(),
          'tp', v_new_tp
        ))
      ELSE tier_progress.tier_history
    END,
    updated_at = now();

  -- Add positive TP to relationship_xp (never decrease)
  IF v_tp_delta > 0 THEN
    -- Find the relationship_xp row (there should be exactly one for the couple)
    SELECT id INTO v_pair_id FROM relationship_xp LIMIT 1;

    IF v_pair_id IS NOT NULL THEN
      UPDATE relationship_xp
      SET total_xp = total_xp + v_tp_delta,
          updated_at = now()
      WHERE id = v_pair_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'user_id', p_user_id,
    'score', p_score,
    'tp_delta', v_tp_delta,
    'old_tp', v_old_tp,
    'new_tp', v_new_tp,
    'old_tier', v_old_tier,
    'new_tier', v_new_tier,
    'tier_changed', v_old_tier IS DISTINCT FROM v_new_tier
  );
END;
$function$;
