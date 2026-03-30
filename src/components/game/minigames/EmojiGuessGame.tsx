import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type Difficulty = "easy" | "medium" | "hard";

type EmojiPuzzle = { emojis: string; answer: string; options: string[] };

const EMOJI_PUZZLES: Record<Difficulty, { es: EmojiPuzzle[]; en: EmojiPuzzle[] }> = {
  easy: {
    es: [
      { emojis: "🦁👑🌍", answer: "EL REY LEÓN", options: ["EL REY LEÓN", "TARZÁN", "MADAGASCAR", "KUNG FU PANDA"] },
      { emojis: "❄️👸⛄", answer: "FROZEN", options: ["FROZEN", "NARNIA", "BLANCANIEVES", "CENICIENTA"] },
      { emojis: "🧙‍♂️💍🌋", answer: "EL SEÑOR DE LOS ANILLOS", options: ["EL SEÑOR DE LOS ANILLOS", "HARRY POTTER", "NARNIA", "EL HOBBIT"] },
      { emojis: "🕷️🦸‍♂️🏙️", answer: "SPIDERMAN", options: ["SPIDERMAN", "BATMAN", "SUPERMAN", "IRON MAN"] },
      { emojis: "🐠🔍🌊", answer: "BUSCANDO A NEMO", options: ["BUSCANDO A NEMO", "LA SIRENITA", "MOANA", "TIBURÓN"] },
      { emojis: "🏴‍☠️⚓💀", answer: "PIRATAS DEL CARIBE", options: ["PIRATAS DEL CARIBE", "PETER PAN", "MOBY DICK", "LA ISLA DEL TESORO"] },
      { emojis: "🤖❤️🌱", answer: "WALL-E", options: ["WALL-E", "ROBOTS", "BIG HERO 6", "BAYMAX"] },
      { emojis: "🎈🏠👴", answer: "UP", options: ["UP", "CASA", "COCO", "SOUL"] },
    ],
    en: [
      { emojis: "🦁👑🌍", answer: "THE LION KING", options: ["THE LION KING", "TARZAN", "MADAGASCAR", "KUNG FU PANDA"] },
      { emojis: "❄️👸⛄", answer: "FROZEN", options: ["FROZEN", "NARNIA", "SNOW WHITE", "CINDERELLA"] },
      { emojis: "🧙‍♂️💍🌋", answer: "LORD OF THE RINGS", options: ["LORD OF THE RINGS", "HARRY POTTER", "NARNIA", "THE HOBBIT"] },
      { emojis: "🕷️🦸‍♂️🏙️", answer: "SPIDERMAN", options: ["SPIDERMAN", "BATMAN", "SUPERMAN", "IRON MAN"] },
      { emojis: "🐠🔍🌊", answer: "FINDING NEMO", options: ["FINDING NEMO", "LITTLE MERMAID", "MOANA", "JAWS"] },
      { emojis: "🏴‍☠️⚓💀", answer: "PIRATES OF THE CARIBBEAN", options: ["PIRATES OF THE CARIBBEAN", "PETER PAN", "MOBY DICK", "TREASURE ISLAND"] },
      { emojis: "🤖❤️🌱", answer: "WALL-E", options: ["WALL-E", "ROBOTS", "BIG HERO 6", "BAYMAX"] },
      { emojis: "🎈🏠👴", answer: "UP", options: ["UP", "HOME", "COCO", "SOUL"] },
    ],
  },
  medium: {
    es: [
      { emojis: "🧪👨‍🔬💊🏜️", answer: "BREAKING BAD", options: ["BREAKING BAD", "DEXTER", "HOUSE", "THE WALKING DEAD"] },
      { emojis: "👑⚔️🐉🏰", answer: "JUEGO DE TRONOS", options: ["JUEGO DE TRONOS", "EL SEÑOR DE LOS ANILLOS", "VIKINGOS", "THE WITCHER"] },
      { emojis: "🧟‍♂️🔫🌍💀", answer: "THE WALKING DEAD", options: ["THE WALKING DEAD", "RESIDENT EVIL", "GUERRA MUNDIAL Z", "28 DÍAS DESPUÉS"] },
      { emojis: "🏫📓💕🔺", answer: "EL JUEGO DEL CALAMAR", options: ["EL JUEGO DEL CALAMAR", "ALICE IN BORDERLAND", "BATTLE ROYALE", "HUNGER GAMES"] },
      { emojis: "🎤🎵✨💃", answer: "TAYLOR SWIFT", options: ["TAYLOR SWIFT", "BEYONCÉ", "ARIANA GRANDE", "BILLIE EILISH"] },
      { emojis: "⚽🐐🇦🇷", answer: "MESSI", options: ["MESSI", "MARADONA", "RONALDO", "NEYMAR"] },
      { emojis: "🎮⛏️🟫🧱", answer: "MINECRAFT", options: ["MINECRAFT", "ROBLOX", "TERRARIA", "FORTNITE"] },
      { emojis: "👻📱📸🗺️", answer: "POKÉMON GO", options: ["POKÉMON GO", "SNAPCHAT", "INSTAGRAM", "INGRESS"] },
    ],
    en: [
      { emojis: "🧪👨‍🔬💊🏜️", answer: "BREAKING BAD", options: ["BREAKING BAD", "DEXTER", "HOUSE", "THE WALKING DEAD"] },
      { emojis: "👑⚔️🐉🏰", answer: "GAME OF THRONES", options: ["GAME OF THRONES", "LORD OF THE RINGS", "VIKINGS", "THE WITCHER"] },
      { emojis: "🧟‍♂️🔫🌍💀", answer: "THE WALKING DEAD", options: ["THE WALKING DEAD", "RESIDENT EVIL", "WORLD WAR Z", "28 DAYS LATER"] },
      { emojis: "🏫📓💕🔺", answer: "SQUID GAME", options: ["SQUID GAME", "ALICE IN BORDERLAND", "BATTLE ROYALE", "HUNGER GAMES"] },
      { emojis: "🎤🎵✨💃", answer: "TAYLOR SWIFT", options: ["TAYLOR SWIFT", "BEYONCÉ", "ARIANA GRANDE", "BILLIE EILISH"] },
      { emojis: "⚽🐐🇦🇷", answer: "MESSI", options: ["MESSI", "MARADONA", "RONALDO", "NEYMAR"] },
      { emojis: "🎮⛏️🟫🧱", answer: "MINECRAFT", options: ["MINECRAFT", "ROBLOX", "TERRARIA", "FORTNITE"] },
      { emojis: "👻📱📸🗺️", answer: "POKÉMON GO", options: ["POKÉMON GO", "SNAPCHAT", "INSTAGRAM", "INGRESS"] },
    ],
  },
  hard: {
    es: [
      { emojis: "🔴💊🤖🕶️👨‍💻", answer: "MATRIX", options: ["MATRIX", "TERMINATOR", "BLADE RUNNER", "TRON"] },
      { emojis: "🎪🤡🎈📕😱", answer: "IT", options: ["IT", "JOKER", "EL CIRCO", "AMERICAN HORROR STORY"] },
      { emojis: "⏰🔙🚗⚡1️⃣9️⃣8️⃣5️⃣", answer: "REGRESO AL FUTURO", options: ["REGRESO AL FUTURO", "INTERSTELLAR", "TENET", "DOCTOR WHO"] },
      { emojis: "🧠💭😴🌀🏗️", answer: "ORIGEN", options: ["ORIGEN", "MATRIX", "DOCTOR STRANGE", "INTERSTELLAR"] },
      { emojis: "🎵🎧😢🔵💊", answer: "BILLIE EILISH", options: ["BILLIE EILISH", "LANA DEL REY", "OLIVIA RODRIGO", "SIA"] },
      { emojis: "🏠📺👨‍👩‍👧‍👦🍕😂", answer: "LOS SIMPSON", options: ["LOS SIMPSON", "FAMILY GUY", "MODERN FAMILY", "MALCOLM"] },
      { emojis: "🗡️⚡👦🏻🦉📜", answer: "HARRY POTTER", options: ["HARRY POTTER", "PERCY JACKSON", "NARNIA", "ERAGON"] },
      { emojis: "🎭🃏💚🦇🌃", answer: "JOKER", options: ["JOKER", "BATMAN", "LOKI", "DEADPOOL"] },
    ],
    en: [
      { emojis: "🔴💊🤖🕶️👨‍💻", answer: "MATRIX", options: ["MATRIX", "TERMINATOR", "BLADE RUNNER", "TRON"] },
      { emojis: "🎪🤡🎈📕😱", answer: "IT", options: ["IT", "JOKER", "THE CIRCUS", "AMERICAN HORROR STORY"] },
      { emojis: "⏰🔙🚗⚡1️⃣9️⃣8️⃣5️⃣", answer: "BACK TO THE FUTURE", options: ["BACK TO THE FUTURE", "INTERSTELLAR", "TENET", "DOCTOR WHO"] },
      { emojis: "🧠💭😴🌀🏗️", answer: "INCEPTION", options: ["INCEPTION", "MATRIX", "DOCTOR STRANGE", "INTERSTELLAR"] },
      { emojis: "🎵🎧😢🔵💊", answer: "BILLIE EILISH", options: ["BILLIE EILISH", "LANA DEL REY", "OLIVIA RODRIGO", "SIA"] },
      { emojis: "🏠📺👨‍👩‍👧‍👦🍕😂", answer: "THE SIMPSONS", options: ["THE SIMPSONS", "FAMILY GUY", "MODERN FAMILY", "MALCOLM"] },
      { emojis: "🗡️⚡👦🏻🦉📜", answer: "HARRY POTTER", options: ["HARRY POTTER", "PERCY JACKSON", "NARNIA", "ERAGON"] },
      { emojis: "🎭🃏💚🦇🌃", answer: "JOKER", options: ["JOKER", "BATMAN", "LOKI", "DEADPOOL"] },
    ],
  },
};

export const EmojiGuessGame = ({
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
    const pool = language === "en" ? EMOJI_PUZZLES[difficulty].en : EMOJI_PUZZLES[difficulty].es;
    return pool[Math.floor(Math.random() * pool.length)];
  });

  const [shuffledOptions] = useState(() => [...puzzle.options].sort(() => Math.random() - 0.5));
  const [selected, setSelected] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = difficulty === "easy" ? 3 : difficulty === "medium" ? 2 : 1;

  const handleSelect = (opt: string) => {
    setSelected(opt);
    if (opt === puzzle.answer) {
      onResult(true);
    } else {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= maxAttempts) {
        setTimeout(() => onResult(false), 400);
      } else {
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setSelected(null);
        }, 500);
      }
    }
  };

  // Reveal emojis progressively based on difficulty
  const emojiChars = [...puzzle.emojis.match(/\p{Emoji_Presentation}|\p{Emoji}\uFE0F|[0-9]\uFE0F\u20E3/gu) || puzzle.emojis.split("")];
  const visibleCount = difficulty === "hard"
    ? Math.max(2, emojiChars.length - 2)
    : difficulty === "medium"
    ? Math.max(3, emojiChars.length - 1)
    : emojiChars.length;

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="font-display text-sm font-bold text-foreground text-center">
        {t("emojiGuessTitle")}
      </p>
      <p className="font-body text-xs text-muted-foreground text-center">
        {t("emojiGuessHint")}
      </p>

      <motion.div
        animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="rounded-2xl bg-card px-6 py-5 shadow-soft"
      >
        <div className="flex items-center gap-2 text-4xl">
          {emojiChars.map((emoji, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: i < visibleCount ? 1 : 0.2, y: 0 }}
              transition={{ delay: i * 0.15 }}
            >
              {i < visibleCount ? emoji : "❓"}
            </motion.span>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
        {shuffledOptions.map((opt, i) => {
          const isWrong = selected === opt && opt !== puzzle.answer;
          return (
            <motion.div key={i} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={() => handleSelect(opt)}
                disabled={selected === opt && opt !== puzzle.answer}
                className={`w-full rounded-xl font-display text-xs font-bold py-3 h-auto transition-all ${
                  isWrong ? "bg-destructive/20 border-destructive line-through opacity-50" : ""
                }`}
                variant="outline"
              >
                {opt}
              </Button>
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-1 items-center">
        <span className="font-body text-xs text-muted-foreground">
          {t("attemptsLeft")}: 
        </span>
        {Array.from({ length: maxAttempts }).map((_, i) => (
          <span key={i} className={`text-sm ${i < attempts ? "opacity-30" : ""}`}>
            {i < attempts ? "💔" : "❤️"}
          </span>
        ))}
      </div>
    </div>
  );
};
