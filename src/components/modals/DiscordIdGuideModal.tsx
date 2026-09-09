"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles, Check, Copy, ExternalLink, HelpCircle, ArrowRight } from "lucide-react";

interface DiscordIdGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSampleId: (id: string) => void;
}

const SAMPLE_IDS = [
  { label: "Alex (Gamer & Streamer)", id: "887557388700368896", tag: "Apex & Valorant" },
  { label: "Maya (Indie Dev & Designer)", id: "1059526712355938365", tag: "VS Code & UI" },
  { label: "Kael (Music Producer)", id: "983419201509376041", tag: "Spotify Audiophile" },
];

export function DiscordIdGuideModal({
  isOpen,
  onClose,
  onSelectSampleId,
}: DiscordIdGuideModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-2xl transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-[#0c0d16] p-6 sm:p-8 shadow-[0_0_80px_rgba(88,101,242,0.25)] z-10 overflow-hidden text-white animate-in zoom-in-95 duration-200">
        {/* Glow corner accents */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#5865f2]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[#5865f2]/40 bg-[#5865f2]/15 text-[#8993f8]">
              <HelpCircle size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight sm:text-2xl">
                How to find your Discord ID
              </h2>
              <p className="text-xs font-semibold text-zinc-400">
                Takes 10 seconds · Only needed once
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* 3 Visual Steps */}
        <div className="mt-6 space-y-4">
          {/* Step 1 */}
          <div className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-[#5865f2]/30">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#5865f2] text-xs font-black text-white">
              1
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Enable Developer Mode
              </h3>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                In Discord, go to <span className="font-semibold text-zinc-200">User Settings ⚙️</span> &rarr;{" "}
                <span className="font-semibold text-zinc-200">Advanced</span> &rarr; toggle{" "}
                <span className="font-semibold text-indigo-300">"Developer Mode" ON</span>.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-[#5865f2]/30">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#5865f2] text-xs font-black text-white">
              2
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Right-Click Your Profile
              </h3>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                Right-click your avatar in any channel, the member list on the right, or your profile card in the bottom-left.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-[#5865f2]/30">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-500 text-xs font-black text-white">
              3
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Click "Copy User ID"
              </h3>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                At the very bottom of the menu, click <span className="font-semibold text-emerald-300">Copy User ID</span>. It will copy an 18 to 19-digit number.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Sample Profiles */}
        <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-400 mb-3">
            <Sparkles size={14} className="text-amber-400" />
            <span>Or test right now with a demo profile:</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {SAMPLE_IDS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  onSelectSampleId(sample.id);
                  onClose();
                }}
                className="group flex flex-col items-start rounded-xl border border-white/10 bg-black/40 p-3 text-left transition hover:border-[#5865f2] hover:bg-[#5865f2]/10"
              >
                <span className="text-xs font-bold text-white group-hover:text-indigo-200">
                  {sample.label}
                </span>
                <span className="mt-1 text-[10px] text-zinc-500 group-hover:text-zinc-400">
                  {sample.tag}
                </span>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-black uppercase text-indigo-400 group-hover:text-white">
                  Load Profile <ArrowRight size={10} />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black transition hover:bg-zinc-200"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
