"use client";

import { FormEvent, useEffect, useState } from "react";
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
import { LumoraMark } from "@/components/ui/LumoraLogo";
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
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ConciergeMessage[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntro(false), 2600);
    return () => window.clearTimeout(timer);
  }, []);

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

      if (!response.ok) throw new Error(data.error || "Lumora AI is unavailable.");

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
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="fixed bottom-4 right-4 z-40 sm:bottom-7 sm:right-7"
          >
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className={cn(
                "group relative isolate flex h-16 items-center justify-start overflow-hidden rounded-2xl p-[1px] text-left shadow-[0_22px_70px_rgba(0,0,0,0.58)] transition-[width,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(109,40,217,0.24)]",
                showIntro ? "w-[190px]" : "w-16 hover:w-[190px]"
              )}
              aria-label="Ask Lumora AI to find a tool"
            >
              <span className="absolute -inset-[120%] animate-[spin_3.6s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,#7c3aed_72deg,#ec4899_125deg,#22d3ee_178deg,transparent_235deg)] opacity-80 motion-reduce:animate-none" />
              <span className="absolute inset-[1px] rounded-[15px] bg-[linear-gradient(118deg,#070812_0%,#0c0a18_48%,#061018_100%)]" />
              <span className="absolute inset-y-1 left-1 w-14 rounded-xl bg-[radial-gradient(circle,rgba(139,92,246,0.22),transparent_68%)] opacity-70 blur-md transition-opacity duration-500 group-hover:opacity-100" />
              <span className="absolute inset-0 rounded-2xl bg-[linear-gradient(110deg,transparent_18%,rgba(255,255,255,0.08)_45%,transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <motion.span
                aria-hidden="true"
                initial={{ x: "-180%" }}
                animate={{ x: "520%" }}
                transition={{ delay: 0.35, duration: 1.2, ease: "easeInOut" }}
                className="absolute inset-y-0 z-10 w-8 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent blur-sm"
              />

              <span className="relative z-20 flex size-[62px] shrink-0 items-center justify-center">
                <LumoraMark size={50} />
              </span>

              <span
                className={cn(
                  "relative z-20 overflow-hidden whitespace-nowrap pr-5 text-[10px] font-black uppercase tracking-[0.16em] text-white transition-[max-width,opacity,transform] duration-500",
                  showIntro
                    ? "max-w-[120px] translate-x-0 opacity-100"
                    : "max-w-0 -translate-x-2 opacity-0 group-hover:max-w-[120px] group-hover:translate-x-0 group-hover:opacity-100"
                )}
              >
                Ask Lumora AI
              </span>
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
            transition={{ type: "spring", stiffness: 260, damping: 27 }}
            className="fixed inset-x-2 bottom-2 z-50 mx-auto flex max-h-[min(720px,calc(100dvh-1rem))] max-w-[470px] flex-col overflow-hidden rounded-[26px] border border-white/[0.1] bg-[linear-gradient(145deg,rgba(12,10,24,0.98),rgba(4,7,12,0.99)_55%,rgba(4,13,17,0.98))] shadow-[0_35px_120px_rgba(0,0,0,0.82),0_0_70px_rgba(91,33,182,0.13)] backdrop-blur-2xl sm:inset-x-auto sm:bottom-7 sm:right-7 sm:max-h-[min(720px,calc(100dvh-4rem))] sm:w-[470px]"
            aria-label="Lumora AI tool concierge"
          >
            <motion.div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 z-30 h-px bg-[linear-gradient(90deg,transparent,#8b5cf6,#ec4899,#22d3ee,transparent)] bg-[length:220%_100%]"
              animate={{ backgroundPosition: ["100% 0%", "-120% 0%"] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:28px_28px] opacity-30" />

            <header className="relative z-10 flex items-center justify-between gap-3 border-b border-white/[0.07] bg-black/15 px-4 py-4 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <LumoraMark size={52} />
                <div className="min-w-0">
                  <h2 className="bg-gradient-to-r from-white via-violet-100 to-cyan-100 bg-clip-text text-sm font-black uppercase tracking-[0.16em] text-transparent">
                    Lumora AI
                  </h2>
                  <p className="mt-1 flex items-center gap-2 text-[10px] font-semibold text-zinc-500">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-300 opacity-40" />
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-300" />
                    </span>
                    Ready to route your idea
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-zinc-500 transition hover:rotate-90 hover:border-fuchsia-300/20 hover:bg-fuchsia-300/[0.06] hover:text-white"
                aria-label="Close Lumora AI"
              >
                <X size={17} />
              </button>
            </header>

            <div className="custom-scrollbar relative z-10 flex-1 space-y-4 overflow-y-auto px-3.5 py-4 sm:p-5">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="space-y-5 py-1"
                >
                  <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[linear-gradient(125deg,rgba(124,58,237,0.11),rgba(255,255,255,0.025)_45%,rgba(34,211,238,0.08))] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.22)] sm:p-5">
                    <span className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-cyan-400/10 blur-3xl" />
                    <span className="pointer-events-none absolute -bottom-16 left-8 size-32 rounded-full bg-violet-500/10 blur-3xl" />
                    <div className="mb-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-violet-200/80">
                      <Compass size={13} className="text-cyan-300" />
                      Intent router
                    </div>
                    <h3 className="relative max-w-sm text-xl font-black leading-tight tracking-tight text-white sm:text-2xl">
                      Tell me the outcome.
                    </h3>
                    <p className="relative mt-2 max-w-sm text-sm font-medium leading-relaxed text-zinc-500">
                      Explain what you want to create, edit, convert, or improve. I will take you straight to the best tool.
                    </p>
                    <div className="relative mt-4 flex flex-wrap gap-2">
                      {routingPills.map((pill) => (
                        <span
                          key={pill}
                          className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/20 px-3 text-[9px] font-black uppercase tracking-[0.14em] text-zinc-400"
                        >
                          <CheckCircle2 size={11} className="text-cyan-300" />
                          {pill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2.5 text-[9px] font-black uppercase tracking-[0.18em] text-zinc-600">
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
                            className="group/prompt relative flex min-h-[60px] items-center gap-3 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 text-left transition hover:-translate-y-0.5 hover:border-violet-300/25 hover:bg-violet-300/[0.055] active:scale-[0.99]"
                          >
                            <span className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-violet-300 via-fuchsia-300 to-cyan-300 opacity-0 transition group-hover/prompt:opacity-80" />
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-black/25 text-zinc-400 transition group-hover/prompt:border-cyan-300/20 group-hover/prompt:text-cyan-200">
                              <PromptIcon size={16} />
                            </span>
                            <span className="text-[11px] font-bold leading-snug text-zinc-300 transition group-hover/prompt:text-white">
                              {prompt.label}
                            </span>
                            <ArrowUpRight size={13} className="ml-auto shrink-0 text-zinc-700 transition group-hover/prompt:-translate-y-0.5 group-hover/prompt:translate-x-0.5 group-hover/prompt:text-violet-200" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "space-y-3",
                    message.role === "user" && "ml-6 sm:ml-10"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl border px-4 py-3.5 text-sm font-medium leading-relaxed shadow-lg",
                      message.role === "assistant"
                        ? "border-white/[0.08] bg-[linear-gradient(120deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] text-zinc-300"
                        : "border-violet-300/20 bg-[linear-gradient(120deg,rgba(124,58,237,0.16),rgba(34,211,238,0.06))] text-white"
                    )}
                  >
                    {message.content}
                  </div>

                  {message.recommendations?.length ? (
                    <div className="space-y-2.5">
                      {message.recommendations.map((recommendation, index) => {
                        const ToolIcon = ICON_MAP[recommendation.icon] || Compass;
                        return (
                          <Link
                            key={recommendation.id}
                            href={recommendation.href}
                            className="group/tool relative flex min-h-[86px] items-center gap-3 overflow-hidden rounded-2xl border border-white/[0.08] bg-[linear-gradient(115deg,rgba(255,255,255,0.04),rgba(255,255,255,0.012))] p-3.5 shadow-lg transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:shadow-[0_16px_40px_rgba(6,182,212,0.08)] active:scale-[0.99]"
                          >
                            <span className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-violet-400 via-fuchsia-400 to-cyan-300 opacity-70" />
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-300/[0.07] text-violet-100 transition group-hover/tool:border-cyan-300/20 group-hover/tool:bg-cyan-300/[0.07] group-hover/tool:text-cyan-100">
                              <ToolIcon size={19} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="truncate text-xs font-bold text-white">
                                  {recommendation.name}
                                </span>
                                {index === 0 && (
                                  <span className="rounded border border-cyan-300/15 bg-cyan-300/[0.06] px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider text-cyan-200">
                                    Best match
                                  </span>
                                )}
                                {recommendation.pro && (
                                  <span className="rounded border border-violet-300/20 bg-violet-300/[0.08] px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider text-violet-200">
                                    Pro
                                  </span>
                                )}
                              </span>
                              <span className="mt-1 line-clamp-1 block text-[10px] font-medium text-zinc-500">
                                {recommendation.description}
                              </span>
                              <span className="mt-2 flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-600">
                                {typeof recommendation.confidence === "number" && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/10 bg-emerald-300/[0.045] px-2 py-1 text-emerald-200/80">
                                    <Sparkles size={10} />
                                    {recommendation.confidence}% match
                                  </span>
                                )}
                                {recommendation.reason && (
                                  <span className="line-clamp-1 normal-case tracking-normal text-zinc-500">
                                    {recommendation.reason}
                                  </span>
                                )}
                              </span>
                            </span>
                            <ArrowUpRight
                              size={16}
                              className="shrink-0 text-zinc-600 transition group-hover/tool:-translate-y-0.5 group-hover/tool:translate-x-0.5 group-hover/tool:text-cyan-200"
                            />
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-3 rounded-xl border border-violet-300/15 bg-violet-300/[0.045] px-4 py-3.5 text-xs font-semibold text-zinc-400">
                  <span className="relative flex size-8 items-center justify-center rounded-lg border border-violet-300/15 bg-black/20">
                    <Loader2 size={14} className="animate-spin text-cyan-300" />
                  </span>
                  Mapping your request to Lumora...
                </div>
              )}
            </div>

            <div className="relative z-10 border-t border-white/[0.07] bg-black/25 p-3.5">
              <form onSubmit={handleSubmit} className="group/composer flex items-end gap-2 rounded-xl border border-white/[0.09] bg-black/35 p-1.5 shadow-inner transition focus-within:border-violet-300/25 focus-within:shadow-[0_0_28px_rgba(124,58,237,0.08)]">
                <textarea
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
                  className="min-h-12 flex-1 resize-none bg-transparent px-3 py-3 text-sm font-medium text-white outline-none placeholder:text-zinc-700"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[linear-gradient(135deg,#7c3aed,#2563eb_52%,#06b6d4)] text-white shadow-[0_10px_28px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5 hover:brightness-115 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Send request"
                >
                  {isLoading ? <Loader2 size={17} className="animate-spin" /> : <ArrowUp size={18} />}
                </button>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
