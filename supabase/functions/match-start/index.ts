// Edge function: start a match from a waiting room
// - Only the host can call it
// - Requires room.status = 'waiting' and at least 2 human players
// - Fills with bots up to 6 players total
// - Randomly assigns 1 saboteur, the rest agents
// - Creates match, round 1 (action phase, 180s), and one task per zone

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const TARGET_PLAYERS = 6;
const TOTAL_ZONES = 6;
const ROUND_SECONDS = 180;
const BOT_NAMES = ["Luna", "Mia", "Zoe", "Ava", "Iris", "Nina", "Vera", "Cleo", "Lia", "Sky"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
    const roomId: string = String(body.roomId ?? "");
    if (!roomId) {
      return new Response(JSON.stringify({ error: "roomId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Load room
    const { data: room, error: roomErr } = await admin
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .maybeSingle();
    if (roomErr || !room) {
      return new Response(JSON.stringify({ error: "Room not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (room.host_id !== userId) {
      return new Response(JSON.stringify({ error: "Only host can start" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (room.status !== "waiting") {
      return new Response(JSON.stringify({ error: "Room is not in waiting state" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check existing match for this room
    const { data: existingMatch } = await admin
      .from("matches")
      .select("id")
      .eq("room_id", roomId)
      .eq("status", "in_progress")
      .maybeSingle();
    if (existingMatch) {
      return new Response(JSON.stringify({ error: "Match already in progress", matchId: existingMatch.id }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load human players
    const { data: humans, error: humansErr } = await admin
      .from("room_players")
      .select("user_id")
      .eq("room_id", roomId)
      .order("joined_at", { ascending: true });
    if (humansErr) throw humansErr;
    const humanIds = (humans ?? []).map((h) => h.user_id as string);
    if (humanIds.length < 2) {
      return new Response(JSON.stringify({ error: "Need at least 2 players to start" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build participant list (humans + bots up to TARGET_PLAYERS)
    const botCount = Math.max(0, TARGET_PLAYERS - humanIds.length);
    const shuffledBotNames = shuffle(BOT_NAMES).slice(0, botCount);
    type Participant = { user_id: string | null; is_bot: boolean; bot_name: string | null };
    const participants: Participant[] = [
      ...humanIds.map((id) => ({ user_id: id, is_bot: false, bot_name: null })),
      ...shuffledBotNames.map((name) => ({ user_id: null, is_bot: true, bot_name: name })),
    ];

    // Assign roles: 1 saboteur, rest agents
    const indices = shuffle(participants.map((_, i) => i));
    const saboteurIndex = indices[0];

    // Create match
    const { data: match, error: matchErr } = await admin
      .from("matches")
      .insert({ room_id: roomId, status: "in_progress", current_round: 1 })
      .select()
      .single();
    if (matchErr || !match) throw matchErr ?? new Error("Match insert failed");

    // Insert match_players
    const matchPlayersRows = participants.map((p, i) => ({
      match_id: match.id,
      user_id: p.user_id,
      is_bot: p.is_bot,
      bot_name: p.bot_name,
      role: i === saboteurIndex ? "saboteur" : "agent",
      current_zone: 1 + Math.floor(Math.random() * TOTAL_ZONES),
      is_alive: true,
    }));
    const { error: mpErr } = await admin.from("match_players").insert(matchPlayersRows);
    if (mpErr) throw mpErr;

    // Create round 1
    const endsAt = new Date(Date.now() + ROUND_SECONDS * 1000).toISOString();
    const { data: round, error: roundErr } = await admin
      .from("rounds")
      .insert({ match_id: match.id, round_number: 1, phase: "action", ends_at: endsAt })
      .select()
      .single();
    if (roundErr || !round) throw roundErr ?? new Error("Round insert failed");

    // Create one task per zone
    const taskRows = Array.from({ length: TOTAL_ZONES }, (_, i) => ({
      round_id: round.id,
      zone: i + 1,
      task_type: "connections",
      is_completed: false,
    }));
    const { error: tasksErr } = await admin.from("tasks").insert(taskRows);
    if (tasksErr) throw tasksErr;

    // Flip room to playing
    const { error: roomUpdErr } = await admin
      .from("rooms")
      .update({ status: "playing" })
      .eq("id", roomId);
    if (roomUpdErr) throw roomUpdErr;

    return new Response(JSON.stringify({ matchId: match.id, roundId: round.id }), {
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
