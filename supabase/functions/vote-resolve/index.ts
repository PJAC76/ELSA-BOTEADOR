// Authoritative meeting resolution.
// Counts votes for the current meeting round, eliminates the majority target
// (if any with >=2 votes and no tie), and decides the next state:
//   - If saboteur eliminated → match.winner='agents', status='finished'
//   - Else if only 1 agent remains alive → match.winner='saboteur', status='finished'
//   - Else if this was the 3rd round → decide by tasks completion ratio
//   - Otherwise → create next round (action) + 6 tasks
//
// Idempotent: if matches.status='finished' OR a newer round than the current
// meeting round already exists, returns the current state without changes.
//
// Bots vote pseudo-randomly weighted toward the saboteur (agents) or away
// from themselves (saboteur), only at resolution time, server-authoritative.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TOTAL_ROUNDS = 3;
const TOTAL_ZONES = 6;
const ROUND_SECONDS = 180;
const AGENTS_WIN_TASK_RATIO = 0.6;

function pickWeighted<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const { matchId } = body as { matchId?: string };
    if (!matchId) {
      return new Response(JSON.stringify({ error: "matchId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is in match
    const { data: caller } = await admin
      .from("match_players")
      .select("id")
      .eq("match_id", matchId)
      .eq("user_id", userId)
      .eq("is_bot", false)
      .maybeSingle();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Not a match player" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load match
    const { data: match } = await admin.from("matches").select("*").eq("id", matchId).maybeSingle();
    if (!match) {
      return new Response(JSON.stringify({ error: "Match not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Idempotent: already finished
    if (match.status === "finished") {
      return new Response(
        JSON.stringify({ ok: true, alreadyFinished: true, winner: match.winner }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Get latest round
    const { data: round } = await admin
      .from("rounds")
      .select("*")
      .eq("match_id", matchId)
      .order("round_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!round) {
      return new Response(JSON.stringify({ error: "Round not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Idempotent: latest round is already 'action' for a higher number → resolution already happened
    if (round.phase === "action" && round.round_number > 1) {
      return new Response(
        JSON.stringify({ ok: true, alreadyAdvanced: true, currentRoundId: round.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (round.phase !== "meeting") {
      return new Response(
        JSON.stringify({ error: "Round is not in meeting phase", phase: round.phase }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Concurrency lock: atomically flip 'meeting' -> 'voting'. Only ONE caller
    // wins this update; all others get 0 rows and must back off as
    // alreadyAdvanced. This prevents two clients from both creating a next
    // round when the meeting timer expires.
    const { data: locked, error: lockErr } = await admin
      .from("rounds")
      .update({ phase: "voting" })
      .eq("id", round.id)
      .eq("phase", "meeting")
      .select()
      .maybeSingle();
    if (lockErr) {
      return new Response(JSON.stringify({ error: lockErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!locked) {
      // Another caller is resolving (or already did). Re-read latest state.
      const { data: latestRound } = await admin
        .from("rounds")
        .select("*")
        .eq("match_id", matchId)
        .order("round_number", { ascending: false })
        .limit(1)
        .maybeSingle();
      const { data: latestMatch } = await admin
        .from("matches")
        .select("status, winner")
        .eq("id", matchId)
        .maybeSingle();
      return new Response(
        JSON.stringify({
          ok: true,
          alreadyAdvanced: true,
          finished: latestMatch?.status === "finished",
          winner: latestMatch?.winner ?? null,
          nextRoundId: latestRound && latestRound.round_number > round.round_number ? latestRound.id : undefined,
          nextRoundNumber: latestRound && latestRound.round_number > round.round_number ? latestRound.round_number : undefined,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Load players
    const { data: players } = await admin
      .from("match_players")
      .select("*")
      .eq("match_id", matchId);
    const allPlayers = players ?? [];
    const alive = allPlayers.filter((p) => p.is_alive);
    const aliveSaboteur = alive.find((p) => p.role === "saboteur");
    const aliveAgents = alive.filter((p) => p.role === "agent");

    // Load human votes for this round
    const { data: humanVotes } = await admin
      .from("votes")
      .select("voter_id, target_id")
      .eq("round_id", round.id);
    const counts: Record<string, number> = {};
    for (const v of humanVotes ?? []) {
      if (v.target_id) counts[v.target_id] = (counts[v.target_id] ?? 0) + 1;
    }

    // Bot votes (server-authoritative, simulated at resolution)
    const aliveBots = alive.filter((p) => p.is_bot);
    for (const bot of aliveBots) {
      let target: typeof alive[0] | null = null;
      if (bot.role === "agent" && aliveSaboteur) {
        // 65% chance to vote saboteur, otherwise random alive non-self
        if (Math.random() < 0.65) {
          target = aliveSaboteur;
        } else {
          const others = alive.filter((p) => p.id !== bot.id);
          target = pickWeighted(others);
        }
      } else {
        // Saboteur bot deflects: random alive agent
        target = pickWeighted(aliveAgents.filter((a) => a.id !== bot.id));
      }
      // Skip 10% of the time
      if (target && Math.random() > 0.1) {
        // Use user_id if human-style (won't happen for bots) else use match_player.id
        const key = target.user_id ?? target.id;
        counts[key] = (counts[key] ?? 0) + 1;
      }
    }

    // Determine majority (>=2 and unique max)
    const entries = Object.entries(counts);
    let eliminatedKey: string | null = null;
    if (entries.length > 0) {
      const max = Math.max(...entries.map(([, c]) => c));
      const top = entries.filter(([, c]) => c === max);
      if (top.length === 1 && max >= 2) {
        eliminatedKey = top[0][0];
      }
    }

    // Map eliminatedKey (could be user_id or match_player.id for bots) → match_player row
    let eliminated: typeof alive[0] | null = null;
    if (eliminatedKey) {
      eliminated =
        alive.find((p) => p.user_id === eliminatedKey) ??
        alive.find((p) => p.id === eliminatedKey) ??
        null;
    }

    // Apply elimination
    if (eliminated) {
      await admin
        .from("match_players")
        .update({ is_alive: false })
        .eq("id", eliminated.id);
    }

    // Recompute alive after elimination
    const aliveAfter = alive.filter((p) => !eliminated || p.id !== eliminated.id);
    const saboteurAlive = aliveAfter.some((p) => p.role === "saboteur");
    const agentsAlive = aliveAfter.filter((p) => p.role === "agent").length;

    // Decide outcome
    let winner: "agents" | "saboteur" | null = null;
    let finishMatch = false;

    if (!saboteurAlive) {
      winner = "agents";
      finishMatch = true;
    } else if (agentsAlive <= 1) {
      // Saboteur reaches parity / outnumbers agents
      winner = "saboteur";
      finishMatch = true;
    } else if (round.round_number >= TOTAL_ROUNDS) {
      // Last round done — decide by tasks completion across all rounds
      const { data: allRounds } = await admin
        .from("rounds")
        .select("id")
        .eq("match_id", matchId);
      const roundIds = (allRounds ?? []).map((r) => r.id);
      let total = 0;
      let done = 0;
      if (roundIds.length > 0) {
        const { data: allTasks } = await admin
          .from("tasks")
          .select("is_completed")
          .in("round_id", roundIds);
        total = allTasks?.length ?? 0;
        done = (allTasks ?? []).filter((t) => t.is_completed).length;
      }
      const ratio = total > 0 ? done / total : 0;
      winner = ratio >= AGENTS_WIN_TASK_RATIO ? "agents" : "saboteur";
      finishMatch = true;
    }

    if (finishMatch) {
      await admin
        .from("matches")
        .update({ status: "finished", winner })
        .eq("id", matchId);

      // Persist authoritative per-player results (humans only). Idempotent:
      // if a row already exists for (user_id, match_id) we skip insert.
      try {
        const { data: allRoundsForXp } = await admin
          .from("rounds")
          .select("id")
          .eq("match_id", matchId);
        const roundIds = (allRoundsForXp ?? []).map((r) => r.id);
        let allTasks: { is_completed: boolean; completed_by: string | null }[] = [];
        if (roundIds.length > 0) {
          const { data } = await admin
            .from("tasks")
            .select("is_completed, completed_by")
            .in("round_id", roundIds);
          allTasks = data ?? [];
        }

        const humans = allPlayers.filter((p) => !p.is_bot && p.user_id);
        const userIds = humans.map((p) => p.user_id as string);
        const existing = userIds.length
          ? (await admin
              .from("game_results")
              .select("user_id")
              .eq("match_id", matchId)
              .in("user_id", userIds)).data ?? []
          : [];
        const existingSet = new Set(existing.map((r) => r.user_id));

        const xpFor = (role: string, won: boolean, tasksDone: number) => {
          let xp = 25; // participation
          if (won) xp += role === "saboteur" ? 90 : 60;
          xp += tasksDone * 10;
          return xp;
        };

        const inserts: Array<Record<string, unknown>> = [];
        for (const p of humans) {
          if (existingSet.has(p.user_id as string)) continue;
          const won =
            (winner === "agents" && p.role === "agent") ||
            (winner === "saboteur" && p.role === "saboteur");
          const tasksDone = allTasks.filter((t) => t.is_completed && t.completed_by === p.user_id).length;
          inserts.push({
            user_id: p.user_id,
            match_id: matchId,
            role: p.role,
            won,
            tasks_completed: tasksDone,
            guessed_word: false,
            xp_earned: xpFor(p.role, won, tasksDone),
          });
        }
        if (inserts.length > 0) {
          await admin.from("game_results").insert(inserts);
        }
      } catch (e) {
        console.warn("[vote-resolve] game_results persist failed", e);
      }

      return new Response(
        JSON.stringify({
          ok: true,
          finished: true,
          winner,
          eliminated: eliminated
            ? { id: eliminated.id, userId: eliminated.user_id, role: eliminated.role, isBot: eliminated.is_bot }
            : null,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Otherwise: create next action round + tasks
    const nextNumber = round.round_number + 1;
    const endsAt = new Date(Date.now() + ROUND_SECONDS * 1000).toISOString();
    const { data: newRound, error: nrErr } = await admin
      .from("rounds")
      .insert({
        match_id: matchId,
        round_number: nextNumber,
        phase: "action",
        ends_at: endsAt,
      })
      .select()
      .single();
    if (nrErr || !newRound) {
      return new Response(JSON.stringify({ error: nrErr?.message ?? "Could not create round" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const taskRows = Array.from({ length: TOTAL_ZONES }, (_, i) => ({
      round_id: newRound.id,
      zone: i + 1,
      task_type: "connections",
      is_completed: false,
    }));
    await admin.from("tasks").insert(taskRows);

    await admin
      .from("matches")
      .update({ current_round: nextNumber })
      .eq("id", matchId);

    return new Response(
      JSON.stringify({
        ok: true,
        finished: false,
        nextRoundId: newRound.id,
        nextRoundNumber: nextNumber,
        eliminated: eliminated
          ? { id: eliminated.id, userId: eliminated.user_id, role: eliminated.role, isBot: eliminated.is_bot }
          : null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
