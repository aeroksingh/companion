import { useSettingsStore } from "../../stores/settingsStore";
import { invoke } from "@tauri-apps/api/core";

export function BehaviorPage() {
  const {
    idleTimeoutSec,
    sleepTimeoutSec,
    autostartEnabled,
    update,
  } = useSettingsStore();

  const handleAutostart = async (enabled: boolean) => {
    await update({ autostartEnabled: enabled });
    await invoke("toggle_autostart", { enable: enabled }).catch(() => {});
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Behavior</h1>

      <Card title="Idle Timeout" desc="How long before your companion sits down and looks bored">
        <SliderRow
          value={idleTimeoutSec}
          min={30}
          max={600}
          step={30}
          format={(v) => `${Math.round(v / 60)} min`}
          onChange={(v) => update({ idleTimeoutSec: v })}
        />
      </Card>

      <Card title="Sleep Timeout" desc="How long before your companion falls asleep">
        <SliderRow
          value={sleepTimeoutSec}
          min={120}
          max={3600}
          step={60}
          format={(v) => `${Math.round(v / 60)} min`}
          onChange={(v) => update({ sleepTimeoutSec: v })}
        />
      </Card>

      <Card title="Launch at Startup" desc="Start Companion automatically when Windows boots">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "#94a3b8" }}>
            {autostartEnabled ? "Enabled — starts with Windows" : "Disabled"}
          </span>
          <Toggle value={autostartEnabled} onChange={handleAutostart} />
        </div>
      </Card>
    </div>
  );
}

function Card({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
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
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", margin: 0 }}>{title}</h3>
        <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{desc}</p>
      </div>
      {children}
    </div>
  );
}

function SliderRow({
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          flex: 1,
          accentColor: "#6366f1",
          cursor: "pointer",
        }}
      />
      <span
        style={{
          minWidth: 52,
          textAlign: "right",
          fontSize: 13,
          fontWeight: 600,
          color: "#818cf8",
        }}
      >
        {format(value)}
      </span>
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 46,
        height: 26,
        borderRadius: 999,
        background: value ? "#6366f1" : "rgba(255,255,255,0.1)",
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: value ? 23 : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }}
      />
    </button>
  );
}
