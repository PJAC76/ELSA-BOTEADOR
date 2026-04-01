import { isSoundEnabled } from "@/lib/sounds";

let audioCtx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

export function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

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

export function playLaugh() {
  pick([
    () => playNotes([300, 400, 350, 420, 380], 0.1, "sine", 0.12, 0.1),
    () => playNotes([350, 500, 400, 520, 450, 540], 0.08, "sine", 0.1, 0.09),
    () => playNotes([280, 360, 320, 400], 0.12, "triangle", 0.11, 0.11),
  ])();
}

export function playScream() {
  pick([
    () => playSweep(500, 1200, 0.5, "sawtooth", 0.1),
    () => playSweep(400, 1400, 0.4, "square", 0.08),
    () => { playSweep(600, 1100, 0.3, "sawtooth", 0.09); setTimeout(() => playSweep(700, 1300, 0.25, "sawtooth", 0.07), 200); },
  ])();
}

export function playClap() {
  pick([
    () => playNoise(3, 0.12, 0.06, 0.2),
    () => playNoise(5, 0.09, 0.04, 0.18),
    () => playNoise(2, 0.18, 0.08, 0.22),
  ])();
}

export function playShock() {
  pick([
    () => playSweep(800, 200, 0.4, "square", 0.08),
    () => playSweep(1000, 150, 0.35, "sawtooth", 0.07),
    () => { playSweep(900, 300, 0.25, "square", 0.06); setTimeout(() => playSweep(700, 200, 0.2, "square", 0.05), 200); },
  ])();
}

export function playSus() {
  pick([
    () => playNotes([440, 466, 440, 415], 0.15, "triangle", 0.1, 0.14),
    () => playNotes([466, 440, 415, 392], 0.18, "sine", 0.09, 0.16),
    () => playNotes([415, 440, 466, 440, 415], 0.12, "triangle", 0.08, 0.11),
  ])();
}

export function playLove() {
  pick([
    () => playNotes([523, 659, 784, 1047], 0.12, "sine", 0.1, 0.15),
    () => playNotes([440, 554, 659, 880], 0.14, "sine", 0.09, 0.18),
    () => playNotes([523, 784, 1047, 1319], 0.1, "triangle", 0.08, 0.13),
  ])();
}

export function playAngry() {
  pick([
    () => playSweep(150, 80, 0.4, "sawtooth", 0.1),
    () => playSweep(200, 60, 0.5, "square", 0.08),
    () => { playSweep(180, 100, 0.25, "sawtooth", 0.09); setTimeout(() => playSweep(160, 70, 0.3, "sawtooth", 0.08), 200); },
  ])();
}

export function playThink() {
  pick([
    () => playNotes([330, 392, 330], 0.2, "sine", 0.08, 0.2),
    () => playNotes([349, 415, 349, 330], 0.22, "sine", 0.07, 0.2),
    () => playNotes([392, 349, 392], 0.25, "triangle", 0.07, 0.22),
  ])();
}

export function playComboSound(combo: number) {
  if (!isSoundEnabled()) return;
  const base = 400 + combo * 100;
  playNotes(
    Array.from({ length: Math.min(combo + 2, 6) }, (_, i) => base + i * 80),
    0.06, "sine", 0.15, 0.08
  );
}

export function speakPhrase(phrase: string) {
  if (!isSoundEnabled()) return;
  if (!('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(phrase);
  utter.lang = "es-ES";
  utter.rate = 1.2;
  utter.pitch = 1.3;
  utter.volume = 0.7;
  const voices = speechSynthesis.getVoices();
  const esVoice = voices.find(v => v.lang.startsWith("es"));
  if (esVoice) utter.voice = esVoice;
  speechSynthesis.speak(utter);
}

export type Reaction = {
  id: string;
  emoji: string;
  label: string;
  color: string;
  sound: () => void;
  phrases: string[];
};

export const REACTIONS: Reaction[] = [
  { id: "laugh", emoji: "😂", label: "Jaja", color: "hsl(48, 96%, 53%)", sound: playLaugh, phrases: ["¡Jajaja!", "¡Me muero!", "¡No puedo más!", "¡Estoy muerta!", "¡Para, para!", "¡Qué risa, bro!", "¡Me parto!", "¡Estoy llorando!"] },
  { id: "scream", emoji: "😱", label: "¡Ahhh!", color: "hsl(200, 80%, 55%)", sound: playScream, phrases: ["¡Ahhh!", "¡Socorro!", "¡No me lo creo!", "¡Estoy flipando!", "¡Qué acaba de pasar!", "¡Me da algo!", "¡Literal gritando!"] },
  { id: "clap", emoji: "👏", label: "Bravo", color: "hsl(160, 70%, 50%)", sound: playClap, phrases: ["¡Bravo!", "¡Genial!", "¡Olé!", "¡Eres crack!", "¡Menuda pro!", "¡Qué top!", "¡Eso es, reina!"] },
  { id: "shock", emoji: "😮", label: "¡Qué fuerte!", color: "hsl(15, 90%, 55%)", sound: playShock, phrases: ["¡Qué fuerte!", "¡Madre mía!", "¡Flipa!", "¡Menuda bro!", "¡No puede ser!", "¡Estoy en shock!", "¡Alucino pepinillos!", "¡Dios mío!"] },
  { id: "sus", emoji: "🤨", label: "Sospechoso", color: "hsl(270, 70%, 60%)", sound: playSus, phrases: ["Sospechoso...", "No me fío", "¡Eres tú!", "Aquí hay gato encerrado", "Te tengo calada", "Eso ha sido muy sus", "Me huele raro..."] },
  { id: "love", emoji: "😍", label: "Me encanta", color: "hsl(340, 82%, 60%)", sound: playLove, phrases: ["¡Me encanta!", "¡Qué mono!", "¡Te quiero!", "¡Eres lo más!", "¡Crush total!", "¡Icono!", "¡Qué cuqui!", "¡Goals!"] },
  { id: "angry", emoji: "😤", label: "Grr", color: "hsl(0, 80%, 50%)", sound: playAngry, phrases: ["¡Grr!", "¡Qué rabia!", "¡No es justo!", "¡Estoy tilteada!", "¡Me pica!", "¡Vaya tela!", "¡Qué mal rollo!"] },
  { id: "think", emoji: "🤔", label: "Hmm", color: "hsl(210, 60%, 55%)", sound: playThink, phrases: ["Hmm...", "Déjame pensar...", "Interesante...", "A ver, a ver...", "Yo creo que...", "No sé, bro...", "Esto me mosquea..."] },
];

export const BOT_NAMES = ["Luna 🌙", "Mía 🦋", "Noa ⭐", "Alma 🌸"];
