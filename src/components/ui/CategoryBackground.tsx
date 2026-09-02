"use client";

import React, { useMemo } from "react";
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
  MessageSquare,
} from "lucide-react";

interface CategoryBackgroundProps {
  categoryId?: string;
}

const ALL_CATEGORY_PARTICLES = [
  { icon: BookOpen, color: "rgba(251, 191, 36, 0.4)" },
  { icon: Code2, color: "rgba(163, 230, 53, 0.4)" },
  { icon: Sparkles, color: "rgba(245, 158, 11, 0.4)" },
  { icon: ImageIcon, color: "rgba(6, 182, 212, 0.4)" },
  { icon: Music, color: "rgba(236, 72, 153, 0.4)" },
  { icon: Video, color: "rgba(139, 92, 246, 0.4)" },
  { icon: GraduationCap, color: "rgba(251, 191, 36, 0.4)" },
  { icon: Terminal, color: "rgba(163, 230, 53, 0.4)" },
  { icon: FileText, color: "rgba(239, 68, 68, 0.4)" },
  { icon: Wand2, color: "rgba(236, 72, 153, 0.4)" },
  { icon: Mic2, color: "rgba(6, 182, 212, 0.4)" },
  { icon: Bot, color: "rgba(99, 102, 241, 0.4)" },
  { icon: Zap, color: "rgba(16, 185, 129, 0.4)" },
  { icon: Scissors, color: "rgba(139, 92, 246, 0.4)" },
  { icon: TrendingUp, color: "rgba(255, 153, 51, 0.4)" },
  { icon: SearchCode, color: "rgba(34, 211, 238, 0.4)" },
  { icon: BrainCircuit, color: "rgba(245, 158, 11, 0.4)" },
  { icon: Palette, color: "rgba(6, 182, 212, 0.4)" },
  { icon: Share2, color: "rgba(244, 63, 94, 0.4)" },
  { icon: Clapperboard, color: "rgba(244, 63, 94, 0.4)" },
];

const CATEGORY_PARTICLES: Record<string, { icons: React.ElementType[]; color: string }> = {
  student: {
    icons: [BookOpen, GraduationCap, BookMarked, BrainCircuit, FileText, Scale, Calculator],
    color: "rgba(251, 191, 36, 0.4)",
  },
  image: {
    icons: [ImageIcon, Palette, Wand2, Layers],
    color: "rgba(6, 182, 212, 0.4)",
  },
  video: {
    icons: [Video, Play, Scissors, Layers],
    color: "rgba(139, 92, 246, 0.4)",
  },
  audio: {
    icons: [Music, Mic2, AudioWaveform, Volume2],
    color: "rgba(236, 72, 153, 0.4)",
  },
  pdf: {
    icons: [FileText, Layers, Scale, BookOpen],
    color: "rgba(239, 68, 68, 0.4)",
  },
  ai: {
    icons: [Sparkles, BrainCircuit, Cpu, Bot],
    color: "rgba(99, 102, 241, 0.4)",
  },
  productivity: {
    icons: [Zap, CheckCircle2, Target],
    color: "rgba(16, 185, 129, 0.4)",
  },
  business: {
    icons: [Receipt, TrendingUp, Scale],
    color: "rgba(255, 153, 51, 0.4)",
  },
  seo: {
    icons: [SearchCode, Globe, Link],
    color: "rgba(34, 211, 238, 0.4)",
  },
  developer: {
    icons: [Terminal, Code2, Binary, Key],
    color: "rgba(163, 230, 53, 0.4)",
  },
  creator: {
    icons: [Share2, Video, Clapperboard, MessageSquare, Sparkles, Film, Layers],
    color: "rgba(244, 63, 94, 0.4)",
  },
};

export default function CategoryBackground({ categoryId }: CategoryBackgroundProps) {
  const isAll = !categoryId || categoryId === "all";
  const config = CATEGORY_PARTICLES[categoryId || ""] || CATEGORY_PARTICLES.student;

  // Generate a deterministic, stable set of random particle parameters
  const particles = useMemo(() => {
    const totalParticles = isAll ? 26 : 20;

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
      const delay = (index % 6) * -3.5; // negative delay so particles start midway across the screen
      const rotateStart = (index * 45) % 360;
      const rotateEnd = rotateStart + 360;
      const sway = (index % 2 === 0 ? 1 : -1) * (15 + (index % 4) * 10);
      const opacity = isAll ? 0.14 + (index % 3) * 0.06 : 0.16 + (index % 3) * 0.07;

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
        opacity,
      };
    });
  }, [config, isAll]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      {/* Pure CSS Ambient Glows */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          backgroundImage: `
            radial-gradient(circle at 85% 10%, ${config.color.replace(/[\d\.]+\)$/, "0.14)")} 0%, transparent 55%),
            radial-gradient(circle at 15% 90%, ${config.color.replace(/[\d\.]+\)$/, "0.09)")} 0%, transparent 50%)
          `,
        }}
      />

      {/* Subtle Precision Grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
        }}
      />

      {/* Floating Falling Category Icons */}
      {particles.map((p) => {
        const Icon = p.IconComponent;
        return (
          <motion.div
            key={p.id}
            className="absolute top-0 flex items-center justify-center pointer-events-none"
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
              className="drop-shadow-[0_0_12px_rgba(255,255,255,0.12)]"
            />
          </motion.div>
        );
      })}
    </div>
  );
}
