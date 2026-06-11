import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { motion } from "framer-motion";
import { useCompanionStore } from "../stores/companionStore";
import { useSettingsStore } from "../stores/settingsStore";
import { MyCompanion } from "./pages/MyCompanion";
import { Appearance } from "./pages/Appearance";
import { Library } from "./pages/Library";
import { BehaviorPage } from "./pages/BehaviorPage";
import { Statistics } from "./pages/Statistics";

type CenterPage = "companion" | "appearance" | "library" | "behavior" | "statistics";

const NAV_ITEMS: { id: CenterPage; label: string; icon: string }[] = [
  { id: "companion",   label: "My Companion", icon: "🧑" },
  { id: "appearance",  label: "Appearance",   icon: "🎨" },
  { id: "library",     label: "Library",      icon: "📚" },
  { id: "behavior",    label: "Behavior",     icon: "⚡" },
  { id: "statistics",  label: "Statistics",   icon: "📊" },
];

export function CenterApp() {
  const [page, setPage] = useState<CenterPage>("companion");
  const { load: loadCompanions } = useCompanionStore();
  const { load: loadSettings } = useSettingsStore();

  useEffect(() => {
    loadCompanions();
    loadSettings();
  }, []);

  const handleClose = async () => {
    await invoke("close_companion_center").catch(() => {});
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        background: "#0f172a",
        color: "#e2e8f0",
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 200,
          background: "#0a0f1e",
          display: "flex",
          flexDirection: "column",
          padding: "24px 0",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontFamily: '"Press Start 2P"', fontSize: 9, color: "#6366f1" }}>COMPANION</p>
        </div>

        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                background: page === item.id ? "rgba(99,102,241,0.15)" : "transparent",
                border: "none",
                color: page === item.id ? "#818cf8" : "#64748b",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: page === item.id ? 600 : 400,
                width: "100%",
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "12px 8px" }}>
          <button
            onClick={handleClose}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 8,
              background: "transparent",
              border: "none",
              color: "#475569",
              cursor: "pointer",
              fontSize: 12,
              width: "100%",
            }}
          >
            <span>✕</span> Close
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          style={{ padding: "32px 36px", minHeight: "100%" }}
        >
          {page === "companion"  && <MyCompanion />}
          {page === "appearance" && <Appearance />}
          {page === "library"    && <Library />}
          {page === "behavior"   && <BehaviorPage />}
          {page === "statistics" && <Statistics />}
        </motion.div>
      </div>
    </div>
  );
}
