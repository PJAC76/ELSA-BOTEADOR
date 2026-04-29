// Authoritative round phase advancement.
// Validates that the calling user is a match player and that the current
// round's ends_at has passed before transitioning action -> meeting.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MEETING_DURATION_SEC = 60;

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
    const { matchId, targetPhase, emergency } = body as { matchId?: string; targetPhase?: string; emergency?: boolean };
    if (!matchId || typeof matchId !== "string") {
      return new Response(JSON.stringify({ error: "matchId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const desired = targetPhase === "meeting" ? "meeting" : "meeting"; // only support meeting for now
    const isEmergency = emergency === true;

    // Verify user is in the match
    const { data: mp } = await admin
      .from("match_players")
      .select("id")
      .eq("match_id", matchId)
      .eq("user_id", userId)
      .eq("is_bot", false)
      .maybeSingle();
    if (!mp) {
      return new Response(JSON.stringify({ error: "Not a match player" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get current round
    const { data: round, error: rErr } = await admin
      .from("rounds")
      .select("*")
      .eq("match_id", matchId)
      .order("round_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (rErr || !round) {
      return new Response(JSON.stringify({ error: "Round not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Idempotent: already in meeting
    if (round.phase === desired) {
      return new Response(JSON.stringify({ ok: true, phase: round.phase, alreadyAdvanced: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (round.phase !== "action") {
      return new Response(JSON.stringify({ error: "Round not in action phase", phase: round.phase }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate the timer has actually expired (small grace of 500ms for clock skew)
    const endsAt = round.ends_at ? new Date(round.ends_at).getTime() : null;
    const now = Date.now();
    if (!endsAt || endsAt - now > 500) {
      return new Response(
        JSON.stringify({
          error: "Timer not expired",
          remainingMs: endsAt ? endsAt - now : null,
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const meetingEnds = new Date(now + MEETING_DURATION_SEC * 1000).toISOString();

    // Conditional update: only flip if still in action (prevents race)
    const { data: updated, error: uErr } = await admin
      .from("rounds")
      .update({ phase: desired, ends_at: meetingEnds })
      .eq("id", round.id)
      .eq("phase", "action")
      .select()
      .maybeSingle();

    if (uErr) {
      return new Response(JSON.stringify({ error: uErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ ok: true, phase: updated?.phase ?? desired, endsAt: meetingEnds }),
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
