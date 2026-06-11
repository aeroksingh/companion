import { motion } from "framer-motion";

interface Props {
  onBuiltin: () => void;
  onUpload: () => void;
}

export function SourceStep({ onBuiltin, onUpload }: Props) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 40px",
        gap: 28,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontFamily: '"Press Start 2P"', fontSize: 13, color: "#e2e8f0", marginBottom: 12 }}>
          CHOOSE YOUR COMPANION
        </h2>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>
          Pick a built-in or bring your own
        </p>
      </div>

      <div style={{ display: "flex", gap: 20, width: "100%", maxWidth: 480 }}>
        <OptionCard
          emoji="🎮"
          title="Built-in"
          desc="Choose from pixel characters we made for you"
          onClick={onBuiltin}
        />
        <OptionCard
          emoji="📸"
          title="Upload Photo"
          desc="Upload anyone — a friend, yourself, or a character"
          onClick={onUpload}
        />
      </div>
    </div>
  );
}

function OptionCard({
  emoji, title, desc, onClick,
}: {
  emoji: string;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, borderColor: "#6366f1" }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        flex: 1,
        background: "rgba(255,255,255,0.04)",
        border: "2px solid rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: "28px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
        color: "#e2e8f0",
        textAlign: "center",
        transition: "border-color 0.2s",
      }}
    >
      <span style={{ fontSize: 40 }}>{emoji}</span>
      <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
      <span style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{desc}</span>
    </motion.button>
  );
}
