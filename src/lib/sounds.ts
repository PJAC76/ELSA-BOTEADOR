/**
 * Synthesized sound effects using Web Audio API.
 * No external files or backend needed.
 */

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

// --- Helpers ---

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.15,
  rampDown = true
) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  if (rampDown) {
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  }
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playNotes(
  notes: { freq: number; time: number; dur: number }[],
  type: OscillatorType = "sine",
  volume = 0.12
) {
  const ctx = getCtx();
  notes.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + time);
    osc.stop(ctx.currentTime + time + dur);
  });
}

// --- Public API ---

/** Urgent tick when timer ≤ 5s */
export function playTimerUrgent() {
  playTone(880, 0.08, "square", 0.1);
}

/** Task completed successfully */
export function playTaskComplete() {
  playNotes(
    [
      { freq: 523, time: 0, dur: 0.12 },
      { freq: 659, time: 0.1, dur: 0.12 },
      { freq: 784, time: 0.2, dur: 0.25 },
    ],
    "sine",
    0.15
  );
}

/** Task failed */
export function playTaskFail() {
  playNotes(
    [
      { freq: 400, time: 0, dur: 0.15 },
      { freq: 300, time: 0.15, dur: 0.3 },
    ],
    "sawtooth",
    0.08
  );
}

/** Sabotage activated */
export function playSabotage() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.value = 200;
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
  gain.gain.value = 0.12;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.5);
}

/** Victory jingle */
export function playVictory() {
  playNotes(
    [
      { freq: 523, time: 0, dur: 0.15 },
      { freq: 659, time: 0.12, dur: 0.15 },
      { freq: 784, time: 0.24, dur: 0.15 },
      { freq: 1047, time: 0.4, dur: 0.5 },
    ],
    "sine",
    0.18
  );
}

/** Defeat sound */
export function playDefeat() {
  playNotes(
    [
      { freq: 392, time: 0, dur: 0.25 },
      { freq: 349, time: 0.2, dur: 0.25 },
      { freq: 311, time: 0.4, dur: 0.25 },
      { freq: 261, time: 0.6, dur: 0.6 },
    ],
    "triangle",
    0.14
  );
}

/** Round complete chime */
export function playRoundComplete() {
  playNotes(
    [
      { freq: 660, time: 0, dur: 0.15 },
      { freq: 880, time: 0.15, dur: 0.3 },
    ],
    "sine",
    0.14
  );
}

/** Button tap feedback */
export function playTap() {
  playTone(600, 0.05, "sine", 0.06);
}
