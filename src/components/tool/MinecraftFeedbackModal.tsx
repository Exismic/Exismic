"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gamepad2, 
  Star, 
  X, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Loader2,
  HeartHandshake,
  MessageSquareHeart,
  Check
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import axios from "axios";

interface MinecraftFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  skinPrompt?: string;
}

const FEATURE_CHIPS = [
  "✨ 3D Volumetric Layered Hair",
  "⚡ Neon & Glow Shader Previews",
  "🧥 Open Hoodie & Cape Presets",
  "👁️ Expressive Anime Eye Styles",
  "🎮 3D Walk & Attack Animations",
  "📸 4K Discord Avatar / PFP Exporter",
  "🎨 One-Click Recolor Wheel",
  "📱 Bedrock (.mcpack) Export Support"
];

const RATING_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Needs lots of work 🛠️", color: "text-rose-400" },
  2: { label: "Getting there 💡", color: "text-amber-400" },
  3: { label: "Pretty decent 👍", color: "text-yellow-300" },
  4: { label: "Really great! 🔥", color: "text-teal-300" },
  5: { label: "Insanely good! ⚡", color: "text-emerald-300" }
};

export function MinecraftFeedbackModal({
  isOpen,
  onClose,
  skinPrompt,
}: MinecraftFeedbackModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check cooldown & autofill user details
  useEffect(() => {
    async function init() {
      try {
        const lastSent = localStorage.getItem("exismic_minecraft_feedback_sent_at");
        if (lastSent) {
          const elapsed = Date.now() - parseInt(lastSent, 10);
          if (elapsed < 5 * 60 * 60 * 1000) {
            setCooldownActive(true);
          } else {
            setCooldownActive(false);
          }
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || "");
          setName(user.user_metadata?.full_name || user.user_metadata?.name || "");
        }
      } catch {
        // Guest user fallback
      }
    }
    if (isOpen) {
      init();
    }
  }, [isOpen]);

  const toggleFeature = (feat: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await axios.post("/api/tools/minecraft-skin/feedback", {
        name,
        email,
        rating,
        feedback,
        requestedFeatures: selectedFeatures,
        skinPrompt,
      });

      if (res.data.success) {
        localStorage.setItem("exismic_minecraft_feedback_given", "true");
        localStorage.setItem("exismic_minecraft_feedback_sent_at", Date.now().toString());
        setIsSuccess(true);
        setCooldownActive(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 2500);
      }
    } catch (err: any) {
      console.error("Feedback submit error:", err);
      if (err?.response?.status === 429) {
        setCooldownActive(true);
      }
      setError(err?.response?.data?.error || "Could not send feedback. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("exismic_minecraft_feedback_given", "true");
    onClose();
  };

  if (!isOpen) return null;

  const currentDisplayRating = hoverRating || rating;
  const ratingInfo = RATING_LABELS[currentDisplayRating] || RATING_LABELS[5];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl transition-all"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
          className="relative w-full max-w-lg rounded-3xl bg-[#090b14]/95 border border-white/10 p-5 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(16,185,129,0.18)] z-10 space-y-5 overflow-hidden my-auto backdrop-blur-2xl"
        >
          {/* Ambient Glowing Mesh */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />

          {/* Header */}
          <div className="flex items-start justify-between relative z-10 border-b border-white/[0.07] pb-4">
            <div className="flex items-center gap-3.5">
              <div className="relative size-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)] shrink-0">
                <Gamepad2 size={22} className="relative z-10" />
                <span className="absolute inset-0 rounded-2xl bg-emerald-400/10 animate-pulse pointer-events-none" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                    Improve Minecraft Skin Maker
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                    BETA
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                  Be a part of making this tool even better!
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer group"
              title="Close"
            >
              <X size={16} className="transition-transform group-hover:rotate-90" />
            </button>
          </div>

          {cooldownActive && !isSuccess ? (
            <div className="py-8 text-center space-y-4 relative z-10">
              <div className="size-14 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 mx-auto shadow-[0_0_25px_rgba(6,182,212,0.25)]">
                <HeartHandshake size={28} />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-lg font-black text-white">Suggestions Recorded! ✦</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Thank you for contributing to the studio. Your ideas are currently being reviewed. To prevent spam, a 5-hour cooldown is active before new requests.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 text-center space-y-4 relative z-10"
            >
              <div className="size-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.35)]">
                <CheckCircle2 size={30} />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-white">Thank You for Your Feedback! 🎮</h4>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Your suggestions were delivered directly to the team to help make the Minecraft Skin Maker even better!
                </p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {/* Star Rating Box */}
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3.5 text-center space-y-2">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Rate Current Output
                  </span>
                  <span className={`text-[11px] font-extrabold transition-colors ${ratingInfo.color}`}>
                    {ratingInfo.label}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 pt-0.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= currentDisplayRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-125 active:scale-95 focus:outline-none cursor-pointer"
                      >
                        <Star
                          size={24}
                          className={`transition-all duration-150 ${
                            isFilled
                              ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)] scale-105"
                              : "text-zinc-600 hover:text-zinc-500"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feature Wishlist Chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-cyan-400" />
                    What should we add next?
                  </label>
                  <span className="text-[10px] text-zinc-500 font-medium">Select any</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {FEATURE_CHIPS.map((chip) => {
                    const isSelected = selectedFeatures.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => toggleFeature(chip)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer active:scale-95 ${
                          isSelected
                            ? "bg-emerald-500/20 border-emerald-400/80 text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.3)]"
                            : "bg-white/[0.02] border-white/8 text-zinc-400 hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        {isSelected ? <Check size={11} className="text-emerald-400" /> : null}
                        <span>{chip}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Written Suggestions */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                  <MessageSquareHeart size={12} className="text-emerald-400" />
                  Your Ideas & Suggestions
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what you'd love to see or how we can improve skin generation..."
                  rows={2}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10 resize-none font-medium transition-all"
                />
              </div>

              {/* User Info (Autofilled or manual) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name (Optional)"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10 font-medium transition-all"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your Email (Optional)"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10 font-medium transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center font-medium">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/8 text-zinc-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Maybe Later
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      Send Suggestions
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
