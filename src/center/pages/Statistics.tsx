import { useEffect } from "react";
import { motion } from "framer-motion";
import { useCompanionStore } from "../../stores/companionStore";
import { useStatsStore } from "../../stores/statsStore";

export function Statistics() {
  const { activeCompanion } = useCompanionStore();
  const { stats, load } = useStatsStore();

  useEffect(() => {
    if (activeCompanion) load(activeCompanion.id);
  }, [activeCompanion?.id]);

  if (!activeCompanion) {
    return (
      <div style={{ textAlign: "center", paddingTop: 80, color: "#64748b" }}>
        <p>No active companion</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ textAlign: "center", paddingTop: 80, color: "#64748b" }}>
        <p>Loading stats…</p>
      </div>
    );
  }

  const cards = [
    {
      label: "Hovers",
      value: stats.hoverCount,
      icon: "👆",
      color: "#7c3aed",
      bg: "rgba(124,58,237,0.12)",
      border: "rgba(124,58,237,0.25)",
      desc: "Times you hovered over them",
    },
    {
      label: "Pets",
      value: stats.petCount,
      icon: "💛",
      color: "#d97706",
      bg: "rgba(217,119,6,0.12)",
      border: "rgba(217,119,6,0.25)",
      desc: "Slow strokes across them",
    },
    {
      label: "Clicks",
      value: stats.clickCount,
      icon: "🖱️",
      color: "#059669",
      bg: "rgba(5,150,105,0.12)",
      border: "rgba(5,150,105,0.25)",
      desc: "Times you clicked them",
    },
    {
      label: "Total Interactions",
      value: stats.totalInteractionCount,
      icon: "✨",
      color: "#6366f1",
      bg: "rgba(99,102,241,0.12)",
      border: "rgba(99,102,241,0.25)",
      desc: "Everything combined",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Statistics</h1>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}>
          Your story with{" "}
          <span style={{ color: "#818cf8" }}>{activeCompanion.name}</span>
          {stats.lastInteractedAt && (
            <> · Last interaction: {formatRelative(stats.lastInteractedAt)}</>
          )}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 14,
        }}
      >
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{
              background: card.bg,
              border: `1px solid ${card.border}`,
              borderRadius: 14,
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22 }}>{card.icon}</span>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{card.label}</span>
            </div>
            <span
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: card.color,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {card.value.toLocaleString()}
            </span>
            <span style={{ fontSize: 11, color: "#475569" }}>{card.desc}</span>
          </motion.div>
        ))}
      </div>

      {/* Relationship level */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", margin: 0 }}>
          Bond Level
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 28 }}>{getBondEmoji(stats.totalInteractionCount)}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
                {getBondLabel(stats.totalInteractionCount)}
              </span>
              <span style={{ fontSize: 11, color: "#64748b" }}>
                {stats.totalInteractionCount} / {getNextMilestone(stats.totalInteractionCount)} interactions
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${getBondProgress(stats.totalInteractionCount)}%`,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #6366f1, #a78bfa)",
                  borderRadius: 3,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MILESTONES = [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
const BOND_LABELS = [
  "Just Met",
  "Acquaintance",
  "Friendly",
  "Good Friends",
  "Close Friends",
  "Best Friends",
  "Inseparable",
  "Soulmates",
  "Legendary Bond",
];
const BOND_EMOJIS = ["🌱", "🌿", "🌸", "⭐", "💫", "💛", "🌟", "🔮", "✨"];

function getBondIndex(count: number): number {
  for (let i = 0; i < MILESTONES.length; i++) {
    if (count < MILESTONES[i]) return i;
  }
  return MILESTONES.length;
}

function getBondLabel(count: number) {
  return BOND_LABELS[Math.min(getBondIndex(count), BOND_LABELS.length - 1)];
}
function getBondEmoji(count: number) {
  return BOND_EMOJIS[Math.min(getBondIndex(count), BOND_EMOJIS.length - 1)];
}
function getNextMilestone(count: number) {
  for (const m of MILESTONES) if (count < m) return m;
  return count + 1000;
}
function getBondProgress(count: number) {
  const idx = getBondIndex(count);
  const prev = idx === 0 ? 0 : MILESTONES[idx - 1];
  const next = getNextMilestone(count);
  return Math.min(100, ((count - prev) / (next - prev)) * 100);
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(iso).toLocaleDateString();
}
