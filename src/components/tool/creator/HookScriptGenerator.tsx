"use client";

import React, { useState } from "react";
import { Sparkles, Copy, Check, RefreshCw, Video, Clapperboard, Flame, Target, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCredits } from "@/hooks/useCredits";

interface ScriptOutput {
  hooks: string[];
  script: { time: string; voiceover: string; visual: string }[];
  cta: string;
}

export default function HookScriptGenerator() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<"tiktok" | "shorts" | "reels">("tiktok");
  const [tone, setTone] = useState("controversial");
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState<ScriptOutput | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { refreshCredits, toast } = useCredits();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("topic", topic.trim());
    formData.append("platform", platform);
    formData.append("tone", tone);

    try {
      const response = await fetch("/api/tools/creator/hook-script-generator", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate video script outline.");
      }

      let parsed: ScriptOutput;
      if (typeof data.result === "string") {
        parsed = JSON.parse(data.result);
      } else {
        parsed = data.result;
      }

      if (!parsed || !Array.isArray(parsed.hooks) || !Array.isArray(parsed.script)) {
        throw new Error("Received malformed output from AI model.");
      }

      setOutput(parsed);
      void refreshCredits();
      toast("Viral script generated successfully!", "success");
    } catch (err: any) {
      console.error("[HookScriptGenerator] Error:", err);
      const msg = err?.message || "Failed to generate script. Please check your connection and try again.";
      setErrorMsg(msg);
      toast(msg, "warning");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    const text = `VIRAL HOOKS:\n` +
      output.hooks.map((h, i) => `#${i + 1} ${h}`).join("\n") +
      `\n\nTIMESTAMPED SCRIPT & VISUALS:\n` +
      output.script.map(s => `[${s.time}]\n🗣️ VO: "${s.voiceover}"\n🎬 Visual: ${s.visual}\n`).join("\n") +
      `\nCALL TO ACTION:\n${output.cta}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast("Copied full script to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-950/40 via-purple-900/20 to-neutral-900 border border-rose-500/20 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Clapperboard className="w-48 h-48 text-rose-400" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" /> Viral Content Engine
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Video Hook & Script Generator
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl">
            Generate high-retention 15-60s video hooks, timestamped voiceover scripts, and visual directions optimized for TikTok, Shorts, and Reels using Llama 3.3 70B AI intelligence.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-5 p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl shadow-xl">
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Video Topic or Product
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. 5 horror stories, 10 hidden AI productivity hacks..."
              rows={3}
              className="w-full p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Target Platform
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["tiktok", "shorts", "reels"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={cn(
                    "py-2.5 px-3 rounded-xl border text-xs font-bold capitalize transition-all",
                    platform === p
                      ? "bg-rose-500/20 border-rose-500 text-rose-200 shadow-lg shadow-rose-500/20"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  )}
                >
                  {p === "shorts" ? "YT Shorts" : p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Hook Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-rose-500"
            >
              <option value="controversial">🔥 Bold & Controversial</option>
              <option value="storytelling">📖 Storytelling & Suspense</option>
              <option value="educational">💡 Educational & Value-First</option>
              <option value="urgency">⚡ High Urgency & FOMO</option>
            </select>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-extrabold text-sm tracking-wider uppercase shadow-xl hover:shadow-rose-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Generating AI Script...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate Script Outline
              </>
            )}
          </button>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl shadow-xl flex flex-col min-h-[420px]">
          {output ? (
            <div className="space-y-6 flex-1">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-4 h-4" /> Generated Video Script
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy All"}
                </button>
              </div>

              {/* Viral Hooks Options */}
              <div>
                <h4 className="text-xs font-bold text-neutral-400 uppercase mb-2.5 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Top 3 AI Viral Hook Options
                </h4>
                <div className="space-y-2">
                  {output.hooks.map((h, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-sm text-rose-100 font-medium leading-relaxed">
                      <span className="text-rose-500 font-bold mr-2">#{i + 1}</span> {h}
                    </div>
                  ))}
                </div>
              </div>

              {/* Script Timeline */}
              <div>
                <h4 className="text-xs font-bold text-neutral-400 uppercase mb-2.5 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-purple-400" /> Timestamped Voiceover & Visual Directions
                </h4>
                <div className="space-y-3">
                  {output.script.map((step, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-2">
                      <div className="flex items-center justify-between text-neutral-400 font-mono">
                        <span className="text-rose-400 font-bold">{step.time}</span>
                      </div>
                      <p className="text-neutral-100 font-medium text-sm leading-relaxed">🗣️ "{step.voiceover}"</p>
                      <p className="text-neutral-400 italic leading-relaxed">🎬 Visual: {step.visual}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              {output.cta && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-1">
                  <span className="text-rose-400 font-bold uppercase tracking-wider block">⚡ Call To Action</span>
                  <p className="text-rose-100 font-medium">{output.cta}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-500">
              <Clapperboard className="w-12 h-12 mb-3 text-neutral-700 stroke-[1.5]" />
              <p className="text-sm font-medium text-neutral-400 max-w-sm">
                Enter any video topic or product on the left to generate intelligent, platform-tailored viral hooks and timestamped scripts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
