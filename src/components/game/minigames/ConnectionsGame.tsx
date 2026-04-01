import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CONNECTIONS_PUZZLES } from "@/data/connections-puzzles";
import { pickUnused } from "@/lib/minigame-history";

type Difficulty = "easy" | "medium" | "hard";

const CATEGORY_COLORS = [
  "bg-primary/25 border-primary text-primary",
  "bg-accent/25 border-accent text-accent",
  "bg-secondary/50 border-secondary-foreground/30 text-secondary-foreground",
  "bg-destructive/20 border-destructive text-destructive",
];

export const ConnectionsGame = ({
  onResult,
  t,
  difficulty,
  language,
}: {
  onResult: (s: boolean) => void;
  t: (k: any) => string;
  difficulty: Difficulty;
  language: string;
}) => {
  const [puzzle] = useState(() => {
    const pool = language === "en" ? CONNECTIONS_PUZZLES[difficulty].en : CONNECTIONS_PUZZLES[difficulty].es;
    return pool[Math.floor(Math.random() * pool.length)];
  });

  const [allWords] = useState(() => {
    const words = puzzle.flatMap((g, gi) => g.words.map((w) => ({ word: w, groupIdx: gi })));
    return words.sort(() => Math.random() - 0.5);
  });

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [shake, setShake] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const maxMistakes = difficulty === "easy" ? 4 : difficulty === "medium" ? 3 : 2;

  const wordsPerGroup = puzzle[0].words.length;

  const toggleWord = (idx: number) => {
    if (solved.has(allWords[idx].groupIdx)) return;
    const next = new Set(selected);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      if (next.size >= wordsPerGroup) return;
      next.add(idx);
    }
    setSelected(next);
  };

  const handleSubmit = () => {
    if (selected.size !== wordsPerGroup) return;
    const selectedArr = Array.from(selected);
    const groupIdx = allWords[selectedArr[0]].groupIdx;
    const allSameGroup = selectedArr.every((i) => allWords[i].groupIdx === groupIdx);

    if (allSameGroup) {
      const newSolved = new Set(solved);
      newSolved.add(groupIdx);
      setSolved(newSolved);
      setSelected(new Set());
      if (newSolved.size === puzzle.length) {
        onResult(true);
      }
    } else {
      setMistakes((m) => {
        const next = m + 1;
        if (next >= maxMistakes) {
          setTimeout(() => onResult(false), 400);
        }
        return next;
      });
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-display text-sm font-bold text-foreground text-center">
        {t("connectionsTitle")}
      </p>
      <p className="font-body text-xs text-muted-foreground text-center">
        {t("connectionsHint").replace("{n}", String(wordsPerGroup))}
      </p>

      {/* Solved groups */}
      {Array.from(solved).map((gi) => (
        <motion.div
          key={gi}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`w-full max-w-xs rounded-xl border-2 px-3 py-2 text-center ${CATEGORY_COLORS[gi % CATEGORY_COLORS.length]}`}
        >
          <p className="font-display text-xs font-bold">{puzzle[gi].category}</p>
          <p className="font-body text-xs">{puzzle[gi].words.join(" · ")}</p>
        </motion.div>
      ))}

      {/* Word grid */}
      <motion.div
        animate={shake ? { x: [-6, 6, -6, 6, 0] } : {}}
        className="grid grid-cols-3 gap-2 w-full max-w-xs"
      >
        {allWords.map((item, idx) => {
          if (solved.has(item.groupIdx)) return null;
          const isSelected = selected.has(idx);
          return (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleWord(idx)}
              className={`rounded-xl px-2 py-3 font-display text-xs font-bold transition-all border-2 ${
                isSelected
                  ? "bg-primary/20 border-primary text-primary scale-105"
                  : "bg-card border-muted text-foreground hover:border-primary/40"
              }`}
            >
              {item.word}
            </motion.button>
          );
        })}
      </motion.div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSubmit}
          disabled={selected.size !== wordsPerGroup}
          className="rounded-xl font-display font-bold"
          size="lg"
        >
          {t("confirm")}
        </Button>
        <div className="flex gap-1">
          {Array.from({ length: maxMistakes }).map((_, i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-full transition-colors ${
                i < mistakes ? "bg-destructive" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <p className="font-body text-xs text-muted-foreground">
        {solved.size}/{puzzle.length} {t("groupsSolved")}
      </p>
    </div>
  );
};
