import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

type SplashScreenProps = {
  onComplete: () => void;
};

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 2;
      });
    }, 40);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-primary p-6">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="mb-8"
      >
        <div className="relative">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-card shadow-card">
              <span className="text-5xl">🕵️</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-xl bg-campus-yellow shadow-soft"
          >
            <span className="text-2xl">💣</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-2 font-display text-4xl font-black tracking-tight text-primary-foreground"
      >
        ELSA
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-12 font-display text-lg font-bold tracking-widest text-primary-foreground/80"
      >
        BOTEADOR
      </motion.p>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: "80%" }}
        transition={{ delay: 0.9 }}
        className="max-w-xs"
      >
        <Progress
          value={progress}
          className="h-3 bg-primary-foreground/20 [&>div]:gradient-warm [&>div]:rounded-full"
        />
        <p className="mt-3 text-center font-body text-sm font-medium text-primary-foreground/70">
          Preparando el campus...
        </p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
