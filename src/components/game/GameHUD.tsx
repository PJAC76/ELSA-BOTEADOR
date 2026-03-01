import { motion } from "framer-motion";
import { Timer, Target, Layers, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useState } from "react";

type GameHUDProps = {
  round: number;
  totalRounds: number;
  timeLeft: number;
  tasksCompleted: number;
  tasksTotal: number;
  role: "agent" | "saboteur";
  secretWord: string | null; // null for saboteur
  secretCategory: string;
};

const formatTime = (s: number) => { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${sec.toString().padStart(2, "0")}`; };

const GameHUD = ({ round, totalRounds, timeLeft, tasksCompleted, tasksTotal, role, secretWord, secretCategory }: GameHUDProps) => {
  const progress = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;
  const isLow = timeLeft <= 30;
  const { t } = useTranslation();
  const [wordVisible, setWordVisible] = useState(true);

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

      {/* Secret word / category banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className={`flex items-center justify-between rounded-2xl px-3 py-2 shadow-soft ${
          secretWord ? "bg-primary/10" : "bg-destructive/10"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base">{secretWord ? "🔑" : "❓"}</span>
          <div className="min-w-0">
            <p className="font-body text-[10px] text-muted-foreground">
              {secretWord ? t("secretWordLabel") : t("secretCategoryOnly")}
            </p>
            <p className="font-display text-sm font-bold text-foreground truncate">
              {secretWord
                ? (wordVisible ? secretWord : "• • • •")
                : secretCategory}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {secretWord && (
            <button
              onClick={() => setWordVisible(!wordVisible)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-muted-foreground"
              aria-label={wordVisible ? "Hide word" : "Show word"}
            >
              {wordVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          )}
          <span className="rounded-full bg-muted px-2 py-0.5 font-body text-[10px] text-muted-foreground">
            {secretCategory}
          </span>
        </div>
      </motion.div>

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
