import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WelcomeStep } from "./WelcomeStep";
import { SourceStep } from "./SourceStep";
import { BuiltinPickerStep } from "./BuiltinPickerStep";
import { UploadStep } from "./UploadStep";
import { ProcessingStep } from "./ProcessingStep";
import { NameStep } from "./NameStep";

export type OnboardingStep =
  | "welcome"
  | "source"
  | "builtin"
  | "upload"
  | "processing"
  | "name";

export interface OnboardingState {
  step: OnboardingStep;
  sourceType: "builtin" | "uploaded" | null;
  builtinKey: string | null;
  uploadedImagePath: string | null;
  processedSpritePath: string | null;
  spriteWidth: number;
  spriteHeight: number;
  frameCount: number;
}

const pageVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export function OnboardingApp() {
  const [state, setState] = useState<OnboardingState>({
    step: "welcome",
    sourceType: null,
    builtinKey: null,
    uploadedImagePath: null,
    processedSpritePath: null,
    spriteWidth: 96,
    spriteHeight: 96,
    frameCount: 4,
  });

  const go = (step: OnboardingStep, patch?: Partial<OnboardingState>) => {
    setState((s) => ({ ...s, ...patch, step }));
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Pixel decoration dots */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.06 }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 4,
              height: 4,
              background: "#818cf8",
              left: `${(i * 137.5) % 100}%`,
              top: `${(i * 97.3) % 100}%`,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={state.step}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.22 }}
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          {state.step === "welcome" && (
            <WelcomeStep onNext={() => go("source")} />
          )}
          {state.step === "source" && (
            <SourceStep
              onBuiltin={() => go("builtin", { sourceType: "builtin" })}
              onUpload={() => go("upload", { sourceType: "uploaded" })}
            />
          )}
          {state.step === "builtin" && (
            <BuiltinPickerStep
              onSelect={(key) =>
                go("name", {
                  builtinKey: key,
                  processedSpritePath: `/sprites/${key}/sprite.png`,
                })
              }
              onBack={() => go("source")}
            />
          )}
          {state.step === "upload" && (
            <UploadStep
              onFileSelected={(path) =>
                go("processing", { uploadedImagePath: path })
              }
              onBack={() => go("source")}
            />
          )}
          {state.step === "processing" && state.uploadedImagePath && (
            <ProcessingStep
              imagePath={state.uploadedImagePath}
              onComplete={(spritePath, w, h, frames) =>
                go("name", {
                  processedSpritePath: spritePath,
                  spriteWidth: w,
                  spriteHeight: h,
                  frameCount: frames,
                })
              }
              onError={() => go("upload")}
            />
          )}
          {state.step === "name" && (
            <NameStep
              onboardingState={state}
              onBack={() =>
                go(state.sourceType === "builtin" ? "builtin" : "upload")
              }
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
