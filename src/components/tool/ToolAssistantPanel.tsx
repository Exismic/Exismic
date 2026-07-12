"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Check,
  Copy,
  CornerDownLeft,
  Loader2,
  Send,
  SlidersHorizontal,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Category, Tool } from "@/data/tools";
import { ExismicMark } from "@/components/ui/ExismicLogo";

interface ToolAssistantPanelProps {
  tool: Tool;
  category: Category;
}

interface CoachMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  draft?: string;
  followUps?: string[];
  isError?: boolean;
}

interface CoachResponse {
  reply?: string;
  draft?: string;
  followUps?: string[];
  error?: string;
}

function getToolPrompts(tool: Tool) {
  if (tool.suggestions && tool.suggestions.length > 0) return tool.suggestions;

  const name = tool.name;
  
  if (tool.category === "image") {
    if (name.includes("Remover") || name.includes("Eraser")) {
      return [
        "How do I get cleaner cutout edges?",
        "What image formats work best?",
        "Explain the brush/refine settings",
      ];
    }
    if (name.includes("Generator") || name.includes("Maker")) {
      return [
        "Help me write a detailed prompt",
        "What art styles can I use?",
        "How do I fix weird artifacts?",
      ];
    }
    return [
      `Recommend best settings for ${name}`,
      "How can I avoid losing quality?",
      "Explain the advanced controls",
    ];
  }
  
  if (tool.category === "video") {
    return [
      "What's the best export format/codec?",
      "How do I compress without losing quality?",
      `Explain the timeline controls`,
    ];
  }

  if (tool.category === "audio") {
    if (name.includes("Voice") || name.includes("Speech")) {
      return [
        "How do I make it sound more natural?",
        "What's the best audio format?",
        "Explain the voice pitch/speed controls",
      ];
    }
    return [
      "How to eliminate background hum/noise?",
      "What bitrates should I use?",
      `Recommend settings for ${name}`,
    ];
  }

  if (tool.category === "ai" || name.includes("AI")) {
    if (name.includes("Code")) {
      return [
        "Help me write the prompt for this feature",
        "Can you explain the framework choices?",
        "How do I handle syntax errors?",
      ];
    }
    return [
      "Write an optimized prompt for me",
      "How can I make the output more creative?",
      "Explain the advanced parameters",
    ];
  }

  return [
    `Recommend best settings for ${name}`,
    `Explain how to use ${name}`,
    "Help me improve the output quality",
  ];
}

const TOOL_TARGET_SELECTORS: Partial<Record<Tool["id"], string[]>> = {
  "ai-writer": ["textarea[placeholder*='What should I write']"],
  "ai-img-gen": ["textarea[placeholder*='futuristic mechanical butterfly']"],
  "ai-logo": ["textarea[placeholder*='Describe your logo concept']"],
  "ai-code": [
    "textarea[placeholder*='Describe what you want to build']",
    "textarea[placeholder*='chat with the AI Agent']",
  ],
  "audio-tts": ["textarea[placeholder*='Type what you want the voice']"],
  "audio-music-gen": ["textarea[placeholder*='Describe what kind of music']"],
  "hashtag-generator": ["textarea[placeholder*='fitness motivation gym workout']"],
  "social-caption-generator": ["textarea[placeholder*='Describe your post']"],
  "productivity-palette": ["input[placeholder*='Describe the mood']"],
  "productivity-json": ["textarea[placeholder*='Paste your JSON']"],
  "youtube-thumbnail": ["input[placeholder='CATCHY TITLE']"],
  "meme-generator": ["input[placeholder='TOP TEXT...']"],
  "resume-builder": ["textarea[placeholder*='Briefly describe your experience']"],
  "invoice-generator": ["textarea[placeholder*='Create an invoice for Northstar']"],
};

function createMessage(
  role: CoachMessage["role"],
  content: string,
  extras: Partial<CoachMessage> = {},
): CoachMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    ...extras,
  };
}

function defaultIntro(tool: Tool) {
  return tool.requiresFileUpload
    ? `I am connected to ${tool.name}. Ask me about source quality, settings, formats, or how to get a cleaner result.`
    : `I am connected to ${tool.name}. Describe what you want to make and I can suggest the right controls or draft an input for you.`;
}

function getElementLabel(element: Element) {
  const ariaLabel = element.getAttribute("aria-label");
  if (ariaLabel) return ariaLabel;

  const id = element.getAttribute("id");
  if (id) {
    const explicitLabel = document.querySelector(`label[for="${CSS.escape(id)}"]`);
    if (explicitLabel?.textContent?.trim()) return explicitLabel.textContent.trim();
  }

  const wrappingLabel = element.closest("label");
  if (wrappingLabel?.textContent?.trim()) return wrappingLabel.textContent.trim();
  return element.getAttribute("name") || "Control";
}

function collectVisibleSettings() {
  const settings: string[] = [];
  const controls = document.querySelectorAll(
    "main select, main input[type='range'], main input[type='number'], main input[type='date'], main input[type='checkbox'], main input[type='radio'], main [aria-pressed='true']",
  );

  controls.forEach((control) => {
    if (control.closest("[data-exismic-assistant='true']")) return;

    if (control instanceof HTMLSelectElement) {
      settings.push(
        `${getElementLabel(control)}: ${control.selectedOptions[0]?.textContent?.trim() || control.value}`,
      );
      return;
    }

    if (control instanceof HTMLInputElement) {
      if (control.type === "range" || control.type === "number" || control.type === "date") {
        settings.push(`${getElementLabel(control)}: ${control.value}`);
      } else {
        settings.push(`${getElementLabel(control)}: ${control.checked ? "on" : "off"}`);
      }
      return;
    }

    const text = control.textContent?.trim();
    if (text) settings.push(`Selected option: ${text.slice(0, 80)}`);
  });

  return [...new Set(settings)].slice(0, 16);
}

function isEligibleTextControl(
  control: HTMLInputElement | HTMLTextAreaElement,
) {
  if (control.closest("[data-exismic-assistant='true']")) return false;
  if (control.disabled || control.readOnly) return false;
  const styles = window.getComputedStyle(control);
  return styles.display !== "none" && styles.visibility !== "hidden";
}

function findBestTextControl(toolId: string) {
  const preferredSelectors = TOOL_TARGET_SELECTORS[toolId] || [];
  for (const selector of preferredSelectors) {
    const preferred = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      `main ${selector}`,
    );
    if (preferred && isEligibleTextControl(preferred)) return preferred;
  }

  const controls = Array.from(
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      "main textarea, main input[type='text'], main input:not([type])",
    ),
  ).filter(isEligibleTextControl);

  const bestMatch = controls
    .map((control) => {
      const hint = `${control.placeholder || ""} ${getElementLabel(control)}`.toLowerCase();
      let score = control instanceof HTMLTextAreaElement ? 3 : 0;
      if (/(prompt|describe|brief|topic|caption|text|idea|ask|keywords)/.test(hint)) score += 8;
      if (/(search|filter|name|email|address|phone)/.test(hint)) score -= 5;
      return { control, score };
    })
    .sort((a, b) => b.score - a.score)[0];

  return bestMatch && bestMatch.score >= 4 ? bestMatch.control : undefined;
}

function setNativeControlValue(
  control: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) {
  const prototype =
    control instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  setter?.call(control, value);
  control.dispatchEvent(new Event("input", { bubbles: true }));
  control.dispatchEvent(new Event("change", { bubbles: true }));
  control.focus();
  control.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const fallback = document.createElement("textarea");
    fallback.value = text;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.opacity = "0";
    document.body.appendChild(fallback);
    fallback.select();
    const copied = document.execCommand("copy");
    fallback.remove();
    return copied;
  }
}

export function ToolAssistantPanel({ tool, category }: ToolAssistantPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [messages, setMessages] = useState<CoachMessage[]>([
    createMessage("assistant", defaultIntro(tool)),
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntro(false), 2600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setMessages([createMessage("assistant", defaultIntro(tool))]);
    setInput("");
    setActionStatus(null);
    setIsOpen(false);
  }, [tool]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, isLoading, messages]);

  const followUps = useMemo(() => {
    const latestAssistant = [...messages]
      .reverse()
      .find((message) => message.role === "assistant" && message.followUps?.length);
    return latestAssistant?.followUps?.slice(0, 3) || getToolPrompts(tool).slice(0, 3);
  }, [messages, tool]);

  const askCoach = async (message: string) => {
    const cleanMessage = message.trim();
    if (!cleanMessage || isLoading) return;

    const conversation = messages
      .filter((item) => !item.isError)
      .slice(-8)
      .map(({ role, content }) => ({ role, content }));

    setMessages((current) => [...current, createMessage("user", cleanMessage)]);
    setInput("");
    setActionStatus(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/tools/ai/tool-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: tool.id,
          userMessage: cleanMessage,
          visibleSettings: collectVisibleSettings(),
          messages: conversation,
        }),
      });

      const data = (await response.json()) as CoachResponse;
      if (!response.ok || !data.reply) {
        throw new Error(data.error || "Exismic Ai is temporarily unavailable.");
      }

      setMessages((current) => [
        ...current,
        createMessage("assistant", data.reply || "", {
          draft: data.draft,
          followUps: data.followUps,
        }),
      ]);
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : "Exismic Ai is temporarily unavailable.";
      setMessages((current) => [
        ...current,
        createMessage("assistant", messageText, { isError: true }),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void askCoach(input);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void askCoach(input);
    }
  };

  const copyMessage = async (message: CoachMessage) => {
    const copied = await writeClipboard(message.draft || message.content);
    if (copied) {
      setCopiedId(message.id);
      window.setTimeout(() => setCopiedId(null), 1_500);
    } else {
      setActionStatus("Clipboard access was blocked");
    }
  };

  const applyDraft = async (draft: string) => {
    const target = findBestTextControl(tool.id);
    if (target) {
      setNativeControlValue(target, draft);
      setActionStatus("Added to the tool");
      setIsOpen(false);
    } else {
      const copied = await writeClipboard(draft);
      setActionStatus(copied ? "Copied for use in this tool" : "Clipboard access was blocked");
    }
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
            className="fixed bottom-3 right-3 z-40 sm:bottom-7 sm:right-7"
          >
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className={cn(
                "group relative isolate flex h-14 items-center justify-start overflow-hidden rounded-2xl p-[1px] text-left shadow-[0_22px_70px_rgba(0,0,0,0.58)] transition-[width,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(109,40,217,0.24)] sm:h-16",
                showIntro ? "w-14 sm:w-[190px]" : "w-14 sm:w-16 sm:hover:w-[190px]"
              )}
              aria-label={`Ask Exismic Ai about ${tool.name}`}
              title={`Ask Exismic Ai about ${tool.name}`}
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

              <span className="relative z-20 flex size-14 shrink-0 scale-[0.86] items-center justify-center sm:size-[62px] sm:scale-100">
                <ExismicMark size={50} />
              </span>

              <span
                className={cn(
                  "relative z-20 flex flex-col justify-center overflow-hidden whitespace-nowrap pr-5 transition-[max-width,opacity,transform] duration-500",
                  showIntro
                    ? "max-w-0 opacity-0 sm:max-w-[140px] sm:translate-x-0 sm:opacity-100"
                    : "max-w-0 -translate-x-2 opacity-0 sm:group-hover:max-w-[140px] sm:group-hover:translate-x-0 sm:group-hover:opacity-100"
                )}
              >
                <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-white">Ask Exismic Ai</span>
                <span className="block truncate text-[9px] font-semibold text-zinc-500">{tool.name}</span>
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.section
            data-exismic-assistant="true"
            initial={{ opacity: 0, y: 22, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed inset-x-2 bottom-2 z-[70] mx-auto flex max-h-[min(82dvh,720px)] max-w-[460px] flex-col overflow-hidden rounded-[26px] border border-white/[0.1] bg-[linear-gradient(145deg,rgba(12,10,24,0.98),rgba(4,7,12,0.99)_55%,rgba(4,13,17,0.98))] shadow-[0_35px_120px_rgba(0,0,0,0.82),0_0_70px_rgba(91,33,182,0.13)] backdrop-blur-2xl sm:inset-x-auto sm:bottom-7 sm:right-7 sm:w-[460px]"
            aria-label={`Exismic Ai assistant for ${tool.name}`}
          >
            <motion.div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 z-30 h-px bg-[linear-gradient(90deg,transparent,#8b5cf6,#ec4899,#22d3ee,transparent)] bg-[length:220%_100%]"
              animate={{ backgroundPosition: ["100% 0%", "-120% 0%"] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:28px_28px] opacity-30" />

            <div className="relative z-10 flex items-center justify-between gap-4 border-b border-white/[0.07] bg-black/15 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <ExismicMark size={48} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="bg-gradient-to-r from-white via-violet-100 to-cyan-100 bg-clip-text text-sm font-black uppercase tracking-[0.16em] text-transparent">
                      Exismic Ai
                    </h2>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                  </div>
                  <p className="mt-0.5 truncate text-[10px] font-semibold text-zinc-500">
                    Connected to {category.name} / {tool.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-zinc-500 transition hover:rotate-90 hover:border-fuchsia-300/20 hover:bg-fuchsia-300/[0.06] hover:text-white"
                aria-label="Close Exismic Ai"
              >
                <X size={17} />
              </button>
            </div>

            <div ref={scrollRef} className="custom-scrollbar relative z-10 min-h-0 flex-1 space-y-4 overflow-y-auto px-3.5 py-4 sm:p-5">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "space-y-3",
                    message.role === "user" ? "ml-6 sm:ml-10" : "mr-6 sm:mr-10"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl border px-4 py-3.5 text-sm font-medium leading-relaxed shadow-lg",
                      message.role === "assistant"
                        ? "border-white/[0.08] bg-[linear-gradient(120deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] text-zinc-300"
                        : "border-violet-300/20 bg-[linear-gradient(120deg,rgba(124,58,237,0.16),rgba(34,211,238,0.06))] text-white",
                      message.isError && "border-red-400/20 bg-[linear-gradient(120deg,rgba(248,113,113,0.16),rgba(248,113,113,0.06))] text-red-100",
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>

                    {message.role === "assistant" && !message.isError && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-2.5">
                        <button
                          type="button"
                          onClick={() => void copyMessage(message)}
                          className="flex min-h-9 items-center gap-1.5 rounded-md border border-white/[0.08] px-2.5 text-[9px] font-black uppercase tracking-wider text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
                        >
                          {copiedId === message.id ? <Check size={12} /> : <Copy size={12} />}
                          {copiedId === message.id ? "Copied" : "Copy"}
                        </button>
                        {message.draft && (
                          <button
                            type="button"
                            onClick={() => void applyDraft(message.draft || "")}
                            className="flex min-h-9 items-center gap-1.5 rounded-md border border-violet-300/20 bg-violet-400/[0.08] px-2.5 text-[9px] font-black uppercase tracking-wider text-violet-200 transition hover:bg-violet-400/[0.14] hover:text-white"
                          >
                            <WandSparkles size={12} />
                            Use in tool
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-3 rounded-xl border border-violet-300/15 bg-violet-300/[0.045] px-4 py-3.5 text-xs font-semibold text-zinc-400 mr-10">
                  <span className="relative flex size-8 items-center justify-center rounded-lg border border-violet-300/15 bg-black/20">
                    <Loader2 size={14} className="animate-spin text-cyan-300" />
                  </span>
                  Reading this tool...
                </div>
              )}
            </div>

            <div className="relative z-10 border-t border-white/[0.07] bg-black/25 p-3.5 sm:p-4">
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {followUps.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void askCoach(prompt)}
                    disabled={isLoading}
                    className="min-h-10 shrink-0 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 text-[9px] font-black uppercase tracking-wider text-zinc-400 transition hover:-translate-y-0.5 hover:border-violet-300/25 hover:bg-violet-300/[0.055] hover:text-white disabled:opacity-40 active:scale-[0.99]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {actionStatus && (
                <div className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                  <Check size={12} />
                  {actionStatus}
                </div>
              )}

              <form onSubmit={handleSubmit} className="group/composer flex items-end gap-2 rounded-xl border border-white/[0.09] bg-black/35 p-1.5 shadow-inner transition focus-within:border-violet-300/25 focus-within:shadow-[0_0_28px_rgba(124,58,237,0.08)]">
                <div className="relative min-w-0 flex-1">
                  <textarea
                    data-exismic-assistant="true"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder={`Ask about ${tool.name}...`}
                    className="max-h-32 min-h-12 w-full resize-none bg-transparent px-3 py-3 pr-10 text-sm font-medium text-white outline-none placeholder:text-zinc-700"
                    rows={1}
                  />
                  <CornerDownLeft
                    size={13}
                    className="pointer-events-none absolute bottom-4 right-3 text-zinc-700"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[linear-gradient(135deg,#7c3aed,#2563eb_52%,#06b6d4)] text-white shadow-[0_10px_28px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5 hover:brightness-115 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Ask Exismic Ai"
                >
                  {isLoading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                </button>
              </form>

              <div className="mt-2.5 flex items-center justify-between gap-3 px-1 text-[8px] font-bold uppercase tracking-[0.14em] text-zinc-700">
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal size={10} />
                  Reads active controls
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles size={10} />
                  Tool-aware
                </span>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
