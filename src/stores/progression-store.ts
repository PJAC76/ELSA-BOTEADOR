import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * XP thresholds per level.
 * Level 1 → 0 XP, Level 2 → 100 XP, Level 3 → 250 XP, etc.
 * Each level requires progressively more XP.
 */
const XP_PER_LEVEL = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];

export function getMaxLevel() {
  return XP_PER_LEVEL.length;
}

export function getLevelForXp(totalXp: number): number {
  let level = 1;
  for (let i = 1; i < XP_PER_LEVEL.length; i++) {
    if (totalXp >= XP_PER_LEVEL[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}

export function getXpForCurrentLevel(totalXp: number): {
  current: number;
  required: number;
  progress: number;
} {
  const level = getLevelForXp(totalXp);
  const currentThreshold = XP_PER_LEVEL[level - 1] ?? 0;
  const nextThreshold = XP_PER_LEVEL[level] ?? XP_PER_LEVEL[XP_PER_LEVEL.length - 1];

  const current = totalXp - currentThreshold;
  const required = nextThreshold - currentThreshold;
  const progress = required > 0 ? Math.min((current / required) * 100, 100) : 100;

  return { current, required, progress };
}

/** XP rewards */
export const XP_REWARDS = {
  WIN: 50,
  LOSS: 15,
  TASK_BONUS: 5, // per task completed (future use)
} as const;

type ProgressionStore = {
  totalXp: number;
  gamesPlayed: number;
  gamesWon: number;
  addXp: (amount: number) => void;
  recordGame: (won: boolean) => void;
};

export const useProgressionStore = create<ProgressionStore>()(
  persist(
    (set) => ({
      totalXp: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      addXp: (amount) =>
        set((state) => ({ totalXp: state.totalXp + amount })),
      recordGame: (won) =>
        set((state) => ({
          gamesPlayed: state.gamesPlayed + 1,
          gamesWon: state.gamesWon + (won ? 1 : 0),
          totalXp: state.totalXp + (won ? XP_REWARDS.WIN : XP_REWARDS.LOSS),
        })),
    }),
    { name: "elsa-boteador-progression" }
  )
);
