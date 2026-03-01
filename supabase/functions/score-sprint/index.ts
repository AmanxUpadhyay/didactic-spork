import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { recordInteraction, isTrainingWheels, checkGracePeriod } from "../_shared/health-monitor.ts";

const corsHeaders = {
  "Content-Type": "application/json",
  Connection: "keep-alive",
};

Deno.serve(async (req: Request) => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  // Auth: verify the caller's JWT has service_role claim
  const authHeader = req.headers.get("Authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  // Decode JWT payload and verify service_role claim
  try {
    const payloadB64 = token.split(".")[1];
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.role !== "service_role") {
      return new Response(JSON.stringify({ error: "Unauthorized: not service_role" }), {
        status: 401,
        headers: corsHeaders,
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: "Unauthorized: invalid token" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  // Use the service role key from env to create an admin client
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1. Find active sprint (use maybeSingle to avoid 406 on no rows)
    const { data: sprint, error: sprintErr } = await supabase
      .from("sprints")
      .select("*")
      .eq("status", "active")
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sprintErr) {
      return new Response(
        JSON.stringify({
          error: "Failed to query sprints",
          detail: sprintErr.message,
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (!sprint) {
      return new Response(
        JSON.stringify({ error: "No active sprint found" }),
        { status: 404, headers: corsHeaders }
      );
    }

    // 2. Set status to 'scoring'
    await supabase
      .from("sprints")
      .update({ status: "scoring", updated_at: new Date().toISOString() })
      .eq("id", sprint.id);

    // 3. Call calculate_live_scores RPC
    const { data: scores, error: scoreErr } = await supabase.rpc(
      "calculate_live_scores",
      { p_sprint_id: sprint.id }
    );

    if (scoreErr || !scores) {
      // Revert status on error
      await supabase
        .from("sprints")
        .update({ status: "active" })
        .eq("id", sprint.id);
      return new Response(
        JSON.stringify({
          error: "Scoring failed",
          detail: scoreErr?.message,
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    const userA = scores.user_a;
    const userB = scores.user_b;
    const scoreA = userA?.total ?? 0;
    const scoreB = userB?.total ?? 0;

    // 3.5. Apply catch-up bonuses
    let adjustedScoreA = scoreA;
    let adjustedScoreB = scoreB;

    if (userA?.user_id) {
      const { data: bonusA } = await supabase.rpc("calculate_catch_up_bonus", {
        p_user_id: userA.user_id,
        p_sprint_id: sprint.id,
      });
      if (bonusA && bonusA.total_bonus > 0) {
        adjustedScoreA = scoreA * (bonusA.comeback_multiplier ?? 1) + (bonusA.wow_bonus ?? 0);
        adjustedScoreA = Math.round(adjustedScoreA * 10) / 10;
      }
    }

    if (userB?.user_id) {
      const { data: bonusB } = await supabase.rpc("calculate_catch_up_bonus", {
        p_user_id: userB.user_id,
        p_sprint_id: sprint.id,
      });
      if (bonusB && bonusB.total_bonus > 0) {
        adjustedScoreB = scoreB * (bonusB.comeback_multiplier ?? 1) + (bonusB.wow_bonus ?? 0);
        adjustedScoreB = Math.round(adjustedScoreB * 10) / 10;
      }
    }

    // 3.6. Training wheels check
    const trainingWheels = await isTrainingWheels(supabase, userA?.user_id || userB?.user_id);

    // 3.7. Grace period checks
    const graceA = userA?.user_id ? await checkGracePeriod(supabase, userA.user_id) : null;
    const graceB = userB?.user_id ? await checkGracePeriod(supabase, userB.user_id) : null;

    // 4. Determine winner using adjusted scores (exact tie = NULL)
    let winnerId: string | null = null;
    if (adjustedScoreA > adjustedScoreB) {
      winnerId = userA.user_id;
    } else if (adjustedScoreB > adjustedScoreA) {
      winnerId = userB.user_id;
    }

    // 5. Update sprint with final scores + RPI
    const rpi = adjustedScoreA - adjustedScoreB;
    await supabase
      .from("sprints")
      .update({
        status: "completed",
        score_a: adjustedScoreA,
        score_b: adjustedScoreB,
        score_breakdown_a: userA?.breakdown ?? null,
        score_breakdown_b: userB?.breakdown ?? null,
        winner_id: winnerId,
        relative_performance_index: rpi,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sprint.id);

    // 6. Update sprint_tasks completion status
    const sprintTasks = await supabase
      .from("sprint_tasks")
      .select("id, task_id, user_id")
      .eq("sprint_id", sprint.id);

    if (sprintTasks.data) {
      for (const st of sprintTasks.data) {
        const weekEnd = new Date(
          new Date(sprint.week_start).getTime() + 6 * 86400000
        )
          .toISOString()
          .slice(0, 10);

        const { count } = await supabase
          .from("habit_completions")
          .select("*", { count: "exact", head: true })
          .eq("task_id", st.task_id)
          .eq("user_id", st.user_id)
          .gte("completed_date", sprint.week_start)
          .lte("completed_date", weekEnd);

        const hasCompletions = (count ?? 0) > 0;
        await supabase
          .from("sprint_tasks")
          .update({
            completed: hasCompletions,
            completed_at: hasCompletions ? new Date().toISOString() : null,
            points_earned: hasCompletions ? (count ?? 0) : 0,
          })
          .eq("id", st.id);
      }
    }

    // 7. Calculate and apply tier points for both users
    let tpEarnedA = 0;
    let tpEarnedB = 0;

    if (userA?.user_id) {
      // Skip negative TP changes during grace period
      if (!graceA?.active || adjustedScoreA >= 50) {
        const { data: tpResultA } = await supabase.rpc("update_tier_points", {
          p_user_id: userA.user_id,
          p_score: adjustedScoreA,
        });
        tpEarnedA = tpResultA?.tp_delta ?? 0;
      }
    }

    if (userB?.user_id) {
      if (!graceB?.active || adjustedScoreB >= 50) {
        const { data: tpResultB } = await supabase.rpc("update_tier_points", {
          p_user_id: userB.user_id,
          p_score: adjustedScoreB,
        });
        tpEarnedB = tpResultB?.tp_delta ?? 0;
      }
    }

    // Store combined TP earned on the sprint
    const totalTpEarned = Math.max(0, tpEarnedA) + Math.max(0, tpEarnedB);
    await supabase
      .from("sprints")
      .update({ tier_points_earned: totalTpEarned })
      .eq("id", sprint.id);

    // 8. Auto-create punishment record with calculated parameters
    const isMutualFailure = adjustedScoreA < 30 && adjustedScoreB < 30;
    const isBothWin = adjustedScoreA >= 85 && adjustedScoreB >= 85;
    const rpiAbs = Math.abs(rpi);

    let punishmentIntensity: string;
    let punishmentBudget: number;
    if (isMutualFailure) {
      punishmentIntensity = "gentle";
      punishmentBudget = 30;
    } else if (isBothWin) {
      punishmentIntensity = "moderate";
      punishmentBudget = 60;
    } else if (rpiAbs < 10) {
      punishmentIntensity = "gentle";
      punishmentBudget = 30;
    } else if (rpiAbs < 25) {
      punishmentIntensity = "moderate";
      punishmentBudget = 60;
    } else {
      punishmentIntensity = "spicy";
      punishmentBudget = 100;
    }

    // Training wheels: skip punishment for first 2 sprints
    if (trainingWheels) {
      punishmentIntensity = "none";
      punishmentBudget = 0;
    }

    // Calculate vetoes from winner's score
    const winScore = Math.max(adjustedScoreA, adjustedScoreB);
    let vetoesGranted = 1;
    if (winScore >= 85) vetoesGranted = 3;
    else if (winScore >= 70) vetoesGranted = 2;

    // Check winner tier for bonus veto
    if (winnerId) {
      const { data: tierUnlocks } = await supabase.rpc("get_tier_unlocks", {
        p_user_id: winnerId,
      });
      if (tierUnlocks?.unlocks?.bonus_veto) vetoesGranted += 1;
    }

    const loserId = winnerId
      ? winnerId === userA.user_id
        ? userB.user_id
        : userA.user_id
      : userA.user_id; // On tie, user_a plans by convention

    await supabase.from("punishments").upsert(
      {
        sprint_id: sprint.id,
        loser_id: loserId,
        winner_id: winnerId,
        intensity: punishmentIntensity,
        budget_gbp: punishmentBudget,
        vetoes_granted: vetoesGranted,
        is_mutual_failure: isMutualFailure,
        is_both_win: isBothWin,
      },
      { onConflict: "sprint_id" }
    );

    // 9. Record interactions in ledger
    if (userA?.user_id) {
      await recordInteraction(supabase, userA.user_id, "sprint_completion", "positive", "system");
    }
    if (userB?.user_id) {
      await recordInteraction(supabase, userB.user_id, "sprint_completion", "positive", "system");
    }
    if (winnerId) {
      await recordInteraction(supabase, winnerId, "achievement_highlight", "positive", "system", {
        type: "sprint_win",
      });
    }

    // 10. Mercy rule: flag for proactive Kira message if 4+ consecutive losses
    let mercyRuleTriggered = false;
    const loserId2 = winnerId
      ? winnerId === userA.user_id
        ? userB.user_id
        : userA.user_id
      : null;
    if (loserId2) {
      const { data: catchUpData } = await supabase.rpc("get_catch_up_tier", {
        p_user_id: loserId2,
      });
      if (catchUpData && catchUpData.consecutive_losses >= 4) {
        mercyRuleTriggered = true;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sprint_id: sprint.id,
        score_a: scoreA,
        score_b: scoreB,
        winner_id: winnerId,
        tp_a: tpEarnedA,
        tp_b: tpEarnedB,
        tier_points_earned: totalTpEarned,
        training_wheels: trainingWheels,
        mercy_rule: mercyRuleTriggered,
        catch_up: {
          adjusted_score_a: adjustedScoreA,
          adjusted_score_b: adjustedScoreB,
        },
        punishment: {
          intensity: punishmentIntensity,
          budget: punishmentBudget,
          vetoes_granted: vetoesGranted,
          is_mutual_failure: isMutualFailure,
          is_both_win: isBothWin,
        },
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal error", detail: String(err) }),
      { status: 500, headers: corsHeaders }
    );
  }
});
