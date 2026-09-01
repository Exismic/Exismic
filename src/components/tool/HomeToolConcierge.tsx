"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Compass,
  FileArchive,
  FileUser,
  ImageIcon,
  ImageMinus,
  Loader2,
  MessageSquare,
  Sparkles,
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

const starterPrompts: Array<{ label: string; prompt: string; icon: LucideIcon }> = [
  { label: "Remove a background", prompt: "Remove a photo background", icon: ImageMinus },
  { label: "Compress a PDF", prompt: "Make a PDF smaller", icon: FileArchive },
  { label: "Build a resume", prompt: "Create a professional resume", icon: FileUser },
  { label: "Make a thumbnail", prompt: "Create a YouTube thumbnail", icon: ImageIcon },
  { label: "Build a support bot", prompt: "Create a website support chatbot", icon: MessageSquare },
  { label: "Fix code", prompt: "Debug and improve my code", icon: Code2 },
];

const routingPills = ["Smart routing", "Best-match tools", "Instant launch"];

export function HomeToolConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ConciergeMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        textareaRef.current?.focus();
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
            className="group/launcher fixed bottom-4 right-4 z-40 sm:bottom-7 sm:right-7"
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
            className="fixed inset-x-2 bottom-2 z-50 mx-auto flex max-h-[min(660px,calc(100dvh-1.5rem))] max-w-[475px] flex-col overflow-hidden rounded-[26px] border border-white/[0.12] bg-[#070814]/95 shadow-[0_32px_100px_rgba(0,0,0,0.88),0_0_60px_rgba(124,58,237,0.15)] backdrop-blur-3xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-h-[min(670px,calc(100dvh-3rem))] sm:w-[475px]"
            aria-label="Exismic Ai tool concierge"
          >
            {/* Top Glowing Laser Streak */}
            <motion.div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 z-30 h-[2px] bg-[linear-gradient(90deg,transparent,#8b5cf6,#ec4899,#22d3ee,transparent)] bg-[length:200%_100%]"
              animate={{ backgroundPosition: ["100% 0%", "-100% 0%"] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
            />

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
                  <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(255,255,255,0.03)_50%,rgba(34,211,238,0.1))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-5">
                    <div className="mb-3 flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-[0.18em] text-cyan-300">
                      <Compass size={13} className="text-cyan-300" />
                      Intent router
                    </div>
                    <h3 className="relative max-w-sm text-xl font-black leading-tight tracking-tight text-white sm:text-2xl">
                      Tell me the outcome.
                    </h3>
                    <p className="relative mt-2 max-w-sm text-xs sm:text-sm font-medium leading-relaxed text-zinc-300">
                      Explain what you want to create, edit, convert, or improve. I will take you straight to the best tool.
                    </p>
                    <div className="relative mt-3.5 flex flex-wrap gap-1.5">
                      {routingPills.map((pill) => (
                        <span
                          key={pill}
                          className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-white/[0.1] bg-black/30 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-300 shadow-sm backdrop-blur-md"
                        >
                          <CheckCircle2 size={11} className="text-cyan-300" />
                          {pill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Starter Examples Grid */}
                  <div>
                    <p className="mb-2.5 text-[9.5px] font-black uppercase tracking-[0.18em] text-zinc-400">
                      Start with an example
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {starterPrompts.map((prompt) => {
                        const PromptIcon = prompt.icon;
                        return (
                          <button
                            key={prompt.prompt}
                            type="button"
                            onClick={() => void sendMessage(prompt.prompt)}
                            className="group/prompt relative flex min-h-[58px] items-center gap-3 overflow-hidden rounded-xl border border-white/[0.09] bg-white/[0.03] px-3 py-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-cyan-500/[0.06] hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] active:scale-[0.98]"
                          >
                            <span className="pointer-events-none absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-cyan-400 to-purple-500 opacity-0 transition group-hover/prompt:opacity-100" />
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-black/40 text-cyan-300 transition group-hover/prompt:border-cyan-400/30 group-hover/prompt:text-white group-hover/prompt:scale-105">
                              <PromptIcon size={16} />
                            </span>
                            <span className="text-xs font-bold leading-snug text-zinc-200 transition group-hover/prompt:text-white">
                              {prompt.label}
                            </span>
                            <ArrowUpRight size={14} className="ml-auto shrink-0 text-zinc-500 transition-transform duration-200 group-hover/prompt:-translate-y-0.5 group-hover/prompt:translate-x-0.5 group-hover/prompt:text-cyan-300" />
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
                    <div className="space-y-2.5 pt-1">
                      {message.recommendations.map((recommendation, index) => {
                        const ToolIcon = ICON_MAP[recommendation.icon] || Compass;
                        return (
                          <Link
                            key={recommendation.id}
                            href={recommendation.href}
                            className="group/tool relative flex min-h-[82px] items-center gap-3 overflow-hidden rounded-2xl border border-white/[0.1] bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-3.5 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-500/[0.05] hover:shadow-[0_16px_40px_rgba(6,182,212,0.15)] active:scale-[0.99]"
                          >
                            <span className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-violet-400 via-fuchsia-400 to-cyan-300 opacity-80" />
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 text-cyan-300 transition group-hover/tool:border-cyan-300/40 group-hover/tool:bg-cyan-400/10 group-hover/tool:text-white group-hover/tool:scale-105">
                              <ToolIcon size={20} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="truncate text-xs sm:text-sm font-bold text-white group-hover/tool:text-cyan-200 transition-colors">
                                  {recommendation.name}
                                </span>
                                {index === 0 && (
                                  <span className="rounded-full border border-cyan-300/30 bg-cyan-300/15 px-2 py-0.5 text-[7.5px] font-black uppercase tracking-wider text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                                    Best match
                                  </span>
                                )}
                                {recommendation.pro && (
                                  <span className="rounded-full border border-purple-400/30 bg-purple-400/15 px-2 py-0.5 text-[7.5px] font-black uppercase tracking-wider text-purple-200">
                                    Pro
                                  </span>
                                )}
                              </span>
                              <span className="mt-0.5 line-clamp-1 block text-[11px] font-medium text-zinc-400">
                                {recommendation.description}
                              </span>
                              <span className="mt-1.5 flex flex-wrap items-center gap-2 text-[9.5px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                {typeof recommendation.confidence === "number" && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-emerald-300 font-mono">
                                    <Sparkles size={9} />
                                    {recommendation.confidence}% match
                                  </span>
                                )}
                                {recommendation.reason && (
                                  <span className="line-clamp-1 normal-case tracking-normal text-zinc-400">
                                    {recommendation.reason}
                                  </span>
                                )}
                              </span>
                            </span>
                            <ArrowUpRight
                              size={16}
                              className="shrink-0 text-zinc-500 transition-transform duration-200 group-hover/tool:-translate-y-0.5 group-hover/tool:translate-x-0.5 group-hover/tool:text-cyan-300"
                            />
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-3 rounded-2xl border border-purple-400/20 bg-purple-500/10 px-4 py-3 text-xs font-semibold text-zinc-300 shadow-md backdrop-blur-md">
                  <span className="relative flex size-7 items-center justify-center rounded-lg border border-purple-400/30 bg-black/40 text-cyan-300">
                    <Loader2 size={15} className="animate-spin text-cyan-300" />
                  </span>
                  <span className="animate-pulse">Mapping your request to Exismic...</span>
                </div>
              )}
            </div>

            {/* Redesigned Premium Input / Composer Bar */}
            <div className="relative z-10 border-t border-white/[0.08] bg-black/40 p-3 sm:p-3.5 backdrop-blur-2xl">
              <form
                onSubmit={handleSubmit}
                className="group/composer relative flex items-center gap-2 rounded-2xl border border-white/[0.12] bg-[#0b0d1e]/85 p-1.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.4)] transition-all duration-300 focus-within:border-cyan-400/50 focus-within:bg-[#0e1126] focus-within:shadow-[0_0_25px_rgba(6,182,212,0.15)]"
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value.slice(0, 500))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      if (input.trim()) void sendMessage(input);
                    }
                  }}
                  placeholder="Example: remove the background from my product photo"
                  rows={1}
                  className="min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-xs sm:text-sm font-medium text-white outline-none placeholder:text-zinc-500"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-white shadow-md transition-all duration-200 active:scale-90",
                    input.trim() && !isLoading
                      ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 shadow-[0_0_18px_rgba(6,182,212,0.4)] hover:brightness-110 cursor-pointer"
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
