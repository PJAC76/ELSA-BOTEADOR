import { motion } from "framer-motion";
import { Timer, Target, Layers } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

type GameHUDProps = { round: number; totalRounds: number; timeLeft: number; tasksCompleted: number; tasksTotal: number; role: "agent" | "saboteur" };

const formatTime = (s: number) => { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${sec.toString().padStart(2, "0")}`; };

const GameHUD = ({ round, totalRounds, timeLeft, tasksCompleted, tasksTotal, role }: GameHUDProps) => {
  const progress = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;
  const isLow = timeLeft <= 30;
  const { t } = useTranslation();

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2 px-4 pt-3 pb-2 safe-top">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 items-center gap-1 rounded-full bg-card px-3 shadow-soft">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span className="font-display text-xs font-bold text-foreground">{t("round")} {round}/{totalRounds}</span>
          </div>
          <div className={`flex h-8 items-center rounded-full px-3 shadow-soft font-display text-xs font-bold ${role === "agent" ? "bg-accent/20 text-accent-foreground" : "bg-destructive/20 text-destructive"}`}>
            {role === "agent" ? t("agentBadge") : t("saboteurBadge")}
          </div>
        </div>
        <div className={`flex h-8 items-center gap-1 rounded-full px-3 shadow-soft font-display text-xs font-bold ${isLow ? "bg-destructive/20 text-destructive animate-pulse" : "bg-card text-foreground"}`}>
          <Timer className="h-3.5 w-3.5" />{formatTime(timeLeft)}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Target className="h-3.5 w-3.5 text-muted-foreground" />
        <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full bg-campus-yellow" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ type: "spring", stiffness: 100 }} />
        </div>
        <span className="font-display text-[10px] font-bold text-muted-foreground">{tasksCompleted}/{tasksTotal}</span>
      </div>
    </motion.div>
  );
};

export default GameHUD;
