import { useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useOverlayStore } from "../stores/overlayStore";

interface Props {
  children: React.ReactNode;
}

export function DragController({ children }: Props) {
  const { setDragging, savePosition } = useOverlayStore();

  const onMouseDown = useCallback(
    async (e: React.MouseEvent) => {
      if (e.button !== 0) return;

      setDragging(true);

      // Use Tauri's native dragging
      await invoke("start_drag_window").catch(() => {});

      // After dragging ends, get and save the new position
      const handleMouseUp = async () => {
        setDragging(false);
        window.removeEventListener("mouseup", handleMouseUp);

        try {
          const [x, y] = await invoke<[number, number]>("get_window_position");
          await savePosition(x, y);
        } catch {}
      };

      window.addEventListener("mouseup", handleMouseUp);
    },
    [setDragging, savePosition]
  );

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
}
