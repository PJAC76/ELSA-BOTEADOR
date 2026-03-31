// Mock types for frontend-first development

export type Language = "es" | "en";

export type AvatarConfig = {
  skinTone: number;
  hairStyle: number;
  hairColor: number;
  outfit: number;
  accessory: number;
  makeup: number;
  piercing: number;
  nails: number;
  eyeStyle: number;
  shoes: number;
};

export type UserProfile = {
  id: string;
  displayName: string;
  avatarConfig: AvatarConfig;
  language: Language;
  level: number;
  xp: number;
  friendCode: string;
};

export type RoomMode = "friends" | "quick";
export type RoomStatus = "lobby" | "in_game" | "finished";
export type PlayerRole = "agent" | "saboteur";

export type Zone =
  | "library"
  | "cafeteria"
  | "auditorium"
  | "lab"
  | "gym"
  | "garden";

export const ZONE_INFO: Record<Zone, { name: string; emoji: string }> = {
  library: { name: "Biblioteca", emoji: "📚" },
  cafeteria: { name: "Cafetería", emoji: "☕" },
  auditorium: { name: "Auditorio", emoji: "🎭" },
  lab: { name: "Laboratorio", emoji: "🔬" },
  gym: { name: "Gimnasio", emoji: "🏋️" },
  garden: { name: "Jardín", emoji: "🌿" },
};

export type RoomPlayer = {
  id: string;
  userId: string;
  displayName: string;
  avatarConfig: AvatarConfig;
  role?: PlayerRole;
  isAlive: boolean;
  isGhost: boolean;
  zone: Zone;
  isReady: boolean;
};

export type Room = {
  id: string;
  hostId: string;
  roomCode: string;
  mode: RoomMode;
  language: Language;
  status: RoomStatus;
  players: RoomPlayer[];
};

export type RoundPhase = "action" | "meeting" | "results";

export type GameState = {
  matchId: string;
  roomId: string;
  currentRound: number;
  totalRounds: 3;
  phase: RoundPhase;
  phaseEndsAt: number;
  tasksTotal: number;
  tasksCompleted: number;
  players: RoomPlayer[];
  myRole: PlayerRole;
};

export type ChatMessageType = "preset" | "free" | "emoji";

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  messageType: ChatMessageType;
  content: string;
  createdAt: number;
};

export const CHAT_PRESETS = [
  "Vi a {player} en {zone}",
  "Yo estaba en {zone}",
  "Creo que es {player}",
  "{player} actuó raro",
  "No fui yo",
  "Confíen en mí",
  "Saltemos el voto",
  "¿Dónde estabas?",
];

export const CHAT_EMOJIS = ["😊", "🤔", "😱", "👀", "🤷", "👍", "❌", "💀", "🎉", "😤"];
