import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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

    // 4. Determine winner (exact tie = NULL)
    let winnerId: string | null = null;
    if (scoreA > scoreB) {
      winnerId = userA.user_id;
    } else if (scoreB > scoreA) {
      winnerId = userB.user_id;
    }

    // 5. Update sprint with final scores + RPI
    const rpi = scoreA - scoreB;
    await supabase
      .from("sprints")
      .update({
        status: "completed",
        score_a: scoreA,
        score_b: scoreB,
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
      const { data: tpResultA } = await supabase.rpc("update_tier_points", {
        p_user_id: userA.user_id,
        p_score: scoreA,
      });
      tpEarnedA = tpResultA?.tp_delta ?? 0;
    }

    if (userB?.user_id) {
      const { data: tpResultB } = await supabase.rpc("update_tier_points", {
        p_user_id: userB.user_id,
        p_score: scoreB,
      });
      tpEarnedB = tpResultB?.tp_delta ?? 0;
    }

    // Store combined TP earned on the sprint
    const totalTpEarned = Math.max(0, tpEarnedA) + Math.max(0, tpEarnedB);
    await supabase
      .from("sprints")
      .update({ tier_points_earned: totalTpEarned })
      .eq("id", sprint.id);

    // 8. Auto-create punishment record with calculated parameters
    const isMutualFailure = scoreA < 30 && scoreB < 30;
    const isBothWin = scoreA >= 85 && scoreB >= 85;
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

    // Calculate vetoes from winner's score
    const winScore = Math.max(scoreA, scoreB);
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
