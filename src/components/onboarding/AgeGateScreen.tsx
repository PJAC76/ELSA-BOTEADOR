import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ShieldCheck } from "lucide-react";

type AgeGateScreenProps = {
  onVerified: () => void;
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 - i);

const AgeGateScreen = ({ onVerified }: AgeGateScreenProps) => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [blocked, setBlocked] = useState(false);

  const handleConfirm = () => {
    if (!selectedYear) return;
    const age = currentYear - selectedYear;
    if (age < 14) {
      setBlocked(true);
    } else {
      onVerified();
    }
  };

  if (blocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10"
        >
          <ShieldAlert className="h-12 w-12 text-destructive" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-3 font-display text-2xl font-bold text-foreground"
        >
          ¡Ups! Aún no puedes entrar
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-xs text-center font-body text-base text-muted-foreground"
        >
          ELSA-BOTEADOR es para mayores de 14 años. ¡Vuelve cuando crezcas un poquito más! 💜
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring" }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/20"
      >
        <ShieldCheck className="h-10 w-10 text-accent" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2 font-display text-2xl font-bold text-foreground"
      >
        Verificación de edad
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 max-w-xs text-center font-body text-sm text-muted-foreground"
      >
        Necesitamos confirmar que tienes al menos 14 años para poder jugar 🎂
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 grid w-full max-w-sm grid-cols-4 gap-2"
      >
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`h-12 rounded-xl font-display text-sm font-bold transition-all ${
              selectedYear === year
                ? "gradient-primary text-primary-foreground shadow-soft scale-105"
                : "bg-muted text-muted-foreground hover:bg-secondary"
            }`}
          >
            {year}
          </button>
        ))}
      </motion.div>

      <Button
        onClick={handleConfirm}
        disabled={!selectedYear}
        size="lg"
        className="h-14 w-full max-w-sm rounded-2xl gradient-primary text-primary-foreground shadow-soft font-display text-base font-bold disabled:opacity-40"
      >
        Confirmar
      </Button>
    </div>
  );
};

export default AgeGateScreen;
