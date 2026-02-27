import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogIn } from "lucide-react";

type JoinRoomScreenProps = {
  onBack: () => void;
  onJoin: (roomCode: string) => void;
};

const JoinRoomScreen = ({ onBack, onJoin }: JoinRoomScreenProps) => {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");

  const handleInput = (index: number, value: string) => {
    const char = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!char && value !== "") return;

    const next = [...code];
    next[index] = char;
    setCode(next);
    setError("");

    // Auto-focus next input
    if (char && index < 5) {
      const nextEl = document.getElementById(`code-${index + 1}`);
      nextEl?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevEl = document.getElementById(`code-${index - 1}`);
      prevEl?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    if (paste.length > 0) {
      const next = Array(6).fill("");
      paste.split("").forEach((ch, i) => { next[i] = ch; });
      setCode(next);
    }
  };

  const fullCode = code.join("");
  const isComplete = fullCode.length === 6;

  const handleJoin = () => {
    if (!isComplete) return;
    // Mock: always succeed
    onJoin(fullCode);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="gradient-warm px-6 pb-6 pt-12 safe-top">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20">
            <ArrowLeft className="h-5 w-5 text-primary-foreground" />
          </button>
          <h1 className="font-display text-xl font-bold text-primary-foreground">
            Unirse a Sala
          </h1>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center px-6 pt-10">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-2 text-5xl"
        >
          🎟️
        </motion.div>
        <p className="mb-8 font-body text-sm text-muted-foreground text-center">
          Introduce el código que te compartió tu amiga
        </p>

        {/* Code input boxes */}
        <div className="mb-4 flex gap-2" onPaste={handlePaste}>
          {code.map((ch, i) => (
            <motion.input
              key={i}
              id={`code-${i}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              type="text"
              inputMode="text"
              maxLength={1}
              value={ch}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="flex h-14 w-11 items-center justify-center rounded-xl border-2 border-border bg-card text-center font-display text-2xl font-black text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring"
            />
          ))}
        </div>

        {error && (
          <p className="mb-4 font-body text-sm text-destructive">{error}</p>
        )}

        <Button
          onClick={handleJoin}
          disabled={!isComplete}
          className="h-14 w-full max-w-sm rounded-2xl gradient-warm text-primary-foreground shadow-soft font-display text-base font-bold disabled:opacity-40"
        >
          <LogIn className="mr-2 h-5 w-5" />
          Unirse a la sala
        </Button>
      </div>
    </div>
  );
};

export default JoinRoomScreen;
