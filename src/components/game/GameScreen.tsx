import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import GameHUD from "./GameHUD";
import ZoneMap from "./ZoneMap";
import TaskMiniGame from "./TaskMiniGame";
import SabotagePanel from "./SabotagePanel";
import MeetingScreen from "./MeetingScreen";
import EmergencyButton from "./EmergencyButton";
import GameTutorialOverlay from "./GameTutorialOverlay";
import ReactionsPanel from "./ReactionsPanel";
import MeetingPendingOverlay from "./MeetingPendingOverlay";
import type { Zone, PlayerRole } from "@/types/game";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { playTimerUrgent, playRoundComplete } from "@/lib/sounds";
import { useTranslation } from "@/lib/i18n";
import { getRandomWord, resetCategoryRotation } from "@/data/secret-words";
import { useProgressionStore, XP_REWARDS } from "@/stores/progression-store";
import { useMatch, moveToZone, completeTask, sabotageZone, advanceRoundPhase, type VoteResolveResult } from "@/hooks/use-match";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Persistent guard so advanceRoundPhase fires AT MOST once per (round, user)
// across remounts, hot reloads or accidental re-renders.
const ADVANCE_GUARD_KEY = "match:advanceFired";
const hasAdvancedFor = (roundId: string, userId: string): boolean => {
  try {
    const raw = sessionStorage.getItem(ADVANCE_GUARD_KEY);
    if (!raw) return false;
    const map = JSON.parse(raw) as Record<string, true>;
    return !!map[`${roundId}:${userId}`];
  } catch { return false; }
};
const markAdvancedFor = (roundId: string, userId: string) => {
  try {
    const raw = sessionStorage.getItem(ADVANCE_GUARD_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, true>) : {};
    map[`${roundId}:${userId}`] = true;
    // Keep it bounded: drop oldest if it grows too big
    const keys = Object.keys(map);
    if (keys.length > 50) {
      for (const k of keys.slice(0, keys.length - 50)) delete map[k];
    }
    sessionStorage.setItem(ADVANCE_GUARD_KEY, JSON.stringify(map));
  } catch { /* noop */ }
};
const clearAdvancedFor = (roundId: string, userId: string) => {
  try {
    const raw = sessionStorage.getItem(ADVANCE_GUARD_KEY);
    if (!raw) return;
    const map = JSON.parse(raw) as Record<string, true>;
    delete map[`${roundId}:${userId}`];
    sessionStorage.setItem(ADVANCE_GUARD_KEY, JSON.stringify(map));
  } catch { /* noop */ }
};

const ROUND_TIME = 90;
const TASKS_PER_ROUND = 6;
const TOTAL_ROUNDS = 3;
const SABOTAGE_DURATION = 15;

const ZONE_ORDER: Zone[] = ["library", "cafeteria", "auditorium", "lab", "gym", "garden"];
const zoneToIndex = (z: Zone) => ZONE_ORDER.indexOf(z) + 1;
const indexToZone = (i: number): Zone => ZONE_ORDER[Math.max(0, Math.min(5, i - 1))];

type GamePhase = "action" | "meeting" | "round-summary";
type WordGuessInfo = { playerName: string; playerEmoji: string };
type SecretWordInfo = { round: number; word: string; category: string };
export type GameStats = { tasksCompleted: number; zonesVisited: number; cluesGiven: number };
type GameScreenProps = { role: PlayerRole; matchId?: string | null; onGameEnd: (result: "agents-win" | "saboteur-wins", wordGuessers: WordGuessInfo[], secretWords: SecretWordInfo[], gameStats: GameStats) => void };

const GameScreen = ({ role, matchId, onGameEnd }: GameScreenProps) => {
  const { t, language } = useTranslation();
  const { match, players: matchPlayers, round: matchRound, tasks: matchTasks, sabotages: matchSabotages } = useMatch(matchId ?? null);
  const isOnline = !!matchId;

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
  const [showTutorial, setShowTutorial] = useState(() => {
    const seen = localStorage.getItem("tutorial_seen");
    return !seen;
  });

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem("tutorial_seen", "1");
  };
  const [wordGuessers, setWordGuessers] = useState<WordGuessInfo[]>([]);
  const [secretWords, setSecretWords] = useState<SecretWordInfo[]>([]);
  const [zonesVisited, setZonesVisited] = useState<Set<Zone>>(new Set(["library"]));
  const [cluesGiven, setCluesGiven] = useState(0);

  // Online: derive sabotaged + completed zones + tasksCompleted from realtime data
  useEffect(() => {
    if (!isOnline) return;
    const now = Date.now();
    const activeSab = matchSabotages.filter(s => new Date(s.expires_at).getTime() > now);
    setSabotagedZones(activeSab.map(s => indexToZone(s.zone)));
    // A zone is "completed" only when it has tasks AND all of them are done.
    const tasksByZone = new Map<number, { total: number; done: number }>();
    for (const tk of matchTasks) {
      const e = tasksByZone.get(tk.zone) ?? { total: 0, done: 0 };
      e.total += 1;
      if (tk.is_completed) e.done += 1;
      tasksByZone.set(tk.zone, e);
    }
    const doneZones: Zone[] = [];
    tasksByZone.forEach((v, zoneIdx) => {
      if (v.total > 0 && v.done >= v.total) doneZones.push(indexToZone(zoneIdx));
    });
    setCompletedZones(doneZones);
    setTasksCompleted(matchTasks.filter(t => t.is_completed).length);
    if (matchRound) setRound(matchRound.round_number);
  }, [isOnline, matchSabotages, matchTasks, matchRound]);

  // Pending task count per zone (for the ZoneMap badge).
  const pendingTasksByZone = useMemo(() => {
    if (!isOnline) return undefined;
    const counts: Partial<Record<Zone, number>> = {};
    for (const tk of matchTasks) {
      if (tk.is_completed) continue;
      const z = indexToZone(tk.zone);
      counts[z] = (counts[z] ?? 0) + 1;
    }
    return counts;
  }, [isOnline, matchTasks]);

  // Online: sync phase from server (rounds.phase). Local "round-summary" is preserved
  // because the server only knows action/meeting/voting.
  // SFX guard: track the last (roundId, phase) we observed from the server so the
  // round-complete sound fires EXACTLY once per real action→meeting transition,
  // never on client re-renders, hot reloads, or refetches.
  const lastServerPhaseRef = useRef<{ roundId: string; phase: string } | null>(null);
  // Timestamp (ms) when the server flipped the round to "meeting". Used by the
  // pending overlay so the player whose minigame is still open can see how long
  // the rest of the group has been waiting.
  const [meetingTriggeredAtMs, setMeetingTriggeredAtMs] = useState<number | null>(null);

  useEffect(() => {
    if (!isOnline || !matchRound) return;
    const prev = lastServerPhaseRef.current;
    const isNewServerState =
      !prev || prev.roundId !== matchRound.id || prev.phase !== matchRound.phase;

    if (isNewServerState) {
      const wasActionForSameRound = prev?.roundId === matchRound.id && prev.phase === "action";
      if (matchRound.phase === "meeting" && wasActionForSameRound) {
        playRoundComplete();
        setMeetingTriggeredAtMs(Date.now());
      }
      if (matchRound.phase === "action") {
        // New round: clear any pending-overlay state from the previous one.
        setMeetingTriggeredAtMs(null);
      }
      lastServerPhaseRef.current = { roundId: matchRound.id, phase: matchRound.phase };
    }

    // Mirror server phase into local state, but DEFER the action→meeting flip
    // while a minigame is still open. This keeps the player on the action UI
    // (with the pending overlay) until they finish or cancel the task.
    setPhase((current) => {
      if (matchRound.phase === "meeting" && current === "action") {
        if (activeTask) return current; // hold; overlay will be shown
        return "meeting";
      }
      if (matchRound.phase === "action" && current === "meeting") return "action";
      return current;
    });
  }, [isOnline, matchRound, activeTask]);

  // When the active task closes after the server already moved to meeting,
  // promote the local phase so the meeting screen renders immediately.
  useEffect(() => {
    if (!isOnline) return;
    if (!activeTask && matchRound?.phase === "meeting" && phase === "action") {
      setPhase("meeting");
    }
  }, [isOnline, activeTask, matchRound?.phase, phase]);

  // Server-authoritative meeting → action: when vote-resolve creates a new
  // action round, the realtime subscription delivers it here. Transition out
  // of "round-summary" or "meeting" and reset per-round local state. The
  // server already created tasks for the new round.
  const lastSyncedRoundNumberRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isOnline || !matchRound) return;
    if (lastSyncedRoundNumberRef.current === null) {
      lastSyncedRoundNumberRef.current = matchRound.round_number;
      return;
    }
    if (
      matchRound.phase === "action" &&
      matchRound.round_number > lastSyncedRoundNumberRef.current
    ) {
      lastSyncedRoundNumberRef.current = matchRound.round_number;
      setRound(matchRound.round_number);
      setTimeLeft(ROUND_TIME);
      setTasksCompleted(0);
      setCompletedZones([]);
      setSabotagedZones([]);
      setActiveTask(null);
      setPhase("action");
    }
  }, [isOnline, matchRound]);

  // Secret word per round
  const roundWord = useMemo(() => getRandomWord(round - 1), [round]);
  const secretWord = language === "en" ? roundWord.wordEn : roundWord.word;
  const secretCategory = language === "en" ? roundWord.categoryEn : roundWord.category;
  const secretClues = language === "en" ? roundWord.cluesEn : roundWord.clues;

  // Auth user id (used by online sync below + timer guard).
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => { if (active) setAuthUserId(data.user?.id ?? null); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthUserId(session?.user?.id ?? null);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  const MOCK_ZONES: Zone[] = ["library", "cafeteria", "auditorium", "lab", "gym", "garden"];
  const mockPlayerZones: Record<string, Zone> = isOnline
    ? Object.fromEntries(matchPlayers.map(p => [p.id, indexToZone(p.current_zone)]))
    : { me: currentZone, p2: MOCK_ZONES[Math.floor(round * 1.3) % 6], p3: MOCK_ZONES[Math.floor(round * 2.7) % 6], p4: MOCK_ZONES[Math.floor(round * 0.5) % 6], p5: MOCK_ZONES[Math.floor(round * 3.1) % 6] };

  // Authoritative zone occupancy for the map (online: from match_players via Realtime).
  const zoneMapPlayers = useMemo(() => {
    if (!isOnline) {
      return [
        { id: "me", name: t("you"), emoji: "🕵️", zone: currentZone, isMe: true, isAlive: true },
        { id: "p2", name: "Luna", emoji: "🦊", zone: MOCK_ZONES[Math.floor(round * 1.3) % 6], isAlive: true },
        { id: "p3", name: "Mia", emoji: "🐱", zone: MOCK_ZONES[Math.floor(round * 2.7) % 6], isAlive: true },
        { id: "p4", name: "Zoe", emoji: "🐻", zone: MOCK_ZONES[Math.floor(round * 0.5) % 6], isAlive: true },
        { id: "p5", name: "Ava", emoji: "🦄", zone: MOCK_ZONES[Math.floor(round * 3.1) % 6], isAlive: true },
      ];
    }
    const BOT_EMOJIS = ["🦊", "🐱", "🐻", "🦄", "🐰", "🐼", "🦁", "🐨", "🐯", "🐸"];
    return matchPlayers.map((p, i) => ({
      id: p.id,
      name: p.is_bot ? (p.bot_name ?? "Bot") : (p.user_id === authUserId ? t("you") : "Jugadora"),
      emoji: p.is_bot ? BOT_EMOJIS[i % BOT_EMOJIS.length] : "🕵️",
      zone: indexToZone(p.current_zone),
      isMe: !!authUserId && p.user_id === authUserId,
      isAlive: p.is_alive,
    }));
  }, [isOnline, matchPlayers, authUserId, currentZone, round, t]);

  // Online: sync local currentZone from server (so refreshes / cross-device match).
  useEffect(() => {
    if (!isOnline || !authUserId) return;
    const me = matchPlayers.find((p) => p.user_id === authUserId);
    if (!me) return;
    const z = indexToZone(me.current_zone);
    setCurrentZone((prev) => (prev === z ? prev : z));
  }, [isOnline, authUserId, matchPlayers]);

  const tasksTotal = TASKS_PER_ROUND;
  const globalTasksTotal = TASKS_PER_ROUND * TOTAL_ROUNDS;

  // Server-authoritative timer: derive from rounds.ends_at without drift.
  // When the timer hits 0, ask the server to advance the phase. Do NOT optimistically
  // flip locally — wait for the realtime update so all clients transition together.
  // Persistent guard (sessionStorage) keyed by round.id + user.id ensures we only
  // fire advanceRoundPhase ONCE per client even across remounts/hot reloads.

  useEffect(() => {
    if (phase !== "action" || activeTask) return;

    if (isOnline && matchRound?.ends_at && matchId) {
      const endsAt = new Date(matchRound.ends_at).getTime();
      const roundId = matchRound.id;
      const guardUser = authUserId ?? "anon";
      let urgentPlayed = false;

      const tick = () => {
        const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining > 0 && remaining <= 6 && !urgentPlayed) {
          urgentPlayed = true;
          playTimerUrgent();
        }
        if (remaining <= 0 && !hasAdvancedFor(roundId, guardUser)) {
          markAdvancedFor(roundId, guardUser);
          advanceRoundPhase(matchId, "meeting").catch((e) => {
            // Transient error: clear the mark so a retry can happen on the next tick
            console.warn("[advanceRoundPhase]", e);
            clearAdvancedFor(roundId, guardUser);
          });
        }
      };
      tick();
      const interval = setInterval(tick, 250);
      return () => clearInterval(interval);
    }

    // Offline fallback (single-player / bots): local countdown
    const interval = setInterval(() => {
      setTimeLeft((tl) => {
        if (tl <= 1) { setPhase("meeting"); return 0; }
        if (tl <= 6) playTimerUrgent();
        return tl - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, activeTask, isOnline, matchRound?.ends_at, matchRound?.id, matchId, authUserId]);

  // Local sabotage countdown only when offline
  useEffect(() => {
    if (isOnline) return;
    if (sabotagedZones.length === 0) return;
    const timer = setTimeout(() => setSabotagedZones((prev) => prev.slice(1)), SABOTAGE_DURATION * 1000);
    return () => clearTimeout(timer);
  }, [sabotagedZones, isOnline]);

  const handleSelectZone = useCallback(async (zone: Zone) => {
    setCurrentZone(zone);
    setZonesVisited((prev) => new Set(prev).add(zone));
    if (isOnline && matchId) {
      try { await moveToZone(matchId, zoneToIndex(zone)); } catch (e) { console.error(e); }
    }
    if (role === "saboteur") return;
    if (sabotagedZones.includes(zone)) return;
    if (completedZones.includes(zone)) return;
    // Online: don't open the minigame if there are no pending tasks in this zone
    // (the server would reject anyway — better UX to not even try).
    if (isOnline && pendingTasksByZone && (pendingTasksByZone[zone] ?? 0) === 0) return;
    setActiveTask(zone);
  }, [role, sabotagedZones, completedZones, isOnline, matchId, pendingTasksByZone]);

  const handleEmergency = useCallback(async () => {
    if (phase !== "action") return;
    if (isOnline && matchId) {
      // Server-authoritative: advance the round to meeting. Realtime will
      // mirror the new phase to every client (including this one).
      try {
        await advanceRoundPhase(matchId, "meeting", { emergency: true });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Error";
        toast.error(msg);
      }
      return;
    }
    setPhase("meeting");
  }, [phase, isOnline, matchId]);

  const handleTaskComplete = useCallback(async (success: boolean) => {
    if (success && activeTask) {
      if (isOnline && matchId) {
        // Find first incomplete task in this zone
        const zoneIdx = zoneToIndex(activeTask);
        const target = matchTasks.find(t => t.zone === zoneIdx && !t.is_completed);
        if (target) {
          try { await completeTask(matchId, target.id); }
          catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Error";
            toast.error(msg);
          }
        }
      } else {
        setTasksCompleted((c) => c + 1);
        setTotalTasksCompleted((c) => c + 1);
        setCompletedZones((prev) => [...prev, activeTask]);
      }
    }
    setActiveTask(null);
  }, [activeTask, isOnline, matchId, matchTasks]);

  const handleSabotage = useCallback(async (zone: Zone) => {
    if (isOnline && matchId) {
      try { await sabotageZone(matchId, zoneToIndex(zone)); }
      catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Error";
        toast.error(msg);
      }
    } else {
      setSabotagedZones((prev) => [...prev, zone]);
    }
  }, [isOnline, matchId]);

  useEffect(() => { if (!isOnline && tasksCompleted >= tasksTotal && phase === "action") { playRoundComplete(); setPhase("meeting"); } }, [tasksCompleted, tasksTotal, phase, isOnline]);

  const handleVoteResult = useCallback((eliminatedId: string | null) => { if (eliminatedId) setEliminatedPlayers((prev) => [...prev, eliminatedId]); setPhase("round-summary"); }, []);

  // Server-resolved meeting (online): trust the edge function's result.
  const handleServerResolved = useCallback((result: VoteResolveResult) => {
    if (result.eliminated?.userId) {
      setEliminatedPlayers((prev) => [...prev, result.eliminated!.userId!]);
    }
    if (result.finished) {
      const stats: GameStats = {
        tasksCompleted: totalTasksCompleted + tasksCompleted,
        zonesVisited: zonesVisited.size,
        cluesGiven,
      };
      onGameEnd(
        result.winner === "agents" ? "agents-win" : "saboteur-wins",
        wordGuessers,
        secretWords,
        stats,
      );
      return;
    }
    // Otherwise the server already created the next round; show summary
    // and let handleNextRound transition us back to action. The realtime
    // subscription on `rounds` will deliver the new round/phase data.
    setPhase("round-summary");
  }, [totalTasksCompleted, tasksCompleted, zonesVisited, cluesGiven, onGameEnd, wordGuessers, secretWords]);

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
    if (round >= TOTAL_ROUNDS) { const stats: GameStats = { tasksCompleted: totalTasksCompleted + tasksCompleted, zonesVisited: zonesVisited.size, cluesGiven }; onGameEnd(totalTasksCompleted + tasksCompleted >= Math.floor(globalTasksTotal * 0.6) ? "agents-win" : "saboteur-wins", wordGuessers, secretWords, stats); return; }
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
            onClueGiven={() => setCluesGiven((c) => c + 1)}
            secretWord={secretWord}
            secretCategory={secretCategory}
            secretClues={role === "saboteur" ? [] : secretClues}
            myRole={role}
            matchId={matchId ?? null}
            playerUserIds={isOnline && authUserId ? { me: authUserId } : undefined}
            onServerResolved={isOnline ? handleServerResolved : undefined}
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
          <AnimatePresence>
            <MeetingPendingOverlay
              key="meeting-pending"
              visible={isOnline && !!activeTask && matchRound?.phase === "meeting"}
              triggeredAtMs={meetingTriggeredAtMs}
            />
          </AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <ZoneMap onSelectZone={handleSelectZone} sabotagedZones={sabotagedZones} completedZones={completedZones} currentZone={currentZone} players={zoneMapPlayers} pendingTasksByZone={pendingTasksByZone} />
          </motion.div>
          {role === "saboteur" && phase === "action" && <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}><SabotagePanel onSabotage={handleSabotage} sabotagedZones={sabotagedZones} /></motion.div>}
          {phase === "action" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex items-center justify-center gap-3 px-4 pb-4">
              <EmergencyButton onEmergency={handleEmergency} />
              <button onClick={() => setShowTutorial(true)} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-card shadow-soft text-muted-foreground" aria-label="Tutorial"><HelpCircle className="h-5 w-5" /></button>
            </motion.div>
          )}
          <AnimatePresence>{activeTask && <TaskMiniGame zone={activeTask} round={round} onComplete={handleTaskComplete} onCancel={() => setActiveTask(null)} />}</AnimatePresence>
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
          <AnimatePresence>{showTutorial && <GameTutorialOverlay role={role} onClose={closeTutorial} />}</AnimatePresence>
          <ReactionsPanel enabled={phase === "action" && !activeTask && !showTutorial} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameScreen;
