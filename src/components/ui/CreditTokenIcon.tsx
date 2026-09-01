"use client";

import React from "react";
import { ExismicMark } from "./ExismicLogo";
import { cn } from "@/lib/utils";

export interface CreditTokenIconProps {
  size?: "sm" | "md" | "lg" | number;
  className?: string;
  theme?: "default" | "blue" | "purple" | "gold";
  animated?: boolean;
}

export function CreditTokenIcon({
  size = "sm",
  className,
  theme = "blue",
  animated = true,
}: CreditTokenIconProps) {
  const pixelSize =
    typeof size === "number"
      ? size
      : size === "lg"
        ? 30
        : size === "md"
          ? 25
          : 21;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center shrink-0 transition-transform duration-300 group-hover/vault:scale-110 select-none",
        className
      )}
      aria-hidden="true"
    >
      <ExismicMark
        size={pixelSize}
        letter="C"
        theme={theme}
        animated={animated}
      />
    </div>
  );
}


