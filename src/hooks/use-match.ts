import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type MatchRow = {
  id: string;
  room_id: string;
  status: "in_progress" | "finished";
  current_round: number;
  winner: "agents" | "saboteur" | null;
  created_at: string;
  updated_at: string;
};

export type MatchPlayerRow = {
  id: string;
  match_id: string;
  user_id: string | null;
  is_bot: boolean;
  bot_name: string | null;
  role: "agent" | "saboteur";
  current_zone: number;
  is_alive: boolean;
};

export type RoundRow = {
  id: string;
  match_id: string;
  round_number: number;
  phase: "action" | "meeting" | "voting";
  ends_at: string | null;
  created_at: string;
};

/**
 * Subscribes to a match (and its current round + players) via Supabase Realtime.
 */
export function useMatch(matchId: string | null) {
  const [match, setMatch] = useState<MatchRow | null>(null);
  const [players, setPlayers] = useState<MatchPlayerRow[]>([]);
  const [round, setRound] = useState<RoundRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!matchId) return;
    const [{ data: m, error: mErr }, { data: mp, error: mpErr }, { data: rd, error: rdErr }] = await Promise.all([
      supabase.from("matches").select("*").eq("id", matchId).maybeSingle(),
      supabase.from("match_players").select("*").eq("match_id", matchId),
      supabase.from("rounds").select("*").eq("match_id", matchId).order("round_number", { ascending: false }).limit(1),
    ]);
    if (mErr) setError(mErr.message);
    if (mpErr) setError(mpErr.message);
    if (rdErr) setError(rdErr.message);
    if (m) setMatch(m as MatchRow);
    setPlayers((mp ?? []) as MatchPlayerRow[]);
    setRound(((rd ?? [])[0] ?? null) as RoundRow | null);
    setLoading(false);
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;
    setLoading(true);
    fetchAll();
    const channel = supabase
      .channel(`match-${matchId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "matches", filter: `id=eq.${matchId}` }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "match_players", filter: `match_id=eq.${matchId}` }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "rounds", filter: `match_id=eq.${matchId}` }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [matchId, fetchAll]);

  return { match, players, round, loading, error, refetch: fetchAll };
}

export async function startMatch(roomId: string) {
  const { data, error } = await supabase.functions.invoke("match-start", { body: { roomId } });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { matchId: string; roundId: string };
}

/** Find an active match for a given room (used when arriving at lobby that already started). */
export async function findActiveMatchForRoom(roomId: string): Promise<string | null> {
  const { data } = await supabase
    .from("matches")
    .select("id")
    .eq("room_id", roomId)
    .eq("status", "in_progress")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}
