// Server-authoritative bot AI tick.
// Any match player can poll this endpoint while the round is in 'action' phase.
// On each tick:
//   - For each alive bot, decide an action:
//       AGENT bot   → 70% move toward a zone with pending tasks; 30% complete
//                     a pending task in current zone (if any and not sabotaged).
//       SABOTEUR bot → 50% move randomly; 25% sabotage a zone other clients are
//                     near (if cooldown allows); 25% idle.
//   - Bot moves: update match_players.current_zone.
//   - Bot task completion: mark a single pending task in the bot's zone as done
//     and set completed_by = NULL (bot).
//
// Internal cadence guard: each bot acts at most once every BOT_ACTION_COOLDOWN_MS,
// stored in a small in-memory map keyed by bot id. The function is also safe to
// call concurrently from multiple clients because every mutation is conditional.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BOT_ACTION_COOLDOWN_MS = 6000; // each bot acts at most every 6s
const SABOTAGE_DURATION_SEC = 15;
const SABOTAGE_BOT_COOLDOWN_MS = 25_000;

// Per-instance memory (best-effort; multiple Deno isolates may exist but this
// is fine — actions are still idempotent thanks to conditional updates).
const lastBotAction = new Map<string, number>();
const lastBotSabotage = new Map<string, number>();

function pick<T>(arr: T[]): T | null {
  return arr.length === 0 ? null : arr[Math.floor(Math.random() * arr.length)];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const { matchId } = body as { matchId?: string };
    if (!matchId) {
      return new Response(JSON.stringify({ error: "matchId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is a real player in this match
    const { data: caller } = await admin
      .from("match_players")
      .select("id")
      .eq("match_id", matchId)
      .eq("user_id", userId)
      .eq("is_bot", false)
      .maybeSingle();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Not a match player" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch match + latest round
    const { data: match } = await admin.from("matches").select("status").eq("id", matchId).maybeSingle();
    if (!match || match.status !== "in_progress") {
      return new Response(JSON.stringify({ ok: true, skipped: "match-not-active" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: round } = await admin
      .from("rounds")
      .select("id, phase")
      .eq("match_id", matchId)
      .order("round_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!round || round.phase !== "action") {
      return new Response(JSON.stringify({ ok: true, skipped: "not-action-phase" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [{ data: players }, { data: tasks }, { data: sabotages }] = await Promise.all([
      admin.from("match_players").select("id, role, current_zone, is_alive, is_bot").eq("match_id", matchId),
      admin.from("tasks").select("id, zone, is_completed").eq("round_id", round.id),
      admin.from("sabotages").select("zone, expires_at").eq("match_id", matchId).gt("expires_at", new Date().toISOString()),
    ]);

    const allPlayers = players ?? [];
    const allTasks = tasks ?? [];
    const sabotagedZones = new Set((sabotages ?? []).map((s) => s.zone));
    const aliveBots = allPlayers.filter((p) => p.is_bot && p.is_alive);
    const humanZones = allPlayers
      .filter((p) => !p.is_bot && p.is_alive)
      .map((p) => p.current_zone);

    const pendingTasksByZone = new Map<number, string[]>();
    for (const t of allTasks) {
      if (t.is_completed) continue;
      const arr = pendingTasksByZone.get(t.zone) ?? [];
      arr.push(t.id);
      pendingTasksByZone.set(t.zone, arr);
    }
    const zonesWithPending = Array.from(pendingTasksByZone.keys()).filter((z) => !sabotagedZones.has(z));

    const now = Date.now();
    const actions: Array<{ botId: string; action: string; zone?: number; taskId?: string }> = [];

    for (const bot of aliveBots) {
      const last = lastBotAction.get(bot.id) ?? 0;
      if (now - last < BOT_ACTION_COOLDOWN_MS) continue;

      if (bot.role === "agent") {
        const r = Math.random();
        const tasksHere = pendingTasksByZone.get(bot.current_zone) ?? [];
        const canCompleteHere = tasksHere.length > 0 && !sabotagedZones.has(bot.current_zone);

        if (r < 0.30 && canCompleteHere) {
          // Complete one task here
          const taskId = tasksHere[0];
          const { data: upd } = await admin
            .from("tasks")
            .update({ is_completed: true, completed_by: null })
            .eq("id", taskId)
            .eq("is_completed", false)
            .select("id")
            .maybeSingle();
          if (upd) {
            // Remove from pending so other bots in same tick don't double up
            pendingTasksByZone.set(
              bot.current_zone,
              tasksHere.filter((id) => id !== taskId),
            );
            lastBotAction.set(bot.id, now);
            actions.push({ botId: bot.id, action: "complete-task", zone: bot.current_zone, taskId });
          }
        } else {
          // Move toward a zone with pending tasks (preferred), or random.
          const target =
            pick(zonesWithPending.filter((z) => z !== bot.current_zone)) ??
            pick([1, 2, 3, 4, 5, 6].filter((z) => z !== bot.current_zone));
          if (target) {
            await admin
              .from("match_players")
              .update({ current_zone: target })
              .eq("id", bot.id);
            lastBotAction.set(bot.id, now);
            actions.push({ botId: bot.id, action: "move", zone: target });
          }
        }
      } else {
        // Saboteur bot
        const r = Math.random();
        const sabLast = lastBotSabotage.get(bot.id) ?? 0;
        const canSabotage = now - sabLast >= SABOTAGE_BOT_COOLDOWN_MS;
        const sabotageTargets = humanZones.filter((z) => !sabotagedZones.has(z));

        if (r < 0.25 && canSabotage && sabotageTargets.length > 0) {
          const targetZone = pick(sabotageTargets)!;
          const expiresAt = new Date(now + SABOTAGE_DURATION_SEC * 1000).toISOString();
          const { data: ins } = await admin
            .from("sabotages")
            .insert({
              match_id: matchId,
              round_id: round.id,
              zone: targetZone,
              saboteur_id: null,
              expires_at: expiresAt,
            })
            .select("id")
            .maybeSingle();
          if (ins) {
            sabotagedZones.add(targetZone);
            lastBotSabotage.set(bot.id, now);
            lastBotAction.set(bot.id, now);
            actions.push({ botId: bot.id, action: "sabotage", zone: targetZone });
          }
        } else if (r < 0.75) {
          // Move randomly to blend in
          const target = pick([1, 2, 3, 4, 5, 6].filter((z) => z !== bot.current_zone));
          if (target) {
            await admin
              .from("match_players")
              .update({ current_zone: target })
              .eq("id", bot.id);
            lastBotAction.set(bot.id, now);
            actions.push({ botId: bot.id, action: "move", zone: target });
          }
        } else {
          lastBotAction.set(bot.id, now);
          actions.push({ botId: bot.id, action: "idle" });
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, acted: actions.length, actions }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
