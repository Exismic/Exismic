"use client";

import React, { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SpecularButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  className?: string;
  children: React.ReactNode;
  highlightColor?: string;
  edgeColor?: string;
  tintColor?: string;
  borderRadius?: string;
  intensity?: number;
  innerClassName?: string;
}

export function SpecularButton({
  href,
  className,
  innerClassName,
  children,
  highlightColor = "rgba(255, 255, 255, 0.8)",
  edgeColor = "rgba(255, 255, 255, 0.12)",
  tintColor = "rgba(255, 255, 255, 0.08)",
  borderRadius = "9999px",
  intensity = 1,
  ...props
}: SpecularButtonProps) {
  const buttonRef = useRef<HTMLElement | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y, opacity: 1 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  const Component = href ? Link : "button";

  return (
    <Component
      ref={buttonRef as any}
      href={href as string}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        borderRadius,
        ...({
          "--specular-x": `${mousePos.x}%`,
          "--specular-y": `${mousePos.y}%`,
          "--specular-opacity": mousePos.opacity * intensity,
        } as React.CSSProperties),
      }}
      className={cn(
        "group/specular relative inline-flex items-center justify-center p-[1px] select-none isolate overflow-hidden transition-all duration-300 active:scale-[0.98]",
        className
      )}
      {...(props as any)}
    >
      {/* 1. Base Dark Edge Rim */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          background: edgeColor,
        }}
      />

      {/* 2. Dynamic Specular Rim Light Follower */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300"
        style={{
          opacity: "var(--specular-opacity)",
          background: `radial-gradient(110px circle at var(--specular-x) var(--specular-y), ${highlightColor} 0%, rgba(255,255,255,0.3) 35%, transparent 70%)`,
        }}
      />

      {/* 3. Inner Specular Glass Body */}
      <span
        className={cn(
          "relative z-10 flex h-full w-full items-center justify-center rounded-[inherit] px-3.5 py-1.5 transition-all duration-300",
          innerClassName
        )}
        style={{
          backgroundColor: "#07080f",
          backgroundImage: `
            radial-gradient(130px circle at var(--specular-x) var(--specular-y), ${tintColor} 0%, transparent 70%),
            linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.01))
          `,
          boxShadow: `
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.16),
            inset 0 -1px 1px 0 rgba(0, 0, 0, 0.6),
            0 4px 16px 0 rgba(0, 0, 0, 0.5)
          `,
        }}
      >
        {children}
      </span>
    </Component>
  );
}
