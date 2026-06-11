import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOverlayStore } from "../stores/overlayStore";
import { useCompanionStore } from "../stores/companionStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useCompanionState } from "../hooks/useCompanionState";
import { useTauriEvent } from "../hooks/useTauriEvent";
import { DragController } from "./DragController";
import { InteractionLayer } from "./InteractionLayer";
import { CompanionSprite } from "./CompanionSprite";
import { ParticleLayer } from "./ParticleLayer";

export function OverlayApp() {
  const { loadPosition, isGhosted, setGhosted } = useOverlayStore();
  const { load: loadCompanions, activeCompanion } = useCompanionStore();
  const { load: loadSettings } = useSettingsStore();
  const { companionState } = useCompanionState();

  // Load everything on mount
  useEffect(() => {
    loadPosition();
    loadCompanions();
    loadSettings();
  }, []);

  // Companion changed from Center window
  useTauriEvent("companion_changed", () => {
    loadCompanions();
  });

  // Ghost overlay when Companion Center opens
  useTauriEvent<boolean>("overlay_ghost", (ghosted) => {
    setGhosted(ghosted);
  });

  if (!activeCompanion) return null;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
      }}
    >
      <AnimatePresence>
        <motion.div
          key="companion"
          animate={{
            opacity: isGhosted ? 0.25 : 1,
            scale: isGhosted ? 0.85 : 1,
            filter: isGhosted ? "blur(1px) grayscale(0.5)" : "none",
          }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          style={{ position: "relative" }}
        >
          <DragController>
            <InteractionLayer>
              <CompanionSprite
                companion={activeCompanion}
                state={companionState}
              />
              <ParticleLayer state={companionState} />
            </InteractionLayer>
          </DragController>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
