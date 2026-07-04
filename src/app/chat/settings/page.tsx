"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Brain,
  Check,
  GraduationCap,
  MessageSquareText,
  PencilLine,
  Save,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Wand2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type AiChatSettings, DEFAULT_AI_CHAT_SETTINGS, type ChatMode } from "@/components/providers/ChatProvider";

const CHAT_MODES: { id: ChatMode; label: string; description: string }[] = [
  { id: "auto", label: "Auto", description: "Lumora detects coding, research, business, creative, or fast mode per request." },
  { id: "default", label: "Default", description: "Balanced Lumora replies for everyday work." },
  { id: "coding", label: "Coding", description: "Debugging, architecture, files, and production notes." },
  { id: "research", label: "Research", description: "Careful comparison, uncertainty, and structured analysis." },
  { id: "business", label: "Business", description: "Strategy, execution, metrics, and decisions." },
  { id: "creative", label: "Creative", description: "Names, concepts, directions, hooks, and polish." },
  { id: "fast", label: "Fast", description: "Short, direct answers with minimal extra text." },
];

const RESPONSE_STYLES: { id: AiChatSettings["responseStyle"]; label: string }[] = [
  { id: "balanced", label: "Balanced" },
  { id: "concise", label: "Concise" },
  { id: "detailed", label: "Detailed" },
  { id: "teacher", label: "Teacher" },
  { id: "operator", label: "Operator" },
];

const DETAIL_LEVELS: { id: AiChatSettings["detailLevel"]; label: string }[] = [
  { id: "short", label: "Short" },
  { id: "standard", label: "Standard" },
  { id: "deep", label: "Deep" },
];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-8 w-14 rounded-full border p-1 transition-all active:scale-95",
        checked
          ? "border-cyan-300/30 bg-cyan-300/20 shadow-[0_0_24px_rgba(34,211,238,0.14)]"
          : "border-white/10 bg-white/[0.05]"
      )}
    >
      <span
        className={cn(
          "block h-5.5 w-5.5 rounded-full bg-white shadow-lg transition-transform",
          checked ? "translate-x-6" : "translate-x-0"
        )}
      />
    </button>
  );
}

export default function AiChatSettingsPage() {
  const [settings, setSettings] = useState<AiChatSettings>(DEFAULT_AI_CHAT_SETTINGS);
  const [memories, setMemories] = useState<string[]>([]);
  const [newMemory, setNewMemory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "warning"; message: string } | null>(null);

  const memoryCount = memories.length;
  const selectedMode = useMemo(
    () => CHAT_MODES.find(mode => mode.id === settings.defaultChatMode) || CHAT_MODES[0],
    [settings.defaultChatMode]
  );

  const showNotice = (message: string, type: "success" | "warning" = "success") => {
    setNotice({ message, type });
    window.setTimeout(() => setNotice(null), 3200);
  };

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/tools/ai/chat/settings", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load settings.");
      setSettings({ ...DEFAULT_AI_CHAT_SETTINGS, ...(data.settings || {}) });
      setMemories(Array.isArray(data.memories) ? data.memories : []);
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Could not load AI Chat settings.", "warning");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const saveSettings = async (nextSettings = settings) => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/tools/ai/chat/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: nextSettings }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save settings.");
      const saved = { ...DEFAULT_AI_CHAT_SETTINGS, ...(data.settings || nextSettings) };
      setSettings(saved);
      localStorage.setItem("lumora_chat_mode", saved.defaultChatMode);
      localStorage.setItem("lumora_student_mode", String(saved.defaultStudentMode));
      showNotice("AI Chat settings saved.");
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Could not save settings.", "warning");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof AiChatSettings>(key: K, value: AiChatSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const addMemory = async () => {
    const memory = newMemory.replace(/\s+/g, " ").trim();
    if (!memory) return;

    try {
      setIsSaving(true);
      const response = await fetch("/api/tools/ai/chat/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add-memory", memory }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save memory.");
      setMemories(Array.isArray(data.memories) ? data.memories : []);
      setNewMemory("");
      showNotice("Memory saved.");
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Could not save memory.", "warning");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteMemory = async (memory: string) => {
    try {
      const response = await fetch("/api/tools/ai/chat/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete-memory", memory }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete memory.");
      setMemories(Array.isArray(data.memories) ? data.memories : []);
      showNotice("Memory removed.");
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Could not delete memory.", "warning");
    }
  };

  const clearMemories = async () => {
    try {
      const response = await fetch("/api/tools/ai/chat/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear-memories" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not clear memories.");
      setMemories(Array.isArray(data.memories) ? data.memories : []);
      showNotice("AI memory cleared.");
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Could not clear memories.", "warning");
    }
  };

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#050507] px-4 py-6 text-zinc-200 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-15%] h-[420px] w-[420px] rounded-full bg-purple-600/12 blur-[120px]" />
        <div className="absolute right-[-10%] top-[18%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-size-[46px_46px] opacity-35" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/chat"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-cyan-300/25 hover:bg-cyan-300/10 hover:text-cyan-100"
              title="Back to chat"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.24em] text-cyan-200">
                <Brain size={11} />
                AI Chat Control Center
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                Chat Settings
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-zinc-400">
                Set Lumora&apos;s default behavior, memory, response style, typing feel, and learning preferences.
              </p>
            </div>
          </div>

          <button
            onClick={() => saveSettings()}
            disabled={isSaving || isLoading}
            className="group relative min-h-12 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-400 px-5 text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-[0_0_30px_rgba(34,211,238,0.18)] transition hover:brightness-110 active:scale-95 disabled:opacity-60"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative flex items-center justify-center gap-2">
              {isSaving ? <Sparkles size={15} className="animate-spin" /> : <Save size={15} />}
              Save Settings
            </span>
          </button>
        </header>

        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm font-bold",
              notice.type === "success"
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                : "border-red-400/20 bg-red-400/10 text-red-100"
            )}
          >
            {notice.message}
          </motion.div>
        )}

        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-2xl sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-300/10 text-purple-200">
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Default Mode</h2>
                  <p className="mt-1 text-xs font-semibold text-zinc-500">{selectedMode.description}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {CHAT_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => updateSetting("defaultChatMode", mode.id)}
                    className={cn(
                      "min-h-[110px] rounded-2xl border p-4 text-left transition-all active:scale-[0.99]",
                      settings.defaultChatMode === mode.id
                        ? "border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_28px_rgba(34,211,238,0.12)]"
                        : "border-white/8 bg-black/20 hover:border-white/16 hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white">{mode.label}</span>
                      {settings.defaultChatMode === mode.id && <Check size={15} className="text-cyan-200" />}
                    </div>
                    <p className="text-xs font-medium leading-relaxed text-zinc-400">{mode.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-2xl sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                  <PencilLine size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Custom Instructions</h2>
                  <p className="mt-1 text-xs font-semibold text-zinc-500">Tell Lumora how to answer across future chats.</p>
                </div>
              </div>
              <textarea
                value={settings.customInstructions}
                onChange={(event) => updateSetting("customInstructions", event.target.value)}
                placeholder="Example: Prefer practical examples, ask before making assumptions, keep frontend advice Tailwind-first..."
                className="min-h-[150px] w-full resize-y rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-sm font-medium leading-relaxed text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/30 focus:ring-4 focus:ring-cyan-300/5"
              />
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-2xl sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-200">
                  <MessageSquareText size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Response Feel</h2>
                  <p className="mt-1 text-xs font-semibold text-zinc-500">Tune how much detail Lumora gives by default.</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {RESPONSE_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => updateSetting("responseStyle", style.id)}
                        className={cn(
                          "min-h-11 rounded-xl border px-3 text-[10px] font-black uppercase tracking-widest transition",
                          settings.responseStyle === style.id
                            ? "border-purple-300/30 bg-purple-300/12 text-purple-100"
                            : "border-white/8 bg-white/[0.02] text-zinc-500 hover:text-white"
                        )}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Depth</label>
                  <div className="grid grid-cols-3 gap-2">
                    {DETAIL_LEVELS.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => updateSetting("detailLevel", level.id)}
                        className={cn(
                          "min-h-11 rounded-xl border px-3 text-[10px] font-black uppercase tracking-widest transition",
                          settings.detailLevel === level.id
                            ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100"
                            : "border-white/8 bg-white/[0.02] text-zinc-500 hover:text-white"
                        )}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-2xl sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                    <Wand2 size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Behavior</h2>
                    <p className="mt-1 text-xs font-semibold text-zinc-500">Fast switches for the chat experience.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: "defaultStudentMode" as const,
                    icon: GraduationCap,
                    title: "Start in Student Mode",
                    desc: "Use teacher-style explanations automatically.",
                  },
                  {
                    key: "typingAnimation" as const,
                    icon: Zap,
                    title: "Typing Animation",
                    desc: "Show responses with a human-feeling reveal.",
                  },
                  {
                    key: "smartFollowUps" as const,
                    icon: Sparkles,
                    title: "Smart Follow-ups",
                    desc: "Show quick action chips below fresh replies.",
                  },
                  {
                    key: "memoryEnabled" as const,
                    icon: Brain,
                    title: "Use AI Memory",
                    desc: "Let Lumora use saved memories while responding.",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.key} className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-black/20 p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300">
                          <Icon size={15} />
                        </div>
                        <div>
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-white">{item.title}</h3>
                          <p className="mt-1 text-xs font-medium leading-relaxed text-zinc-500">{item.desc}</p>
                        </div>
                      </div>
                      <Toggle checked={Boolean(settings[item.key])} onChange={(value) => updateSetting(item.key, value)} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-2xl sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-300/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-purple-100">
                    <Brain size={11} />
                    {memoryCount} Memories
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Memory Controls</h2>
                  <p className="mt-2 text-xs font-semibold leading-relaxed text-zinc-500">
                    Save preferences, project details, or facts Lumora should remember.
                  </p>
                </div>
                {memories.length > 0 && (
                  <button
                    onClick={clearMemories}
                    className="min-h-10 rounded-xl border border-red-400/20 bg-red-400/10 px-3 text-[9px] font-black uppercase tracking-widest text-red-200 transition hover:bg-red-400/15"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <textarea
                  value={newMemory}
                  onChange={(event) => setNewMemory(event.target.value)}
                  placeholder="Example: Remember that my brand prefers dark premium SaaS UI with purple/cyan accents."
                  className="min-h-[100px] w-full resize-y rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-medium leading-relaxed text-white outline-none placeholder:text-zinc-600 focus:border-purple-300/30 focus:ring-4 focus:ring-purple-300/5"
                />
                <button
                  onClick={addMemory}
                  disabled={!newMemory.trim() || isSaving}
                  className="min-h-11 w-full rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 text-[10px] font-black uppercase tracking-[0.22em] text-white transition hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  Add Memory
                </button>
              </div>

              <div className="mt-5 space-y-2">
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-14 rounded-2xl border border-white/8 bg-white/[0.03] animate-pulse" />
                    <div className="h-14 rounded-2xl border border-white/8 bg-white/[0.03] animate-pulse" />
                  </div>
                ) : memories.length === 0 ? (
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm font-semibold text-zinc-500">
                    No saved memories yet.
                  </div>
                ) : (
                  memories.map((memory) => (
                    <div key={memory} className="group flex items-start justify-between gap-3 rounded-2xl border border-white/8 bg-black/20 p-3">
                      <p className="min-w-0 flex-1 text-xs font-semibold leading-relaxed text-zinc-300">{memory}</p>
                      <button
                        onClick={() => deleteMemory(memory)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-zinc-500 transition hover:border-red-400/25 hover:bg-red-400/10 hover:text-red-200"
                        title="Delete memory"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
