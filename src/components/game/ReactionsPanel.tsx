import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isSoundEnabled } from "@/lib/sounds";

type Reaction = {
  id: string;
  emoji: string;
  label: string;
  sound: () => void;
  phrases: string[];
};

// --- Synthesized reaction sounds via Web Audio API ---

let audioCtx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function playNotes(freqs: number[], gap: number, type: OscillatorType, vol: number, noteDur: number) {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * gap + noteDur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + i * gap);
    osc.stop(ctx.currentTime + i * gap + noteDur + 0.02);
  });
}

function playSweep(from: number, to: number, dur: number, type: OscillatorType, vol: number) {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = from;
  osc.frequency.exponentialRampToValueAtTime(to, ctx.currentTime + dur * 0.7);
  gain.gain.value = vol;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + dur);
}

function playNoise(count: number, gap: number, noiseDur: number, vol: number) {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  for (let c = 0; c < count; c++) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * noiseDur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf;
    gain.gain.value = vol;
    src.connect(gain).connect(ctx.destination);
    src.start(ctx.currentTime + c * gap);
  }
}

// --- Variantes por reacción (2-3 cada una) ---

function playLaugh() {
  pick([
    () => playNotes([300, 400, 350, 420, 380], 0.1, "sine", 0.12, 0.1),
    () => playNotes([350, 500, 400, 520, 450, 540], 0.08, "sine", 0.1, 0.09),
    () => playNotes([280, 360, 320, 400], 0.12, "triangle", 0.11, 0.11),
  ])();
}

function playScream() {
  pick([
    () => playSweep(500, 1200, 0.5, "sawtooth", 0.1),
    () => playSweep(400, 1400, 0.4, "square", 0.08),
    () => { playSweep(600, 1100, 0.3, "sawtooth", 0.09); setTimeout(() => playSweep(700, 1300, 0.25, "sawtooth", 0.07), 200); },
  ])();
}

function playClap() {
  pick([
    () => playNoise(3, 0.12, 0.06, 0.2),
    () => playNoise(5, 0.09, 0.04, 0.18),
    () => playNoise(2, 0.18, 0.08, 0.22),
  ])();
}

function playShock() {
  pick([
    () => playSweep(800, 200, 0.4, "square", 0.08),
    () => playSweep(1000, 150, 0.35, "sawtooth", 0.07),
    () => { playSweep(900, 300, 0.25, "square", 0.06); setTimeout(() => playSweep(700, 200, 0.2, "square", 0.05), 200); },
  ])();
}

function playSus() {
  pick([
    () => playNotes([440, 466, 440, 415], 0.15, "triangle", 0.1, 0.14),
    () => playNotes([466, 440, 415, 392], 0.18, "sine", 0.09, 0.16),
    () => playNotes([415, 440, 466, 440, 415], 0.12, "triangle", 0.08, 0.11),
  ])();
}

function playLove() {
  pick([
    () => playNotes([523, 659, 784, 1047], 0.12, "sine", 0.1, 0.15),
    () => playNotes([440, 554, 659, 880], 0.14, "sine", 0.09, 0.18),
    () => playNotes([523, 784, 1047, 1319], 0.1, "triangle", 0.08, 0.13),
  ])();
}

function playAngry() {
  pick([
    () => playSweep(150, 80, 0.4, "sawtooth", 0.1),
    () => playSweep(200, 60, 0.5, "square", 0.08),
    () => { playSweep(180, 100, 0.25, "sawtooth", 0.09); setTimeout(() => playSweep(160, 70, 0.3, "sawtooth", 0.08), 200); },
  ])();
}

function playThink() {
  pick([
    () => playNotes([330, 392, 330], 0.2, "sine", 0.08, 0.2),
    () => playNotes([349, 415, 349, 330], 0.22, "sine", 0.07, 0.2),
    () => playNotes([392, 349, 392], 0.25, "triangle", 0.07, 0.22),
  ])();
}

function speakPhrase(phrase: string) {
  if (!isSoundEnabled()) return;
  if (!('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(phrase);
  utter.lang = "es-ES";
  utter.rate = 1.2;
  utter.pitch = 1.3;
  utter.volume = 0.7;
  // Try to pick a Spanish voice
  const voices = speechSynthesis.getVoices();
  const esVoice = voices.find(v => v.lang.startsWith("es"));
  if (esVoice) utter.voice = esVoice;
  speechSynthesis.speak(utter);
}

const REACTIONS: Reaction[] = [
  { id: "laugh", emoji: "😂", label: "Jaja", sound: playLaugh, phrases: ["¡Jajaja!", "¡Me muero!", "¡No puedo más!", "¡Estoy muerta!", "¡Para, para!", "¡Qué risa, bro!", "¡Me parto!", "¡Estoy llorando!"] },
  { id: "scream", emoji: "😱", label: "¡Ahhh!", sound: playScream, phrases: ["¡Ahhh!", "¡Socorro!", "¡No me lo creo!", "¡Estoy flipando!", "¡Qué acaba de pasar!", "¡Me da algo!", "¡Literal gritando!"] },
  { id: "clap", emoji: "👏", label: "Bravo", sound: playClap, phrases: ["¡Bravo!", "¡Genial!", "¡Olé!", "¡Eres crack!", "¡Menuda pro!", "¡Qué top!", "¡Eso es, reina!"] },
  { id: "shock", emoji: "😮", label: "¡Qué fuerte!", sound: playShock, phrases: ["¡Qué fuerte!", "¡Madre mía!", "¡Flipa!", "¡Menuda bro!", "¡No puede ser!", "¡Estoy en shock!", "¡Alucino pepinillos!", "¡Dios mío!"] },
  { id: "sus", emoji: "🤨", label: "Sospechoso", sound: playSus, phrases: ["Sospechoso...", "No me fío", "¡Eres tú!", "Aquí hay gato encerrado", "Te tengo calada", "Eso ha sido muy sus", "Me huele raro..."] },
  { id: "love", emoji: "😍", label: "Me encanta", sound: playLove, phrases: ["¡Me encanta!", "¡Qué mono!", "¡Te quiero!", "¡Eres lo más!", "¡Crush total!", "¡Icono!", "¡Qué cuqui!", "¡Goals!"] },
  { id: "angry", emoji: "😤", label: "Grr", sound: playAngry, phrases: ["¡Grr!", "¡Qué rabia!", "¡No es justo!", "¡Estoy tilteada!", "¡Me pica!", "¡Vaya tela!", "¡Qué mal rollo!"] },
  { id: "think", emoji: "🤔", label: "Hmm", sound: playThink, phrases: ["Hmm...", "Déjame pensar...", "Interesante...", "A ver, a ver...", "Yo creo que...", "No sé, bro...", "Esto me mosquea..."] },
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
    const phrase = pick(r.phrases);
    speakPhrase(phrase);
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
      if (Math.random() > 0.5) speakPhrase(pick(r.phrases));
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
