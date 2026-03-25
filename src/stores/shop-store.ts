import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ShopItemCategory = "emojis" | "frames" | "effects";

export type ShopItem = {
  id: string;
  emoji: string;
  nameKey: string;
  descKey: string;
  category: ShopItemCategory;
  price: number;
};

export const SHOP_ITEMS: ShopItem[] = [
  // Emojis de chat
  { id: "emoji-cat", emoji: "🐱", nameKey: "shop-cat", descKey: "shop-cat-desc", category: "emojis", price: 30 },
  { id: "emoji-alien", emoji: "👽", nameKey: "shop-alien", descKey: "shop-alien-desc", category: "emojis", price: 50 },
  { id: "emoji-robot", emoji: "🤖", nameKey: "shop-robot", descKey: "shop-robot-desc", category: "emojis", price: 50 },
  { id: "emoji-unicorn", emoji: "🦄", nameKey: "shop-unicorn", descKey: "shop-unicorn-desc", category: "emojis", price: 75 },
  { id: "emoji-dragon", emoji: "🐉", nameKey: "shop-dragon", descKey: "shop-dragon-desc", category: "emojis", price: 100 },
  { id: "emoji-ghost", emoji: "👻", nameKey: "shop-ghost", descKey: "shop-ghost-desc", category: "emojis", price: 40 },

  // Marcos de avatar
  { id: "frame-gold", emoji: "🟡", nameKey: "shop-gold-frame", descKey: "shop-gold-frame-desc", category: "frames", price: 80 },
  { id: "frame-rainbow", emoji: "🌈", nameKey: "shop-rainbow-frame", descKey: "shop-rainbow-frame-desc", category: "frames", price: 120 },
  { id: "frame-fire", emoji: "🔥", nameKey: "shop-fire-frame", descKey: "shop-fire-frame-desc", category: "frames", price: 150 },
  { id: "frame-diamond", emoji: "💎", nameKey: "shop-diamond-frame", descKey: "shop-diamond-frame-desc", category: "frames", price: 200 },
  { id: "frame-stars", emoji: "✨", nameKey: "shop-stars-frame", descKey: "shop-stars-frame-desc", category: "frames", price: 100 },

  // Efectos de confetti
  { id: "fx-hearts", emoji: "💕", nameKey: "shop-hearts-fx", descKey: "shop-hearts-fx-desc", category: "effects", price: 60 },
  { id: "fx-stars", emoji: "⭐", nameKey: "shop-stars-fx", descKey: "shop-stars-fx-desc", category: "effects", price: 60 },
  { id: "fx-sparkle", emoji: "💫", nameKey: "shop-sparkle-fx", descKey: "shop-sparkle-fx-desc", category: "effects", price: 90 },
  { id: "fx-fireworks", emoji: "🎆", nameKey: "shop-fireworks-fx", descKey: "shop-fireworks-fx-desc", category: "effects", price: 130 },
  { id: "fx-confetti", emoji: "🎊", nameKey: "shop-confetti-fx", descKey: "shop-confetti-fx-desc", category: "effects", price: 100 },
];

type ShopStore = {
  purchasedItems: string[];
  equippedFrame: string | null;
  equippedEffect: string | null;
  purchaseItem: (itemId: string, cost: number, deductXp: (amount: number) => void) => boolean;
  equipFrame: (itemId: string | null) => void;
  equipEffect: (itemId: string | null) => void;
  isOwned: (itemId: string) => boolean;
};

export const useShopStore = create<ShopStore>()(
  persist(
    (set, get) => ({
      purchasedItems: [],
      equippedFrame: null,
      equippedEffect: null,
      purchaseItem: (itemId, cost, deductXp) => {
        if (get().purchasedItems.includes(itemId)) return false;
        deductXp(cost);
        set((s) => ({ purchasedItems: [...s.purchasedItems, itemId] }));
        return true;
      },
      equipFrame: (itemId) => set({ equippedFrame: itemId }),
      equipEffect: (itemId) => set({ equippedEffect: itemId }),
      isOwned: (itemId) => get().purchasedItems.includes(itemId),
    }),
    { name: "elsa-boteador-shop" }
  )
);
