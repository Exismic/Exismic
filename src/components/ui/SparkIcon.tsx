"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";

export interface SparkIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  variant?: "amber" | "cyan" | "purple" | "prismatic";
  animated?: boolean;
}

/**
 * Exismic Sparks Currency Icon (⚡)
 * A completely bespoke, handcrafted quantum starburst energy crystal.
 * Engineered with 3D faceted diamond planes, specular light reflections,
 * and orbital plasma particles. Distinct, proprietary, and never an emoji.
 */
export const SparkIcon: React.FC<SparkIconProps> = ({
  size = 18,
  className,
  variant = "amber",
  animated = false,
  ...props
}) => {
  const rawId = useId();
  const id = rawId.replace(/:/g, "");

  const getGradientColors = () => {
    switch (variant) {
      case "cyan":
        return {
          primary1: "#67e8f9",
          primary2: "#06b6d4",
          primary3: "#0369a1",
          facetTop: "#a5f3fc",
          facetRight: "#38bdf8",
          facetBottom: "#0284c7",
          facetLeft: "#0e7490",
          core: "#ffffff",
          glow: "rgba(6, 182, 212, 0.75)",
          particle: "#67e8f9",
          ring: "rgba(34, 211, 238, 0.4)",
        };
      case "purple":
        return {
          primary1: "#f0abfc",
          primary2: "#c084fc",
          primary3: "#6b21a8",
          facetTop: "#fae8ff",
          facetRight: "#d946ef",
          facetBottom: "#9333ea",
          facetLeft: "#7e22ce",
          core: "#ffffff",
          glow: "rgba(168, 85, 247, 0.75)",
          particle: "#f0abfc",
          ring: "rgba(192, 132, 252, 0.4)",
        };
      case "prismatic":
        return {
          primary1: "#fef08a",
          primary2: "#f472b6",
          primary3: "#8b5cf6",
          facetTop: "#ffffff",
          facetRight: "#38bdf8",
          facetBottom: "#ec4899",
          facetLeft: "#a855f7",
          core: "#ffffff",
          glow: "rgba(244, 114, 182, 0.8)",
          particle: "#67e8f9",
          ring: "rgba(251, 191, 36, 0.4)",
        };
      case "amber":
      default:
        return {
          primary1: "#fffbeb",
          primary2: "#fbbf24",
          primary3: "#b45309",
          facetTop: "#fef08a",
          facetRight: "#f59e0b",
          facetBottom: "#d97706",
          facetLeft: "#92400e",
          core: "#ffffff",
          glow: "rgba(245, 158, 11, 0.75)",
          particle: "#fde047",
          ring: "rgba(251, 191, 36, 0.45)",
        };
    }
  };

  const c = getGradientColors();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "inline-block shrink-0 align-middle transition-transform duration-300",
        animated && "animate-pulse hover:scale-115 hover:rotate-6",
        className
      )}
      style={{
        filter: `drop-shadow(0 0 ${Math.max(2.5, Math.round(size / 5.5))}px ${c.glow})`,
      }}
      {...props}
    >
      <defs>
        {/* Main Radiant Flare Gradient */}
        <linearGradient id={`spark-main-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.primary1} />
          <stop offset="45%" stopColor={c.primary2} />
          <stop offset="100%" stopColor={c.primary3} />
        </linearGradient>

        {/* Diagonal Light Sweep Gradient */}
        <linearGradient id={`spark-sweep-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Facet Reflection Gradients for 3D Cut Precision */}
        <linearGradient id={`spark-facet-top-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor={c.facetTop} />
        </linearGradient>

        <linearGradient id={`spark-facet-right-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.facetRight} />
          <stop offset="100%" stopColor={c.primary3} />
        </linearGradient>

        <linearGradient id={`spark-facet-bottom-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.facetBottom} />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
        </linearGradient>

        <linearGradient id={`spark-facet-left-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.facetTop} />
          <stop offset="100%" stopColor={c.facetLeft} />
        </linearGradient>

        {/* Ambient Ring Glow */}
        <radialGradient id={`spark-ring-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor={c.ring} stopOpacity="0.4" />
          <stop offset="100%" stopColor={c.ring} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 0. Ambient Micro-Corona Ring */}
      <circle cx="12" cy="12" r="9.5" fill={`url(#spark-ring-${id})`} />

      {/* 1. Secondary 45° Micro-Flares (Subtle 8-pointed aura) */}
      <polygon
        points="12,4 14.2,9.8 20,12 14.2,14.2 12,20 9.8,14.2 4,12 9.8,9.8"
        fill={c.primary3}
        opacity="0.4"
      />

      {/* 2. Primary 4-Pointed Hyperboloid Plasma Star (Signature Silhouette) */}
      <path
        d="M12 0.75C12 7.15 7.15 12 0.75 12C7.15 12 12 16.85 12 23.25C12 16.85 16.85 12 23.25 12C16.85 12 12 7.15 12 0.75Z"
        fill={`url(#spark-main-${id})`}
      />

      {/* 3. Top-Left Rim Light Highlight */}
      <path
        d="M12 0.75C12 7.15 7.15 12 0.75 12C3.8 10 9.8 4 12 0.75Z"
        fill={`url(#spark-sweep-${id})`}
        opacity="0.6"
      />

      {/* 4. Faceted Diamond Prism Core (4 physical light bevels) */}
      {/* Top-Left Bevel */}
      <polygon
        points="12,5.5 12,12 5.5,12"
        fill={`url(#spark-facet-left-${id})`}
      />
      {/* Top-Right Bevel (Brightest Glint) */}
      <polygon
        points="12,5.5 18.5,12 12,12"
        fill={`url(#spark-facet-top-${id})`}
      />
      {/* Bottom-Right Bevel */}
      <polygon
        points="12,12 18.5,12 12,18.5"
        fill={`url(#spark-facet-right-${id})`}
      />
      {/* Bottom-Left Bevel (Shadow plane) */}
      <polygon
        points="5.5,12 12,12 12,18.5"
        fill={`url(#spark-facet-bottom-${id})`}
      />

      {/* 5. Crystalline Facet Seams (Razor-sharp internal etch lines) */}
      <line x1="12" y1="5.5" x2="12" y2="18.5" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.6" />
      <line x1="5.5" y1="12" x2="18.5" y2="12" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.6" />

      {/* 6. Central Quantum Singularity (High-intensity energy node) */}
      <circle cx="12" cy="12" r="2.2" fill={c.core} />
      <circle cx="11.4" cy="11.4" r="0.8" fill="#ffffff" />

      {/* 7. Free-floating Orbital Energy Embers */}
      <circle cx="19.2" cy="4.8" r="1.1" fill={c.particle} opacity="0.95" />
      <circle cx="4.8" cy="19.2" r="0.9" fill={c.particle} opacity="0.85" />
    </svg>
  );
};

export default SparkIcon;

/**
 * Reusable Sparks Currency Badge Component
 * Displays Sparks with glowing backdrop, custom SparkIcon, and formatted number.
 */
export function SparkBadge({
  amount,
  size = "md",
  className,
  variant = "amber",
  animated = false,
  showLabel = false,
}: {
  amount: number | string;
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "amber" | "cyan" | "purple" | "prismatic";
  animated?: boolean;
  showLabel?: boolean;
}) {
  const iconSizes = {
    sm: 13,
    md: 16,
    lg: 20,
  };

  const textStyles = {
    sm: "text-[11px] font-black tracking-tight",
    md: "text-xs font-black tracking-tight",
    lg: "text-sm font-black tracking-tight",
  };

  const badgeTheme = {
    amber: "border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-600/10 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    cyan: "border-cyan-400/40 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-cyan-600/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]",
    purple: "border-purple-400/40 bg-gradient-to-r from-purple-500/15 via-fuchsia-500/10 to-purple-600/10 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]",
    prismatic: "border-fuchsia-400/40 bg-gradient-to-r from-pink-500/15 via-purple-500/10 to-amber-500/10 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.15)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-md transition-all duration-300",
        badgeTheme[variant],
        className
      )}
    >
      <SparkIcon
        size={iconSizes[size]}
        variant={variant}
        animated={animated}
        className="shrink-0"
      />
      <span className={cn(textStyles[size])}>
        {typeof amount === "number" ? amount.toLocaleString() : amount}
      </span>
      {showLabel && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">
          Sparks
        </span>
      )}
    </span>
  );
}
