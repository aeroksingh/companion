import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface Stats {
  hoverCount: number;
  petCount: number;
  clickCount: number;
  doubleClickCount: number;
  totalInteractionCount: number;
  lastInteractedAt: string | null;
}

interface StatsStore {
  stats: Stats | null;
  load: (companionId: string) => Promise<void>;
  increment: (field: keyof Omit<Stats, "lastInteractedAt">, companionId: string) => Promise<void>;
}

const FIELD_MAP: Record<string, string> = {
  hoverCount: "hover_count",
  petCount: "pet_count",
  clickCount: "click_count",
  doubleClickCount: "double_click_count",
  totalInteractionCount: "total_interaction_count",
};

export const useStatsStore = create<StatsStore>((set) => ({
  stats: null,

  load: async (companionId) => {
    try {
      const stats = await invoke<Stats>("get_stats", { companionId });
      set({ stats });
    } catch {
      set({ stats: null });
    }
  },

  increment: async (field, companionId) => {
    const rustField = FIELD_MAP[field];
    if (!rustField) return;

    // Optimistic update
    set((state) =>
      state.stats
        ? { stats: { ...state.stats, [field]: (state.stats[field] as number) + 1 } }
        : state
    );

    try {
      await invoke("increment_stat", { companionId, field: rustField });
    } catch {
      // silent - stat loss acceptable
    }
  },
}));
