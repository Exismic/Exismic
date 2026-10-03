"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Code2,
  Compass,
  FileArchive,
  FileUser,
  Film,
  ImageMinus,
  Loader2,
  Search,
  Target,
  Waves,
  Zap,
  X,
  type LucideIcon,
} from "lucide-react";
import { ICON_MAP, type IconName } from "@/data/tools";
import { ExismicMark } from "@/components/ui/ExismicLogo";
import { cn } from "@/lib/utils";

interface Recommendation {
  id: string;
  name: string;
  description: string;
  href: string;
  category: string;
  icon: IconName;
  pro: boolean;
  reason?: string;
  confidence?: number;
}

interface ConciergeMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  recommendations?: Recommendation[];
}

interface StarterPrompt {
  label: string;
  prompt: string;
  category: string;
  icon: LucideIcon;
  badgeClass: string;
  iconContainerClass: string;
  hoverBorderClass: string;
}

const starterPrompts: StarterPrompt[] = [
  {
    label: "Remove Background",
    prompt: "Remove a photo background",
    category: "Image",
    icon: ImageMinus,
    badgeClass: "text-cyan-400 bg-cyan-500/10 border-cyan-400/25",
    iconContainerClass: "text-cyan-300 border-cyan-400/30 bg-cyan-500/10",
    hoverBorderClass: "hover:border-cyan-400/40 hover:bg-cyan-500/[0.06] hover:shadow-[0_0_20px_rgba(6,182,212,0.18)]",
  },
  {
    label: "Compress PDF",
    prompt: "Make a PDF file smaller without quality loss",
    category: "PDF",
    icon: FileArchive,
    badgeClass: "text-red-400 bg-red-500/10 border-red-400/25",
    iconContainerClass: "text-red-300 border-red-400/30 bg-red-500/10",
    hoverBorderClass: "hover:border-red-400/40 hover:bg-red-500/[0.06] hover:shadow-[0_0_20px_rgba(239,68,68,0.18)]",
  },
  {
    label: "Build Resume",
    prompt: "Create a professional printable resume",
    category: "Career",
    icon: FileUser,
    badgeClass: "text-emerald-400 bg-emerald-500/10 border-emerald-400/25",
    iconContainerClass: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10",
    hoverBorderClass: "hover:border-emerald-400/40 hover:bg-emerald-500/[0.06] hover:shadow-[0_0_20px_rgba(16,185,129,0.18)]",
  },
  {
    label: "Merge Videos",
    prompt: "Combine video scenes with audio into one video",
    category: "Video",
    icon: Film,
    badgeClass: "text-violet-400 bg-violet-500/10 border-violet-400/25",
    iconContainerClass: "text-violet-300 border-violet-400/30 bg-violet-500/10",
    hoverBorderClass: "hover:border-violet-400/40 hover:bg-violet-500/[0.06] hover:shadow-[0_0_20px_rgba(139,92,246,0.18)]",
  },
  {
    label: "Fix & Format Code",
    prompt: "Debug and improve my code snippet",
    category: "Dev",
    icon: Code2,
    badgeClass: "text-lime-400 bg-lime-500/10 border-lime-400/25",
    iconContainerClass: "text-lime-300 border-lime-400/30 bg-lime-500/10",
    hoverBorderClass: "hover:border-lime-400/40 hover:bg-lime-500/[0.06] hover:shadow-[0_0_20px_rgba(132,204,22,0.18)]",
  },
  {
    label: "Isolate Vocals",
    prompt: "Separate vocals and instrumental from music track",
    category: "Audio",
    icon: Waves,
    badgeClass: "text-pink-400 bg-pink-500/10 border-pink-400/25",
    iconContainerClass: "text-pink-300 border-pink-400/30 bg-pink-500/10",
    hoverBorderClass: "hover:border-pink-400/40 hover:bg-pink-500/[0.06] hover:shadow-[0_0_20px_rgba(236,72,153,0.18)]",
  },
];

interface CategoryTheme {
  label: string;
  badge: string;
  bestMatchBadge: string;
  iconBg: string;
  borderHover: string;
  glowHover: string;
  laserGradient: string;
  buttonClass: string;
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  video: {
    label: "Video Studio",
    badge: "text-violet-300 border-violet-400/25 bg-violet-500/10",
    bestMatchBadge: "text-violet-200 border-violet-400/40 bg-violet-500/20 shadow-[0_0_12px_rgba(139,92,246,0.35)]",
    iconBg: "border-violet-400/30 bg-violet-500/15 text-violet-300 group-hover/tool:border-violet-400/50 group-hover/tool:bg-violet-500/25 group-hover/tool:text-white",
    borderHover: "hover:border-violet-400/40 hover:bg-violet-950/20",
    glowHover: "hover:shadow-[0_16px_40px_rgba(139,92,246,0.2)]",
    laserGradient: "from-violet-500 via-purple-500 to-indigo-500",
    buttonClass: "border-violet-400/30 bg-violet-500/15 text-violet-200 group-hover/tool:bg-violet-600 group-hover/tool:text-white group-hover/tool:border-violet-400/50 shadow-[0_0_12px_rgba(139,92,246,0.25)]",
  },
  audio: {
    label: "Audio & Music",
    badge: "text-pink-300 border-pink-400/25 bg-pink-500/10",
    bestMatchBadge: "text-pink-200 border-pink-400/40 bg-pink-500/20 shadow-[0_0_12px_rgba(236,72,153,0.35)]",
    iconBg: "border-pink-400/30 bg-pink-500/15 text-pink-300 group-hover/tool:border-pink-400/50 group-hover/tool:bg-pink-500/25 group-hover/tool:text-white",
    borderHover: "hover:border-pink-400/40 hover:bg-pink-950/20",
    glowHover: "hover:shadow-[0_16px_40px_rgba(236,72,153,0.2)]",
    laserGradient: "from-pink-500 via-rose-500 to-fuchsia-500",
    buttonClass: "border-pink-400/30 bg-pink-500/15 text-pink-200 group-hover/tool:bg-pink-600 group-hover/tool:text-white group-hover/tool:border-pink-400/50 shadow-[0_0_12px_rgba(236,72,153,0.25)]",
  },
  image: {
    label: "Image Studio",
    badge: "text-cyan-300 border-cyan-400/25 bg-cyan-500/10",
    bestMatchBadge: "text-cyan-200 border-cyan-400/40 bg-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.35)]",
    iconBg: "border-cyan-400/30 bg-cyan-500/15 text-cyan-300 group-hover/tool:border-cyan-400/50 group-hover/tool:bg-cyan-400/25 group-hover/tool:text-white",
    borderHover: "hover:border-cyan-400/40 hover:bg-cyan-950/20",
    glowHover: "hover:shadow-[0_16px_40px_rgba(6,182,212,0.2)]",
    laserGradient: "from-cyan-400 via-teal-400 to-sky-500",
    buttonClass: "border-cyan-400/30 bg-cyan-500/15 text-cyan-200 group-hover/tool:bg-cyan-600 group-hover/tool:text-white group-hover/tool:border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]",
  },
  pdf: {
    label: "PDF Tools",
    badge: "text-red-300 border-red-400/25 bg-red-500/10",
    bestMatchBadge: "text-red-200 border-red-400/40 bg-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.35)]",
    iconBg: "border-red-400/30 bg-red-500/15 text-red-300 group-hover/tool:border-red-400/50 group-hover/tool:bg-red-500/25 group-hover/tool:text-white",
    borderHover: "hover:border-red-400/40 hover:bg-red-950/20",
    glowHover: "hover:shadow-[0_16px_40px_rgba(239,68,68,0.2)]",
    laserGradient: "from-red-500 via-rose-500 to-orange-500",
    buttonClass: "border-red-400/30 bg-red-500/15 text-red-200 group-hover/tool:bg-red-600 group-hover/tool:text-white group-hover/tool:border-red-400/50 shadow-[0_0_12px_rgba(239,68,68,0.25)]",
  },
  productivity: {
    label: "Productivity",
    badge: "text-emerald-300 border-emerald-400/25 bg-emerald-500/10",
    bestMatchBadge: "text-emerald-200 border-emerald-400/40 bg-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.35)]",
    iconBg: "border-emerald-400/30 bg-emerald-500/15 text-emerald-300 group-hover/tool:border-emerald-400/50 group-hover/tool:bg-emerald-500/25 group-hover/tool:text-white",
    borderHover: "hover:border-emerald-400/40 hover:bg-emerald-950/20",
    glowHover: "hover:shadow-[0_16px_40px_rgba(16,185,129,0.2)]",
    laserGradient: "from-emerald-400 via-teal-500 to-green-500",
    buttonClass: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200 group-hover/tool:bg-emerald-600 group-hover/tool:text-white group-hover/tool:border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]",
  },
  career: {
    label: "Career",
    badge: "text-emerald-300 border-emerald-400/25 bg-emerald-500/10",
    bestMatchBadge: "text-emerald-200 border-emerald-400/40 bg-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.35)]",
    iconBg: "border-emerald-400/30 bg-emerald-500/15 text-emerald-300 group-hover/tool:border-emerald-400/50 group-hover/tool:bg-emerald-500/25 group-hover/tool:text-white",
    borderHover: "hover:border-emerald-400/40 hover:bg-emerald-950/20",
    glowHover: "hover:shadow-[0_16px_40px_rgba(16,185,129,0.2)]",
    laserGradient: "from-emerald-400 via-teal-500 to-green-500",
    buttonClass: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200 group-hover/tool:bg-emerald-600 group-hover/tool:text-white group-hover/tool:border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]",
  },
  developer: {
    label: "Developer",
    badge: "text-lime-300 border-lime-400/25 bg-lime-500/10",
    bestMatchBadge: "text-lime-200 border-lime-400/40 bg-lime-500/20 shadow-[0_0_12px_rgba(132,204,22,0.35)]",
    iconBg: "border-lime-400/30 bg-lime-500/15 text-lime-300 group-hover/tool:border-lime-400/50 group-hover/tool:bg-lime-500/25 group-hover/tool:text-white",
    borderHover: "hover:border-lime-400/40 hover:bg-lime-950/20",
    glowHover: "hover:shadow-[0_16px_40px_rgba(132,204,22,0.2)]",
    laserGradient: "from-lime-400 via-emerald-500 to-green-500",
    buttonClass: "border-lime-400/30 bg-lime-500/15 text-lime-200 group-hover/tool:bg-lime-600 group-hover/tool:text-white group-hover/tool:border-lime-400/50 shadow-[0_0_12px_rgba(132,204,22,0.25)]",
  },
  dev: {
    label: "Developer",
    badge: "text-lime-300 border-lime-400/25 bg-lime-500/10",
    bestMatchBadge: "text-lime-200 border-lime-400/40 bg-lime-500/20 shadow-[0_0_12px_rgba(132,204,22,0.35)]",
    iconBg: "border-lime-400/30 bg-lime-500/15 text-lime-300 group-hover/tool:border-lime-400/50 group-hover/tool:bg-lime-500/25 group-hover/tool:text-white",
    borderHover: "hover:border-lime-400/40 hover:bg-lime-950/20",
    glowHover: "hover:shadow-[0_16px_40px_rgba(132,204,22,0.2)]",
    laserGradient: "from-lime-400 via-emerald-500 to-green-500",
    buttonClass: "border-lime-400/30 bg-lime-500/15 text-lime-200 group-hover/tool:bg-lime-600 group-hover/tool:text-white group-hover/tool:border-lime-400/50 shadow-[0_0_12px_rgba(132,204,22,0.25)]",
  },
  business: {
    label: "Business",
    badge: "text-orange-300 border-orange-400/25 bg-orange-500/10",
    bestMatchBadge: "text-orange-200 border-orange-400/40 bg-orange-500/20 shadow-[0_0_12px_rgba(249,115,22,0.35)]",
    iconBg: "border-orange-400/30 bg-orange-500/15 text-orange-300 group-hover/tool:border-orange-400/50 group-hover/tool:bg-orange-500/25 group-hover/tool:text-white",
    borderHover: "hover:border-orange-400/40 hover:bg-orange-950/20",
    glowHover: "hover:shadow-[0_16px_40px_rgba(249,115,22,0.2)]",
    laserGradient: "from-orange-400 via-amber-500 to-yellow-500",
    buttonClass: "border-orange-400/30 bg-orange-500/15 text-orange-200 group-hover/tool:bg-orange-600 group-hover/tool:text-white group-hover/tool:border-orange-400/50 shadow-[0_0_12px_rgba(249,115,22,0.25)]",
  },
  ai: {
    label: "AI Studio",
    badge: "text-amber-300 border-amber-400/25 bg-amber-500/10",
    bestMatchBadge: "text-amber-200 border-amber-400/40 bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.35)]",
    iconBg: "border-amber-400/30 bg-amber-500/15 text-amber-300 group-hover/tool:border-amber-400/50 group-hover/tool:bg-amber-500/25 group-hover/tool:text-white",
    borderHover: "hover:border-amber-400/40 hover:bg-amber-950/20",
    glowHover: "hover:shadow-[0_16px_40px_rgba(245,158,11,0.2)]",
    laserGradient: "from-amber-400 via-orange-500 to-yellow-500",
    buttonClass: "border-amber-400/30 bg-amber-500/15 text-amber-200 group-hover/tool:bg-amber-600 group-hover/tool:text-white group-hover/tool:border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]",
  },
};

const getCategoryTheme = (category?: string): CategoryTheme => {
  const key = (category || "").toLowerCase();
  return CATEGORY_THEMES[key] || CATEGORY_THEMES.video;
};

export function HomeToolConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ConciergeMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hidden = sessionStorage.getItem("exismic_hide_concierge") === "true";
      if (hidden) setIsDismissed(true);
    }
    const timer = window.setTimeout(() => setShowIntro(false), 2600);
    
    const handleRestore = () => {
      setIsDismissed(false);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("exismic_hide_concierge");
      }
      setIsOpen(true);
    };

    window.addEventListener("exismic_restore_ai_assistant", handleRestore);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("exismic_restore_ai_assistant", handleRestore);
    };
  }, []);

  const handleHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("exismic_hide_concierge", "true");
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const sendMessage = async (rawMessage: string) => {
    const message = rawMessage.trim();
    if (!message || isLoading) return;

    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", content: message },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/tools/ai/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = (await response.json()) as {
        reply?: string;
        recommendations?: Recommendation[];
        error?: string;
      };

      if (!response.ok) throw new Error(data.error || "Exismic Ai is unavailable.");

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.reply || "Tell me a little more about the result you need.",
          recommendations: data.recommendations || [],
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: error instanceof Error
            ? error.message
            : "I could not match that request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && !isDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="group/launcher fixed bottom-3 right-3 z-40 sm:bottom-4 sm:right-4"
          >
            {/* Temporary Dismiss / Hide Button */}
            <button
              type="button"
              onClick={handleHide}
              title="Hide AI assistant for this session"
              aria-label="Hide AI assistant"
              className="absolute -top-2 -left-2 z-30 flex size-5 items-center justify-center rounded-full border border-white/20 bg-[#080914]/90 text-zinc-400 opacity-0 shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-red-400/40 hover:bg-red-500/20 hover:text-white group-hover/launcher:opacity-100 active:scale-95"
            >
              <X size={10} strokeWidth={2.5} />
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className={cn(
                "group relative isolate flex h-14 w-14 items-center justify-start overflow-hidden rounded-2xl p-[1px] text-left shadow-[0_22px_70px_rgba(0,0,0,0.58),0_0_35px_rgba(124,58,237,0.25)] transition-[width,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(109,40,217,0.38),0_0_45px_rgba(6,182,212,0.3)] active:scale-95 sm:h-16",
                showIntro ? "sm:w-[190px]" : "sm:w-16 sm:hover:w-[190px]"
              )}
              aria-label="Ask Exismic Ai to find a tool"
            >
              <span className="absolute -inset-[120%] animate-[spin_3.6s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,#7c3aed_72deg,#ec4899_125deg,#22d3ee_178deg,transparent_235deg)] opacity-80 motion-reduce:animate-none" />
              <span className="absolute inset-[1px] rounded-[15px] bg-[linear-gradient(118deg,#070812_0%,#0c0a18_48%,#061018_100%)]" />
              <span className="absolute inset-y-1 left-1 w-12 rounded-xl bg-[radial-gradient(circle,rgba(139,92,246,0.25),transparent_68%)] opacity-70 blur-md transition-opacity duration-500 group-hover:opacity-100 sm:w-14" />
              <span className="absolute inset-0 rounded-2xl bg-[linear-gradient(110deg,transparent_18%,rgba(255,255,255,0.08)_45%,transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <motion.span
                aria-hidden="true"
                initial={{ x: "-180%" }}
                animate={{ x: "520%" }}
                transition={{ delay: 0.35, duration: 1.2, ease: "easeInOut" }}
                className="absolute inset-y-0 z-10 w-8 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent blur-sm"
              />

              <span className="relative z-20 flex size-14 shrink-0 scale-[0.84] items-center justify-center sm:size-[62px] sm:scale-100">
                <ExismicMark size={50} />
              </span>

              <span
                className={cn(
                  "relative z-20 hidden overflow-hidden whitespace-nowrap pr-5 text-[10px] font-black uppercase tracking-[0.16em] text-white transition-[max-width,opacity,transform] duration-500 sm:inline-block",
                  showIntro
                    ? "max-w-[120px] translate-x-0 opacity-100"
                    : "max-w-0 -translate-x-2 opacity-0 group-hover:max-w-[120px] group-hover:translate-x-0 group-hover:opacity-100"
                )}
              >
                Ask Exismic Ai
              </span>
            </button>
          </motion.div>
        )}

        {!isOpen && isDismissed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-3 right-3 z-40 sm:bottom-6 sm:right-6"
          >
            <button
              type="button"
              onClick={() => {
                setIsDismissed(false);
                if (typeof window !== "undefined") {
                  sessionStorage.removeItem("exismic_hide_concierge");
                }
                setIsOpen(true);
              }}
              title="Open AI Assistant"
              aria-label="Open AI Assistant"
              className="flex size-7 items-center justify-center rounded-full border border-white/15 bg-[#080914]/80 text-zinc-500 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-purple-400/40 hover:bg-purple-500/20 hover:text-cyan-300 opacity-40 hover:opacity-100 active:scale-95 cursor-pointer"
            >
              <ExismicMark size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 27 }}
            className="fixed inset-x-2 bottom-2 z-50 mx-auto flex max-h-[min(660px,calc(100dvh-1.5rem))] max-w-[475px] flex-col overflow-hidden rounded-[26px] border-2 border-purple-500/50 bg-[#070814]/95 shadow-[0_32px_100px_rgba(0,0,0,0.88),0_0_50px_rgba(124,58,237,0.25)] backdrop-blur-3xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-h-[min(670px,calc(100dvh-3rem))] sm:w-[475px]"
            aria-label="Exismic Ai tool concierge"
          >

            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 size-48 rounded-full bg-purple-600/15 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between gap-3 border-b border-white/[0.08] bg-black/30 px-4 py-3.5 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/25 bg-purple-500/10 p-1 shadow-[0_0_12px_rgba(168,85,247,0.2)]">
                  <ExismicMark size={36} />
                </div>
                <div className="min-w-0">
                  <h2 className="bg-gradient-to-r from-white via-violet-100 to-cyan-100 bg-clip-text text-sm font-black uppercase tracking-[0.16em] text-transparent">
                    Exismic Ai
                  </h2>
                  <p className="mt-0.5 flex items-center gap-2 text-[10.5px] font-semibold text-zinc-400">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                    </span>
                    Ready to route your idea
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition hover:rotate-90 hover:border-red-400/30 hover:bg-red-500/10 hover:text-white active:scale-95"
                aria-label="Close Exismic Ai"
              >
                <X size={16} />
              </button>
            </header>

            {/* Content & Message Stream Area */}
            <div
              ref={scrollRef}
              className="custom-scrollbar relative z-10 flex-1 space-y-4 overflow-y-auto px-3.5 py-4 sm:p-5"
            >
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="space-y-4 py-1"
                >
                  {/* Hero Intent Card */}
                  <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-[linear-gradient(135deg,rgba(139,92,246,0.18),rgba(255,255,255,0.03)_50%,rgba(6,182,212,0.12))] p-4.5 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400 to-cyan-400 opacity-70" />

                    <div className="mb-3 flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/15 px-2.5 py-0.5 text-[9.5px] font-black uppercase tracking-[0.2em] text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.25)]">
                        <Compass size={12} className="text-violet-400" />
                        AI Suite Navigator
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 font-semibold">40+ Studio Tools</span>
                    </div>

                    <h3 className="relative text-xl sm:text-2xl font-black leading-tight tracking-tight text-white font-outfit">
                      What do you want to{" "}
                      <span className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-cyan-300 bg-clip-text text-transparent">
                        create today?
                      </span>
                    </h3>
                    <p className="relative mt-2 text-xs sm:text-sm font-medium leading-relaxed text-zinc-300">
                      Describe any task in everyday English. Exismic AI instantly maps you to the exact tool and opens it in one click.
                    </p>

                    <div className="relative mt-3.5 flex flex-wrap gap-1.5">
                      <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-violet-400/25 bg-black/40 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-violet-200 backdrop-blur-md">
                        <Zap size={11} className="text-violet-400" />
                        Instant Match
                      </span>
                      <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-cyan-400/25 bg-black/40 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-cyan-200 backdrop-blur-md">
                        <Target size={11} className="text-cyan-400" />
                        Smart Routing
                      </span>
                      <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-emerald-400/25 bg-black/40 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-200 backdrop-blur-md">
                        <CheckCircle2 size={11} className="text-emerald-400" />
                        1-Click Launch
                      </span>
                    </div>
                  </div>

                  {/* Starter Examples Grid */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between px-0.5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        Popular Quick Starts
                      </p>
                      <span className="text-[10px] text-zinc-400">Tap any to test</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {starterPrompts.map((prompt) => {
                        const PromptIcon = prompt.icon;
                        return (
                          <button
                            key={prompt.prompt}
                            type="button"
                            onClick={() => void sendMessage(prompt.prompt)}
                            className={cn(
                              "group/prompt relative flex min-h-[58px] items-center gap-2.5 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] p-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer",
                              prompt.hoverBorderClass
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-8.5 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 group-hover/prompt:scale-105",
                                prompt.iconContainerClass
                              )}
                            >
                              <PromptIcon size={15} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <span
                                className={cn(
                                  "inline-block text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded border mb-0.5",
                                  prompt.badgeClass
                                )}
                              >
                                {prompt.category}
                              </span>
                              <span className="block text-xs font-bold leading-snug text-white group-hover/prompt:text-white transition-colors line-clamp-2 break-words">
                                {prompt.label}
                              </span>
                            </div>
                            <ArrowUpRight
                              size={13}
                              className="ml-auto shrink-0 text-zinc-500 transition-transform duration-200 group-hover/prompt:-translate-y-0.5 group-hover/prompt:translate-x-0.5 group-hover/prompt:text-white"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Chat Messages */}
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "space-y-3",
                    message.role === "user" ? "ml-6 sm:ml-10" : "mr-2 sm:mr-6"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl border px-4 py-3.5 text-xs sm:text-sm font-medium leading-relaxed shadow-lg backdrop-blur-md",
                      message.role === "assistant"
                        ? "border-white/[0.1] bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] text-zinc-200"
                        : "border-purple-400/30 bg-[linear-gradient(135deg,rgba(124,58,237,0.3),rgba(34,211,238,0.12))] text-white shadow-[0_0_20px_rgba(124,58,237,0.15)]"
                    )}
                  >
                    {message.content}
                  </div>

                  {message.recommendations?.length ? (
                    <div className="space-y-3 pt-1">
                      {message.recommendations.map((recommendation, index) => {
                        const ToolIcon = ICON_MAP[recommendation.icon] || Compass;
                        const theme = getCategoryTheme(recommendation.category);
                        return (
                          <Link
                            key={recommendation.id}
                            href={recommendation.href}
                            className={cn(
                              "group/tool relative flex flex-col gap-2.5 overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0c0e20]/90 p-3.5 sm:p-4 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]",
                              theme.borderHover,
                              theme.glowHover
                            )}
                          >
                            {/* Category reactive laser accent bar on left */}
                            <span
                              className={cn(
                                "absolute inset-y-0 left-0 w-1 bg-gradient-to-b transition-opacity duration-300",
                                theme.laserGradient,
                                index === 0 ? "opacity-100" : "opacity-40 group-hover/tool:opacity-100"
                              )}
                            />

                            {/* Top row: Icon + Tool Name + Category/Best Match Badges + Open button */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={cn(
                                    "flex size-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 group-hover/tool:scale-105",
                                    theme.iconBg
                                  )}
                                >
                                  <ToolIcon size={20} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                    <span
                                      className={cn(
                                        "rounded-md border px-1.5 py-0.2 text-[7.5px] font-black uppercase tracking-wider",
                                        theme.badge
                                      )}
                                    >
                                      {theme.label}
                                    </span>
                                    {index === 0 && (
                                      <span
                                        className={cn(
                                          "rounded-md border px-1.5 py-0.2 text-[7.5px] font-black uppercase tracking-wider",
                                          theme.bestMatchBadge
                                        )}
                                      >
                                        Best match
                                      </span>
                                    )}
                                    {recommendation.pro && (
                                      <span className="rounded-md border border-purple-400/30 bg-purple-400/15 px-1.5 py-0.2 text-[7.5px] font-black uppercase tracking-wider text-purple-200">
                                        Pro
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-sm sm:text-base font-bold text-white group-hover/tool:text-white transition-colors truncate">
                                    {recommendation.name}
                                  </h4>
                                </div>
                              </div>

                              {/* Interactive Open Tool Pill */}
                              <div
                                className={cn(
                                  "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all duration-300 shrink-0",
                                  theme.buttonClass
                                )}
                              >
                                <span>Open</span>
                                <ArrowRight
                                  size={13}
                                  className="transition-transform duration-200 group-hover/tool:translate-x-0.5"
                                />
                              </div>
                            </div>

                            {/* Description text */}
                            <p className="text-xs font-medium leading-relaxed text-zinc-300 line-clamp-2 pl-0.5">
                              {recommendation.description}
                            </p>

                            {/* Footer info: match % and reason */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06] text-[10px]">
                              {typeof recommendation.confidence === "number" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                  <Target size={11} className="text-emerald-400 shrink-0" />
                                  {recommendation.confidence}% match
                                </span>
                              )}
                              {recommendation.reason && (
                                <span className="line-clamp-1 text-zinc-400 font-medium">
                                  {recommendation.reason}
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-2xl border border-violet-500/25 bg-[#090b1c]/90 p-3.5 sm:p-4 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(139,92,246,0.15)] backdrop-blur-xl"
                >
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* High-tech pulsing scanner orb */}
                      <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/15 shadow-[0_0_15px_rgba(139,92,246,0.25)]">
                        <span className="absolute size-5 rounded-full border border-violet-400/40 animate-ping opacity-60" />
                        <span className="absolute size-6 rounded-full border border-t-cyan-400 border-r-transparent border-b-violet-400 border-l-transparent animate-spin" />
                        <Bot size={15} className="text-violet-300" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-bold text-white tracking-tight">
                            Mapping your request...
                          </p>
                          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.2 text-[8px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                            Neural Router
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] font-medium text-zinc-400">
                          Scanning 40+ creative tools for the best match
                        </p>
                      </div>
                    </div>

                    {/* Animated Waveform / Neural Dots */}
                    <div className="flex items-center gap-1 shrink-0 px-1">
                      <span className="size-1.5 rounded-full bg-violet-400 animate-[bounce_1s_infinite_100ms]" />
                      <span className="size-1.5 rounded-full bg-cyan-400 animate-[bounce_1s_infinite_250ms]" />
                      <span className="size-1.5 rounded-full bg-fuchsia-400 animate-[bounce_1s_infinite_400ms]" />
                    </div>
                  </div>

                  {/* Shimmering Laser Progress Bar */}
                  <div className="relative mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-transparent via-violet-500 to-cyan-400 animate-[shimmer_1.5s_infinite_linear]" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Redesigned Premium Input / Composer Bar */}
            <div className="relative z-10 border-t border-white/[0.08] bg-[#070914]/90 p-3 sm:p-3.5 backdrop-blur-2xl">
              <form
                onSubmit={handleSubmit}
                className="group/composer relative flex items-center gap-2 rounded-2xl border border-white/[0.12] bg-[#0c0e1e] p-1.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-300 focus-within:border-violet-500/50 focus-within:bg-[#0f1226] focus-within:shadow-[0_0_25px_rgba(139,92,246,0.2)]"
              >
                <div className="flex items-center pl-3 text-zinc-400 group-focus-within/composer:text-violet-400 transition-colors shrink-0">
                  <Search size={16} strokeWidth={2.2} />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value.slice(0, 500))}
                  placeholder="Describe any task (e.g. compress video, build resume)..."
                  className="w-full flex-1 bg-transparent px-2.5 py-2 text-xs sm:text-sm font-medium text-white outline-none placeholder:text-zinc-500"
                />
                <span className="hidden sm:inline-flex items-center text-[10px] font-mono text-zinc-400 border border-white/10 rounded-md px-1.5 py-0.5 shrink-0 select-none">
                  Enter ↵
                </span>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-white shadow-md transition-all duration-200 active:scale-90",
                    input.trim() && !isLoading
                      ? "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:brightness-110 cursor-pointer"
                      : "bg-white/[0.06] text-zinc-600 cursor-not-allowed opacity-40"
                  )}
                  aria-label="Send request"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ArrowUp size={17} strokeWidth={2.5} />
                  )}
                </button>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
