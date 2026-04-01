import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { REACTIONS, BOT_NAMES, pick, speakPhrase, playComboSound } from "./reactions/ReactionSounds";
import ReactionParticles from "./reactions/ReactionParticles";
import Shockwave from "./reactions/Shockwave";
import ComboIndicator from "./reactions/ComboIndicator";
import { useShopStore, SHOP_ITEMS } from "@/stores/shop-store";

type FloatingReaction = { id: number; emoji: string; sender: string; x: number; color: string };

const FloatingEmoji = ({ emoji, sender, x, onDone }: { emoji: string; sender: string; x: number; onDone: () => void }) => (
  <motion.div
    initial={{ opacity: 1, y: 0, scale: 0.5 }}
    animate={{ opacity: 0, y: -120, scale: 1.4, rotate: [0, 15, -15, 0] }}
    transition={{ duration: 1.2, ease: "easeOut" }}
    onAnimationComplete={onDone}
    className="pointer-events-none fixed z-[70] flex flex-col items-center"
    style={{ bottom: 100, left: `${x}%` }}
  >
    <span className="text-4xl drop-shadow-lg">{emoji}</span>
    <span className="mt-0.5 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-bold text-foreground shadow-sm backdrop-blur-sm">{sender}</span>
  </motion.div>
);

type ReactionsPanelProps = { enabled: boolean };

const COMBO_WINDOW = 2500; // ms window for combo detection

const ReactionsPanel = ({ enabled }: ReactionsPanelProps) => {
  const [open, setOpen] = useState(false);
  const [floating, setFloating] = useState<FloatingReaction[]>([]);
  const [cooldown, setCooldown] = useState(false);
  const [combo, setCombo] = useState(0);
  const [effects, setEffects] = useState<{ id: number; x: number; bottom: number; color: string }[]>([]);
  const reactionTimestamps = useRef<number[]>([]);
  const comboTimer = useRef<ReturnType<typeof setTimeout>>();
  const { equippedEmotes } = useShopStore();

  // Build custom emote reactions from equipped shop emotes
  const customEmotes = useMemo(() => {
    return equippedEmotes
      .map((emoteId) => SHOP_ITEMS.find((i) => i.id === emoteId))
      .filter(Boolean)
      .map((item) => ({
        id: `custom-${item!.id}`,
        emoji: item!.emoji,
        label: item!.emoji,
        color: "hsl(280, 70%, 60%)",
        sound: REACTIONS[0].sound, // default sound
        phrases: ["¡Mola!", "¡Qué fuerte!", "¡Eso!"],
      }));
  }, [equippedEmotes]);

  const allReactions = useMemo(() => [...REACTIONS, ...customEmotes], [customEmotes]);

  const updateCombo = useCallback(() => {
    const now = Date.now();
    reactionTimestamps.current = reactionTimestamps.current.filter(t => now - t < COMBO_WINDOW);
    reactionTimestamps.current.push(now);
    const count = reactionTimestamps.current.length;
    setCombo(count);
    if (count >= 2) playComboSound(count);
    clearTimeout(comboTimer.current);
    comboTimer.current = setTimeout(() => {
      reactionTimestamps.current = [];
      setCombo(0);
    }, COMBO_WINDOW);
  }, []);

  const spawnReaction = useCallback((emoji: string, sender: string, color: string) => {
    const id = Date.now() + Math.random();
    const x = 10 + Math.random() * 80;
    setFloating((f) => [...f, { id, emoji, sender, x, color }]);
    // Spawn particle + shockwave effects
    const effectId = Date.now() + Math.random();
    setEffects((e) => [...e, { id: effectId, x, bottom: 100, color }]);
    setTimeout(() => setEffects((e) => e.filter((ef) => ef.id !== effectId)), 1200);
    updateCombo();
  }, [updateCombo]);

  const handleReaction = useCallback((r: typeof REACTIONS[0] | typeof customEmotes[0]) => {
    if (cooldown) return;
    r.sound();
    speakPhrase(pick(r.phrases));
    spawnReaction(r.emoji, "Tú", r.color);
    setCooldown(true);
    setOpen(false);
    setTimeout(() => setCooldown(false), 1500);
  }, [cooldown, spawnReaction]);

  // Bot reactions
  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      const r = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
      const bot = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      r.sound();
      if (Math.random() > 0.5) speakPhrase(pick(r.phrases));
      spawnReaction(r.emoji, bot, r.color);
    }, 3000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, [enabled, spawnReaction]);

  const removeFloating = useCallback((id: number) => {
    setFloating((f) => f.filter((r) => r.id !== id));
  }, []);

  if (!enabled) return null;

  const comboIntensity = Math.min(combo, 5);

  return (
    <>
      {/* Combo indicator */}
      <ComboIndicator count={combo} />

      {/* Particle & shockwave effects */}
      {effects.map((e) => (
        <span key={e.id}>
          <ReactionParticles x={e.x} bottom={e.bottom} intensity={1 + comboIntensity * 0.5} />
          <Shockwave x={e.x} bottom={e.bottom} color={e.color} />
        </span>
      ))}

      {/* Floating reactions */}
      <AnimatePresence>
        {floating.map((f) => (
          <FloatingEmoji key={f.id} emoji={f.emoji} sender={f.sender} x={f.x} onDone={() => removeFloating(f.id)} />
        ))}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-24 right-4 z-[65] flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
        whileTap={{ scale: 0.9 }}
        animate={cooldown ? { opacity: 0.5 } : { opacity: 1 }}
      >
        <span className="text-xl">😊</span>
      </motion.button>

      {/* Reaction grid */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-[8.5rem] right-4 z-[65] grid gap-1.5 rounded-2xl bg-card p-3 shadow-xl border border-border ${allReactions.length > 8 ? "grid-cols-4 max-h-[280px] overflow-y-auto scrollbar-hide" : "grid-cols-4"}`}
          >
            {allReactions.map((r) => (
              <motion.button
                key={r.id}
                whileTap={{ scale: 0.8 }}
                whileHover={{ scale: 1.15 }}
                onClick={() => handleReaction(r)}
                className="flex flex-col items-center gap-0.5 rounded-xl p-2 hover:bg-accent/50 transition-colors"
              >
                <span className="text-2xl">{r.emoji}</span>
                <span className="text-[9px] font-medium text-muted-foreground leading-tight">{r.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ReactionsPanel;
