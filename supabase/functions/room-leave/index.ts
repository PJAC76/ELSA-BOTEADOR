// Edge function: leave a room. If the leaver is the host, transfer host to oldest remaining player or close the room.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimData, error: claimError } = await userClient.auth.getClaims(token);
    if (claimError || !claimData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimData.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const roomId = String(body.roomId ?? "");
    if (!roomId) {
      return new Response(JSON.stringify({ error: "roomId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    await admin.from("room_players").delete().eq("room_id", roomId).eq("user_id", userId);

    const { data: room } = await admin.from("rooms").select("*").eq("id", roomId).maybeSingle();
    if (room && room.host_id === userId) {
      const { data: remaining } = await admin
        .from("room_players")
        .select("user_id, joined_at")
        .eq("room_id", roomId)
        .order("joined_at", { ascending: true })
        .limit(1);
      if (remaining && remaining.length > 0) {
        await admin.from("rooms").update({ host_id: remaining[0].user_id }).eq("id", roomId);
      } else {
        await admin.from("rooms").update({ status: "finished" }).eq("id", roomId);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
