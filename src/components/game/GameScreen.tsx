import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import GameHUD from "./GameHUD";
import ZoneMap from "./ZoneMap";
import TaskMiniGame from "./TaskMiniGame";
import SabotagePanel from "./SabotagePanel";
import type { Zone, PlayerRole } from "@/types/game";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { playTimerUrgent, playRoundComplete } from "@/lib/sounds";

const ROUND_TIME = 90; // seconds per round
const TASKS_PER_ROUND = 6;
const TOTAL_ROUNDS = 3;
const SABOTAGE_DURATION = 15; // how long a zone stays sabotaged

type GameScreenProps = {
  role: PlayerRole;
  onGameEnd: (result: "agents-win" | "saboteur-wins") => void;
};

const GameScreen = ({ role, onGameEnd }: GameScreenProps) => {
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [totalTasksCompleted, setTotalTasksCompleted] = useState(0);
  const [sabotagedZones, setSabotagedZones] = useState<Zone[]>([]);
  const [completedZones, setCompletedZones] = useState<Zone[]>([]);
  const [activeTask, setActiveTask] = useState<Zone | null>(null);
  const [roundEnded, setRoundEnded] = useState(false);

  const tasksTotal = TASKS_PER_ROUND;
  const globalTasksTotal = TASKS_PER_ROUND * TOTAL_ROUNDS;

  // Round timer
  useEffect(() => {
    if (roundEnded || activeTask) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setRoundEnded(true);
          return 0;
        }
        if (t <= 6) playTimerUrgent();
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [roundEnded, activeTask]);

  // Sabotage timeout — clear sabotaged zones after duration
  useEffect(() => {
    if (sabotagedZones.length === 0) return;
    const timer = setTimeout(() => {
      setSabotagedZones((prev) => prev.slice(1));
    }, SABOTAGE_DURATION * 1000);
    return () => clearTimeout(timer);
  }, [sabotagedZones]);

  const handleSelectZone = useCallback(
    (zone: Zone) => {
      if (role === "saboteur") return; // saboteur uses panel
      if (sabotagedZones.includes(zone)) return; // can't enter sabotaged
      if (completedZones.includes(zone)) return; // already done
      setActiveTask(zone);
    },
    [role, sabotagedZones, completedZones]
  );

  const handleTaskComplete = useCallback(
    (success: boolean) => {
      if (success && activeTask) {
        setTasksCompleted((c) => c + 1);
        setTotalTasksCompleted((c) => c + 1);
        setCompletedZones((prev) => [...prev, activeTask]);
      }
      setActiveTask(null);
    },
    [activeTask]
  );

  const handleSabotage = useCallback((zone: Zone) => {
    setSabotagedZones((prev) => [...prev, zone]);
  }, []);

  const handleNextRound = useCallback(() => {
    if (round >= TOTAL_ROUNDS) {
      // Game over
      const agentsWin = totalTasksCompleted + tasksCompleted >= Math.floor(globalTasksTotal * 0.6);
      onGameEnd(agentsWin ? "agents-win" : "saboteur-wins");
      return;
    }
    setRound((r) => r + 1);
    setTimeLeft(ROUND_TIME);
    setTasksCompleted(0);
    setCompletedZones([]);
    setSabotagedZones([]);
    setRoundEnded(false);
  }, [round, totalTasksCompleted, tasksCompleted, globalTasksTotal, onGameEnd]);

  // Check round completion by tasks
  useEffect(() => {
    if (tasksCompleted >= tasksTotal && !roundEnded) {
      setRoundEnded(true);
      playRoundComplete();
    }
  }, [tasksCompleted, tasksTotal, roundEnded]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <GameHUD
        round={round}
        totalRounds={TOTAL_ROUNDS}
        timeLeft={timeLeft}
        tasksCompleted={totalTasksCompleted + tasksCompleted}
        tasksTotal={globalTasksTotal}
        role={role}
      />

      <ZoneMap
        onSelectZone={handleSelectZone}
        sabotagedZones={sabotagedZones}
        completedZones={completedZones}
      />

      {/* Saboteur controls */}
      {role === "saboteur" && !roundEnded && (
        <SabotagePanel
          onSabotage={handleSabotage}
          sabotagedZones={sabotagedZones}
        />
      )}

      {/* Active mini-game overlay */}
      <AnimatePresence>
        {activeTask && (
          <TaskMiniGame
            zone={activeTask}
            onComplete={handleTaskComplete}
            onCancel={() => setActiveTask(null)}
          />
        )}
      </AnimatePresence>

      {/* Round end overlay */}
      <AnimatePresence>
        {roundEnded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="flex flex-col items-center gap-4"
            >
              <span className="text-6xl">
                {tasksCompleted >= tasksTotal ? "🎉" : "⏰"}
              </span>
              <h2 className="font-display text-2xl font-black text-foreground">
                {round >= TOTAL_ROUNDS ? "¡Partida terminada!" : `Ronda {round} completada`}
              </h2>
              <p className="font-body text-sm text-muted-foreground text-center">
                Tareas completadas esta ronda: {tasksCompleted}/{tasksTotal}
              </p>
              <Button
                onClick={handleNextRound}
                className="h-14 w-full max-w-xs rounded-2xl gradient-primary text-primary-foreground font-display text-base font-bold shadow-soft"
              >
                {round >= TOTAL_ROUNDS ? "Ver resultados" : "Siguiente ronda →"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameScreen;
