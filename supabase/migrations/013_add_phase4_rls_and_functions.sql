-- Phase 4: RLS policies for new tables + tier/prestige functions

-- ============================================================
-- RLS: date_ratings
-- ============================================================
ALTER TABLE date_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "date_ratings_select_paired" ON date_ratings
  FOR SELECT USING (true);

CREATE POLICY "date_ratings_insert_own" ON date_ratings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "date_ratings_update_own" ON date_ratings
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- RLS: tp_audit_log
-- ============================================================
ALTER TABLE tp_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tp_audit_select_own" ON tp_audit_log
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- RLS: veto_records
-- ============================================================
ALTER TABLE veto_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "veto_records_select_paired" ON veto_records
  FOR SELECT USING (true);

CREATE POLICY "veto_records_insert_own" ON veto_records
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================
-- RLS: couple_rescues
-- ============================================================
ALTER TABLE couple_rescues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "couple_rescues_select_paired" ON couple_rescues
  FOR SELECT USING (true);

CREATE POLICY "couple_rescues_insert_own" ON couple_rescues
  FOR INSERT WITH CHECK (rescuer_id = auth.uid());

CREATE POLICY "couple_rescues_update_own" ON couple_rescues
  FOR UPDATE USING (rescuer_id = auth.uid());

-- ============================================================
-- RLS: date_memory_state
-- ============================================================
ALTER TABLE date_memory_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "date_memory_select_all" ON date_memory_state
  FOR SELECT USING (true);

-- date_memory_state is updated by service_role only

-- ============================================================
-- get_tier_unlocks — returns tier + unlocked features as JSON
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_tier_unlocks(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_tier text;
  v_tp integer;
  v_prestige integer;
  v_tier_idx integer;
  v_unlocks jsonb;
BEGIN
  SELECT current_tier, current_tp, prestige_level
  INTO v_tier, v_tp, v_prestige
  FROM tier_progress
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    v_tier := 'seedling';
    v_tp := 0;
    v_prestige := 0;
  END IF;

  -- Map tier to numeric index for comparison
  v_tier_idx := CASE v_tier
    WHEN 'seedling' THEN 0
    WHEN 'sprout' THEN 1
    WHEN 'bloom' THEN 2
    WHEN 'mighty_oak' THEN 3
    WHEN 'unshakeable' THEN 4
    ELSE 0
  END;

  v_unlocks := jsonb_build_object(
    'custom_themes', v_tier_idx >= 1,        -- sprout+
    'streak_freeze', v_tier_idx >= 1,        -- sprout+
    'ai_task_suggestions', v_tier_idx >= 2,  -- bloom+
    'personality_modes', v_tier_idx >= 2,    -- bloom+
    'bonus_veto', v_tier_idx >= 3,           -- mighty_oak+
    'couple_rescue', v_tier_idx >= 3,        -- mighty_oak+
    'prestige_reset', v_tier_idx >= 4,       -- unshakeable
    'surprise_dates', v_tier_idx >= 3        -- mighty_oak+
  );

  RETURN jsonb_build_object(
    'tier', v_tier,
    'tp', v_tp,
    'prestige', v_prestige,
    'tier_index', v_tier_idx,
    'unlocks', v_unlocks
  );
END;
$$;

-- ============================================================
-- trigger_prestige — Unshakeable -> Bloom prestige reset
-- ============================================================
CREATE OR REPLACE FUNCTION public.trigger_prestige(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_current_tier text;
  v_prestige integer;
  v_bloom_tp integer := 120; -- TP threshold for Bloom
BEGIN
  SELECT current_tier, prestige_level
  INTO v_current_tier, v_prestige
  FROM tier_progress
  WHERE user_id = p_user_id;

  IF NOT FOUND OR v_current_tier != 'unshakeable' THEN
    RETURN jsonb_build_object('error', 'Must be Unshakeable tier to prestige');
  END IF;

  -- Reset to Bloom tier with +1 prestige
  UPDATE tier_progress
  SET current_tp = v_bloom_tp,
      current_tier = 'bloom',
      prestige_level = v_prestige + 1,
      tier_history = tier_history || jsonb_build_array(jsonb_build_object(
        'from', 'unshakeable',
        'to', 'bloom',
        'at', now(),
        'tp', v_bloom_tp,
        'prestige', v_prestige + 1,
        'type', 'prestige_reset'
      )),
      updated_at = now()
  WHERE user_id = p_user_id;

  -- Log in tp_audit_log
  INSERT INTO tp_audit_log (user_id, tp_before, tp_after, tp_delta, tier_before, tier_after, reason)
  VALUES (p_user_id, 600, v_bloom_tp, v_bloom_tp - 600, 'unshakeable', 'bloom',
          'Prestige reset #' || (v_prestige + 1));

  RETURN jsonb_build_object(
    'success', true,
    'new_tier', 'bloom',
    'new_tp', v_bloom_tp,
    'prestige_level', v_prestige + 1
  );
END;
$$;

-- ============================================================
-- Enhance update_tier_points to log into tp_audit_log
-- ============================================================
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
    v_tp_delta := 10 + round(((p_score - 70) / 30.0) * 15)::integer;
    v_tp_delta := LEAST(25, GREATEST(10, v_tp_delta));
  ELSIF p_score >= 40 THEN
    v_tp_delta := round(((p_score - 40) / 29.0) * 6)::integer;
    v_tp_delta := LEAST(6, GREATEST(0, v_tp_delta));
  ELSE
    v_tp_delta := -15;
  END IF;

  -- Get current TP
  SELECT current_tp, current_tier
  INTO v_old_tp, v_old_tier
  FROM tier_progress
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    v_old_tp := 0;
    v_old_tier := 'seedling';
  END IF;

  v_new_tp := GREATEST(0, v_old_tp + v_tp_delta);

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
        'from', v_old_tier, 'to', v_new_tier, 'at', now(), 'tp', v_new_tp
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
          'from', v_old_tier, 'to', v_new_tier, 'at', now(), 'tp', v_new_tp
        ))
      ELSE tier_progress.tier_history
    END,
    updated_at = now();

  -- Log TP change in audit log
  INSERT INTO tp_audit_log (user_id, tp_before, tp_after, tp_delta, tier_before, tier_after, reason)
  VALUES (p_user_id, v_old_tp, v_new_tp, v_tp_delta, v_old_tier::text, v_new_tier::text,
          'Sprint score: ' || p_score);

  -- Add positive TP to relationship_xp
  IF v_tp_delta > 0 THEN
    SELECT id INTO v_pair_id FROM relationship_xp LIMIT 1;
    IF v_pair_id IS NOT NULL THEN
      UPDATE relationship_xp
      SET total_xp = total_xp + v_tp_delta, updated_at = now()
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
