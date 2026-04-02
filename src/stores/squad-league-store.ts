import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LeagueTier = "bronce" | "plata" | "oro" | "diamante" | "leyenda";

export const LEAGUE_TIERS: { id: LeagueTier; emoji: string; nameKey: string; minPoints: number }[] = [
  { id: "bronce", emoji: "🥉", nameKey: "leagueBronce", minPoints: 0 },
  { id: "plata", emoji: "🥈", nameKey: "leaguePlata", minPoints: 100 },
  { id: "oro", emoji: "🥇", nameKey: "leagueOro", minPoints: 300 },
  { id: "diamante", emoji: "💎", nameKey: "leagueDiamante", minPoints: 600 },
  { id: "leyenda", emoji: "👑", nameKey: "leagueLeyenda", minPoints: 1000 },
];

export type RivalSquad = {
  id: string;
  name: string;
  emoji: string;
  members: { name: string; emoji: string }[];
  weeklyPoints: number;
  wins: number;
  gamesPlayed: number;
};

export type LeagueReward = {
  tier: LeagueTier;
  xpBonus: number;
  descKey: string;
};

export const LEAGUE_REWARDS: LeagueReward[] = [
  { tier: "bronce", xpBonus: 10, descKey: "leagueRewardBronce" },
  { tier: "plata", xpBonus: 25, descKey: "leagueRewardPlata" },
  { tier: "oro", xpBonus: 50, descKey: "leagueRewardOro" },
  { tier: "diamante", xpBonus: 100, descKey: "leagueRewardDiamante" },
  { tier: "leyenda", xpBonus: 200, descKey: "leagueRewardLeyenda" },
];

const RIVAL_SQUAD_NAMES = [
  { name: "Las Detectivas", emoji: "🔍" },
  { name: "Campus Queens", emoji: "👑" },
  { name: "Sabotaje Club", emoji: "💣" },
  { name: "Las Agentes", emoji: "🕵️" },
  { name: "Dream Team", emoji: "✨" },
  { name: "Chicas Fuego", emoji: "🔥" },
  { name: "Las Invencibles", emoji: "💪" },
  { name: "Star Squad", emoji: "⭐" },
  { name: "Pink Panthers", emoji: "🩷" },
  { name: "Las Mariposas", emoji: "🦋" },
];

const BOT_NAMES = [
  "Luna", "Valentina", "Sofía", "Camila", "Isabella",
  "Martina", "Renata", "Lucía", "Emma", "Mía",
  "Daniela", "Abril", "Alma", "Olivia", "Julieta",
  "Sara", "Carla", "Noa", "Lara", "Zoe",
];

const BOT_EMOJIS = ["👩‍🎤", "🧑‍🎨", "👩‍🔬", "🧝‍♀️", "🧜‍♀️", "👩‍🚀", "🧑‍💻", "💃", "🧚‍♀️", "👩‍🎓"];

function generateRivalSquads(count: number): RivalSquad[] {
  const shuffledNames = [...RIVAL_SQUAD_NAMES].sort(() => Math.random() - 0.5);
  const shuffledBots = [...BOT_NAMES].sort(() => Math.random() - 0.5);

  return shuffledNames.slice(0, count).map((squad, idx) => {
    const memberCount = 3 + Math.floor(Math.random() * 2); // 3-4 members
    const members = Array.from({ length: memberCount }, (_, i) => ({
      name: shuffledBots[(idx * 4 + i) % shuffledBots.length],
      emoji: BOT_EMOJIS[(idx * 4 + i) % BOT_EMOJIS.length],
    }));

    const gamesPlayed = 3 + Math.floor(Math.random() * 12);
    const winRate = 0.3 + Math.random() * 0.5;
    const wins = Math.floor(gamesPlayed * winRate);
    const weeklyPoints = wins * 30 + gamesPlayed * 10 + Math.floor(Math.random() * 50);

    return {
      id: `rival-${idx}`,
      name: squad.name,
      emoji: squad.emoji,
      members,
      weeklyPoints,
      wins,
      gamesPlayed,
    };
  });
}

function getWeekId(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
}

function getTierForPoints(points: number): LeagueTier {
  let tier: LeagueTier = "bronce";
  for (const t of LEAGUE_TIERS) {
    if (points >= t.minPoints) tier = t.id;
  }
  return tier;
}

export type LeagueGameResult = {
  tierChanged: boolean;
  newTier: LeagueTier | null;
  oldTier: LeagueTier | null;
  positionChanged: number; // negative = moved up (good), positive = moved down
  newPosition: number;
};

type SquadLeagueState = {
  weeklyPoints: number;
  weeklyWins: number;
  weeklyGames: number;
  currentWeek: string;
  rivalSquads: RivalSquad[];
  previousTier: LeagueTier | null;
  lastPosition: number;
  leagueRewardsClaimed: string[];
  addWeeklyPoints: (points: number) => void;
  recordLeagueGame: (won: boolean, squadName: string) => LeagueGameResult;
  getCurrentTier: () => LeagueTier;
  getRanking: (squadName: string, squadEmoji: string) => (RivalSquad & { isPlayer?: boolean })[];
  getPlayerPosition: (squadName: string) => number;
  claimWeeklyReward: () => number;
  ensureCurrentWeek: () => void;
};

export const useSquadLeagueStore = create<SquadLeagueState>()(
  persist(
    (set, get) => ({
      weeklyPoints: 0,
      weeklyWins: 0,
      weeklyGames: 0,
      currentWeek: getWeekId(),
      rivalSquads: generateRivalSquads(7),
      previousTier: null,
      lastPosition: 8,
      leagueRewardsClaimed: [],

      ensureCurrentWeek: () => {
        const week = getWeekId();
        if (get().currentWeek !== week) {
          set({
            previousTier: getTierForPoints(get().weeklyPoints),
            weeklyPoints: 0,
            weeklyWins: 0,
            weeklyGames: 0,
            currentWeek: week,
            rivalSquads: generateRivalSquads(7),
          });
        }
      },

      addWeeklyPoints: (points) => {
        get().ensureCurrentWeek();
        set((s) => ({ weeklyPoints: s.weeklyPoints + points }));
      },

      recordLeagueGame: (won) => {
        get().ensureCurrentWeek();
        const points = won ? 30 : 10;
        set((s) => ({
          weeklyPoints: s.weeklyPoints + points,
          weeklyWins: s.weeklyWins + (won ? 1 : 0),
          weeklyGames: s.weeklyGames + 1,
        }));
      },

      getCurrentTier: () => getTierForPoints(get().weeklyPoints),

      getRanking: (squadName, squadEmoji) => {
        get().ensureCurrentWeek();
        const { rivalSquads, weeklyPoints, weeklyWins, weeklyGames } = get();
        const playerSquad: RivalSquad & { isPlayer?: boolean } = {
          id: "player",
          name: squadName,
          emoji: squadEmoji,
          members: [],
          weeklyPoints,
          wins: weeklyWins,
          gamesPlayed: weeklyGames,
          isPlayer: true,
        };
        return [...rivalSquads, playerSquad].sort((a, b) => b.weeklyPoints - a.weeklyPoints);
      },

      getPlayerPosition: (squadName) => {
        const ranking = get().getRanking(squadName, "");
        return ranking.findIndex((s) => s.id === "player") + 1;
      },

      claimWeeklyReward: () => {
        const week = get().currentWeek;
        if (get().leagueRewardsClaimed.includes(week)) return 0;
        const tier = get().getCurrentTier();
        const reward = LEAGUE_REWARDS.find((r) => r.tier === tier);
        if (!reward) return 0;
        set((s) => ({
          leagueRewardsClaimed: [...s.leagueRewardsClaimed, week],
        }));
        return reward.xpBonus;
      },
    }),
    { name: "elsa-boteador-squad-league" }
  )
);

export { getTierForPoints, getWeekId };
