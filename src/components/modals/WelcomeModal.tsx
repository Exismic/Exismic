"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Flame, Command, Rocket, X, ArrowRight, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function checkWelcomeStatus() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user || !isMounted) return;

        const uid = session.user.id;
        setUserId(uid);

        const displayName =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          session.user.email?.split("@")[0] ||
          "Creator";
        setUserName(displayName);

        // Check if user already dismissed local storage flag as fast fallback
        const localKey = `exismic_welcome_dismissed_${uid}`;
        if (localStorage.getItem(localKey) === "true") {
          return;
        }

        const hasWelcomeQueryParam = searchParams.get("welcome") === "true";

        // Fetch user profile from API to verify has_seen_welcome DB state
        const res = await fetch("/api/user/profile", { cache: "no-store" });
        if (!res.ok) return;

        const profileData = await res.json();
        if (!isMounted) return;

        const hasSeenWelcome = profileData?.user?.has_seen_welcome;

        // Trigger welcome modal ONLY if user has NOT seen it yet or landed with ?welcome=true
        if (hasSeenWelcome === false || hasWelcomeQueryParam) {
          setIsOpen(true);

          // Trigger confetti
          const duration = 2.5 * 1000;
          const animationEnd = Date.now() + duration;
          const defaults = { startVelocity: 25, spread: 360, ticks: 60, zIndex: 300 };

          const interval: ReturnType<typeof setInterval> = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);

            const particleCount = 40 * (timeLeft / duration);
            confetti({
              ...defaults,
              particleCount,
              origin: { x: Math.random() * 0.4 + 0.1, y: Math.random() * 0.3 + 0.1 },
            });
            confetti({
              ...defaults,
              particleCount,
              origin: { x: Math.random() * 0.4 + 0.5, y: Math.random() * 0.3 + 0.1 },
            });
          }, 300);

          // Clean URL query param if present
          if (hasWelcomeQueryParam) {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("welcome");
            const newQuery = params.toString();
            const newPath = newQuery ? `${pathname}?${newQuery}` : pathname;
            router.replace(newPath, { scroll: false });
          }
        }
      } catch (err) {
        console.error("[WelcomeModal] Check failed:", err);
      }
    }

    void checkWelcomeStatus();

    return () => {
      isMounted = false;
    };
  }, [pathname, searchParams, router]);

  const handleDismiss = async (redirectPath?: string) => {
    setIsOpen(false);
    if (userId) {
      localStorage.setItem(`exismic_welcome_dismissed_${userId}`, "true");
    }

    try {
      await fetch("/api/user/welcome", { method: "POST" });
    } catch (err) {
      console.error("[WelcomeModal] Mark as seen error:", err);
    }

    if (redirectPath) {
      router.push(redirectPath);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => void handleDismiss()}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl p-[1px] bg-gradient-to-b from-purple-500/40 via-cyan-500/20 to-pink-500/40 shadow-[0_0_60px_rgba(139,92,246,0.25)] z-10"
        >
          {/* Inner Content Box */}
          <div className="relative rounded-[23px] bg-[#090a10]/95 p-6 sm:p-8 backdrop-blur-2xl border border-white/10 text-white">
            {/* Background Glow */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-purple-600/30 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-cyan-500/20 blur-[80px]" />

            {/* Close Button */}
            <button
              onClick={() => void handleDismiss()}
              className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close welcome modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold tracking-wide uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              Welcome to Exismic
            </div>

            {/* Title & Greeting */}
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Welcome aboard,{" "}
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
                {userName}!
              </span>{" "}
              🚀
            </h2>
            <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
              Your account is ready! We&apos;ve loaded your balance with{" "}
              <span className="font-bold text-amber-300">50 Free Daily Credits</span> so you can start creating immediately.
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {/* Highlight 1 */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-purple-500/40 transition-colors">
                <div className="flex items-center gap-2.5 mb-1 text-amber-400 font-semibold text-sm">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                  <span>50 Free Credits</span>
                </div>
                <p className="text-xs text-zinc-400">Refreshed every day automatically at midnight UTC.</p>
              </div>

              {/* Highlight 2 */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 transition-colors">
                <div className="flex items-center gap-2.5 mb-1 text-cyan-400 font-semibold text-sm">
                  <Rocket className="w-4 h-4 text-cyan-400" />
                  <span>AI Creation Suite</span>
                </div>
                <p className="text-xs text-zinc-400">Generators for Image, Video, Audio, and Code.</p>
              </div>

              {/* Highlight 3 */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-pink-500/40 transition-colors">
                <div className="flex items-center gap-2.5 mb-1 text-pink-400 font-semibold text-sm">
                  <Flame className="w-4 h-4 text-pink-400" />
                  <span>Daily Streaks</span>
                </div>
                <p className="text-xs text-zinc-400">Log in daily to claim bonus reward credits.</p>
              </div>

              {/* Highlight 4 */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-purple-500/40 transition-colors">
                <div className="flex items-center gap-2.5 mb-1 text-purple-400 font-semibold text-sm">
                  <Command className="w-4 h-4 text-purple-400" />
                  <span>Magic Palette</span>
                </div>
                <p className="text-xs text-zinc-400">Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-zinc-200">Ctrl + K</kbd> to launch tools anytime.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => void handleDismiss("/tools")}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-semibold text-sm hover:opacity-95 shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all active:scale-[0.98]"
              >
                <span>Start Creating Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => void handleDismiss("/dashboard")}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-zinc-200 font-semibold text-sm border border-white/10 transition-all active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                <span>Explore Dashboard</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
