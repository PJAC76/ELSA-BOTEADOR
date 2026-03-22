import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Star, Flame, Crown, Medal } from "lucide-react";
import { useProgressionStore, getLevelForXp } from "@/stores/progression-store";
import { useTranslation } from "@/lib/i18n";

type LeaderboardEntry = {
  rank: number;
  name: string;
  emoji: string;
  xp: number;
  wins: number;
  level: number;
  isMe?: boolean;
};

const MOCK_LEADERBOARD: Omit<LeaderboardEntry, "rank">[] = [
  { name: "ValeStar", emoji: "⭐", xp: 2800, wins: 38, level: 9 },
  { name: "LunaMoon", emoji: "🌙", xp: 2350, wins: 31, level: 8 },
  { name: "PixelQueen", emoji: "👑", xp: 1950, wins: 27, level: 7 },
  { name: "MintChoco", emoji: "🧁", xp: 1600, wins: 22, level: 7 },
  { name: "NeonGirl", emoji: "💜", xp: 1250, wins: 18, level: 6 },
  { name: "StarGirl", emoji: "✨", xp: 980, wins: 14, level: 5 },
  { name: "CoralFox", emoji: "🦊", xp: 720, wins: 10, level: 4 },
  { name: "BubbleTea", emoji: "🧋", xp: 500, wins: 7, level: 3 },
  { name: "CloudyDay", emoji: "☁️", xp: 320, wins: 4, level: 2 },
  { name: "NewbieRose", emoji: "🌹", xp: 120, wins: 1, level: 2 },
];

const RANK_STYLES: Record<number, { bg: string; icon: typeof Crown }> = {
  1: { bg: "bg-campus-yellow/20 ring-2 ring-campus-yellow/40", icon: Crown },
  2: { bg: "bg-muted/80 ring-1 ring-muted-foreground/20", icon: Medal },
  3: { bg: "bg-campus-peach/20 ring-1 ring-campus-peach/40", icon: Medal },
};

type Props = { onBack: () => void };

const LeaderboardScreen = ({ onBack }: Props) => {
  const { t } = useTranslation();
  const { totalXp, gamesWon } = useProgressionStore();
  const myLevel = getLevelForXp(totalXp);

  // Merge player into leaderboard
  const myEntry: Omit<LeaderboardEntry, "rank"> = {
    name: t("you"),
    emoji: "🕵️",
    xp: totalXp,
    wins: gamesWon,
    level: myLevel,
    isMe: true,
  };

  const merged = [...MOCK_LEADERBOARD, myEntry]
    .sort((a, b) => b.xp - a.xp)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const myRank = merged.find((e) => e.isMe)!;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="gradient-primary px-6 pb-6 pt-12 safe-top">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-foreground/20 text-primary-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl font-black text-primary-foreground">{t("leaderboardTitle")}</h1>
            <p className="font-body text-xs text-primary-foreground/70">{t("leaderboardSubtitle")}</p>
          </div>
          <Trophy className="h-7 w-7 text-campus-yellow" />
        </div>

        {/* My rank card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 flex items-center gap-3 rounded-2xl bg-primary-foreground/15 p-4"
        >
          <span className="font-display text-2xl font-black text-campus-yellow">#{myRank.rank}</span>
          <span className="text-2xl">{myRank.emoji}</span>
          <div className="flex-1">
            <p className="font-display text-sm font-bold text-primary-foreground">{myRank.name}</p>
            <p className="font-body text-xs text-primary-foreground/60">{t("level")} {myRank.level} · {myRank.xp} XP</p>
          </div>
          <div className="flex flex-col items-center">
            <Flame className="h-4 w-4 text-campus-yellow" />
            <span className="font-display text-xs font-bold text-primary-foreground">{myRank.wins}</span>
            <span className="font-body text-[9px] text-primary-foreground/50">{t("victories")}</span>
          </div>
        </motion.div>
      </div>

      {/* Top 3 podium */}
      <div className="-mt-2 px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-end justify-center gap-3 py-4"
        >
          {[merged[1], merged[0], merged[2]].map((entry, podiumIdx) => {
            const heights = ["h-20", "h-28", "h-16"];
            const sizes = ["text-3xl", "text-4xl", "text-2xl"];
            return (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + podiumIdx * 0.1 }}
                className="flex flex-col items-center"
              >
                <span className={sizes[podiumIdx]}>{entry.emoji}</span>
                <p className={`font-display text-xs font-bold ${entry.isMe ? "text-primary" : "text-foreground"} mt-1 truncate max-w-[70px] text-center`}>
                  {entry.name}
                </p>
                <p className="font-body text-[10px] text-muted-foreground">{entry.xp} XP</p>
                <div className={`${heights[podiumIdx]} w-16 mt-1 rounded-t-xl flex items-start justify-center pt-2 ${
                  podiumIdx === 1 ? "bg-campus-yellow/30" : podiumIdx === 0 ? "bg-muted" : "bg-campus-peach/30"
                }`}>
                  <span className="font-display text-sm font-black text-foreground">#{entry.rank}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Full list */}
      <div className="flex-1 px-6 pb-6 safe-bottom">
        <div className="space-y-2">
          {merged.slice(3).map((entry, idx) => {
            const style = RANK_STYLES[entry.rank];
            return (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.05 }}
                className={`flex items-center gap-3 rounded-2xl p-3 transition-colors ${
                  entry.isMe
                    ? "bg-primary/10 ring-2 ring-primary/30"
                    : style?.bg || "bg-card"
                }`}
              >
                <span className="w-8 text-center font-display text-sm font-black text-muted-foreground">#{entry.rank}</span>
                <span className="text-xl">{entry.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-display text-sm font-bold truncate ${entry.isMe ? "text-primary" : "text-foreground"}`}>{entry.name}</p>
                  <p className="font-body text-[10px] text-muted-foreground">{t("level")} {entry.level}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-campus-yellow" />
                    <span className="font-display text-xs font-bold text-foreground">{entry.xp}</span>
                  </div>
                  <span className="font-body text-[10px] text-muted-foreground">{entry.wins} {t("victories").toLowerCase()}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardScreen;
