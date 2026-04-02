import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, Zap, UserCircle, Package, Settings, HelpCircle, Trophy, Award, ShoppingBag, Heart, Shield } from "lucide-react";
import WeeklyChallenges from "@/components/progression/WeeklyChallenges";
import DailyStreakBanner from "@/components/home/DailyStreakBanner";
import { useTranslation } from "@/lib/i18n";
import { useBffStore } from "@/stores/bff-store";

type HomeScreenProps = {
  displayName: string;
  level?: number;
  xp?: number;
  onPlayFriends: () => void;
  onQuickPlay: () => void;
  onFriends?: () => void;
  onInventory?: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
  onHowToPlay?: () => void;
  onLeaderboard?: () => void;
  onAchievements?: () => void;
  onShop?: () => void;
  onSquadLeague?: () => void;
};

const HomeScreen = ({
  displayName, level = 1, xp = 0,
  onPlayFriends, onQuickPlay, onFriends, onInventory, onProfile, onSettings, onHowToPlay, onLeaderboard, onAchievements, onShop,
}: HomeScreenProps) => {
  const { t } = useTranslation();
  const { squadMembers, stats: squadStats, squadName } = useBffStore();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="gradient-primary px-6 pb-8 pt-12 safe-top">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <p className="font-body text-sm text-primary-foreground/70">{t("helloAgain")}</p>
            <h1 className="font-display text-2xl font-black text-primary-foreground">{displayName}</h1>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/20">
            <span className="text-2xl">🕵️</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-4 flex items-center gap-3">
          <div className="flex h-8 items-center rounded-full bg-primary-foreground/20 px-3">
            <span className="font-display text-xs font-bold text-primary-foreground">{t("level")} {level}</span>
          </div>
          <div className="flex-1">
            <div className="h-2 rounded-full bg-primary-foreground/20">
              <div className="h-full rounded-full bg-campus-yellow transition-all" style={{ width: `${Math.min(xp, 100)}%` }} />
            </div>
          </div>
          <span className="font-body text-xs text-primary-foreground/70">{xp} XP</span>
        </motion.div>
      </div>

      <div className="flex flex-1 flex-col px-6 -mt-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
          <Button onClick={onPlayFriends} className="h-20 w-full rounded-3xl gradient-warm text-primary-foreground shadow-card font-display text-lg font-bold relative overflow-hidden">
            <div className="flex items-center gap-3">
              <Users className="h-7 w-7" />
              <div className="text-left">
                <div>{t("playWithFriends")}</div>
                <div className="text-xs font-body font-normal text-primary-foreground/70">{t("createOrJoinPrivate")}</div>
              </div>
            </div>
          </Button>

          <Button onClick={onQuickPlay} className="h-20 w-full rounded-3xl gradient-accent text-accent-foreground shadow-card font-display text-lg font-bold">
            <div className="flex items-center gap-3">
              <Zap className="h-7 w-7" />
              <div className="text-left">
                <div>{t("quickPlay")}</div>
                <div className="text-xs font-body font-normal text-accent-foreground/70">{t("findPlayersInstantly")}</div>
              </div>
            </div>
          </Button>

          <div className="flex gap-3">
            <button onClick={onHowToPlay} className="flex flex-1 items-center gap-3 rounded-2xl bg-card px-5 py-4 shadow-soft transition-colors hover:bg-muted">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <span className="font-display text-sm font-bold text-foreground">{t("howToPlay")}</span>
            </button>
            <button onClick={onLeaderboard} className="flex flex-1 items-center gap-3 rounded-2xl bg-card px-5 py-4 shadow-soft transition-colors hover:bg-muted">
              <Trophy className="h-5 w-5 text-campus-yellow" />
              <span className="font-display text-sm font-bold text-foreground">{t("leaderboard")}</span>
            </button>
          </div>
          <div className="flex gap-3">
            <button onClick={onAchievements} className="flex flex-1 items-center gap-3 rounded-2xl bg-card px-5 py-4 shadow-soft transition-colors hover:bg-muted">
              <Award className="h-5 w-5 text-primary" />
              <span className="font-display text-sm font-bold text-foreground">{t("achievements")}</span>
            </button>
            <button onClick={onShop} className="flex flex-1 items-center gap-3 rounded-2xl bg-card px-5 py-4 shadow-soft transition-colors hover:bg-muted">
              <ShoppingBag className="h-5 w-5 text-campus-peach" />
              <span className="font-display text-sm font-bold text-foreground">{t("shopTitle" as any)}</span>
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }} className="mt-4 px-0">
          <DailyStreakBanner />
        </motion.div>

        {/* BFF Squad Widget */}
        {squadMembers.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }} className="mt-3">
            <button onClick={onFriends} className="w-full rounded-2xl bg-gradient-to-r from-primary/8 via-secondary/5 to-campus-peach/8 p-4 shadow-soft text-left transition-all active:scale-[0.98]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <span className="font-display text-xs font-bold text-foreground">{squadName}</span>
                </div>
                {squadStats.sharedStreak > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-campus-yellow/20 px-2 py-0.5 font-display text-[10px] font-bold text-foreground">
                    🔥 {squadStats.sharedStreak}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {squadMembers.map((m) => (
                  <div key={m.id} className="flex h-9 w-9 items-center justify-center rounded-xl gradient-fun">
                    <span className="text-base">{m.emoji}</span>
                  </div>
                ))}
                <div className="ml-auto flex items-center gap-3 text-muted-foreground">
                  <span className="font-display text-[10px] font-bold">🎮 {squadStats.gamesPlayedTogether}</span>
                  <span className="font-display text-[10px] font-bold">🏆 {squadStats.winsTogetherAgent + squadStats.winsTogetherSaboteur}</span>
                </div>
              </div>
            </button>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-3 px-0">
          <WeeklyChallenges compact />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-auto pb-6 safe-bottom">
          <div className="flex justify-around rounded-3xl bg-muted p-3">
            {[
              { icon: UserCircle, label: t("profile"), action: onProfile },
              { icon: Package, label: t("inventory"), action: onInventory },
              { icon: Users, label: t("friends"), action: onFriends },
              { icon: Settings, label: t("settings"), action: onSettings },
            ].map(({ icon: Icon, label, action }) => (
              <button key={label} onClick={action} className="flex flex-col items-center gap-1 rounded-2xl px-4 py-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground">
                <Icon className="h-5 w-5" />
                <span className="font-body text-[10px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeScreen;
