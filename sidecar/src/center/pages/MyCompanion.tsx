import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { motion } from "framer-motion";
import { useCompanionStore } from "../../stores/companionStore";
import { convertFileSrc } from "@tauri-apps/api/core";

export function MyCompanion() {
  const { activeCompanion, rename, load } = useCompanionStore();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  if (!activeCompanion) {
    return (
      <div style={{ textAlign: "center", paddingTop: 80, color: "#64748b" }}>
        <span style={{ fontSize: 48 }}>🫥</span>
        <p style={{ marginTop: 16, fontSize: 14 }}>No active companion yet.</p>
        <p style={{ fontSize: 12, marginTop: 8 }}>Go to Library to create one.</p>
      </div>
    );
  }

  const spriteSrc =
    activeCompanion.sourceType === "builtin"
      ? `/sprites/${activeCompanion.builtinKey}/sprite.png`
      : convertFileSrc(activeCompanion.spritePath);

  const startRename = () => {
    setNameInput(activeCompanion.name);
    setEditingName(true);
  };

  const confirmRename = async () => {
    if (nameInput.trim() && nameInput.trim() !== activeCompanion.name) {
      await rename(activeCompanion.id, nameInput.trim());
    }
    setEditingName(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>My Companion</h1>

      <div
        style={{
          display: "flex",
          gap: 28,
          alignItems: "flex-start",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: 28,
        }}
      >
        {/* Sprite preview */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 120,
            height: 120,
            background: "rgba(99,102,241,0.1)",
            borderRadius: 12,
            border: "2px solid rgba(99,102,241,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <img
            src={spriteSrc}
            alt={activeCompanion.name}
            style={{ width: 80, height: 80, imageRendering: "pixelated" }}
          />
        </motion.div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {editingName ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirmRename()}
                onBlur={confirmRename}
                autoFocus
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(99,102,241,0.5)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#e2e8f0",
                  fontSize: 20,
                  fontWeight: 700,
                  outline: "none",
                  maxWidth: 200,
                }}
              />
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{activeCompanion.name}</h2>
              <button
                onClick={startRename}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#64748b" }}
              >
                ✏️
              </button>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <InfoRow label="Type" value={activeCompanion.sourceType === "builtin" ? "Built-in" : "Custom Upload"} />
            <InfoRow label="Sprite Size" value={`${activeCompanion.spriteWidth}×${activeCompanion.spriteHeight}px`} />
            <InfoRow label="Frames" value={String(activeCompanion.frameCount)} />
            <InfoRow
              label="Created"
              value={new Date(activeCompanion.createdAt).toLocaleDateString()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
      <span style={{ color: "#64748b", width: 90, flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#cbd5e1" }}>{value}</span>
    </div>
  );
}
