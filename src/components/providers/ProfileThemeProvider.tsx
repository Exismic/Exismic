"use client";

import { useEffect } from "react";

const LEGACY_THEMES = [
  "theme-cyber-pulse",
  "theme-luxury-void",
  "theme-cosmic-nebula",
  "theme-neon-shadow",
  "theme-royal-eclipse",
  "theme-minimal-frost",
  "theme-hologram-synth",
  "theme-blood-inferno",
  "theme-tokyo-sakura",
  "theme-solar-flare",
  "theme-abyssal-singularity",
  "theme-cyber-matrix",
];

export function ProfileThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove(...LEGACY_THEMES);
      document.body.classList.remove(...LEGACY_THEMES);
    }
  }, []);

  return <>{children}</>;
}
