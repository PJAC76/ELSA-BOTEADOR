/**
 * ✨ ASMR-style satisfying sound effects using Web Audio API.
 * Layered, textured, and trending — no external files needed.
 */

const SOUND_KEY = "sound-enabled";

let _soundEnabled: boolean | null = null;

export function isSoundEnabled(): boolean {
  if (_soundEnabled === null) {
    _soundEnabled = localStorage.getItem(SOUND_KEY) !== "false";
  }
  return _soundEnabled;
}

export function setSoundEnabled(enabled: boolean) {
  _soundEnabled = enabled;
  localStorage.setItem(SOUND_KEY, String(enabled));
}

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// ─── Helpers ───────────────────────────────────────────

/** Create a convolver node for lush reverb */
function createReverb(ctx: AudioContext, decay = 1.5): ConvolverNode {
  const rate = ctx.sampleRate;
  const length = rate * decay;
  const impulse = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
    }
  }
  const conv = ctx.createConvolver();
  conv.buffer = impulse;
  return conv;
}

/** Short burst of filtered white noise (satisfying "psh" / "click") */
function playNoiseBurst(
  freq: number,
  duration: number,
  volume = 0.08,
  q = 8
) {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = q;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start();
  src.stop(ctx.currentTime + duration);
}

/** Shimmer: a detuned sine pair with slow fade — sparkly ASMR texture */
function playShimmer(
  freq: number,
  duration: number,
  volume = 0.06,
  detune = 6
) {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const now = ctx.currentTime;

  const reverb = createReverb(ctx, 1.2);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  for (const d of [-detune, detune]) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.detune.value = d;
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + duration);
  }

  gain.connect(reverb).connect(ctx.destination);
}

/** Satisfying "pop" — sine with fast attack and subtle noise layer */
function playPop(freq = 800, volume = 0.12) {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Sine pop
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq * 1.5, now);
  osc.frequency.exponentialRampToValueAtTime(freq, now + 0.04);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);

  // Noise texture layer
  playNoiseBurst(freq * 2, 0.06, volume * 0.3, 4);
}

/** Melodic notes with reverb and optional shimmer tail */
function playMelody(
  notes: { freq: number; time: number; dur: number }[],
  type: OscillatorType = "sine",
  volume = 0.1,
  addShimmer = true,
  reverbDecay = 1.0
) {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  const reverb = createReverb(ctx, reverbDecay);
  const masterGain = ctx.createGain();
  masterGain.gain.value = 1;
  masterGain.connect(reverb).connect(ctx.destination);
  // Also connect dry signal
  const dryGain = ctx.createGain();
  dryGain.gain.value = 0.7;
  dryGain.connect(ctx.destination);

  notes.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;

    const envGain = ctx.createGain();
    envGain.gain.setValueAtTime(0.001, now + time);
    // Soft attack
    envGain.gain.linearRampToValueAtTime(volume, now + time + 0.02);
    envGain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

    osc.connect(envGain);
    envGain.connect(masterGain);
    envGain.connect(dryGain);
    osc.start(now + time);
    osc.stop(now + time + dur + 0.1);
  });

  if (addShimmer && notes.length > 0) {
    const lastNote = notes[notes.length - 1];
    const shimmerStart = lastNote.time + lastNote.dur * 0.4;
    setTimeout(() => {
      playShimmer(lastNote.freq * 2, 0.8, volume * 0.3);
    }, shimmerStart * 1000);
  }
}

// ─── Public API ────────────────────────────────────────

/** Button tap — soft pop with gentle "click" ASMR feel */
export function playTap() {
  playPop(900, 0.07);
}

/** Task completed — satisfying ascending chime with shimmer ✨ */
export function playTaskComplete() {
  playMelody(
    [
      { freq: 523, time: 0, dur: 0.18 },
      { freq: 659, time: 0.12, dur: 0.18 },
      { freq: 784, time: 0.24, dur: 0.18 },
      { freq: 1047, time: 0.38, dur: 0.45 },
    ],
    "sine",
    0.13,
    true,
    1.5
  );
  // Extra satisfying pop on last note
  setTimeout(() => playPop(1200, 0.06), 380);
  // Sparkle noise burst
  setTimeout(() => playNoiseBurst(6000, 0.15, 0.04, 3), 450);
}

/** Task failed — soft descending with muffled texture */
export function playTaskFail() {
  playMelody(
    [
      { freq: 440, time: 0, dur: 0.2 },
      { freq: 349, time: 0.18, dur: 0.2 },
      { freq: 293, time: 0.36, dur: 0.35 },
    ],
    "triangle",
    0.09,
    false,
    0.6
  );
  playNoiseBurst(300, 0.3, 0.03, 2);
}

/** Timer urgent — gentle but tense ticking, not harsh */
export function playTimerUrgent() {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Soft wooden "tick"
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.03);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.06);

  playNoiseBurst(3000, 0.03, 0.04, 12);
}

/** Sabotage — dramatic whoosh with deep sub-bass rumble */
export function playSabotage() {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Deep rumble
  const subOsc = ctx.createOscillator();
  subOsc.type = "sine";
  subOsc.frequency.setValueAtTime(80, now);
  subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.6);

  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(0.15, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

  subOsc.connect(subGain).connect(ctx.destination);
  subOsc.start(now);
  subOsc.stop(now + 0.7);

  // Swoosh noise
  playNoiseBurst(800, 0.5, 0.1, 3);

  // Eerie shimmer
  playShimmer(220, 0.8, 0.06, 15);
}

/** Victory — euphoric ascending melody with sparkle layers 🎉 */
export function playVictory() {
  playMelody(
    [
      { freq: 523, time: 0, dur: 0.15 },
      { freq: 659, time: 0.1, dur: 0.15 },
      { freq: 784, time: 0.2, dur: 0.15 },
      { freq: 880, time: 0.3, dur: 0.15 },
      { freq: 1047, time: 0.42, dur: 0.6 },
    ],
    "sine",
    0.15,
    true,
    2.0
  );

  // Layered sparkle pops
  setTimeout(() => playPop(1200, 0.05), 300);
  setTimeout(() => playPop(1500, 0.04), 420);
  setTimeout(() => playPop(1800, 0.04), 500);

  // Grand shimmer finale
  setTimeout(() => playShimmer(1047, 1.2, 0.08, 8), 550);

  // Satisfying noise sweep
  setTimeout(() => playNoiseBurst(4000, 0.3, 0.05, 2), 450);
}

/** Defeat — melancholic descend with warm reverb */
export function playDefeat() {
  playMelody(
    [
      { freq: 440, time: 0, dur: 0.3 },
      { freq: 392, time: 0.25, dur: 0.3 },
      { freq: 349, time: 0.5, dur: 0.3 },
      { freq: 293, time: 0.75, dur: 0.7 },
    ],
    "triangle",
    0.1,
    false,
    2.0
  );

  // Soft exhale noise
  setTimeout(() => playNoiseBurst(500, 0.5, 0.03, 1.5), 800);
}

/** Round complete — clean two-note chime with sparkle ✨ */
export function playRoundComplete() {
  playMelody(
    [
      { freq: 660, time: 0, dur: 0.2 },
      { freq: 990, time: 0.15, dur: 0.4 },
    ],
    "sine",
    0.12,
    true,
    1.2
  );
  setTimeout(() => playPop(1100, 0.04), 200);
}

/** Vote alarm — tense rising sequence, cinematic but not jarring */
export function playVoteAlarm() {
  playMelody(
    [
      { freq: 440, time: 0, dur: 0.12 },
      { freq: 523, time: 0.1, dur: 0.12 },
      { freq: 622, time: 0.2, dur: 0.12 },
      { freq: 740, time: 0.3, dur: 0.25 },
    ],
    "triangle",
    0.1,
    false,
    0.8
  );

  // Suspenseful noise layer
  playNoiseBurst(1500, 0.4, 0.04, 5);
}

/** Player eliminated — dramatic descending whoosh */
export function playElimination() {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Descending tone
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(700, now);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.6);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

  const reverb = createReverb(ctx, 1.5);
  osc.connect(gain).connect(reverb).connect(ctx.destination);
  // Dry path
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.7);

  // Impact noise
  setTimeout(() => playNoiseBurst(200, 0.2, 0.08, 3), 400);
}

/** Combo hit — satisfying "ding" that escalates with combo count */
export function playComboHit(comboLevel = 1) {
  const baseFreq = 800 + comboLevel * 150;
  playPop(Math.min(baseFreq, 2000), 0.08 + comboLevel * 0.01);
  playShimmer(baseFreq * 1.5, 0.3, 0.03 + comboLevel * 0.01, 4 + comboLevel);
}

/** Reward / XP gained — sparkly ascending arpeggio */
export function playReward() {
  playMelody(
    [
      { freq: 659, time: 0, dur: 0.12 },
      { freq: 784, time: 0.08, dur: 0.12 },
      { freq: 988, time: 0.16, dur: 0.12 },
      { freq: 1175, time: 0.24, dur: 0.3 },
    ],
    "sine",
    0.1,
    true,
    1.0
  );
  setTimeout(() => playNoiseBurst(5000, 0.1, 0.03, 5), 250);
}

/** Purchase / unlock — satisfying "ka-ching" pop cascade */
export function playPurchase() {
  playPop(1000, 0.1);
  setTimeout(() => playPop(1300, 0.08), 80);
  setTimeout(() => playPop(1600, 0.06), 160);
  setTimeout(() => playShimmer(1600, 0.6, 0.05, 10), 200);
}

/** Equip item — soft attach "click" */
export function playEquip() {
  playPop(700, 0.06);
  playNoiseBurst(2000, 0.05, 0.04, 10);
}

/** Navigation / screen transition — gentle whoosh */
export function playNavigate() {
  playNoiseBurst(1500, 0.15, 0.04, 2);
  playShimmer(600, 0.3, 0.03, 3);
}

/** Notification / toast — soft bell ding */
export function playNotification() {
  playMelody(
    [
      { freq: 880, time: 0, dur: 0.15 },
      { freq: 1100, time: 0.1, dur: 0.25 },
    ],
    "sine",
    0.08,
    true,
    0.8
  );
}
