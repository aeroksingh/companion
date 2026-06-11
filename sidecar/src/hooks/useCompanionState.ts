import { useEffect } from "react";
import { useOverlayStore, CompanionState } from "../stores/overlayStore";
import { useTauriEvent } from "./useTauriEvent";

export function useCompanionState() {
  const { companionState, setCompanionState } = useOverlayStore();

  // Listen to FSM state changes from Rust
  useTauriEvent<CompanionState>("fsm_state_change", (state) => {
    setCompanionState(state);
  });

  return { companionState, setCompanionState };
}
