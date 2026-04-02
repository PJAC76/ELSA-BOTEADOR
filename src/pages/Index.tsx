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
import GameScreen from "@/components/game/GameScreen";
import GameResultScreen from "@/components/game/GameResultScreen";
import type { GameStats } from "@/components/game/GameScreen";
import InventoryScreen from "@/components/inventory/InventoryScreen";
import HowToPlayScreen from "@/components/help/HowToPlayScreen";
import LeaderboardScreen from "@/components/leaderboard/LeaderboardScreen";
import AchievementsScreen from "@/components/achievements/AchievementsScreen";
import ShopScreen from "@/components/shop/ShopScreen";
import SquadLeagueScreen from "@/components/league/SquadLeagueScreen";
import type { AvatarConfig, Language, RoomMode, PlayerRole } from "@/types/game";
import { useProgressionStore, getLevelForXp, getXpForCurrentLevel } from "@/stores/progression-store";

const DEFAULT_AVATAR: AvatarConfig = { skinTone: 0, hairStyle: 0, hairColor: 0, outfit: 0, accessory: 0, makeup: 0, piercing: 0, nails: 0, eyeStyle: 0, shoes: 0 };

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
  | "settings"
  | "inventory"
  | "game"
  | "game-result"
  | "how-to-play"
  | "leaderboard"
  | "achievements"
  | "shop"
  | "squad-league";

const Index = () => {
  const { totalXp } = useProgressionStore();
  const [step, setStep] = useState<Step>("splash");
  const [displayName, setDisplayName] = useState("Agente");
  const [roomCode, setRoomCode] = useState("");
  const [roomMode, setRoomMode] = useState<RoomMode>("friends");
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [roomLanguage, setRoomLanguage] = useState<Language>("es");
  const [isHost, setIsHost] = useState(false);
  const [myRole, setMyRole] = useState<PlayerRole>("agent");
  const [gameResult, setGameResult] = useState<"agents-win" | "saboteur-wins">("agents-win");
  const [wordGuessers, setWordGuessers] = useState<{ playerName: string; playerEmoji: string }[]>([]);
  const [secretWords, setSecretWords] = useState<{ round: number; word: string; category: string }[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({ tasksCompleted: 0, zonesVisited: 0, cluesGiven: 0 });

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

  const handleStartGame = useCallback((chosenRole: PlayerRole) => {
    setMyRole(chosenRole);
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
          level={getLevelForXp(totalXp)}
          xp={getXpForCurrentLevel(totalXp).progress}
          onPlayFriends={() => setStep("play-friends")}
          onQuickPlay={() => setStep("quick-play")}
          onFriends={() => setStep("friends")}
          onInventory={() => setStep("inventory")}
          onProfile={() => setStep("profile")}
          onSettings={() => setStep("settings")}
          onHowToPlay={() => setStep("how-to-play")}
          onLeaderboard={() => setStep("leaderboard")}
          onAchievements={() => setStep("achievements")}
          onShop={() => setStep("shop")}
          onSquadLeague={() => setStep("squad-league")}
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
          onMatchFound={(code) => goToLobby(code, "quick", true)}
        />
      );
    case "friends":
      return <FriendsScreen onBack={() => setStep("home")} />;
    case "profile":
      return (
        <ProfileScreen
          displayName={displayName}
          avatarConfig={avatarConfig}
          level={getLevelForXp(totalXp)}
          xp={getXpForCurrentLevel(totalXp).progress}
          totalXp={totalXp}
          gamesPlayed={useProgressionStore.getState().gamesPlayed}
          gamesWon={useProgressionStore.getState().gamesWon}
          onBack={() => setStep("home")}
          onAvatarSave={setAvatarConfig}
          onAchievements={() => setStep("achievements")}
        />
      );
    case "settings":
      return <SettingsScreen onBack={() => setStep("home")} />;
    case "inventory":
      return (
        <InventoryScreen
          avatarConfig={avatarConfig}
          onBack={() => setStep("home")}
          onAvatarSave={setAvatarConfig}
        />
      );
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
          onComplete={() => setStep("game")}
        />
      );
    case "game":
      return (
        <GameScreen
          role={myRole}
          onGameEnd={(result, guessers, words, stats) => {
            setGameResult(result);
            setWordGuessers(guessers);
            setSecretWords(words);
            setGameStats(stats);
            setStep("game-result");
          }}
        />
      );
    case "game-result":
      return (
        <GameResultScreen
          result={gameResult}
          myRole={myRole}
          wordGuessers={wordGuessers}
          secretWords={secretWords}
          gameStats={gameStats}
          onBackToHome={() => setStep("home")}
        />
      );
    case "how-to-play":
      return <HowToPlayScreen onBack={() => setStep("home")} />;
    case "leaderboard":
      return <LeaderboardScreen onBack={() => setStep("home")} />;
    case "achievements":
      return <AchievementsScreen onBack={() => setStep("home")} />;
    case "shop":
      return <ShopScreen onBack={() => setStep("home")} />;
    default:
      return null;
  }
};

export default Index;
