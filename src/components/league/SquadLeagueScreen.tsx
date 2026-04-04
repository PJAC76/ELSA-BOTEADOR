import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Shield, ChevronRight, Crown, Flame, Users, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useBffStore } from "@/stores/bff-store";
import {
  useSquadLeagueStore,
  LEAGUE_TIERS,
  LEAGUE_REWARDS,
  getTierForPoints,
  type RivalSquad,
} from "@/stores/squad-league-store";
import { useProgressionStore } from "@/stores/progression-store";
import { playTap, playPurchase } from "@/lib/sounds";
import { useToast } from "@/hooks/use-toast";

type SquadLeagueScreenProps = { onBack: () => void };

const TIER_COLORS: Record<string, string> = {
  bronce: "from-amber-700 to-amber-500",
  plata: "from-slate-400 to-slate-300",
  oro: "from-yellow-500 to-amber-400",
  diamante: "from-sky-400 to-cyan-300",
  leyenda: "from-purple-500 to-pink-400",
};

const TIER_RING: Record<string, string> = {
  bronce: "ring-amber-600/40",
  plata: "ring-slate-400/40",
  oro: "ring-yellow-400/40",
  diamante: "ring-sky-400/40",
  leyenda: "ring-purple-400/40",
};

const SquadLeagueScreen = ({ onBack }: SquadLeagueScreenProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { squadName, squadMembers } = useBffStore();
  const { addXp } = useProgressionStore();
  const league = useSquadLeagueStore();
  const [showTiers, setShowTiers] = useState(false);
  const [positionDelta, setPositionDelta] = useState<number | null>(null);

  useEffect(() => {
    const squadLabel = squadMembers.length > 0 ? squadName : t("squadLeagueNoSquad" as any);
    const delta = league.markPositionViewed(squadLabel);
    setPositionDelta(delta);
    const timer = setTimeout(() => setPositionDelta(null), 3500);
    return () => clearTimeout(timer);
  }, []);
  const tier = league.getCurrentTier();
  const tierInfo = LEAGUE_TIERS.find((ti) => ti.id === tier)!;
  const nextTier = LEAGUE_TIERS[LEAGUE_TIERS.indexOf(tierInfo) + 1];
  const ranking = league.getRanking(
    squadMembers.length > 0 ? squadName : t("squadLeagueNoSquad" as any),
    "💜"
  );

  const handleClaimReward = () => {
    const xp = league.claimWeeklyReward();
    if (xp > 0) {
      addXp(xp);
      playPurchase();
      toast({
        title: `${tierInfo.emoji} ${t("squadLeagueRewardClaimed" as any)}`,
        description: `+${xp} XP`,
        variant: "achievement" as any,
      });
    }
  };

  const podiumOrder = ranking.slice(0, 3);
  const restRanking = ranking.slice(3);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`bg-gradient-to-br ${TIER_COLORS[tier]} px-4 pb-6 pt-4 safe-top`}
      >
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <h1 className="font-display text-lg font-black text-white">
            <Shield className="inline h-5 w-5 mr-1 -mt-0.5" />
            {t("squadLeagueTitle" as any)}
          </h1>
          <button
            onClick={() => { playTap(); setShowTiers(!showTiers); }}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20"
          >
            <Trophy className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Current tier display */}
        <div className="flex items-center gap-4 rounded-2xl bg-white/15 p-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl">
            {tierInfo.emoji}
          </div>
          <div className="flex-1">
            <p className="font-display text-sm font-bold text-white/70">
              {t("squadLeagueTier" as any)}
            </p>
            <p className="font-display text-xl font-black text-white">
              {t(tierInfo.nameKey as any)}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-2 flex-1 rounded-full bg-white/20">
                <motion.div
                  className="h-full rounded-full bg-white"
                  initial={{ width: 0 }}
                  animate={{
                    width: nextTier
                      ? `${Math.min(((league.weeklyPoints - tierInfo.minPoints) / (nextTier.minPoints - tierInfo.minPoints)) * 100, 100)}%`
                      : "100%",
                  }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <span className="font-display text-[10px] font-bold text-white/80">
                {league.weeklyPoints} pts
              </span>
            </div>
            {nextTier && (
              <p className="mt-0.5 font-body text-[10px] text-white/60">
                {nextTier.minPoints - league.weeklyPoints} pts → {t(nextTier.nameKey as any)} {nextTier.emoji}
              </p>
            )}
          </div>
        </div>

        {/* Weekly stats */}
        <div className="mt-3 flex gap-2">
          {[
            { icon: "🎮", value: league.weeklyGames, label: t("bffGames" as any) },
            { icon: "🏆", value: league.weeklyWins, label: t("bffWins" as any) },
            { icon: "🔥", value: league.weeklyPoints, label: "Pts" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-1 flex-col items-center gap-0.5 rounded-xl bg-white/10 py-2"
            >
              <span className="text-sm">{stat.icon}</span>
              <span className="font-display text-sm font-black text-white">
                {stat.value}
              </span>
              <span className="font-body text-[9px] text-white/60">{stat.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Position change banner */}
      <AnimatePresence>
        {positionDelta !== null && positionDelta !== 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className={`flex items-center justify-center gap-2 py-3 px-4 ${
                positionDelta > 0
                  ? "bg-green-500/15 text-green-600 dark:text-green-400"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              <motion.div
                initial={{ y: positionDelta > 0 ? 20 : -20, scale: 0.5 }}
                animate={{ y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {positionDelta > 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="font-display text-sm font-bold"
              >
                {positionDelta > 0
                  ? `📈 ${t("squadLeagueClimbed" as any)} ${positionDelta} ${positionDelta === 1 ? t("squadLeaguePosition" as any) : t("squadLeaguePositions" as any)}!`
                  : `📉 ${t("squadLeagueDropped" as any)} ${Math.abs(positionDelta)} ${Math.abs(positionDelta) === 1 ? t("squadLeaguePosition" as any) : t("squadLeaguePositions" as any)}`}
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tier info dropdown */}
      <AnimatePresence>
        {showTiers && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-card border-b border-border"
          >
            <div className="p-4 space-y-2">
              <h3 className="font-display text-sm font-bold text-foreground">
                {t("squadLeagueTiers" as any)}
              </h3>
              {LEAGUE_TIERS.map((ti) => {
                const reward = LEAGUE_REWARDS.find((r) => r.tier === ti.id);
                const isCurrent = ti.id === tier;
                return (
                  <div
                    key={ti.id}
                    className={`flex items-center gap-3 rounded-xl p-3 ${
                      isCurrent ? "bg-primary/10 ring-1 ring-primary/30" : "bg-muted/50"
                    }`}
                  >
                    <span className="text-xl">{ti.emoji}</span>
                    <div className="flex-1">
                      <span className="font-display text-xs font-bold text-foreground">
                        {t(ti.nameKey as any)}
                      </span>
                      <p className="font-body text-[10px] text-muted-foreground">
                        {ti.minPoints}+ pts · +{reward?.xpBonus} XP {t("squadLeagueWeeklyBonus" as any)}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="font-display text-[10px] font-bold text-primary">
                        {t("squadLeagueCurrent" as any)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ranking */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="mt-4 mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-foreground">
            {t("squadLeagueRanking" as any)}
          </h2>
          <span className="font-body text-[10px] text-muted-foreground">
            {t("squadLeagueWeekly" as any)}
          </span>
        </div>

        {/* Podium - top 3 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 flex items-end justify-center gap-3"
        >
          {/* 2nd place */}
          {podiumOrder[1] && (
            <PodiumCard squad={podiumOrder[1]} position={2} t={t} />
          )}
          {/* 1st place */}
          {podiumOrder[0] && (
            <PodiumCard squad={podiumOrder[0]} position={1} t={t} />
          )}
          {/* 3rd place */}
          {podiumOrder[2] && (
            <PodiumCard squad={podiumOrder[2]} position={3} t={t} />
          )}
        </motion.div>

        {/* Rest of ranking */}
        <div className="space-y-2">
          {restRanking.map((squad, idx) => (
            <motion.div
              key={squad.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              className={`flex items-center gap-3 rounded-2xl p-3 ${
                (squad as any).isPlayer
                  ? "bg-primary/10 ring-1 ring-primary/30"
                  : "bg-card shadow-soft"
              }`}
            >
              <span className="w-6 text-center font-display text-sm font-black text-muted-foreground">
                {idx + 4}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-lg">
                {squad.emoji}
              </div>
              <div className="flex-1">
                <span className="font-display text-xs font-bold text-foreground">
                  {squad.name}
                  {(squad as any).isPlayer && " ⭐"}
                </span>
                <p className="font-body text-[10px] text-muted-foreground">
                  {squad.wins}W · {squad.gamesPlayed}G
                </p>
              </div>
              <div className="text-right">
                <span className="font-display text-sm font-black text-foreground">
                  {squad.weeklyPoints}
                </span>
                <p className="font-body text-[10px] text-muted-foreground">pts</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Claim reward footer */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border px-4 py-3 safe-bottom"
      >
        <button
          onClick={handleClaimReward}
          disabled={league.leagueRewardsClaimed.includes(league.currentWeek)}
          className={`flex w-full items-center justify-between rounded-2xl p-4 transition-all ${
            league.leagueRewardsClaimed.includes(league.currentWeek)
              ? "bg-muted text-muted-foreground"
              : `bg-gradient-to-r ${TIER_COLORS[tier]} text-white shadow-glow active:scale-[0.98]`
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{tierInfo.emoji}</span>
            <div className="text-left">
              <span className="font-display text-sm font-bold">
                {league.leagueRewardsClaimed.includes(league.currentWeek)
                  ? t("squadLeagueRewardClaimed" as any)
                  : t("squadLeagueClaimReward" as any)}
              </span>
              <p className="font-body text-[10px] opacity-80">
                +{LEAGUE_REWARDS.find((r) => r.tier === tier)?.xpBonus} XP {t("squadLeagueWeeklyBonus" as any)}
              </p>
            </div>
          </div>
          {!league.leagueRewardsClaimed.includes(league.currentWeek) && (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </motion.div>
    </div>
  );
};

function PodiumCard({
  squad,
  position,
  t,
}: {
  squad: RivalSquad & { isPlayer?: boolean };
  position: number;
  t: (key: any) => string;
}) {
  const heights = { 1: "h-28", 2: "h-22", 3: "h-18" };
  const sizes = { 1: "text-2xl", 2: "text-lg", 3: "text-lg" };
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
  const bgColors = {
    1: "bg-gradient-to-t from-yellow-400/20 to-yellow-500/5",
    2: "bg-gradient-to-t from-slate-400/20 to-slate-400/5",
    3: "bg-gradient-to-t from-amber-600/20 to-amber-600/5",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position === 1 ? 0.1 : position === 2 ? 0.2 : 0.3 }}
      className={`flex flex-col items-center ${position === 1 ? "order-2" : position === 2 ? "order-1" : "order-3"}`}
    >
      <div className="relative mb-1">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            bgColors[position as 1 | 2 | 3]
          } ${squad.isPlayer ? "ring-2 ring-primary" : ""}`}
        >
          <span className={sizes[position as 1 | 2 | 3]}>{squad.emoji}</span>
        </div>
        {position === 1 && (
          <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 h-5 w-5 text-yellow-500" />
        )}
      </div>
      <span className="text-sm">{medals[position as 1 | 2 | 3]}</span>
      <span className="font-display text-[10px] font-bold text-foreground text-center max-w-[80px] truncate">
        {squad.name}
        {squad.isPlayer && " ⭐"}
      </span>
      <span className="font-display text-xs font-black text-primary">
        {squad.weeklyPoints}
      </span>
      <div
        className={`w-16 ${heights[position as 1 | 2 | 3]} rounded-t-xl ${
          bgColors[position as 1 | 2 | 3]
        } mt-1`}
      />
    </motion.div>
  );
}

export default SquadLeagueScreen;
