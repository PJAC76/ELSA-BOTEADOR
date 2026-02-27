import { useState, useCallback } from "react";
import SplashScreen from "@/components/onboarding/SplashScreen";
import LoginScreen from "@/components/onboarding/LoginScreen";
import AgeGateScreen from "@/components/onboarding/AgeGateScreen";
import CreateProfileScreen from "@/components/onboarding/CreateProfileScreen";
import HomeScreen from "@/components/home/HomeScreen";
import type { AvatarConfig, Language } from "@/types/game";

type Step = "splash" | "login" | "age-gate" | "create-profile" | "home";

const Index = () => {
  const [step, setStep] = useState<Step>("splash");
  const [displayName, setDisplayName] = useState("Agente");

  const handleSplashComplete = useCallback(() => setStep("login"), []);
  const handleLogin = useCallback(() => setStep("age-gate"), []);
  const handleAgeVerified = useCallback(() => setStep("create-profile"), []);
  const handleProfileComplete = useCallback(
    (data: { displayName: string; avatarConfig: AvatarConfig; language: Language }) => {
      setDisplayName(data.displayName);
      setStep("home");
    },
    []
  );

  switch (step) {
    case "splash":
      return <SplashScreen onComplete={handleSplashComplete} />;
    case "login":
      return <LoginScreen onLogin={handleLogin} />;
    case "age-gate":
      return <AgeGateScreen onVerified={handleAgeVerified} />;
    case "create-profile":
      return <CreateProfileScreen onComplete={handleProfileComplete} />;
    case "home":
      return (
        <HomeScreen
          displayName={displayName}
          onPlayFriends={() => {}}
          onQuickPlay={() => {}}
        />
      );
    default:
      return null;
  }
};

export default Index;
