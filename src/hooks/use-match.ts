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

export type TaskRow = {
  id: string;
  round_id: string;
  zone: number;
  task_type: string;
  is_completed: boolean;
  completed_by: string | null;
  assigned_to: string | null;
};

export type SabotageRow = {
  id: string;
  match_id: string;
  round_id: string;
  zone: number;
  saboteur_id: string | null;
  expires_at: string;
  created_at: string;
};

/**
 * Subscribes to a match (and its current round + players) via Supabase Realtime.
 */
export function useMatch(matchId: string | null) {
  const [match, setMatch] = useState<MatchRow | null>(null);
  const [players, setPlayers] = useState<MatchPlayerRow[]>([]);
  const [round, setRound] = useState<RoundRow | null>(null);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [sabotages, setSabotages] = useState<SabotageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!matchId) return;
    const [
      { data: m, error: mErr },
      { data: mp, error: mpErr },
      { data: rd, error: rdErr },
      { data: sb, error: sbErr },
    ] = await Promise.all([
      supabase.from("matches").select("*").eq("id", matchId).maybeSingle(),
      supabase.from("match_players").select("*").eq("match_id", matchId),
      supabase.from("rounds").select("*").eq("match_id", matchId).order("round_number", { ascending: false }).limit(1),
      supabase.from("sabotages").select("*").eq("match_id", matchId).gt("expires_at", new Date().toISOString()),
    ]);
    if (mErr) setError(mErr.message);
    if (mpErr) setError(mpErr.message);
    if (rdErr) setError(rdErr.message);
    if (sbErr) setError(sbErr.message);
    if (m) setMatch(m as MatchRow);
    setPlayers((mp ?? []) as MatchPlayerRow[]);
    const currentRound = ((rd ?? [])[0] ?? null) as RoundRow | null;
    setRound(currentRound);
    setSabotages((sb ?? []) as SabotageRow[]);
    if (currentRound) {
      const { data: t } = await supabase.from("tasks").select("*").eq("round_id", currentRound.id);
      setTasks((t ?? []) as TaskRow[]);
    } else {
      setTasks([]);
    }
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
      .on("postgres_changes", { event: "*", schema: "public", table: "sabotages", filter: `match_id=eq.${matchId}` }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "votes" }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [matchId, fetchAll]);

  return { match, players, round, tasks, sabotages, loading, error, refetch: fetchAll };
}

export async function startMatch(roomId: string) {
  const { data, error } = await supabase.functions.invoke("match-start", { body: { roomId } });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { matchId: string; roundId: string };
}

export async function moveToZone(matchId: string, zone: number) {
  const { data, error } = await supabase.functions.invoke("move-zone", { body: { matchId, zone } });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function completeTask(matchId: string, taskId: string) {
  const { data, error } = await supabase.functions.invoke("task-complete", { body: { matchId, taskId } });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function sabotageZone(matchId: string, zone: number) {
  const { data, error } = await supabase.functions.invoke("sabotage-zone", { body: { matchId, zone } });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { ok: boolean; expiresAt: string };
}

export async function botsTick(matchId: string) {
  const { data, error } = await supabase.functions.invoke("bots-tick", { body: { matchId } });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { ok: boolean; acted: number };
}

export async function advanceRoundPhase(matchId: string, targetPhase: "meeting" = "meeting", opts?: { emergency?: boolean }) {
  const { data, error } = await supabase.functions.invoke("round-advance-phase", { body: { matchId, targetPhase, emergency: opts?.emergency === true } });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { ok: boolean; phase: string; endsAt?: string; alreadyAdvanced?: boolean };
}

export async function castVote(matchId: string, targetUserId: string | null) {
  const { data, error } = await supabase.functions.invoke("vote-cast", {
    body: { matchId, targetUserId },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { ok: boolean; roundId: string; target: string | null };
}

export type VoteResolveResult = {
  ok: boolean;
  finished: boolean;
  alreadyFinished?: boolean;
  alreadyAdvanced?: boolean;
  winner?: "agents" | "saboteur" | null;
  nextRoundId?: string;
  nextRoundNumber?: number;
  eliminated?: { id: string; userId: string | null; role: "agent" | "saboteur"; isBot: boolean } | null;
};

export async function resolveMeeting(matchId: string) {
  const { data, error } = await supabase.functions.invoke("vote-resolve", {
    body: { matchId },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as VoteResolveResult;
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
