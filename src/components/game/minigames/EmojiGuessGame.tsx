import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { pickUnused } from "@/lib/minigame-history";

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
      // Reggaetón fácil
      { emojis: "🐺🌙🎤", answer: "SHAKIRA", options: ["SHAKIRA", "ROSALÍA", "KAROL G", "ANITTA"] },
      { emojis: "🏎️💨🎵🔥", answer: "BAD BUNNY", options: ["BAD BUNNY", "DADDY YANKEE", "OZUNA", "ANUEL AA"] },
      { emojis: "🌺🦋💃🇨🇴", answer: "KAROL G", options: ["KAROL G", "SHAKIRA", "BECKY G", "NATTI NATASHA"] },
      // Series Netflix fácil
      { emojis: "👧🔦👾🚲", answer: "STRANGER THINGS", options: ["STRANGER THINGS", "IT", "DARK", "LOCKE & KEY"] },
      { emojis: "💰🏦🔴👨‍🔧", answer: "LA CASA DE PAPEL", options: ["LA CASA DE PAPEL", "LUPIN", "OZARK", "BREAKING BAD"] },
      // TikTokers
      { emojis: "📱💃✨😂", answer: "LOLA LOLITA", options: ["LOLA LOLITA", "NAIM DARRECHI", "IBAI", "RIVERS"] },
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
      { emojis: "🐺🌙🎤", answer: "SHAKIRA", options: ["SHAKIRA", "ROSALÍA", "KAROL G", "ANITTA"] },
      { emojis: "🏎️💨🎵🔥", answer: "BAD BUNNY", options: ["BAD BUNNY", "DADDY YANKEE", "OZUNA", "ANUEL AA"] },
      { emojis: "🌺🦋💃🇨🇴", answer: "KAROL G", options: ["KAROL G", "SHAKIRA", "BECKY G", "NATTI NATASHA"] },
      { emojis: "👧🔦👾🚲", answer: "STRANGER THINGS", options: ["STRANGER THINGS", "IT", "DARK", "LOCKE & KEY"] },
      { emojis: "💰🏦🔴👨‍🔧", answer: "MONEY HEIST", options: ["MONEY HEIST", "LUPIN", "OZARK", "BREAKING BAD"] },
      { emojis: "📱💃✨😂", answer: "LOLA LOLITA", options: ["LOLA LOLITA", "NAIM DARRECHI", "IBAI", "RIVERS"] },
    ],
  },
  medium: {
    es: [
      { emojis: "🧪👨‍🔬💊🏜️", answer: "BREAKING BAD", options: ["BREAKING BAD", "DEXTER", "HOUSE", "THE WALKING DEAD"] },
      { emojis: "👑⚔️🐉🏰", answer: "JUEGO DE TRONOS", options: ["JUEGO DE TRONOS", "EL SEÑOR DE LOS ANILLOS", "VIKINGOS", "THE WITCHER"] },
      { emojis: "🏫📓💕🔺", answer: "EL JUEGO DEL CALAMAR", options: ["EL JUEGO DEL CALAMAR", "ALICE IN BORDERLAND", "BATTLE ROYALE", "HUNGER GAMES"] },
      { emojis: "🎮⛏️🟫🧱", answer: "MINECRAFT", options: ["MINECRAFT", "ROBLOX", "TERRARIA", "FORTNITE"] },
      { emojis: "👻📱📸🗺️", answer: "POKÉMON GO", options: ["POKÉMON GO", "SNAPCHAT", "INSTAGRAM", "INGRESS"] },
      // Reggaetón medio
      { emojis: "🏍️🖤🇵🇷🐰", answer: "BAD BUNNY - YONAGUNI", options: ["BAD BUNNY - YONAGUNI", "BAD BUNNY - DAKITI", "OZUNA - TAKI TAKI", "RAUW - TODO DE TI"] },
      { emojis: "🌹🏎️🔥💅", answer: "ROSALÍA", options: ["ROSALÍA", "SHAKIRA", "AITANA", "BECKY G"] },
      { emojis: "🎵🌊🏝️🇵🇷", answer: "DADDY YANKEE", options: ["DADDY YANKEE", "DON OMAR", "WISIN", "NICKY JAM"] },
      { emojis: "💎👁️🖤🎤", answer: "RAUW ALEJANDRO", options: ["RAUW ALEJANDRO", "MYKE TOWERS", "JHAYCO", "ANUEL AA"] },
      // Series Netflix medio
      { emojis: "👩‍🎓♟️👑📚", answer: "GAMBITO DE DAMA", options: ["GAMBITO DE DAMA", "ÉLITE", "MERLÍ", "ANNE WITH AN E"] },
      { emojis: "🏫💋🔪💊", answer: "ÉLITE", options: ["ÉLITE", "GOSSIP GIRL", "RIVERDALE", "PRETTY LITTLE LIARS"] },
      { emojis: "🧟‍♂️🏫🇰🇷🔔", answer: "ESTAMOS MUERTOS", options: ["ESTAMOS MUERTOS", "KINGDOM", "TRAIN TO BUSAN", "THE WALKING DEAD"] },
      // TikTokers medio
      { emojis: "🎮📺🤣🇪🇸", answer: "IBAI LLANOS", options: ["IBAI LLANOS", "RUBIUS", "AURONPLAY", "THEGREFG"] },
      { emojis: "🎤🇪🇸💜✨", answer: "AITANA", options: ["AITANA", "ROSALÍA", "ANA MENA", "LOLA ÍNDIGO"] },
    ],
    en: [
      { emojis: "🧪👨‍🔬💊🏜️", answer: "BREAKING BAD", options: ["BREAKING BAD", "DEXTER", "HOUSE", "THE WALKING DEAD"] },
      { emojis: "👑⚔️🐉🏰", answer: "GAME OF THRONES", options: ["GAME OF THRONES", "LORD OF THE RINGS", "VIKINGS", "THE WITCHER"] },
      { emojis: "🏫📓💕🔺", answer: "SQUID GAME", options: ["SQUID GAME", "ALICE IN BORDERLAND", "BATTLE ROYALE", "HUNGER GAMES"] },
      { emojis: "🎮⛏️🟫🧱", answer: "MINECRAFT", options: ["MINECRAFT", "ROBLOX", "TERRARIA", "FORTNITE"] },
      { emojis: "👻📱📸🗺️", answer: "POKÉMON GO", options: ["POKÉMON GO", "SNAPCHAT", "INSTAGRAM", "INGRESS"] },
      { emojis: "🏍️🖤🇵🇷🐰", answer: "BAD BUNNY - YONAGUNI", options: ["BAD BUNNY - YONAGUNI", "BAD BUNNY - DAKITI", "OZUNA - TAKI TAKI", "RAUW - TODO DE TI"] },
      { emojis: "🌹🏎️🔥💅", answer: "ROSALÍA", options: ["ROSALÍA", "SHAKIRA", "AITANA", "BECKY G"] },
      { emojis: "🎵🌊🏝️🇵🇷", answer: "DADDY YANKEE", options: ["DADDY YANKEE", "DON OMAR", "WISIN", "NICKY JAM"] },
      { emojis: "💎👁️🖤🎤", answer: "RAUW ALEJANDRO", options: ["RAUW ALEJANDRO", "MYKE TOWERS", "JHAYCO", "ANUEL AA"] },
      { emojis: "👩‍🎓♟️👑📚", answer: "THE QUEEN'S GAMBIT", options: ["THE QUEEN'S GAMBIT", "ÉLITE", "MERLÍ", "ANNE WITH AN E"] },
      { emojis: "🏫💋🔪💊", answer: "ÉLITE", options: ["ÉLITE", "GOSSIP GIRL", "RIVERDALE", "PRETTY LITTLE LIARS"] },
      { emojis: "🧟‍♂️🏫🇰🇷🔔", answer: "ALL OF US ARE DEAD", options: ["ALL OF US ARE DEAD", "KINGDOM", "TRAIN TO BUSAN", "THE WALKING DEAD"] },
      { emojis: "🎮📺🤣🇪🇸", answer: "IBAI LLANOS", options: ["IBAI LLANOS", "RUBIUS", "AURONPLAY", "THEGREFG"] },
      { emojis: "🎤🇪🇸💜✨", answer: "AITANA", options: ["AITANA", "ROSALÍA", "ANA MENA", "LOLA ÍNDIGO"] },
    ],
  },
  hard: {
    es: [
      { emojis: "🔴💊🤖🕶️👨‍💻", answer: "MATRIX", options: ["MATRIX", "TERMINATOR", "BLADE RUNNER", "TRON"] },
      { emojis: "🎪🤡🎈📕😱", answer: "IT", options: ["IT", "JOKER", "EL CIRCO", "AMERICAN HORROR STORY"] },
      { emojis: "⏰🔙🚗⚡1️⃣9️⃣8️⃣5️⃣", answer: "REGRESO AL FUTURO", options: ["REGRESO AL FUTURO", "INTERSTELLAR", "TENET", "DOCTOR WHO"] },
      { emojis: "🧠💭😴🌀🏗️", answer: "ORIGEN", options: ["ORIGEN", "MATRIX", "DOCTOR STRANGE", "INTERSTELLAR"] },
      { emojis: "🗡️⚡👦🏻🦉📜", answer: "HARRY POTTER", options: ["HARRY POTTER", "PERCY JACKSON", "NARNIA", "ERAGON"] },
      { emojis: "🎭🃏💚🦇🌃", answer: "JOKER", options: ["JOKER", "BATMAN", "LOKI", "DEADPOOL"] },
      // Reggaetón difícil
      { emojis: "🦷🏎️🖤🇪🇸🔥", answer: "ROSALÍA - MOTOMAMI", options: ["ROSALÍA - MOTOMAMI", "ROSALÍA - EL MAL QUERER", "C. TANGANA - EL MADRILEÑO", "AITANA - ALPHA"] },
      { emojis: "🐔🔫💣🏚️🇪🇸", answer: "C. TANGANA", options: ["C. TANGANA", "RECYCLED J", "NATOS Y WAOR", "MORAD"] },
      { emojis: "🌙🐰🏝️🇯🇵🎌", answer: "BAD BUNNY - UN VERANO SIN TI", options: ["BAD BUNNY - UN VERANO SIN TI", "BAD BUNNY - YHLQMDLG", "BAD BUNNY - X100PRE", "RAUW - VICE VERSA"] },
      { emojis: "💔🎵🥀🇪🇸👩‍🎤", answer: "QUEVEDO - BZRP #52", options: ["QUEVEDO - BZRP #52", "SHAKIRA - BZRP #53", "ROSALÍA - DESPECHÁ", "AITANA - FORMENTERA"] },
      // Series Netflix difícil
      { emojis: "⬛🪞📱😈👤", answer: "BLACK MIRROR", options: ["BLACK MIRROR", "DARK", "MR. ROBOT", "WESTWORLD"] },
      { emojis: "⏳🌑🇩🇪🔄👦👴", answer: "DARK", options: ["DARK", "STRANGER THINGS", "BLACK MIRROR", "THE OA"] },
      { emojis: "🔒📍🧩👁️‍🗨️🇪🇸", answer: "LA CHICA DE NIEVE", options: ["LA CHICA DE NIEVE", "EL INOCENTE", "ALMA", "FERIA"] },
      // TikTokers difícil
      { emojis: "🎬🤪👯‍♀️🇪🇸📱", answer: "RIVERS", options: ["RIVERS", "LOLA LOLITA", "MARINA YERS", "DULCEIDA"] },
    ],
    en: [
      { emojis: "🔴💊🤖🕶️👨‍💻", answer: "MATRIX", options: ["MATRIX", "TERMINATOR", "BLADE RUNNER", "TRON"] },
      { emojis: "🎪🤡🎈📕😱", answer: "IT", options: ["IT", "JOKER", "THE CIRCUS", "AMERICAN HORROR STORY"] },
      { emojis: "⏰🔙🚗⚡1️⃣9️⃣8️⃣5️⃣", answer: "BACK TO THE FUTURE", options: ["BACK TO THE FUTURE", "INTERSTELLAR", "TENET", "DOCTOR WHO"] },
      { emojis: "🧠💭😴🌀🏗️", answer: "INCEPTION", options: ["INCEPTION", "MATRIX", "DOCTOR STRANGE", "INTERSTELLAR"] },
      { emojis: "🗡️⚡👦🏻🦉📜", answer: "HARRY POTTER", options: ["HARRY POTTER", "PERCY JACKSON", "NARNIA", "ERAGON"] },
      { emojis: "🎭🃏💚🦇🌃", answer: "JOKER", options: ["JOKER", "BATMAN", "LOKI", "DEADPOOL"] },
      { emojis: "🦷🏎️🖤🇪🇸🔥", answer: "ROSALÍA - MOTOMAMI", options: ["ROSALÍA - MOTOMAMI", "ROSALÍA - EL MAL QUERER", "C. TANGANA - EL MADRILEÑO", "AITANA - ALPHA"] },
      { emojis: "🐔🔫💣🏚️🇪🇸", answer: "C. TANGANA", options: ["C. TANGANA", "RECYCLED J", "NATOS Y WAOR", "MORAD"] },
      { emojis: "🌙🐰🏝️🇯🇵🎌", answer: "BAD BUNNY - UN VERANO SIN TI", options: ["BAD BUNNY - UN VERANO SIN TI", "BAD BUNNY - YHLQMDLG", "BAD BUNNY - X100PRE", "RAUW - VICE VERSA"] },
      { emojis: "💔🎵🥀🇪🇸👩‍🎤", answer: "QUEVEDO - BZRP #52", options: ["QUEVEDO - BZRP #52", "SHAKIRA - BZRP #53", "ROSALÍA - DESPECHÁ", "AITANA - FORMENTERA"] },
      { emojis: "⬛🪞📱😈👤", answer: "BLACK MIRROR", options: ["BLACK MIRROR", "DARK", "MR. ROBOT", "WESTWORLD"] },
      { emojis: "⏳🌑🇩🇪🔄👦👴", answer: "DARK", options: ["DARK", "STRANGER THINGS", "BLACK MIRROR", "THE OA"] },
      { emojis: "🔒📍🧩👁️‍🗨️🇪🇸", answer: "THE SNOW GIRL", options: ["THE SNOW GIRL", "THE INNOCENT", "ALMA", "FERIA"] },
      { emojis: "🎬🤪👯‍♀️🇪🇸📱", answer: "RIVERS", options: ["RIVERS", "LOLA LOLITA", "MARINA YERS", "DULCEIDA"] },
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
