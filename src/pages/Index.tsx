import { useState, useCallback } from "react";
import SplashScreen from "@/components/onboarding/SplashScreen";
import LoginScreen from "@/components/onboarding/LoginScreen";
import AgeGateScreen from "@/components/onboarding/AgeGateScreen";
import CreateProfileScreen from "@/components/onboarding/CreateProfileScreen";
import HomeScreen from "@/components/home/HomeScreen";
import PlayFriendsScreen from "@/components/social/PlayFriendsScreen";
import CreateRoomScreen from "@/components/social/CreateRoomScreen";
import JoinRoomScreen from "@/components/social/JoinRoomScreen";
import QuickPlayScreen from "@/components/social/QuickPlayScreen";
import FriendsScreen from "@/components/social/FriendsScreen";
import type { AvatarConfig, Language } from "@/types/game";

type Step =
  | "splash"
  | "login"
  | "age-gate"
  | "create-profile"
  | "home"
  | "play-friends"
  | "create-room"
  | "join-room"
  | "quick-play"
  | "friends";

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
          onPlayFriends={() => setStep("play-friends")}
          onQuickPlay={() => setStep("quick-play")}
          onFriends={() => setStep("friends")}
        />
      );
    case "play-friends":
      return (
        <PlayFriendsScreen
          onBack={() => setStep("home")}
          onCreateRoom={() => setStep("create-room")}
          onJoinRoom={() => setStep("join-room")}
        />
      );
    case "create-room":
      return (
        <CreateRoomScreen
          onBack={() => setStep("play-friends")}
          onRoomReady={() => {/* lobby – fase 3 */}}
        />
      );
    case "join-room":
      return (
        <JoinRoomScreen
          onBack={() => setStep("play-friends")}
          onJoin={() => {/* lobby – fase 3 */}}
        />
      );
    case "quick-play":
      return (
        <QuickPlayScreen
          onBack={() => setStep("home")}
          onMatchFound={() => {/* lobby – fase 3 */}}
        />
      );
    case "friends":
      return <FriendsScreen onBack={() => setStep("home")} />;
    default:
      return null;
  }
};

export default Index;
