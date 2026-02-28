import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import GameHUD from "./GameHUD";
import ZoneMap from "./ZoneMap";
import TaskMiniGame from "./TaskMiniGame";
import SabotagePanel from "./SabotagePanel";
import MeetingScreen from "./MeetingScreen";
import EmergencyButton from "./EmergencyButton";
import type { Zone, PlayerRole } from "@/types/game";
import { ZONE_INFO } from "@/types/game";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { playTimerUrgent, playRoundComplete } from "@/lib/sounds";

const ROUND_TIME = 90; // seconds per round
const TASKS_PER_ROUND = 6;
const TOTAL_ROUNDS = 3;
const SABOTAGE_DURATION = 15; // how long a zone stays sabotaged

type GamePhase = "action" | "meeting" | "round-summary";

type GameScreenProps = {
  role: PlayerRole;
  onGameEnd: (result: "agents-win" | "saboteur-wins") => void;
};

const GameScreen = ({ role, onGameEnd }: GameScreenProps) => {
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<GamePhase>("action");
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [totalTasksCompleted, setTotalTasksCompleted] = useState(0);
  const [sabotagedZones, setSabotagedZones] = useState<Zone[]>([]);
  const [completedZones, setCompletedZones] = useState<Zone[]>([]);
  const [activeTask, setActiveTask] = useState<Zone | null>(null);
  const [eliminatedPlayers, setEliminatedPlayers] = useState<string[]>([]);
  const [currentZone, setCurrentZone] = useState<Zone>("library");

  // Mock player zone tracking for meeting display
  const MOCK_ZONES: Zone[] = ["library", "cafeteria", "auditorium", "lab", "gym", "garden"];
  const mockPlayerZones: Record<string, Zone> = {
    me: currentZone,
    p2: MOCK_ZONES[Math.floor(round * 1.3) % 6],
    p3: MOCK_ZONES[Math.floor(round * 2.7) % 6],
    p4: MOCK_ZONES[Math.floor(round * 0.5) % 6],
    p5: MOCK_ZONES[Math.floor(round * 3.1) % 6],
  };

  const tasksTotal = TASKS_PER_ROUND;
  const globalTasksTotal = TASKS_PER_ROUND * TOTAL_ROUNDS;

  // Round timer (only during action phase)
  useEffect(() => {
    if (phase !== "action" || activeTask) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Round time up → go to meeting
          setPhase("meeting");
          return 0;
        }
        if (t <= 6) playTimerUrgent();
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, activeTask]);

  // Sabotage timeout
  useEffect(() => {
    if (sabotagedZones.length === 0) return;
    const timer = setTimeout(() => {
      setSabotagedZones((prev) => prev.slice(1));
    }, SABOTAGE_DURATION * 1000);
    return () => clearTimeout(timer);
  }, [sabotagedZones]);

  const handleSelectZone = useCallback(
    (zone: Zone) => {
      setCurrentZone(zone);
      if (role === "saboteur") return;
      if (sabotagedZones.includes(zone)) return;
      if (completedZones.includes(zone)) return;
      setActiveTask(zone);
    },
    [role, sabotagedZones, completedZones]
  );

  const handleEmergency = useCallback(() => {
    if (phase === "action") {
      setPhase("meeting");
    }
  }, [phase]);

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

  // Check round completion by tasks → go to meeting
  useEffect(() => {
    if (tasksCompleted >= tasksTotal && phase === "action") {
      playRoundComplete();
      setPhase("meeting");
    }
  }, [tasksCompleted, tasksTotal, phase]);

  // Handle meeting vote result
  const handleVoteResult = useCallback(
    (eliminatedId: string | null) => {
      if (eliminatedId) {
        setEliminatedPlayers((prev) => [...prev, eliminatedId]);
      }
      // Show round summary briefly, then advance
      setPhase("round-summary");
    },
    []
  );

  // Handle next round from summary
  const handleNextRound = useCallback(() => {
    if (round >= TOTAL_ROUNDS) {
      const agentsWin =
        totalTasksCompleted + tasksCompleted >= Math.floor(globalTasksTotal * 0.6);
      onGameEnd(agentsWin ? "agents-win" : "saboteur-wins");
      return;
    }
    setRound((r) => r + 1);
    setTimeLeft(ROUND_TIME);
    setTasksCompleted(0);
    setCompletedZones([]);
    setSabotagedZones([]);
    setPhase("action");
  }, [round, totalTasksCompleted, tasksCompleted, globalTasksTotal, onGameEnd]);

  // --- Render with AnimatePresence for phase transitions ---
  return (
    <AnimatePresence mode="wait">
      {phase === "meeting" ? (
        <motion.div
          key={`meeting-${round}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen"
        >
          {/* Cinematic meeting entrance overlay */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-background"
            style={{ pointerEvents: "none" }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: [0, 1.3, 1], rotate: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex flex-col items-center gap-3"
            >
              <span className="text-7xl">🚨</span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-display text-2xl font-black text-foreground"
              >
                ¡Reunión de emergencia!
              </motion.h2>
            </motion.div>
          </motion.div>

          <MeetingScreen
            round={round}
            players={[]}
            myPlayerId="me"
            isGhost={false}
            playerZones={mockPlayerZones}
            onVoteResult={handleVoteResult}
          />
        </motion.div>
      ) : (
        <motion.div
          key={`action-${round}`}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, y: -30, filter: "blur(8px)" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex min-h-screen flex-col bg-background"
        >
          <GameHUD
            round={round}
            totalRounds={TOTAL_ROUNDS}
            timeLeft={timeLeft}
            tasksCompleted={totalTasksCompleted + tasksCompleted}
            tasksTotal={globalTasksTotal}
            role={role}
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ZoneMap
              onSelectZone={handleSelectZone}
              sabotagedZones={sabotagedZones}
              completedZones={completedZones}
            />
          </motion.div>

          {/* Saboteur controls */}
          {role === "saboteur" && phase === "action" && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <SabotagePanel
                onSabotage={handleSabotage}
                sabotagedZones={sabotagedZones}
              />
            </motion.div>
          )}

          {/* Emergency button */}
          {phase === "action" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center px-4 pb-4"
            >
              <EmergencyButton onEmergency={handleEmergency} />
            </motion.div>
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

          {/* Round summary overlay */}
          <AnimatePresence>
            {phase === "round-summary" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.1, filter: "blur(6px)" }}
                transition={{ duration: 0.5 }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm px-6"
              >
                {/* Decorative background pulse */}
                <motion.div
                  className="absolute inset-0 opacity-10"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 2, 2.5] }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                >
                  <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
                </motion.div>

                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.15 }}
                  className="relative flex flex-col items-center gap-4"
                >
                  <motion.span
                    className="text-6xl"
                    animate={{ 
                      y: [0, -20, 0],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    {tasksCompleted >= tasksTotal ? "🎉" : "⏰"}
                  </motion.span>
                  <motion.h2
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="font-display text-2xl font-black text-foreground"
                  >
                    {round >= TOTAL_ROUNDS
                      ? "¡Partida terminada!"
                      : `Ronda ${round} completada`}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="font-body text-sm text-muted-foreground text-center"
                  >
                    Tareas completadas esta ronda: {tasksCompleted}/{tasksTotal}
                  </motion.p>
                  {eliminatedPlayers.length > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="font-body text-xs text-muted-foreground"
                    >
                      Jugadoras eliminadas: {eliminatedPlayers.length}
                    </motion.p>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="w-full max-w-xs"
                  >
                    <Button
                      onClick={handleNextRound}
                      className="h-14 w-full rounded-2xl gradient-primary text-primary-foreground font-display text-base font-bold shadow-soft"
                    >
                      {round >= TOTAL_ROUNDS ? "Ver resultados" : "Siguiente ronda →"}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameScreen;
