import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, UserPlus, Copy, Check, Ban, Clock, UserCheck } from "lucide-react";

type Friend = {
  id: string;
  name: string;
  emoji: string;
  status: "pending" | "accepted" | "blocked";
  online?: boolean;
};

type FriendsScreenProps = {
  onBack: () => void;
  friendCode?: string;
};

const MOCK_FRIENDS: Friend[] = [
  { id: "1", name: "Luna_Star", emoji: "👩‍🦰", status: "accepted", online: true },
  { id: "2", name: "MintChoco", emoji: "👩‍🦱", status: "accepted", online: false },
  { id: "3", name: "Sparkle99", emoji: "👩", status: "pending" },
];

const FriendsScreen = ({ onBack, friendCode = "ELSA-7X2K" }: FriendsScreenProps) => {
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [addCode, setAddCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [tab, setTab] = useState<"all" | "pending">("all");

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(friendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddFriend = () => {
    if (!addCode.trim()) return;
    const newFriend: Friend = {
      id: Date.now().toString(),
      name: `Player_${addCode.slice(-4)}`,
      emoji: "👤",
      status: "pending",
    };
    setFriends((prev) => [...prev, newFriend]);
    setAddCode("");
    setShowAdd(false);
  };

  const handleBlock = (id: string) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "blocked" as const } : f))
    );
  };

  const handleAccept = (id: string) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "accepted" as const } : f))
    );
  };

  const filtered = friends.filter((f) => {
    if (f.status === "blocked") return false;
    if (tab === "pending") return f.status === "pending";
    return f.status === "accepted";
  });

  const pendingCount = friends.filter((f) => f.status === "pending").length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="gradient-primary px-6 pb-6 pt-12 safe-top">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20">
            <ArrowLeft className="h-5 w-5 text-primary-foreground" />
          </button>
          <h1 className="font-display text-xl font-bold text-primary-foreground">
            Amigas
          </h1>
        </div>

        {/* My friend code */}
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-primary-foreground/15 p-3">
          <span className="font-body text-xs text-primary-foreground/80">Mi código:</span>
          <span className="font-display text-sm font-black text-primary-foreground">{friendCode}</span>
          <button onClick={handleCopyCode} className="ml-auto">
            {copied ? (
              <Check className="h-4 w-4 text-primary-foreground" />
            ) : (
              <Copy className="h-4 w-4 text-primary-foreground/70" />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-6 pt-4">
        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setTab("all")}
            className={`flex-1 rounded-xl py-2.5 font-display text-sm font-bold transition-all ${
              tab === "all" ? "gradient-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground"
            }`}
          >
            Amigas
          </button>
          <button
            onClick={() => setTab("pending")}
            className={`flex-1 rounded-xl py-2.5 font-display text-sm font-bold transition-all relative ${
              tab === "pending" ? "gradient-warm text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground"
            }`}
          >
            Pendientes
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive font-body text-xs font-bold text-destructive-foreground">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Add friend button */}
        {!showAdd ? (
          <Button
            onClick={() => setShowAdd(true)}
            variant="outline"
            className="mb-4 h-12 rounded-2xl border-dashed font-display font-bold"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Agregar amiga por código
          </Button>
        ) : (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="mb-4 overflow-hidden rounded-2xl bg-card p-4 shadow-soft"
          >
            <p className="mb-2 font-body text-xs text-muted-foreground">
              Introduce el código de tu amiga
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="ELSA-XXXX"
                value={addCode}
                onChange={(e) => setAddCode(e.target.value.toUpperCase())}
                className="h-12 rounded-xl font-display font-bold text-center"
              />
              <Button
                onClick={handleAddFriend}
                disabled={!addCode.trim()}
                className="h-12 rounded-xl gradient-primary text-primary-foreground font-display font-bold px-6"
              >
                Enviar
              </Button>
            </div>
          </motion.div>
        )}

        {/* Friends list */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <span className="text-4xl">
                {tab === "pending" ? "📬" : "👯‍♀️"}
              </span>
              <p className="mt-3 font-body text-sm text-muted-foreground">
                {tab === "pending"
                  ? "No tienes solicitudes pendientes"
                  : "Agrega amigas con su código"}
              </p>
            </div>
          )}
          {filtered.map((friend, i) => (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-soft"
            >
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-fun">
                  <span className="text-xl">{friend.emoji}</span>
                </div>
                {friend.status === "accepted" && friend.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-campus-mint" />
                )}
              </div>
              <div className="flex-1">
                <span className="font-display text-sm font-bold text-foreground">
                  {friend.name}
                </span>
                {friend.status === "pending" && (
                  <p className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> Solicitud pendiente
                  </p>
                )}
                {friend.status === "accepted" && (
                  <p className="font-body text-xs text-muted-foreground">
                    {friend.online ? "En línea 🟢" : "Desconectada"}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                {friend.status === "pending" && (
                  <button
                    onClick={() => handleAccept(friend.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-campus-mint/20 text-accent-foreground"
                  >
                    <UserCheck className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleBlock(friend.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive"
                >
                  <Ban className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FriendsScreen;
