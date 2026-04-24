import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COOLDOWN_SECONDS = 30;
const SABOTAGE_DURATION_SECONDS = 15;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: cErr } = await supabase.auth.getClaims(token);
    if (cErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claims.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const { matchId, zone } = body as { matchId?: string; zone?: number };
    if (!matchId || typeof zone !== "number") {
      return new Response(JSON.stringify({ error: "matchId and zone required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Player must be saboteur in this match, alive
    const { data: mp } = await admin
      .from("match_players")
      .select("id, role, is_alive")
      .eq("match_id", matchId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!mp) return new Response(JSON.stringify({ error: "Not in match" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!mp.is_alive) return new Response(JSON.stringify({ error: "Eliminated" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (mp.role !== "saboteur") return new Response(JSON.stringify({ error: "Only saboteur" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Get current round
    const { data: rounds } = await admin
      .from("rounds")
      .select("id")
      .eq("match_id", matchId)
      .order("round_number", { ascending: false })
      .limit(1);
    const round = rounds?.[0];
    if (!round) return new Response(JSON.stringify({ error: "No active round" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Cooldown: last sabotage by this saboteur in match within COOLDOWN_SECONDS
    const cooldownStart = new Date(Date.now() - COOLDOWN_SECONDS * 1000).toISOString();
    const { data: recent } = await admin
      .from("sabotages")
      .select("created_at")
      .eq("match_id", matchId)
      .eq("saboteur_id", userId)
      .gt("created_at", cooldownStart)
      .order("created_at", { ascending: false })
      .limit(1);
    if (recent && recent.length > 0) {
      const last = new Date(recent[0].created_at).getTime();
      const remaining = COOLDOWN_SECONDS - Math.floor((Date.now() - last) / 1000);
      return new Response(JSON.stringify({ error: "Cooldown", cooldownRemaining: remaining }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Zone not already sabotaged (active)
    const { data: existing } = await admin
      .from("sabotages")
      .select("id")
      .eq("match_id", matchId)
      .eq("zone", zone)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ error: "Zone already sabotaged" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const expiresAt = new Date(Date.now() + SABOTAGE_DURATION_SECONDS * 1000).toISOString();
    const { error: insErr } = await admin.from("sabotages").insert({
      match_id: matchId,
      round_id: round.id,
      zone,
      saboteur_id: userId,
      expires_at: expiresAt,
    });
    if (insErr) {
      return new Response(JSON.stringify({ error: insErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true, expiresAt }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
