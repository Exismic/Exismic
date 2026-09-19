"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  Crown,
  Coins,
  Gem,
  Gift,
  ShieldCheck,
  Trophy,
  Flame,
  Palette,
  Star,
  Wand2,
  Diamond,
  CreditCard,
  Award,
  Image as ImageIcon,
  Video,
  Music,
  Code2,
  Cpu,
  FileText,
  Layers,
  Bot,
  Mic2,
  Terminal,
} from "lucide-react";

export type FallingIconsVariant = "credits" | "dashboard";

interface FallingIconsBackgroundProps {
  variant?: FallingIconsVariant;
  showOrbs?: boolean;
  showGrid?: boolean;
  showStardust?: boolean;
  className?: string;
}

// 1. Credit Shop Icon Palette (Economy, Tokens, Vaults & Rewards)
const CREDIT_SHOP_PARTICLES = [
  { icon: Coins, color: "rgba(34, 211, 238, 0.45)", glow: "rgba(34, 211, 238, 0.35)" },
  { icon: Zap, color: "rgba(251, 191, 36, 0.45)", glow: "rgba(251, 191, 36, 0.35)" },
  { icon: Crown, color: "rgba(168, 85, 247, 0.45)", glow: "rgba(168, 85, 247, 0.35)" },
  { icon: Gem, color: "rgba(6, 182, 212, 0.45)", glow: "rgba(6, 182, 212, 0.35)" },
  { icon: Diamond, color: "rgba(217, 70, 239, 0.45)", glow: "rgba(217, 70, 239, 0.35)" },
  { icon: ShieldCheck, color: "rgba(16, 185, 129, 0.45)", glow: "rgba(16, 185, 129, 0.35)" },
  { icon: Gift, color: "rgba(244, 63, 94, 0.45)", glow: "rgba(244, 63, 94, 0.35)" },
  { icon: Sparkles, color: "rgba(245, 158, 11, 0.45)", glow: "rgba(245, 158, 11, 0.35)" },
  { icon: Flame, color: "rgba(249, 115, 22, 0.45)", glow: "rgba(249, 115, 22, 0.35)" },
  { icon: Trophy, color: "rgba(234, 179, 8, 0.45)", glow: "rgba(234, 179, 8, 0.35)" },
  { icon: CreditCard, color: "rgba(96, 165, 250, 0.45)", glow: "rgba(96, 165, 250, 0.35)" },
  { icon: Award, color: "rgba(192, 132, 252, 0.45)", glow: "rgba(192, 132, 252, 0.35)" },
];

// 2. Main Studio Dashboard Icon Palette (All 11 Creative & Productivity Suites)
const DASHBOARD_PARTICLES = [
  { icon: Wand2, color: "rgba(168, 85, 247, 0.45)", glow: "rgba(168, 85, 247, 0.35)" },
  { icon: ImageIcon, color: "rgba(34, 211, 238, 0.45)", glow: "rgba(34, 211, 238, 0.35)" },
  { icon: Video, color: "rgba(139, 92, 246, 0.45)", glow: "rgba(139, 92, 246, 0.35)" },
  { icon: Music, color: "rgba(236, 72, 153, 0.45)", glow: "rgba(236, 72, 153, 0.35)" },
  { icon: Code2, color: "rgba(132, 204, 22, 0.45)", glow: "rgba(132, 204, 22, 0.35)" },
  { icon: Cpu, color: "rgba(245, 158, 11, 0.45)", glow: "rgba(245, 158, 11, 0.35)" },
  { icon: FileText, color: "rgba(239, 68, 68, 0.45)", glow: "rgba(239, 68, 68, 0.35)" },
  { icon: Layers, color: "rgba(16, 185, 129, 0.45)", glow: "rgba(16, 185, 129, 0.35)" },
  { icon: Sparkles, color: "rgba(251, 191, 36, 0.45)", glow: "rgba(251, 191, 36, 0.35)" },
  { icon: Bot, color: "rgba(6, 182, 212, 0.45)", glow: "rgba(6, 182, 212, 0.35)" },
  { icon: Mic2, color: "rgba(244, 63, 94, 0.45)", glow: "rgba(244, 63, 94, 0.35)" },
  { icon: Terminal, color: "rgba(163, 230, 53, 0.45)", glow: "rgba(163, 230, 53, 0.35)" },
  { icon: Palette, color: "rgba(217, 70, 239, 0.45)", glow: "rgba(217, 70, 239, 0.35)" },
  { icon: Zap, color: "rgba(251, 191, 36, 0.45)", glow: "rgba(251, 191, 36, 0.35)" },
  { icon: Coins, color: "rgba(34, 211, 238, 0.45)", glow: "rgba(34, 211, 238, 0.35)" },
  { icon: Crown, color: "rgba(168, 85, 247, 0.45)", glow: "rgba(168, 85, 247, 0.35)" },
  { icon: Flame, color: "rgba(249, 115, 22, 0.45)", glow: "rgba(249, 115, 22, 0.35)" },
  { icon: Trophy, color: "rgba(234, 179, 8, 0.45)", glow: "rgba(234, 179, 8, 0.35)" },
  { icon: Star, color: "rgba(253, 224, 71, 0.45)", glow: "rgba(253, 224, 71, 0.35)" },
];

export const FallingIconsBackground: React.FC<FallingIconsBackgroundProps> = ({
  variant = "dashboard",
  showOrbs = true,
  showGrid = true,
  showStardust = true,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  useEffect(() => {
    const updateDeviceInfo = () => {
      setIsMobile(window.innerWidth < 768);
      setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    };
    updateDeviceInfo();
    window.addEventListener("resize", updateDeviceInfo);
    return () => window.removeEventListener("resize", updateDeviceInfo);
  }, []);

  // Deterministic particle set based on active variant
  const particleSet = variant === "credits" ? CREDIT_SHOP_PARTICLES : DASHBOARD_PARTICLES;

  // Generate deterministic floating falling icons
  const floatingIcons = useMemo(() => {
    const totalIcons = 24;

    return Array.from({ length: totalIcons }).map((_, index) => {
      const item = particleSet[index % particleSet.length];
      const IconComponent = item.icon;

      // Distribute evenly across viewport width (2% to 94%)
      const step = 92 / totalIcons;
      const jitter = ((index * 7) % 5) - 2;
      const left = Math.min(94, Math.max(2, index * step + 2 + jitter));
      const size = 24 + (index % 4) * 6; // 24px to 42px
      const duration = 18 + (index % 6) * 3; // 18s to 33s
      const delay = (index % 8) * -3.2; // negative delay so screen is already populated
      const rotateStart = (index * 40) % 360;
      const rotateEnd = rotateStart + (index % 2 === 0 ? 360 : -360);
      const sway = (index % 2 === 0 ? 1 : -1) * (14 + (index % 3) * 8);
      const opacity = 0.16 + (index % 3) * 0.06; // 0.16 to 0.28 (clean, unobtrusive depth)

      return {
        id: index,
        IconComponent,
        color: item.color,
        glow: item.glow,
        left,
        size,
        duration,
        delay,
        rotateStart,
        rotateEnd,
        sway,
        opacity,
      };
    });
  }, [particleSet]);

  const activeIcons = useMemo(() => {
    if (reducedMotion) return [];
    return isMobile ? floatingIcons.slice(0, 8) : floatingIcons;
  }, [floatingIcons, isMobile, reducedMotion]);

  // Dynamic Stardust Canvas Effect (Desktop only, 60fps lightweight rendering)
  useEffect(() => {
    if (!showStardust || isMobile || reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const colors = variant === "credits"
      ? [
          "rgba(34, 211, 238, 0.7)",   // Cyan
          "rgba(168, 85, 247, 0.7)",   // Purple
          "rgba(251, 191, 36, 0.7)",   // Amber
          "rgba(255, 255, 255, 0.65)", // Stardust White
        ]
      : [
          "rgba(168, 85, 247, 0.7)",   // Purple
          "rgba(34, 211, 238, 0.7)",   // Cyan
          "rgba(236, 72, 153, 0.65)",  // Pink
          "rgba(132, 204, 22, 0.65)",  // Lime
          "rgba(255, 255, 255, 0.65)", // White
        ];

    interface CanvasParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      maxAlpha: number;
      pulseSpeed: number;
      pulseAngle: number;
      isSpark: boolean;
    }

    // Lightweight particle count for zero lag on integrated GPUs
    const particleCount = 28;
    const particles: CanvasParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const isSpark = Math.random() < 0.25;
      const maxAlpha = Math.random() * 0.45 + 0.15;

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: Math.random() * 0.45 + 0.15,
        size: isSpark ? Math.random() * 2 + 1.2 : Math.random() * 1.6 + 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * maxAlpha,
        maxAlpha,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseAngle: Math.random() * Math.PI * 2,
        isSpark,
      });
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
        p.pulseAngle += p.pulseSpeed;

        if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = Math.max(
          0.05,
          p.alpha + Math.sin(p.pulseAngle) * (p.maxAlpha * 0.4)
        );

        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = p.color;

        ctx.beginPath();
        if (p.isSpark) {
          const s = p.size * 1.5;
          ctx.moveTo(p.x, p.y - s);
          ctx.lineTo(p.x + s * 0.4, p.y);
          ctx.lineTo(p.x, p.y + s);
          ctx.lineTo(p.x - s * 0.4, p.y);
          ctx.closePath();
        } else {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [variant, showStardust, isMobile, reducedMotion]);

  return (
    <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden select-none ${className}`}>
      {/* 1. Deep Ambient Aura Orbs */}
      {showOrbs && (
        <>
          {variant === "credits" ? (
            <>
              <div className="absolute -top-32 left-1/2 h-[700px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.12)_0%,rgba(168,85,247,0.08)_40%,transparent_70%)] blur-[100px] animate-pulse [animation-duration:8s]" />
              <div className="absolute top-1/3 -right-32 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.09)_0%,transparent_65%)] blur-[110px]" />
              <div className="absolute bottom-10 -left-32 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.08)_0%,transparent_65%)] blur-[110px]" />
            </>
          ) : (
            <>
              <div className="absolute -top-32 left-1/2 h-[750px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.11)_0%,rgba(34,211,238,0.08)_45%,transparent_70%)] blur-[100px] animate-pulse [animation-duration:9s]" />
              <div className="absolute top-1/3 -right-32 h-[650px] w-[650px] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.08)_0%,transparent_65%)] blur-[110px]" />
              <div className="absolute bottom-10 -left-32 h-[650px] w-[650px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.08)_0%,transparent_65%)] blur-[110px]" />
            </>
          )}
        </>
      )}

      {/* 2. Precision Cyber Grid */}
      {showGrid && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_85%)]" />
      )}

      {/* 3. Floating Falling Icons */}
      {activeIcons.map((p) => {
        const Icon = p.IconComponent;
        return (
          <motion.div
            key={p.id}
            className="absolute top-0 flex items-center justify-center pointer-events-none [transform:translateZ(0)]"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
            }}
            initial={{
              y: "-15vh",
              x: 0,
              rotate: p.rotateStart,
              opacity: 0,
            }}
            animate={{
              y: ["-15vh", "115vh"],
              x: [0, p.sway, 0],
              rotate: [p.rotateStart, p.rotateEnd],
              opacity: [0, p.opacity, p.opacity, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.14, 0.86, 1],
            }}
          >
            <Icon
              size={p.size}
              style={{
                color: p.color,
                filter: isMobile ? undefined : `drop-shadow(0 0 6px ${p.glow})`,
                willChange: "transform, opacity",
              }}
            />
          </motion.div>
        );
      })}

      {/* 4. Canvas Stardust (Optional, Hardware-efficient Desktop only) */}
      {showStardust && !isMobile && !reducedMotion && (
        <canvas
          ref={canvasRef}
          className="hidden sm:block absolute inset-0 h-full w-full opacity-80 pointer-events-none"
        />
      )}
    </div>
  );
};
