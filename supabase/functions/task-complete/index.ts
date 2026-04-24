import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const { taskId, matchId } = body as { taskId?: string; matchId?: string };
    if (!taskId || !matchId) {
      return new Response(JSON.stringify({ error: "taskId and matchId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify player belongs to match and is alive + agent
    const { data: mp } = await admin
      .from("match_players")
      .select("id, role, is_alive, current_zone")
      .eq("match_id", matchId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!mp) return new Response(JSON.stringify({ error: "Not in match" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!mp.is_alive) return new Response(JSON.stringify({ error: "Eliminated" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (mp.role !== "agent") return new Response(JSON.stringify({ error: "Only agents complete tasks" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Verify task exists, not completed, in player zone, no active sabotage
    const { data: task } = await admin
      .from("tasks")
      .select("id, zone, is_completed, round_id")
      .eq("id", taskId)
      .maybeSingle();

    if (!task) return new Response(JSON.stringify({ error: "Task not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (task.is_completed) return new Response(JSON.stringify({ error: "Already completed" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (task.zone !== mp.current_zone) return new Response(JSON.stringify({ error: "Wrong zone" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Check active sabotage
    const { data: sab } = await admin
      .from("sabotages")
      .select("id")
      .eq("match_id", matchId)
      .eq("zone", task.zone)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (sab) return new Response(JSON.stringify({ error: "Zone sabotaged" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { error: upErr } = await admin
      .from("tasks")
      .update({ is_completed: true, completed_by: userId })
      .eq("id", taskId)
      .eq("is_completed", false);

    if (upErr) {
      return new Response(JSON.stringify({ error: upErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
