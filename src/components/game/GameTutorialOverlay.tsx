import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type TutorialStep = {
  emoji: string;
  title: string;
  description: string;
  highlight?: string; // CSS selector hint (visual only)
  position: "top" | "center" | "bottom";
};

const AGENT_STEPS: TutorialStep[] = [
  {
    emoji: "👋",
    title: "¡Bienvenida a la partida!",
    description:
      "Este tutorial te guiará por las mecánicas del juego paso a paso. Puedes cerrarlo en cualquier momento.",
    position: "center",
  },
  {
    emoji: "📊",
    title: "Panel superior (HUD)",
    description:
      "Arriba verás la ronda actual, tu rol, el tiempo restante y la barra de progreso de tareas.",
    position: "top",
  },
  {
    emoji: "🗺️",
    title: "Mapa de zonas",
    description:
      "El campus tiene 6 zonas. Toca una zona libre para moverte y empezar un minijuego.",
    position: "center",
  },
  {
    emoji: "🧩",
    title: "Minijuegos de tareas",
    description:
      "Completa secuencias, operaciones matemáticas o pruebas de memoria para avanzar la barra de progreso global.",
    position: "center",
  },
  {
    emoji: "🚫",
    title: "Zonas saboteadas",
    description:
      "Si una zona está bloqueada (borde rojo), no podrás hacer tareas ahí hasta que se desbloquee automáticamente.",
    position: "center",
  },
  {
    emoji: "🚨",
    title: "Botón de emergencia",
    description:
      "Abajo puedes convocar una reunión de emergencia para discutir y votar a quién eliminar. ¡Tiene cooldown de 30s!",
    position: "bottom",
  },
  {
    emoji: "🗳️",
    title: "Reuniones y votación",
    description:
      "En las reuniones, debatid quién podría ser la ELSA-BOTEADORA y votad para eliminarla. Podéis saltar el voto.",
    position: "center",
  },
  {
    emoji: "🏆",
    title: "¡A ganar!",
    description:
      "Completad al menos el 60% de las tareas en 3 rondas para ganar. ¡Buena suerte, agente!",
    position: "center",
  },
];

const SABOTEUR_STEPS: TutorialStep[] = [
  {
    emoji: "👋",
    title: "¡Bienvenida, ELSA-BOTEADORA!",
    description:
      "Tu misión secreta es sabotear sin que te descubran. Este tutorial te enseñará cómo.",
    position: "center",
  },
  {
    emoji: "📊",
    title: "Panel superior (HUD)",
    description:
      "Arriba verás la ronda, el tiempo y el progreso de tareas. ¡Quieres que esa barra avance lo menos posible!",
    position: "top",
  },
  {
    emoji: "💣",
    title: "Panel de sabotaje",
    description:
      "Debajo del mapa tienes botones para bloquear zonas. Cada sabotaje bloquea una zona por 15 segundos.",
    position: "bottom",
  },
  {
    emoji: "⏳",
    title: "Cooldown de sabotaje",
    description:
      "Después de sabotear, espera 30 segundos antes de volver a hacerlo. ¡Elige bien el momento!",
    position: "center",
  },
  {
    emoji: "🎭",
    title: "Actúa normal",
    description:
      "En las reuniones, defiéndete y desvía sospechas. Si te eliminan, pasarás a modo fantasma.",
    position: "center",
  },
  {
    emoji: "🏆",
    title: "Tu victoria",
    description:
      "Ganas si las agentes no completan el 60% de las tareas en 3 rondas. ¡Sabotea estratégicamente!",
    position: "center",
  },
];

type Props = {
  role: "agent" | "saboteur";
  onClose: () => void;
};

const GameTutorialOverlay = ({ role, onClose }: Props) => {
  const steps = role === "agent" ? AGENT_STEPS : SABOTEUR_STEPS;
  const [current, setCurrent] = useState(0);
  const step = steps[current];
  const isLast = current === steps.length - 1;
  const isFirst = current === 0;

  const positionClass =
    step.position === "top"
      ? "items-start pt-24"
      : step.position === "bottom"
      ? "items-end pb-28"
      : "items-center";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[70] flex justify-center ${positionClass} bg-background/80 backdrop-blur-sm px-6`}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 safe-top z-10 flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-soft text-muted-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm flex flex-col items-center gap-4"
        >
          {/* Emoji */}
          <motion.span
            className="text-6xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {step.emoji}
          </motion.span>

          {/* Card */}
          <div className="w-full rounded-3xl bg-card p-6 shadow-card text-center">
            <h3 className="font-display text-lg font-black text-foreground mb-2">
              {step.title}
            </h3>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 bg-primary"
                    : i < current
                    ? "w-2 bg-primary/40"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex w-full gap-3">
            {!isFirst && (
              <Button
                variant="outline"
                onClick={() => setCurrent((c) => c - 1)}
                className="flex-1 h-12 rounded-2xl font-display font-bold"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Atrás
              </Button>
            )}
            <Button
              onClick={() => {
                if (isLast) onClose();
                else setCurrent((c) => c + 1);
              }}
              className="flex-1 h-12 rounded-2xl gradient-primary text-primary-foreground font-display font-bold shadow-soft"
            >
              {isLast ? "¡Entendido!" : "Siguiente"}
              {!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default GameTutorialOverlay;
