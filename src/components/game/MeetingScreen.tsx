import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Timer, MessageCircle, SmilePlus, Vote, SkipForward, MapPin, Lightbulb, Key } from "lucide-react";
import { CHAT_PRESETS, CHAT_EMOJIS, ZONE_INFO } from "@/types/game";
import type { ChatMessage, Zone, PlayerRole } from "@/types/game";
import { playTap, playVoteAlarm, playTimerUrgent, playElimination } from "@/lib/sounds";
import { useTranslation } from "@/lib/i18n";

// --- Types ---

type MeetingPlayer = {
  id: string;
  name: string;
  emoji: string;
  role: "agent" | "saboteur";
  isAlive: boolean;
  isGhost: boolean;
};

type MeetingScreenProps = {
  round: number;
  players: MeetingPlayer[];
  myPlayerId: string;
  isGhost: boolean;
  playerZones?: Record<string, Zone>;
  onVoteResult: (eliminatedId: string | null) => void;
  onWordGuessed?: () => void;
  secretWord: string | null; // null for saboteur
  secretCategory: string;
  secretClues: string[]; // contextual clues for the word
  myRole: PlayerRole;
};

// --- Constants ---

const CLUE_TIME_PER_PLAYER = 8;
const DISCUSSION_TIME = 30;
const VOTING_TIME = 15;
const MIN_CLUE_ROUNDS = 2;

const MOCK_PLAYERS: MeetingPlayer[] = [
  { id: "me", name: "Tú", emoji: "🕵️", role: "agent", isAlive: true, isGhost: false },
  { id: "p2", name: "Luna_Star", emoji: "💃", role: "saboteur", isAlive: true, isGhost: false },
  { id: "p3", name: "MintChoco", emoji: "🧁", role: "agent", isAlive: true, isGhost: false },
  { id: "p4", name: "PixelQueen", emoji: "👑", role: "agent", isAlive: true, isGhost: false },
  { id: "p5", name: "StarGirl", emoji: "⭐", role: "agent", isAlive: true, isGhost: false },
];

// --- Clue Phase Component ---

type ClueEntry = { playerId: string; playerName: string; emoji: string; clue: string };

const CluePhasePanel = ({
  players,
  myPlayerId,
  secretWord,
  secretCategory,
  secretClues,
  myRole,
  onCluesComplete,
}: {
  players: MeetingPlayer[];
  myPlayerId: string;
  secretWord: string | null;
  secretCategory: string;
  secretClues: string[];
  myRole: PlayerRole;
  onCluesComplete: (clues: ClueEntry[]) => void;
}) => {
  const { t } = useTranslation();
  const alivePlayers = players.filter((p) => p.isAlive);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [clues, setClues] = useState<ClueEntry[]>([]);
  const [myClueInput, setMyClueInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(CLUE_TIME_PER_PLAYER);

  const currentPlayer = alivePlayers[currentTurnIndex];
  const isMyTurn = currentPlayer?.id === myPlayerId;

  // Auto-generate bot clues based on whether they know the word
  const generateBotClue = useCallback((player: MeetingPlayer) => {
    if (!secretWord) return "...";
    const saboteurClues = ["interesante", "normal", "diferente", "algo", "raro", "típico", "común", "obvio"];

    if (player.role === "saboteur") {
      return saboteurClues[Math.floor(Math.random() * saboteurClues.length)];
    }
    // Agents use contextual clues from the word bank
    if (secretClues.length > 0) {
      return secretClues[Math.floor(Math.random() * secretClues.length)];
    }
    const fallback = ["bonito", "grande", "conocido", "especial", "famoso"];
    return fallback[Math.floor(Math.random() * fallback.length)];
  }, [secretWord, secretClues]);

  // Timer per turn
  useEffect(() => {
    if (currentTurnIndex >= alivePlayers.length) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Auto-submit
          if (isMyTurn) {
            submitMyClue(myClueInput || "...");
          } else {
            submitBotClue();
          }
          return CLUE_TIME_PER_PLAYER;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentTurnIndex, isMyTurn]);

  const submitMyClue = (clue: string) => {
    const sanitized = clue.trim().split(/\s+/)[0] || "..."; // Only first word
    const entry: ClueEntry = {
      playerId: myPlayerId,
      playerName: currentPlayer.name,
      emoji: currentPlayer.emoji,
      clue: sanitized,
    };
    const newClues = [...clues, entry];
    setClues(newClues);
    setMyClueInput("");
    advanceTurn(newClues);
  };

  const submitBotClue = () => {
    if (!currentPlayer) return;
    const entry: ClueEntry = {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      emoji: currentPlayer.emoji,
      clue: generateBotClue(currentPlayer),
    };
    const newClues = [...clues, entry];
    setClues(newClues);
    advanceTurn(newClues);
  };

  const advanceTurn = (currentClues: ClueEntry[]) => {
    const nextIndex = currentTurnIndex + 1;
    if (nextIndex >= alivePlayers.length) {
      onCluesComplete(currentClues);
    } else {
      setCurrentTurnIndex(nextIndex);
      setTimeLeft(CLUE_TIME_PER_PLAYER);
    }
  };

  // Auto-trigger bot clue after short delay
  useEffect(() => {
    if (currentTurnIndex >= alivePlayers.length) return;
    if (!isMyTurn) {
      const delay = setTimeout(() => {
        submitBotClue();
      }, 2000 + Math.random() * 2000);
      return () => clearTimeout(delay);
    }
  }, [currentTurnIndex, isMyTurn]);

  return (
    <div className="flex flex-col gap-3">
      {/* Word/Category reminder */}
      <div className={`rounded-2xl p-3 text-center ${secretWord ? "bg-primary/10" : "bg-destructive/10"}`}>
        <p className="font-body text-[10px] text-muted-foreground mb-1">
          {secretWord ? t("secretWordLabel") : t("secretCategoryOnly")}
        </p>
        <p className="font-display text-lg font-black text-foreground">
          {secretWord ? `🔑 ${secretWord}` : `❓ ${secretCategory}`}
        </p>
        {!secretWord && (
          <p className="font-body text-[10px] text-muted-foreground mt-1">{t("impostorClueHint")}</p>
        )}
      </div>

      {/* Turn indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <span className="font-display text-sm font-bold text-foreground">{t("cluePhaseTitle")}</span>
        </div>
        <div className={`flex items-center gap-1 rounded-full px-3 py-1 font-display text-xs font-bold ${
          timeLeft <= 3 ? "bg-destructive/20 text-destructive animate-pulse" : "bg-muted text-muted-foreground"
        }`}>
          <Timer className="h-3 w-3" />
          {timeLeft}s
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5">
        {alivePlayers.map((p, i) => (
          <div
            key={p.id}
            className={`flex items-center justify-center rounded-full transition-all ${
              i < currentTurnIndex
                ? "h-6 w-6 bg-primary/20 text-[10px]"
                : i === currentTurnIndex
                ? "h-8 w-8 bg-primary text-xs text-primary-foreground ring-2 ring-primary/30"
                : "h-6 w-6 bg-muted text-[10px]"
            }`}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      {/* Current turn */}
      {currentPlayer && currentTurnIndex < alivePlayers.length && (
        <motion.div
          key={currentTurnIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card p-4 shadow-soft"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{currentPlayer.emoji}</span>
            <span className="font-display text-sm font-bold text-foreground">
              {isMyTurn ? t("yourTurnClue") : `${currentPlayer.name} ${t("isThinking")}...`}
            </span>
          </div>

          {isMyTurn ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={myClueInput}
                onChange={(e) => setMyClueInput(e.target.value.replace(/\s/g, ""))}
                placeholder={t("typeOneWord")}
                maxLength={20}
                className="flex-1 rounded-xl bg-muted px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && myClueInput.trim()) {
                    submitMyClue(myClueInput);
                  }
                }}
              />
              <Button
                onClick={() => submitMyClue(myClueInput)}
                disabled={!myClueInput.trim()}
                className="rounded-xl font-display text-xs"
                size="sm"
              >
                {t("send")}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center py-2">
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="font-body text-sm text-muted-foreground"
              >
                💭 {t("isThinking")}...
              </motion.div>
            </div>
          )}
        </motion.div>
      )}

      {/* Previous clues */}
      {clues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {clues.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 rounded-xl bg-card px-3 py-2 shadow-soft"
            >
              <span className="text-sm">{c.emoji}</span>
              <span className="font-display text-xs font-bold text-foreground">{c.playerName}:</span>
              <span className="font-body text-xs text-primary font-semibold">"{c.clue}"</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Chat Panel (keep existing) ---

const ChatPanel = ({
  messages,
  onSendPreset,
  onSendEmoji,
  disabled,
  players,
  clues,
}: {
  messages: ChatMessage[];
  onSendPreset: (msg: string) => void;
  onSendEmoji: (emoji: string) => void;
  disabled: boolean;
  players: MeetingPlayer[];
  clues: ClueEntry[];
}) => {
  const { t } = useTranslation();
  const [showEmojis, setShowEmojis] = useState(false);

  const fillTemplate = (template: string) => {
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    const zones = ["Biblioteca", "Cafetería", "Auditorio", "Laboratorio", "Gimnasio", "Jardín"];
    const randomZone = zones[Math.floor(Math.random() * zones.length)];
    return template.replace("{player}", randomPlayer.name).replace("{zone}", randomZone);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Clue summary */}
      {clues.length > 0 && (
        <div className="rounded-2xl bg-primary/5 p-3">
          <p className="font-display text-xs font-bold text-foreground mb-2">💡 {t("cluesSummary")}</p>
          <div className="flex flex-wrap gap-1.5">
            {clues.map((c, i) => (
              <span key={i} className="rounded-full bg-card px-2 py-0.5 font-body text-[10px] text-foreground shadow-soft">
                {c.emoji} {c.playerName}: <span className="font-semibold text-primary">"{c.clue}"</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="h-32 overflow-y-auto rounded-2xl bg-card p-3 shadow-soft">
        {messages.length === 0 ? (
          <p className="font-body text-xs text-muted-foreground text-center py-6">
            {t("discussionStarted")}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-2">
                <span className="font-display text-xs font-bold text-primary shrink-0">{msg.senderName}:</span>
                <span className={`font-body text-xs text-foreground ${msg.messageType === "emoji" ? "text-lg" : ""}`}>{msg.content}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input area */}
      {!disabled && (
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {showEmojis && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="flex flex-wrap gap-2 rounded-2xl bg-card p-3">
                  {CHAT_EMOJIS.map((emoji) => (
                    <button key={emoji} onClick={() => { onSendEmoji(emoji); playTap(); }} className="text-xl active:scale-90 transition-transform">{emoji}</button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CHAT_PRESETS.map((preset, i) => (
              <button key={i} onClick={() => { onSendPreset(fillTemplate(preset)); playTap(); }} className="shrink-0 rounded-full bg-muted px-3 py-1.5 font-body text-xs text-foreground active:scale-95 transition-transform">
                {preset.replace("{player}", "...").replace("{zone}", "...")}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setShowEmojis(!showEmojis)} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <SmilePlus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Voting Panel (keep existing) ---

const VotingPanel = ({
  players, myPlayerId, myVote, onVote, votes, timeLeft, disabled,
}: {
  players: MeetingPlayer[]; myPlayerId: string; myVote: string | null;
  onVote: (playerId: string | null) => void; votes: Record<string, string | null>;
  timeLeft: number; disabled: boolean;
}) => {
  const { t } = useTranslation();
  const alivePlayers = players.filter((p) => p.isAlive);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-foreground">{t("whoIsSaboteur")}</h3>
        <div className={`flex items-center gap-1 rounded-full px-3 py-1 font-display text-xs font-bold ${
          timeLeft <= 5 ? "bg-destructive/20 text-destructive animate-pulse" : "bg-muted text-muted-foreground"
        }`}>
          <Timer className="h-3 w-3" />{timeLeft}s
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {alivePlayers.map((player) => {
          const isMe = player.id === myPlayerId;
          const isSelected = myVote === player.id;
          const voteCount = Object.values(votes).filter((v) => v === player.id).length;
          return (
            <motion.button
              key={player.id}
              whileTap={isMe ? undefined : { scale: 0.95 }}
              onClick={() => { if (!disabled && !isMe) { onVote(isSelected ? null : player.id); playTap(); } }}
              className={`relative flex items-center gap-2 rounded-2xl p-3 transition-all ${
                isMe ? "bg-muted/60 cursor-default" : isSelected ? "bg-destructive/15 ring-2 ring-destructive" : "bg-card shadow-soft"
              }`}
            >
              <span className="text-xl">{player.emoji}</span>
              <span className="font-display text-xs font-bold text-foreground truncate">{player.name}</span>
              {voteCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">{voteCount}</span>
              )}
            </motion.button>
          );
        })}
      </div>

      <Button
        variant="outline"
        onClick={() => { if (!disabled) { onVote("skip"); playTap(); } }}
        className={`rounded-2xl font-display text-xs font-bold ${myVote === "skip" ? "ring-2 ring-accent" : ""}`}
      >
        <SkipForward className="mr-1 h-3 w-3" />{t("skipVote")}
      </Button>
    </div>
  );
};

// --- Main Component ---

const MeetingScreen = ({
  round,
  players: propPlayers,
  myPlayerId = "me",
  isGhost = false,
  playerZones = {},
  onVoteResult,
  onWordGuessed,
  secretWord,
  secretCategory,
  secretClues,
  myRole,
}: MeetingScreenProps) => {
  const { t } = useTranslation();
  const players = propPlayers.length > 0 ? propPlayers : MOCK_PLAYERS;
  const [phase, setPhase] = useState<"clues" | "discussion" | "voting" | "result">("clues");
  const [timeLeft, setTimeLeft] = useState(DISCUSSION_TIME);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, string | null>>({});
  const [eliminatedPlayer, setEliminatedPlayer] = useState<MeetingPlayer | null>(null);
  const [roundClues, setRoundClues] = useState<ClueEntry[]>([]);
  const [clueRoundNumber, setClueRoundNumber] = useState(1);
  const [guessInput, setGuessInput] = useState("");
  const [guessResult, setGuessResult] = useState<"correct" | "wrong" | null>(null);
  const [hasGuessedCorrectly, setHasGuessedCorrectly] = useState(false);

  const normalizeWord = (w: string) => w.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const handleGuessWord = useCallback(() => {
    if (!guessInput.trim() || !secretWord || hasGuessedCorrectly) return;
    const guess = normalizeWord(guessInput);
    const answer = normalizeWord(secretWord);
    if (guess === answer) {
      setGuessResult("correct");
      setHasGuessedCorrectly(true);
      onWordGuessed?.();
      playTap();
    } else {
      setGuessResult("wrong");
      setTimeout(() => setGuessResult(null), 2000);
    }
    setGuessInput("");
  }, [guessInput, secretWord, hasGuessedCorrectly, onWordGuessed]);

  const handleCluesComplete = useCallback((clues: ClueEntry[]) => {
    setRoundClues((prev) => [...prev, ...clues]);
    setPhase("discussion");
    setTimeLeft(DISCUSSION_TIME);
  }, []);

  // Timer for discussion and voting phases
  useEffect(() => {
    if (phase === "result" || phase === "clues") return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (phase === "discussion") {
            if (clueRoundNumber < MIN_CLUE_ROUNDS) {
              // Go back to clues for another round
              setClueRoundNumber((r) => r + 1);
              setPhase("clues");
              return CLUE_TIME_PER_PLAYER;
            }
            setPhase("voting");
            setTimeLeft(VOTING_TIME);
            playVoteAlarm();
          } else if (phase === "voting") {
            resolveVotes();
          }
          return phase === "discussion" ? VOTING_TIME : 0;
        }
        if (t <= 6) playTimerUrgent();
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Mock bot messages during discussion
  useEffect(() => {
    if (phase !== "discussion") return;
    const botPlayers = players.filter((p) => p.id !== myPlayerId && p.isAlive);
    const timers: ReturnType<typeof setTimeout>[] = [];

    const botMessages = [
      "Yo estaba en la Biblioteca 📚",
      "Vi a alguien raro en el Laboratorio",
      "🤔",
      "No fui yo, lo juro",
      "¿Dónde estabas tú?",
      "Creo que deberíamos votar",
    ];

    botMessages.slice(0, 3).forEach((msg, i) => {
      const timer = setTimeout(() => {
        const sender = botPlayers[i % botPlayers.length];
        setMessages((prev) => [
          ...prev,
          { id: `bot-${Date.now()}-${i}`, senderId: sender.id, senderName: sender.name, messageType: msg.length <= 3 ? "emoji" : "preset", content: msg, createdAt: Date.now() },
        ]);
      }, (i + 1) * 4000);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [phase, players, myPlayerId]);

  // Mock bot votes
  useEffect(() => {
    if (phase !== "voting") return;
    const botPlayers = players.filter((p) => p.id !== myPlayerId && p.isAlive);
    const alivePlayers = players.filter((p) => p.isAlive);
    const timers: ReturnType<typeof setTimeout>[] = [];

    botPlayers.forEach((bot, i) => {
      const timer = setTimeout(() => {
        const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
        setVotes((prev) => ({ ...prev, [bot.id]: Math.random() < 0.2 ? "skip" : target.id }));
      }, (i + 1) * 2000);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [phase, players, myPlayerId]);

  const resolveVotes = useCallback(() => {
    const allVotes = { ...votes };
    if (myVote) allVotes[myPlayerId] = myVote;

    const counts: Record<string, number> = {};
    Object.values(allVotes).forEach((v) => { if (v && v !== "skip") counts[v] = (counts[v] || 0) + 1; });

    const maxCount = Math.max(0, ...Object.values(counts));
    const topVoted = Object.entries(counts).filter(([, c]) => c === maxCount);

    let eliminated: MeetingPlayer | null = null;
    if (topVoted.length === 1 && maxCount >= 2) {
      eliminated = players.find((p) => p.id === topVoted[0][0]) || null;
    }

    setEliminatedPlayer(eliminated);
    setPhase("result");
    if (eliminated) playElimination();

    setTimeout(() => { onVoteResult(eliminated?.id || null); }, 3500);
  }, [votes, myVote, myPlayerId, players, onVoteResult]);

  const handleSendPreset = (content: string) => {
    if (isGhost) return;
    setMessages((prev) => [...prev, { id: `me-${Date.now()}`, senderId: myPlayerId, senderName: "Tú", messageType: "preset", content, createdAt: Date.now() }]);
  };

  const handleSendEmoji = (emoji: string) => {
    if (isGhost) return;
    setMessages((prev) => [...prev, { id: `me-${Date.now()}`, senderId: myPlayerId, senderName: "Tú", messageType: "emoji", content: emoji, createdAt: Date.now() }]);
  };

  const handleVote = (playerId: string | null) => {
    if (isGhost) return;
    setMyVote(playerId);
    if (playerId) {
      setVotes((prev) => ({ ...prev, [myPlayerId]: playerId }));
    } else {
      setVotes((prev) => { const next = { ...prev }; delete next[myPlayerId]; return next; });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="gradient-primary px-4 pb-4 pt-4 safe-top"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vote className="h-5 w-5 text-primary-foreground" />
            <h1 className="font-display text-lg font-black text-primary-foreground">{t("emergencyMeeting")}</h1>
          </div>
          <span className="rounded-full bg-primary-foreground/20 px-3 py-1 font-display text-xs font-bold text-primary-foreground">
            {t("round")} {round}
          </span>
        </div>
        <p className="mt-1 font-body text-xs text-primary-foreground/70">
          {phase === "clues"
            ? `${t("cluePhaseSubtitle")} (${t("clueRoundLabel")} ${clueRoundNumber}/${MIN_CLUE_ROUNDS})`
            : phase === "discussion"
            ? clueRoundNumber < MIN_CLUE_ROUNDS ? t("discussSaboteur") + ` — ${t("clueRoundLabel")} ${clueRoundNumber + 1} ${t("nextRound").replace("→", "").trim()}...` : t("discussSaboteur")
            : phase === "voting"
            ? t("voteNow")
            : t("voteResult")}
        </p>
      </motion.div>

      {/* Phase indicator */}
      <div className="flex gap-1.5 px-4 py-3">
        {(["clues", "discussion", "voting"] as const).map((p) => (
          <div
            key={p}
            className={`flex flex-1 items-center justify-center gap-1 rounded-full py-2 font-display text-[10px] font-bold transition-colors ${
              phase === p
                ? p === "voting" ? "bg-destructive text-destructive-foreground"
                  : "bg-primary text-primary-foreground"
                : phase === "result" && p === "voting"
                ? "bg-destructive text-destructive-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {p === "clues" && <><Lightbulb className="h-3 w-3" /> {t("cluesLabel")}</>}
            {p === "discussion" && <><MessageCircle className="h-3 w-3" /> {t("discussion")}</>}
            {p === "voting" && <><Vote className="h-3 w-3" /> {t("voting")}</>}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <AnimatePresence mode="wait">
          {phase === "clues" && (
            <motion.div
              key="clues"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-3"
            >
              <CluePhasePanel
                players={players}
                myPlayerId={myPlayerId}
                secretWord={secretWord}
                secretCategory={secretCategory}
                secretClues={secretClues}
                myRole={myRole}
                onCluesComplete={handleCluesComplete}
              />
            </motion.div>
          )}

          {phase === "discussion" && (
            <motion.div
              key="discussion"
              initial={{ opacity: 0, x: -40, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 40, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="flex flex-col gap-3"
            >
              {/* Timer */}
              <div className="flex items-center justify-center gap-2">
                <div className={`flex items-center gap-1 rounded-full px-4 py-2 font-display text-sm font-bold ${
                  timeLeft <= 10 ? "bg-destructive/20 text-destructive animate-pulse" : "bg-muted text-muted-foreground"
                }`}>
                  <Timer className="h-4 w-4" />{t("discussionTimer")}: {timeLeft}s
                </div>
              </div>

              {/* Player list with last zone */}
              <div className="flex flex-wrap gap-2">
                {players.filter(p => p.isAlive).map((player) => {
                  const zone = playerZones[player.id];
                  const zoneInfo = zone ? ZONE_INFO[zone] : null;
                  return (
                    <motion.div key={player.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5 rounded-xl bg-card px-3 py-2 shadow-soft">
                      <span className="text-base">{player.emoji}</span>
                      <span className="font-display text-xs font-bold text-foreground">{player.name}</span>
                      {zoneInfo && (
                        <span className="flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-body text-muted-foreground">
                          <MapPin className="h-2.5 w-2.5" />{zoneInfo.emoji} {zoneInfo.name}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
                {players.filter(p => !p.isAlive).map((player) => (
                  <div key={player.id} className="flex items-center gap-1.5 rounded-xl bg-muted/50 px-3 py-2 opacity-50">
                    <span className="text-base grayscale">👻</span>
                    <span className="font-display text-xs font-bold text-muted-foreground line-through">{player.name}</span>
                  </div>
                ))}
              </div>

              <ChatPanel messages={messages} onSendPreset={handleSendPreset} onSendEmoji={handleSendEmoji} disabled={isGhost} players={players} clues={roundClues} />

              {isGhost && (
                <div className="rounded-2xl bg-muted/50 p-3 text-center">
                  <span className="font-body text-xs text-muted-foreground">{t("ghostObserver")}</span>
                </div>
              )}
            </motion.div>
          )}

          {phase === "voting" && (
            <motion.div
              key="voting"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <VotingPanel players={players} myPlayerId={myPlayerId} myVote={myVote} onVote={handleVote} votes={votes} timeLeft={timeLeft} disabled={isGhost} />
              {isGhost && (
                <div className="mt-3 rounded-2xl bg-muted/50 p-3 text-center">
                  <span className="font-body text-xs text-muted-foreground">{t("ghostCantVote")}</span>
                </div>
              )}
            </motion.div>
          )}

          {phase === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.6, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], scale: { type: "spring", stiffness: 200, damping: 18 } }}
              className="flex flex-col items-center justify-center gap-4 pt-12"
            >
              {eliminatedPlayer ? (
                <>
                  <motion.span className="text-6xl" animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.5 }}>{eliminatedPlayer.emoji}</motion.span>
                  <h2 className="font-display text-xl font-black text-foreground text-center">{eliminatedPlayer.name} {t("wasEliminated")}</h2>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className={`rounded-2xl px-5 py-3 text-center ${eliminatedPlayer.role === "saboteur" ? "bg-destructive/15" : "bg-primary/10"}`}
                  >
                    <p className="font-display text-sm font-bold text-foreground">{eliminatedPlayer.role === "saboteur" ? t("wasSaboteur") : t("wasAgent")}</p>
                    <p className="font-body text-xs text-muted-foreground mt-1">{eliminatedPlayer.role === "saboteur" ? t("greatWork") : t("eliminatedAlly")}</p>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.span className="text-6xl" animate={{ y: [0, -10, 0] }} transition={{ repeat: 2, duration: 0.4 }}>🤷</motion.span>
                  <h2 className="font-display text-xl font-black text-foreground text-center">{t("noConsensus")}</h2>
                  <p className="font-body text-sm text-muted-foreground text-center">{t("noConsensusDesc")}</p>
                </>
              )}
              <div className="mt-2 rounded-full bg-muted px-4 py-2">
                <span className="font-body text-xs text-muted-foreground">{t("continuingIn")}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MeetingScreen;
