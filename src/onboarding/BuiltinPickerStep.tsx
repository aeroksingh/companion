import { motion } from "framer-motion";
import { BUILTIN_COMPANIONS } from "../lib/constants";

interface Props {
  onSelect: (key: string) => void;
  onBack: () => void;
}

export function BuiltinPickerStep({ onSelect, onBack }: Props) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "32px 40px",
        gap: 24,
      }}
    >
      <button
        onClick={onBack}
        style={{
          alignSelf: "flex-start",
          background: "none",
          border: "none",
          color: "#94a3b8",
          cursor: "pointer",
          fontSize: 13,
        }}
      >
        ← Back
      </button>

      <div>
        <h2 style={{ fontFamily: '"Press Start 2P"', fontSize: 12, color: "#e2e8f0", marginBottom: 8 }}>
          PICK A COMPANION
        </h2>
        <p style={{ color: "#94a3b8", fontSize: 13 }}>Choose who lives on your desktop</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          flex: 1,
        }}
      >
        {BUILTIN_COMPANIONS.map((c) => (
          <motion.button
            key={c.key}
            whileHover={{ scale: 1.06, borderColor: "#6366f1" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(c.key)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "2px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: "20px 12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              color: "#e2e8f0",
              transition: "border-color 0.2s",
            }}
          >
            {/* Placeholder sprite — replace with actual sprite previews */}
            <div
              style={{
                width: 64,
                height: 64,
                background: "rgba(99,102,241,0.2)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
              }}
            >
              {getCompanionEmoji(c.key)}
            </div>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</span>
            <span style={{ fontSize: 10, color: "#64748b", textAlign: "center" }}>
              {c.description}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function getCompanionEmoji(key: string): string {
  const map: Record<string, string> = {
    person_1: "🧑",
    person_2: "👤",
    dog: "🐕",
    cat: "🐈",
    rabbit: "🐇",
    fox: "🦊",
  };
  return map[key] ?? "🎮";
}
