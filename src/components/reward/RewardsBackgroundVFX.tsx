"use client";

import React, { useEffect, useRef } from "react";

export const RewardsBackgroundVFX: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
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

    // Particle system: gold, cyan, purple, and white stardust
    const colors = [
      "rgba(245, 158, 11, 0.7)",   // Amber/Gold
      "rgba(6, 182, 212, 0.7)",    // Cyan
      "rgba(168, 85, 247, 0.7)",   // Purple
      "rgba(251, 191, 36, 0.8)",   // Yellow
      "rgba(255, 255, 255, 0.85)", // Diamond White
    ];

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      maxAlpha: number;
      fadeSpeed: number;
      pulseAngle: number;
      pulseSpeed: number;
      isSpark: boolean;
    }

    const particles: Particle[] = [];
    const PARTICLE_COUNT = 45;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const isSpark = Math.random() > 0.65;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (isSpark ? 0.35 : 0.15),
        vy: -Math.random() * (isSpark ? 0.45 : 0.25) - 0.05,
        size: isSpark ? Math.random() * 2.2 + 0.8 : Math.random() * 1.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.1,
        maxAlpha: Math.random() * 0.7 + 0.2,
        fadeSpeed: Math.random() * 0.01 + 0.003,
        pulseAngle: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        isSpark,
      });
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Draw and update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
        p.pulseAngle += p.pulseSpeed;

        // Wrap around boundaries
        if (p.y < -10) {
          p.y = height + 10;
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
        ctx.shadowBlur = p.isSpark ? 8 : 4;
        ctx.shadowColor = p.color;

        ctx.beginPath();
        if (p.isSpark) {
          // Diamond / star shape for sparks
          const s = p.size * 1.6;
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

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* 1. Deep Radial Ambient Color Orbs */}
      <div className="absolute -top-32 left-1/2 h-[750px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.12)_0%,rgba(6,182,212,0.08)_40%,transparent_70%)] blur-[100px] animate-pulse [animation-duration:8s]" />
      <div className="absolute top-1/3 -right-32 h-[650px] w-[650px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.11)_0%,transparent_65%)] blur-[110px]" />
      <div className="absolute bottom-10 -left-32 h-[650px] w-[650px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.09)_0%,transparent_65%)] blur-[110px]" />

      {/* 2. Cyber Horizon Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:40px_40px] opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]" />

      {/* 3. Dynamic Canvas Stardust VFX */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-85"
      />
    </div>
  );
};
