import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { motion } from "framer-motion";
import { useTauriEvent } from "../hooks/useTauriEvent";

const STEPS = [
  { key: "crop",      label: "Cropping image" },
  { key: "bg_remove", label: "Removing background" },
  { key: "resize",    label: "Resizing" },
  { key: "pixelate",  label: "Applying pixel art style" },
  { key: "sprite",    label: "Building sprite sheet" },
  { key: "done",      label: "Complete!" },
];

interface Props {
  imagePath: string;
  onComplete: (spritePath: string, w: number, h: number, frames: number) => void;
  onError: () => void;
}

export function ProcessingStep({ imagePath, onComplete, onError }: Props) {
  const [currentStepKey, setCurrentStepKey] = useState("crop");
  const [error, setError] = useState<string | null>(null);

  useTauriEvent<string>("pipeline_progress", (step) => {
    setCurrentStepKey(step);
  });

  useEffect(() => {
    invoke<{ spritePath: string; frameCount: number; spriteWidth: number; spriteHeight: number }>(
      "run_pixel_pipeline",
      { inputPath: imagePath, targetSize: 96 }
    )
      .then((r) => onComplete(r.spritePath, r.spriteWidth, r.spriteHeight, r.frameCount))
      .catch((e) => {
        setError(String(e));
      });
  }, [imagePath]);

  const currentIdx = STEPS.findIndex((s) => s.key === currentStepKey);

  if (error) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          padding: 40,
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: 48 }}>😕</span>
        <p style={{ color: "#f87171", fontSize: 14 }}>Something went wrong during processing.</p>
        <p style={{ color: "#64748b", fontSize: 12 }}>{error}</p>
        <button
          onClick={onError}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 10,
            padding: "10px 24px",
            color: "#e2e8f0",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Try a different image
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        padding: "32px 40px",
      }}
    >
      {/* Spinning pixel avatar */}
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ fontSize: 64 }}
      >
        🎨
      </motion.div>

      <div>
        <h2 style={{ fontFamily: '"Press Start 2P"', fontSize: 11, color: "#e2e8f0", textAlign: "center", marginBottom: 8 }}>
          CREATING COMPANION
        </h2>
        <p style={{ color: "#94a3b8", fontSize: 12, textAlign: "center" }}>
          Just a moment while we work our pixel magic…
        </p>
      </div>

      <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 10 }}>
        {STEPS.filter((s) => s.key !== "done").map((step, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <motion.div
              key={step.key}
              animate={{ opacity: done || active ? 1 : 0.3 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 16px",
                borderRadius: 10,
                background: active ? "rgba(99,102,241,0.15)" : "transparent",
                border: active ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
              }}
            >
              <span style={{ fontSize: 16, width: 22, textAlign: "center" }}>
                {done ? "✅" : active ? "⟳" : "○"}
              </span>
              <span style={{ color: done || active ? "#e2e8f0" : "#475569", fontSize: 13 }}>
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: 380, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
        <motion.div
          animate={{ width: `${Math.max(5, (currentIdx / (STEPS.length - 1)) * 100)}%` }}
          transition={{ ease: "easeOut" }}
          style={{ height: "100%", background: "linear-gradient(90deg, #6366f1, #8b5cf6)", borderRadius: 2 }}
        />
      </div>
    </div>
  );
}
