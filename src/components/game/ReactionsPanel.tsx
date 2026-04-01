import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isSoundEnabled } from "@/lib/sounds";

type Reaction = {
  id: string;
  emoji: string;
  label: string;
  sound: () => void;
};

// --- Synthesized reaction sounds via Web Audio API ---

let audioCtx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playLaugh() {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  [300, 400, 350, 420, 380].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.12;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.1);
    osc.stop(ctx.currentTime + i * 0.1 + 0.12);
  });
}

function playScream() {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.value = 500;
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.4);
  gain.gain.value = 0.1;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.connect(gain).connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.5);
}

function playClap() {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  [0, 0.12, 0.24].forEach((t) => {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf;
    gain.gain.value = 0.2;
    src.connect(gain).connect(ctx.destination);
    src.start(ctx.currentTime + t);
  });
}

function playShock() {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = 800;
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
  gain.gain.value = 0.08;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
  osc.connect(gain).connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.4);
}

function playSus() {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  [440, 466, 440, 415].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.14);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.15);
    osc.stop(ctx.currentTime + i * 0.15 + 0.15);
  });
}

function playLove() {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  [523, 659, 784, 1047].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.12);
    osc.stop(ctx.currentTime + i * 0.12 + 0.18);
  });
}

function playAngry() {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.value = 150;
  gain.gain.value = 0.1;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  osc.connect(gain).connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.4);
}

function playThink() {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  [330, 392, 330].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.08;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.2);
    osc.stop(ctx.currentTime + i * 0.2 + 0.22);
  });
}

const REACTIONS: Reaction[] = [
  { id: "laugh", emoji: "😂", label: "Jaja", sound: playLaugh },
  { id: "scream", emoji: "😱", label: "¡Ahhh!", sound: playScream },
  { id: "clap", emoji: "👏", label: "Bravo", sound: playClap },
  { id: "shock", emoji: "😮", label: "¡Qué fuerte!", sound: playShock },
  { id: "sus", emoji: "🤨", label: "Sospechoso", sound: playSus },
  { id: "love", emoji: "😍", label: "Me encanta", sound: playLove },
  { id: "angry", emoji: "😤", label: "Grr", sound: playAngry },
  { id: "think", emoji: "🤔", label: "Hmm", sound: playThink },
];

const BOT_NAMES = ["Luna 🌙", "Mía 🦋", "Noa ⭐", "Alma 🌸"];

type FloatingReaction = { id: number; emoji: string; sender: string; x: number };

const FloatingEmoji = ({ emoji, sender, x, onDone }: { emoji: string; sender: string; x: number; onDone: () => void }) => (
  <motion.div
    initial={{ opacity: 1, y: 0, scale: 0.5 }}
    animate={{ opacity: 0, y: -120, scale: 1.4, rotate: [0, 15, -15, 0] }}
    transition={{ duration: 1.2, ease: "easeOut" }}
    onAnimationComplete={onDone}
    className="pointer-events-none fixed z-[70] flex flex-col items-center"
    style={{ bottom: 100, left: `${x}%` }}
  >
    <span className="text-4xl drop-shadow-lg">{emoji}</span>
    <span className="mt-0.5 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-bold text-foreground shadow-sm backdrop-blur-sm">{sender}</span>
  </motion.div>
);

type ReactionsPanelProps = { enabled: boolean };

const ReactionsPanel = ({ enabled }: ReactionsPanelProps) => {
  const [open, setOpen] = useState(false);
  const [floating, setFloating] = useState<FloatingReaction[]>([]);
  const [cooldown, setCooldown] = useState(false);
  const [counter, setCounter] = useState(0);

  const spawnReaction = useCallback((emoji: string, sender: string) => {
    const id = Date.now() + Math.random();
    const x = 10 + Math.random() * 80;
    setFloating((f) => [...f, { id, emoji, sender, x }]);
  }, []);

  const handleReaction = useCallback((r: Reaction) => {
    if (cooldown) return;
    r.sound();
    spawnReaction(r.emoji, "Tú");
    setCooldown(true);
    setOpen(false);
    setTimeout(() => setCooldown(false), 1500);
  }, [cooldown, spawnReaction]);

  // Bot reactions
  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      const r = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
      const bot = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      r.sound();
      spawnReaction(r.emoji, bot);
    }, 3000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, [enabled, spawnReaction]);

  const removeFloating = useCallback((id: number) => {
    setFloating((f) => f.filter((r) => r.id !== id));
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Floating reactions */}
      <AnimatePresence>
        {floating.map((f) => (
          <FloatingEmoji key={f.id} emoji={f.emoji} sender={f.sender} x={f.x} onDone={() => removeFloating(f.id)} />
        ))}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-24 right-4 z-[65] flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
        whileTap={{ scale: 0.9 }}
        animate={cooldown ? { opacity: 0.5 } : { opacity: 1 }}
      >
        <span className="text-xl">😊</span>
      </motion.button>

      {/* Reaction grid */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-[8.5rem] right-4 z-[65] grid grid-cols-4 gap-1.5 rounded-2xl bg-card p-3 shadow-xl border border-border"
          >
            {REACTIONS.map((r) => (
              <motion.button
                key={r.id}
                whileTap={{ scale: 0.8 }}
                whileHover={{ scale: 1.15 }}
                onClick={() => handleReaction(r)}
                className="flex flex-col items-center gap-0.5 rounded-xl p-2 hover:bg-accent/50 transition-colors"
              >
                <span className="text-2xl">{r.emoji}</span>
                <span className="text-[9px] font-medium text-muted-foreground leading-tight">{r.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ReactionsPanel;
