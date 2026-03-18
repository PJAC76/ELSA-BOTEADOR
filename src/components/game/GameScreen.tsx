import { useState, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import GameHUD from "./GameHUD";
import ZoneMap from "./ZoneMap";
import TaskMiniGame from "./TaskMiniGame";
import SabotagePanel from "./SabotagePanel";
import MeetingScreen from "./MeetingScreen";
import EmergencyButton from "./EmergencyButton";
import GameTutorialOverlay from "./GameTutorialOverlay";
import type { Zone, PlayerRole } from "@/types/game";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { playTimerUrgent, playRoundComplete } from "@/lib/sounds";
import { useTranslation } from "@/lib/i18n";
import { getRandomWord, resetCategoryRotation } from "@/data/secret-words";
import { useProgressionStore, XP_REWARDS } from "@/stores/progression-store";

const ROUND_TIME = 90;
const TASKS_PER_ROUND = 6;
const TOTAL_ROUNDS = 3;
const SABOTAGE_DURATION = 15;

type GamePhase = "action" | "meeting" | "round-summary";
type WordGuessInfo = { playerName: string; playerEmoji: string };
type SecretWordInfo = { round: number; word: string; category: string };
type GameScreenProps = { role: PlayerRole; onGameEnd: (result: "agents-win" | "saboteur-wins", wordGuessers: WordGuessInfo[], secretWords: SecretWordInfo[]) => void };

const GameScreen = ({ role, onGameEnd }: GameScreenProps) => {
  const { t, language } = useTranslation();
  const [round, setRound] = useState(() => { resetCategoryRotation(); return 1; });
  const [phase, setPhase] = useState<GamePhase>("action");
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [totalTasksCompleted, setTotalTasksCompleted] = useState(0);
  const [sabotagedZones, setSabotagedZones] = useState<Zone[]>([]);
  const [completedZones, setCompletedZones] = useState<Zone[]>([]);
  const [activeTask, setActiveTask] = useState<Zone | null>(null);
  const [eliminatedPlayers, setEliminatedPlayers] = useState<string[]>([]);
  const [currentZone, setCurrentZone] = useState<Zone>("library");
  const [showTutorial, setShowTutorial] = useState(true);
  const [wordGuessers, setWordGuessers] = useState<WordGuessInfo[]>([]);
  const [secretWords, setSecretWords] = useState<SecretWordInfo[]>([]);

  // Secret word per round
  const roundWord = useMemo(() => getRandomWord(round - 1), [round]);
  const secretWord = language === "en" ? roundWord.wordEn : roundWord.word;
  const secretCategory = language === "en" ? roundWord.categoryEn : roundWord.category;
  const secretClues = language === "en" ? roundWord.cluesEn : roundWord.clues;

  const MOCK_ZONES: Zone[] = ["library", "cafeteria", "auditorium", "lab", "gym", "garden"];
  const mockPlayerZones: Record<string, Zone> = { me: currentZone, p2: MOCK_ZONES[Math.floor(round * 1.3) % 6], p3: MOCK_ZONES[Math.floor(round * 2.7) % 6], p4: MOCK_ZONES[Math.floor(round * 0.5) % 6], p5: MOCK_ZONES[Math.floor(round * 3.1) % 6] };
  const tasksTotal = TASKS_PER_ROUND;
  const globalTasksTotal = TASKS_PER_ROUND * TOTAL_ROUNDS;

  useEffect(() => {
    if (phase !== "action" || activeTask) return;
    const interval = setInterval(() => { setTimeLeft((tl) => { if (tl <= 1) { setPhase("meeting"); return 0; } if (tl <= 6) playTimerUrgent(); return tl - 1; }); }, 1000);
    return () => clearInterval(interval);
  }, [phase, activeTask]);

  useEffect(() => {
    if (sabotagedZones.length === 0) return;
    const timer = setTimeout(() => setSabotagedZones((prev) => prev.slice(1)), SABOTAGE_DURATION * 1000);
    return () => clearTimeout(timer);
  }, [sabotagedZones]);

  const handleSelectZone = useCallback((zone: Zone) => { setCurrentZone(zone); if (role === "saboteur") return; if (sabotagedZones.includes(zone)) return; if (completedZones.includes(zone)) return; setActiveTask(zone); }, [role, sabotagedZones, completedZones]);
  const handleEmergency = useCallback(() => { if (phase === "action") setPhase("meeting"); }, [phase]);
  const handleTaskComplete = useCallback((success: boolean) => { if (success && activeTask) { setTasksCompleted((c) => c + 1); setTotalTasksCompleted((c) => c + 1); setCompletedZones((prev) => [...prev, activeTask]); } setActiveTask(null); }, [activeTask]);
  const handleSabotage = useCallback((zone: Zone) => { setSabotagedZones((prev) => [...prev, zone]); }, []);

  useEffect(() => { if (tasksCompleted >= tasksTotal && phase === "action") { playRoundComplete(); setPhase("meeting"); } }, [tasksCompleted, tasksTotal, phase]);

  const handleVoteResult = useCallback((eliminatedId: string | null) => { if (eliminatedId) setEliminatedPlayers((prev) => [...prev, eliminatedId]); setPhase("round-summary"); }, []);

  const addXp = useProgressionStore((s) => s.addXp);
  const handleWordGuessed = useCallback((playerName?: string, playerEmoji?: string) => {
    addXp(XP_REWARDS.WORD_GUESS);
    if (playerName && playerEmoji) {
      setWordGuessers((prev) => [...prev, { playerName, playerEmoji }]);
    }
  }, [addXp]);

  // Track secret word for current round when entering meeting
  useEffect(() => {
    if (phase === "meeting") {
      setSecretWords((prev) => {
        if (prev.some((sw) => sw.round === round)) return prev;
        return [...prev, { round, word: secretWord, category: secretCategory }];
      });
    }
  }, [phase, round, secretWord, secretCategory]);

  const handleNextRound = useCallback(() => {
    if (round >= TOTAL_ROUNDS) { onGameEnd(totalTasksCompleted + tasksCompleted >= Math.floor(globalTasksTotal * 0.6) ? "agents-win" : "saboteur-wins", wordGuessers, secretWords); return; }
    setRound((r) => r + 1); setTimeLeft(ROUND_TIME); setTasksCompleted(0); setCompletedZones([]); setSabotagedZones([]); setPhase("action");
  }, [round, totalTasksCompleted, tasksCompleted, globalTasksTotal, onGameEnd, wordGuessers, secretWords]);

  return (
    <AnimatePresence mode="wait">
      {phase === "meeting" ? (
        <motion.div key={`meeting-${round}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }} className="min-h-screen">
          <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.6, delay: 0.8 }} className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-background" style={{ pointerEvents: "none" }}>
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: [0, 1.3, 1], rotate: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} className="flex flex-col items-center gap-3">
              <span className="text-7xl">🚨</span>
              <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="font-display text-2xl font-black text-foreground">{t("emergencyMeeting")}!</motion.h2>
            </motion.div>
          </motion.div>
          <MeetingScreen
            round={round}
            players={[]}
            myPlayerId="me"
            isGhost={false}
            playerZones={mockPlayerZones}
            onVoteResult={handleVoteResult}
            onWordGuessed={handleWordGuessed}
            secretWord={role === "saboteur" ? null : secretWord}
            secretCategory={secretCategory}
            secretClues={role === "saboteur" ? [] : secretClues}
            myRole={role}
          />
        </motion.div>
      ) : (
        <motion.div key={`action-${round}`} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -30, filter: "blur(8px)" }} transition={{ duration: 0.5 }} className="flex min-h-screen flex-col bg-background">
          <GameHUD
            round={round}
            totalRounds={TOTAL_ROUNDS}
            timeLeft={timeLeft}
            tasksCompleted={totalTasksCompleted + tasksCompleted}
            tasksTotal={globalTasksTotal}
            role={role}
            secretWord={role === "saboteur" ? null : secretWord}
            secretCategory={secretCategory}
          />
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <ZoneMap onSelectZone={handleSelectZone} sabotagedZones={sabotagedZones} completedZones={completedZones} />
          </motion.div>
          {role === "saboteur" && phase === "action" && <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}><SabotagePanel onSabotage={handleSabotage} sabotagedZones={sabotagedZones} /></motion.div>}
          {phase === "action" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex items-center justify-center gap-3 px-4 pb-4">
              <EmergencyButton onEmergency={handleEmergency} />
              <button onClick={() => setShowTutorial(true)} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-card shadow-soft text-muted-foreground" aria-label="Tutorial"><HelpCircle className="h-5 w-5" /></button>
            </motion.div>
          )}
          <AnimatePresence>{activeTask && <TaskMiniGame zone={activeTask} onComplete={handleTaskComplete} onCancel={() => setActiveTask(null)} />}</AnimatePresence>
          <AnimatePresence>
            {phase === "round-summary" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1, filter: "blur(6px)" }} transition={{ duration: 0.5 }} className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm px-6">
                <motion.div className="absolute inset-0 opacity-10" initial={{ scale: 0 }} animate={{ scale: [0, 2, 2.5] }} transition={{ duration: 1.2, ease: "easeOut" }}><div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" /></motion.div>
                <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.15 }} className="relative flex flex-col items-center gap-4">
                  <motion.span className="text-6xl" animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 0.8, delay: 0.4 }}>{tasksCompleted >= tasksTotal ? "🎉" : "⏰"}</motion.span>
                  <motion.h2 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="font-display text-2xl font-black text-foreground">
                    {round >= TOTAL_ROUNDS ? t("gameOver") : `${t("round")} ${round} ${t("roundCompleted")}`}
                  </motion.h2>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="font-body text-sm text-muted-foreground text-center">{t("tasksThisRound")}: {tasksCompleted}/{tasksTotal}</motion.p>
                  {eliminatedPlayers.length > 0 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="font-body text-xs text-muted-foreground">{t("eliminatedPlayers")}: {eliminatedPlayers.length}</motion.p>}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="w-full max-w-xs">
                    <Button onClick={handleNextRound} className="h-14 w-full rounded-2xl gradient-primary text-primary-foreground font-display text-base font-bold shadow-soft">{round >= TOTAL_ROUNDS ? t("seeResults") : t("nextRound")}</Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>{showTutorial && <GameTutorialOverlay role={role} onClose={() => setShowTutorial(false)} />}</AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameScreen;
