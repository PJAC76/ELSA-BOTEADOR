import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit3, Check, X, TrendingUp, Target, Trophy, Gamepad2, Award, History, Shield, UserX, Sparkles } from "lucide-react";
import AvatarCustomizer, { getAvatarEmoji } from "@/components/shared/AvatarCustomizer";
import type { AvatarConfig } from "@/types/game";
import { getUnlockedAchievements } from "@/stores/achievements";
import { useTranslation } from "@/lib/i18n";

export type GameHistoryItem = {
  id: string;
  role: string;
  won: boolean;
  xp_earned: number;
  tasks_completed: number;
  guessed_word: boolean;
  created_at: string;
};

type ProfileScreenProps = { displayName: string; avatarConfig: AvatarConfig; level?: number; xp?: number; totalXp?: number; gamesPlayed?: number; gamesWon?: number; history?: GameHistoryItem[]; onBack: () => void; onAvatarSave: (config: AvatarConfig) => void; onAchievements?: () => void };

const ProfileScreen = ({ displayName, avatarConfig, level = 1, xp = 0, totalXp = 0, gamesPlayed = 0, gamesWon = 0, history = [], onBack, onAvatarSave, onAchievements }: ProfileScreenProps) => {
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  const achievements = getUnlockedAchievements({ gamesPlayed, gamesWon, totalXp });
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AvatarConfig>(avatarConfig);
  const [roleFilter, setRoleFilter] = useState<"all" | "agent" | "saboteur">("all");
  const [resultFilter, setResultFilter] = useState<"all" | "wins" | "losses">("all");
  const { t } = useTranslation();

  const filteredHistory = history.filter((item) => {
    if (roleFilter !== "all" && item.role !== roleFilter) return false;
    if (resultFilter === "wins" && !item.won) return false;
    if (resultFilter === "losses" && item.won) return false;
    return true;
  });

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
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 font-display text-xs font-bold text-primary">{unlockedCount}/{achievements.length}</span>
              {onAchievements && <button onClick={onAchievements} className="rounded-full bg-muted px-3 py-1 font-display text-[10px] font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">{t("viewAchievements")}</button>}
            </div>
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-4 mb-4 rounded-3xl bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><History className="h-5 w-5 text-primary" /><h3 className="font-display text-sm font-bold text-foreground">{t("matchHistory" as any) || "Match history"}</h3></div>
            <span className="rounded-full bg-primary/10 px-3 py-1 font-display text-xs font-bold text-primary">{filteredHistory.length}/{history.length}</span>
          </div>

          {history.length > 0 && (
            <div className="mb-4 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {([
                  { id: "all", label: t("filterAll" as any) || "Todas", icon: null },
                  { id: "agent", label: t("agent"), icon: Shield },
                  { id: "saboteur", label: t("saboteur"), icon: UserX },
                ] as const).map(({ id, label, icon: Icon }) => {
                  const active = roleFilter === id;
                  return (
                    <button key={id} onClick={() => setRoleFilter(id as any)} className={`flex items-center gap-1 rounded-full px-3 py-1.5 font-display text-[10px] font-bold transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}>
                      {Icon && <Icon className="h-3 w-3" />}{label}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {([
                  { id: "all", label: t("filterAll" as any) || "Todas" },
                  { id: "wins", label: t("victories") },
                  { id: "losses", label: t("losses") },
                ] as const).map(({ id, label }) => {
                  const active = resultFilter === id;
                  return (
                    <button key={id} onClick={() => setResultFilter(id as any)} className={`rounded-full px-3 py-1.5 font-display text-[10px] font-bold transition-colors ${active ? (id === "wins" ? "bg-campus-green text-white" : id === "losses" ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground") : "bg-muted text-muted-foreground hover:bg-primary/10"}`}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Sparkles className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="font-body text-xs text-muted-foreground">{history.length === 0 ? (t("noMatchesYet" as any) || "No matches played yet") : (t("noMatchesFilter" as any) || "No matches match these filters")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHistory.map((item, i) => {
                const date = new Date(item.created_at);
                const dateStr = date.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
                const timeStr = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
                const isSaboteur = item.role === "saboteur";
                const RoleIcon = isSaboteur ? UserX : Shield;
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.03 }} className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${item.won ? "bg-campus-green/10" : "bg-muted/40"}`}>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isSaboteur ? "bg-destructive/15" : "bg-primary/15"}`}>
                      <RoleIcon className={`h-5 w-5 ${isSaboteur ? "text-destructive" : "text-primary"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-display text-xs font-bold ${item.won ? "text-campus-green" : "text-muted-foreground"}`}>{item.won ? t("victory") : t("defeat")}</span>
                        <span className="font-body text-[10px] text-muted-foreground">· {isSaboteur ? t("saboteur") : t("agent")}</span>
                      </div>
                      <p className="font-body text-[10px] text-muted-foreground">{dateStr} · {timeStr}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-sm font-black text-campus-yellow">+{item.xp_earned}</p>
                      <p className="font-body text-[10px] text-muted-foreground">XP</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileScreen;
