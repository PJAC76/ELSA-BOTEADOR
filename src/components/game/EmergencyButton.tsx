import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { playTap } from "@/lib/sounds";

const COOLDOWN = 30; // seconds between emergency calls

type EmergencyButtonProps = {
  onEmergency: () => void;
  disabled?: boolean;
};

const EmergencyButton = ({ onEmergency, disabled }: EmergencyButtonProps) => {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const isReady = cooldown === 0 && !disabled;

  const handlePress = () => {
    if (!isReady) return;
    playTap();
    setCooldown(COOLDOWN);
    onEmergency();
  };

  return (
    <motion.button
      whileTap={isReady ? { scale: 0.9 } : undefined}
      onClick={handlePress}
      disabled={!isReady}
      className={`relative flex items-center gap-2 rounded-2xl px-5 py-3 font-display text-sm font-bold shadow-soft transition-all ${
        isReady
          ? "bg-destructive text-destructive-foreground active:shadow-none"
          : "bg-muted text-muted-foreground opacity-60"
      }`}
    >
      <AlertTriangle className="h-4 w-4" />
      {cooldown > 0 ? (
        <span>Emergencia ({cooldown}s)</span>
      ) : (
        <span>🚨 ¡Emergencia!</span>
      )}

      {/* Animated pulse ring when ready */}
      <AnimatePresence>
        {isReady && (
          <motion.span
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl border-2 border-destructive"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default EmergencyButton;
