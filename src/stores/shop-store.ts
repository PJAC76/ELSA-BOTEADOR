import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ShopItemCategory = "emojis" | "frames" | "effects" | "emotes";

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

  // Emotes de reacción
  { id: "emote-skull", emoji: "💀", nameKey: "shop-skull-emote", descKey: "shop-skull-emote-desc", category: "emotes", price: 40 },
  { id: "emote-nails", emoji: "💅", nameKey: "shop-nails-emote", descKey: "shop-nails-emote-desc", category: "emotes", price: 40 },
  { id: "emote-clown", emoji: "🤡", nameKey: "shop-clown-emote", descKey: "shop-clown-emote-desc", category: "emotes", price: 50 },
  { id: "emote-devil", emoji: "😈", nameKey: "shop-devil-emote", descKey: "shop-devil-emote-desc", category: "emotes", price: 60 },
  { id: "emote-cry", emoji: "😭", nameKey: "shop-cry-emote", descKey: "shop-cry-emote-desc", category: "emotes", price: 35 },
  { id: "emote-fire", emoji: "🔥", nameKey: "shop-fire-emote", descKey: "shop-fire-emote-desc", category: "emotes", price: 45 },
  { id: "emote-eyes", emoji: "👀", nameKey: "shop-eyes-emote", descKey: "shop-eyes-emote-desc", category: "emotes", price: 30 },
  { id: "emote-crown", emoji: "👑", nameKey: "shop-crown-emote", descKey: "shop-crown-emote-desc", category: "emotes", price: 80 },
  { id: "emote-butterfly", emoji: "🦋", nameKey: "shop-butterfly-emote", descKey: "shop-butterfly-emote-desc", category: "emotes", price: 55 },
  { id: "emote-star", emoji: "🌟", nameKey: "shop-star-emote", descKey: "shop-star-emote-desc", category: "emotes", price: 50 },
];

type ShopStore = {
  purchasedItems: string[];
  equippedFrame: string | null;
  equippedEffect: string | null;
  equippedEmotes: string[];
  purchaseItem: (itemId: string, cost: number, deductXp: (amount: number) => void) => boolean;
  equipFrame: (itemId: string | null) => void;
  equipEffect: (itemId: string | null) => void;
  toggleEmote: (itemId: string) => void;
  isOwned: (itemId: string) => boolean;
};

export const useShopStore = create<ShopStore>()(
  persist(
    (set, get) => ({
      purchasedItems: [],
      equippedFrame: null,
      equippedEffect: null,
      equippedEmotes: [],
      purchaseItem: (itemId, cost, deductXp) => {
        if (get().purchasedItems.includes(itemId)) return false;
        deductXp(cost);
        set((s) => ({ purchasedItems: [...s.purchasedItems, itemId] }));
        return true;
      },
      equipFrame: (itemId) => set({ equippedFrame: itemId }),
      equipEffect: (itemId) => set({ equippedEffect: itemId }),
      toggleEmote: (itemId) => set((s) => ({
        equippedEmotes: s.equippedEmotes.includes(itemId)
          ? s.equippedEmotes.filter((id) => id !== itemId)
          : s.equippedEmotes.length < 4
            ? [...s.equippedEmotes, itemId]
            : s.equippedEmotes
      })),
      isOwned: (itemId) => get().purchasedItems.includes(itemId),
    }),
    { name: "elsa-boteador-shop" }
  )
);
