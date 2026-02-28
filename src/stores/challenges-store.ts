import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Challenge = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  target: number;
  stat: "gamesPlayed" | "gamesWon";
  xpReward: number;
};

// Weekly challenges rotate — for mock we define a fixed set
export const WEEKLY_CHALLENGES: Challenge[] = [
  {
    id: "wk-play3",
    emoji: "🎮",
    title: "Jugadora activa",
    description: "Juega 3 partidas esta semana",
    target: 3,
    stat: "gamesPlayed",
    xpReward: 30,
  },
  {
    id: "wk-win2",
    emoji: "🏆",
    title: "Racha ganadora",
    description: "Gana 2 partidas esta semana",
    target: 2,
    stat: "gamesWon",
    xpReward: 40,
  },
  {
    id: "wk-play5",
    emoji: "🔥",
    title: "Sin parar",
    description: "Juega 5 partidas esta semana",
    target: 5,
    stat: "gamesPlayed",
    xpReward: 50,
  },
];

type ChallengesStore = {
  weekStartedAt: number; // timestamp
  weeklyGamesPlayed: number;
  weeklyGamesWon: number;
  claimedChallenges: string[];
  recordWeeklyGame: (won: boolean) => void;
  claimReward: (challengeId: string) => void;
  resetIfNewWeek: () => void;
};

function getWeekStart(): number {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
  return monday.getTime();
}

export const useChallengesStore = create<ChallengesStore>()(
  persist(
    (set, get) => ({
      weekStartedAt: getWeekStart(),
      weeklyGamesPlayed: 0,
      weeklyGamesWon: 0,
      claimedChallenges: [],
      recordWeeklyGame: (won) => {
        get().resetIfNewWeek();
        set((s) => ({
          weeklyGamesPlayed: s.weeklyGamesPlayed + 1,
          weeklyGamesWon: s.weeklyGamesWon + (won ? 1 : 0),
        }));
      },
      claimReward: (challengeId) =>
        set((s) => ({
          claimedChallenges: [...s.claimedChallenges, challengeId],
        })),
      resetIfNewWeek: () => {
        const currentWeek = getWeekStart();
        if (get().weekStartedAt < currentWeek) {
          set({
            weekStartedAt: currentWeek,
            weeklyGamesPlayed: 0,
            weeklyGamesWon: 0,
            claimedChallenges: [],
          });
        }
      },
    }),
    { name: "elsa-boteador-challenges" }
  )
);

export function getChallengeProgress(
  challenge: Challenge,
  store: { weeklyGamesPlayed: number; weeklyGamesWon: number }
): number {
  const value = challenge.stat === "gamesPlayed" ? store.weeklyGamesPlayed : store.weeklyGamesWon;
  return Math.min(value, challenge.target);
}
