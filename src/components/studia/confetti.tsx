import { motion } from "framer-motion";
import { useMemo } from "react";

const colors = ["bg-primary", "bg-success", "bg-reward", "bg-rose"];

/** Celebration burst; only mount after a user action so random values never hydrate. */
export function Confetti({ count = 70 }: { count?: number }) {
  const pieces = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i, x: (Math.random() - 0.5) * 900, y: 300 + Math.random() * 400, rotate: Math.random() * 720 - 360,
    delay: Math.random() * 0.25, size: 6 + Math.random() * 7, color: colors[i % colors.length], round: i % 3 === 0,
  })), [count]);
  return <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
    {pieces.map(p => <motion.span key={p.id} className={`absolute left-1/2 top-1/3 ${p.color} ${p.round ? "rounded-full" : "rounded-[2px]"}`} style={{ width: p.size, height: p.size * (p.round ? 1 : 1.6) }}
      initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.4 }} animate={{ x: p.x, y: [0, -220 - Math.random() * 120, p.y], opacity: [1, 1, 0], rotate: p.rotate, scale: 1 }}
      transition={{ duration: 2.2, delay: p.delay, ease: "easeOut" }} />)}
  </div>;
}
