import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export type CompanionState = "idle" | "happy" | "sleeping" | "curious" | "hover";

interface OverlayStore {
  x: number;
  y: number;
  isVisible: boolean;
  isGhosted: boolean;
  companionState: CompanionState;
  isDragging: boolean;

  loadPosition: () => Promise<void>;
  savePosition: (x: number, y: number) => Promise<void>;
  setVisible: (v: boolean) => Promise<void>;
  setGhosted: (g: boolean) => void;
  setCompanionState: (s: CompanionState) => void;
  setDragging: (d: boolean) => void;
}

export const useOverlayStore = create<OverlayStore>((set) => ({
  x: 100,
  y: 100,
  isVisible: true,
  isGhosted: false,
  companionState: "idle",
  isDragging: false,

  loadPosition: async () => {
    try {
      const pos = await invoke<{ posX: number; posY: number; isVisible: boolean }>(
        "get_overlay_state"
      );
      set({ x: pos.posX, y: pos.posY, isVisible: pos.isVisible });
    } catch {}
  },

  savePosition: async (x, y) => {
    set({ x, y });
    try {
      await invoke("save_overlay_position", { x, y });
    } catch {}
  },

  setVisible: async (v) => {
    set({ isVisible: v });
    try {
      await invoke("set_overlay_visible", { visible: v });
    } catch {}
  },

  setGhosted: (g) => set({ isGhosted: g }),
  setCompanionState: (s) => set({ companionState: s }),
  setDragging: (d) => set({ isDragging: d }),
}));
