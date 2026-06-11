import { useSettingsStore, CompanionSize, AnimationSpeed, Opacity } from "../../stores/settingsStore";

export function Appearance() {
  const { companionSize, opacity, animationSpeed, update } = useSettingsStore();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Appearance</h1>

      <Section title="Size">
        <ToggleGroup
          options={[
            { value: "small", label: "Small", sub: "64px" },
            { value: "medium", label: "Medium", sub: "96px" },
            { value: "large", label: "Large", sub: "128px" },
          ]}
          value={companionSize}
          onChange={(v) => update({ companionSize: v as CompanionSize })}
        />
      </Section>

      <Section title="Opacity">
        <ToggleGroup
          options={[
            { value: "80",  label: "80%",  sub: "Subtle" },
            { value: "90",  label: "90%",  sub: "Soft" },
            { value: "100", label: "100%", sub: "Full" },
          ]}
          value={String(opacity)}
          onChange={(v) => update({ opacity: Number(v) as Opacity })}
        />
      </Section>

      <Section title="Animation Speed">
        <ToggleGroup
          options={[
            { value: "slow",   label: "Slow",   sub: "8fps" },
            { value: "normal", label: "Normal", sub: "13fps" },
            { value: "fast",   label: "Fast",   sub: "18fps" },
          ]}
          value={animationSpeed}
          onChange={(v) => update({ animationSpeed: v as AnimationSpeed })}
        />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <h3 style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", margin: 0 }}>{title}</h3>
      {children}
    </div>
  );
}

function ToggleGroup({
  options, value, onChange,
}: {
  options: { value: string; label: string; sub: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1,
            padding: "12px 8px",
            borderRadius: 10,
            border: value === opt.value
              ? "2px solid #6366f1"
              : "2px solid rgba(255,255,255,0.08)",
            background: value === opt.value
              ? "rgba(99,102,241,0.15)"
              : "rgba(255,255,255,0.03)",
            color: value === opt.value ? "#818cf8" : "#64748b",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            transition: "all 0.15s",
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 14 }}>{opt.label}</span>
          <span style={{ fontSize: 11 }}>{opt.sub}</span>
        </button>
      ))}
    </div>
  );
}
