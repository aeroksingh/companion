import { useEffect, useState } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { OverlayApp } from "./overlay/OverlayApp";
import { CenterApp } from "./center/CenterApp";
import { OnboardingApp } from "./onboarding/OnboardingApp";

type WindowLabel = "overlay" | "center" | "onboarding";

export default function App() {
  const [windowLabel, setWindowLabel] = useState<WindowLabel>("overlay");

  useEffect(() => {
    try {
      const win = getCurrentWebviewWindow();
      // label is a string property, not a promise
      setWindowLabel(win.label as WindowLabel);
    } catch {
      setWindowLabel("overlay");
    }
  }, []);

  if (windowLabel === "overlay") {
    document.body.classList.add("overlay-window");
    return <OverlayApp />;
  }
  if (windowLabel === "center") return <CenterApp />;
  if (windowLabel === "onboarding") return <OnboardingApp />;
  return null;
}
