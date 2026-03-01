import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, LogIn } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

type PlayFriendsScreenProps = {
  onBack: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
};

const PlayFriendsScreen = ({ onBack, onCreateRoom, onJoinRoom }: PlayFriendsScreenProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="gradient-warm px-6 pb-8 pt-12 safe-top">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20">
            <ArrowLeft className="h-5 w-5 text-primary-foreground" />
          </button>
          <h1 className="font-display text-xl font-bold text-primary-foreground">{t("playWithFriends")}</h1>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 -mt-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="mb-8 text-7xl">👯‍♀️</motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full max-w-sm space-y-4">
          <Button onClick={onCreateRoom} className="h-20 w-full rounded-3xl gradient-fun text-primary-foreground shadow-card font-display text-lg font-bold">
            <div className="flex items-center gap-3">
              <Plus className="h-7 w-7" />
              <div className="text-left">
                <div>{t("createRoom")}</div>
                <div className="text-xs font-body font-normal text-primary-foreground/70">{t("createRoomDesc")}</div>
              </div>
            </div>
          </Button>

          <Button onClick={onJoinRoom} className="h-20 w-full rounded-3xl gradient-warm text-primary-foreground shadow-card font-display text-lg font-bold">
            <div className="flex items-center gap-3">
              <LogIn className="h-7 w-7" />
              <div className="text-left">
                <div>{t("joinRoom")}</div>
                <div className="text-xs font-body font-normal text-primary-foreground/70">{t("joinRoomDesc")}</div>
              </div>
            </div>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default PlayFriendsScreen;
