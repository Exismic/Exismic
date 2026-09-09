"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Download,
  Copy,
  Check,
  ExternalLink,
  Code,
  Globe,
  Share2,
  Cloud,
  FileArchive,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { sendToTool } from "@/lib/pipeline";
import { useRouter } from "next/navigation";

interface DiscordExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  displayName: string;
  theme: string;
  onExportPng: () => Promise<string | null>; // Returns dataUrl or blob url
  onExportZip: () => Promise<void>;
  cardElementRef: React.RefObject<HTMLElement | null>;
}

export function DiscordExportModal({
  isOpen,
  onClose,
  userId,
  displayName,
  theme,
  onExportPng,
  onExportZip,
}: DiscordExportModalProps) {
  const router = useRouter();
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [savingToCloud, setSavingToCloud] = useState(false);
  const [cloudSuccess, setCloudSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.exismic.xyz";
  const bioUrl = `${origin}/d/${encodeURIComponent(userId)}`;
  const badgeSvgUrl = `${origin}/api/tools/discord-card/badge?userId=${encodeURIComponent(userId)}&theme=${encodeURIComponent(theme)}`;
  const readmeMarkdown = `[![Discord Profile Card](${badgeSvgUrl})](${bioUrl})`;
  const iframeSnippet = `<iframe src="${bioUrl}" width="100%" height="700" frameborder="0" style="border:none;border-radius:24px;overflow:hidden;max-width:640px;" title="${displayName}'s Discord Profile"></iframe>`;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      setErrorMsg("Failed to copy to clipboard.");
    }
  };

  const handleDownloadPng = async () => {
    setDownloadingPng(true);
    setErrorMsg("");
    try {
      await onExportPng();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to capture PNG.");
    } finally {
      setDownloadingPng(false);
    }
  };

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      await onExportZip();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to export ZIP.");
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleSaveToCloudDrive = async () => {
    setSavingToCloud(true);
    setErrorMsg("");
    setCloudSuccess(false);
    try {
      const dataUrl = await onExportPng();
      if (!dataUrl) throw new Error("Could not capture card image.");

      // Convert dataUrl to blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `discord-card-${userId}.png`, { type: "image/png" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "discord-card");
      formData.append("title", `${displayName}'s Discord Card`);

      const uploadRes = await fetch("/api/drive/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to save to Exismic Cloud Drive. Storage full or guest user.");
      }

      setCloudSuccess(true);
      setTimeout(() => setCloudSuccess(false), 3500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save to Cloud Drive.");
    } finally {
      setSavingToCloud(false);
    }
  };

  const handleSendToMeme = async () => {
    const dataUrl = await onExportPng();
    if (dataUrl) {
      await sendToTool("/tools/meme-generator", {
        name: `discord-card-${userId}.png`,
        url: dataUrl,
        fileType: "image",
        sourceToolId: "discord-card",
        sourceToolName: "Discord Card Studio",
      });
      router.push("/tools/meme-generator");
    }
  };

  const handleSendToEraser = async () => {
    const dataUrl = await onExportPng();
    if (dataUrl) {
      await sendToTool("/tools/image/eraser", {
        name: `discord-card-${userId}.png`,
        url: dataUrl,
        fileType: "image",
        sourceToolId: "discord-card",
        sourceToolName: "Discord Card Studio",
      });
      router.push("/tools/image/eraser");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-2xl transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0c0d16] p-6 sm:p-8 shadow-[0_0_80px_rgba(88,101,242,0.25)] z-10 overflow-hidden text-white animate-in zoom-in-95 duration-200">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#5865f2]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-cyan-500/15 blur-3xl" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[#5865f2]/40 bg-[#5865f2]/15 text-[#8993f8]">
              <Share2 size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight sm:text-2xl">
                Export & Share Discord Card
              </h2>
              <p className="text-xs font-semibold text-zinc-400">
                Choose from 5 viral formats · Instant high-res capture
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

        {errorMsg && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        {cloudSuccess && (
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-300 flex items-center gap-2">
            <Check size={16} /> Saved directly to your Exismic Cloud Drive!
          </div>
        )}

        <div className="mt-6 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {/* 1. High-Res PNG Capture */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-[#5865f2]/40">
            <div className="flex items-start gap-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <ImageIcon size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white">High-Res PNG Image</h3>
                  <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-indigo-300">
                    2X Retina
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Crisp transparent PNG for Twitter, Instagram, or server posts.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={downloadingPng}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-black transition hover:bg-zinc-200 shrink-0 disabled:opacity-50"
            >
              {downloadingPng ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {downloadingPng ? "Capturing..." : "Download PNG"}
            </button>
          </div>

          {/* 2. Dynamic GitHub README Badge */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 space-y-3 transition hover:border-[#5865f2]/40">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <Code size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white">GitHub README Dynamic Badge</h3>
                    <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-300">
                      Live SVG
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Auto-updates in your GitHub profile README with live status and activities!
                  </p>
                </div>
              </div>
            </div>

            <div className="relative rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs text-zinc-300 overflow-x-auto">
              <code>{readmeMarkdown}</code>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => copyToClipboard(readmeMarkdown, "readme")}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-zinc-200 hover:bg-white/10 transition"
              >
                {copiedType === "readme" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                {copiedType === "readme" ? "Copied Markdown!" : "Copy Markdown"}
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(badgeSvgUrl, "svg-url")}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-white transition"
              >
                {copiedType === "svg-url" ? <Check size={13} className="text-emerald-400" /> : <ExternalLink size={13} />}
                {copiedType === "svg-url" ? "Copied URL!" : "Copy SVG URL"}
              </button>
            </div>
          </div>

          {/* 3. Hosted Public Bio Link */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-[#5865f2]/40">
            <div className="flex items-start gap-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                <Globe size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white">Hosted Bio Link Page</h3>
                  <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-blue-300">
                    Standalone
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-400 truncate max-w-xs sm:max-w-md">
                  {bioUrl}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => copyToClipboard(bioUrl, "bio")}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-zinc-200 hover:bg-white/10 transition"
              >
                {copiedType === "bio" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                {copiedType === "bio" ? "Copied Link!" : "Copy Link"}
              </button>
              <a
                href={bioUrl}
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white transition"
                title="Open Live Page"
              >
                <ExternalLink size={15} />
              </a>
            </div>
          </div>

          {/* 4. Responsive iFrame Embed */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 space-y-2.5 transition hover:border-[#5865f2]/40">
            <div className="flex items-start gap-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                <Code size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black text-white">Responsive iFrame Embed</h3>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Drop into your personal portfolio, Carrd, Notion, or personal blog.
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(iframeSnippet, "iframe")}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-zinc-200 hover:bg-white/10 transition shrink-0"
              >
                {copiedType === "iframe" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                {copiedType === "iframe" ? "Copied iFrame!" : "Copy Embed"}
              </button>
            </div>
          </div>

          {/* 5. Cloud Drive & Pipeline Synergy */}
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-300">
              <Sparkles size={14} />
              <span>Exismic Platform Power Tools</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={handleSaveToCloudDrive}
                disabled={savingToCloud}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-3 text-left transition hover:border-[#5865f2] hover:bg-white/5 disabled:opacity-50"
              >
                {savingToCloud ? <Loader2 size={16} className="animate-spin text-indigo-400" /> : <Cloud size={16} className="text-indigo-400" />}
                <div>
                  <span className="block text-xs font-bold text-white">Cloud Drive</span>
                  <span className="text-[10px] text-zinc-400">Save to /library</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleSendToEraser}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-3 text-left transition hover:border-cyan-500 hover:bg-white/5"
              >
                <Sparkles size={16} className="text-cyan-400" />
                <div>
                  <span className="block text-xs font-bold text-white">Cutout Eraser</span>
                  <span className="text-[10px] text-zinc-400">Remove BG</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleSendToMeme}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-3 text-left transition hover:border-amber-500 hover:bg-white/5"
              >
                <ArrowRight size={16} className="text-amber-400" />
                <div>
                  <span className="block text-xs font-bold text-white">Meme Studio</span>
                  <span className="text-[10px] text-zinc-400">Turn to Meme</span>
                </div>
              </button>
            </div>
          </div>

          {/* 6. Static Web Package (ZIP) */}
          <div className="flex items-center justify-between gap-4 p-2 text-xs text-zinc-500">
            <span className="flex items-center gap-2">
              <FileArchive size={14} /> Self-hosting on your own domain?
            </span>
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className="text-xs font-bold text-zinc-300 hover:text-white underline transition"
            >
              {downloadingZip ? "Generating..." : "Download Standalone HTML ZIP"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
