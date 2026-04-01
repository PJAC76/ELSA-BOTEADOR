import { motion } from "framer-motion";

type Props = { x: number; bottom: number; color?: string };

const Shockwave = ({ x, bottom, color }: Props) => (
  <motion.div
    className="pointer-events-none fixed z-[68] rounded-full border-2"
    style={{
      left: `${x}%`,
      bottom,
      borderColor: color || "hsl(var(--primary))",
      transform: "translate(-50%, 50%)",
    }}
    initial={{ width: 0, height: 0, opacity: 0.8 }}
    animate={{ width: 120, height: 120, opacity: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  />
);

export default Shockwave;
