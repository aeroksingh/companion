import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { motion } from "framer-motion";
import { OnboardingState } from "./OnboardingApp";
import { convertFileSrc } from "@tauri-apps/api/core";

interface Props {
  onboardingState: OnboardingState;
  onBack: () => void;
}

export function NameStep({ onboardingState, onBack }: Props) {
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { sourceType, builtinKey, processedSpritePath, spriteWidth, spriteHeight, frameCount } =
    onboardingState;

  const previewSrc =
    sourceType === "builtin"
      ? `/sprites/${builtinKey}/sprite.png`
      : processedSpritePath
      ? convertFileSrc(processedSpritePath)
      : null;

  const handleCreate = async () => {
    if (!name.trim()) return;
    if (!processedSpritePath) return;

    setIsCreating(true);
    setError(null);

    try {
      await invoke("create_companion", {
        args: {
          name: name.trim(),
          sourceType,
          builtinKey: builtinKey ?? undefined,
          spritePath: processedSpritePath,
          spriteWidth,
          spriteHeight,
          frameCount,
        },
      });

      await invoke("finish_onboarding");
    } catch (e) {
      setError(String(e));
      setIsCreating(false);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 40px",
        gap: 28,
      }}
    >
      <button
        onClick={onBack}
        style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13, position: "absolute", top: 28, left: 32 }}
      >
        ← Back
      </button>

      {/* Sprite preview */}
      {previewSrc && (
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 96,
            height: 96,
            background: "rgba(99,102,241,0.15)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid rgba(99,102,241,0.3)",
            overflow: "hidden",
          }}
        >
          <img
            src={previewSrc}
            alt="Companion preview"
            style={{ width: 64, height: 64, imageRendering: "pixelated" }}
          />
        </motion.div>
      )}

      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontFamily: '"Press Start 2P"', fontSize: 12, color: "#e2e8f0", marginBottom: 8 }}>
          NAME YOUR COMPANION
        </h2>
        <p style={{ color: "#94a3b8", fontSize: 13 }}>
          Give them a name — it'll show up when you hover
        </p>
      </div>

      <input
        type="text"
        placeholder="e.g. Alex, Buddy, Pixel..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        maxLength={24}
        autoFocus
        style={{
          width: "100%",
          maxWidth: 320,
          background: "rgba(255,255,255,0.06)",
          border: "2px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: "14px 18px",
          color: "#e2e8f0",
          fontSize: 16,
          outline: "none",
          fontFamily: "Inter, sans-serif",
          textAlign: "center",
        }}
      />

      {error && <p style={{ color: "#f87171", fontSize: 12 }}>{error}</p>}

      <motion.button
        whileHover={{ scale: name.trim() ? 1.03 : 1 }}
        whileTap={{ scale: name.trim() ? 0.97 : 1 }}
        onClick={handleCreate}
        disabled={!name.trim() || isCreating}
        style={{
          background: name.trim()
            ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
            : "rgba(255,255,255,0.08)",
          color: name.trim() ? "#fff" : "#475569",
          border: "none",
          borderRadius: 12,
          padding: "13px 32px",
          fontSize: 14,
          fontWeight: 600,
          cursor: name.trim() ? "pointer" : "not-allowed",
          transition: "background 0.2s",
        }}
      >
        {isCreating ? "Creating…" : "Let's go! 🎉"}
      </motion.button>
    </div>
  );
}
