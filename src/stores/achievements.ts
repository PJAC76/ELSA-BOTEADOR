import { getLevelForXp } from "./progression-store";

export type Achievement = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  check: (stats: AchievementStats) => boolean;
};

export type AchievementStats = {
  gamesPlayed: number;
  gamesWon: number;
  totalXp: number;
  level: number;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-game",
    emoji: "🌟",
    name: "Primera misión",
    description: "Juega tu primera partida",
    check: (s) => s.gamesPlayed >= 1,
  },
  {
    id: "5-games",
    emoji: "🔍",
    name: "Investigadora",
    description: "Juega 5 partidas",
    check: (s) => s.gamesPlayed >= 5,
  },
  {
    id: "first-win",
    emoji: "🏆",
    name: "¡Victoria!",
    description: "Gana tu primera partida",
    check: (s) => s.gamesWon >= 1,
  },
  {
    id: "5-wins",
    emoji: "🛡️",
    name: "Defensora",
    description: "Gana 5 partidas",
    check: (s) => s.gamesWon >= 5,
  },
  {
    id: "10-wins",
    emoji: "💎",
    name: "Diamante",
    description: "Gana 10 partidas",
    check: (s) => s.gamesWon >= 10,
  },
  {
    id: "level-3",
    emoji: "🎯",
    name: "En racha",
    description: "Alcanza el nivel 3",
    check: (s) => s.level >= 3,
  },
  {
    id: "level-5",
    emoji: "⚡",
    name: "Veterana",
    description: "Alcanza el nivel 5",
    check: (s) => s.level >= 5,
  },
  {
    id: "20-games",
    emoji: "🎮",
    name: "Adicta al campus",
    description: "Juega 20 partidas",
    check: (s) => s.gamesPlayed >= 20,
  },
  {
    id: "25-wins",
    emoji: "👑",
    name: "Reina agente",
    description: "Gana 25 partidas",
    check: (s) => s.gamesWon >= 25,
  },
  {
    id: "level-8",
    emoji: "🔥",
    name: "Leyenda",
    description: "Alcanza el nivel 8",
    check: (s) => s.level >= 8,
  },
];

export function getUnlockedAchievements(stats: {
  gamesPlayed: number;
  gamesWon: number;
  totalXp: number;
}): { achievement: Achievement; unlocked: boolean }[] {
  const level = getLevelForXp(stats.totalXp);
  const fullStats: AchievementStats = { ...stats, level };
  return ACHIEVEMENTS.map((a) => ({
    achievement: a,
    unlocked: a.check(fullStats),
  }));
}
