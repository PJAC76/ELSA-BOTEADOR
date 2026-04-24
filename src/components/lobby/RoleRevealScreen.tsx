import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import type { PlayerRole } from "@/types/game";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useMatch } from "@/hooks/use-match";
import { Loader2 } from "lucide-react";

type RoleRevealScreenProps = {
  matchId: string | null;
  /** Optional fallback role for legacy/single-player flow when no matchId is provided. */
  fallbackRole?: PlayerRole;
  onComplete: (role: PlayerRole) => void;
};

const RoleRevealScreen = ({ matchId, fallbackRole = "agent", onComplete }: RoleRevealScreenProps) => {
  const [phase, setPhase] = useState<"loading" | "suspense" | "reveal" | "done">(matchId ? "loading" : "suspense");
  const { t } = useTranslation();
  const { user } = useAuth();
  const { players, loading } = useMatch(matchId);

  const myMatchPlayer = players.find((p) => p.user_id === user?.id);
  const role: PlayerRole = (myMatchPlayer?.role as PlayerRole) ?? fallbackRole;

  const data = {
    agent: { title: t("agent"), emoji: "🕵️", subtitle: t("agentMission"), gradient: "gradient-fun" },
    saboteur: { title: t("saboteur"), emoji: "💣", subtitle: t("saboteurMission"), gradient: "gradient-warm" },
  }[role];

  // Wait until match data has arrived (or no matchId at all) before starting suspense.
  useEffect(() => {
    if (!matchId) return;
    if (!loading && myMatchPlayer) setPhase("suspense");
  }, [matchId, loading, myMatchPlayer]);

  useEffect(() => {
    if (phase !== "suspense") return;
    const t1 = setTimeout(() => setPhase("reveal"), 2000);
    const t2 = setTimeout(() => setPhase("done"), 3500);
    const t3 = setTimeout(() => onComplete(role), 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [phase, onComplete, role]);

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center ${data.gradient}`}>
      <AnimatePresence mode="wait">
        {phase === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary-foreground" />
            <p className="font-body text-sm text-primary-foreground/80">{t("discoveringRole")}</p>
          </motion.div>
        )}
        {phase === "suspense" && (
          <motion.div key="suspense" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex flex-col items-center gap-4">
            <motion.div animate={{ rotate: [0, 10, -10, 10, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-7xl">🔮</motion.div>
            <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="font-display text-xl font-bold text-primary-foreground">{t("discoveringRole")}</motion.p>
          </motion.div>
        )}
        {phase === "reveal" && (
          <motion.div key="reveal" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 12, stiffness: 200 }} className="flex flex-col items-center gap-2">
            <motion.div initial={{ scale: 1 }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, delay: 0.3 }} className="mb-4 flex h-32 w-32 items-center justify-center rounded-[2rem] bg-primary-foreground/20 shadow-glow">
              <span className="text-7xl">{data.emoji}</span>
            </motion.div>
            <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="font-display text-4xl font-black text-primary-foreground">{data.title}</motion.h1>
          </motion.div>
        )}
        {phase === "done" && (
          <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4 px-8">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary-foreground/20"><span className="text-5xl">{data.emoji}</span></div>
            <h1 className="font-display text-3xl font-black text-primary-foreground">{t("youAre")} {data.title}</h1>
            <p className="text-center font-body text-sm text-primary-foreground/80">{data.subtitle}</p>
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="mt-4 font-body text-xs text-primary-foreground/60">{t("enteringMatch")}</motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleRevealScreen;
