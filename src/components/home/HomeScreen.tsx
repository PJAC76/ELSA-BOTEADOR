import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, Zap, UserCircle, Package, Settings } from "lucide-react";
import WeeklyChallenges from "@/components/progression/WeeklyChallenges";

type HomeScreenProps = {
  displayName: string;
  level?: number;
  xp?: number;
  onPlayFriends: () => void;
  onQuickPlay: () => void;
  onFriends?: () => void;
  onInventory?: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
};

const HomeScreen = ({
  displayName,
  level = 1,
  xp = 0,
  onPlayFriends,
  onQuickPlay,
  onFriends,
  onInventory,
  onProfile,
  onSettings,
}: HomeScreenProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="gradient-primary px-6 pb-8 pt-12 safe-top">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="font-body text-sm text-primary-foreground/70">
              ¡Hola de nuevo!
            </p>
            <h1 className="font-display text-2xl font-black text-primary-foreground">
              {displayName}
            </h1>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/20">
            <span className="text-2xl">🕵️</span>
          </div>
        </motion.div>

        {/* Level / XP */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 flex items-center gap-3"
        >
          <div className="flex h-8 items-center rounded-full bg-primary-foreground/20 px-3">
            <span className="font-display text-xs font-bold text-primary-foreground">
              Nivel {level}
            </span>
          </div>
          <div className="flex-1">
            <div className="h-2 rounded-full bg-primary-foreground/20">
              <div
                className="h-full rounded-full bg-campus-yellow transition-all"
                style={{ width: `${Math.min(xp, 100)}%` }}
              />
            </div>
          </div>
          <span className="font-body text-xs text-primary-foreground/70">
            {xp} XP
          </span>
        </motion.div>
      </div>

      {/* Main CTAs */}
      <div className="flex flex-1 flex-col px-6 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {/* Play with friends */}
          <Button
            onClick={onPlayFriends}
            className="h-20 w-full rounded-3xl gradient-warm text-primary-foreground shadow-card font-display text-lg font-bold relative overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <Users className="h-7 w-7" />
              <div className="text-left">
                <div>Jugar con Amigas</div>
                <div className="text-xs font-body font-normal text-primary-foreground/70">
                  Crea o únete a una sala privada
                </div>
              </div>
            </div>
          </Button>

          {/* Quick play */}
          <Button
            onClick={onQuickPlay}
            className="h-20 w-full rounded-3xl gradient-accent text-accent-foreground shadow-card font-display text-lg font-bold"
          >
            <div className="flex items-center gap-3">
              <Zap className="h-7 w-7" />
              <div className="text-left">
                <div>Partida Rápida</div>
                <div className="text-xs font-body font-normal text-accent-foreground/70">
                  Encuentra jugadoras al instante
                </div>
              </div>
            </div>
          </Button>
        </motion.div>

        {/* Weekly challenges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 px-0"
        >
          <WeeklyChallenges compact />
        </motion.div>

        {/* Quick nav */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-auto pb-6 safe-bottom"
        >
          <div className="flex justify-around rounded-3xl bg-muted p-3">
            {[
              { icon: UserCircle, label: "Perfil", action: onProfile },
              { icon: Package, label: "Inventario", action: onInventory },
              { icon: Users, label: "Amigas", action: onFriends },
              { icon: Settings, label: "Ajustes", action: onSettings },
            ].map(({ icon: Icon, label, action }) => (
              <button
                key={label}
                onClick={action}
                className="flex flex-col items-center gap-1 rounded-2xl px-4 py-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                <Icon className="h-5 w-5" />
                <span className="font-body text-[10px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeScreen;
