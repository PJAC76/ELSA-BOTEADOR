import { motion } from "framer-motion";
import { useMemo } from "react";

const PARTICLE_COLORS = [
  "hsl(var(--primary))",
  "hsl(340, 82%, 60%)",
  "hsl(48, 96%, 53%)",
  "hsl(160, 70%, 50%)",
  "hsl(270, 70%, 60%)",
];

type Particle = { id: number; angle: number; dist: number; size: number; color: string; delay: number };

function genParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (360 / count) * i + Math.random() * 20,
    dist: 30 + Math.random() * 40,
    size: 3 + Math.random() * 5,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    delay: Math.random() * 0.15,
  }));
}

type Props = { x: number; bottom: number; intensity?: number };

const ReactionParticles = ({ x, bottom, intensity = 1 }: Props) => {
  const particles = useMemo(() => genParticles(Math.floor(8 * intensity)), [intensity]);

  return (
    <div className="pointer-events-none fixed z-[69]" style={{ left: `${x}%`, bottom }}>
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.dist;
        const ty = Math.sin(rad) * p.dist;
        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{ width: p.size, height: p.size, backgroundColor: p.color, left: -p.size / 2, top: -p.size / 2 }}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{ opacity: 0, x: tx, y: -ty, scale: 0 }}
            transition={{ duration: 0.6 + Math.random() * 0.3, delay: p.delay, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
};

export default ReactionParticles;
