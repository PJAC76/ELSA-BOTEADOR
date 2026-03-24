import { motion } from "framer-motion";
import { ArrowLeft, Lock, Star } from "lucide-react";
import { getUnlockedAchievements } from "@/stores/achievements";
import { useProgressionStore, getLevelForXp } from "@/stores/progression-store";
import { useTranslation } from "@/lib/i18n";

type Props = { onBack: () => void };

const TIER_STYLES: Record<string, { ring: string; bg: string; glow: string }> = {
  "🌟": { ring: "ring-campus-yellow/60", bg: "bg-campus-yellow/15", glow: "shadow-[0_0_18px_hsl(var(--campus-yellow)/0.35)]" },
  "🔍": { ring: "ring-primary/50", bg: "bg-primary/10", glow: "" },
  "🏆": { ring: "ring-campus-yellow/70", bg: "bg-campus-yellow/20", glow: "shadow-[0_0_20px_hsl(var(--campus-yellow)/0.4)]" },
  "🛡️": { ring: "ring-campus-green/50", bg: "bg-campus-green/15", glow: "" },
  "💎": { ring: "ring-primary/60", bg: "bg-primary/15", glow: "shadow-[0_0_22px_hsl(var(--primary)/0.3)]" },
  "🎯": { ring: "ring-campus-orange/50", bg: "bg-campus-orange/15", glow: "" },
  "⚡": { ring: "ring-campus-yellow/60", bg: "bg-campus-yellow/15", glow: "shadow-[0_0_18px_hsl(var(--campus-yellow)/0.3)]" },
  "🎮": { ring: "ring-primary/50", bg: "bg-primary/10", glow: "" },
  "👑": { ring: "ring-campus-yellow/80", bg: "bg-campus-yellow/25", glow: "shadow-[0_0_24px_hsl(var(--campus-yellow)/0.5)]" },
  "🔥": { ring: "ring-destructive/50", bg: "bg-destructive/15", glow: "shadow-[0_0_20px_hsl(var(--destructive)/0.35)]" },
};

const AchievementsScreen = ({ onBack }: Props) => {
  const { totalXp, gamesPlayed, gamesWon } = useProgressionStore();
  const { t } = useTranslation();
  const achievements = getUnlockedAchievements({ gamesPlayed, gamesWon, totalXp });
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const level = getLevelForXp(totalXp);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="gradient-fun px-6 pb-10 pt-12 safe-top">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-foreground/20 text-primary-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold text-primary-foreground">{t("achievements")}</h1>
            <p className="font-body text-xs text-primary-foreground/70">{t("achievementsSubtitle")}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-primary-foreground/20 px-3 py-1.5">
            <Star className="h-4 w-4 text-campus-yellow" />
            <span className="font-display text-sm font-bold text-primary-foreground">
              {unlockedCount}/{achievements.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-3 rounded-full bg-primary-foreground/20 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-campus-yellow"
            />
          </div>
          <p className="mt-1.5 font-body text-[10px] text-primary-foreground/60 text-right">
            {Math.round((unlockedCount / achievements.length) * 100)}% {t("achievementsComplete")}
          </p>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="flex-1 px-5 -mt-4 pb-8 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          {achievements.map(({ achievement, unlocked }, i) => {
            const name = t(`ach-${achievement.id}` as any) || achievement.name;
            const desc = t(`ach-${achievement.id}-desc` as any) || achievement.description;
            const tier = TIER_STYLES[achievement.emoji] ?? TIER_STYLES["🌟"];

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06, type: "spring", stiffness: 200 }}
                className={`relative flex flex-col items-center rounded-3xl p-4 transition-all ${
                  unlocked
                    ? `bg-card ring-2 ${tier.ring} ${tier.glow} shadow-card`
                    : "bg-muted/50 opacity-60"
                }`}
              >
                {/* Badge circle */}
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full ring-4 ${
                    unlocked
                      ? `${tier.bg} ${tier.ring}`
                      : "bg-muted ring-muted-foreground/20 grayscale"
                  }`}
                >
                  {unlocked ? (
                    <motion.span
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 300 }}
                      className="text-3xl"
                    >
                      {achievement.emoji}
                    </motion.span>
                  ) : (
                    <Lock className="h-6 w-6 text-muted-foreground/50" />
                  )}
                </div>

                {/* Unlocked sparkle */}
                {unlocked && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.06 }}
                    className="absolute top-2 right-2"
                  >
                    <Star className="h-4 w-4 text-campus-yellow fill-campus-yellow" />
                  </motion.div>
                )}

                {/* Text */}
                <p className={`mt-3 font-display text-xs font-bold text-center leading-tight ${
                  unlocked ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {name}
                </p>
                <p className="mt-1 font-body text-[10px] text-muted-foreground text-center leading-tight">
                  {desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Summary card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-5 rounded-3xl bg-card p-5 shadow-soft text-center"
        >
          <p className="font-body text-xs text-muted-foreground">{t("achievementsHint")}</p>
          <div className="mt-2 flex justify-center gap-4">
            <div className="text-center">
              <span className="font-display text-lg font-black text-foreground">{level}</span>
              <p className="font-body text-[10px] text-muted-foreground">{t("level")}</p>
            </div>
            <div className="text-center">
              <span className="font-display text-lg font-black text-foreground">{gamesPlayed}</span>
              <p className="font-body text-[10px] text-muted-foreground">{t("games")}</p>
            </div>
            <div className="text-center">
              <span className="font-display text-lg font-black text-foreground">{gamesWon}</span>
              <p className="font-body text-[10px] text-muted-foreground">{t("victories")}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AchievementsScreen;
