import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playTap } from "@/lib/sounds";

type Reaction = {
  id: string;
  emoji: string;
  label: string;
  color: string;
};

const REACTIONS: Reaction[] = [
  { id: "laugh", emoji: "😂", label: "Jajaja", color: "hsl(45, 85%, 70%)" },
  { id: "scream", emoji: "😱", label: "¡¡¡!!!", color: "hsl(0, 70%, 60%)" },
  { id: "clap", emoji: "👏", label: "Bravo", color: "hsl(160, 45%, 65%)" },
  { id: "shock", emoji: "🤯", label: "Qué fuerte", color: "hsl(270, 50%, 75%)" },
  { id: "sus", emoji: "👀", label: "Sospecho...", color: "hsl(200, 70%, 75%)" },
  { id: "love", emoji: "😍", label: "Me encanta", color: "hsl(330, 70%, 60%)" },
  { id: "angry", emoji: "😤", label: "No way", color: "hsl(15, 80%, 55%)" },
  { id: "think", emoji: "🤔", label: "Hmm...", color: "hsl(45, 60%, 60%)" },
];

type FloatingReaction = {
  id: number;
  emoji: string;
  label: string;
  color: string;
  x: number;
  fromBot: boolean;
  senderName?: string;
};

const BOT_NAMES = ["Luna_Star", "MintChoco", "PixelQueen", "StarGirl"];

let reactionCounter = 0;

type ReactionsPanelProps = {
  enabled?: boolean;
};

const ReactionsPanel = ({ enabled = true }: ReactionsPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [floating, setFloating] = useState<FloatingReaction[]>([]);
  const [cooldown, setCooldown] = useState(false);

  // Remove floating reactions after animation
  useEffect(() => {
    if (floating.length === 0) return;
    const timer = setTimeout(() => {
      setFloating((prev) => prev.slice(1));
    }, 2200);
    return () => clearTimeout(timer);
  }, [floating]);

  // Bot reactions during gameplay
  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.3) return; // 30% chance every 4s
      const r = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
      const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      reactionCounter++;
      setFloating((prev) => [
        ...prev.slice(-8),
        {
          id: reactionCounter,
          emoji: r.emoji,
          label: r.label,
          color: r.color,
          x: 10 + Math.random() * 60,
          fromBot: true,
          senderName: botName,
        },
      ]);
    }, 4000);
    return () => clearInterval(interval);
  }, [enabled]);

  const sendReaction = useCallback((reaction: Reaction) => {
    if (cooldown) return;
    playTap();
    reactionCounter++;
    setFloating((prev) => [
      ...prev.slice(-8),
      {
        id: reactionCounter,
        emoji: reaction.emoji,
        label: reaction.label,
        color: reaction.color,
        x: 20 + Math.random() * 50,
        fromBot: false,
      },
    ]);
    setCooldown(true);
    setTimeout(() => setCooldown(false), 1500);
    setIsOpen(false);
  }, [cooldown]);

  if (!enabled) return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <AnimatePresence>
        {floating.map((fr) => (
          <FloatingEmoji key={fr.id} reaction={fr} />
        ))}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Floating reactions overlay */}
      <div className="pointer-events-none fixed inset-0 z-40">
        <AnimatePresence>
          {floating.map((fr) => (
            <FloatingEmoji key={fr.id} reaction={fr} />
          ))}
        </AnimatePresence>
      </div>

      {/* Reaction trigger button */}
      <motion.button
        onClick={() => { setIsOpen(!isOpen); playTap(); }}
        whileTap={{ scale: 0.9 }}
        className={`fixed bottom-24 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full shadow-glow transition-all ${
          isOpen ? "gradient-warm" : "bg-card shadow-soft"
        }`}
      >
        <span className="text-xl">{isOpen ? "✕" : "😊"}</span>
      </motion.button>

      {/* Reaction picker */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-[8.5rem] right-4 z-30 rounded-2xl bg-card/95 backdrop-blur-md p-3 shadow-card"
          >
            <div className="grid grid-cols-4 gap-1.5">
              {REACTIONS.map((reaction, i) => (
                <motion.button
                  key={reaction.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.04, type: "spring", stiffness: 500 }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => sendReaction(reaction)}
                  disabled={cooldown}
                  className={`flex flex-col items-center gap-0.5 rounded-xl p-2 transition-colors ${
                    cooldown ? "opacity-40" : "hover:bg-muted active:bg-primary/10"
                  }`}
                >
                  <span className="text-2xl">{reaction.emoji}</span>
                  <span className="font-display text-[8px] font-bold text-muted-foreground leading-none">{reaction.label}</span>
                </motion.button>
              ))}
            </div>
            {cooldown && (
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 1.5, ease: "linear" }}
                className="mt-1.5 h-1 rounded-full bg-primary/30"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Floating emoji component with expressive animation
const FloatingEmoji = ({ reaction }: { reaction: FloatingReaction }) => {
  const startY = 70 + Math.random() * 15; // % from top

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: 0, x: "-50%" }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.3, 1.4, 1.2, 0.8],
        y: [0, -40, -80, -140],
        rotate: [0, -8, 8, -4, 0],
      }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 2, ease: "easeOut" }}
      className="pointer-events-none absolute z-50 flex flex-col items-center"
      style={{ left: `${reaction.x}%`, top: `${startY}%` }}
    >
      <motion.span
        className="text-5xl drop-shadow-lg"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {reaction.emoji}
      </motion.span>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: [0, 1, 1, 0], y: [5, 0, -2, -8] }}
        transition={{ duration: 1.8, delay: 0.15 }}
        className="rounded-full px-2.5 py-0.5 backdrop-blur-sm mt-1"
        style={{ backgroundColor: `${reaction.color}33` }}
      >
        <span className="font-display text-[10px] font-bold" style={{ color: reaction.color }}>
          {reaction.fromBot && reaction.senderName ? reaction.senderName : reaction.label}
        </span>
      </motion.div>
    </motion.div>
  );
};

export default ReactionsPanel;
