import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag, Sparkles, Check, Star } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useProgressionStore } from "@/stores/progression-store";
import { useShopStore, SHOP_ITEMS, type ShopItemCategory } from "@/stores/shop-store";
import { playTap, playPurchase, playEquip } from "@/lib/sounds";
import { useToast } from "@/hooks/use-toast";

type ShopScreenProps = { onBack: () => void };

const FRAME_STYLES: Record<string, string> = {
  "frame-gold": "ring-4 ring-campus-yellow shadow-[0_0_16px_hsl(var(--campus-yellow)/0.5)]",
  "frame-rainbow": "ring-4 ring-primary shadow-[0_0_16px_hsl(var(--primary)/0.4)]",
  "frame-fire": "ring-4 ring-destructive shadow-[0_0_16px_hsl(var(--destructive)/0.4)]",
  "frame-diamond": "ring-4 ring-campus-sky shadow-[0_0_16px_hsl(var(--campus-sky)/0.5)]",
  "frame-stars": "ring-4 ring-campus-peach shadow-[0_0_16px_hsl(var(--campus-peach)/0.4)]",
};

const ShopScreen = ({ onBack }: ShopScreenProps) => {
  const { t } = useTranslation();
  const { totalXp, addXp } = useProgressionStore();
  const { purchasedItems, equippedFrame, equippedEffect, equippedEmotes, purchaseItem, equipFrame, equipEffect, toggleEmote, isOwned } = useShopStore();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<ShopItemCategory>("emojis");

  const CATEGORIES: { key: ShopItemCategory; label: string; emoji: string }[] = [
    { key: "emojis", label: t("shopEmojis" as any), emoji: "😎" },
    { key: "emotes", label: t("shopEmotes" as any), emoji: "💬" },
    { key: "frames", label: t("shopFrames" as any), emoji: "🖼️" },
    { key: "effects", label: t("shopEffects" as any), emoji: "🎆" },
  ];

  const categoryItems = SHOP_ITEMS.filter((i) => i.category === selectedCategory);

  const handleBuy = (item: typeof SHOP_ITEMS[0]) => {
    if (isOwned(item.id)) {
      // Equip/unequip
      if (item.category === "frames") {
        equipFrame(equippedFrame === item.id ? null : item.id);
        playEquip();
      } else if (item.category === "effects") {
        equipEffect(equippedEffect === item.id ? null : item.id);
        playEquip();
      } else if (item.category === "emotes") {
        toggleEmote(item.id);
        playEquip();
      }
      return;
    }
    if (totalXp < item.price) {
      toast({ title: t("shopNotEnoughXp" as any), description: t("shopNeedMore" as any, { xp: String(item.price - totalXp) }), variant: "destructive" });
      return;
    }
    playPurchase();
    const deductXp = (cost: number) => addXp(-cost);
    purchaseItem(item.id, item.price, deductXp);
    toast({ title: `${item.emoji} ${t("shopPurchased" as any)}`, description: t("shopPurchasedDesc" as any, { name: t(item.nameKey as any) }), variant: "achievement" as any });
    // Auto-equip
    if (item.category === "frames") equipFrame(item.id);
    if (item.category === "effects") equipEffect(item.id);
    if (item.category === "emotes") toggleEmote(item.id);
  };

  const isEquipped = (item: typeof SHOP_ITEMS[0]) => {
    if (item.category === "frames") return equippedFrame === item.id;
    if (item.category === "effects") return equippedEffect === item.id;
    if (item.category === "emotes") return equippedEmotes.includes(item.id);
    return false;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="gradient-warm px-4 pb-5 pt-4 safe-top">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-foreground/20">
            <ArrowLeft className="h-5 w-5 text-primary-foreground" />
          </button>
          <h1 className="font-display text-lg font-black text-primary-foreground">
            <ShoppingBag className="inline h-5 w-5 mr-1 -mt-0.5" />
            {t("shopTitle" as any)}
          </h1>
          <div className="flex items-center gap-1 rounded-full bg-primary-foreground/20 px-3 py-1">
            <Star className="h-3 w-3 text-campus-yellow fill-campus-yellow" />
            <span className="font-display text-xs font-bold text-primary-foreground">{totalXp} XP</span>
          </div>
        </div>
      </motion.div>

      {/* Category tabs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => { setSelectedCategory(cat.key); playTap(); }}
            className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-4 py-2.5 font-display text-xs font-bold transition-all ${
              selectedCategory === cat.key
                ? "gradient-warm text-primary-foreground shadow-soft"
                : "bg-card text-muted-foreground shadow-soft"
            }`}
          >
            <span className="text-sm">{cat.emoji}</span>{cat.label}
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
            className="grid grid-cols-2 gap-3"
          >
            {categoryItems.map((item, idx) => {
              const owned = isOwned(item.id);
              const equipped = isEquipped(item);
              const canAfford = totalXp >= item.price;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl p-4 transition-all ${
                    equipped
                      ? "bg-primary/15 ring-2 ring-primary shadow-soft"
                      : owned
                      ? "bg-card shadow-soft"
                      : canAfford
                      ? "bg-card shadow-soft hover:shadow-card"
                      : "bg-muted/60 opacity-60"
                  }`}
                >
                  {/* Item preview */}
                  <div className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 ${
                    item.category === "frames" && owned ? FRAME_STYLES[item.id] || "" : ""
                  }`}>
                    <span className="text-3xl">{item.emoji}</span>
                    {equipped && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary"
                      >
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </motion.div>
                    )}
                  </div>

                  <div className="text-center">
                    <span className="font-display text-xs font-bold text-foreground">{t(item.nameKey as any)}</span>
                    <p className="font-body text-[10px] text-muted-foreground mt-0.5">{t(item.descKey as any)}</p>
                  </div>

                  {/* Buy / Equip button */}
                  <Button
                    size="sm"
                    onClick={() => handleBuy(item)}
                    disabled={!owned && !canAfford}
                    className={`w-full rounded-xl font-display text-[11px] font-bold h-8 ${
                      owned
                        ? equipped
                          ? "bg-primary/20 text-primary hover:bg-primary/30"
                          : "bg-muted text-foreground hover:bg-muted/80"
                        : canAfford
                        ? "gradient-warm text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {owned ? (
                      equipped ? (
                        <><Check className="h-3 w-3 mr-1" />{t("shopEquipped" as any)}</>
                      ) : (
                        item.category === "emojis" ? (
                          <><Check className="h-3 w-3 mr-1" />{t("shopOwned" as any)}</>
                        ) : (
                          t("shopEquip" as any)
                        )
                      )
                    ) : (
                      <><Sparkles className="h-3 w-3 mr-1" />{item.price} XP</>
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Owned count footer */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border px-6 py-3 safe-bottom"
      >
        <div className="flex items-center justify-between">
          <span className="font-body text-xs text-muted-foreground">
            {t("shopOwnedCount" as any, { count: String(purchasedItems.length), total: String(SHOP_ITEMS.length) })}
          </span>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-campus-yellow fill-campus-yellow" />
            <span className="font-display text-sm font-bold text-foreground">{totalXp} XP</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ShopScreen;
