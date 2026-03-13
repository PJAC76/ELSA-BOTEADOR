import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Lock, Sparkles, BookOpen } from "lucide-react";
import type { AvatarConfig } from "@/types/game";
import { getAvatarEmoji } from "@/components/shared/AvatarCustomizer";
import { useProgressionStore, getLevelForXp } from "@/stores/progression-store";
import { playTap } from "@/lib/sounds";
import { useTranslation } from "@/lib/i18n";
import { getWordStats } from "@/data/secret-words";

type InventoryCategory = "hair" | "clothes" | "accessories" | "stickers" | "words";
type InventoryItem = { id: string; emoji: string; nameKey: string; category: InventoryCategory; avatarKey?: keyof AvatarConfig; avatarValue?: number; unlockLevel: number };

const INVENTORY_ITEMS: InventoryItem[] = [
  { id: "hair-0", emoji: "💇‍♀️", nameKey: "item-straight", category: "hair", avatarKey: "hairStyle", avatarValue: 0, unlockLevel: 0 },
  { id: "hair-1", emoji: "👩‍🦱", nameKey: "item-curly", category: "hair", avatarKey: "hairStyle", avatarValue: 1, unlockLevel: 0 },
  { id: "hair-2", emoji: "👩‍🦰", nameKey: "item-redhead", category: "hair", avatarKey: "hairStyle", avatarValue: 2, unlockLevel: 2 },
  { id: "hair-3", emoji: "👩‍🦳", nameKey: "item-platinum", category: "hair", avatarKey: "hairStyle", avatarValue: 3, unlockLevel: 4 },
  { id: "hair-4", emoji: "👩", nameKey: "item-classic", category: "hair", avatarKey: "hairStyle", avatarValue: 4, unlockLevel: 0 },
  { id: "hcolor-0", emoji: "🖤", nameKey: "item-black", category: "hair", avatarKey: "hairColor", avatarValue: 0, unlockLevel: 0 },
  { id: "hcolor-1", emoji: "🤎", nameKey: "item-brown", category: "hair", avatarKey: "hairColor", avatarValue: 1, unlockLevel: 0 },
  { id: "hcolor-2", emoji: "🧡", nameKey: "item-orange", category: "hair", avatarKey: "hairColor", avatarValue: 2, unlockLevel: 3 },
  { id: "hcolor-3", emoji: "💛", nameKey: "item-blonde", category: "hair", avatarKey: "hairColor", avatarValue: 3, unlockLevel: 5 },
  { id: "hcolor-4", emoji: "🩷", nameKey: "item-pink", category: "hair", avatarKey: "hairColor", avatarValue: 4, unlockLevel: 7 },
  { id: "outfit-0", emoji: "👕", nameKey: "item-tshirt", category: "clothes", avatarKey: "outfit", avatarValue: 0, unlockLevel: 0 },
  { id: "outfit-1", emoji: "👗", nameKey: "item-dress", category: "clothes", avatarKey: "outfit", avatarValue: 1, unlockLevel: 0 },
  { id: "outfit-2", emoji: "🧥", nameKey: "item-coat", category: "clothes", avatarKey: "outfit", avatarValue: 2, unlockLevel: 2 },
  { id: "outfit-3", emoji: "👚", nameKey: "item-blouse", category: "clothes", avatarKey: "outfit", avatarValue: 3, unlockLevel: 4 },
  { id: "outfit-4", emoji: "🎽", nameKey: "item-sporty", category: "clothes", avatarKey: "outfit", avatarValue: 4, unlockLevel: 6 },
  { id: "acc-0", emoji: "🎀", nameKey: "item-bow", category: "accessories", avatarKey: "accessory", avatarValue: 0, unlockLevel: 0 },
  { id: "acc-1", emoji: "🕶️", nameKey: "item-glasses", category: "accessories", avatarKey: "accessory", avatarValue: 1, unlockLevel: 0 },
  { id: "acc-2", emoji: "🎒", nameKey: "item-backpack", category: "accessories", avatarKey: "accessory", avatarValue: 2, unlockLevel: 3 },
  { id: "acc-3", emoji: "💍", nameKey: "item-ring", category: "accessories", avatarKey: "accessory", avatarValue: 3, unlockLevel: 5 },
  { id: "acc-4", emoji: "🧢", nameKey: "item-cap", category: "accessories", avatarKey: "accessory", avatarValue: 4, unlockLevel: 8 },
  { id: "stk-0", emoji: "⭐", nameKey: "item-star", category: "stickers", unlockLevel: 0 },
  { id: "stk-1", emoji: "🌈", nameKey: "item-rainbow", category: "stickers", unlockLevel: 2 },
  { id: "stk-2", emoji: "🦋", nameKey: "item-butterfly", category: "stickers", unlockLevel: 3 },
  { id: "stk-3", emoji: "🔥", nameKey: "item-fire", category: "stickers", unlockLevel: 5 },
  { id: "stk-4", emoji: "💎", nameKey: "item-diamond", category: "stickers", unlockLevel: 7 },
  { id: "stk-5", emoji: "👑", nameKey: "item-crown", category: "stickers", unlockLevel: 10 },
];

type InventoryScreenProps = { avatarConfig: AvatarConfig; onBack: () => void; onAvatarSave: (config: AvatarConfig) => void };

const InventoryScreen = ({ avatarConfig, onBack, onAvatarSave }: InventoryScreenProps) => {
  const { totalXp } = useProgressionStore();
  const level = getLevelForXp(totalXp);
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory>("hair");
  const [previewConfig, setPreviewConfig] = useState<AvatarConfig>({ ...avatarConfig });
  const [hasChanges, setHasChanges] = useState(false);
  const [equippedStickers, setEquippedStickers] = useState<string[]>([]);

  const CATEGORIES: { key: InventoryCategory; label: string; emoji: string }[] = [
    { key: "hair", label: t("hairCategory"), emoji: "💇‍♀️" },
    { key: "clothes", label: t("clothesCategory"), emoji: "👗" },
    { key: "accessories", label: t("accsCategory"), emoji: "🎀" },
    { key: "stickers", label: t("stickersCategory"), emoji: "✨" },
    { key: "words", label: t("wordsCategory" as any), emoji: "📖" },
  ];

  const categoryItems = INVENTORY_ITEMS.filter((i) => i.category === selectedCategory);
  const unlockedCount = INVENTORY_ITEMS.filter((i) => i.unlockLevel <= level).length;
  const wordStats = useMemo(() => getWordStats(), [selectedCategory]);

  const handleEquipItem = (item: InventoryItem) => {
    if (item.unlockLevel > level) return; playTap();
    if (item.category === "stickers") { setEquippedStickers((prev) => prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]); return; }
    if (item.avatarKey !== undefined && item.avatarValue !== undefined) { setPreviewConfig({ ...previewConfig, [item.avatarKey]: item.avatarValue }); setHasChanges(true); }
  };

  const isItemEquipped = (item: InventoryItem) => {
    if (item.category === "stickers") return equippedStickers.includes(item.id);
    if (item.avatarKey) return previewConfig[item.avatarKey] === item.avatarValue;
    return false;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="gradient-fun px-4 pb-5 pt-4 safe-top">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-foreground/20"><ArrowLeft className="h-5 w-5 text-primary-foreground" /></button>
          <h1 className="font-display text-lg font-black text-primary-foreground">{t("inventoryTitle")}</h1>
          <div className="flex items-center gap-1 rounded-full bg-primary-foreground/20 px-3 py-1"><Sparkles className="h-3 w-3 text-primary-foreground" /><span className="font-display text-xs font-bold text-primary-foreground">{unlockedCount}/{INVENTORY_ITEMS.length}</span></div>
        </div>
      </motion.div>

      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 200 }} className="flex flex-col items-center -mt-6 relative z-10">
        <div className="relative">
          <div className="flex h-28 w-28 items-center justify-center rounded-full gradient-primary shadow-glow"><span className="text-6xl">{getAvatarEmoji(previewConfig)}</span></div>
          {equippedStickers.slice(0, 3).map((stickerId, i) => {
            const sticker = INVENTORY_ITEMS.find((s) => s.id === stickerId); if (!sticker) return null;
            const angle = (i * 120 - 90) * (Math.PI / 180); const x = Math.cos(angle) * 52; const y = Math.sin(angle) * 52;
            return <motion.span key={stickerId} initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute text-lg" style={{ left: `calc(50% + ${x}px - 10px)`, top: `calc(50% + ${y}px - 10px)` }}>{sticker.emoji}</motion.span>;
          })}
        </div>
        <span className="mt-2 font-display text-xs font-bold text-muted-foreground">{t("level")} {level}</span>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button key={cat.key} onClick={() => { setSelectedCategory(cat.key); playTap(); }} className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-4 py-2.5 font-display text-xs font-bold transition-all ${selectedCategory === cat.key ? "gradient-primary text-primary-foreground shadow-soft" : "bg-card text-muted-foreground shadow-soft"}`}>
            <span className="text-sm">{cat.emoji}</span>{cat.label}
          </button>
        ))}
      </motion.div>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <AnimatePresence mode="wait">
        {selectedCategory === "words" ? (
          <motion.div key="words" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="flex flex-col gap-3">
            {wordStats.map((stat, idx) => {
              const pct = ((stat.total - stat.remaining) / stat.total) * 100;
              return (
                <motion.div key={stat.categoryEn} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} className="rounded-2xl bg-card p-4 shadow-soft">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-sm font-bold text-foreground">{language === "en" ? stat.categoryEn : stat.category}</span>
                    <span className="font-display text-xs font-bold text-muted-foreground">{stat.remaining}/{stat.total} {t("wordsRemaining" as any)}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: idx * 0.04 + 0.2, duration: 0.5, ease: "easeOut" }} className="h-full rounded-full bg-primary" style={{ background: pct >= 100 ? "hsl(var(--accent))" : undefined }} />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div key={selectedCategory} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="grid grid-cols-3 gap-3">
            {categoryItems.map((item, idx) => {
              const isUnlocked = item.unlockLevel <= level; const isEquipped = isItemEquipped(item);
              return (
                <motion.button key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} whileTap={isUnlocked ? { scale: 0.92 } : undefined} onClick={() => handleEquipItem(item)} disabled={!isUnlocked} className={`relative flex flex-col items-center gap-1.5 rounded-2xl p-4 transition-all ${isEquipped ? "bg-primary/15 ring-2 ring-primary shadow-soft" : isUnlocked ? "bg-card shadow-soft active:shadow-none" : "bg-muted/60 opacity-50"}`}>
                  <span className={`text-3xl ${!isUnlocked ? "grayscale" : ""}`}>{item.emoji}</span>
                  <span className="font-display text-[11px] font-bold text-foreground">{t(item.nameKey as any)}</span>
                  {isEquipped && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary"><Check className="h-3 w-3 text-primary-foreground" /></motion.div>}
                  {!isUnlocked && <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-background/60 backdrop-blur-[2px]"><Lock className="h-4 w-4 text-muted-foreground" /><span className="font-display text-[10px] font-bold text-muted-foreground mt-0.5">Nv. {item.unlockLevel}</span></div>}
                </motion.button>
              );
            })}
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {hasChanges && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="fixed bottom-0 left-0 right-0 px-6 pb-6 safe-bottom z-20">
            <Button onClick={() => { playTap(); onAvatarSave(previewConfig); setHasChanges(false); }} className="h-14 w-full rounded-2xl gradient-primary text-primary-foreground font-display text-base font-bold shadow-glow"><Check className="mr-2 h-5 w-5" />{t("saveChanges")}</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryScreen;
