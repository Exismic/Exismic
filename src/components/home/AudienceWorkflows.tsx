"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, 
  Video, 
  Store, 
  Layers,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolCard } from "@/components/ui/ToolCard";
import { ALL_TOOLS } from "@/data/tools";

export interface WorkflowBundle {
  id: string;
  role: string;
  roleBadge: string;
  headline: string;
  description: string;
  icon: LucideIcon;
  accentColor: string;
  gradientText: string;
  borderColor: string;
  glowColor: string;
  bgTint: string;
  toolIds: string[];
}

export const AUDIENCE_WORKFLOWS: WorkflowBundle[] = [
  {
    id: "indie-founder",
    role: "I'm an Indie Hacker",
    roleBadge: "Built for Solo Founders & Builders",
    headline: "Launch Your Project Today",
    description: "Create your brand logo, responsive website, 3D product previews, and social cards in minutes.",
    icon: Rocket,
    accentColor: "#f59e0b",
    gradientText: "from-amber-400 via-orange-400 to-yellow-300",
    borderColor: "border-amber-500/30 hover:border-amber-400/60",
    glowColor: "rgba(245, 158, 11, 0.25)",
    bgTint: "bg-amber-500/10",
    toolIds: [
      "ai-logo",
      "landing-page-generator",
      "device-mockup",
      "og-banner"
    ]
  },
  {
    id: "content-creator",
    role: "I'm a Content Creator",
    roleBadge: "Built for Video & Social Creators",
    headline: "Make Viral Videos & Content",
    description: "Summarize reference videos, polish scripts into natural voices, and craft high-engagement social posts.",
    icon: Video,
    accentColor: "#a855f7",
    gradientText: "from-purple-400 via-fuchsia-400 to-indigo-300",
    borderColor: "border-purple-500/30 hover:border-purple-400/60",
    glowColor: "rgba(168, 85, 247, 0.25)",
    bgTint: "bg-purple-500/10",
    toolIds: [
      "youtube-summarizer",
      "ai-humanizer",
      "social-caption-generator",
      "meme-generator"
    ]
  },
  {
    id: "local-merchant",
    role: "I'm a Small Business Owner",
    roleBadge: "Built for Local Stores & Businesses",
    headline: "Run Your Store & Client Billing",
    description: "Create branded QR codes for tables and menus, send clean PDF invoices, and prepare product photos.",
    icon: Store,
    accentColor: "#10b981",
    gradientText: "from-emerald-400 via-teal-300 to-cyan-300",
    borderColor: "border-emerald-500/30 hover:border-emerald-400/60",
    glowColor: "rgba(16, 185, 129, 0.25)",
    bgTint: "bg-emerald-500/10",
    toolIds: [
      "qr-generator",
      "invoice-generator",
      "image-eraser",
      "image-compressor"
    ]
  }
];

interface AudienceWorkflowsProps {
  className?: string;
  selectedId?: string;
  onSelectId?: (id: string) => void;
  defaultWorkflowId?: string;
}

export function AudienceWorkflows({ 
  className,
  selectedId: controlledSelectedId,
  onSelectId,
  defaultWorkflowId = "indie-founder" 
}: AudienceWorkflowsProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string>(defaultWorkflowId);

  const selectedId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;

  const handleSelect = (id: string) => {
    setInternalSelectedId(id);
    onSelectId?.(id);
  };

  const activeBundle = AUDIENCE_WORKFLOWS.find((w) => w.id === selectedId) || AUDIENCE_WORKFLOWS[0];

  return (
    <div className={cn("w-full space-y-6 sm:space-y-8", className)}>
      {/* 1. Audience Role Selector Pills */}
      <div className="flex flex-col items-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-zinc-400 text-[10px] font-black uppercase tracking-[0.25em]">
          <Layers className="w-3.5 h-3.5 text-zinc-300" />
          <span>Audience Workflow Bundles</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-2xl max-w-3xl mx-auto shadow-2xl">
          {AUDIENCE_WORKFLOWS.map((bundle) => {
            const Icon = bundle.icon;
            const isSelected = bundle.id === selectedId;

            return (
              <button
                key={bundle.id}
                onClick={() => handleSelect(bundle.id)}
                className={cn(
                  "flex items-center gap-2.5 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer select-none",
                  isSelected
                    ? "bg-white/10 text-white shadow-lg border scale-[1.02]"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
                )}
                style={
                  isSelected
                    ? {
                        boxShadow: `0 0 30px ${bundle.glowColor}`,
                        borderColor: bundle.accentColor,
                      }
                    : {}
                }
              >
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-transform",
                    isSelected ? bundle.bgTint : "bg-white/5"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      isSelected ? "text-white" : "text-zinc-400"
                    )}
                  />
                </div>
                <span>{bundle.role}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Flagship Role Deck Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeBundle.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative rounded-[2rem] sm:rounded-[2.75rem] md:rounded-[3rem] bg-gradient-to-b from-[#0e0f17]/95 via-[#0a0a10]/90 to-[#06060a]/95 border-2 p-6 sm:p-8 md:p-12 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-500"
          style={{
            borderColor: `${activeBundle.accentColor}33`,
            boxShadow: `0 0 50px ${activeBundle.accentColor}12`,
          }}
        >
          {/* Ambient Lighting Beams */}
          <div 
            className="absolute -top-32 -left-20 w-[500px] h-[500px] blur-[140px] rounded-full pointer-events-none opacity-20 transition-all duration-700"
            style={{ backgroundColor: activeBundle.accentColor }}
          />
          <div 
            className="absolute -bottom-32 -right-20 w-[450px] h-[450px] blur-[140px] rounded-full pointer-events-none opacity-15 transition-all duration-700"
            style={{ backgroundColor: activeBundle.accentColor }}
          />

          {/* Micro Dot Matrix Texture */}
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

          {/* Header Section (100% Centered, Clean Plain English, Zero Pretentious Words) */}
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-bold text-zinc-300">
              <span 
                className="w-2 h-2 rounded-full animate-pulse shadow-sm"
                style={{ backgroundColor: activeBundle.accentColor }}
              />
              <span>{activeBundle.roleBadge}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {activeBundle.headline}
            </h3>

            <p className="text-xs sm:text-sm md:text-base text-zinc-400 font-medium leading-relaxed max-w-xl">
              {activeBundle.description}
            </p>
          </div>

          {/* Category-Reactive Laser Horizon Divider */}
          <div 
            className="w-full h-px my-6 sm:my-8 relative z-10 transition-all duration-500"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${activeBundle.accentColor}66 30%, ${activeBundle.accentColor}99 50%, ${activeBundle.accentColor}66 70%, transparent 100%)`
            }}
          />

          {/* 3. Real Exismic Signature ToolCards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 items-stretch">
            {activeBundle.toolIds.map((toolId, index) => {
              const tool = ALL_TOOLS.find((t) => t.id === toolId);
              if (!tool) return null;

              return (
                <ToolCard
                  key={tool.id}
                  id={tool.id}
                  name={tool.name}
                  description={tool.description}
                  category={tool.category}
                  icon={tool.icon}
                  href={tool.href}
                  proPowerPack={tool.proPowerPack}
                  pro={tool.pro}
                  popular={tool.popular}
                  index={index}
                  className="h-full"
                />
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
