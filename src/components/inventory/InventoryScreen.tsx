import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Lock, Sparkles } from "lucide-react";
import type { AvatarConfig } from "@/types/game";
import { getAvatarEmoji, SKIN_TONES, HAIR_STYLES, HAIR_COLORS, OUTFITS, ACCESSORIES } from "@/components/shared/AvatarCustomizer";
import { useProgressionStore, getLevelForXp } from "@/stores/progression-store";
import { playTap } from "@/lib/sounds";

// --- Inventory item definitions ---

type InventoryCategory = "hair" | "clothes" | "accessories" | "stickers";

type InventoryItem = {
  id: string;
  emoji: string;
  name: string;
  category: InventoryCategory;
  avatarKey?: keyof AvatarConfig;
  avatarValue?: number;
  unlockLevel: number; // 0 = always unlocked
};

const CATEGORIES: { key: InventoryCategory; label: string; emoji: string }[] = [
  { key: "hair", label: "Pelo", emoji: "💇‍♀️" },
  { key: "clothes", label: "Ropa", emoji: "👗" },
  { key: "accessories", label: "Accs", emoji: "🎀" },
  { key: "stickers", label: "Stickers", emoji: "✨" },
];

const INVENTORY_ITEMS: InventoryItem[] = [
  // Hair styles
  { id: "hair-0", emoji: "💇‍♀️", name: "Liso", category: "hair", avatarKey: "hairStyle", avatarValue: 0, unlockLevel: 0 },
  { id: "hair-1", emoji: "👩‍🦱", name: "Rizado", category: "hair", avatarKey: "hairStyle", avatarValue: 1, unlockLevel: 0 },
  { id: "hair-2", emoji: "👩‍🦰", name: "Pelirroja", category: "hair", avatarKey: "hairStyle", avatarValue: 2, unlockLevel: 2 },
  { id: "hair-3", emoji: "👩‍🦳", name: "Platino", category: "hair", avatarKey: "hairStyle", avatarValue: 3, unlockLevel: 4 },
  { id: "hair-4", emoji: "👩", name: "Clásico", category: "hair", avatarKey: "hairStyle", avatarValue: 4, unlockLevel: 0 },
  // Hair colors
  { id: "hcolor-0", emoji: "🖤", name: "Negro", category: "hair", avatarKey: "hairColor", avatarValue: 0, unlockLevel: 0 },
  { id: "hcolor-1", emoji: "🤎", name: "Castaño", category: "hair", avatarKey: "hairColor", avatarValue: 1, unlockLevel: 0 },
  { id: "hcolor-2", emoji: "🧡", name: "Naranja", category: "hair", avatarKey: "hairColor", avatarValue: 2, unlockLevel: 3 },
  { id: "hcolor-3", emoji: "💛", name: "Rubio", category: "hair", avatarKey: "hairColor", avatarValue: 3, unlockLevel: 5 },
  { id: "hcolor-4", emoji: "🩷", name: "Rosa", category: "hair", avatarKey: "hairColor", avatarValue: 4, unlockLevel: 7 },

  // Clothes
  { id: "outfit-0", emoji: "👕", name: "Camiseta", category: "clothes", avatarKey: "outfit", avatarValue: 0, unlockLevel: 0 },
  { id: "outfit-1", emoji: "👗", name: "Vestido", category: "clothes", avatarKey: "outfit", avatarValue: 1, unlockLevel: 0 },
  { id: "outfit-2", emoji: "🧥", name: "Abrigo", category: "clothes", avatarKey: "outfit", avatarValue: 2, unlockLevel: 2 },
  { id: "outfit-3", emoji: "👚", name: "Blusa", category: "clothes", avatarKey: "outfit", avatarValue: 3, unlockLevel: 4 },
  { id: "outfit-4", emoji: "🎽", name: "Deportiva", category: "clothes", avatarKey: "outfit", avatarValue: 4, unlockLevel: 6 },

  // Accessories
  { id: "acc-0", emoji: "🎀", name: "Lazo", category: "accessories", avatarKey: "accessory", avatarValue: 0, unlockLevel: 0 },
  { id: "acc-1", emoji: "🕶️", name: "Gafas", category: "accessories", avatarKey: "accessory", avatarValue: 1, unlockLevel: 0 },
  { id: "acc-2", emoji: "🎒", name: "Mochila", category: "accessories", avatarKey: "accessory", avatarValue: 2, unlockLevel: 3 },
  { id: "acc-3", emoji: "💍", name: "Anillo", category: "accessories", avatarKey: "accessory", avatarValue: 3, unlockLevel: 5 },
  { id: "acc-4", emoji: "🧢", name: "Gorra", category: "accessories", avatarKey: "accessory", avatarValue: 4, unlockLevel: 8 },

  // Stickers (decorative, no avatar effect)
  { id: "stk-0", emoji: "⭐", name: "Estrella", category: "stickers", unlockLevel: 0 },
  { id: "stk-1", emoji: "🌈", name: "Arcoíris", category: "stickers", unlockLevel: 2 },
  { id: "stk-2", emoji: "🦋", name: "Mariposa", category: "stickers", unlockLevel: 3 },
  { id: "stk-3", emoji: "🔥", name: "Fuego", category: "stickers", unlockLevel: 5 },
  { id: "stk-4", emoji: "💎", name: "Diamante", category: "stickers", unlockLevel: 7 },
  { id: "stk-5", emoji: "👑", name: "Corona", category: "stickers", unlockLevel: 10 },
];

// --- Component ---

type InventoryScreenProps = {
  avatarConfig: AvatarConfig;
  onBack: () => void;
  onAvatarSave: (config: AvatarConfig) => void;
};

const InventoryScreen = ({ avatarConfig, onBack, onAvatarSave }: InventoryScreenProps) => {
  const { totalXp } = useProgressionStore();
  const level = getLevelForXp(totalXp);
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory>("hair");
  const [previewConfig, setPreviewConfig] = useState<AvatarConfig>({ ...avatarConfig });
  const [hasChanges, setHasChanges] = useState(false);
  const [equippedStickers, setEquippedStickers] = useState<string[]>([]);

  const categoryItems = INVENTORY_ITEMS.filter((i) => i.category === selectedCategory);
  const unlockedCount = INVENTORY_ITEMS.filter((i) => i.unlockLevel <= level).length;

  const handleEquipItem = (item: InventoryItem) => {
    if (item.unlockLevel > level) return;
    playTap();

    if (item.category === "stickers") {
      setEquippedStickers((prev) =>
        prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
      );
      return;
    }

    if (item.avatarKey !== undefined && item.avatarValue !== undefined) {
      const newConfig = { ...previewConfig, [item.avatarKey]: item.avatarValue };
      setPreviewConfig(newConfig);
      setHasChanges(true);
    }
  };

  const handleSave = () => {
    playTap();
    onAvatarSave(previewConfig);
    setHasChanges(false);
  };

  const isItemEquipped = (item: InventoryItem) => {
    if (item.category === "stickers") return equippedStickers.includes(item.id);
    if (item.avatarKey) return previewConfig[item.avatarKey] === item.avatarValue;
    return false;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="gradient-fun px-4 pb-5 pt-4 safe-top"
      >
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-foreground/20">
            <ArrowLeft className="h-5 w-5 text-primary-foreground" />
          </button>
          <h1 className="font-display text-lg font-black text-primary-foreground">
            Inventario
          </h1>
          <div className="flex items-center gap-1 rounded-full bg-primary-foreground/20 px-3 py-1">
            <Sparkles className="h-3 w-3 text-primary-foreground" />
            <span className="font-display text-xs font-bold text-primary-foreground">
              {unlockedCount}/{INVENTORY_ITEMS.length}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Avatar preview */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
        className="flex flex-col items-center -mt-6 relative z-10"
      >
        <div className="relative">
          <div className="flex h-28 w-28 items-center justify-center rounded-full gradient-primary shadow-glow">
            <span className="text-6xl">{getAvatarEmoji(previewConfig)}</span>
          </div>
          {/* Equipped stickers orbiting */}
          {equippedStickers.slice(0, 3).map((stickerId, i) => {
            const sticker = INVENTORY_ITEMS.find((s) => s.id === stickerId);
            if (!sticker) return null;
            const angle = (i * 120 - 90) * (Math.PI / 180);
            const x = Math.cos(angle) * 52;
            const y = Math.sin(angle) * 52;
            return (
              <motion.span
                key={stickerId}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute text-lg"
                style={{ left: `calc(50% + ${x}px - 10px)`, top: `calc(50% + ${y}px - 10px)` }}
              >
                {sticker.emoji}
              </motion.span>
            );
          })}
        </div>
        <span className="mt-2 font-display text-xs font-bold text-muted-foreground">
          Nivel {level}
        </span>
      </motion.div>

      {/* Category tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => { setSelectedCategory(cat.key); playTap(); }}
            className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-4 py-2.5 font-display text-xs font-bold transition-all ${
              selectedCategory === cat.key
                ? "gradient-primary text-primary-foreground shadow-soft"
                : "bg-card text-muted-foreground shadow-soft"
            }`}
          >
            <span className="text-sm">{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Items grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-3 gap-3"
          >
            {categoryItems.map((item, idx) => {
              const isUnlocked = item.unlockLevel <= level;
              const isEquipped = isItemEquipped(item);

              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileTap={isUnlocked ? { scale: 0.92 } : undefined}
                  onClick={() => handleEquipItem(item)}
                  disabled={!isUnlocked}
                  className={`relative flex flex-col items-center gap-1.5 rounded-2xl p-4 transition-all ${
                    isEquipped
                      ? "bg-primary/15 ring-2 ring-primary shadow-soft"
                      : isUnlocked
                      ? "bg-card shadow-soft active:shadow-none"
                      : "bg-muted/60 opacity-50"
                  }`}
                >
                  <span className={`text-3xl ${!isUnlocked ? "grayscale" : ""}`}>
                    {item.emoji}
                  </span>
                  <span className="font-display text-[11px] font-bold text-foreground">
                    {item.name}
                  </span>

                  {isEquipped && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary"
                    >
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </motion.div>
                  )}

                  {!isUnlocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-background/60 backdrop-blur-[2px]">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-display text-[10px] font-bold text-muted-foreground mt-0.5">
                        Nv. {item.unlockLevel}
                      </span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Save button */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 px-6 pb-6 safe-bottom z-20"
          >
            <Button
              onClick={handleSave}
              className="h-14 w-full rounded-2xl gradient-primary text-primary-foreground font-display text-base font-bold shadow-glow"
            >
              <Check className="mr-2 h-5 w-5" />
              Guardar cambios
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryScreen;
