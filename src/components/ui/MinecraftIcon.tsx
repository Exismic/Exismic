import React, { forwardRef } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";

export const MinecraftIcon: LucideIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, className, strokeWidth = 2, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...props}
      >
        {/* Outer Head / Block Boundary */}
        <rect x="2" y="2" width="20" height="20" rx="3.5" />
        {/* Left Eye */}
        <rect x="5.5" y="6" width="4" height="4" rx="0.5" fill="currentColor" stroke="none" />
        {/* Right Eye */}
        <rect x="14.5" y="6" width="4" height="4" rx="0.5" fill="currentColor" stroke="none" />
        {/* Iconic Minecraft Creeper Nose & Mouth */}
        <path
          d="M10 10.5h4v2.5h3v5h-3v-3h-4v3H7v-5h3v-2.5z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    );
  }
) as unknown as LucideIcon;

MinecraftIcon.displayName = "MinecraftIcon";

export default MinecraftIcon;
