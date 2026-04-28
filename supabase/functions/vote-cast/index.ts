// Authoritative vote casting.
// Inserts a row into votes for the current meeting round.
// - Validates user is a non-bot match player
// - Validates the latest round is in 'meeting' phase
// - Validates target (if any) is a player of the same match and is alive
// - Idempotent: unique (round_id, voter_id) — re-cast = no-op
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const { matchId, targetUserId } = body as { matchId?: string; targetUserId?: string | null };
    if (!matchId || typeof matchId !== "string") {
      return new Response(JSON.stringify({ error: "matchId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify voter is in the match (and alive)
    const { data: voter } = await admin
      .from("match_players")
      .select("id, is_alive")
      .eq("match_id", matchId)
      .eq("user_id", userId)
      .eq("is_bot", false)
      .maybeSingle();
    if (!voter) {
      return new Response(JSON.stringify({ error: "Not a match player" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!voter.is_alive) {
      return new Response(JSON.stringify({ error: "Eliminated players cannot vote" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get current round and ensure meeting phase
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
    if (round.phase !== "meeting") {
      return new Response(JSON.stringify({ error: "Not in meeting phase", phase: round.phase }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate target if provided (null/undefined = skip vote)
    let resolvedTargetId: string | null = null;
    if (targetUserId) {
      const { data: targetPlayer } = await admin
        .from("match_players")
        .select("user_id, is_alive, is_bot, bot_name")
        .eq("match_id", matchId)
        .or(`user_id.eq.${targetUserId},id.eq.${targetUserId}`)
        .maybeSingle();
      if (!targetPlayer || !targetPlayer.is_alive) {
        return new Response(JSON.stringify({ error: "Invalid vote target" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // votes.target_id is uuid — for bots (no user_id) we still allow null target;
      // bot targets are out of scope for human voters in current UI, but we accept the column.
      resolvedTargetId = targetPlayer.user_id ?? null;
    }

    // Insert vote (idempotent via unique index — ignore conflict)
    const { error: insErr } = await admin
      .from("votes")
      .insert({ round_id: round.id, voter_id: userId, target_id: resolvedTargetId });

    if (insErr && !/duplicate key|unique/i.test(insErr.message)) {
      return new Response(JSON.stringify({ error: insErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, roundId: round.id, target: resolvedTargetId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
