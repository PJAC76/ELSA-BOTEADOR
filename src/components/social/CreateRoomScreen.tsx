import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Check, Users } from "lucide-react";

type CreateRoomScreenProps = {
  onBack: () => void;
  onRoomReady: (roomCode: string) => void;
};

const generateRoomCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const CreateRoomScreen = ({ onBack, onRoomReady }: CreateRoomScreenProps) => {
  const [roomCode] = useState(generateRoomCode);
  const [copied, setCopied] = useState(false);
  const [players] = useState([
    { id: "me", name: "Tú", emoji: "🕵️" },
  ]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="gradient-fun px-6 pb-6 pt-12 safe-top">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20">
            <ArrowLeft className="h-5 w-5 text-primary-foreground" />
          </button>
          <h1 className="font-display text-xl font-bold text-primary-foreground">
            Tu Sala Privada
          </h1>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center px-6 pt-8">
        {/* Room code display */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-3 w-full max-w-sm rounded-3xl bg-card p-6 shadow-card text-center"
        >
          <p className="mb-2 font-body text-sm text-muted-foreground">
            Comparte este código con tus amigas
          </p>
          <div className="mb-4 flex items-center justify-center gap-2">
            {roomCode.split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                className="flex h-14 w-11 items-center justify-center rounded-xl bg-muted font-display text-2xl font-black text-foreground"
              >
                {char}
              </motion.span>
            ))}
          </div>
          <Button
            onClick={handleCopy}
            variant="outline"
            className="h-12 w-full rounded-2xl font-display font-bold"
          >
            {copied ? (
              <><Check className="mr-2 h-4 w-4 text-campus-mint" /> ¡Copiado!</>
            ) : (
              <><Copy className="mr-2 h-4 w-4" /> Copiar código</>
            )}
          </Button>
        </motion.div>

        {/* Players waiting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-sm"
        >
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-display text-sm font-bold text-muted-foreground">
              Jugadoras ({players.length}/8)
            </span>
          </div>
          <div className="space-y-2">
            {players.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-soft"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                  <span className="text-lg">{p.emoji}</span>
                </div>
                <span className="font-display text-sm font-bold text-foreground">
                  {p.name}
                </span>
                {p.id === "me" && (
                  <span className="ml-auto rounded-full bg-campus-yellow/20 px-3 py-1 font-body text-xs font-bold text-foreground">
                    Host 👑
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Waiting animation */}
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-6 text-center"
          >
            <p className="font-body text-sm text-muted-foreground">
              Esperando jugadoras... 🎀
            </p>
          </motion.div>
        </motion.div>

        {/* Start button */}
        <div className="mt-auto w-full max-w-sm pb-6 safe-bottom">
          <Button
            onClick={() => onRoomReady(roomCode)}
            className="h-14 w-full rounded-2xl gradient-primary text-primary-foreground shadow-soft font-display text-base font-bold"
          >
            Ir al Lobby →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomScreen;
