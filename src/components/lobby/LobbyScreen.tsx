import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Send, SmilePlus, Loader2 } from "lucide-react";
import type { RoomMode, ChatMessage, Language } from "@/types/game";
import { CHAT_EMOJIS } from "@/types/game";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useRoom, leaveRoom } from "@/hooks/use-room";

type LobbyScreenProps = {
  roomCode: string;
  roomId: string | null;
  mode: RoomMode;
  language: Language;
  isHost: boolean;
  onBack: () => void;
  onStart: (chosenRole: "agent" | "saboteur") => void;
};

const LobbyScreen = ({ roomCode, roomId, mode, isHost, onBack, onStart }: LobbyScreenProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { room, players, loading, setReady } = useRoom(roomId, user?.id);

  const myPlayer = players.find((p) => p.user_id === user?.id);
  const myReady = myPlayer?.is_ready ?? false;
  const allReady = players.length > 0 && players.every((p) => p.is_ready);
  const readyCount = players.filter((p) => p.is_ready).length;
  // For solo-test, allow start with 1+. For real multiplayer the bot fill happens server-side later.
  const canStart = isHost && allReady && players.length >= 1;

  const CHAT_PRESETS_TRANSLATED = useMemo(() => [
    t("chat-saw-player"), t("chat-i-was-in"), t("chat-i-think"), t("chat-acted-weird"),
    t("chat-not-me"), t("chat-trust-me"), t("chat-skip-vote"), t("chat-where-were-you"),
  ], [t]);

  // Lobby chat is local-only for now (real chat sync arrives in Phase D for the meeting screen)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [chosenRole, setChosenRole] = useState<"agent" | "saboteur">("agent");

  const sendMessage = (content: string, type: ChatMessage["messageType"] = "free") => {
    if (!content.trim()) return;
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), senderId: user?.id ?? "me", senderName: t("you"), messageType: type, content, createdAt: Date.now() }]);
    setChatInput(""); setShowPresets(false); setShowEmojis(false);
  };

  const handleBack = async () => {
    if (roomId) {
      try { await leaveRoom(roomId); } catch { /* ignore */ }
    }
    onBack();
  };

  const toggleReady = () => setReady(!myReady);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="gradient-fun px-6 pb-5 pt-12 safe-top">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20">
            <ArrowLeft className="h-5 w-5 text-primary-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold text-primary-foreground">{t("lobby")}</h1>
            <p className="font-body text-xs text-primary-foreground/70">{t("roomLabel")}: {roomCode} · {mode === "friends" ? t("friendsMode") : t("quickMode")}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="px-4 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-display text-sm font-bold text-muted-foreground">{t("players")} ({players.length}/{room?.max_players ?? 6})</span>
              <span className="font-body text-xs text-muted-foreground">{readyCount}/{players.length} {t("ready")}</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {players.map((p, i) => (
                <motion.div key={p.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.08 }} className="flex flex-col items-center gap-1">
                  <div className="relative">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${p.is_ready ? "gradient-primary shadow-soft" : "bg-muted"}`}>
                      <span className="text-2xl">🕵️</span>
                    </div>
                    {p.is_ready && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-campus-mint"><Check className="h-3 w-3 text-primary-foreground" /></motion.div>}
                    {p.user_id === room?.host_id && <div className="absolute -top-1 -right-1 text-xs">👑</div>}
                  </div>
                  <span className="max-w-[56px] truncate font-body text-[10px] font-medium text-foreground">{p.profile?.display_name ?? "..."}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-1 flex-col px-4 pt-2">
            <div className="mb-2 font-display text-sm font-bold text-muted-foreground">{t("chat")}</div>
            <div className="flex-1 overflow-y-auto rounded-2xl bg-card p-3 shadow-soft">
              <div className="space-y-2">
                {messages.map((msg) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${msg.senderId === user?.id ? "items-end" : "items-start"}`}>
                    <span className="mb-0.5 font-body text-[10px] text-muted-foreground">{msg.senderName}</span>
                    <div className={`rounded-2xl px-3 py-2 ${msg.senderId === user?.id ? "gradient-primary text-primary-foreground" : "bg-muted text-foreground"} ${msg.messageType === "emoji" ? "text-2xl bg-transparent px-1 py-0" : "font-body text-sm"}`}>{msg.content}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {showPresets && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="flex flex-wrap gap-2 py-2">
                    {CHAT_PRESETS_TRANSLATED.map((preset) => (
                      <button key={preset} onClick={() => sendMessage(preset, "preset")} className="rounded-full bg-muted px-3 py-1.5 font-body text-xs font-medium text-foreground transition-colors hover:bg-secondary">{preset}</button>
                    ))}
                  </div>
                </motion.div>
              )}
              {showEmojis && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="flex flex-wrap gap-2 py-2">
                    {CHAT_EMOJIS.map((emoji) => (
                      <button key={emoji} onClick={() => sendMessage(emoji, "emoji")} className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-xl transition-colors hover:bg-secondary">{emoji}</button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2 py-3">
              <button onClick={() => { setShowPresets(!showPresets); setShowEmojis(false); }} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${showPresets ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><span className="text-sm font-bold">💬</span></button>
              <button onClick={() => { setShowEmojis(!showEmojis); setShowPresets(false); }} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${showEmojis ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><SmilePlus className="h-5 w-5" /></button>
              {mode === "friends" ? (
                <>
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage(chatInput)} placeholder={t("writeMessage")} className="h-10 flex-1 rounded-xl border-none bg-muted px-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <button onClick={() => sendMessage(chatInput)} disabled={!chatInput.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-primary text-primary-foreground disabled:opacity-40"><Send className="h-4 w-4" /></button>
                </>
              ) : (
                <div className="flex-1 rounded-xl bg-muted px-3 py-2.5 font-body text-xs text-muted-foreground">{t("usePresetsOrEmojis")}</div>
              )}
            </div>
          </div>

          <div className="px-4 pb-2">
            <div className="mb-1 font-display text-xs font-bold text-muted-foreground">{t("chooseRole") || "Elige tu rol (solo pruebas)"}</div>
            <div className="flex gap-2">
              <button onClick={() => setChosenRole("agent")} className={`flex-1 rounded-2xl py-2.5 font-display text-sm font-bold transition-all ${chosenRole === "agent" ? "gradient-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground"}`}>
                🕵️ {t("agent") || "Agente"}
              </button>
              <button onClick={() => setChosenRole("saboteur")} className={`flex-1 rounded-2xl py-2.5 font-display text-sm font-bold transition-all ${chosenRole === "saboteur" ? "bg-destructive text-destructive-foreground shadow-soft" : "bg-muted text-muted-foreground"}`}>
                🔥 {t("saboteur") || "Saboteador"}
              </button>
            </div>
          </div>
          <div className="flex gap-3 px-4 pb-4 safe-bottom">
            <Button onClick={toggleReady} className={`h-14 flex-1 rounded-2xl font-display text-base font-bold ${myReady ? "bg-campus-mint text-primary-foreground" : "bg-muted text-foreground"}`}>
              {myReady ? t("readyCheck") : t("imReady")}
            </Button>
            {isHost && (
              <Button onClick={() => onStart(chosenRole)} disabled={!canStart} className="h-14 flex-1 rounded-2xl gradient-warm text-primary-foreground shadow-soft font-display text-base font-bold disabled:opacity-40">{t("start")}</Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LobbyScreen;
