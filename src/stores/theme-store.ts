import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeId = "campus" | "y2k" | "cottagecore" | "dark-academia" | "barbie";

export type ThemeDefinition = {
  id: ThemeId;
  emoji: string;
  nameKey: string;
  descKey: string;
  price: number; // 0 = free/default
  preview: string; // CSS class for preview swatch
};

export const THEMES: ThemeDefinition[] = [
  { id: "campus", emoji: "🎀", nameKey: "theme-campus", descKey: "theme-campus-desc", price: 0, preview: "from-pink-400 to-purple-400" },
  { id: "y2k", emoji: "💿", nameKey: "theme-y2k", descKey: "theme-y2k-desc", price: 150, preview: "from-fuchsia-500 to-cyan-400" },
  { id: "cottagecore", emoji: "🌿", nameKey: "theme-cottagecore", descKey: "theme-cottagecore-desc", price: 150, preview: "from-green-400 to-amber-300" },
  { id: "dark-academia", emoji: "📚", nameKey: "theme-dark-academia", descKey: "theme-dark-academia-desc", price: 200, preview: "from-amber-800 to-stone-600" },
  { id: "barbie", emoji: "💖", nameKey: "theme-barbie", descKey: "theme-barbie-desc", price: 175, preview: "from-pink-400 to-rose-300" },
];

type ThemeStore = {
  activeTheme: ThemeId;
  unlockedThemes: ThemeId[];
  setActiveTheme: (id: ThemeId) => void;
  unlockTheme: (id: ThemeId) => void;
  isUnlocked: (id: ThemeId) => boolean;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      activeTheme: "campus",
      unlockedThemes: ["campus"],
      setActiveTheme: (id) => set({ activeTheme: id }),
      unlockTheme: (id) =>
        set((s) => ({
          unlockedThemes: s.unlockedThemes.includes(id)
            ? s.unlockedThemes
            : [...s.unlockedThemes, id],
        })),
      isUnlocked: (id) => get().unlockedThemes.includes(id),
    }),
    { name: "elsa-boteador-theme" }
  )
);
