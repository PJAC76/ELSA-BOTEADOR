import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Timer, X } from "lucide-react";
import type { Zone } from "@/types/game";
import { ZONE_INFO } from "@/types/game";
import { playTaskComplete, playTaskFail, playTimerUrgent } from "@/lib/sounds";
import { useTranslation, useZoneNames } from "@/lib/i18n";
import { ConnectionsGame } from "./minigames/ConnectionsGame";
import { EmojiGuessGame } from "./minigames/EmojiGuessGame";
import { pickUnused, pickUnusedItem } from "@/lib/minigame-history";

type TaskMiniGameProps = { zone: Zone; round: number; onComplete: (success: boolean) => void; onCancel: () => void };
type MiniGameType = "word-unscramble" | "wire-connect" | "pattern-logic" | "connections" | "emoji-guess";
type Difficulty = "easy" | "medium" | "hard";

const getDifficulty = (round: number): Difficulty => {
  if (round <= 1) return "easy";
  if (round <= 2) return "medium";
  return "hard";
};

const getGameTime = (diff: Difficulty) => ({ easy: 15, medium: 18, hard: 22 }[diff]);

// ─── WORD UNSCRAMBLE ────────────────────────────────────────
const WORD_POOLS: Record<Difficulty, { es: string[]; en: string[] }> = {
  easy: {
    es: ["GATO", "LUNA", "CASA", "ROJO", "AGUA", "FLOR", "PATO", "MESA", "NUBE", "CIELO"],
    en: ["MOON", "FIRE", "BIRD", "STAR", "FISH", "TREE", "BOAT", "CAKE", "GOLD", "WIND"],
  },
  medium: {
    es: ["PIRATA", "DRAGON", "BOSQUE", "TESORO", "SIRENA", "CORONA", "ESPEJO", "PIEDRA", "TRUENO", "PLANTA"],
    en: ["PIRATE", "DRAGON", "FOREST", "SECRET", "PUZZLE", "SHADOW", "CASTLE", "ROCKET", "THRONE", "BRIDGE"],
  },
  hard: {
    es: ["VOLCAN", "GALAXIA", "TORNADO", "CASCADA", "RELAMPAGO", "UNICORNIO", "AVENTURA", "MISTERIO", "UNIVERSO", "FANTASMA"],
    en: ["VOLCANO", "TORNADO", "MYSTERY", "PHOENIX", "ECLIPSE", "LABYRINTH", "CRYSTAL", "SERPENT", "THUNDER", "HORIZON"],
  },
};

function scrambleWord(word: string): string {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const result = arr.join("");
  return result === word ? scrambleWord(word) : result;
}

const WordUnscrambleGame = ({ onResult, t, difficulty, language }: { onResult: (s: boolean) => void; t: (k: any) => string; difficulty: Difficulty; language: string }) => {
  const pool = language === "en" ? WORD_POOLS[difficulty].en : WORD_POOLS[difficulty].es;
  const [word] = useState(() => pickUnusedItem(`word-${difficulty}-${language}`, pool));
  const [scrambled] = useState(() => scrambleWord(word));
  const [guess, setGuess] = useState("");
  const [shake, setShake] = useState(false);
  const hintCount = difficulty === "easy" ? 2 : difficulty === "medium" ? 1 : 0;
  const [hints, setHints] = useState<number[]>([]);

  const revealHint = () => {
    if (hints.length >= hintCount) return;
    const unrevealed = word.split("").map((_, i) => i).filter((i) => !hints.includes(i));
    if (unrevealed.length > 0) {
      const idx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      setHints((h) => [...h, idx]);
    }
  };

  const handleSubmit = () => {
    const normalized = guess.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const target = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalized === target) {
      onResult(true);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="font-display text-sm font-bold text-foreground text-center">{t("unscrambleWord")}</p>
      <motion.div animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}} transition={{ duration: 0.4 }}
        className="rounded-2xl bg-card px-6 py-4 shadow-soft">
        <span className="font-display text-3xl font-black tracking-[0.3em] text-primary">{scrambled}</span>
      </motion.div>
      {/* Hint letters */}
      <div className="flex gap-2">
        {word.split("").map((letter, i) => (
          <div key={i} className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 font-display text-lg font-bold transition-all ${
            hints.includes(i) ? "border-accent bg-accent/20 text-accent" : "border-muted bg-muted/30 text-transparent"
          }`}>
            {hints.includes(i) ? letter : "·"}
          </div>
        ))}
      </div>
      <div className="flex gap-2 w-full max-w-xs">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={t("typeAnswer")}
          maxLength={word.length + 2}
          className="flex-1 rounded-xl border-2 border-muted bg-card px-4 py-3 font-display text-lg font-bold text-foreground text-center placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          autoFocus
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSubmit} className="rounded-xl font-display font-bold" size="lg">{t("confirm")}</Button>
        {hintCount > 0 && hints.length < hintCount && (
          <Button onClick={revealHint} variant="outline" className="rounded-xl font-display text-xs">
            💡 {t("hint")} ({hintCount - hints.length})
          </Button>
        )}
      </div>
    </div>
  );
};

// ─── WIRE CONNECT (themed puzzle) ───────────────────────────
type WirePair = { left: string; right: string };

const WIRE_SETS: Record<Difficulty, WirePair[][]> = {
  easy: [
    [{ left: "🔌", right: "💡" }, { left: "🔑", right: "🔒" }, { left: "☁️", right: "🌧️" }],
    [{ left: "🌱", right: "🌳" }, { left: "🥚", right: "🐣" }, { left: "🎵", right: "🎶" }],
    [{ left: "🌕", right: "🌑" }, { left: "📝", right: "✏️" }, { left: "🧊", right: "💧" }],
    [{ left: "🌸", right: "🍯" }, { left: "⛅", right: "🌈" }, { left: "🪵", right: "🔥" }],
    [{ left: "🐛", right: "🦋" }, { left: "📦", right: "🎁" }, { left: "🌾", right: "🍞" }],
    [{ left: "🧲", right: "🔩" }, { left: "🎨", right: "🖼️" }, { left: "🪴", right: "🌻" }],
  ],
  medium: [
    [{ left: "🔌", right: "💡" }, { left: "🔑", right: "🔒" }, { left: "☁️", right: "🌧️" }, { left: "🌱", right: "🌳" }],
    [{ left: "📡", right: "📺" }, { left: "🔋", right: "📱" }, { left: "💧", right: "🌊" }, { left: "🪨", right: "⛰️" }],
    [{ left: "🥚", right: "🐣" }, { left: "🌕", right: "🌑" }, { left: "🧊", right: "💧" }, { left: "🎵", right: "💃" }],
    [{ left: "🐛", right: "🦋" }, { left: "🌸", right: "🍯" }, { left: "📝", right: "📖" }, { left: "⚡", right: "💡" }],
    [{ left: "🧬", right: "🔬" }, { left: "🪵", right: "🔥" }, { left: "🧲", right: "🔩" }, { left: "🌾", right: "🍞" }],
    [{ left: "🎨", right: "🖼️" }, { left: "🪴", right: "🌻" }, { left: "📦", right: "🎁" }, { left: "⛅", right: "🌈" }],
  ],
  hard: [
    [{ left: "🔌", right: "💡" }, { left: "🔑", right: "🔒" }, { left: "☁️", right: "🌧️" }, { left: "🌱", right: "🌳" }, { left: "📡", right: "📺" }],
    [{ left: "🧬", right: "🔬" }, { left: "🪐", right: "🚀" }, { left: "🎭", right: "🎪" }, { left: "⚡", right: "🔋" }, { left: "🧩", right: "🖼️" }],
    [{ left: "🐛", right: "🦋" }, { left: "🌸", right: "🍯" }, { left: "🪵", right: "🔥" }, { left: "🧊", right: "💧" }, { left: "🌕", right: "🌑" }],
    [{ left: "📝", right: "📖" }, { left: "🧲", right: "🔩" }, { left: "🌾", right: "🍞" }, { left: "🥚", right: "🐣" }, { left: "🎨", right: "🖼️" }],
    [{ left: "🪴", right: "🌻" }, { left: "📦", right: "🎁" }, { left: "⛅", right: "🌈" }, { left: "🎵", right: "💃" }, { left: "📡", right: "📺" }],
  ],
};

const WireConnectGame = ({ onResult, t, difficulty }: { onResult: (s: boolean) => void; t: (k: any) => string; difficulty: Difficulty }) => {
  const [pairs] = useState(() => {
    const sets = WIRE_SETS[difficulty];
    const idx = pickUnused(`wire-${difficulty}`, sets.length);
    return sets[idx];
  });
  const [shuffledRight] = useState(() => [...pairs].sort(() => Math.random() - 0.5));
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [connections, setConnections] = useState<Map<number, number>>(new Map());
  const [wrongPair, setWrongPair] = useState<[number, number] | null>(null);

  const handleLeftClick = (idx: number) => {
    if (connections.has(idx)) return;
    setSelectedLeft(idx);
    setWrongPair(null);
  };

  const handleRightClick = (rightIdx: number) => {
    if (selectedLeft === null) return;
    // Check if this right is already connected
    const alreadyUsed = Array.from(connections.values()).includes(rightIdx);
    if (alreadyUsed) return;

    const leftEmoji = pairs[selectedLeft].left;
    const rightEmoji = shuffledRight[rightIdx].right;
    const correct = pairs.some((p) => p.left === leftEmoji && p.right === rightEmoji);

    if (correct) {
      const newConn = new Map(connections);
      newConn.set(selectedLeft, rightIdx);
      setConnections(newConn);
      setSelectedLeft(null);
      if (newConn.size === pairs.length) onResult(true);
    } else {
      setWrongPair([selectedLeft, rightIdx]);
      setTimeout(() => { setWrongPair(null); setSelectedLeft(null); }, 600);
    }
  };

  const isRightConnected = (ri: number) => Array.from(connections.values()).includes(ri);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-display text-sm font-bold text-foreground text-center">{t("connectWires")}</p>
      <p className="font-body text-xs text-muted-foreground">{t("connectWiresHint")}</p>
      <div className="flex gap-8">
        {/* Left column */}
        <div className="flex flex-col gap-3">
          {pairs.map((pair, i) => (
            <motion.button key={i}
              animate={wrongPair?.[0] === i ? { x: [-4, 4, -4, 4, 0] } : {}}
              onClick={() => handleLeftClick(i)}
              className={`flex h-14 w-14 items-center justify-center rounded-xl text-2xl shadow-soft transition-all ${
                connections.has(i) ? "bg-accent/30 border-2 border-accent" :
                selectedLeft === i ? "bg-primary/20 border-2 border-primary scale-110" :
                "bg-card border-2 border-muted hover:border-primary/50"
              }`}>{pair.left}</motion.button>
          ))}
        </div>
        {/* Connection lines visual */}
        <div className="flex items-center">
          <div className="flex flex-col gap-3">
            {pairs.map((_, i) => (
              <div key={i} className={`h-14 flex items-center`}>
                <div className={`h-0.5 w-8 transition-colors ${connections.has(i) ? "bg-accent" : "bg-muted"}`} />
              </div>
            ))}
          </div>
        </div>
        {/* Right column */}
        <div className="flex flex-col gap-3">
          {shuffledRight.map((pair, i) => (
            <motion.button key={i}
              animate={wrongPair?.[1] === i ? { x: [-4, 4, -4, 4, 0] } : {}}
              onClick={() => handleRightClick(i)}
              className={`flex h-14 w-14 items-center justify-center rounded-xl text-2xl shadow-soft transition-all ${
                isRightConnected(i) ? "bg-accent/30 border-2 border-accent" :
                "bg-card border-2 border-muted hover:border-primary/50"
              }`}>{pair.right}</motion.button>
          ))}
        </div>
      </div>
      <p className="font-body text-xs text-muted-foreground">{connections.size}/{pairs.length} ✓</p>
    </div>
  );
};

// ─── PATTERN LOGIC ──────────────────────────────────────────
const SHAPE_SETS = ["🔵🔴🔵🔴", "⭐🌙⭐🌙", "🟢🟡🔵🟢", "🔺🔻🔺🔻", "💎❤️💎❤️", "🟣🟠🟣🟠", "🔷🔶🔷🔶"];
const HARD_PATTERNS = ["🔵🔴🔵🔵🔴🔵", "⭐⭐🌙⭐⭐🌙", "🟢🟡🔵🟢🟡🔵", "💎💎❤️💎💎❤️", "🟣🟠🟣🟣🟠🟣", "🔷🔶🔶🔷🔶🔶"];

function generatePatternPuzzle(diff: Difficulty): { sequence: string[]; answer: string; options: string[] } {
  if (diff === "easy") {
    // Simple AB pattern
    const idx = pickUnused("pattern-easy", SHAPE_SETS.length);
    const setStr = SHAPE_SETS[idx];
    const emojis = [...setStr.match(/./gu)!];
    const patLen = 2;
    const pattern = emojis.slice(0, patLen);
    const sequence = [];
    for (let i = 0; i < 5; i++) sequence.push(pattern[i % patLen]);
    const answer = pattern[5 % patLen];
    const others = emojis.filter((e) => e !== answer);
    const options = [answer, ...others.slice(0, 3)].sort(() => Math.random() - 0.5);
    return { sequence, answer, options };
  } else if (diff === "medium") {
    // ABC pattern
    const emojis = ["🔵", "🔴", "🟡", "🟢", "🟣"];
    const patLen = 3;
    const shuffled = [...emojis].sort(() => Math.random() - 0.5);
    const pattern = shuffled.slice(0, patLen);
    const sequence = [];
    for (let i = 0; i < 7; i++) sequence.push(pattern[i % patLen]);
    const answer = pattern[7 % patLen];
    const options = [answer, ...shuffled.filter((e) => e !== answer).slice(0, 3)].sort(() => Math.random() - 0.5);
    return { sequence, answer, options };
  } else {
    // AABAA pattern
    const hidx = pickUnused("pattern-hard", HARD_PATTERNS.length);
    const setStr = HARD_PATTERNS[hidx];
    const emojis = [...setStr.match(/./gu)!];
    const uniqueEmojis = [...new Set(emojis)];
    const patLen = emojis.length;
    const sequence = [...emojis, emojis[0]]; // repeat start
    const answer = emojis[1 % patLen];
    // Remove last and make it the question
    sequence.pop();
    const all = ["🔵", "🔴", "🟡", "🟢", "🟣", "⭐", "🌙", "💎", "❤️", "🔺", "🔻"];
    const others = all.filter((e) => e !== answer && !uniqueEmojis.includes(e));
    const options = [answer, ...others.slice(0, 3)].sort(() => Math.random() - 0.5);
    return { sequence, answer, options };
  }
}

const PatternLogicGame = ({ onResult, t, difficulty }: { onResult: (s: boolean) => void; t: (k: any) => string; difficulty: Difficulty }) => {
  const [puzzle] = useState(() => generatePatternPuzzle(difficulty));
  const [selected, setSelected] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const handleSelect = (opt: string) => {
    setSelected(opt);
    if (opt === puzzle.answer) {
      onResult(true);
    } else {
      setShake(true);
      setTimeout(() => { setShake(false); setSelected(null); }, 500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="font-display text-sm font-bold text-foreground text-center">{t("completePattern")}</p>
      <motion.div animate={shake ? { x: [-6, 6, -6, 6, 0] } : {}} className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-soft">
        {puzzle.sequence.map((emoji, i) => (
          <span key={i} className="text-2xl">{emoji}</span>
        ))}
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-dashed border-primary text-xl font-bold text-primary">?</span>
      </motion.div>
      <div className="grid grid-cols-2 gap-3">
        {puzzle.options.map((opt, i) => (
          <Button key={i} onClick={() => handleSelect(opt)}
            className={`h-16 w-20 rounded-2xl text-2xl transition-all ${selected === opt && opt !== puzzle.answer ? "bg-destructive/20 border-destructive" : ""}`}
            variant="outline">{opt}</Button>
        ))}
      </div>
      <p className="font-body text-xs text-muted-foreground">
        {difficulty === "easy" ? "A-B" : difficulty === "medium" ? "A-B-C" : "A-A-B"} {t("patternType")}
      </p>
    </div>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────
const MINI_GAMES: MiniGameType[] = ["word-unscramble", "wire-connect", "pattern-logic", "connections", "emoji-guess"];

const TaskMiniGame = ({ zone, round, onComplete, onCancel }: TaskMiniGameProps) => {
  const [gameType] = useState<MiniGameType>(() => MINI_GAMES[Math.floor(Math.random() * MINI_GAMES.length)]);
  const difficulty = getDifficulty(round);
  const [timeLeft, setTimeLeft] = useState(() => getGameTime(difficulty));
  const [result, setResult] = useState<"playing" | "success" | "fail">("playing");
  const info = ZONE_INFO[zone];
  const { t, language } = useTranslation();
  const zoneNames = useZoneNames();

  useEffect(() => {
    if (result !== "playing") return;
    const interval = setInterval(() => {
      setTimeLeft((tl) => { if (tl <= 1) { setResult("fail"); return 0; } if (tl <= 5) playTimerUrgent(); return tl - 1; });
    }, 1000);
    return () => clearInterval(interval);
  }, [result]);

  const handleResult = (success: boolean) => { setResult(success ? "success" : "fail"); if (success) playTaskComplete(); else playTaskFail(); };

  useEffect(() => {
    if (result === "success" || result === "fail") {
      const timer = setTimeout(() => onComplete(result === "success"), 1500);
      return () => clearTimeout(timer);
    }
  }, [result, onComplete]);

  const diffLabel = difficulty === "easy" ? "⭐" : difficulty === "medium" ? "⭐⭐" : "⭐⭐⭐";

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 pt-4 safe-top">
        <div className="flex items-center gap-2">
          <span className="text-xl">{info.emoji}</span>
          <span className="font-display text-sm font-bold text-foreground">{t("taskLabel")}: {zoneNames[zone]}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{diffLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 rounded-full px-3 py-1 font-display text-xs font-bold ${timeLeft <= 5 ? "bg-destructive/20 text-destructive animate-pulse" : "bg-muted text-muted-foreground"}`}>
            <Timer className="h-3 w-3" />{timeLeft}s
          </div>
          <button onClick={onCancel} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {result === "playing" ? (
            <motion.div key="game">
              {gameType === "word-unscramble" && <WordUnscrambleGame onResult={handleResult} t={t} difficulty={difficulty} language={language} />}
              {gameType === "wire-connect" && <WireConnectGame onResult={handleResult} t={t} difficulty={difficulty} />}
              {gameType === "pattern-logic" && <PatternLogicGame onResult={handleResult} t={t} difficulty={difficulty} />}
              {gameType === "connections" && <ConnectionsGame onResult={handleResult} t={t} difficulty={difficulty} language={language} />}
              {gameType === "emoji-guess" && <EmojiGuessGame onResult={handleResult} t={t} difficulty={difficulty} language={language} />}
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-3">
              <span className="text-6xl">{result === "success" ? "✅" : "❌"}</span>
              <p className="font-display text-xl font-bold text-foreground">{result === "success" ? t("taskCompleted") : t("taskFailed")}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TaskMiniGame;
