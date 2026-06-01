"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function ProBackground() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate star coordinates on client side to avoid SSR hydration mismatches
    const generated = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * -20,
      opacity: Math.random() * 0.4 + 0.1,
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Luxurious Deep Space Background */}
      <div className="absolute inset-0 bg-[#030303]" />

      {/* Volumetric Cosmic Nebula Glows */}
      <motion.div
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -80, 40, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12)_0%,rgba(124,58,237,0.05)_40%,transparent_70%)] blur-[120px] mix-blend-screen"
      />

      <motion.div
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 60, -80, 0],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-[-20%] right-[-10%] w-[75vw] h-[75vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,rgba(59,130,246,0.04)_45%,transparent_70%)] blur-[130px] mix-blend-screen"
      />

      <motion.div
        animate={{
          x: [0, 40, -50, 0],
          y: [0, 80, -40, 0],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[30%] right-[15%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.08)_0%,rgba(219,39,119,0.02)_40%,transparent_70%)] blur-[100px] mix-blend-screen"
      />

      {/* Floating Starfield Particles (Dynamic and Cinematic) */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [p.opacity, p.opacity * 2.5, p.opacity],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Interactive Laser/Horizon Neon Line Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.008)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.008)_1px,transparent_1px)] bg-[size:64px_64px] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Elegant Radial Shimmer Sweep overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.015)_0%,transparent_80%)] mix-blend-overlay" />

      {/* Super fine high-end grain layer */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
    </div>
  );
}
