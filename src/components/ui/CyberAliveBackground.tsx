"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function CyberAliveBackground() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; duration: number; delay: number }>>([]);

  useEffect(() => {
    // Generate floating cosmic particle coordinates on client render
    const generated = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.15,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * -20,
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#030303]">
      {/* 1. Perspective Cyber Grid Mesh Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(168, 85, 247, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(168, 85, 247, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      />

      {/* 2. Floating Volumetric Orbiting Nebula Spheres */}
      {/* Top Left Violet Nebula */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-15%] left-[-10%] w-[65vw] max-w-[850px] h-[65vw] max-h-[850px] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.18)_0%,rgba(124,58,237,0.06)_45%,transparent_70%)] blur-[140px] mix-blend-screen"
      />

      {/* Top Right Cyber Cyan Nebula */}
      <motion.div
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 60, -40, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[10%] right-[-15%] w-[60vw] max-w-[750px] h-[60vw] max-h-[750px] rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.16)_0%,rgba(59,130,246,0.05)_50%,transparent_70%)] blur-[140px] mix-blend-screen"
      />

      {/* Bottom Center Solar Amber / Fuchsia Core Nebula */}
      <motion.div
        animate={{
          x: [0, 30, -40, 0],
          y: [0, -40, 50, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[-15%] left-[25%] w-[55vw] max-w-[700px] h-[55vw] max-h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12)_0%,rgba(236,72,153,0.08)_40%,transparent_70%)] blur-[150px] mix-blend-screen"
      />

      {/* 3. Floating Cyber Micro-Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-purple-200"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            boxShadow: "0 0 10px rgba(168, 85, 247, 0.8)",
          }}
          animate={{
            y: [`${p.y}%`, `${p.y - 18}%`, `${p.y}%`],
            opacity: [p.opacity, p.opacity * 2.2, p.opacity],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* 4. Film Grain Noise Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay" />

      {/* 5. Deep Space Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#030303_100%)] opacity-80" />
    </div>
  );
}
