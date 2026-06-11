export const SIZE_MAP = {
  small: 64,
  medium: 96,
  large: 128,
} as const;

export const FPS_MAP = {
  slow: 8,
  normal: 13,
  fast: 18,
} as const;

export const STATE_ROW_MAP = {
  idle: 0,
  happy: 1,
  sleeping: 2,
  curious: 3,
  hover: 0,
} as const;

// Built-in companion definitions
export const BUILTIN_COMPANIONS = [
  { key: "person_1", name: "Alex", description: "Friendly person companion" },
  { key: "person_2", name: "Sam", description: "Chill pixel buddy" },
  { key: "dog", name: "Buddy", description: "Loyal dog companion" },
  { key: "cat", name: "Pixel", description: "Cool cat companion" },
  { key: "rabbit", name: "Mochi", description: "Sweet rabbit companion" },
  { key: "fox", name: "Kuma", description: "Clever fox companion" },
] as const;

export const PET_SPEED_THRESHOLD = 4; // px/frame for petting detection
export const DOUBLE_CLICK_MS = 300;
export const CURIOUS_RADIUS = 150; // px proximity
