// @ts-nocheck
import * as fs from "fs/promises";
import * as path from "path";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require("sharp");

export interface PipelineInput {
  inputPath: string;
  outputDir: string;
  targetSize: 64 | 96 | 128;
  companionId: string;
}

export interface PipelineOutput {
  spritePath: string;
  frameCount: number;
  spriteWidth: number;
  spriteHeight: number;
  success: boolean;
  error?: string;
}

const FRAME_COUNT = 4;
const ROW_COUNT = 4;
const PIXEL_BLOCK = 4;

export async function runPipeline(input: PipelineInput): Promise<PipelineOutput> {
  const { inputPath, outputDir, targetSize, companionId } = input;

  await fs.mkdir(outputDir, { recursive: true });

  progress("crop");
  const cropped = await cropToSquare(inputPath);

  progress("bg_remove");
  const noBg = await removeBackground(cropped);

  progress("resize");
  const resized = await sharp(noBg)
    .resize(targetSize, targetSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .toBuffer();

  progress("pixelate");
  const pixelArt = await applyPixelArt(resized, targetSize);

  progress("sprite");
  const sheetWidth = targetSize * FRAME_COUNT;
  const sheetHeight = targetSize * ROW_COUNT;
  const sheet = await assembleSheet(pixelArt, targetSize, sheetWidth, sheetHeight);

  const outputPath = path.join(outputDir, `${companionId}_sprite.png`);
  await fs.writeFile(outputPath, sheet);

  progress("done");

  return {
    spritePath: outputPath,
    frameCount: FRAME_COUNT,
    spriteWidth: targetSize,
    spriteHeight: targetSize,
    success: true,
  };
}

function progress(step: string) {
  process.stdout.write(`PROGRESS:${step}\n`);
}

async function cropToSquare(inputPath: string): Promise<Buffer> {
  const meta = await sharp(inputPath).metadata();
  const w = meta.width ?? 512;
  const h = meta.height ?? 512;
  const size = Math.min(w, h);
  const left = Math.floor((w - size) / 2);
  const top = Math.floor(Math.max(0, (h - size) * 0.25));
  return sharp(inputPath)
    .extract({ left, top, width: size, height: size })
    .toBuffer();
}

async function removeBackground(input: Buffer): Promise<Buffer> {
  try {
    const { removeBackground: removeBg } = require("@imgly/background-removal-node");
    const result = await removeBg(input);
    return Buffer.isBuffer(result) ? result : Buffer.from(result);
  } catch {
    return input;
  }
}

async function applyPixelArt(input: Buffer, size: number): Promise<Buffer> {
  const downSize = Math.max(8, Math.floor(size / PIXEL_BLOCK));
  const small = await sharp(input)
    .resize(downSize, downSize, { kernel: sharp.kernel.lanczos3 })
    .toBuffer();
  const pixelated = await sharp(small)
    .resize(size, size, { kernel: sharp.kernel.nearest })
    .toBuffer();
  return sharp(pixelated)
    .png({ colors: 32, dither: 0.7 })
    .toBuffer();
}

async function assembleSheet(
  base: Buffer,
  size: number,
  sheetW: number,
  sheetH: number
): Promise<Buffer> {
  const rows = await Promise.all([
    generateIdleFrames(base, size),
    generateHappyFrames(base, size),
    generateSleepingFrames(base, size),
    generateCuriousFrames(base, size),
  ]);

  const composites: any[] = [];

  rows.forEach((frames: Buffer[], rowIdx: number) => {
    frames.forEach((frame: Buffer, colIdx: number) => {
      composites.push({
        input: frame,
        left: colIdx * size,
        top: rowIdx * size,
      });
    });
  });

  return sharp({
    create: {
      width: sheetW,
      height: sheetH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();
}

async function generateIdleFrames(base: Buffer, size: number): Promise<Buffer[]> {
  const blink = await sharp(base).modulate({ brightness: 0.88 }).toBuffer();
  const dim = await sharp(base).modulate({ brightness: 0.94 }).toBuffer();
  return [base, blink, base, dim];
}

async function generateHappyFrames(base: Buffer, size: number): Promise<Buffer[]> {
  const bounced = await sharp(base)
    .extend({ top: 3, bottom: 0, left: 0, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extract({ left: 0, top: 3, width: size, height: size })
    .toBuffer();
  const bright = await sharp(base).modulate({ brightness: 1.08 }).toBuffer();
  const bouncedBright = await sharp(bounced).modulate({ brightness: 1.08 }).toBuffer();
  return [bright, bouncedBright, bright, bouncedBright];
}

async function generateSleepingFrames(base: Buffer, size: number): Promise<Buffer[]> {
  const asleep = await sharp(base).modulate({ brightness: 0.7, saturation: 0.4 }).toBuffer();
  const asleep2 = await sharp(base).modulate({ brightness: 0.65, saturation: 0.35 }).toBuffer();
  return [asleep, asleep2, asleep, asleep2];
}

async function generateCuriousFrames(base: Buffer, size: number): Promise<Buffer[]> {
  const tilted = await sharp(base)
    .rotate(7, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  const tilted2 = await sharp(base)
    .rotate(-4, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return [base, tilted, tilted2, tilted];
}
