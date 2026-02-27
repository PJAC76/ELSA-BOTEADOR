import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Send, SmilePlus } from "lucide-react";
import type { RoomMode, ChatMessage, Language } from "@/types/game";
import { CHAT_PRESETS, CHAT_EMOJIS } from "@/types/game";

type LobbyPlayer = {
  id: string;
  name: string;
  emoji: string;
  isReady: boolean;
  isHost: boolean;
};

type LobbyScreenProps = {
  roomCode: string;
  mode: RoomMode;
  language: Language;
  isHost: boolean;
  onBack: () => void;
  onStart: () => void;
};

const MOCK_PLAYERS: LobbyPlayer[] = [
  { id: "me", name: "Tú", emoji: "🕵️", isReady: false, isHost: true },
  { id: "p2", name: "Luna_Star", emoji: "💃", isReady: true, isHost: false },
  { id: "p3", name: "MintChoco", emoji: "🧁", isReady: true, isHost: false },
  { id: "p4", name: "PixelQueen", emoji: "👑", isReady: false, isHost: false },
  { id: "p5", name: "StarGirl", emoji: "⭐", isReady: true, isHost: false },
];

const LobbyScreen = ({ roomCode, mode, isHost, onBack, onStart }: LobbyScreenProps) => {
  const [players, setPlayers] = useState<LobbyPlayer[]>(MOCK_PLAYERS);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      senderId: "p2",
      senderName: "Luna_Star",
      messageType: "preset",
      content: "Confíen en mí",
      createdAt: Date.now() - 30000,
    },
    {
      id: "2",
      senderId: "p3",
      senderName: "MintChoco",
      messageType: "emoji",
      content: "😊",
      createdAt: Date.now() - 15000,
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const myPlayer = players.find((p) => p.id === "me")!;
  const allReady = players.every((p) => p.isReady);
  const readyCount = players.filter((p) => p.isReady).length;
  const minPlayers = 3;
  const canStart = isHost && allReady && players.length >= minPlayers;

  const toggleReady = () => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === "me" ? { ...p, isReady: !p.isReady } : p))
    );
  };

  const sendMessage = (content: string, type: ChatMessage["messageType"] = "free") => {
    if (!content.trim()) return;
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: "me",
      senderName: "Tú",
      messageType: type,
      content,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    setChatInput("");
    setShowPresets(false);
    setShowEmojis(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="gradient-fun px-6 pb-5 pt-12 safe-top">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20"
          >
            <ArrowLeft className="h-5 w-5 text-primary-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold text-primary-foreground">
              Lobby
            </h1>
            <p className="font-body text-xs text-primary-foreground/70">
              Sala: {roomCode} · {mode === "friends" ? "Amigas" : "Rápida"}
            </p>
          </div>
        </div>
      </div>

      {/* Players */}
      <div className="px-4 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-sm font-bold text-muted-foreground">
            Jugadoras ({players.length}/8)
          </span>
          <span className="font-body text-xs text-muted-foreground">
            {readyCount}/{players.length} listas
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {players.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="relative">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                    p.isReady ? "gradient-primary shadow-soft" : "bg-muted"
                  }`}
                >
                  <span className="text-2xl">{p.emoji}</span>
                </div>
                {p.isReady && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-campus-mint"
                  >
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </motion.div>
                )}
                {p.isHost && (
                  <div className="absolute -top-1 -right-1 text-xs">👑</div>
                )}
              </div>
              <span className="max-w-[56px] truncate font-body text-[10px] font-medium text-foreground">
                {p.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex flex-1 flex-col px-4 pt-2">
        <div className="mb-2 font-display text-sm font-bold text-muted-foreground">
          Chat 💬
        </div>
        <div className="flex-1 overflow-y-auto rounded-2xl bg-card p-3 shadow-soft">
          <div className="space-y-2">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${
                  msg.senderId === "me" ? "items-end" : "items-start"
                }`}
              >
                <span className="mb-0.5 font-body text-[10px] text-muted-foreground">
                  {msg.senderName}
                </span>
                <div
                  className={`rounded-2xl px-3 py-2 ${
                    msg.senderId === "me"
                      ? "gradient-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  } ${msg.messageType === "emoji" ? "text-2xl bg-transparent px-1 py-0" : "font-body text-sm"}`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Preset chips (quick play) or emoji panel */}
        <AnimatePresence>
          {showPresets && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 py-2">
                {CHAT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => sendMessage(preset, "preset")}
                    className="rounded-full bg-muted px-3 py-1.5 font-body text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          {showEmojis && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 py-2">
                {CHAT_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => sendMessage(emoji, "emoji")}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-xl transition-colors hover:bg-secondary"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat input */}
        <div className="flex items-center gap-2 py-3">
          {/* Preset toggle (always shown) */}
          <button
            onClick={() => {
              setShowPresets(!showPresets);
              setShowEmojis(false);
            }}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
              showPresets ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            <span className="text-sm font-bold">💬</span>
          </button>

          {/* Emoji toggle */}
          <button
            onClick={() => {
              setShowEmojis(!showEmojis);
              setShowPresets(false);
            }}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
              showEmojis ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            <SmilePlus className="h-5 w-5" />
          </button>

          {mode === "friends" ? (
            <>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(chatInput)}
                placeholder="Escribe un mensaje..."
                className="h-10 flex-1 rounded-xl border-none bg-muted px-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => sendMessage(chatInput)}
                disabled={!chatInput.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-primary text-primary-foreground disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex-1 rounded-xl bg-muted px-3 py-2.5 font-body text-xs text-muted-foreground">
              Usa presets o emojis para chatear 👆
            </div>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex gap-3 px-4 pb-4 safe-bottom">
        <Button
          onClick={toggleReady}
          className={`h-14 flex-1 rounded-2xl font-display text-base font-bold ${
            myPlayer.isReady
              ? "bg-campus-mint text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          {myPlayer.isReady ? "✅ Lista" : "Estoy lista"}
        </Button>

        {isHost && (
          <Button
            onClick={onStart}
            disabled={!canStart}
            className="h-14 flex-1 rounded-2xl gradient-warm text-primary-foreground shadow-soft font-display text-base font-bold disabled:opacity-40"
          >
            🚀 Empezar
          </Button>
        )}
      </div>
    </div>
  );
};

export default LobbyScreen;
