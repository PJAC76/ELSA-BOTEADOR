import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { PlayerRole } from "@/types/game";
import { playVictory, playDefeat, playTap } from "@/lib/sounds";
import { useToast } from "@/hooks/use-toast";
import { useProgressionStore, XP_REWARDS, getLevelForXp, getXpForCurrentLevel } from "@/stores/progression-store";
import { getUnlockedAchievements } from "@/stores/achievements";
import { useChallengesStore } from "@/stores/challenges-store";
import Confetti from "./Confetti";
import { Gift, Play, Star, Eye, Flag, Key, BookOpen } from "lucide-react";
import ReportPlayerModal from "@/components/reports/ReportPlayerModal";
import { useTranslation } from "@/lib/i18n";

const MOCK_PLAYERS = [
  { id: "me", name: "You", emoji: "🕵️", role: "agent" as PlayerRole },
  { id: "p2", name: "Luna_Star", emoji: "💃", role: "saboteur" as PlayerRole },
  { id: "p3", name: "MintChoco", emoji: "🧁", role: "agent" as PlayerRole },
  { id: "p4", name: "PixelQueen", emoji: "👑", role: "agent" as PlayerRole },
  { id: "p5", name: "StarGirl", emoji: "⭐", role: "agent" as PlayerRole },
];

type WordGuessInfo = { playerName: string; playerEmoji: string };
type SecretWordInfo = { round: number; word: string; category: string };
type GameResultScreenProps = { result: "agents-win" | "saboteur-wins"; myRole: PlayerRole; wordGuessers?: WordGuessInfo[]; secretWords?: SecretWordInfo[]; onBackToHome: () => void };

const GameResultScreen = ({ result, myRole, wordGuessers = [], secretWords = [], onBackToHome }: GameResultScreenProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const hasRecorded = useRef(false);
  const [showReveal, setShowReveal] = useState(false);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [xpAnimated, setXpAnimated] = useState(0);
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string } | null>(null);

  const iWon = (result === "agents-win" && myRole === "agent") || (result === "saboteur-wins" && myRole === "saboteur");
  const xpEarned = iWon ? XP_REWARDS.WIN : XP_REWARDS.LOSS;

  useEffect(() => { if (iWon) playVictory(); else playDefeat(); }, [iWon]);

  useEffect(() => {
    if (hasRecorded.current) return;
    hasRecorded.current = true;
    const store = useProgressionStore.getState();
    const before = getUnlockedAchievements({ gamesPlayed: store.gamesPlayed, gamesWon: store.gamesWon, totalXp: store.totalXp });
    store.recordGame(iWon);
    useChallengesStore.getState().recordWeeklyGame(iWon);
    const updated = useProgressionStore.getState();
    const after = getUnlockedAchievements({ gamesPlayed: updated.gamesPlayed, gamesWon: updated.gamesWon, totalXp: updated.totalXp });
    after.filter((a, i) => a.unlocked && !before[i].unlocked).forEach((item, idx) => {
      setTimeout(() => { toast({ title: `${item.achievement.emoji} ${t("achievementUnlocked")}`, description: `${item.achievement.name} — ${item.achievement.description}` }); }, 2500 + idx * 800);
    });
  }, [iWon, toast, t]);

  useEffect(() => { let frame = 0; const interval = setInterval(() => { frame++; setXpAnimated(Math.round((frame / 30) * xpEarned)); if (frame >= 30) clearInterval(interval); }, 30); return () => clearInterval(interval); }, [xpEarned]);

  const handleBonusVideo = () => { playTap(); setBonusClaimed(true); useProgressionStore.getState().addXp(15); toast({ title: t("bonusClaimedToast"), description: t("bonusClaimedDesc") }); };

  const { totalXp } = useProgressionStore();
  const level = getLevelForXp(totalXp);
  const { progress } = getXpForCurrentLevel(totalXp);

  const players = MOCK_PLAYERS.map(p => p.id === "me" ? { ...p, name: t("you") } : p);

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-6 py-8 safe-top safe-bottom overflow-y-auto">
      {iWon && <Confetti count={60} />}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="flex flex-col items-center gap-3 mt-8">
        <motion.span className="text-7xl" animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ delay: 0.5, duration: 0.6 }}>{iWon ? "🏆" : "😢"}</motion.span>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="font-display text-3xl font-black text-foreground text-center">{iWon ? t("victory") : t("defeat")}</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="font-body text-sm text-muted-foreground text-center">{result === "agents-win" ? t("agentsCompletedTasks") : t("saboteurSabotagedMission")}</motion.p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-6 w-full max-w-xs">
        <div className="rounded-2xl bg-card p-5 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Star className="h-5 w-5 text-campus-yellow" /><span className="font-display text-lg font-black text-foreground">+{xpAnimated} XP</span></div>
            <span className="rounded-full bg-primary/10 px-3 py-1 font-display text-xs font-bold text-primary">{t("level")} {level}</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden"><motion.div className="h-full rounded-full bg-campus-yellow" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ delay: 0.8, duration: 0.8 }} /></div>
        </div>
      </motion.div>

      {/* Word Guessers Section */}
      {wordGuessers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className="mt-4 w-full max-w-xs">
          <div className="rounded-2xl bg-card p-4 shadow-soft space-y-3">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              <span className="font-display text-sm font-bold text-foreground">{t("wordGuessedTitle")}</span>
            </div>
            <div className="space-y-2">
              {wordGuessers.map((guesser, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.85 + idx * 0.15 }}
                  className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2"
                >
                  <span className="text-lg">{guesser.playerEmoji}</span>
                  <span className="flex-1 font-display text-xs font-bold text-foreground">{guesser.playerName}</span>
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 font-display text-[10px] font-bold text-primary">+{XP_REWARDS.WORD_GUESS} XP</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {!bonusClaimed && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: 0.9 }} className="mt-4 w-full max-w-xs">
            <button onClick={handleBonusVideo} className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-campus-yellow/20 to-campus-peach/20 p-4 shadow-soft transition-all active:scale-[0.97]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-warm"><Gift className="h-5 w-5 text-primary-foreground" /></div>
              <div className="flex-1 text-left"><p className="font-display text-sm font-bold text-foreground">{t("freeBonus")}</p><p className="font-body text-xs text-muted-foreground">{t("watchVideoXp")}</p></div>
              <Play className="h-5 w-5 text-muted-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {bonusClaimed && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex items-center gap-2 rounded-full bg-accent/15 px-4 py-2"><span className="text-sm">🎁</span><span className="font-display text-xs font-bold text-accent-foreground">{t("bonusClaimed")}</span></motion.div>}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mt-5 w-full max-w-xs">
        <button onClick={() => { setShowReveal(!showReveal); playTap(); }} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card p-3 shadow-soft font-display text-sm font-bold text-foreground">
          <Eye className="h-4 w-4" />{showReveal ? t("hideRoles") : t("whoWasWho")}
        </button>
        <AnimatePresence>
          {showReveal && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-3 space-y-2">
                {players.map((p, idx) => (
                  <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className={`flex items-center gap-3 rounded-xl p-3 ${p.role === "saboteur" ? "bg-destructive/10 ring-1 ring-destructive/20" : "bg-card"}`}>
                    <span className="text-xl">{p.emoji}</span>
                    <span className="flex-1 font-display text-sm font-bold text-foreground">{p.name}</span>
                    <span className={`rounded-full px-3 py-1 font-display text-xs font-bold ${p.role === "saboteur" ? "bg-destructive/20 text-destructive" : "bg-primary/10 text-primary"}`}>{p.role === "saboteur" ? t("saboteurRole") : t("agentRole")}</span>
                    {p.id !== "me" && <button onClick={(e) => { e.stopPropagation(); setReportTarget({ id: p.id, name: p.name }); playTap(); }} className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Flag className="h-3 w-3" /></button>}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} className="mt-6 w-full max-w-xs">
        <Button onClick={onBackToHome} className="h-14 w-full rounded-2xl gradient-primary text-primary-foreground font-display text-base font-bold shadow-soft">{t("backToHome")}</Button>
      </motion.div>

      <ReportPlayerModal isOpen={!!reportTarget} onClose={() => setReportTarget(null)} playerId={reportTarget?.id ?? ""} playerName={reportTarget?.name ?? ""} />
    </div>
  );
};

export default GameResultScreen;
