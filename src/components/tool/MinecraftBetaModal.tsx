"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Box, MessageSquareText, Loader2, Info } from "lucide-react";

const STORAGE_KEY = "exismic_minecraft_skin_beta_dismissed_v1";

export function MinecraftBetaModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem(STORAGE_KEY);
      if (!isDismissed) {
        // Smooth entrance delay after workspace mount
        const timer = setTimeout(() => setIsOpen(true), 350);
        return () => clearTimeout(timer);
      }
    } catch {
      // In case localStorage is blocked by privacy mode
    }
  }, []);

  const handleProceed = async () => {
    // 1. Immediately mark as dismissed in localStorage so user never sees it again
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Fallback
    }

    // 2. If user entered optional feedback, dispatch to API
    const trimmed = feedback.trim();
    if (trimmed) {
      setIsSubmitting(true);
      try {
        await fetch("/api/tools/beta-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toolId: "minecraft-skin",
            toolName: "AI Minecraft Skin Maker",
            feedback: trimmed,
          }),
        });
      } catch (err) {
        console.warn("[BetaFeedback] Non-blocking feedback log:", err);
      } finally {
        setIsSubmitting(false);
      }
    }

    // 3. Close the modal permanently
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="beta-modal-title"
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Obsidian Frosted Backdrop — Note: User must click Proceed button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#090d18]/95 p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_40px_rgba(6,182,212,0.18)] backdrop-blur-xl"
          >
            {/* Ambient Cyan Horizon Glow */}
            <div
              className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-36 w-80 rounded-full blur-3xl opacity-40"
              style={{
                background: "radial-gradient(ellipse at center, #06b6d4, transparent 70%)",
              }}
            />

            {/* Header: Icon + Beta Tag */}
            <div className="relative flex items-start gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
                <Box className="size-6 text-cyan-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                    <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    Beta Preview
                  </span>
                </div>
                <h3 id="beta-modal-title" className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Welcome to Minecraft Skin Studio
                </h3>
              </div>
            </div>

            {/* Notice Card */}
            <div className="relative mt-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 text-xs leading-relaxed text-zinc-300 space-y-2">
              <div className="flex items-start gap-2.5">
                <Info className="size-4 shrink-0 text-cyan-400 mt-0.5" />
                <p>
                  This tool is currently in <strong className="text-white font-bold">Beta</strong>, so some features, 3D poses, and texture details might not work as expected yet.
                </p>
              </div>
              <p className="text-zinc-400 pl-6.5 text-[11px]">
                We are actively polishing new armor presets, hairstyles, and accessories. Please share any suggestions or issues you encounter — it helps us improve the tool for everyone!
              </p>
            </div>

            {/* Optional Feedback Input */}
            <div className="relative mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="beta-feedback-input"
                  className="flex items-center gap-1.5 text-xs font-bold text-zinc-300"
                >
                  <MessageSquareText className="size-3.5 text-cyan-400" />
                  <span>Share your feedback or suggestions</span>
                </label>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                  Optional
                </span>
              </div>
              <textarea
                id="beta-feedback-input"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                placeholder="What would you like to see improved? e.g. More armor presets, specific anime styles, custom accessories, or any issues you found..."
                className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 resize-none leading-relaxed"
              />
              <p className="text-[11px] text-zinc-500">
                You can write your thoughts or skip this and jump straight into creating.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="relative mt-6 pt-2">
              <button
                type="button"
                onClick={handleProceed}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 px-6 py-3 text-sm font-black text-white shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:brightness-110 hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Saving & Launching...</span>
                  </>
                ) : (
                  <>
                    <span>{feedback.trim() ? "Submit & Proceed" : "Proceed"}</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
