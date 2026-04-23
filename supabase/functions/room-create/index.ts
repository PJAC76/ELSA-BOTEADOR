// Edge function: create a multiplayer room
// - Validates auth
// - Generates a unique 6-char code
// - Creates room + adds host as first player
// Avoids relying on broken RLS by using service role for the controlled inserts.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

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
    const language = (body.language === "en" ? "en" : "es") as "es" | "en";
    const mode = (body.mode === "quick" ? "quick" : "friends") as "quick" | "friends";
    const maxPlayers = Math.min(Math.max(Number(body.maxPlayers) || 6, 3), 8);

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Try a few times to avoid code collision
    let room: any = null;
    let lastError: any = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateCode();
      const { data, error } = await admin
        .from("rooms")
        .insert({ host_id: userId, code, language, mode, max_players: maxPlayers, status: "waiting" })
        .select()
        .single();
      if (!error) { room = data; break; }
      lastError = error;
      if (!String(error.message).toLowerCase().includes("duplicate")) break;
    }

    if (!room) {
      return new Response(JSON.stringify({ error: "Could not create room", details: lastError?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: joinError } = await admin
      .from("room_players")
      .insert({ room_id: room.id, user_id: userId, is_ready: false });
    if (joinError) {
      return new Response(JSON.stringify({ error: "Could not add host", details: joinError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ room }), {
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
