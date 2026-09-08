"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Lock, Gem, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { CREATOR_INSIGNIAS } from "@/components/ui/CreatorInsignia";
import { CreatorInsignia } from "@/components/ui/CreatorInsignia";
import { AvatarWithFrame } from "@/components/ui/AvatarWithFrame";
import { Portal } from "@/components/ui/Portal";
import Link from "next/link";

export type CosmeticCategory = "insignia";

interface CosmeticsSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: CosmeticCategory;
  currentSelectedId: string | null;
  unlockedIds: string[];
  isPro: boolean;
  proIncludedIds: Set<string>;
  onApply: (id: string | null) => Promise<void>;
  avatarUrl?: string | null;
  displayName?: string | null;
}

export function CosmeticsSelectorModal({
  isOpen,
  onClose,
  category = "insignia",
  currentSelectedId,
  unlockedIds,
  isPro,
  proIncludedIds,
  onApply,
  avatarUrl,
  displayName,
}: CosmeticsSelectorModalProps) {
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  const items = CREATOR_INSIGNIAS;
  const activeItem = items.find((i) => i.id === currentSelectedId);
  const userName = displayName || "Creator";

  const handleSelect = async (id: string) => {
    const isUnlocked = unlockedIds.includes(id) || (isPro && proIncludedIds.has(id));
    if (!isUnlocked) return;

    setIsApplying(true);
    try {
      await onApply(id === currentSelectedId ? null : id);
    } finally {
      setIsApplying(false);
    }
  };

  const handleReset = async () => {
    setIsApplying(true);
    try {
      await onApply(null);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Portal>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-3xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[92dvh] h-[88dvh] flex flex-col bg-[#070812] border-2 border-amber-400/40 rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.95),0_0_40px_rgba(245,158,11,0.2)]"
          >

            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -top-24 right-0 w-96 h-96 bg-amber-600/10 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-24 left-0 w-96 h-96 bg-yellow-500/10 blur-[120px]" />

            {/* Top Header Bar */}
            <div className="p-5 sm:p-7 md:p-8 flex items-center justify-between z-20 border-b border-white/10 bg-[#090a18]/80 backdrop-blur-2xl gap-4">
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <Gem size={22} className="text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight">
                      Creator Insignias
                    </h2>
                    <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/[0.06] border border-white/10 text-zinc-400">
                      {CREATOR_INSIGNIAS.length} Signature Crests
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Equip a signature prestige crest displayed proudly beside your username.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/25 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer shadow-sm"
                aria-label="Close modal"
              >
                <X size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Live Profile Spotlight Bar */}
            <div className="px-5 sm:px-7 py-3 border-b border-white/10 bg-[#060712]/95 backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 z-10">
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  Live Preview:
                </span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 shadow-inner">
                  <AvatarWithFrame
                    avatarUrl={avatarUrl}
                    displayName={userName}
                    isPro={isPro}
                    size="sm"
                  />
                  <span className="text-xs font-black text-white">{userName}</span>
                  <CreatorInsignia insigniaId={currentSelectedId} size="md" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400">
                  Current:{" "}
                  <strong className="text-amber-300 font-bold">
                    {activeItem?.name || "None (Default)"}
                  </strong>
                </span>
              </div>
            </div>

            {/* Grid Selector Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {items.map((item) => {
                  const isSelected = currentSelectedId === item.id;
                  const isProPerk = isPro && proIncludedIds.has(item.id);
                  const isUnlocked = unlockedIds.includes(item.id) || isProPerk;

                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => isUnlocked && !isApplying && handleSelect(item.id)}
                      className={cn(
                        "group/card p-5 rounded-3xl backdrop-blur-xl border transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer",
                        isSelected
                          ? "bg-gradient-to-b from-[#1c180e]/95 to-[#0b0a05]/95 border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.35)]"
                          : isUnlocked
                          ? "bg-[#0b0c16]/80 hover:bg-[#121324]/80 border-white/10 hover:border-amber-400/50 shadow-lg"
                          : "bg-[#06070e]/60 border-white/5 opacity-70 hover:opacity-100 shadow-md"
                      )}
                    >
                      {/* Top Row: Rarity & Unlock Status */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-zinc-300">
                          {item.tier || "Signature"}
                        </span>

                        <span
                          className={cn(
                            "text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border",
                            isSelected
                              ? "bg-amber-400 text-black border-amber-300 font-black shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                              : isUnlocked
                              ? isProPerk
                                ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                                : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                              : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                          )}
                        >
                          {isSelected ? "Equipped" : isUnlocked ? (isProPerk ? "Pro VIP" : "Unlocked") : "Sparks Shop"}
                        </span>
                      </div>

                      {/* Visual Preview Stage */}
                      <div className="my-2 flex flex-col items-center justify-center min-h-[130px] rounded-2xl bg-black/50 border border-white/10 relative overflow-hidden p-2 shadow-inner">
                        <div className="flex flex-col items-center gap-2.5 w-full py-1">
                          {/* Centered Crest Jewel */}
                          <div className="p-3 rounded-2xl bg-black/70 border border-white/15 shadow-xl transition-transform duration-300 group-hover/card:scale-110">
                            <CreatorInsignia insigniaId={item.id} size="xl" showTooltip={false} />
                          </div>

                          {/* Realistic Live Inline Pill */}
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 max-w-full">
                            <AvatarWithFrame avatarUrl={avatarUrl} displayName={userName} size="sm" />
                            <span className="text-[10px] font-black text-white truncate max-w-[90px]">
                              {userName}
                            </span>
                            <CreatorInsignia insigniaId={item.id} size="sm" showTooltip={false} />
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[10.5px] text-zinc-400 font-medium leading-relaxed my-2 line-clamp-2">
                        {item.description}
                      </p>

                      {/* Action Button */}
                      <div className="mt-3 pt-3 border-t border-white/10">
                        {isSelected ? (
                          <div className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                            <CheckCircle2 size={14} className="text-black" />
                            <span>Equipped</span>
                          </div>
                        ) : isUnlocked ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(item.id);
                            }}
                            disabled={isApplying}
                            className="w-full py-2.5 px-3 rounded-xl bg-white/[0.08] hover:bg-white hover:text-black border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                          >
                            <Check size={13} strokeWidth={2.5} />
                            <span>Equip Crest</span>
                          </button>
                        ) : (
                          <Link
                            href="/rewards"
                            onClick={onClose}
                            className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400/60 text-amber-300 hover:text-amber-200 font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <Lock size={12} />
                            <span>Unlock in Shop</span>
                            <ExternalLink size={11} className="opacity-70" />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer Toolbar */}
            <div className="p-4 sm:p-6 border-t border-white/10 bg-[#070814]/95 backdrop-blur-2xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between z-20">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>Click any unlocked crest to equip it immediately beside your username</span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {currentSelectedId && (
                  <button
                    onClick={handleReset}
                    disabled={isApplying}
                    className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    Unequip Current
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
}
