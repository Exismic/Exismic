"use client";

import React, { useEffect, useRef } from "react";
import { getRarityConfig, RewardRarity } from "./rarityConfig";

export type VFXStage = "idle" | "charging" | "explosion" | "revealed";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: "circle" | "square" | "triangle" | "star" | "diamond" | "ember";
  alpha: number;
  decay: number;
  gravity: number;
  rotation: number;
  vRot: number;
  life: number;
  maxLife: number;
  blur: boolean;
  layer: "back" | "middle" | "front";
  orbitRadius?: number;
  orbitAngle?: number;
  orbitSpeed?: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  lineWidth: number;
}

interface ParticleCanvasVFXProps {
  stage: VFXStage;
  rarity: RewardRarity;
  mouseOffset?: { x: number; y: number };
  className?: string;
}

export const ParticleCanvasVFX: React.FC<ParticleCanvasVFXProps> = ({
  stage,
  rarity,
  mouseOffset = { x: 0, y: 0 },
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ambientParticlesRef = useRef<Particle[]>([]);
  const orbitingParticlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const godRayAngleRef = useRef<number>(0);
  const rayPulseAngleRef = useRef<number>(0);

  const rarityConfig = getRarityConfig(rarity);

  // Initialize 3-layer ambient & orbiting particles
  useEffect(() => {
    const ambient: Particle[] = [];
    const orbiting: Particle[] = [];
    const colors = rarityConfig.particleColors;
    const shapes: Array<Particle["shape"]> = ["circle", "star", "diamond", "ember"];

    // 1. Back Layer: 15 slow, heavily blurred, low-opacity drifting orbs
    for (let i = 0; i < 15; i++) {
      ambient.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0002,
        vy: -Math.random() * 0.0004 - 0.0001,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: "circle",
        alpha: Math.random() * 0.25 + 0.1,
        decay: 0,
        gravity: 0,
        rotation: 0,
        vRot: 0,
        life: 0,
        maxLife: 100,
        blur: true,
        layer: "back",
      });
    }

    // 2. Middle Layer: 25 small floating dots & diamonds
    for (let i = 0; i < 25; i++) {
      ambient.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0004,
        vy: -Math.random() * 0.0006 - 0.0002,
        size: Math.random() * 3 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        alpha: Math.random() * 0.55 + 0.25,
        decay: 0,
        gravity: 0,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.02,
        life: 0,
        maxLife: 100,
        blur: Math.random() > 0.5,
        layer: "middle",
      });
    }

    // 3. Orbiting Particles: 10 tiny particles orbiting around reward center
    for (let i = 0; i < 10; i++) {
      orbiting.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: Math.random() * 3 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.random() > 0.4 ? "star" : "diamond",
        alpha: Math.random() * 0.7 + 0.3,
        decay: 0,
        gravity: 0,
        rotation: 0,
        vRot: (Math.random() - 0.5) * 0.03,
        life: 0,
        maxLife: 100,
        blur: false,
        layer: "front",
        orbitRadius: Math.random() * 45 + 85,
        orbitAngle: (i / 10) * Math.PI * 2,
        orbitSpeed: (Math.random() * 0.006 + 0.003) * (i % 2 === 0 ? 1 : -1),
      });
    }

    ambientParticlesRef.current = ambient;
    orbitingParticlesRef.current = orbiting;
  }, [rarityConfig]);

  // Stage burst particles
  useEffect(() => {
    if (stage === "charging") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      const chargeParticles: Particle[] = [];
      const count = rarityConfig.particleCount;
      const colors = rarityConfig.particleColors;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 320 + 160;
        const startX = cx + Math.cos(angle) * dist;
        const startY = cy + Math.sin(angle) * dist;

        chargeParticles.push({
          x: startX,
          y: startY,
          vx: (cx - startX) * 0.05,
          vy: (cy - startY) * 0.05,
          size: Math.random() * 6 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: Math.random() > 0.5 ? "diamond" : "circle",
          alpha: 0.85,
          decay: 0.012,
          gravity: 0,
          rotation: 0,
          vRot: 0,
          life: 1,
          maxLife: 1,
          blur: true,
          layer: "middle",
        });
      }
      particlesRef.current = chargeParticles;
    } else if (stage === "explosion") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      shockwavesRef.current = [
        {
          x: cx,
          y: cy,
          radius: 25,
          maxRadius: Math.max(width, height) * 0.85,
          alpha: 1.0,
          color: rarityConfig.primaryColor,
          lineWidth: 30,
        },
        {
          x: cx,
          y: cy,
          radius: 12,
          maxRadius: Math.max(width, height) * 0.65,
          alpha: 0.85,
          color: rarityConfig.accentColor,
          lineWidth: 16,
        },
      ];

      const burst: Particle[] = [];
      const count = rarityConfig.particleCount;
      const colors = rarityConfig.particleColors;
      const shapes: Array<Particle["shape"]> = ["circle", "square", "triangle", "star", "diamond", "ember"];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * (rarity === "legendary" ? 22 : rarity === "epic" ? 17 : 12) + 3.5;

        burst.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * (rarity === "legendary" ? 12 : 8) + 2.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          alpha: 1.0,
          decay: Math.random() * 0.014 + 0.007,
          gravity: 0.14,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.25,
          life: 1,
          maxLife: 1,
          blur: Math.random() > 0.35,
          layer: "front",
        });
      }
      particlesRef.current = burst;
    }
  }, [stage, rarity, rarityConfig]);

  // Main 60 FPS Render Loop with Seamless Looping & Parallax Shifts
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const cx = w / 2 + mouseOffset.x * 2;
      const cy = h / 2 + mouseOffset.y * 2;

      ctx.clearRect(0, 0, w, h);

      // --- 1. Soft Rotating God Rays (52s full rotation) ---
      godRayAngleRef.current += (Math.PI * 2) / (52 * 60); // 52s rotation at 60fps
      rayPulseAngleRef.current += 0.02;
      const rayScalePulse = 1 + Math.sin(rayPulseAngleRef.current) * 0.025; // 100% -> 105% -> 100%

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(rayScalePulse, rayScalePulse);
      ctx.globalCompositeOperation = "lighter";

      const rayCount = rarityConfig.raysCount || 10;
      const rayAngleStep = (Math.PI * 2) / rayCount;

      for (let i = 0; i < rayCount; i++) {
        const angle = godRayAngleRef.current + i * rayAngleStep;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, Math.max(w, h), angle - 0.07, angle + 0.07);
        ctx.closePath();

        const rayGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(w, h));
        rayGrad.addColorStop(0, rarityConfig.glowColor);
        rayGrad.addColorStop(0.55, rarityConfig.primaryColor + "22");
        rayGrad.addColorStop(1, "transparent");

        ctx.fillStyle = rayGrad;
        ctx.globalAlpha = (rarityConfig.raysOpacity || 0.1) * (0.85 + Math.sin(rayPulseAngleRef.current * 0.7) * 0.15);
        ctx.fill();
      }
      ctx.restore();

      // --- 2. Back Layer Particles ---
      ctx.save();
      ambientParticlesRef.current
        .filter((p) => p.layer === "back")
        .forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = 1;
          if (p.x > 1) p.x = 0;
          if (p.y < 0) p.y = 1;

          const px = p.x * w + mouseOffset.x * 1.5;
          const py = p.y * h + mouseOffset.y * 1.5;

          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.fill();
        });
      ctx.restore();

      // --- 3. Middle Layer Floating Particles ---
      ctx.save();
      ambientParticlesRef.current
        .filter((p) => p.layer === "middle")
        .forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.vRot;
          if (p.x < 0) p.x = 1;
          if (p.x > 1) p.x = 0;
          if (p.y < 0) p.y = 1;

          const px = p.x * w + mouseOffset.x * 3;
          const py = p.y * h + mouseOffset.y * 3;

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;

          if (p.shape === "diamond") {
            ctx.beginPath();
            ctx.moveTo(0, -p.size * 1.3);
            ctx.lineTo(p.size * 0.8, 0);
            ctx.lineTo(0, p.size * 1.3);
            ctx.lineTo(-p.size * 0.8, 0);
            ctx.closePath();
            ctx.fill();
          } else if (p.shape === "star") {
            ctx.beginPath();
            for (let s = 0; s < 4; s++) {
              ctx.rotate(Math.PI / 2);
              ctx.lineTo(0, p.size);
              ctx.lineTo(0, p.size * 0.3);
            }
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
      ctx.restore();

      // --- 4. Orbiting Particles Around Reward Center ---
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      orbitingParticlesRef.current.forEach((p) => {
        if (p.orbitAngle !== undefined && p.orbitSpeed !== undefined && p.orbitRadius !== undefined) {
          p.orbitAngle += p.orbitSpeed;
          p.rotation += p.vRot;

          const ox = cx + Math.cos(p.orbitAngle) * p.orbitRadius + mouseOffset.x * 4;
          const oy = cy + Math.sin(p.orbitAngle) * (p.orbitRadius * 0.45) + mouseOffset.y * 4;

          ctx.save();
          ctx.translate(ox, oy);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;

          if (p.shape === "star") {
            ctx.beginPath();
            for (let s = 0; s < 4; s++) {
              ctx.rotate(Math.PI / 2);
              ctx.lineTo(0, p.size * 1.2);
              ctx.lineTo(0, p.size * 0.3);
            }
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.moveTo(0, -p.size * 1.2);
            ctx.lineTo(p.size * 0.7, 0);
            ctx.lineTo(0, p.size * 1.2);
            ctx.lineTo(-p.size * 0.7, 0);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }
      });
      ctx.restore();

      // --- 5. Expanding Shockwaves ---
      if (shockwavesRef.current.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        shockwavesRef.current.forEach((sw, idx) => {
          sw.radius += (sw.maxRadius - sw.radius) * 0.14 + 7;
          sw.alpha *= 0.93;

          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.lineWidth = sw.lineWidth * sw.alpha;
          ctx.strokeStyle = sw.color;
          ctx.globalAlpha = Math.max(0, sw.alpha);
          ctx.stroke();

          if (sw.alpha < 0.01 || sw.radius >= sw.maxRadius) {
            shockwavesRef.current.splice(idx, 1);
          }
        });
        ctx.restore();
      }

      // --- 6. Front Layer Burst Particles ---
      if (particlesRef.current.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        particlesRef.current.forEach((p, index) => {
          if (stage === "charging") {
            p.x += (cx - p.x) * 0.14;
            p.y += (cy - p.y) * 0.14;
            p.alpha *= 0.95;
          } else {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.97;
            p.vy *= 0.97;
            p.rotation += p.vRot;
            p.alpha -= p.decay;
          }

          if (p.alpha <= 0) {
            particlesRef.current.splice(index, 1);
            return;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;

          if (p.shape === "diamond") {
            ctx.beginPath();
            ctx.moveTo(0, -p.size * 1.4);
            ctx.lineTo(p.size * 0.9, 0);
            ctx.lineTo(0, p.size * 1.4);
            ctx.lineTo(-p.size * 0.9, 0);
            ctx.closePath();
            ctx.fill();
          } else if (p.shape === "square") {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          } else if (p.shape === "triangle") {
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.lineTo(p.size, p.size);
            ctx.lineTo(-p.size, p.size);
            ctx.closePath();
            ctx.fill();
          } else if (p.shape === "star") {
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
              ctx.rotate(Math.PI / 2);
              ctx.lineTo(0, p.size * 1.3);
              ctx.lineTo(0, p.size * 0.3);
            }
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [stage, rarityConfig, mouseOffset]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
};
