import { create } from "zustand";
import type { AvatarConfig, Language } from "@/types/game";

type OnboardingStep = "splash" | "login" | "age-gate" | "create-profile" | "home";

type OnboardingStore = {
  step: OnboardingStep;
  isAuthenticated: boolean;
  ageVerified: boolean;
  profileCreated: boolean;
  setStep: (step: OnboardingStep) => void;
  setAuthenticated: (v: boolean) => void;
  setAgeVerified: (v: boolean) => void;
  setProfileCreated: (v: boolean) => void;

  // Profile draft
  displayName: string;
  avatarConfig: AvatarConfig;
  language: Language;
  setDisplayName: (n: string) => void;
  setAvatarConfig: (c: AvatarConfig) => void;
  setLanguage: (l: Language) => void;
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  step: "splash",
  isAuthenticated: false,
  ageVerified: false,
  profileCreated: false,
  setStep: (step) => set({ step }),
  setAuthenticated: (v) => set({ isAuthenticated: v }),
  setAgeVerified: (v) => set({ ageVerified: v }),
  setProfileCreated: (v) => set({ profileCreated: v }),

  displayName: "",
  avatarConfig: {
    skinTone: 0,
    hairStyle: 0,
    hairColor: 0,
    outfit: 0,
    accessory: 0,
  },
  language: "es",
  setDisplayName: (n) => set({ displayName: n }),
  setAvatarConfig: (c) => set({ avatarConfig: c }),
  setLanguage: (l) => set({ language: l }),
}));
