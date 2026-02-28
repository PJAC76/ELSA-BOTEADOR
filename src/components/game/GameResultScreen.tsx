import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { PlayerRole } from "@/types/game";
import { playVictory, playDefeat } from "@/lib/sounds";
import { useToast } from "@/hooks/use-toast";
import { useProgressionStore, XP_REWARDS } from "@/stores/progression-store";
import { getUnlockedAchievements } from "@/stores/achievements";
import Confetti from "./Confetti";

type GameResultScreenProps = {
  result: "agents-win" | "saboteur-wins";
  myRole: PlayerRole;
  onBackToHome: () => void;
};

const GameResultScreen = ({ result, myRole, onBackToHome }: GameResultScreenProps) => {
  const { toast } = useToast();
  const hasRecorded = useRef(false);

  const iWon =
    (result === "agents-win" && myRole === "agent") ||
    (result === "saboteur-wins" && myRole === "saboteur");

  useEffect(() => {
    if (iWon) playVictory();
    else playDefeat();
  }, [iWon]);

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
      }, 1500 + idx * 800);
    });
  }, [iWon, toast]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      {iWon && <Confetti count={60} />}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="flex flex-col items-center gap-4"
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-card px-6 py-4 shadow-soft text-center"
        >
          <p className="font-display text-sm font-bold text-foreground mb-1">
            {result === "agents-win"
              ? "🕵️ Las Agentes ganan"
              : "💣 ELSA-BOTEADOR gana"}
          </p>
          <p className="font-body text-xs text-muted-foreground">
            {result === "agents-win"
              ? "¡Las tareas fueron completadas a tiempo!"
              : "¡El sabotaje fue demasiado efectivo!"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col items-center gap-2 mt-4"
        >
          <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
            <span className="text-sm">✨</span>
            <span className="font-display text-sm font-bold text-foreground">
              +{iWon ? 50 : 15} XP
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 w-full max-w-xs"
        >
          <Button
            onClick={onBackToHome}
            className="h-14 w-full rounded-2xl gradient-primary text-primary-foreground font-display text-base font-bold shadow-soft"
          >
            Volver al inicio
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GameResultScreen;
