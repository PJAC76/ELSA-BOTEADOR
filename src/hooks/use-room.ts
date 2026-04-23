import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type RoomPlayerRow = {
  id: string;
  room_id: string;
  user_id: string;
  is_ready: boolean;
  joined_at: string;
};

export type RoomRow = {
  id: string;
  code: string;
  host_id: string;
  language: string;
  mode: "quick" | "friends";
  status: "waiting" | "playing" | "finished";
  max_players: number;
};

export type ProfileLite = {
  user_id: string;
  display_name: string;
  avatar_config: any;
};

export type RoomPlayerWithProfile = RoomPlayerRow & { profile: ProfileLite | null };

/**
 * Subscribes to a room and its players via Supabase Realtime.
 * Returns latest room, player list (with profiles), and helpers.
 */
export function useRoom(roomId: string | null, currentUserId: string | undefined) {
  const [room, setRoom] = useState<RoomRow | null>(null);
  const [players, setPlayers] = useState<RoomPlayerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!roomId) return;
    const [{ data: roomData, error: roomErr }, { data: playerData, error: playerErr }] = await Promise.all([
      supabase.from("rooms").select("*").eq("id", roomId).maybeSingle(),
      supabase.from("room_players").select("*").eq("room_id", roomId).order("joined_at", { ascending: true }),
    ]);
    if (roomErr) setError(roomErr.message);
    if (playerErr) setError(playerErr.message);
    if (roomData) setRoom(roomData as RoomRow);

    const playerRows = (playerData ?? []) as RoomPlayerRow[];
    if (playerRows.length === 0) {
      setPlayers([]);
    } else {
      const userIds = playerRows.map((p) => p.user_id);
      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_config")
        .in("user_id", userIds);
      const profiles = (profileData ?? []) as ProfileLite[];
      setPlayers(
        playerRows.map((p) => ({
          ...p,
          profile: profiles.find((pr) => pr.user_id === p.user_id) ?? null,
        }))
      );
    }
    setLoading(false);
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    fetchAll();

    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${roomId}` },
        () => { fetchAll(); }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        () => { fetchAll(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, fetchAll]);

  const setReady = useCallback(
    async (ready: boolean) => {
      if (!roomId || !currentUserId) return;
      await supabase
        .from("room_players")
        .update({ is_ready: ready })
        .eq("room_id", roomId)
        .eq("user_id", currentUserId);
    },
    [roomId, currentUserId]
  );

  return { room, players, loading, error, refetch: fetchAll, setReady };
}

export async function createRoom(opts: { language?: "es" | "en"; mode?: "quick" | "friends"; maxPlayers?: number } = {}) {
  const { data, error } = await supabase.functions.invoke("room-create", { body: opts });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.room as RoomRow;
}

export async function joinRoom(code: string) {
  const { data, error } = await supabase.functions.invoke("room-join", { body: { code } });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.room as RoomRow;
}

export async function leaveRoom(roomId: string) {
  const { data, error } = await supabase.functions.invoke("room-leave", { body: { roomId } });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return true;
}
