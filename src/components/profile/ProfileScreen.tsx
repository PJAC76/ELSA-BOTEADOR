import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit3, Check, X, TrendingUp, Target, Trophy, Gamepad2, Award } from "lucide-react";
import AvatarCustomizer, { getAvatarEmoji } from "@/components/shared/AvatarCustomizer";
import type { AvatarConfig } from "@/types/game";
import { getUnlockedAchievements } from "@/stores/achievements";
import { useTranslation } from "@/lib/i18n";

type ProfileScreenProps = { displayName: string; avatarConfig: AvatarConfig; level?: number; xp?: number; totalXp?: number; gamesPlayed?: number; gamesWon?: number; onBack: () => void; onAvatarSave: (config: AvatarConfig) => void };

const ProfileScreen = ({ displayName, avatarConfig, level = 1, xp = 0, totalXp = 0, gamesPlayed = 0, gamesWon = 0, onBack, onAvatarSave }: ProfileScreenProps) => {
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  const achievements = getUnlockedAchievements({ gamesPlayed, gamesWon, totalXp });
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AvatarConfig>(avatarConfig);
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="gradient-fun px-6 pb-10 pt-12 safe-top">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-foreground/20 text-primary-foreground"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="font-display text-xl font-bold text-primary-foreground">{t("myProfile")}</h1>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-6 -mt-6 pb-8 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-card p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-warm"><span className="text-4xl">{getAvatarEmoji(editing ? draft : avatarConfig)}</span></div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold text-foreground">{displayName}</h2>
              <p className="font-body text-sm text-muted-foreground">{t("level")} {level} · {xp} XP</p>
              <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-campus-yellow transition-all" style={{ width: `${Math.min(xp, 100)}%` }} /></div>
            </div>
          </div>
          {!editing ? (
            <Button variant="outline" className="mt-4 w-full rounded-2xl font-display text-sm" onClick={() => { setDraft(avatarConfig); setEditing(true); }}><Edit3 className="mr-2 h-4 w-4" />{t("editAvatar")}</Button>
          ) : (
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1 rounded-2xl font-display text-sm" onClick={() => { setDraft(avatarConfig); setEditing(false); }}><X className="mr-1 h-4 w-4" />{t("cancel")}</Button>
              <Button className="flex-1 rounded-2xl gradient-primary text-primary-foreground font-display text-sm" onClick={() => { onAvatarSave(draft); setEditing(false); }}><Check className="mr-1 h-4 w-4" />{t("save")}</Button>
            </div>
          )}
        </motion.div>

        <AnimatePresence>{editing && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 rounded-3xl bg-card p-5 shadow-soft overflow-hidden"><AvatarCustomizer avatarConfig={draft} onChange={setDraft} showPreview={false} /></motion.div>}</AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-4 rounded-3xl bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-5 w-5 text-primary" /><h3 className="font-display text-sm font-bold text-foreground">{t("stats")}</h3></div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[{ label: t("games"), value: gamesPlayed, icon: Gamepad2, color: "text-primary" }, { label: t("victories"), value: gamesWon, icon: Trophy, color: "text-campus-yellow" }, { label: t("winRate"), value: `${winRate}%`, icon: Target, color: "text-campus-green" }].map(({ label, value, icon: Icon, color }, i) => (
              <motion.div key={label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.1 }} className="flex flex-col items-center rounded-2xl bg-muted/50 p-3">
                <Icon className={`h-5 w-5 ${color} mb-1`} /><span className="font-display text-xl font-black text-foreground">{value}</span><span className="font-body text-[10px] text-muted-foreground">{label}</span>
              </motion.div>
            ))}
          </div>
          <div><div className="flex items-center justify-between mb-1.5"><span className="font-body text-xs text-muted-foreground">{t("winRateLabel")}</span><span className="font-display text-xs font-bold text-foreground">{winRate}%</span></div>
            <div className="h-3 rounded-full bg-muted overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${winRate}%` }} transition={{ delay: 0.5, duration: 0.8 }} className="h-full rounded-full gradient-primary" /></div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2"><span className="font-body text-xs text-muted-foreground">{t("losses")}</span><span className="font-display text-sm font-bold text-foreground">{gamesPlayed - gamesWon}</span></div>
            <div className="flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2"><span className="font-body text-xs text-muted-foreground">{t("currentStreak")}</span><span className="font-display text-sm font-bold text-foreground">{gamesWon > 0 ? "🔥" : "—"}</span></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4 rounded-3xl bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" /><h3 className="font-display text-sm font-bold text-foreground">{t("achievements")}</h3></div>
            <span className="rounded-full bg-primary/10 px-3 py-1 font-display text-xs font-bold text-primary">{unlockedCount}/{achievements.length}</span>
          </div>
          <div className="space-y-2.5">
            {achievements.map(({ achievement, unlocked }, i) => {
              const name = t(`ach-${achievement.id}` as any) || achievement.name;
              const desc = t(`ach-${achievement.id}-desc` as any) || achievement.description;
              return (
                <motion.div key={achievement.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.05 }} className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors ${unlocked ? "bg-primary/8" : "bg-muted/40"}`}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${unlocked ? "bg-primary/15" : "bg-muted grayscale opacity-40"}`}><span className="text-lg">{achievement.emoji}</span></div>
                  <div className="flex-1 min-w-0"><p className={`font-display text-xs font-bold truncate ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>{name}</p><p className="font-body text-[10px] text-muted-foreground truncate">{desc}</p></div>
                  {unlocked && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}><Check className="h-4 w-4 text-primary" /></motion.div>}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileScreen;
