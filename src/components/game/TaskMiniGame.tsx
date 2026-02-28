import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Timer, X } from "lucide-react";
import type { Zone } from "@/types/game";
import { ZONE_INFO } from "@/types/game";
import { playTaskComplete, playTaskFail, playTimerUrgent, playTap } from "@/lib/sounds";

type TaskMiniGameProps = {
  zone: Zone;
  onComplete: (success: boolean) => void;
  onCancel: () => void;
};

type MiniGameType = "tap-sequence" | "memory-match" | "quick-math";

const GAME_TIME = 12; // seconds

// --- Tap Sequence ---
const TapSequenceGame = ({ onResult }: { onResult: (success: boolean) => void }) => {
  const [sequence] = useState(() =>
    Array.from({ length: 4 }, () => Math.floor(Math.random() * 4))
  );
  const [step, setStep] = useState(0);
  const [showingSequence, setShowingSequence] = useState(true);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const colors = ["bg-primary", "bg-accent", "bg-campus-yellow", "bg-secondary"];
  const labels = ["🔴", "🟢", "🟡", "🟣"];

  useEffect(() => {
    if (!showingSequence) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setHighlightIdx(sequence[i]);
        setTimeout(() => setHighlightIdx(-1), 400);
        i++;
      } else {
        clearInterval(interval);
        setShowingSequence(false);
      }
    }, 700);
    return () => clearInterval(interval);
  }, [sequence, showingSequence]);

  const handleTap = (idx: number) => {
    if (showingSequence) return;
    if (idx === sequence[step]) {
      const next = step + 1;
      if (next >= sequence.length) {
        onResult(true);
      } else {
        setStep(next);
      }
    } else {
      onResult(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-display text-sm font-bold text-foreground text-center">
        {showingSequence ? "¡Memoriza la secuencia!" : "¡Repite la secuencia!"}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((idx) => (
          <motion.button
            key={idx}
            animate={{
              scale: highlightIdx === idx ? 1.2 : 1,
              opacity: highlightIdx === idx ? 1 : showingSequence ? 0.5 : 0.9,
            }}
            onClick={() => handleTap(idx)}
            className={`flex h-20 w-20 items-center justify-center rounded-2xl text-2xl shadow-soft transition-colors ${colors[idx]} ${
              !showingSequence ? "active:scale-90" : ""
            }`}
          >
            {labels[idx]}
          </motion.button>
        ))}
      </div>
      {!showingSequence && (
        <p className="font-body text-xs text-muted-foreground">
          Paso {step + 1} de {sequence.length}
        </p>
      )}
    </div>
  );
};

// --- Quick Math ---
const QuickMathGame = ({ onResult }: { onResult: (success: boolean) => void }) => {
  const [problem] = useState(() => {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const op = Math.random() > 0.5 ? "+" : "-";
    const answer = op === "+" ? a + b : a - b;
    const options = [answer];
    while (options.length < 4) {
      const wrong = answer + Math.floor(Math.random() * 10) - 5;
      if (wrong !== answer && !options.includes(wrong)) {
        options.push(wrong);
      }
    }
    return { a, b, op, answer, options: options.sort(() => Math.random() - 0.5) };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-display text-sm font-bold text-foreground">
        ¡Resuelve rápido!
      </p>
      <div className="rounded-2xl bg-card px-8 py-4 shadow-soft">
        <span className="font-display text-3xl font-black text-foreground">
          {problem.a} {problem.op} {problem.b} = ?
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {problem.options.map((opt, i) => (
          <Button
            key={i}
            onClick={() => onResult(opt === problem.answer)}
            className="h-14 w-24 rounded-2xl font-display text-lg font-bold"
            variant="outline"
          >
            {opt}
          </Button>
        ))}
      </div>
    </div>
  );
};

// --- Memory Match ---
const MemoryMatchGame = ({ onResult }: { onResult: (success: boolean) => void }) => {
  const emojis = ["🔑", "📱", "💡", "🎯"];
  const [cards] = useState(() => {
    const pairs = [...emojis, ...emojis];
    return pairs.sort(() => Math.random() - 0.5);
  });
  const [revealed, setRevealed] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);

  const handleFlip = useCallback(
    (idx: number) => {
      if (locked || revealed.includes(idx) || matched.includes(idx)) return;
      const next = [...revealed, idx];
      setRevealed(next);

      if (next.length === 2) {
        setLocked(true);
        if (cards[next[0]] === cards[next[1]]) {
          const newMatched = [...matched, next[0], next[1]];
          setMatched(newMatched);
          setRevealed([]);
          setLocked(false);
          if (newMatched.length === cards.length) {
            onResult(true);
          }
        } else {
          setTimeout(() => {
            setRevealed([]);
            setLocked(false);
          }, 600);
        }
      }
    },
    [revealed, matched, locked, cards, onResult]
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-display text-sm font-bold text-foreground">
        ¡Encuentra los pares!
      </p>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card, idx) => {
          const isVisible = revealed.includes(idx) || matched.includes(idx);
          return (
            <motion.button
              key={idx}
              animate={{ rotateY: isVisible ? 0 : 180 }}
              onClick={() => handleFlip(idx)}
              className={`flex h-16 w-16 items-center justify-center rounded-xl text-xl shadow-soft transition-colors ${
                matched.includes(idx)
                  ? "bg-accent/30"
                  : isVisible
                  ? "bg-card"
                  : "gradient-primary"
              }`}
            >
              {isVisible ? card : "❓"}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// --- Main Task Component ---
const MINI_GAMES: MiniGameType[] = ["tap-sequence", "quick-math", "memory-match"];

const TaskMiniGame = ({ zone, onComplete, onCancel }: TaskMiniGameProps) => {
  const [gameType] = useState<MiniGameType>(
    () => MINI_GAMES[Math.floor(Math.random() * MINI_GAMES.length)]
  );
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [result, setResult] = useState<"playing" | "success" | "fail">("playing");
  const info = ZONE_INFO[zone];

  useEffect(() => {
    if (result !== "playing") return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setResult("fail");
          return 0;
        }
        if (t <= 5) playTimerUrgent();
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [result]);

  const handleResult = (success: boolean) => {
    setResult(success ? "success" : "fail");
    if (success) playTaskComplete();
    else playTaskFail();
  };

  useEffect(() => {
    if (result === "success" || result === "fail") {
      const timer = setTimeout(() => onComplete(result === "success"), 1500);
      return () => clearTimeout(timer);
    }
  }, [result, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 safe-top">
        <div className="flex items-center gap-2">
          <span className="text-xl">{info.emoji}</span>
          <span className="font-display text-sm font-bold text-foreground">
            Tarea: {info.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1 rounded-full px-3 py-1 font-display text-xs font-bold ${
              timeLeft <= 5
                ? "bg-destructive/20 text-destructive animate-pulse"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Timer className="h-3 w-3" />
            {timeLeft}s
          </div>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Game area */}
      <div className="flex flex-1 items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {result === "playing" ? (
            <motion.div key="game">
              {gameType === "tap-sequence" && <TapSequenceGame onResult={handleResult} />}
              {gameType === "quick-math" && <QuickMathGame onResult={handleResult} />}
              {gameType === "memory-match" && <MemoryMatchGame onResult={handleResult} />}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <span className="text-6xl">
                {result === "success" ? "✅" : "❌"}
              </span>
              <p className="font-display text-xl font-bold text-foreground">
                {result === "success" ? "¡Tarea completada!" : "¡Fallaste!"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TaskMiniGame;
