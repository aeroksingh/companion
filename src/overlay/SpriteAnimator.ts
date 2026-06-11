import { CompanionState } from "../stores/overlayStore";
import { AnimationSpeed } from "../stores/settingsStore";
import { FPS_MAP, STATE_ROW_MAP } from "../lib/constants";

export class SpriteAnimator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private image: HTMLImageElement | null = null;
  private frameWidth: number;
  private frameHeight: number;
  private frameCount: number;
  private currentFrame = 0;
  private currentState: CompanionState = "idle";
  private speed: AnimationSpeed = "normal";
  private opacity = 1;
  private lastFrameTime = 0;
  private rafId = 0;
  private isRunning = false;

  constructor(
    canvas: HTMLCanvasElement,
    frameWidth: number,
    frameHeight: number,
    frameCount: number
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameCount = frameCount;
    this.canvas.width = frameWidth;
    this.canvas.height = frameHeight;
    this.ctx.imageSmoothingEnabled = false;
  }

  async loadSprite(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.image = img;
        resolve();
      };
      img.onerror = () => reject(new Error(`Failed to load sprite: ${src}`));
    });
  }

  setState(state: CompanionState) {
    if (state === this.currentState) return;
    this.currentState = state;
    this.currentFrame = 0;
  }

  setSpeed(speed: AnimationSpeed) {
    this.speed = speed;
  }

  setOpacity(opacity: number) {
    this.opacity = opacity / 100;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    const tick = (timestamp: number) => {
      if (!this.isRunning) return;
      this.rafId = requestAnimationFrame(tick);

      const fps = FPS_MAP[this.speed];
      const frameDuration = 1000 / fps;
      if (timestamp - this.lastFrameTime < frameDuration) return;

      this.lastFrameTime = timestamp;
      this.draw();
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
    };

    this.rafId = requestAnimationFrame(tick);
  }

  stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.rafId);
  }

  private draw() {
    if (!this.image) return;

    const row = STATE_ROW_MAP[this.currentState];
    const sx = this.currentFrame * this.frameWidth;
    const sy = row * this.frameHeight;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalAlpha = this.opacity;
    this.ctx.drawImage(
      this.image,
      sx, sy, this.frameWidth, this.frameHeight,
      0, 0, this.frameWidth, this.frameHeight
    );
    this.ctx.globalAlpha = 1;
  }
}
