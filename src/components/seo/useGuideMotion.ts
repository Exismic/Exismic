"use client";

import { useReducedMotion } from "framer-motion";

// Text is visible in SSR and before intersection observers run. Viewport entry
// adds movement only; it never controls whether the content can be read.
export function useGuideMotion() {
  const reducedMotion = useReducedMotion();
  return {
    reducedMotion,
    reveal: (distance: number) => ({
      initial: false as const,
      whileInView: { y: reducedMotion ? 0 : [distance, 0] },
    }),
  };
}
