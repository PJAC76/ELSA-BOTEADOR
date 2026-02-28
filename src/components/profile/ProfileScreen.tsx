import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit3, Check, X } from "lucide-react";
import AvatarCustomizer, { getAvatarEmoji } from "@/components/shared/AvatarCustomizer";
import type { AvatarConfig } from "@/types/game";

type ProfileScreenProps = {
  displayName: string;
  avatarConfig: AvatarConfig;
  level?: number;
  xp?: number;
  gamesPlayed?: number;
  gamesWon?: number;
  onBack: () => void;
  onAvatarSave: (config: AvatarConfig) => void;
};

const ProfileScreen = ({
  displayName,
  avatarConfig,
  level = 1,
  xp = 0,
  gamesPlayed = 12,
  gamesWon = 7,
  onBack,
  onAvatarSave,
}: ProfileScreenProps) => {
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AvatarConfig>(avatarConfig);

  const handleSave = () => {
    onAvatarSave(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(avatarConfig);
    setEditing(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="gradient-fun px-6 pb-10 pt-12 safe-top">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-foreground/20 text-primary-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-xl font-bold text-primary-foreground">
            Mi Perfil
          </h1>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-6 -mt-6 pb-8 overflow-y-auto">
        {/* Avatar Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-card p-6 shadow-card"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-warm">
              <span className="text-4xl">
                {getAvatarEmoji(editing ? draft : avatarConfig)}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold text-foreground">
                {displayName}
              </h2>
              <p className="font-body text-sm text-muted-foreground">
                Nivel {level} · {xp} XP
              </p>
              <div className="mt-2 h-2 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-campus-yellow transition-all"
                  style={{ width: `${Math.min(xp, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {!editing ? (
            <Button
              variant="outline"
              className="mt-4 w-full rounded-2xl font-display text-sm"
              onClick={() => {
                setDraft(avatarConfig);
                setEditing(true);
              }}
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Editar Avatar
            </Button>
          ) : (
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-2xl font-display text-sm"
                onClick={handleCancel}
              >
                <X className="mr-1 h-4 w-4" />
                Cancelar
              </Button>
              <Button
                className="flex-1 rounded-2xl gradient-primary text-primary-foreground font-display text-sm"
                onClick={handleSave}
              >
                <Check className="mr-1 h-4 w-4" />
                Guardar
              </Button>
            </div>
          )}
        </motion.div>

        {/* Avatar Editor */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 rounded-3xl bg-card p-5 shadow-soft overflow-hidden"
            >
              <AvatarCustomizer
                avatarConfig={draft}
                onChange={setDraft}
                showPreview={false}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-4 grid grid-cols-3 gap-3"
        >
          {[
            { label: "Partidas", value: gamesPlayed, emoji: "🎮" },
            { label: "Victorias", value: gamesWon, emoji: "🏆" },
            { label: "Win Rate", value: `${winRate}%`, emoji: "📊" },
          ].map(({ label, value, emoji }) => (
            <div
              key={label}
              className="flex flex-col items-center rounded-2xl bg-card p-4 shadow-soft"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="mt-1 font-display text-lg font-bold text-foreground">
                {value}
              </span>
              <span className="font-body text-[11px] text-muted-foreground">
                {label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 rounded-3xl bg-card p-5 shadow-soft"
        >
          <h3 className="font-display text-sm font-bold text-foreground mb-3">
            Insignias
          </h3>
          <div className="flex gap-3 flex-wrap">
            {["🌟", "🔍", "🛡️", "💎", "🎯"].map((badge, i) => (
              <div
                key={i}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  i < 3 ? "bg-muted" : "bg-muted/50 opacity-40"
                }`}
              >
                <span className="text-xl">{badge}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileScreen;
