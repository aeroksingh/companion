import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface Companion {
  id: string;
  name: string;
  sourceType: "builtin" | "uploaded";
  builtinKey?: string;
  spritePath: string;
  spriteWidth: number;
  spriteHeight: number;
  frameCount: number;
  rowIdle: number;
  rowHappy: number;
  rowSleeping: number;
  rowCurious: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCompanionArgs {
  name: string;
  sourceType: "builtin" | "uploaded";
  builtinKey?: string;
  spritePath: string;
  spriteWidth?: number;
  spriteHeight?: number;
  frameCount?: number;
}

interface CompanionStore {
  companions: Companion[];
  activeCompanion: Companion | null;
  isLoading: boolean;
  error: string | null;

  load: () => Promise<void>;
  setActive: (id: string) => Promise<void>;
  delete: (id: string) => Promise<void>;
  rename: (id: string, name: string) => Promise<void>;
  create: (args: CreateCompanionArgs) => Promise<Companion>;
}

export const useCompanionStore = create<CompanionStore>((set, get) => ({
  companions: [],
  activeCompanion: null,
  isLoading: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const companions = await invoke<Companion[]>("get_companions");
      set({
        companions,
        activeCompanion: companions.find((c) => c.isActive) ?? null,
        isLoading: false,
      });
    } catch (e) {
      set({ isLoading: false, error: String(e) });
    }
  },

  setActive: async (id) => {
    await invoke("set_active_companion", { id });
    await get().load();
    await invoke("finish_onboarding").catch(() => {}); // no-op if not in onboarding
  },

  delete: async (id) => {
    await invoke("delete_companion", { id });
    await get().load();
  },

  rename: async (id, name) => {
    await invoke("rename_companion", { id, name });
    await get().load();
  },

  create: async (args) => {
    const companion = await invoke<Companion>("create_companion", { args });
    await get().load();
    return companion;
  },
}));
