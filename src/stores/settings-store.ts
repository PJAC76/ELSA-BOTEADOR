import { create } from "zustand";
import { persist } from "zustand/middleware";

export type HandPreference = "right" | "left";

type SettingsStore = {
  language: "es" | "en";
  highContrast: boolean;
  largeText: boolean;
  soundEnabled: boolean;
  handPreference: HandPreference;
  privateProfile: boolean;
  friendRequests: boolean;
  setLanguage: (lang: "es" | "en") => void;
  setHighContrast: (v: boolean) => void;
  setLargeText: (v: boolean) => void;
  setSoundEnabled: (v: boolean) => void;
  setHandPreference: (v: HandPreference) => void;
  setPrivateProfile: (v: boolean) => void;
  setFriendRequests: (v: boolean) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      language: "es",
      highContrast: false,
      largeText: false,
      soundEnabled: true,
      handPreference: "right",
      privateProfile: false,
      friendRequests: true,
      setLanguage: (language) => set({ language }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setLargeText: (largeText) => set({ largeText }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setHandPreference: (handPreference) => set({ handPreference }),
      setPrivateProfile: (privateProfile) => set({ privateProfile }),
      setFriendRequests: (friendRequests) => set({ friendRequests }),
    }),
    { name: "elsa-boteador-settings" }
  )
);
