import { motion } from "framer-motion";
import { useMemo } from "react";

const CONFETTI_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(340, 82%, 60%)",
  "hsl(48, 96%, 53%)",
  "hsl(160, 70%, 50%)",
  "hsl(270, 70%, 60%)",
];

const EFFECT_THEMES: Record<string, { emojis: string[]; colors: string[] }> = {
  "fx-hearts": { emojis: ["💕", "❤️", "💗", "💖", "💘", "💝"], colors: ["hsl(340, 82%, 60%)", "hsl(350, 80%, 50%)", "hsl(330, 70%, 65%)"] },
  "fx-stars": { emojis: ["⭐", "🌟", "✨", "💫", "⚡"], colors: ["hsl(48, 96%, 53%)", "hsl(40, 90%, 60%)", "hsl(55, 95%, 55%)"] },
  "fx-sparkle": { emojis: ["💫", "✨", "🌙", "⭐", "🔮"], colors: ["hsl(270, 70%, 60%)", "hsl(280, 65%, 55%)", "hsl(260, 80%, 65%)"] },
  "fx-fireworks": { emojis: ["🎆", "🎇", "💥", "🔥", "✨"], colors: ["hsl(15, 90%, 55%)", "hsl(48, 96%, 53%)", "hsl(200, 80%, 55%)"] },
  "fx-confetti": { emojis: ["🎊", "🎉", "🥳", "🎈", "🎀"], colors: ["hsl(340, 82%, 60%)", "hsl(48, 96%, 53%)", "hsl(160, 70%, 50%)"] },
};

const SHAPES = ["circle", "square", "triangle"] as const;

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  shape: (typeof SHAPES)[number];
  delay: number;
  duration: number;
  rotate: number;
  drift: number;
  emoji?: string;
};

function generateParticles(count: number, effectId?: string | null): Particle[] {
  const theme = effectId ? EFFECT_THEMES[effectId] : null;
  const colors = theme?.colors ?? CONFETTI_COLORS;
  const emojis = theme?.emojis;

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10 - Math.random() * 20,
    size: emojis ? 16 + Math.random() * 12 : 6 + Math.random() * 10,
    color: colors[Math.floor(Math.random() * colors.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    delay: Math.random() * 0.8,
    duration: 2 + Math.random() * 2,
    rotate: Math.random() * 720 - 360,
    drift: (Math.random() - 0.5) * 40,
    emoji: emojis ? emojis[Math.floor(Math.random() * emojis.length)] : undefined,
  }));
}

const ConfettiShape = ({ shape, size, color, emoji }: { shape: string; size: number; color: string; emoji?: string }) => {
  if (emoji) {
    return <span style={{ fontSize: size }}>{emoji}</span>;
  }
  if (shape === "circle") {
    return <div className="rounded-full" style={{ width: size, height: size, backgroundColor: color }} />;
  }
  if (shape === "triangle") {
    return (
      <div style={{ width: 0, height: 0, borderLeft: `${size / 2}px solid transparent`, borderRight: `${size / 2}px solid transparent`, borderBottom: `${size}px solid ${color}` }} />
    );
  }
  return <div className="rounded-sm" style={{ width: size, height: size * 0.6, backgroundColor: color }} />;
};

type ConfettiProps = {
  count?: number;
  effectId?: string | null;
};

const Confetti = ({ count = 50, effectId }: ConfettiProps) => {
  const particles = useMemo(() => generateParticles(count, effectId), [count, effectId]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ left: `${p.x}%`, top: `${p.y}%`, opacity: 1, rotate: 0, scale: 0 }}
          animate={{ top: "110%", left: `${p.x + p.drift}%`, opacity: [1, 1, 0.8, 0], rotate: p.rotate, scale: [0, 1.2, 1, 0.8] }}
          transition={{ duration: p.duration, delay: p.delay, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute"
        >
          <ConfettiShape shape={p.shape} size={p.size} color={p.color} emoji={p.emoji} />
        </motion.div>
      ))}
    </div>
  );
};

export default Confetti;
