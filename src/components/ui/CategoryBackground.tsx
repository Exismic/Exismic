"use client";

import React, { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  BookMarked,
  BrainCircuit,
  FileText,
  Scale,
  Calculator,
  ImageIcon,
  Palette,
  Wand2,
  Layers,
  Video,
  Play,
  Scissors,
  Music,
  Mic2,
  AudioWaveform,
  Volume2,
  Sparkles,
  Cpu,
  Bot,
  Zap,
  CheckCircle2,
  Target,
  Receipt,
  TrendingUp,
  SearchCode,
  Globe,
  Link,
  Terminal,
  Code2,
  Binary,
  Key,
  Share2,
  Film,
  Clapperboard,
  MessageSquare
} from "lucide-react";

interface CategoryBackgroundProps {
  categoryId?: string;
}

const ALL_CATEGORY_PARTICLES = [
  { icon: BookOpen, color: "rgba(251, 191, 36, 0.4)" },
  { icon: Code2, color: "rgba(163, 230, 53, 0.4)" },
  { icon: Sparkles, color: "rgba(245, 158, 11, 0.4)" },
  { icon: ImageIcon, color: "rgba(168, 85, 247, 0.4)" },
  { icon: Music, color: "rgba(6, 182, 212, 0.4)" },
  { icon: Video, color: "rgba(59, 130, 246, 0.4)" },
  { icon: GraduationCap, color: "rgba(251, 191, 36, 0.4)" },
  { icon: Terminal, color: "rgba(163, 230, 53, 0.4)" },
  { icon: FileText, color: "rgba(239, 68, 68, 0.4)" },
  { icon: Wand2, color: "rgba(236, 72, 153, 0.4)" },
  { icon: Mic2, color: "rgba(6, 182, 212, 0.4)" },
  { icon: Bot, color: "rgba(168, 85, 247, 0.4)" },
  { icon: Zap, color: "rgba(59, 130, 246, 0.4)" },
  { icon: Scissors, color: "rgba(139, 92, 246, 0.4)" },
  { icon: TrendingUp, color: "rgba(255, 140, 0, 0.4)" },
  { icon: SearchCode, color: "rgba(34, 211, 238, 0.4)" },
  { icon: BrainCircuit, color: "rgba(245, 158, 11, 0.4)" },
  { icon: Palette, color: "rgba(168, 85, 247, 0.4)" },
  { icon: Share2, color: "rgba(244, 63, 94, 0.4)" },
  { icon: Clapperboard, color: "rgba(244, 63, 94, 0.4)" }
];

const CATEGORY_PARTICLES: Record<string, { icons: React.ElementType[]; color: string }> = {
  student: {
    icons: [BookOpen, GraduationCap, BookMarked, BrainCircuit, FileText, Scale, Calculator],
    color: "rgba(251, 191, 36, 0.4)"
  },
  image: {
    icons: [ImageIcon, Palette, Wand2, Layers],
    color: "rgba(6, 182, 212, 0.4)"
  },
  video: {
    icons: [Video, Play, Scissors, Layers],
    color: "rgba(139, 92, 246, 0.4)"
  },
  audio: {
    icons: [Music, Mic2, AudioWaveform, Volume2],
    color: "rgba(236, 72, 153, 0.4)"
  },
  pdf: {
    icons: [FileText, Layers, Scale, BookOpen],
    color: "rgba(239, 68, 68, 0.4)"
  },
  ai: {
    icons: [Sparkles, BrainCircuit, Cpu, Bot],
    color: "rgba(99, 102, 241, 0.4)"
  },
  productivity: {
    icons: [Zap, CheckCircle2, Target],
    color: "rgba(16, 185, 129, 0.4)"
  },
  business: {
    icons: [Receipt, TrendingUp, Scale],
    color: "rgba(255, 153, 51, 0.4)"
  },
  seo: {
    icons: [SearchCode, Globe, Link],
    color: "rgba(34, 211, 238, 0.4)"
  },
  developer: {
    icons: [Terminal, Code2, Binary, Key],
    color: "rgba(163, 230, 53, 0.4)"
  },
  creator: {
    icons: [Share2, Video, Clapperboard, MessageSquare, Sparkles, Film, Layers],
    color: "rgba(244, 63, 94, 0.4)"
  }
};

export default function CategoryBackground({ categoryId }: CategoryBackgroundProps) {
  const [mounted, setMounted] = useState(false);
  const isAll = !categoryId || categoryId === "all";
  const config = CATEGORY_PARTICLES[categoryId || ""] || CATEGORY_PARTICLES.student;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate a stable set of random particle parameters
  const particles = useMemo(() => {
    const totalParticles = isAll ? 28 : 22;

    return Array.from({ length: totalParticles }).map((_, index) => {
      let IconComponent: React.ElementType;
      let particleColor: string;

      if (isAll) {
        const item = ALL_CATEGORY_PARTICLES[index % ALL_CATEGORY_PARTICLES.length];
        IconComponent = item.icon;
        particleColor = item.color;
      } else {
        IconComponent = config.icons[index % config.icons.length];
        particleColor = config.color;
      }

      // Evenly distribute particles across full screen width (2% to 94% left)
      const step = 92 / totalParticles;
      const jitter = ((index * 7) % 5) - 2;
      const left = Math.min(94, Math.max(2, index * step + 2 + jitter));
      const size = 24 + (index % 5) * 8; // sizes 24px to 56px
      const duration = 14 + (index % 7) * 3; // durations 14s to 32s
      const delay = (index % 6) * -3.5; // negative delay so particles start midway on render
      const rotateStart = (index * 45) % 360;
      const rotateEnd = rotateStart + 360;
      const sway = (index % 2 === 0 ? 1 : -1) * (15 + (index % 4) * 10);
      const opacity = isAll ? 0.15 + (index % 3) * 0.08 : 0.16 + (index % 3) * 0.08;

      return {
        id: index,
        IconComponent,
        particleColor,
        left,
        size,
        duration,
        delay,
        rotateStart,
        rotateEnd,
        sway,
        opacity
      };
    });
  }, [config, isAll]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen pointer-events-none overflow-hidden z-0 select-none">
      {/* Ambient Gradient Orbs */}
      <div 
        className="absolute -top-[15%] -right-[10%] w-[65%] h-[65%] rounded-full blur-[120px] mix-blend-screen opacity-50 transition-colors duration-700"
        style={{ background: `radial-gradient(circle, ${config.color}, transparent 70%)` }}
      />
      <div 
        className="absolute -bottom-[15%] -left-[10%] w-[65%] h-[65%] rounded-full blur-[120px] mix-blend-screen opacity-40 transition-colors duration-700"
        style={{ background: `radial-gradient(circle, ${config.color}, transparent 70%)` }}
      />

      {/* Floating Animated Particles */}
      {particles.map((p) => {
        const Icon = p.IconComponent;
        return (
          <motion.div
            key={p.id}
            className="absolute top-0 flex items-center justify-center"
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
              times: [0, 0.15, 0.85, 1],
            }}
          >
            <Icon
              size={p.size}
              style={{ color: p.particleColor.replace(/[\d\.]+\)$/, "0.8)") }}
              className="drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]"
            />
          </motion.div>
        );
      })}

      {/* Subtly Textured Grain Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
    </div>,
    document.body
  );
}
