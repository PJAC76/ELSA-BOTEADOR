import { motion, AnimatePresence } from "framer-motion";

const COMBO_LABELS = ["", "", "COMBO x2! 🔥", "COMBO x3! 💥", "COMBO x4! ⚡", "MEGA COMBO! 🌟"];

type Props = { count: number };

const ComboIndicator = ({ count }: Props) => {
  if (count < 2) return null;
  const label = count >= COMBO_LABELS.length ? `ULTRA COMBO x${count}! 🤯` : COMBO_LABELS[count];

  return (
    <AnimatePresence>
      <motion.div
        key={count}
        initial={{ opacity: 0, scale: 0.3, y: 20 }}
        animate={{ opacity: 1, scale: [0.3, 1.3, 1], y: 0 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="pointer-events-none fixed left-1/2 top-1/3 z-[75] -translate-x-1/2"
      >
        <div
          className="rounded-2xl px-6 py-3 text-center font-black shadow-2xl backdrop-blur-md"
          style={{
            background: count >= 5
              ? "linear-gradient(135deg, hsl(340, 82%, 60%), hsl(48, 96%, 53%), hsl(270, 70%, 60%))"
              : count >= 4
              ? "linear-gradient(135deg, hsl(270, 70%, 60%), hsl(340, 82%, 60%))"
              : "linear-gradient(135deg, hsl(var(--primary)), hsl(340, 82%, 60%))",
            fontSize: Math.min(16 + count * 3, 28),
            color: "white",
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {label}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ComboIndicator;
