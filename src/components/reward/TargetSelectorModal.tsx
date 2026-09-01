"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RewardItem } from "@/config/rewards";
import { Crown, Zap, Star, Target, Check, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TargetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: RewardItem[];
  selectedGoalId: string;
  userPoints: number;
  onSelectTarget: (reward: RewardItem) => void;
}

export const TargetSelectorModal: React.FC<TargetSelectorModalProps> = ({
  isOpen,
  onClose,
  catalog,
  selectedGoalId,
  userPoints,
  onSelectTarget,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-amber-400/30 bg-[#0b0d18] p-6 text-white shadow-[0_0_50px_rgba(245,158,11,0.15)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-wider text-white">
                  Select Target Reward
                </h3>
                <p className="text-xs text-zinc-400">
                  Choose a reward to track your progress and auto-calculate daily milestones.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Catalog Grid */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {catalog.map((reward) => {
              const isCurrent = selectedGoalId === reward.id;
              const progressPct = Math.min(100, Math.round((userPoints / reward.costPoints) * 100));

              return (
                <button
                  key={reward.id}
                  onClick={() => {
                    onSelectTarget(reward);
                    onClose();
                  }}
                  className={cn(
                    "group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200",
                    isCurrent
                      ? "border-amber-400/80 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent shadow-[0_0_25px_rgba(245,158,11,0.2)]"
                      : "border-white/[0.08] bg-zinc-900/50 hover:border-white/[0.25] hover:bg-zinc-900/80"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-amber-300">
                          {reward.category === "pro" ? (
                            <Crown className="h-3.5 w-3.5" />
                          ) : reward.category === "cosmetic" ? (
                            <Star className="h-3.5 w-3.5" />
                          ) : (
                            <Zap className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <span className="font-mono text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                          {reward.badge || reward.category}
                        </span>
                      </div>

                      {isCurrent && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                          <Check className="h-3.5 w-3.5" /> Selected
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
                      {reward.title}
                    </div>
                    <div className="mt-0.5 text-xs text-zinc-400 line-clamp-2">
                      {reward.description}
                    </div>
                  </div>

                  {/* Progress Bar inside Selector */}
                  <div className="mt-4 border-t border-white/[0.06] pt-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono font-black text-amber-300">
                        {reward.costPoints.toLocaleString()} RP
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {progressPct}%
                      </span>
                    </div>

                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end border-t border-white/[0.08] pt-4">
            <button
              onClick={onClose}
              className="rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-700"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
