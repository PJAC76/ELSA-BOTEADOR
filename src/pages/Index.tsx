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
import LobbyScreen from "@/components/lobby/LobbyScreen";
import RoleRevealScreen from "@/components/lobby/RoleRevealScreen";
import ProfileScreen from "@/components/profile/ProfileScreen";
import SettingsScreen from "@/components/settings/SettingsScreen";
import type { AvatarConfig, Language, RoomMode, PlayerRole } from "@/types/game";

const DEFAULT_AVATAR: AvatarConfig = { skinTone: 0, hairStyle: 0, hairColor: 0, outfit: 0, accessory: 0 };

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
  | "friends"
  | "lobby"
  | "role-reveal"
  | "profile"
  | "settings";

const Index = () => {
  const [step, setStep] = useState<Step>("splash");
  const [displayName, setDisplayName] = useState("Agente");
  const [roomCode, setRoomCode] = useState("");
  const [roomMode, setRoomMode] = useState<RoomMode>("friends");
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [roomLanguage, setRoomLanguage] = useState<Language>("es");
  const [isHost, setIsHost] = useState(false);
  const [myRole, setMyRole] = useState<PlayerRole>("agent");

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

  const goToLobby = useCallback(
    (code: string, mode: RoomMode, host: boolean) => {
      setRoomCode(code);
      setRoomMode(mode);
      setIsHost(host);
      setStep("lobby");
    },
    []
  );

  const handleStartGame = useCallback(() => {
    // Mock: randomly assign role
    setMyRole(Math.random() < 0.75 ? "agent" : "saboteur");
    setStep("role-reveal");
  }, []);

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
          onProfile={() => setStep("profile")}
          onSettings={() => setStep("settings")}
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
          onRoomReady={(code) => goToLobby(code, "friends", true)}
        />
      );
    case "join-room":
      return (
        <JoinRoomScreen
          onBack={() => setStep("play-friends")}
          onJoin={(code) => goToLobby(code || "JOINED", "friends", false)}
        />
      );
    case "quick-play":
      return (
        <QuickPlayScreen
          onBack={() => setStep("home")}
          onMatchFound={(code) => goToLobby(code, "quick", false)}
        />
      );
    case "friends":
      return <FriendsScreen onBack={() => setStep("home")} />;
    case "profile":
      return <ProfileScreen displayName={displayName} avatarConfig={avatarConfig} onBack={() => setStep("home")} onAvatarSave={setAvatarConfig} />;
    case "settings":
      return <SettingsScreen onBack={() => setStep("home")} />;
    case "lobby":
      return (
        <LobbyScreen
          roomCode={roomCode}
          mode={roomMode}
          language={roomLanguage}
          isHost={isHost}
          onBack={() => setStep("home")}
          onStart={handleStartGame}
        />
      );
    case "role-reveal":
      return (
        <RoleRevealScreen
          role={myRole}
          onComplete={() => {
            /* Fase 4: partida */
            setStep("home");
          }}
        />
      );
    default:
      return null;
  }
};

export default Index;
