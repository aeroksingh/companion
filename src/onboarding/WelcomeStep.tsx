import { motion } from "framer-motion";

interface Props {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: Props) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 40px",
        gap: 32,
        textAlign: "center",
      }}
    >
      {/* Animated pixel sprite placeholder */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ fontSize: 72 }}
      >
        🧑‍💻
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h1
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 18,
            color: "#e2e8f0",
            lineHeight: 1.6,
          }}
        >
          COMPANION
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.7, maxWidth: 380 }}>
          Your own little desktop buddy. Always there, never in the way.
          Pet them, click them, or just let them hang out while you work.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 280 }}>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "14px 32px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Meet your companion →
        </motion.button>
      </div>

      <p style={{ color: "#475569", fontSize: 11 }}>
        Runs locally · No internet required · Always yours
      </p>
    </div>
  );
}
