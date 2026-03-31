import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, UserPlus, Copy, Check, Ban, Clock, UserCheck, Heart, Star, Trophy, Flame, Crown, Sparkles, X, Edit3 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useBffStore, SQUAD_REWARDS } from "@/stores/bff-store";
import { playTap } from "@/lib/sounds";

type Friend = { id: string; name: string; emoji: string; status: "pending" | "accepted" | "blocked"; online?: boolean };

type FriendsScreenProps = { onBack: () => void; friendCode?: string };

const MOCK_FRIENDS: Friend[] = [
  { id: "1", name: "Luna_Star", emoji: "👩‍🦰", status: "accepted", online: true },
  { id: "2", name: "MintChoco", emoji: "👩‍🦱", status: "accepted", online: false },
  { id: "3", name: "Sparkle99", emoji: "👩", status: "pending" },
  { id: "4", name: "PixelQueen", emoji: "👑", status: "accepted", online: true },
  { id: "5", name: "StarGirl", emoji: "⭐", status: "accepted", online: false },
];

const FriendsScreen = ({ onBack, friendCode = "ELSA-7X2K" }: FriendsScreenProps) => {
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [addCode, setAddCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [tab, setTab] = useState<"all" | "pending" | "bff">("all");
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const { t } = useTranslation();

  const bff = useBffStore();
  const { squadMembers, squadName, stats } = bff;

  const handleCopyCode = async () => { await navigator.clipboard.writeText(friendCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleAddFriend = () => { if (!addCode.trim()) return; setFriends((prev) => [...prev, { id: Date.now().toString(), name: `Player_${addCode.slice(-4)}`, emoji: "👤", status: "pending" }]); setAddCode(""); setShowAdd(false); };
  const handleBlock = (id: string) => { setFriends((prev) => prev.map((f) => (f.id === id ? { ...f, status: "blocked" as const } : f))); };
  const handleAccept = (id: string) => { setFriends((prev) => prev.map((f) => (f.id === id ? { ...f, status: "accepted" as const } : f))); };

  const handleAddBff = (friend: Friend) => {
    playTap();
    bff.addMember({ id: friend.id, name: friend.name, emoji: friend.emoji });
  };

  const handleRemoveBff = (id: string) => {
    playTap();
    bff.removeMember(id);
  };

  const handleSaveSquadName = () => {
    if (draftName.trim()) bff.setSquadName(draftName.trim());
    setEditingName(false);
  };

  const filtered = friends.filter((f) => { if (f.status === "blocked") return false; if (tab === "pending") return f.status === "pending"; return f.status === "accepted"; });
  const pendingCount = friends.filter((f) => f.status === "pending").length;

  const acceptedFriends = friends.filter((f) => f.status === "accepted");
  const nonBffFriends = acceptedFriends.filter((f) => !squadMembers.find((m) => m.id === f.id));

  const totalWins = stats.winsTogetherAgent + stats.winsTogetherSaboteur;
  const winRate = stats.gamesPlayedTogether > 0 ? Math.round((totalWins / stats.gamesPlayedTogether) * 100) : 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="gradient-primary px-6 pb-6 pt-12 safe-top">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20">
            <ArrowLeft className="h-5 w-5 text-primary-foreground" />
          </button>
          <h1 className="font-display text-xl font-bold text-primary-foreground">{t("friendsTitle")}</h1>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-primary-foreground/15 p-3">
          <span className="font-body text-xs text-primary-foreground/80">{t("myCode")}</span>
          <span className="font-display text-sm font-black text-primary-foreground">{friendCode}</span>
          <button onClick={handleCopyCode} className="ml-auto">
            {copied ? <Check className="h-4 w-4 text-primary-foreground" /> : <Copy className="h-4 w-4 text-primary-foreground/70" />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-6 pt-4 pb-6 overflow-y-auto">
        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          <button onClick={() => setTab("all")} className={`flex-1 rounded-xl py-2.5 font-display text-sm font-bold transition-all ${tab === "all" ? "gradient-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground"}`}>
            {t("friendsTab")}
          </button>
          <button onClick={() => setTab("bff")} className={`flex-1 rounded-xl py-2.5 font-display text-sm font-bold transition-all relative ${tab === "bff" ? "bg-gradient-to-r from-campus-pink to-campus-peach text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground"}`}>
            💜 BFF
            {squadMembers.length > 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-campus-yellow font-body text-[10px] font-bold text-foreground">{squadMembers.length}</span>}
          </button>
          <button onClick={() => setTab("pending")} className={`flex-1 rounded-xl py-2.5 font-display text-sm font-bold transition-all relative ${tab === "pending" ? "gradient-warm text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground"}`}>
            {t("pendingTab")}
            {pendingCount > 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive font-body text-xs font-bold text-destructive-foreground">{pendingCount}</span>}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === "bff" ? (
            <motion.div key="bff" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {/* Squad header */}
              <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/5 to-campus-peach/10 p-5 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  {editingName ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        className="h-9 rounded-xl font-display text-sm font-bold"
                        maxLength={20}
                        autoFocus
                      />
                      <button onClick={handleSaveSquadName} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary"><Check className="h-4 w-4" /></button>
                      <button onClick={() => setEditingName(false)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-lg font-black text-foreground">{squadName}</h2>
                      <button onClick={() => { setDraftName(squadName); setEditingName(true); playTap(); }} className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Squad members avatars */}
                <div className="flex items-center gap-1 mb-4">
                  {squadMembers.map((m, i) => (
                    <motion.div key={m.id} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08 }} className="relative group">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-fun shadow-soft border-2 border-primary/20">
                        <span className="text-2xl">{m.emoji}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveBff(m.id)}
                        className="absolute -top-1 -right-1 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <p className="font-display text-[9px] font-bold text-center text-muted-foreground mt-0.5 truncate w-14">{m.name}</p>
                    </motion.div>
                  ))}
                  {squadMembers.length < 4 && (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground/40">
                      <UserPlus className="h-5 w-5" />
                    </div>
                  )}
                </div>

                {/* Squad stats */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: stats.gamesPlayedTogether, label: t("bffGames" as any), emoji: "🎮" },
                    { value: totalWins, label: t("bffWins" as any), emoji: "🏆" },
                    { value: `${winRate}%`, label: t("bffWinRate" as any), emoji: "📊" },
                    { value: stats.sharedStreak, label: t("bffStreak" as any), emoji: "🔥" },
                  ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="flex flex-col items-center rounded-xl bg-background/60 p-2">
                      <span className="text-sm">{s.emoji}</span>
                      <span className="font-display text-lg font-black text-foreground">{s.value}</span>
                      <span className="font-body text-[9px] text-muted-foreground text-center leading-tight">{s.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Squad rewards */}
              <div className="rounded-2xl bg-card p-4 shadow-soft">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-sm font-bold text-foreground">{t("bffRewards" as any)}</h3>
                </div>
                <div className="space-y-2">
                  {SQUAD_REWARDS.map((reward, i) => {
                    const unlocked = bff.unlockedRewards.includes(reward.id);
                    const isStreak = reward.id.startsWith("sr-streak");
                    const progress = isStreak
                      ? Math.min(stats.sharedStreak / reward.requirement, 1)
                      : Math.min(stats.gamesPlayedTogether / reward.requirement, 1);

                    return (
                      <motion.div
                        key={reward.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${unlocked ? "bg-primary/8" : "bg-muted/40"}`}
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${unlocked ? "bg-primary/15" : "bg-muted grayscale opacity-50"}`}>
                          <span className="text-lg">{reward.emoji}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-display text-xs font-bold truncate ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                            {t(reward.nameKey as any)}
                          </p>
                          <p className="font-body text-[10px] text-muted-foreground truncate">{t(reward.descKey as any)}</p>
                          {!unlocked && (
                            <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-primary/40 transition-all" style={{ width: `${progress * 100}%` }} />
                            </div>
                          )}
                        </div>
                        {unlocked && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                            <Check className="h-4 w-4 text-primary" />
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Add BFF from friends list */}
              {nonBffFriends.length > 0 && squadMembers.length < 4 && (
                <div className="rounded-2xl bg-card p-4 shadow-soft">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="h-4 w-4 text-campus-pink" />
                    <h3 className="font-display text-sm font-bold text-foreground">{t("bffAddFromFriends" as any)}</h3>
                  </div>
                  <div className="space-y-2">
                    {nonBffFriends.map((friend, i) => (
                      <motion.div
                        key={friend.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 rounded-xl bg-muted/30 p-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-fun">
                          <span className="text-lg">{friend.emoji}</span>
                        </div>
                        <span className="flex-1 font-display text-sm font-bold text-foreground">{friend.name}</span>
                        <button
                          onClick={() => handleAddBff(friend)}
                          className="flex h-9 items-center gap-1.5 rounded-xl bg-primary/10 px-3 text-primary font-display text-xs font-bold transition-colors hover:bg-primary/20"
                        >
                          <Heart className="h-3.5 w-3.5" />
                          BFF
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {squadMembers.length === 0 && (
                <div className="py-8 text-center">
                  <span className="text-5xl">💜</span>
                  <p className="mt-3 font-display text-sm font-bold text-foreground">{t("bffEmptyTitle" as any)}</p>
                  <p className="mt-1 font-body text-xs text-muted-foreground">{t("bffEmptyDesc" as any)}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="friends" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {tab === "all" && !showAdd ? (
                <Button onClick={() => setShowAdd(true)} variant="outline" className="mb-4 h-12 w-full rounded-2xl border-dashed font-display font-bold">
                  <UserPlus className="mr-2 h-4 w-4" />{t("addFriendByCode")}
                </Button>
              ) : tab === "all" ? (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mb-4 overflow-hidden rounded-2xl bg-card p-4 shadow-soft">
                  <p className="mb-2 font-body text-xs text-muted-foreground">{t("enterFriendCodePlaceholder")}</p>
                  <div className="flex gap-2">
                    <Input placeholder="ELSA-XXXX" value={addCode} onChange={(e) => setAddCode(e.target.value.toUpperCase())} className="h-12 rounded-xl font-display font-bold text-center" />
                    <Button onClick={handleAddFriend} disabled={!addCode.trim()} className="h-12 rounded-xl gradient-primary text-primary-foreground font-display font-bold px-6">{t("send")}</Button>
                  </div>
                </motion.div>
              ) : null}

              <div className="space-y-2">
                {filtered.length === 0 && (
                  <div className="py-12 text-center">
                    <span className="text-4xl">{tab === "pending" ? "📬" : "👯‍♀️"}</span>
                    <p className="mt-3 font-body text-sm text-muted-foreground">{tab === "pending" ? t("noPendingRequests") : t("addFriendsWithCode")}</p>
                  </div>
                )}
                {filtered.map((friend, i) => {
                  const isBff = squadMembers.find((m) => m.id === friend.id);
                  return (
                    <motion.div key={friend.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-soft">
                      <div className="relative">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-fun"><span className="text-xl">{friend.emoji}</span></div>
                        {friend.status === "accepted" && friend.online && <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-campus-mint" />}
                        {isBff && <div className="absolute -top-1 -left-1 text-xs">💜</div>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-display text-sm font-bold text-foreground">{friend.name}</span>
                          {isBff && <span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-display text-[9px] font-bold text-primary">BFF</span>}
                        </div>
                        {friend.status === "pending" && <p className="flex items-center gap-1 font-body text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {t("pendingRequest")}</p>}
                        {friend.status === "accepted" && <p className="font-body text-xs text-muted-foreground">{friend.online ? t("online") : t("offline")}</p>}
                      </div>
                      <div className="flex gap-1">
                        {friend.status === "accepted" && !isBff && squadMembers.length < 4 && (
                          <button onClick={() => handleAddBff(friend)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Heart className="h-4 w-4" /></button>
                        )}
                        {friend.status === "pending" && <button onClick={() => handleAccept(friend.id)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-campus-mint/20 text-accent-foreground"><UserCheck className="h-4 w-4" /></button>}
                        <button onClick={() => handleBlock(friend.id)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive"><Ban className="h-4 w-4" /></button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FriendsScreen;
