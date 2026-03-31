import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BffMember = {
  id: string;
  name: string;
  emoji: string;
};

export type SquadStats = {
  gamesPlayedTogether: number;
  winsTogetherAgent: number;
  winsTogetherSaboteur: number;
  sharedStreak: number;
  sharedStreakRecord: number;
  lastPlayedTogether: string | null; // ISO date
  wordsGuessedTogether: number;
};

export type SquadReward = {
  id: string;
  emoji: string;
  nameKey: string;
  descKey: string;
  requirement: number; // games together needed
  type: "badge" | "title" | "effect";
};

export const SQUAD_REWARDS: SquadReward[] = [
  { id: "sr-first", emoji: "👯", nameKey: "bffRewardFirst", descKey: "bffRewardFirstDesc", requirement: 1, type: "badge" },
  { id: "sr-5games", emoji: "🤝", nameKey: "bffReward5", descKey: "bffReward5Desc", requirement: 5, type: "badge" },
  { id: "sr-10games", emoji: "💕", nameKey: "bffReward10", descKey: "bffReward10Desc", requirement: 10, type: "title" },
  { id: "sr-25games", emoji: "🔥", nameKey: "bffReward25", descKey: "bffReward25Desc", requirement: 25, type: "badge" },
  { id: "sr-50games", emoji: "💎", nameKey: "bffReward50", descKey: "bffReward50Desc", requirement: 50, type: "effect" },
  { id: "sr-streak5", emoji: "⚡", nameKey: "bffRewardStreak5", descKey: "bffRewardStreak5Desc", requirement: 5, type: "badge" },
  { id: "sr-streak10", emoji: "🌟", nameKey: "bffRewardStreak10", descKey: "bffRewardStreak10Desc", requirement: 10, type: "title" },
];

type BffState = {
  squadMembers: BffMember[];
  squadName: string;
  stats: SquadStats;
  unlockedRewards: string[];
  addMember: (member: BffMember) => void;
  removeMember: (id: string) => void;
  setSquadName: (name: string) => void;
  recordSquadGame: (won: boolean, role: "agent" | "saboteur") => void;
  recordWordGuess: () => void;
  getUnlockedRewards: () => SquadReward[];
};

const isToday = (dateStr: string | null) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

const isYesterday = (dateStr: string | null) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.getFullYear() === yesterday.getFullYear() && d.getMonth() === yesterday.getMonth() && d.getDate() === yesterday.getDate();
};

export const useBffStore = create<BffState>()(
  persist(
    (set, get) => ({
      squadMembers: [],
      squadName: "Mi Squad 💜",
      stats: {
        gamesPlayedTogether: 0,
        winsTogetherAgent: 0,
        winsTogetherSaboteur: 0,
        sharedStreak: 0,
        sharedStreakRecord: 0,
        lastPlayedTogether: null,
        wordsGuessedTogether: 0,
      },
      unlockedRewards: [],

      addMember: (member) => {
        const { squadMembers } = get();
        if (squadMembers.length >= 4) return; // Max 4 BFFs
        if (squadMembers.find((m) => m.id === member.id)) return;
        set({ squadMembers: [...squadMembers, member] });
      },

      removeMember: (id) => {
        set({ squadMembers: get().squadMembers.filter((m) => m.id !== id) });
      },

      setSquadName: (name) => set({ squadName: name }),

      recordSquadGame: (won, role) => {
        const { stats } = get();
        const now = new Date().toISOString().split("T")[0];
        let newStreak = stats.sharedStreak;

        if (isToday(stats.lastPlayedTogether)) {
          // Already played today, don't increment streak
        } else if (isYesterday(stats.lastPlayedTogether) || !stats.lastPlayedTogether) {
          newStreak = stats.sharedStreak + 1;
        } else {
          newStreak = 1; // Streak broken
        }

        const newRecord = Math.max(newStreak, stats.sharedStreakRecord);

        const newStats: SquadStats = {
          gamesPlayedTogether: stats.gamesPlayedTogether + 1,
          winsTogetherAgent: stats.winsTogetherAgent + (won && role === "agent" ? 1 : 0),
          winsTogetherSaboteur: stats.winsTogetherSaboteur + (won && role === "saboteur" ? 1 : 0),
          sharedStreak: newStreak,
          sharedStreakRecord: newRecord,
          lastPlayedTogether: now,
          wordsGuessedTogether: stats.wordsGuessedTogether,
        };

        // Check for newly unlocked rewards
        const gameRewards = SQUAD_REWARDS.filter(
          (r) => r.type !== "badge" || r.id !== "sr-streak5"
        );
        const newUnlocked = [...get().unlockedRewards];
        for (const reward of SQUAD_REWARDS) {
          if (newUnlocked.includes(reward.id)) continue;
          if (reward.id.startsWith("sr-streak")) {
            if (newStreak >= reward.requirement) newUnlocked.push(reward.id);
          } else {
            if (newStats.gamesPlayedTogether >= reward.requirement) newUnlocked.push(reward.id);
          }
        }

        set({ stats: newStats, unlockedRewards: newUnlocked });
      },

      recordWordGuess: () => {
        set({
          stats: { ...get().stats, wordsGuessedTogether: get().stats.wordsGuessedTogether + 1 },
        });
      },

      getUnlockedRewards: () => {
        const { stats, unlockedRewards } = get();
        return SQUAD_REWARDS.filter((r) => unlockedRewards.includes(r.id));
      },
    }),
    { name: "bff-store" }
  )
);
