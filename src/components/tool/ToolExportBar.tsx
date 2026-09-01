"use client";

import React, { useState } from "react";
import { 
  Copy, 
  Check, 
  Download, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Sparkles,
  ExternalLink,
  FileCode,
  FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ToolExportBarProps {
  content: string;
  title?: string;
  toolName?: string;
  fileExtension?: string;
  mimeType?: string;
  className?: string;
  allowChatHandoff?: boolean;
  onSaveToCloud?: () => Promise<boolean>;
}

export function ToolExportBar({
  content,
  title = "Generated Output",
  toolName = "Exismic Tool",
  fileExtension = "txt",
  mimeType = "text/plain",
  className,
  allowChatHandoff = true,
  onSaveToCloud,
}: ToolExportBarProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy
      const textarea = document.createElement("textarea");
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (format: string = fileExtension) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendToChat = () => {
    const prompt = `Here is output from ${toolName}:\n\n\`\`\`\n${content.slice(0, 3000)}\n\`\`\`\n\nPlease review, analyze, or improve this.`;
    // Store in sessionStorage for ChatWorkspace to prefill
    try {
      sessionStorage.setItem("exismic_chat_prefill", prompt);
    } catch {}
    router.push("/chat");
  };

  const handleSaveToCloud = async () => {
    if (saving || saved) return;
    setSaving(true);
    try {
      if (onSaveToCloud) {
        const ok = await onSaveToCloud();
        if (ok) setSaved(true);
      } else {
        const res = await fetch("/api/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalName: `${title}.${fileExtension}`,
            toolType: toolName.toLowerCase().replace(/\s+/g, "_"),
            fileType: mimeType,
            status: "completed",
            metadata: { content: content.slice(0, 5000), title },
          }),
        });
        if (res.ok) {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        }
      }
    } catch (err) {
      console.error("Failed to save file to cloud:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${toolName} Result`,
          text: content.slice(0, 200),
          url: window.location.href,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  if (!content) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-zinc-950/80 border border-white/10 backdrop-blur-xl shadow-2xl transition-all",
        className
      )}
    >
      <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
        <Sparkles size={15} className="text-cyan-400" />
        <span className="hidden sm:inline text-zinc-300">{toolName} Result</span>
        <span className="text-[10px] text-zinc-500 font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
          {content.length.toLocaleString()} chars
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all touch-manipulation",
            copied
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5"
          )}
          title="Copy content to clipboard"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>

        {/* Download Button */}
        <button
          type="button"
          onClick={() => handleDownload()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 transition-all touch-manipulation"
          title={`Download as .${fileExtension}`}
        >
          <Download size={14} />
          <span>Download</span>
        </button>

        {/* Send to Chat Assistant */}
        {allowChatHandoff && (
          <button
            type="button"
            onClick={handleSendToChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500/20 to-cyan-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-all touch-manipulation"
            title="Ask AI Assistant to explain, improve, or edit"
          >
            <MessageSquare size={14} />
            <span className="hidden md:inline">Open in Chat</span>
          </button>
        )}

        {/* Save to Cloud */}
        <button
          type="button"
          onClick={handleSaveToCloud}
          disabled={saving}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all touch-manipulation",
            saved
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
              : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 border border-white/5"
          )}
          title="Save to your cloud history"
        >
          <Bookmark size={14} className={saved ? "text-purple-400" : ""} />
          <span className="hidden sm:inline">{saved ? "Saved!" : "Save"}</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5 transition-all touch-manipulation"
          title="Share"
        >
          <Share2 size={14} />
        </button>
      </div>
    </div>
  );
}
