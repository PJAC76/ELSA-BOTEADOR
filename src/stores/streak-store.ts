import { create } from "zustand";
import { persist } from "zustand/middleware";

/** XP bonus per streak day milestone */
export const STREAK_REWARDS: Record<number, number> = {
  1: 5,
  2: 10,
  3: 20,
  5: 40,
  7: 75,
  14: 120,
  30: 200,
};

/** Get XP reward for a given streak day (0 if not a milestone) */
export function getStreakReward(day: number): number {
  return STREAK_REWARDS[day] ?? 0;
}

/** Get the next milestone day from the current streak */
export function getNextMilestone(currentStreak: number): number {
  const milestones = Object.keys(STREAK_REWARDS).map(Number).sort((a, b) => a - b);
  return milestones.find((m) => m > currentStreak) ?? milestones[milestones.length - 1];
}

function getDateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function daysBetween(dateKeyA: string, dateKeyB: string): number {
  const a = new Date(dateKeyA + "T00:00:00");
  const b = new Date(dateKeyB + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

type StreakStore = {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string; // "YYYY-MM-DD"
  playedToday: boolean;
  /** Call when a game ends. Returns the XP bonus earned (0 if already played today or no milestone). */
  recordDailyPlay: () => number;
};

export const useStreakStore = create<StreakStore>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastPlayedDate: "",
      playedToday: false,
      recordDailyPlay: () => {
        const today = getDateKey();
        const state = get();

        // Already counted today
        if (state.lastPlayedDate === today) {
          return 0;
        }

        const gap = state.lastPlayedDate ? daysBetween(state.lastPlayedDate, today) : 999;
        let newStreak: number;

        if (gap === 1) {
          // Consecutive day
          newStreak = state.currentStreak + 1;
        } else if (gap === 0) {
          // Same day (shouldn't reach here but safety)
          return 0;
        } else {
          // Streak broken — restart at 1
          newStreak = 1;
        }

        const newLongest = Math.max(state.longestStreak, newStreak);
        const reward = getStreakReward(newStreak);

        set({
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastPlayedDate: today,
          playedToday: true,
        });

        return reward;
      },
    }),
    { name: "elsa-boteador-streak" }
  )
);
