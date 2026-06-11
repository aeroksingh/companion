import { invoke } from "@tauri-apps/api/core";
import { motion, AnimatePresence } from "framer-motion";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useCompanionStore, Companion } from "../../stores/companionStore";

export function Library() {
  const { companions, activeCompanion, setActive, delete: deleteCompanion, load } =
    useCompanionStore();

  const handleCreate = async () => {
    await invoke("open_onboarding").catch(() => {});
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Library</h1>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCreate}
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "9px 18px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          + Add Companion
        </motion.button>
      </div>

      {companions.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            paddingTop: 80,
            color: "#64748b",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 52 }}>🫥</span>
          <p style={{ fontSize: 14 }}>No companions yet</p>
          <p style={{ fontSize: 12 }}>Click "Add Companion" to get started</p>
        </div>
      ) : (
        <motion.div
          layout
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 14,
          }}
        >
          <AnimatePresence>
            {companions.map((c) => (
              <CompanionCard
                key={c.id}
                companion={c}
                isActive={c.id === activeCompanion?.id}
                onSetActive={() => setActive(c.id)}
                onDelete={() => deleteCompanion(c.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function CompanionCard({
  companion,
  isActive,
  onSetActive,
  onDelete,
}: {
  companion: Companion;
  isActive: boolean;
  onSetActive: () => void;
  onDelete: () => void;
}) {
  const spriteSrc =
    companion.sourceType === "builtin"
      ? `/sprites/${companion.builtinKey}/sprite.png`
      : convertFileSrc(companion.spritePath);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{
        background: isActive
          ? "rgba(99,102,241,0.12)"
          : "rgba(255,255,255,0.03)",
        border: isActive
          ? "2px solid rgba(99,102,241,0.45)"
          : "2px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        position: "relative",
      }}
    >
      {/* Active badge */}
      {isActive && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "#6366f1",
            borderRadius: 999,
            padding: "2px 7px",
            fontSize: 9,
            color: "#fff",
            fontWeight: 700,
          }}
        >
          ACTIVE
        </div>
      )}

      {/* Sprite */}
      <div
        style={{
          width: 72,
          height: 72,
          background: "rgba(99,102,241,0.1)",
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <img
          src={spriteSrc}
          alt={companion.name}
          style={{ width: 56, height: 56, imageRendering: "pixelated" }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      <span style={{ fontWeight: 600, fontSize: 13, color: "#e2e8f0", textAlign: "center" }}>
        {companion.name}
      </span>

      <span style={{ fontSize: 10, color: "#64748b" }}>
        {companion.sourceType === "builtin" ? "Built-in" : "Custom"}
      </span>

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, width: "100%" }}>
        {!isActive && (
          <button
            onClick={onSetActive}
            style={{
              flex: 1,
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 7,
              padding: "6px 0",
              color: "#818cf8",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Set Active
          </button>
        )}
        <button
          onClick={onDelete}
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 7,
            padding: "6px 8px",
            color: "#f87171",
            cursor: "pointer",
            fontSize: 11,
          }}
        >
          🗑
        </button>
      </div>
    </motion.div>
  );
}
