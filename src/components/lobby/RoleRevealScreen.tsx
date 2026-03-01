import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import type { PlayerRole } from "@/types/game";
import { useTranslation } from "@/lib/i18n";

type RoleRevealScreenProps = { role: PlayerRole; onComplete: () => void };

const RoleRevealScreen = ({ role, onComplete }: RoleRevealScreenProps) => {
  const [phase, setPhase] = useState<"suspense" | "reveal" | "done">("suspense");
  const { t } = useTranslation();

  const data = {
    agent: { title: t("agent"), emoji: "🕵️", subtitle: t("agentMission"), gradient: "gradient-fun" },
    saboteur: { title: t("saboteur"), emoji: "💣", subtitle: t("saboteurMission"), gradient: "gradient-warm" },
  }[role];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 2000);
    const t2 = setTimeout(() => setPhase("done"), 3500);
    const t3 = setTimeout(onComplete, 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center ${data.gradient}`}>
      <AnimatePresence mode="wait">
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
