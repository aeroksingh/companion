import { useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useOverlayStore } from "../stores/overlayStore";
import { useStatsStore } from "../stores/statsStore";
import { useCompanionStore } from "../stores/companionStore";
import { PET_SPEED_THRESHOLD, DOUBLE_CLICK_MS } from "../lib/constants";

interface Props {
  children: React.ReactNode;
}

export function InteractionLayer({ children }: Props) {
  const { setCompanionState } = useOverlayStore();
  const { increment } = useStatsStore();
  const { activeCompanion } = useCompanionStore();

  const lastClickTime = useRef(0);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const petProgress = useRef(0);

  const cid = activeCompanion?.id ?? "";

  const onMouseEnter = useCallback(async () => {
    await invoke("enable_click_capture").catch(() => {});
    setCompanionState("hover");
    increment("hoverCount", cid);
  }, [cid]);

  const onMouseLeave = useCallback(async () => {
    await invoke("disable_click_capture").catch(() => {});
    setCompanionState("idle");
    petProgress.current = 0;
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      if (speed < PET_SPEED_THRESHOLD) {
        petProgress.current += 1;
        if (petProgress.current > 12) {
          setCompanionState("happy");
          increment("petCount", cid);
          increment("totalInteractionCount", cid);
          petProgress.current = 0;
        }
      } else {
        petProgress.current = 0;
      }
    },
    [cid]
  );

  const onClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const now = Date.now();

      if (now - lastClickTime.current < DOUBLE_CLICK_MS) {
        // Double click → open center
        lastClickTime.current = 0;
        increment("doubleClickCount", cid);
        increment("totalInteractionCount", cid);
        await invoke("open_companion_center").catch(() => {});
      } else {
        lastClickTime.current = now;
        // Wait briefly to distinguish from double click
        setTimeout(() => {
          if (Date.now() - lastClickTime.current >= DOUBLE_CLICK_MS - 10) {
            setCompanionState("happy");
            increment("clickCount", cid);
            increment("totalInteractionCount", cid);
          }
        }, DOUBLE_CLICK_MS);
      }
    },
    [cid]
  );

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      onClick={onClick}
      style={{
        position: "relative",
        cursor: "pointer",
        display: "inline-block",
      }}
    >
      {children}
    </div>
  );
}
