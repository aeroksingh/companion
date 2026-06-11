import { useEffect, useState } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

// Lazy load each window's root to keep bundles separate
import { OverlayApp } from "./overlay/OverlayApp";
import { CenterApp } from "./center/CenterApp";
import { OnboardingApp } from "./onboarding/OnboardingApp";

type WindowLabel = "overlay" | "center" | "onboarding";

export default function App() {
  const [windowLabel, setWindowLabel] = useState<WindowLabel | null>(null);

  useEffect(() => {
    getCurrentWebviewWindow()
      .label
      .then((label) => setWindowLabel(label as WindowLabel))
      .catch(() => setWindowLabel("overlay"));
  }, []);

  // Also detect via window label synchronously if possible
  useEffect(() => {
    try {
      const win = getCurrentWebviewWindow();
      setWindowLabel(win.label as WindowLabel);
    } catch {
      // fallback
    }
  }, []);

  if (!windowLabel) return null;

  if (windowLabel === "overlay") {
    document.body.classList.add("overlay-window");
    return <OverlayApp />;
  }

  if (windowLabel === "center") {
    return <CenterApp />;
  }

  if (windowLabel === "onboarding") {
    return <OnboardingApp />;
  }

  return null;
}
