import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CompanionState } from "../stores/overlayStore";

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

let particleId = 0;

interface Props {
  state: CompanionState;
}

export function ParticleLayer({ state }: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Spawn hearts on HAPPY state
  useEffect(() => {
    if (state !== "happy") return;

    const count = 3;
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: particleId++,
      x: 20 + Math.random() * 60,
      y: 10 + Math.random() * 30,
      emoji: ["💛", "💚", "💜", "🩷"][Math.floor(Math.random() * 4)],
    }));

    setParticles((prev) => [...prev, ...newParticles]);

    const timer = setTimeout(() => {
      setParticles((prev) =>
        prev.filter((p) => !newParticles.some((n) => n.id === p.id))
      );
    }, 1200);

    return () => clearTimeout(timer);
  }, [state]);

  // ZZZ particles on SLEEPING state
  useEffect(() => {
    if (state !== "sleeping") return;

    const interval = setInterval(() => {
      const p: Particle = {
        id: particleId++,
        x: 50 + Math.random() * 20,
        y: 5,
        emoji: "💤",
      };
      setParticles((prev) => [...prev.slice(-5), p]);
    }, 1800);

    return () => clearInterval(interval);
  }, [state]);

  return (
    <div
      className="no-interact"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -40, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              fontSize: 14,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {p.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
