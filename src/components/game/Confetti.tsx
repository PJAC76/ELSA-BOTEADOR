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
};

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10 - Math.random() * 20,
    size: 6 + Math.random() * 10,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    delay: Math.random() * 0.8,
    duration: 2 + Math.random() * 2,
    rotate: Math.random() * 720 - 360,
    drift: (Math.random() - 0.5) * 40,
  }));
}

const ConfettiShape = ({ shape, size, color }: { shape: string; size: number; color: string }) => {
  if (shape === "circle") {
    return (
      <div
        className="rounded-full"
        style={{ width: size, height: size, backgroundColor: color }}
      />
    );
  }
  if (shape === "triangle") {
    return (
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid ${color}`,
        }}
      />
    );
  }
  // square
  return (
    <div
      className="rounded-sm"
      style={{ width: size, height: size * 0.6, backgroundColor: color }}
    />
  );
};

type ConfettiProps = {
  count?: number;
};

const Confetti = ({ count = 50 }: ConfettiProps) => {
  const particles = useMemo(() => generateParticles(count), [count]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: 1,
            rotate: 0,
            scale: 0,
          }}
          animate={{
            top: "110%",
            left: `${p.x + p.drift}%`,
            opacity: [1, 1, 0.8, 0],
            rotate: p.rotate,
            scale: [0, 1.2, 1, 0.8],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="absolute"
        >
          <ConfettiShape shape={p.shape} size={p.size} color={p.color} />
        </motion.div>
      ))}
    </div>
  );
};

export default Confetti;
