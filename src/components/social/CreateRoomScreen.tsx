import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Check, Users, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { createRoom, useRoom, leaveRoom } from "@/hooks/use-room";
import { toast } from "sonner";

type CreateRoomScreenProps = {
  onBack: () => void;
  onRoomReady: (roomCode: string, roomId: string) => void;
};

const CreateRoomScreen = ({ onBack, onRoomReady }: CreateRoomScreenProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [creating, setCreating] = useState(true);
  const [copied, setCopied] = useState(false);
  const { room, players } = useRoom(roomId, user?.id);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const created = await createRoom({ mode: "friends", language: "es", maxPlayers: 6 });
        if (!cancelled) setRoomId(created.id);
      } catch (e: any) {
        toast.error(e.message ?? "Error creando sala");
        onBack();
      } finally {
        if (!cancelled) setCreating(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = async () => {
    if (!room?.code) return;
    await navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBack = async () => {
    if (roomId) {
      try { await leaveRoom(roomId); } catch { /* ignore */ }
    }
    onBack();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="gradient-fun px-6 pb-6 pt-12 safe-top">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20">
            <ArrowLeft className="h-5 w-5 text-primary-foreground" />
          </button>
          <h1 className="font-display text-xl font-bold text-primary-foreground">{t("yourPrivateRoom")}</h1>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center px-6 pt-8">
        {creating || !room ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-3 w-full max-w-sm rounded-3xl bg-card p-6 shadow-card text-center">
              <p className="mb-2 font-body text-sm text-muted-foreground">{t("shareCode")}</p>
              <div className="mb-4 flex items-center justify-center gap-2">
                {room.code.split("").map((char, i) => (
                  <motion.span key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.08 }} className="flex h-14 w-11 items-center justify-center rounded-xl bg-muted font-display text-2xl font-black text-foreground">{char}</motion.span>
                ))}
              </div>
              <Button onClick={handleCopy} variant="outline" className="h-12 w-full rounded-2xl font-display font-bold">
                {copied ? <><Check className="mr-2 h-4 w-4 text-campus-mint" /> {t("copied")}</> : <><Copy className="mr-2 h-4 w-4" /> {t("copyCode")}</>}
              </Button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full max-w-sm">
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-display text-sm font-bold text-muted-foreground">{t("players")} ({players.length}/{room.max_players})</span>
              </div>
              <div className="space-y-2">
                {players.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-soft">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary"><span className="text-lg">🕵️</span></div>
                    <span className="font-display text-sm font-bold text-foreground">{p.profile?.display_name ?? "..."}</span>
                    {p.user_id === room.host_id && <span className="ml-auto rounded-full bg-campus-yellow/20 px-3 py-1 font-body text-xs font-bold text-foreground">Host 👑</span>}
                  </div>
                ))}
              </div>
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} className="mt-6 text-center">
                <p className="font-body text-sm text-muted-foreground">{t("waitingPlayers")}</p>
              </motion.div>
            </motion.div>

            <div className="mt-auto w-full max-w-sm pb-6 safe-bottom">
              <Button onClick={() => onRoomReady(room.code, room.id)} className="h-14 w-full rounded-2xl gradient-primary text-primary-foreground shadow-soft font-display text-base font-bold">{t("goToLobby")}</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateRoomScreen;
