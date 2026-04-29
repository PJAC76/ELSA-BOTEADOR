import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PlayerRole } from "@/types/game";
import type { GameStats } from "@/components/game/GameScreen";

export function useGameResults(userId: string | undefined) {
  const saveGameResult = useCallback(
    async (params: {
      matchId?: string;
      role: PlayerRole;
      won: boolean;
      xpEarned: number;
      tasksCompleted: number;
      guessedWord: boolean;
    }) => {
      if (!userId) {
        console.warn("[useGameResults] saveGameResult skipped: no userId");
        return;
      }

      // 1. Insert game result (idempotent: if server already wrote it for this
      // match, skip the insert and trust the authoritative row).
      let alreadyExisted = false;
      if (params.matchId) {
        const { data: existing } = await supabase
          .from("game_results")
          .select("id, xp_earned")
          .eq("user_id", userId)
          .eq("match_id", params.matchId)
          .maybeSingle();
        if (existing) {
          alreadyExisted = true;
          console.log("[useGameResults] server-authoritative result exists, skipping insert");
        }
      }

      if (!alreadyExisted) {
        const { error: insertError } = await supabase.from("game_results").insert({
          user_id: userId,
          match_id: params.matchId ?? null,
          role: params.role,
          won: params.won,
          xp_earned: params.xpEarned,
          tasks_completed: params.tasksCompleted,
          guessed_word: params.guessedWord,
        });
        if (insertError) {
          console.error("[useGameResults] insert error:", insertError);
          return;
        }
        console.log("[useGameResults] game result saved", params);
      }

      // If the server already saved an authoritative row, the profile XP sync
      // should NOT double-count. Skip it.
      if (alreadyExisted) return;

      // 2. Sync XP to profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("xp, level")
        .eq("user_id", userId)
        .maybeSingle();

      if (profile) {
        const newXp = profile.xp + params.xpEarned;
        // Simple level calc matching progression-store logic
        const XP_PER_LEVEL = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];
        let newLevel = 1;
        for (let i = 1; i < XP_PER_LEVEL.length; i++) {
          if (newXp >= XP_PER_LEVEL[i]) newLevel = i + 1;
          else break;
        }

        await supabase
          .from("profiles")
          .update({ xp: newXp, level: newLevel })
          .eq("user_id", userId);
      }
    },
    [userId]
  );

  const fetchHistory = useCallback(async (limit = 20) => {
    if (!userId) return [];
    const { data } = await supabase
      .from("game_results")
      .select("id, role, won, xp_earned, tasks_completed, guessed_word, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  }, [userId]);

  const fetchStats = useCallback(async () => {
    if (!userId) return null;

    const { data } = await supabase
      .from("game_results")
      .select("won, xp_earned, tasks_completed, guessed_word")
      .eq("user_id", userId);

    if (!data || data.length === 0) return null;

    return {
      gamesPlayed: data.length,
      gamesWon: data.filter((r) => r.won).length,
      totalXpEarned: data.reduce((sum, r) => sum + r.xp_earned, 0),
      totalTasks: data.reduce((sum, r) => sum + r.tasks_completed, 0),
      wordsGuessed: data.filter((r) => r.guessed_word).length,
    };
  }, [userId]);

  return { saveGameResult, fetchStats, fetchHistory };
}
