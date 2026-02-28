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
import { Gift, Play, Star, Eye } from "lucide-react";

// Mock reveal data
const MOCK_PLAYERS = [
  { id: "me", name: "Tú", emoji: "🕵️", role: "agent" as PlayerRole },
  { id: "p2", name: "Luna_Star", emoji: "💃", role: "saboteur" as PlayerRole },
  { id: "p3", name: "MintChoco", emoji: "🧁", role: "agent" as PlayerRole },
  { id: "p4", name: "PixelQueen", emoji: "👑", role: "agent" as PlayerRole },
  { id: "p5", name: "StarGirl", emoji: "⭐", role: "agent" as PlayerRole },
];

type GameResultScreenProps = {
  result: "agents-win" | "saboteur-wins";
  myRole: PlayerRole;
  onBackToHome: () => void;
};

const GameResultScreen = ({ result, myRole, onBackToHome }: GameResultScreenProps) => {
  const { toast } = useToast();
  const hasRecorded = useRef(false);
  const [showReveal, setShowReveal] = useState(false);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [xpAnimated, setXpAnimated] = useState(0);

  const iWon =
    (result === "agents-win" && myRole === "agent") ||
    (result === "saboteur-wins" && myRole === "saboteur");

  const xpEarned = iWon ? XP_REWARDS.WIN : XP_REWARDS.LOSS;

  useEffect(() => {
    if (iWon) playVictory();
    else playDefeat();
  }, [iWon]);

  // Record game + check achievements
  useEffect(() => {
    if (hasRecorded.current) return;
    hasRecorded.current = true;

    const store = useProgressionStore.getState();
    const before = getUnlockedAchievements({
      gamesPlayed: store.gamesPlayed,
      gamesWon: store.gamesWon,
      totalXp: store.totalXp,
    });

    store.recordGame(iWon);
    useChallengesStore.getState().recordWeeklyGame(iWon);

    const updated = useProgressionStore.getState();
    const after = getUnlockedAchievements({
      gamesPlayed: updated.gamesPlayed,
      gamesWon: updated.gamesWon,
      totalXp: updated.totalXp,
    });

    const newlyUnlocked = after.filter(
      (a, i) => a.unlocked && !before[i].unlocked
    );

    newlyUnlocked.forEach((item, idx) => {
      setTimeout(() => {
        toast({
          title: `${item.achievement.emoji} ¡Logro desbloqueado!`,
          description: `${item.achievement.name} — ${item.achievement.description}`,
        });
      }, 2500 + idx * 800);
    });
  }, [iWon, toast]);

  // Animate XP counter
  useEffect(() => {
    let frame = 0;
    const totalFrames = 30;
    const interval = setInterval(() => {
      frame++;
      setXpAnimated(Math.round((frame / totalFrames) * xpEarned));
      if (frame >= totalFrames) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [xpEarned]);

  const handleBonusVideo = () => {
    playTap();
    // Mock rewarded video: just grant bonus immediately
    setBonusClaimed(true);
    useProgressionStore.getState().addXp(15);
    toast({
      title: "🎁 ¡Bonus reclamado!",
      description: "+15 XP extra por ver el video",
    });
  };

  const { totalXp } = useProgressionStore();
  const level = getLevelForXp(totalXp);
  const { progress } = getXpForCurrentLevel(totalXp);

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-6 py-8 safe-top safe-bottom overflow-y-auto">
      {iWon && <Confetti count={60} />}

      {/* Victory/Defeat header */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="flex flex-col items-center gap-3 mt-8"
      >
        <motion.span
          className="text-7xl"
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {iWon ? "🏆" : "😢"}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display text-3xl font-black text-foreground text-center"
        >
          {iWon ? "¡Victoria!" : "Derrota"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="font-body text-sm text-muted-foreground text-center"
        >
          {result === "agents-win"
            ? "🕵️ Las Agentes completaron las tareas"
            : "💣 ELSA-BOTEADOR saboteó la misión"}
        </motion.p>
      </motion.div>

      {/* XP + Level section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 w-full max-w-xs"
      >
        <div className="rounded-2xl bg-card p-5 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-campus-yellow" />
              <span className="font-display text-lg font-black text-foreground">
                +{xpAnimated} XP
              </span>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 font-display text-xs font-bold text-primary">
              Nivel {level}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-campus-yellow"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Rewarded video bonus */}
      <AnimatePresence>
        {!bonusClaimed && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.9 }}
            className="mt-4 w-full max-w-xs"
          >
            <button
              onClick={handleBonusVideo}
              className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-campus-yellow/20 to-campus-peach/20 p-4 shadow-soft transition-all active:scale-[0.97]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-warm">
                <Gift className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-display text-sm font-bold text-foreground">
                  ¡Bonus gratis!
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  Ve un video y gana +15 XP extra
                </p>
              </div>
              <Play className="h-5 w-5 text-muted-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {bonusClaimed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-center gap-2 rounded-full bg-accent/15 px-4 py-2"
        >
          <span className="text-sm">🎁</span>
          <span className="font-display text-xs font-bold text-accent-foreground">
            +15 XP bonus reclamado
          </span>
        </motion.div>
      )}

      {/* Role reveal section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="mt-5 w-full max-w-xs"
      >
        <button
          onClick={() => { setShowReveal(!showReveal); playTap(); }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card p-3 shadow-soft font-display text-sm font-bold text-foreground"
        >
          <Eye className="h-4 w-4" />
          {showReveal ? "Ocultar roles" : "¿Quién era quién?"}
        </button>

        <AnimatePresence>
          {showReveal && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2">
                {MOCK_PLAYERS.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex items-center gap-3 rounded-xl p-3 ${
                      p.role === "saboteur"
                        ? "bg-destructive/10 ring-1 ring-destructive/20"
                        : "bg-card"
                    }`}
                  >
                    <span className="text-xl">{p.emoji}</span>
                    <span className="flex-1 font-display text-sm font-bold text-foreground">
                      {p.name}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 font-display text-xs font-bold ${
                        p.role === "saboteur"
                          ? "bg-destructive/20 text-destructive"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {p.role === "saboteur" ? "💣 Saboteadora" : "🕵️ Agente"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="mt-6 w-full max-w-xs"
      >
        <Button
          onClick={onBackToHome}
          className="h-14 w-full rounded-2xl gradient-primary text-primary-foreground font-display text-base font-bold shadow-soft"
        >
          Volver al inicio
        </Button>
      </motion.div>
    </div>
  );
};

export default GameResultScreen;
