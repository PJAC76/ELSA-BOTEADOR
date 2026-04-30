import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Timer, MessageCircle, SmilePlus, Vote, SkipForward, MapPin, Lightbulb, Key, Send, Sticker as StickerIcon, VolumeX, Volume2 } from "lucide-react";
import { CHAT_PRESETS, CHAT_EMOJIS, ZONE_INFO } from "@/types/game";
import type { ChatMessage, Zone, PlayerRole } from "@/types/game";
import { STICKERS, encodeSticker, parseSticker, type StickerId } from "@/lib/chat-stickers";
import { playTap, playVoteAlarm, playTimerUrgent, playElimination } from "@/lib/sounds";
import { useTranslation } from "@/lib/i18n";
import { castVote, resolveMeeting, type VoteResolveResult } from "@/hooks/use-match";
import { supabase } from "@/integrations/supabase/client";

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
  onWordGuessed?: (playerName?: string, playerEmoji?: string) => void;
  onClueGiven?: () => void;
  secretWord: string | null; // null for saboteur
  secretCategory: string;
  secretClues: string[]; // contextual clues for the word
  myRole: PlayerRole;
  // Online (server-authoritative) extras — optional
  matchId?: string | null;
  /** Current round id, used for realtime chat subscription. */
  roundId?: string | null;
  /** Map MeetingPlayer.id → real auth user_id (only humans). Used to translate
   *  votes and eliminations between local mock IDs and server user IDs. */
  playerUserIds?: Record<string, string | null>;
  /** Called instead of onVoteResult when the server resolved the meeting. */
  onServerResolved?: (result: VoteResolveResult) => void;
};

// --- Constants ---

const CLUE_TIME_PER_PLAYER = 12;
const DISCUSSION_TIME = 30;
const VOTING_TIME = 15;
const TOTAL_CLUE_ROUNDS = 2;

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
  onClueGiven,
}: {
  players: MeetingPlayer[];
  myPlayerId: string;
  secretWord: string | null;
  secretCategory: string;
  secretClues: string[];
  myRole: PlayerRole;
  onCluesComplete: (clues: ClueEntry[]) => void;
  onClueGiven?: () => void;
}) => {
  const { t } = useTranslation();
  const alivePlayers = players.filter((p) => p.isAlive);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [clues, setClues] = useState<ClueEntry[]>([]);
  const [myClueInput, setMyClueInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(CLUE_TIME_PER_PLAYER);
  const turnSubmittedRef = useRef(false);

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

  // Reset guard when turn changes
  useEffect(() => {
    turnSubmittedRef.current = false;
  }, [currentTurnIndex]);

  const advanceTurn = useCallback((currentClues: ClueEntry[]) => {
    const nextIndex = currentTurnIndex + 1;
    if (nextIndex >= alivePlayers.length) {
      setCurrentTurnIndex(nextIndex); // Move past last player to stop timer
      onCluesComplete(currentClues);
    } else {
      setCurrentTurnIndex(nextIndex);
      setTimeLeft(CLUE_TIME_PER_PLAYER);
    }
  }, [currentTurnIndex, alivePlayers.length, onCluesComplete]);

  const submitMyClue = useCallback((clue: string) => {
    if (turnSubmittedRef.current) return;
    turnSubmittedRef.current = true;
    const sanitized = clue.trim().split(/\s+/)[0] || "...";
    const entry: ClueEntry = {
      playerId: "me",
      playerName: t("you"),
      emoji: "🕵️",
      clue: sanitized,
    };
    const newClues = [...clues, entry];
    setClues(newClues);
    setMyClueInput("");
    onClueGiven?.();
    advanceTurn(newClues);
  }, [clues, t, onClueGiven, advanceTurn]);

  const submitBotClue = useCallback(() => {
    if (turnSubmittedRef.current) return;
    turnSubmittedRef.current = true;
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
  }, [clues, currentPlayer, generateBotClue, advanceTurn]);

  // Timer per turn
  useEffect(() => {
    if (currentTurnIndex >= alivePlayers.length) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (!turnSubmittedRef.current) {
            if (isMyTurn) {
              submitMyClue(myClueInput || "...");
            } else {
              submitBotClue();
            }
          }
          return 0; // Don't reset — advanceTurn handles the next turn's timer
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentTurnIndex, isMyTurn, alivePlayers.length, submitMyClue, submitBotClue, myClueInput]);

  // Auto-trigger bot clue after short delay (immediate advance, no waiting for timer)
  useEffect(() => {
    if (currentTurnIndex >= alivePlayers.length) return;
    if (!isMyTurn) {
      const delay = setTimeout(() => {
        submitBotClue();
      }, 1500 + Math.random() * 1500);
      return () => clearTimeout(delay);
    }
  }, [currentTurnIndex, isMyTurn, alivePlayers.length, submitBotClue]);

  return (
    <div className="flex flex-col gap-3">
      {/* Word/Category reminder */}
      <div className={`rounded-2xl p-3 text-center ${myRole === "agent" ? "bg-primary/10" : "bg-destructive/10"}`}>
        <p className="font-body text-[10px] text-muted-foreground mb-1">
          {myRole === "agent" ? t("secretWordLabel") : t("secretCategoryOnly")}
        </p>
        <p className="font-display text-lg font-black text-foreground">
          {myRole === "agent" ? `🔑 ${secretWord}` : `❓ ${secretCategory}`}
        </p>
        {myRole === "saboteur" && (
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
  onSendFree,
  onSendSticker,
  disabled,
  players,
  clues,
  myPlayerId,
}: {
  messages: ChatMessage[];
  onSendPreset: (msg: string) => void;
  onSendEmoji: (emoji: string) => void;
  onSendFree: (msg: string) => void;
  onSendSticker: (id: StickerId) => void;
  disabled: boolean;
  players: MeetingPlayer[];
  clues: ClueEntry[];
  myPlayerId: string;
}) => {
  const { t } = useTranslation();
  const [showEmojis, setShowEmojis] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [previewSticker, setPreviewSticker] = useState<StickerId | null>(null);
  const [freeInput, setFreeInput] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesScrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const presetsPanelRef = useRef<HTMLDivElement | null>(null);
  const emojisPanelRef = useRef<HTMLDivElement | null>(null);
  const stickersPanelRef = useRef<HTMLDivElement | null>(null);
  const stickerGridRef = useRef<HTMLDivElement | null>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const prevMessagesLenRef = useRef(messages.length);
  const isNearBottomRef = useRef(true);
  const announceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAnnouncedRef = useRef<{ text: string; at: number }>({ text: "", at: 0 });
  const [mutedIds, setMutedIds] = useState<Set<string>>(() => {
    try {
      const raw = sessionStorage.getItem("meeting:mutedIds");
      if (!raw) return new Set();
      const arr = JSON.parse(raw) as string[];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  });
  const toggleMute = useCallback((senderId: string) => {
    setMutedIds((prev) => {
      const next = new Set(prev);
      if (next.has(senderId)) next.delete(senderId);
      else next.add(senderId);
      try {
        sessionStorage.setItem("meeting:mutedIds", JSON.stringify(Array.from(next)));
      } catch {
        /* ignore */
      }
      playTap();
      return next;
    });
  }, []);

  const MAX_LEN = 140;
  const TRUNCATE_AT = 90;
  const NEAR_BOTTOM_PX = 60;
  // Min gap between two consecutive announcements (avoids screen reader spam)
  const ANNOUNCE_THROTTLE_MS = 1500;

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
    });
    setUnreadCount(0);
  };

  // Track scroll position to know if user is near the bottom.
  useEffect(() => {
    const el = messagesScrollRef.current;
    if (!el) return;
    const handle = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      const near = distance < NEAR_BOTTOM_PX;
      setIsNearBottom(near);
      isNearBottomRef.current = near;
      if (near) setUnreadCount(0);
    };
    el.addEventListener("scroll", handle, { passive: true });
    handle();
    return () => el.removeEventListener("scroll", handle);
  }, []);

  // Cleanup pending announcement timer on unmount
  useEffect(() => {
    return () => {
      if (announceTimerRef.current) clearTimeout(announceTimerRef.current);
    };
  }, []);

  // Auto-scroll + accessible announcement when new messages arrive.
  // Skip announcing if the user is already near the bottom (they're reading live).
  useEffect(() => {
    const prevLen = prevMessagesLenRef.current;
    const added = messages.length - prevLen;
    prevMessagesLenRef.current = messages.length;
    if (added <= 0) return;
    const el = messagesScrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const near = distanceFromBottom < NEAR_BOTTOM_PX;

    if (near) {
      scrollToBottom("smooth");
      return;
    }

    setUnreadCount((c) => c + added);

    // Build a concise announcement (latest message author or aggregate count).
    const newOnes = messages.slice(-added);
    let text: string;
    if (added === 1) {
      const m = newOnes[0];
      const sticker = parseSticker(m.content);
      const tpl = sticker ? t("chatNewStickerFrom") : t("chatNewMessageFrom");
      text = (tpl || "{name}").replace("{name}", m.senderName);
    } else {
      const tpl = t("chatMultipleNewMessages") || "{count}";
      text = tpl.replace("{count}", String(added));
    }

    // Throttle: avoid repeating the exact same announcement within the window.
    const now = Date.now();
    const last = lastAnnouncedRef.current;
    if (text === last.text && now - last.at < ANNOUNCE_THROTTLE_MS) return;

    if (announceTimerRef.current) clearTimeout(announceTimerRef.current);
    // Re-check "near bottom" right before announcing — user may have scrolled.
    announceTimerRef.current = setTimeout(() => {
      if (isNearBottomRef.current) return;
      // Toggle to empty first so identical consecutive texts still get announced.
      setLiveAnnouncement("");
      requestAnimationFrame(() => setLiveAnnouncement(text));
      lastAnnouncedRef.current = { text, at: Date.now() };
    }, 250);
  }, [messages, t]);

  const fillTemplate = (template: string) => {
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    const zones = ["Biblioteca", "Cafetería", "Auditorio", "Laboratorio", "Gimnasio", "Jardín"];
    const randomZone = zones[Math.floor(Math.random() * zones.length)];
    return template.replace("{player}", randomPlayer.name).replace("{zone}", randomZone);
  };

  const handleSendFree = () => {
    const trimmed = freeInput.trim().slice(0, MAX_LEN);
    if (!trimmed) return;
    onSendFree(trimmed);
    setFreeInput("");
    playTap();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSendFree();
    } else if (e.key === "Escape") {
      if (showEmojis || showPresets || showStickers) {
        e.preventDefault();
        closeAllPanels(true);
      }
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // --- Focus management for popover panels ---
  // When a panel opens, move focus to its first focusable item; when all
  // panels close (e.g., via Escape), restore focus to the chat input.
  const focusFirstIn = useCallback((container: HTMLElement | null) => {
    if (!container) return;
    const first = container.querySelector<HTMLElement>(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    first?.focus();
  }, []);

  useEffect(() => {
    if (!showStickers) return;
    const id = requestAnimationFrame(() => focusFirstIn(stickersPanelRef.current));
    return () => cancelAnimationFrame(id);
  }, [showStickers, focusFirstIn]);

  useEffect(() => {
    if (!showEmojis) return;
    const id = requestAnimationFrame(() => focusFirstIn(emojisPanelRef.current));
    return () => cancelAnimationFrame(id);
  }, [showEmojis, focusFirstIn]);

  useEffect(() => {
    if (!showPresets) return;
    const id = requestAnimationFrame(() => focusFirstIn(presetsPanelRef.current));
    return () => cancelAnimationFrame(id);
  }, [showPresets, focusFirstIn]);

  const closeAllPanels = useCallback((restoreFocus = true) => {
    setShowEmojis(false);
    setShowPresets(false);
    setShowStickers(false);
    setPreviewSticker(null);
    if (restoreFocus) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, []);

  // Roving keyboard navigation inside the sticker grid (arrow keys + Home/End).
  const handleStickerGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const grid = stickerGridRef.current;
    if (!grid) return;
    const items = Array.from(
      grid.querySelectorAll<HTMLButtonElement>('button[role="gridcell"]'),
    );
    if (items.length === 0) return;
    const activeIdx = items.indexOf(document.activeElement as HTMLButtonElement);
    if (activeIdx < 0) return;
    // Detect columns from the layout (responsive: 6 base, 8 ≥ sm).
    const cols = window.matchMedia("(min-width: 640px)").matches ? 8 : 6;
    let nextIdx = activeIdx;
    switch (e.key) {
      case "ArrowRight": nextIdx = Math.min(items.length - 1, activeIdx + 1); break;
      case "ArrowLeft": nextIdx = Math.max(0, activeIdx - 1); break;
      case "ArrowDown": nextIdx = Math.min(items.length - 1, activeIdx + cols); break;
      case "ArrowUp": nextIdx = Math.max(0, activeIdx - cols); break;
      case "Home": nextIdx = 0; break;
      case "End": nextIdx = items.length - 1; break;
      default: return;
    }
    e.preventDefault();
    items[nextIdx]?.focus();
  };

  const remaining = MAX_LEN - freeInput.length;
  const remainingTone = remaining <= 0 ? "text-destructive" : remaining <= 20 ? "text-amber-500" : "text-muted-foreground";

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
      <div className="relative">
        <div
          ref={messagesScrollRef}
          className="h-32 overflow-y-auto overscroll-contain rounded-2xl bg-card p-3 shadow-soft scroll-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          role="log"
          aria-label={t("chat") || "Chat"}
          aria-live="off"
          tabIndex={0}
        >
          {messages.length === 0 ? (
            <p className="font-body text-xs text-muted-foreground text-center py-6">
              {t("discussionStarted")}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {messages.map((msg) => {
                const sticker = parseSticker(msg.content);
                if (sticker) {
                  return (
                    <div key={msg.id} className="flex items-center gap-2">
                      <span className="font-display text-xs font-bold text-primary shrink-0">{msg.senderName}:</span>
                      <span
                        role="img"
                        aria-label={`${msg.senderName}: sticker ${sticker.label}`}
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-3xl leading-none shadow-soft ${sticker.bg}`}
                      >
                        {sticker.glyph}
                      </span>
                    </div>
                  );
                }
                const isLong = msg.messageType !== "emoji" && msg.content.length > TRUNCATE_AT;
                const expanded = expandedIds.has(msg.id);
                const display = isLong && !expanded ? `${msg.content.slice(0, TRUNCATE_AT)}…` : msg.content;
                return (
                  <div key={msg.id} className="flex gap-2">
                    <span className="font-display text-xs font-bold text-primary shrink-0">{msg.senderName}:</span>
                    <span className={`font-body text-xs text-foreground break-words min-w-0 ${msg.messageType === "emoji" ? "text-lg" : ""}`}>
                      {display}
                      {isLong && (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(msg.id)}
                          aria-expanded={expanded}
                          className="ml-1 font-display text-[10px] font-bold text-primary underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                        >
                          {expanded ? t("showLess") : t("showMore")}
                        </button>
                      )}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* New messages badge: appears when not near the bottom and new msgs arrive */}
        <AnimatePresence>
          {unreadCount > 0 && !isNearBottom && (
            <motion.button
              type="button"
              onClick={() => scrollToBottom("smooth")}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 font-display text-[11px] font-bold text-primary-foreground shadow-glow hover:bg-primary/90 active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
              aria-label={`${unreadCount} ${unreadCount === 1 ? t("newMessage") : t("newMessages")}`}
            >
              <span aria-hidden="true">↓</span>
              <span>
                {unreadCount} {unreadCount === 1 ? t("newMessage") : t("newMessages")}
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Visually hidden polite live region for accessible new-message announcements.
            Only fires when the user is NOT near the bottom (handled in the effect above). */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {liveAnnouncement}
        </div>
      </div>

      {/* Input area */}
      {!disabled && (
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {showEmojis && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div
                  ref={emojisPanelRef}
                  id="chat-emojis-panel"
                  role="dialog"
                  aria-label={t("emojis") || "Emojis"}
                  onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); closeAllPanels(true); } }}
                  className="flex flex-wrap gap-2 rounded-2xl bg-card p-3"
                >
                  {CHAT_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => { onSendEmoji(emoji); playTap(); closeAllPanels(true); }}
                      className="text-xl active:scale-90 transition-transform rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                      aria-label={`emoji ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            {showPresets && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div
                  ref={presetsPanelRef}
                  id="chat-presets-panel"
                  role="dialog"
                  aria-label={t("presets") || "Frases rápidas"}
                  onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); closeAllPanels(true); } }}
                  className="flex flex-wrap gap-2 rounded-2xl bg-card p-3"
                >
                  {CHAT_PRESETS.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { onSendPreset(fillTemplate(preset)); playTap(); closeAllPanels(true); }}
                      className="shrink-0 rounded-full bg-muted px-3 py-1.5 font-body text-xs text-foreground active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    >
                      {preset.replace("{player}", "...").replace("{zone}", "...")}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            {showStickers && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div
                  ref={stickersPanelRef}
                  id="chat-stickers-panel"
                  role="dialog"
                  aria-label={t("stickers") || "Stickers"}
                  onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); closeAllPanels(true); } }}
                  className="relative rounded-2xl bg-card p-3"
                >
                  <div
                    ref={stickerGridRef}
                    role="grid"
                    aria-label={t("stickers") || "Stickers"}
                    onKeyDown={handleStickerGridKeyDown}
                    className="grid grid-cols-6 gap-2 sm:grid-cols-8"
                  >
                    {STICKERS.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        role="gridcell"
                        tabIndex={idx === 0 ? 0 : -1}
                        onClick={() => { onSendSticker(s.id); playTap(); closeAllPanels(true); }}
                        onMouseEnter={() => setPreviewSticker(s.id)}
                        onMouseLeave={() => setPreviewSticker((p) => (p === s.id ? null : p))}
                        onFocus={() => setPreviewSticker(s.id)}
                        onBlur={() => setPreviewSticker((p) => (p === s.id ? null : p))}
                        aria-label={`sticker ${s.label}`}
                        title={s.label}
                        className={`flex aspect-square items-center justify-center rounded-xl text-2xl shadow-soft active:scale-90 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-1 focus-visible:ring-offset-card ${s.bg}`}
                      >
                        {s.glyph}
                      </button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {previewSticker && (() => {
                      const s = STICKERS.find((x) => x.id === previewSticker);
                      if (!s) return null;
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.9 }}
                          aria-hidden="true"
                          className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
                        >
                          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-5xl shadow-glow ${s.bg}`}>
                            {s.glyph}
                          </div>
                          <span className="rounded-full bg-foreground/80 px-2 py-0.5 font-display text-[10px] font-bold text-background">
                            {s.label}
                          </span>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { const next = !showPresets; closeAllPanels(false); setShowPresets(next); }}
              aria-label={t("presets") || "Frases rápidas"}
              aria-haspopup="dialog"
              aria-expanded={showPresets}
              aria-controls="chat-presets-panel"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${showPresets ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => { const next = !showEmojis; closeAllPanels(false); setShowEmojis(next); }}
              aria-label={t("emojis") || "Emojis"}
              aria-haspopup="dialog"
              aria-expanded={showEmojis}
              aria-controls="chat-emojis-panel"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${showEmojis ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              <SmilePlus className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => { const next = !showStickers; closeAllPanels(false); setShowStickers(next); }}
              aria-label={t("stickers") || "Stickers"}
              aria-haspopup="dialog"
              aria-expanded={showStickers}
              aria-controls="chat-stickers-panel"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${showStickers ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              <StickerIcon className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="relative flex-1">
              <label htmlFor="chat-free-input" className="sr-only">{t("writeMessage")}</label>
              <input
                id="chat-free-input"
                ref={inputRef}
                value={freeInput}
                onChange={(e) => setFreeInput(e.target.value.slice(0, MAX_LEN))}
                onKeyDown={handleInputKeyDown}
                onFocus={() => { closeAllPanels(false); }}
                placeholder={t("writeMessage")}
                maxLength={MAX_LEN}
                enterKeyHint="send"
                autoComplete="off"
                autoCorrect="on"
                aria-label={t("writeMessage")}
                className="h-9 w-full rounded-xl bg-muted pl-3 pr-10 font-body text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
              />
              {freeInput.length >= MAX_LEN - 30 && (
                <span
                  aria-live="polite"
                  className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-display text-[10px] font-bold tabular-nums ${remainingTone}`}
                >
                  {remaining}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleSendFree}
              disabled={!freeInput.trim()}
              aria-label={t("send")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
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
  onClueGiven,
  secretWord,
  secretCategory,
  secretClues,
  myRole,
  matchId = null,
  roundId = null,
  playerUserIds = {},
  onServerResolved,
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
  const isOnline = !!matchId;
  const serverResolveOnceRef = useRef(false);
  const serverVoteSentRef = useRef(false);

  // Track my auth user_id so realtime echoes are labeled "Tú".
  const myUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) myUserIdRef.current = data.user?.id ?? null;
    });
    return () => { active = false; };
  }, []);

  // Realtime chat: subscribe to chat_messages for this round and render them.
  // Names/emojis are looked up from the local meeting roster via playerUserIds.
  useEffect(() => {
    if (!isOnline || !roundId) return;
    let cancelled = false;

    const userIdToLocal = new Map<string, { id: string; name: string; emoji: string }>();
    for (const [localId, uid] of Object.entries(playerUserIds)) {
      if (!uid) continue;
      const p = players.find((pp) => pp.id === localId);
      if (p) userIdToLocal.set(uid, { id: p.id, name: p.name, emoji: p.emoji });
    }

    type Row = { id: string; sender_id: string; message: string; is_preset: boolean; created_at: string };
    const ingest = (rows: Row[]) => {
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const next = [...prev];
        for (const r of rows) {
          if (seen.has(r.id)) continue;
          const meta = userIdToLocal.get(r.sender_id);
          const isMe = r.sender_id === myUserIdRef.current;
          const isEmoji = r.message.length <= 3 && /\p{Extended_Pictographic}/u.test(r.message);
          next.push({
            id: r.id,
            senderId: r.sender_id,
            senderName: isMe ? "Tú" : (meta?.name ?? "Jugadora"),
            messageType: isEmoji ? "emoji" : (r.is_preset ? "preset" : "free"),
            content: r.message,
            createdAt: new Date(r.created_at).getTime(),
          });
        }
        return next.sort((a, b) => a.createdAt - b.createdAt);
      });
    };

    supabase
      .from("chat_messages")
      .select("*")
      .eq("round_id", roundId)
      .order("created_at", { ascending: true })
      .then(({ data }) => { if (!cancelled && data) ingest(data as Row[]); });

    const channel = supabase
      .channel(`chat-${roundId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `round_id=eq.${roundId}` },
        (payload) => { ingest([payload.new as Row]); },
      )
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [isOnline, roundId, players, playerUserIds]);

  const sendChatToServer = useCallback(async (content: string, isPreset: boolean) => {
    if (!isOnline || !roundId) return false;
    const uid = myUserIdRef.current;
    if (!uid) return false;
    // Server-side dedupe: a stable per-send UUID. If a reconnect or a fast
    // double-tap retries the same payload with the same client_msg_id, the
    // unique index (round_id, sender_id, client_msg_id) drops the duplicate.
    const clientMsgId =
      (typeof crypto !== "undefined" && "randomUUID" in crypto)
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const { error } = await supabase
      .from("chat_messages")
      .upsert(
        {
          round_id: roundId,
          sender_id: uid,
          message: content,
          is_preset: isPreset,
          client_msg_id: clientMsgId,
        },
        { onConflict: "round_id,sender_id,client_msg_id", ignoreDuplicates: true },
      );
    if (error) { console.warn("[chat insert]", error); return false; }
    return true;
  }, [isOnline, roundId]);

  const normalizeWord = (w: string) => w.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const handleGuessWord = useCallback(() => {
    if (!guessInput.trim() || !secretWord || hasGuessedCorrectly) return;
    const guess = normalizeWord(guessInput);
    const answer = normalizeWord(secretWord);
    if (guess === answer) {
      setGuessResult("correct");
      setHasGuessedCorrectly(true);
      onWordGuessed?.("Tú", "🕵️");
      playTap();
    } else {
      setGuessResult("wrong");
      setTimeout(() => setGuessResult(null), 2000);
    }
    setGuessInput("");
  }, [guessInput, secretWord, hasGuessedCorrectly, onWordGuessed]);

  const handleCluesComplete = useCallback((clues: ClueEntry[]) => {
    setRoundClues((prev) => [...prev, ...clues]);
    // Do both clue rounds back-to-back before discussion
    if (clueRoundNumber < TOTAL_CLUE_ROUNDS) {
      setClueRoundNumber((r) => r + 1);
      setPhase("clues");
    } else {
      setPhase("discussion");
      setTimeLeft(DISCUSSION_TIME);
    }
  }, [clueRoundNumber]);

  // Timer for discussion and voting phases
  useEffect(() => {
    if (phase === "result" || phase === "clues") return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (phase === "discussion") {
            setPhase("voting");
            setTimeLeft(VOTING_TIME);
            playVoteAlarm();
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

  // Mock bot messages during discussion — agents accuse the saboteur
  useEffect(() => {
    if (phase !== "discussion" || isOnline) return;
    const botPlayers = players.filter((p) => p.id !== myPlayerId && p.isAlive);
    const saboteurPlayer = players.find((p) => p.role === "saboteur" && p.isAlive);
    const timers: ReturnType<typeof setTimeout>[] = [];

    const genericMessages = [
      "Yo estaba en la Biblioteca 📚",
      "No fui yo, lo juro",
      "🤔",
      "¿Dónde estabas tú?",
      "Creo que deberíamos votar",
    ];

    const accusationTemplates = [
      "Yo creo que es {name} 👀",
      "{name} actuó muy raro esta ronda",
      "Vi a {name} cerca de una zona saboteada 🤨",
      "No confío en {name} para nada",
      "{name} no dio buenas pistas, voto por {name}",
      "Seguro es {name}, sus pistas no tenían sentido",
    ];

    botPlayers.forEach((bot, i) => {
      const timer = setTimeout(() => {
        let msg: string;

        // Accusation accuracy increases per round: R1=50%, R2=70%, R3=90%
        const accuseChance = round === 1 ? 0.5 : round === 2 ? 0.7 : 0.9;
        if (bot.role === "agent" && saboteurPlayer && Math.random() < accuseChance) {
          // 70% chance agent bots accuse the saboteur
          const template = accusationTemplates[Math.floor(Math.random() * accusationTemplates.length)];
          msg = template.replace(/\{name\}/g, saboteurPlayer.name);
        } else if (bot.role === "saboteur") {
          // Saboteur deflects blame to a random agent
          const agents = players.filter((p) => p.role === "agent" && p.isAlive && p.id !== myPlayerId);
          const randomAgent = agents[Math.floor(Math.random() * agents.length)];
          if (randomAgent && Math.random() < 0.6) {
            const template = accusationTemplates[Math.floor(Math.random() * accusationTemplates.length)];
            msg = template.replace(/\{name\}/g, randomAgent.name);
          } else {
            msg = genericMessages[Math.floor(Math.random() * genericMessages.length)];
          }
        } else {
          msg = genericMessages[Math.floor(Math.random() * genericMessages.length)];
        }

        setMessages((prev) => [
          ...prev,
          { id: `bot-${Date.now()}-${i}`, senderId: bot.id, senderName: bot.name, messageType: msg.length <= 3 ? "emoji" : "preset", content: msg, createdAt: Date.now() },
        ]);
      }, 2000 + i * 3500 + Math.random() * 2000);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [phase, players, myPlayerId, round, isOnline]);

  // Bot word guess attempts during discussion
  useEffect(() => {
    if (phase !== "discussion" || !secretWord || isOnline) return;
    const botPlayers = players.filter((p) => p.id !== myPlayerId && p.isAlive);
    const timers: ReturnType<typeof setTimeout>[] = [];

    const wrongGuesses = ["manzana", "elefante", "guitarra", "castillo", "tormenta", "volcán", "pirata", "diamante", "cometa", "robot"];

    botPlayers.forEach((bot, i) => {
      // Only some bots try to guess (60% chance)
      if (Math.random() > 0.6) return;

      const timer = setTimeout(() => {
        const isAgent = bot.role === "agent";
        // Agents guess correctly 40% of the time, saboteur never guesses correctly
        const guessesCorrectly = isAgent && Math.random() < 0.4;

        if (guessesCorrectly) {
          onWordGuessed?.(bot.name, bot.emoji);
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-guess-${Date.now()}-${i}`,
              senderId: bot.id,
              senderName: bot.name,
              messageType: "preset" as const,
              content: t("botGuessCorrect").replace("{name}", bot.name),
              createdAt: Date.now(),
            },
          ]);
        } else {
          const wrongWord = wrongGuesses[Math.floor(Math.random() * wrongGuesses.length)];
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-guess-${Date.now()}-${i}`,
              senderId: bot.id,
              senderName: bot.name,
              messageType: "preset" as const,
              content: t("botGuessWrong").replace("{name}", bot.name).replace("{guess}", wrongWord),
              createdAt: Date.now(),
            },
          ]);
        }
      }, 8000 + (i + 1) * 3000 + Math.random() * 2000);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [phase, players, myPlayerId, secretWord, t, isOnline, onWordGuessed]);

  // Mock bot votes — agents tend to vote for the saboteur, saboteur votes randomly
  useEffect(() => {
    if (phase !== "voting") return;
    const botPlayers = players.filter((p) => p.id !== myPlayerId && p.isAlive);
    const alivePlayers = players.filter((p) => p.isAlive);
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Find the actual saboteur among alive players (for agent bots to target)
    const saboteurPlayer = alivePlayers.find((p) => p.role === "saboteur");
    const nonSaboteurPlayers = alivePlayers.filter((p) => p.role !== "saboteur");

    // Vote accuracy scales with round: agents learn over time
    const saboteurVoteChance = round === 1 ? 0.40 : round === 2 ? 0.60 : 0.80;
    const skipChance = round === 1 ? 0.15 : round === 2 ? 0.08 : 0.03;

    botPlayers.forEach((bot, i) => {
      const timer = setTimeout(() => {
        if (Math.random() < skipChance) {
          setVotes((prev) => ({ ...prev, [bot.id]: "skip" }));
          return;
        }

        let target: typeof alivePlayers[0];

        if (bot.role === "agent" && saboteurPlayer) {
          const roll = Math.random();
          if (roll < saboteurVoteChance) {
            target = saboteurPlayer;
          } else if (roll < saboteurVoteChance + 0.20 && nonSaboteurPlayers.length > 0) {
            target = nonSaboteurPlayers[Math.floor(Math.random() * nonSaboteurPlayers.length)];
          } else {
            target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
          }
        } else {
          // Saboteur bot: vote a random agent to deflect suspicion
          const agents = alivePlayers.filter((p) => p.role === "agent" && p.id !== myPlayerId);
          target = agents.length > 0
            ? agents[Math.floor(Math.random() * agents.length)]
            : alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
        }

        setVotes((prev) => ({ ...prev, [bot.id]: target.id }));
      }, (i + 1) * 2000);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [phase, players, myPlayerId, round]);

  // Use a ref to always have current votes for resolveVotes
  const votesRef = useRef(votes);
  const myVoteRef = useRef(myVote);
  useEffect(() => { votesRef.current = votes; }, [votes]);
  useEffect(() => { myVoteRef.current = myVote; }, [myVote]);

  const resolveVotes = useCallback(() => {
    // Online: server is authoritative. Show local "result" UI immediately
    // and call resolveMeeting once. The server returns the real eliminated
    // player and any final winner; we surface that to the parent via
    // onServerResolved (preferred) or onVoteResult.
    if (isOnline && matchId) {
      setPhase("result");
      if (serverResolveOnceRef.current) return;
      serverResolveOnceRef.current = true;
      resolveMeeting(matchId)
        .then((res) => {
          // Try to find a local representation of the eliminated player to animate
          let localElim: MeetingPlayer | null = null;
          if (res.eliminated?.userId) {
            const localId = Object.entries(playerUserIds).find(
              ([, uid]) => uid === res.eliminated!.userId,
            )?.[0];
            if (localId) localElim = players.find((p) => p.id === localId) ?? null;
          }
          setEliminatedPlayer(localElim);
          if (localElim || res.eliminated) playElimination();
          // Give the result animation a beat, then notify parent
          setTimeout(() => {
            if (onServerResolved) {
              onServerResolved(res);
            } else {
              onVoteResult(localElim?.id ?? res.eliminated?.userId ?? null);
            }
          }, 3500);
        })
        .catch((e) => {
          console.warn("[resolveMeeting]", e);
          // Fallback: don't get stuck — surface a no-elimination result
          setTimeout(() => onVoteResult(null), 1500);
        });
      return;
    }

    // Offline: pure client-side tally
    const allVotes = { ...votesRef.current };
    if (myVoteRef.current) allVotes[myPlayerId] = myVoteRef.current;

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
  }, [isOnline, matchId, myPlayerId, players, playerUserIds, onVoteResult, onServerResolved]);

  const handleSendPreset = (content: string) => {
    if (isGhost) return;
    if (isOnline) { void sendChatToServer(content, true); return; }
    setMessages((prev) => [...prev, { id: `me-${Date.now()}`, senderId: myPlayerId, senderName: "Tú", messageType: "preset", content, createdAt: Date.now() }]);
  };

  const handleSendFree = (content: string) => {
    if (isGhost) return;
    if (isOnline) { void sendChatToServer(content, false); return; }
    setMessages((prev) => [...prev, { id: `me-${Date.now()}`, senderId: myPlayerId, senderName: "Tú", messageType: "free", content, createdAt: Date.now() }]);
  };

  const handleSendEmoji = (emoji: string) => {
    if (isGhost) return;
    if (isOnline) { void sendChatToServer(emoji, false); return; }
    setMessages((prev) => [...prev, { id: `me-${Date.now()}`, senderId: myPlayerId, senderName: "Tú", messageType: "emoji", content: emoji, createdAt: Date.now() }]);
  };

  const handleSendSticker = (id: StickerId) => {
    if (isGhost) return;
    // Validate against the curated whitelist before sending.
    const payload = encodeSticker(id);
    if (!parseSticker(payload)) return; // safety: rejects anything not in catalog
    if (isOnline) { void sendChatToServer(payload, true); return; }
    setMessages((prev) => [
      ...prev,
      { id: `me-${Date.now()}`, senderId: myPlayerId, senderName: "Tú", messageType: "preset", content: payload, createdAt: Date.now() },
    ]);
  };

  const handleVote = (playerId: string | null) => {
    if (isGhost) return;
    setMyVote(playerId);
    if (playerId) {
      setVotes((prev) => ({ ...prev, [myPlayerId]: playerId }));
    } else {
      setVotes((prev) => { const next = { ...prev }; delete next[myPlayerId]; return next; });
    }
    // Push the human vote to the server (idempotent). "skip" → null target.
    if (isOnline && matchId && !serverVoteSentRef.current) {
      const targetUserId =
        playerId && playerId !== "skip" ? playerUserIds[playerId] ?? null : null;
      serverVoteSentRef.current = true;
      castVote(matchId, targetUserId).catch((e) => {
        console.warn("[castVote]", e);
        serverVoteSentRef.current = false; // allow retry
      });
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
            ? `${t("cluePhaseSubtitle")} (${t("clueRoundLabel")} ${clueRoundNumber}/${TOTAL_CLUE_ROUNDS})`
            : phase === "discussion"
            ? t("discussSaboteur")
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
              key={`clues-${clueRoundNumber}`}
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
                onClueGiven={onClueGiven}
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

              {/* Word Guess Input - only for saboteur who needs to guess */}
              {myRole === "saboteur" && secretWord && !isGhost && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-accent/10 p-3 border border-accent/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="h-4 w-4 text-accent-foreground" />
                    <span className="font-display text-xs font-bold text-foreground">{t("wordGuessTitle")}</span>
                  </div>
                  {hasGuessedCorrectly ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center justify-center gap-2 rounded-xl bg-primary/15 px-3 py-2"
                    >
                      <span className="font-display text-sm font-bold text-primary">{t("guessCorrect")}</span>
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 font-display text-[10px] font-bold text-primary">{t("guessCorrectXp")}</span>
                    </motion.div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={guessInput}
                        onChange={(e) => setGuessInput(e.target.value)}
                        placeholder={t("guessWordPlaceholder")}
                        maxLength={30}
                        className="flex-1 rounded-xl bg-muted px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground outline-none"
                        onKeyDown={(e) => { if (e.key === "Enter") handleGuessWord(); }}
                      />
                      <Button
                        onClick={handleGuessWord}
                        disabled={!guessInput.trim()}
                        className="rounded-xl font-display text-xs"
                        size="sm"
                      >
                        {t("guessWordButton")}
                      </Button>
                    </div>
                  )}
                  <AnimatePresence>
                    {guessResult === "wrong" && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-2 font-body text-xs text-destructive text-center"
                      >
                        {t("guessWrong")}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              <ChatPanel messages={messages} onSendPreset={handleSendPreset} onSendEmoji={handleSendEmoji} onSendFree={handleSendFree} onSendSticker={handleSendSticker} disabled={isGhost} players={players} clues={roundClues} />

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
