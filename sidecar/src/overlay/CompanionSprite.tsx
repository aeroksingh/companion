import { useEffect, useRef } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { SpriteAnimator } from "./SpriteAnimator";
import { Companion } from "../stores/companionStore";
import { CompanionState } from "../stores/overlayStore";
import { useSettingsStore } from "../stores/settingsStore";
import { SIZE_MAP } from "../lib/constants";

interface Props {
  companion: Companion;
  state: CompanionState;
}

export function CompanionSprite({ companion, state }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animatorRef = useRef<SpriteAnimator | null>(null);
  const { animationSpeed, opacity, companionSize } = useSettingsStore();

  const displaySize = SIZE_MAP[companionSize];

  useEffect(() => {
    if (!canvasRef.current) return;

    const animator = new SpriteAnimator(
      canvasRef.current,
      companion.spriteWidth,
      companion.spriteHeight,
      companion.frameCount
    );
    animatorRef.current = animator;

    // Convert file path to Tauri asset URL
    let src: string;
    if (companion.sourceType === "builtin") {
      src = `/sprites/${companion.builtinKey}/sprite.png`;
    } else {
      src = convertFileSrc(companion.spritePath);
    }

    animator.setSpeed(animationSpeed);
    animator.setOpacity(opacity);

    animator
      .loadSprite(src)
      .then(() => {
        animator.setState(state);
        animator.start();
      })
      .catch((e) => console.error("Sprite load error:", e));

    return () => animator.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companion.id, companion.spritePath]);

  useEffect(() => {
    animatorRef.current?.setState(state);
  }, [state]);

  useEffect(() => {
    animatorRef.current?.setSpeed(animationSpeed);
  }, [animationSpeed]);

  useEffect(() => {
    animatorRef.current?.setOpacity(opacity);
  }, [opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="pixel-art no-interact"
      style={{
        display: "block",
        width: displaySize,
        height: displaySize,
        imageRendering: "pixelated",
      }}
    />
  );
}
