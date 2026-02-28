import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Timer, MessageCircle, SmilePlus, Vote, SkipForward } from "lucide-react";
import { CHAT_PRESETS, CHAT_EMOJIS } from "@/types/game";
import type { ChatMessage } from "@/types/game";
import { playTap } from "@/lib/sounds";

// --- Types ---

type MeetingPlayer = {
  id: string;
  name: string;
  emoji: string;
  isAlive: boolean;
  isGhost: boolean;
};

type MeetingScreenProps = {
  round: number;
  players: MeetingPlayer[];
  myPlayerId: string;
  isGhost: boolean;
  onVoteResult: (eliminatedId: string | null) => void;
};

// --- Constants ---

const DISCUSSION_TIME = 30;
const VOTING_TIME = 15;

const MOCK_PLAYERS: MeetingPlayer[] = [
  { id: "me", name: "Tú", emoji: "🕵️", isAlive: true, isGhost: false },
  { id: "p2", name: "Luna_Star", emoji: "💃", isAlive: true, isGhost: false },
  { id: "p3", name: "MintChoco", emoji: "🧁", isAlive: true, isGhost: false },
  { id: "p4", name: "PixelQueen", emoji: "👑", isAlive: true, isGhost: false },
  { id: "p5", name: "StarGirl", emoji: "⭐", isAlive: true, isGhost: false },
];

// --- Sub-components ---

const ChatPanel = ({
  messages,
  onSendPreset,
  onSendEmoji,
  disabled,
  players,
}: {
  messages: ChatMessage[];
  onSendPreset: (msg: string) => void;
  onSendEmoji: (emoji: string) => void;
  disabled: boolean;
  players: MeetingPlayer[];
}) => {
  const [showEmojis, setShowEmojis] = useState(false);

  const fillTemplate = (template: string) => {
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    const zones = ["Biblioteca", "Cafetería", "Auditorio", "Laboratorio", "Gimnasio", "Jardín"];
    const randomZone = zones[Math.floor(Math.random() * zones.length)];
    return template
      .replace("{player}", randomPlayer.name)
      .replace("{zone}", randomZone);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Messages */}
      <div className="h-32 overflow-y-auto rounded-2xl bg-card p-3 shadow-soft">
        {messages.length === 0 ? (
          <p className="font-body text-xs text-muted-foreground text-center py-6">
            La discusión ha comenzado...
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-2">
                <span className="font-display text-xs font-bold text-primary shrink-0">
                  {msg.senderName}:
                </span>
                <span
                  className={`font-body text-xs text-foreground ${
                    msg.messageType === "emoji" ? "text-lg" : ""
                  }`}
                >
                  {msg.content}
                </span>
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
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 rounded-2xl bg-card p-3">
                  {CHAT_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onSendEmoji(emoji);
                        playTap();
                      }}
                      className="text-xl active:scale-90 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CHAT_PRESETS.map((preset, i) => (
              <button
                key={i}
                onClick={() => {
                  onSendPreset(fillTemplate(preset));
                  playTap();
                }}
                className="shrink-0 rounded-full bg-muted px-3 py-1.5 font-body text-xs text-foreground active:scale-95 transition-transform"
              >
                {preset.replace("{player}", "...").replace("{zone}", "...")}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowEmojis(!showEmojis)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground"
            >
              <SmilePlus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const VotingPanel = ({
  players,
  myPlayerId,
  myVote,
  onVote,
  votes,
  timeLeft,
  disabled,
}: {
  players: MeetingPlayer[];
  myPlayerId: string;
  myVote: string | null;
  onVote: (playerId: string | null) => void;
  votes: Record<string, string | null>;
  timeLeft: number;
  disabled: boolean;
}) => {
  const alivePlayers = players.filter((p) => p.isAlive && p.id !== myPlayerId);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-foreground">
          ¿Quién es la saboteadora?
        </h3>
        <div
          className={`flex items-center gap-1 rounded-full px-3 py-1 font-display text-xs font-bold ${
            timeLeft <= 5
              ? "bg-destructive/20 text-destructive animate-pulse"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Timer className="h-3 w-3" />
          {timeLeft}s
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {alivePlayers.map((player) => {
          const isSelected = myVote === player.id;
          const voteCount = Object.values(votes).filter((v) => v === player.id).length;
          return (
            <motion.button
              key={player.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (!disabled) {
                  onVote(isSelected ? null : player.id);
                  playTap();
                }
              }}
              className={`relative flex items-center gap-2 rounded-2xl p-3 transition-all ${
                isSelected
                  ? "bg-destructive/15 ring-2 ring-destructive"
                  : "bg-card shadow-soft"
              }`}
            >
              <span className="text-xl">{player.emoji}</span>
              <span className="font-display text-xs font-bold text-foreground truncate">
                {player.name}
              </span>
              {voteCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {voteCount}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <Button
        variant="outline"
        onClick={() => {
          if (!disabled) {
            onVote("skip");
            playTap();
          }
        }}
        className={`rounded-2xl font-display text-xs font-bold ${
          myVote === "skip" ? "ring-2 ring-accent" : ""
        }`}
      >
        <SkipForward className="mr-1 h-3 w-3" />
        Saltar voto
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
  onVoteResult,
}: MeetingScreenProps) => {
  const players = propPlayers.length > 0 ? propPlayers : MOCK_PLAYERS;
  const [phase, setPhase] = useState<"discussion" | "voting" | "result">("discussion");
  const [timeLeft, setTimeLeft] = useState(DISCUSSION_TIME);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, string | null>>({});
  const [eliminatedPlayer, setEliminatedPlayer] = useState<MeetingPlayer | null>(null);

  // Timer
  useEffect(() => {
    if (phase === "result") return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (phase === "discussion") {
            setPhase("voting");
            setTimeLeft(VOTING_TIME);
          } else if (phase === "voting") {
            resolveVotes();
          }
          return phase === "discussion" ? VOTING_TIME : 0;
        }
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
          {
            id: `bot-${Date.now()}-${i}`,
            senderId: sender.id,
            senderName: sender.name,
            messageType: msg.length <= 3 ? "emoji" : "preset",
            content: msg,
            createdAt: Date.now(),
          },
        ]);
      }, (i + 1) * 4000);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [phase, players, myPlayerId]);

  // Mock bot votes during voting
  useEffect(() => {
    if (phase !== "voting") return;
    const botPlayers = players.filter((p) => p.id !== myPlayerId && p.isAlive);
    const alivePlayers = players.filter((p) => p.isAlive);
    const timers: ReturnType<typeof setTimeout>[] = [];

    botPlayers.forEach((bot, i) => {
      const timer = setTimeout(() => {
        const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
        setVotes((prev) => ({
          ...prev,
          [bot.id]: Math.random() < 0.2 ? "skip" : target.id,
        }));
      }, (i + 1) * 2000);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [phase, players, myPlayerId]);

  const resolveVotes = useCallback(() => {
    const allVotes = { ...votes };
    if (myVote) allVotes[myPlayerId] = myVote;

    // Count votes (excluding "skip")
    const counts: Record<string, number> = {};
    Object.values(allVotes).forEach((v) => {
      if (v && v !== "skip") {
        counts[v] = (counts[v] || 0) + 1;
      }
    });

    // Find max
    const maxCount = Math.max(0, ...Object.values(counts));
    const topVoted = Object.entries(counts).filter(([, c]) => c === maxCount);

    let eliminated: MeetingPlayer | null = null;
    if (topVoted.length === 1 && maxCount >= 2) {
      eliminated = players.find((p) => p.id === topVoted[0][0]) || null;
    }

    setEliminatedPlayer(eliminated);
    setPhase("result");

    // Auto-advance after showing result
    setTimeout(() => {
      onVoteResult(eliminated?.id || null);
    }, 3500);
  }, [votes, myVote, myPlayerId, players, onVoteResult]);

  const handleSendPreset = (content: string) => {
    if (isGhost) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `me-${Date.now()}`,
        senderId: myPlayerId,
        senderName: "Tú",
        messageType: "preset",
        content,
        createdAt: Date.now(),
      },
    ]);
  };

  const handleSendEmoji = (emoji: string) => {
    if (isGhost) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `me-${Date.now()}`,
        senderId: myPlayerId,
        senderName: "Tú",
        messageType: "emoji",
        content: emoji,
        createdAt: Date.now(),
      },
    ]);
  };

  const handleVote = (playerId: string | null) => {
    if (isGhost) return;
    setMyVote(playerId);
    if (playerId) {
      setVotes((prev) => ({ ...prev, [myPlayerId]: playerId }));
    } else {
      setVotes((prev) => {
        const next = { ...prev };
        delete next[myPlayerId];
        return next;
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="gradient-primary px-4 pb-4 pt-4 safe-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vote className="h-5 w-5 text-primary-foreground" />
            <h1 className="font-display text-lg font-black text-primary-foreground">
              Reunión de emergencia
            </h1>
          </div>
          <span className="rounded-full bg-primary-foreground/20 px-3 py-1 font-display text-xs font-bold text-primary-foreground">
            Ronda {round}
          </span>
        </div>
        <p className="mt-1 font-body text-xs text-primary-foreground/70">
          {phase === "discussion"
            ? "Discutan quién puede ser la saboteadora"
            : phase === "voting"
            ? "¡Voten ahora!"
            : "Resultado de la votación"}
        </p>
      </div>

      {/* Phase indicator */}
      <div className="flex gap-2 px-4 py-3">
        <div
          className={`flex flex-1 items-center justify-center gap-1 rounded-full py-2 font-display text-xs font-bold transition-colors ${
            phase === "discussion"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <MessageCircle className="h-3 w-3" />
          Discusión
        </div>
        <div
          className={`flex flex-1 items-center justify-center gap-1 rounded-full py-2 font-display text-xs font-bold transition-colors ${
            phase === "voting"
              ? "bg-destructive text-destructive-foreground"
              : phase === "result"
              ? "bg-destructive text-destructive-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Vote className="h-3 w-3" />
          Votación
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-4">
        <AnimatePresence mode="wait">
          {phase === "discussion" && (
            <motion.div
              key="discussion"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-3"
            >
              {/* Timer */}
              <div className="flex items-center justify-center gap-2">
                <div
                  className={`flex items-center gap-1 rounded-full px-4 py-2 font-display text-sm font-bold ${
                    timeLeft <= 10
                      ? "bg-destructive/20 text-destructive animate-pulse"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Timer className="h-4 w-4" />
                  Discusión: {timeLeft}s
                </div>
              </div>

              <ChatPanel
                messages={messages}
                onSendPreset={handleSendPreset}
                onSendEmoji={handleSendEmoji}
                disabled={isGhost}
                players={players}
              />

              {isGhost && (
                <div className="rounded-2xl bg-muted/50 p-3 text-center">
                  <span className="font-body text-xs text-muted-foreground">
                    👻 Eres fantasma. Solo puedes observar.
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {phase === "voting" && (
            <motion.div
              key="voting"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <VotingPanel
                players={players}
                myPlayerId={myPlayerId}
                myVote={myVote}
                onVote={handleVote}
                votes={votes}
                timeLeft={timeLeft}
                disabled={isGhost}
              />

              {isGhost && (
                <div className="mt-3 rounded-2xl bg-muted/50 p-3 text-center">
                  <span className="font-body text-xs text-muted-foreground">
                    👻 No puedes votar como fantasma.
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {phase === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-4 pt-12"
            >
              {eliminatedPlayer ? (
                <>
                  <motion.span
                    className="text-6xl"
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {eliminatedPlayer.emoji}
                  </motion.span>
                  <h2 className="font-display text-xl font-black text-foreground text-center">
                    {eliminatedPlayer.name} fue eliminada
                  </h2>
                  <p className="font-body text-sm text-muted-foreground text-center">
                    La mayoría ha hablado... ¿será la saboteadora? 🤔
                  </p>
                </>
              ) : (
                <>
                  <motion.span
                    className="text-6xl"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: 2, duration: 0.4 }}
                  >
                    🤷
                  </motion.span>
                  <h2 className="font-display text-xl font-black text-foreground text-center">
                    Sin consenso
                  </h2>
                  <p className="font-body text-sm text-muted-foreground text-center">
                    No hubo suficientes votos. Nadie fue eliminada.
                  </p>
                </>
              )}
              <div className="mt-2 rounded-full bg-muted px-4 py-2">
                <span className="font-body text-xs text-muted-foreground">
                  Continuando en unos segundos...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MeetingScreen;
