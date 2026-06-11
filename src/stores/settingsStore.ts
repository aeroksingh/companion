import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export type CompanionSize = "small" | "medium" | "large";
export type AnimationSpeed = "slow" | "normal" | "fast";
export type Opacity = 80 | 90 | 100;

interface Settings {
  companionSize: CompanionSize;
  opacity: Opacity;
  animationSpeed: AnimationSpeed;
  idleTimeoutSec: number;
  sleepTimeoutSec: number;
  autostartEnabled: boolean;
  firstLaunchDone: boolean;
}

interface SettingsStore extends Settings {
  isLoading: boolean;
  load: () => Promise<void>;
  update: (patch: Partial<Settings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  companionSize: "medium",
  opacity: 100,
  animationSpeed: "normal",
  idleTimeoutSec: 300,
  sleepTimeoutSec: 600,
  autostartEnabled: true,
  firstLaunchDone: false,
  isLoading: false,

  load: async () => {
    set({ isLoading: true });
    try {
      const raw = await invoke<Record<string, string>>("get_settings");
      set({
        companionSize: (raw["companion_size"] as CompanionSize) ?? "medium",
        opacity: (Number(raw["opacity"]) as Opacity) ?? 100,
        animationSpeed: (raw["animation_speed"] as AnimationSpeed) ?? "normal",
        idleTimeoutSec: Number(raw["idle_timeout_sec"]) || 300,
        sleepTimeoutSec: Number(raw["sleep_timeout_sec"]) || 600,
        autostartEnabled: raw["autostart_enabled"] === "true",
        firstLaunchDone: raw["first_launch_done"] === "true",
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  update: async (patch) => {
    set(patch as Partial<SettingsStore>);
    const normalized: Record<string, string> = {};
    if (patch.companionSize) normalized["companion_size"] = patch.companionSize;
    if (patch.opacity !== undefined) normalized["opacity"] = String(patch.opacity);
    if (patch.animationSpeed) normalized["animation_speed"] = patch.animationSpeed;
    if (patch.idleTimeoutSec !== undefined) normalized["idle_timeout_sec"] = String(patch.idleTimeoutSec);
    if (patch.sleepTimeoutSec !== undefined) normalized["sleep_timeout_sec"] = String(patch.sleepTimeoutSec);
    if (patch.autostartEnabled !== undefined) normalized["autostart_enabled"] = String(patch.autostartEnabled);
    await invoke("update_settings", { settings: normalized });

    // Sync overlay size if changed
    if (patch.companionSize) {
      await invoke("resize_overlay_for_size", { size: patch.companionSize }).catch(() => {});
    }
  },
}));
