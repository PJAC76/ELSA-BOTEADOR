import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

type TutorialStep = { emoji: string; title: string; description: string; position: "top" | "center" | "bottom" };

type Props = { role: "agent" | "saboteur"; onClose: () => void };

const GameTutorialOverlay = ({ role, onClose }: Props) => {
  const { t } = useTranslation();

  const AGENT_STEPS: TutorialStep[] = [
    { emoji: "👋", title: t("tutorialAgentStep1Title"), description: t("tutorialAgentStep1Desc"), position: "center" },
    { emoji: "📊", title: t("tutorialAgentStep2Title"), description: t("tutorialAgentStep2Desc"), position: "top" },
    { emoji: "🗺️", title: t("tutorialAgentStep3Title"), description: t("tutorialAgentStep3Desc"), position: "center" },
    { emoji: "🧩", title: t("tutorialAgentStep4Title"), description: t("tutorialAgentStep4Desc"), position: "center" },
    { emoji: "🚫", title: t("tutorialAgentStep5Title"), description: t("tutorialAgentStep5Desc"), position: "center" },
    { emoji: "🚨", title: t("tutorialAgentStep6Title"), description: t("tutorialAgentStep6Desc"), position: "bottom" },
    { emoji: "🗳️", title: t("tutorialAgentStep7Title"), description: t("tutorialAgentStep7Desc"), position: "center" },
    { emoji: "🏆", title: t("tutorialAgentStep8Title"), description: t("tutorialAgentStep8Desc"), position: "center" },
  ];

  const SABOTEUR_STEPS: TutorialStep[] = [
    { emoji: "👋", title: t("tutorialSaboteurStep1Title"), description: t("tutorialSaboteurStep1Desc"), position: "center" },
    { emoji: "📊", title: t("tutorialSaboteurStep2Title"), description: t("tutorialSaboteurStep2Desc"), position: "top" },
    { emoji: "💣", title: t("tutorialSaboteurStep3Title"), description: t("tutorialSaboteurStep3Desc"), position: "bottom" },
    { emoji: "⏳", title: t("tutorialSaboteurStep4Title"), description: t("tutorialSaboteurStep4Desc"), position: "center" },
    { emoji: "🎭", title: t("tutorialSaboteurStep5Title"), description: t("tutorialSaboteurStep5Desc"), position: "center" },
    { emoji: "🏆", title: t("tutorialSaboteurStep6Title"), description: t("tutorialSaboteurStep6Desc"), position: "center" },
  ];

  const steps = role === "agent" ? AGENT_STEPS : SABOTEUR_STEPS;
  const [current, setCurrent] = useState(0);
  const step = steps[current];
  const isLast = current === steps.length - 1;
  const isFirst = current === 0;

  const positionClass = step.position === "top" ? "items-start pt-24" : step.position === "bottom" ? "items-end pb-28" : "items-center";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-[70] flex justify-center ${positionClass} bg-background/80 backdrop-blur-sm px-6`}>
      <button onClick={onClose} className="absolute right-4 top-4 safe-top z-10 flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-soft text-muted-foreground"><X className="h-4 w-4" /></button>
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.3 }} className="w-full max-w-sm flex flex-col items-center gap-4">
          <motion.span className="text-6xl" animate={{ y: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>{step.emoji}</motion.span>
          <div className="w-full rounded-3xl bg-card p-6 shadow-card text-center">
            <h3 className="font-display text-lg font-black text-foreground mb-2">{step.title}</h3>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </div>
          <div className="flex gap-1.5">
            {steps.map((_, i) => (<div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-primary" : i < current ? "w-2 bg-primary/40" : "w-2 bg-muted"}`} />))}
          </div>
          <div className="flex w-full gap-3">
            {!isFirst && <Button variant="outline" onClick={() => setCurrent((c) => c - 1)} className="flex-1 h-12 rounded-2xl font-display font-bold"><ChevronLeft className="h-4 w-4 mr-1" />{t("tutorialBack")}</Button>}
            <Button onClick={() => { if (isLast) onClose(); else setCurrent((c) => c + 1); }} className="flex-1 h-12 rounded-2xl gradient-primary text-primary-foreground font-display font-bold shadow-soft">
              {isLast ? t("tutorialGotIt") : t("tutorialNext")}{!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default GameTutorialOverlay;
