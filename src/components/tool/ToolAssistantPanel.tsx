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
import { LumoraMark } from "@/components/ui/LumoraLogo";

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

const QUICK_PROMPTS = [
  "Recommend the best settings for my goal",
  "Explain the controls I can use",
  "Help me improve the output quality",
];

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
    if (control.closest("[data-lumora-assistant='true']")) return;

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
  if (control.closest("[data-lumora-assistant='true']")) return false;
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
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [messages, setMessages] = useState<CoachMessage[]>([
    createMessage("assistant", defaultIntro(tool)),
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    return latestAssistant?.followUps?.slice(0, 3) || QUICK_PROMPTS;
  }, [messages]);

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
        throw new Error(data.error || "Lumora AI is temporarily unavailable.");
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
        error instanceof Error ? error.message : "Lumora AI is temporarily unavailable.";
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
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Open Lumora AI for ${tool.name}`}
        title={`Ask Lumora AI about ${tool.name}`}
        initial={{ opacity: 0, scale: 0.75, y: 14 }}
        animate={{ opacity: isOpen ? 0 : 1, scale: isOpen ? 0.8 : 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={cn(
          "fixed bottom-4 right-4 z-40 flex min-h-14 items-center gap-2 overflow-hidden rounded-lg border border-cyan-300/20 bg-[#06080d]/92 p-1.5 pr-3 text-cyan-50 shadow-[0_18px_55px_rgba(6,182,212,0.16)] backdrop-blur-2xl sm:bottom-7 sm:right-7",
          isOpen && "pointer-events-none",
        )}
      >
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
          <span className="absolute inset-0 animate-pulse rounded-lg bg-cyan-400/10" />
          <LumoraMark size={42} />
        </span>
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-white">
            Ask Lumora AI
          </span>
          <span className="block max-w-32 truncate text-[9px] font-semibold text-zinc-500">
            {tool.name}
          </span>
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.section
            data-lumora-assistant="true"
            initial={{ opacity: 0, y: 22, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed inset-x-2 bottom-2 z-[70] mx-auto flex max-h-[min(82dvh,720px)] max-w-[460px] flex-col overflow-hidden rounded-lg border border-white/10 bg-[#05060a]/97 shadow-[0_28px_110px_rgba(0,0,0,0.8),0_0_70px_rgba(124,58,237,0.09)] backdrop-blur-2xl sm:inset-x-auto sm:bottom-7 sm:right-7 sm:w-[440px]"
            aria-label={`Lumora AI assistant for ${tool.name}`}
          >
            <div className="relative border-b border-white/10 bg-white/[0.025] p-4">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-violet-400 via-cyan-300 to-fuchsia-400" />
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                    <LumoraMark size={42} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-white">
                        Lumora AI
                      </p>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                    </div>
                    <p className="truncate text-[10px] font-semibold text-zinc-500">
                      Connected to {category.name} / {tool.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-zinc-500 transition-colors hover:bg-white/[0.07] hover:text-white"
                  aria-label="Close Lumora AI"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 custom-scrollbar">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={cn(
                    "group relative border p-3.5 text-sm font-medium leading-relaxed",
                    message.role === "assistant"
                      ? "mr-6 rounded-lg border-cyan-300/10 bg-cyan-300/[0.035] text-zinc-300"
                      : "ml-9 rounded-lg border-violet-300/15 bg-violet-400/[0.08] text-white",
                    message.isError && "border-red-400/20 bg-red-400/[0.06] text-red-100",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>

                  {message.role === "assistant" && !message.isError && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-2.5">
                      <button
                        type="button"
                        onClick={() => void copyMessage(message)}
                        className="flex min-h-9 items-center gap-1.5 rounded-md border border-white/[0.08] px-2.5 text-[9px] font-black uppercase tracking-wider text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
                      >
                        {copiedId === message.id ? <Check size={12} /> : <Copy size={12} />}
                        {copiedId === message.id ? "Copied" : "Copy"}
                      </button>
                      {message.draft && (
                        <button
                          type="button"
                          onClick={() => void applyDraft(message.draft || "")}
                          className="flex min-h-9 items-center gap-1.5 rounded-md border border-violet-300/20 bg-violet-400/[0.08] px-2.5 text-[9px] font-black uppercase tracking-wider text-violet-100 transition hover:bg-violet-400/[0.14]"
                        >
                          <WandSparkles size={12} />
                          Use in tool
                        </button>
                      )}
                    </div>
                  )}
                </article>
              ))}

              {isLoading && (
                <div className="mr-16 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <Loader2 size={14} className="animate-spin text-cyan-300" />
                  Reading this tool
                </div>
              )}
            </div>

            <div className="border-t border-white/10 bg-black/20 p-3.5">
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {followUps.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void askCoach(prompt)}
                    disabled={isLoading}
                    className="min-h-10 shrink-0 rounded-md border border-white/10 bg-white/[0.025] px-3 text-[9px] font-black uppercase tracking-wider text-zinc-400 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.05] hover:text-cyan-50 disabled:opacity-40"
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

              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <div className="relative min-w-0 flex-1">
                  <textarea
                    data-lumora-assistant="true"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder={`Ask about ${tool.name}...`}
                    className="max-h-32 min-h-12 w-full resize-none rounded-md border border-white/10 bg-black/45 px-3.5 py-3 pr-10 text-sm font-medium text-white outline-none transition-all placeholder:text-zinc-700 focus:border-cyan-300/35 focus:bg-black/60"
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
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-cyan-200/20 bg-gradient-to-br from-violet-600 via-blue-500 to-cyan-400 text-white shadow-[0_8px_24px_rgba(34,211,238,0.18)] transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:grayscale disabled:opacity-35"
                  aria-label="Ask Lumora AI"
                >
                  {isLoading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                </button>
              </form>

              <div className="mt-2.5 flex items-center justify-between gap-3 text-[8px] font-bold uppercase tracking-[0.14em] text-zinc-700">
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
