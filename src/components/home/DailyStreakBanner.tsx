import { motion } from "framer-motion";
import { Flame, ChevronRight } from "lucide-react";
import { useStreakStore, getNextMilestone, STREAK_REWARDS } from "@/stores/streak-store";
import { useTranslation } from "@/lib/i18n";

const DailyStreakBanner = () => {
  const { t } = useTranslation();
  const { currentStreak, longestStreak, playedToday } = useStreakStore();
  const nextMilestone = getNextMilestone(currentStreak);
  const nextReward = STREAK_REWARDS[nextMilestone] ?? 0;

  // Flame colors based on streak length
  const flameColor =
    currentStreak >= 14
      ? "text-destructive"
      : currentStreak >= 7
        ? "text-campus-peach"
        : currentStreak >= 3
          ? "text-campus-yellow"
          : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="rounded-2xl bg-card p-4 shadow-soft"
    >
      <div className="flex items-center gap-3">
        {/* Flame icon with pulse when active */}
        <div className="relative">
          <motion.div
            animate={playedToday ? { scale: [1, 1.15, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <Flame className={`h-8 w-8 ${flameColor} transition-colors`} />
          </motion.div>
          {playedToday && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-campus-yellow ring-2 ring-card"
            />
          )}
        </div>

        {/* Streak info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-foreground">
              {currentStreak}
            </span>
            <span className="font-display text-xs font-bold text-muted-foreground">
              {currentStreak === 1 ? t("streakDay") : t("streakDays")}
            </span>
          </div>
          <p className="font-body text-[10px] text-muted-foreground truncate">
            {playedToday
              ? t("streakPlayedToday")
              : currentStreak > 0
                ? t("streakPlayToKeep")
                : t("streakPlayToStart")}
          </p>
        </div>

        {/* Next milestone */}
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1 rounded-full bg-campus-yellow/15 px-2.5 py-1">
            <span className="font-display text-[10px] font-bold text-campus-yellow">
              {t("streakNext")}: {nextMilestone}🔥
            </span>
            <ChevronRight className="h-3 w-3 text-campus-yellow" />
          </div>
          <span className="font-body text-[9px] text-muted-foreground">
            +{nextReward} XP
          </span>
        </div>
      </div>

      {/* Streak milestones progress dots */}
      <div className="mt-3 flex items-center gap-1.5">
        {[1, 2, 3, 5, 7, 14, 30].map((milestone) => (
          <div key={milestone} className="flex flex-col items-center gap-0.5 flex-1">
            <div
              className={`h-2 w-full rounded-full transition-colors ${
                currentStreak >= milestone
                  ? "bg-campus-yellow"
                  : "bg-muted"
              }`}
            />
            <span className="font-body text-[8px] text-muted-foreground">{milestone}</span>
          </div>
        ))}
      </div>

      {/* Record */}
      {longestStreak > 1 && (
        <p className="mt-2 text-center font-body text-[10px] text-muted-foreground">
          🏅 {t("streakRecord")}: {longestStreak} {t("streakDays")}
        </p>
      )}
    </motion.div>
  );
};

export default DailyStreakBanner;
