"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud,
  HardDrive,
  Upload,
  Download,
  Trash2,
  Search,
  Check,
  Sparkles,
  Zap,
  Image as ImageIcon,
  FileText,
  Video,
  Scissors,
  Smile,
  Maximize2,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Archive,
  AlertCircle,
  X,
  Plus,
  Crown,
  FileCode,
  ShieldCheck,
  CheckSquare,
  Square,
  Gamepad2,
  LayoutGrid,
  List,
  FolderOpen,
  Palette,
  Share2,
} from "lucide-react";
import Link from "next/link";
import JSZip from "jszip";
import { cn } from "@/lib/utils";
import { useCredits } from "@/hooks/useCredits";
import { sendToTool } from "@/lib/pipeline";
import { BuyCreditsModal } from "@/components/credits/BuyCreditsModal";
import { ResultFileType } from "@/lib/results";

interface DriveFile {
  id: string;
  originalName: string;
  toolType: string;
  originalUrl?: string | null;
  resultUrl?: string | null;
  fileType: string;
  status: string;
  createdAt: string;
  metadata?: {
    sizeBytes?: number;
    mimeType?: string;
    width?: number;
    height?: number;
    category?: string;
    uploadedToDrive?: boolean;
    [key: string]: any;
  } | null;
}

interface StorageInfo {
  plan: "free" | "pro";
  usedBytes: number;
  totalBytes: number;
  usedPercent: number;
  fileCount: number;
  remainingBytes: number;
  maxUploadBytes: number;
  quotaFormatted: {
    used: string;
    total: string;
    remaining: string;
  };
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatTimeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

function getToolBadge(toolType: string): { label: string; color: string; icon: any } {
  const t = toolType.toLowerCase();
  if (t.includes("minecraft-skin")) {
    return { label: "MC Skin", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", icon: Gamepad2 };
  }
  if (t.includes("eraser") || t.includes("bg-remove")) {
    return { label: "Cutout", color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30", icon: Scissors };
  }
  if (t.includes("ai-img") || t.includes("generate") || t.includes("art")) {
    return { label: "AI Art", color: "bg-purple-500/15 text-purple-300 border-purple-500/30", icon: Palette };
  }
  if (t.includes("meme")) {
    return { label: "Meme", color: "bg-amber-500/15 text-amber-300 border-amber-500/30", icon: Smile };
  }
  if (t.includes("resume") || t.includes("invoice") || t.includes("pdf") || t.includes("document")) {
    return { label: "Document", color: "bg-blue-500/15 text-blue-300 border-blue-500/30", icon: FileText };
  }
  if (t.includes("compress") || t.includes("resize") || t.includes("convert")) {
    return { label: "Optimized", color: "bg-teal-500/15 text-teal-300 border-teal-500/30", icon: Zap };
  }
  if (t.includes("caption") || t.includes("hook") || t.includes("script")) {
    return { label: "Social", color: "bg-rose-500/15 text-rose-300 border-rose-500/30", icon: Share2 };
  }
  return { label: "Upload", color: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30", icon: Cloud };
}

export function LibraryClient() {
  const { isPro } = useCredits();

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Selection & Batch State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [batchActionLoading, setBatchActionLoading] = useState(false);

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals
  const [activeLightboxFile, setActiveLightboxFile] = useState<DriveFile | null>(null);
  const [showProModal, setShowProModal] = useState(false);
  const [activeToolMenuFileId, setActiveToolMenuFileId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch drive files and storage stats
  const refreshDriveData = useCallback(async () => {
    try {
      setLoading(true);
      const [storageRes, filesRes] = await Promise.all([
        fetch("/api/drive/storage", { cache: "no-store" }),
        fetch("/api/files/history?limit=500", { cache: "no-store" }),
      ]);

      if (storageRes.ok) {
        const storageData = await storageRes.json();
        if (storageData.success) {
          setStorageInfo(storageData);
        }
      }

      if (filesRes.ok) {
        const filesData = await filesRes.json();
        if (Array.isArray(filesData)) {
          setFiles(filesData);
        }
      }
    } catch (err) {
      console.error("[Cloud Drive] Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDriveData();
  }, [refreshDriveData]);

  // Handle file uploads directly into Drive
  const handleFileUpload = async (uploadedFiles: FileList | File[]) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    setIsUploading(true);
    setUploadMessage(null);

    let successCount = 0;
    let lastError: string | null = null;

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/drive/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          lastError = data.error || `Failed to upload ${file.name}`;
        } else {
          successCount++;
        }
      } catch (err: any) {
        lastError = err.message || "Network error uploading file.";
      }
    }

    setIsUploading(false);
    if (successCount > 0) {
      setUploadMessage({
        type: "success",
        text: `Uploaded ${successCount} ${successCount === 1 ? "file" : "files"} to your Cloud Drive!`,
      });
      refreshDriveData();
      setTimeout(() => setUploadMessage(null), 5000);
    } else if (lastError) {
      setUploadMessage({ type: "error", text: lastError });
    }
  };

  // Delete single file
  const handleDeleteFile = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this file from your Cloud Drive?")) return;

    try {
      const res = await fetch(`/api/files/history?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        setSelectedFileIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        if (activeLightboxFile?.id === id) setActiveLightboxFile(null);
        fetch("/api/drive/storage").then((r) => r.json()).then((d) => d.success && setStorageInfo(d));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Batch delete selected files
  const handleBatchDelete = async () => {
    if (selectedFileIds.size === 0) return;
    if (!confirm(`Permanently delete ${selectedFileIds.size} selected items to free up your Cloud Drive?`)) return;

    setBatchActionLoading(true);
    try {
      const res = await fetch("/api/drive/batch-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedFileIds) }),
      });

      const data = await res.json();
      if (data.success) {
        setFiles((prev) => prev.filter((f) => !selectedFileIds.has(f.id)));
        setSelectedFileIds(new Set());
        setIsSelectionMode(false);
        refreshDriveData();
      }
    } catch (err) {
      console.error("Batch delete error:", err);
    } finally {
      setBatchActionLoading(false);
    }
  };

  // Batch download selected files as ZIP (Zero server cost!)
  const handleBatchDownloadZip = async () => {
    if (selectedFileIds.size === 0) return;

    if (!isPro && selectedFileIds.size > 5) {
      alert("Free accounts can batch download up to 5 files at a time. Upgrade to Pro for unlimited batch exports!");
      setShowProModal(true);
      return;
    }

    setBatchActionLoading(true);
    try {
      const zip = new JSZip();
      const selectedItems = files.filter((f) => selectedFileIds.has(f.id));

      await Promise.all(
        selectedItems.map(async (item, idx) => {
          const targetUrl = item.resultUrl || item.originalUrl;
          if (!targetUrl) return;

          try {
            const res = await fetch(targetUrl);
            const blob = await res.blob();
            const safeName = item.originalName || `asset_${idx + 1}.png`;
            zip.file(safeName, blob);
          } catch (fetchErr) {
            console.warn(`Failed to include file ${item.id} in ZIP:`, fetchErr);
          }
        })
      );

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exismic-vault-export-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (err) {
      console.error("ZIP packaging failed:", err);
      alert("Failed to build ZIP file. Please try downloading files individually.");
    } finally {
      setBatchActionLoading(false);
    }
  };

  // Toggle selection
  const toggleSelectFile = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFileIds.size === filteredFiles.length) {
      setSelectedFileIds(new Set());
    } else {
      setSelectedFileIds(new Set(filteredFiles.map((f) => f.id)));
    }
  };

  // 1-Click Tool Handoff
  const handlePipeToTool = (file: DriveFile, targetToolHref: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const mediaUrl = file.resultUrl || file.originalUrl;
    if (!mediaUrl) return;

    sendToTool(targetToolHref, {
      name: file.originalName,
      url: mediaUrl,
      fileType: (file.fileType as any) || "image",
      sourceToolId: file.toolType || "cloud-drive",
      sourceToolName: "Cloud Drive",
    });
  };

  // Clean Download
  const handleDirectDownload = async (file: DriveFile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetUrl = file.resultUrl || file.originalUrl;
    if (!targetUrl) return;

    try {
      const res = await fetch(targetUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.originalName || `exismic-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (err) {
      console.error("Direct download failed:", err);
    }
  };

  // Filtered files calculation
  const filteredFiles = useMemo(() => {
    return files.filter((item) => {
      const t = item.toolType.toLowerCase();

      if (selectedCategory === "art") {
        if (!t.includes("ai-img") && !t.includes("generate") && !t.includes("art") && !t.includes("skin") && !t.includes("prompt")) return false;
      } else if (selectedCategory === "cutout") {
        if (!t.includes("eraser") && !t.includes("bg-remove")) return false;
      } else if (selectedCategory === "meme") {
        if (!t.includes("meme") && !t.includes("caption") && !t.includes("hook")) return false;
      } else if (selectedCategory === "document") {
        if (!t.includes("resume") && !t.includes("invoice") && !t.includes("pdf") && !t.includes("doc")) return false;
      } else if (selectedCategory === "upload") {
        if (!t.includes("cloud-drive") && !t.includes("upload")) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.originalName.toLowerCase().includes(q);
        const matchTool = item.toolType.toLowerCase().includes(q);
        if (!matchName && !matchTool) return false;
      }

      return true;
    });
  }, [files, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Obsidian Glass Deck */}
      <header className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.12] bg-[linear-gradient(135deg,#0d0e20_0%,#090a16_50%,#060812_100%)] p-6 sm:p-8 md:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]">
        {/* Neon Laser Line on Top */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 via-purple-500 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8)]" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3.5">
            {/* Tag Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-bold text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <Cloud size={13} className="text-cyan-400" />
                <span>Studio Cloud Drive</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-300">
                {isPro ? <Crown size={12} className="text-amber-400" /> : <Zap size={12} className="text-purple-400" />}
                <span>{isPro ? "5 GB Pro Vault" : "50 MB Free Vault"}</span>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono font-semibold text-zinc-400">
                {files.length} Total Assets
              </div>
            </div>

            {/* Main Heading — Fixed unclipped italic text! */}
            <div className="space-y-1 overflow-visible">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase text-white overflow-visible leading-tight">
                My Creative{" "}
                <span className="inline-block pr-4 italic bg-[linear-gradient(110deg,#ffffff_10%,#a5f3fc_50%,#c084fc_90%)] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(34,211,238,0.35)]">
                  Vault
                </span>
              </h1>
              <p className="max-w-2xl text-xs sm:text-sm font-medium leading-relaxed text-zinc-400">
                Your personal asset drive. Store, organize, batch export, and seamlessly pipe your creations between
                Exismic editing tools.
              </p>
            </div>
          </div>

          {/* Storage Meter Cyber-Card */}
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-gradient-to-b from-[#12132a]/90 to-[#090a16]/95 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-zinc-200">
                <HardDrive size={15} className="text-cyan-400" />
                <span>Cloud Storage</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-white">
                  {storageInfo?.quotaFormatted?.used || "0 MB"} / {storageInfo?.quotaFormatted?.total || (isPro ? "5.0 GB" : "50 MB")}
                </span>
                <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300">
                  {storageInfo?.usedPercent ?? 0}%
                </span>
              </div>
            </div>

            {/* Glowing Dual-Tone Progress Meter */}
            <div className="relative mt-3 h-2 w-full overflow-hidden rounded-full bg-black/50 border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(2, Math.min(100, storageInfo?.usedPercent ?? 0))}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full transition-all",
                  (storageInfo?.usedPercent ?? 0) > 85
                    ? "bg-gradient-to-r from-amber-400 to-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]"
                    : "bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                )}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400">
              <span>{storageInfo?.fileCount ?? files.length} assets synced</span>
              {!isPro ? (
                <button
                  type="button"
                  onClick={() => setShowProModal(true)}
                  className="flex items-center gap-1.5 font-black text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Crown size={12} className="text-amber-400" />
                  <span>Upgrade to 5 GB</span>
                </button>
              ) : (
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  <ShieldCheck size={12} />
                  <span>Pro Active</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Compact & High-Tech Quick Drop Command Bar */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative overflow-hidden rounded-2xl border transition-all duration-300 p-3.5 sm:p-4 cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg",
          isDragOver
            ? "border-cyan-400 bg-cyan-500/15 shadow-[0_0_30px_rgba(34,211,238,0.3)] scale-[1.01]"
            : "border-white/10 bg-[#090a16]/80 hover:border-cyan-400/40 hover:bg-[#0c0d1e]/90"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFileUpload(e.target.files);
          }}
        />

        {/* Left Side: Drag and Drop hint with Browse trigger */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            {isUploading ? <RefreshCw className="animate-spin" size={18} /> : <Upload size={18} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                {isUploading ? "Uploading & optimizing file..." : "Drop files to upload directly"}
              </span>
              <span className="text-[11px] text-zinc-500 hidden md:inline">•</span>
              <span className="text-[11px] text-zinc-400 hidden md:inline">
                PNG, JPG, WebP, SVG, PDF (Max {isPro ? "50 MB" : "10 MB"})
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 sm:hidden">
              Max {isPro ? "50 MB" : "10 MB"} per file
            </p>
          </div>
        </div>

        {/* Right Side: Browse Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <FolderOpen size={13} />
            <span>Browse Files</span>
          </button>
        </div>
      </div>

      {/* Upload Feedback Banner */}
      <AnimatePresence>
        {uploadMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-bold",
              uploadMessage.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-rose-500/30 bg-rose-500/10 text-rose-300"
            )}
          >
            <div className="flex items-center gap-2">
              {uploadMessage.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
              <span>{uploadMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setUploadMessage(null)}
              className="text-zinc-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Controls & Filter Bar */}
      <div className="flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { id: "all", label: "All Assets", count: files.length },
            {
              id: "art",
              label: "🎨 AI Art & Skins",
              count: files.filter((f) => {
                const t = f.toolType.toLowerCase();
                return t.includes("img") || t.includes("art") || t.includes("skin") || t.includes("prompt");
              }).length,
            },
            {
              id: "cutout",
              label: "✂️ Cutouts",
              count: files.filter((f) => {
                const t = f.toolType.toLowerCase();
                return t.includes("eraser") || t.includes("bg");
              }).length,
            },
            {
              id: "meme",
              label: "🎭 Memes & Social",
              count: files.filter((f) => {
                const t = f.toolType.toLowerCase();
                return t.includes("meme") || t.includes("caption") || t.includes("hook");
              }).length,
            },
            {
              id: "document",
              label: "📄 Documents",
              count: files.filter((f) => f.fileType === "document" || f.fileType === "pdf" || f.toolType.includes("resume") || f.toolType.includes("invoice")).length,
            },
            {
              id: "upload",
              label: "📁 Direct Uploads",
              count: files.filter((f) => f.toolType.includes("drive") || f.toolType.includes("upload")).length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all",
                selectedCategory === tab.id
                  ? "bg-white text-black shadow-lg shadow-white/10"
                  : "border border-white/5 bg-white/[0.03] text-zinc-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px] font-mono",
                    selectedCategory === tab.id ? "bg-black/10 text-black font-black" : "bg-white/10 text-zinc-300"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search, View Mode & Selection Mode Toggle */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-60">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or tool..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-1.5 pl-8 pr-3 text-xs text-white placeholder-zinc-500 focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.04] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
                viewMode === "grid" ? "bg-white/20 text-white" : "text-zinc-400 hover:text-white"
              )}
              title="Grid View"
            >
              <LayoutGrid size={13} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
                viewMode === "list" ? "bg-white/20 text-white" : "text-zinc-400 hover:text-white"
              )}
              title="List View"
            >
              <List size={13} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              if (isSelectionMode) setSelectedFileIds(new Set());
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all",
              isSelectionMode
                ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
            )}
          >
            <CheckSquare size={13} />
            <span>{isSelectionMode ? "Exit" : "Select"}</span>
          </button>
        </div>
      </div>

      {/* 4. Selection Mode Floating Action Bar */}
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyan-400/30 bg-[#0c0d1c]/95 px-5 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs font-bold text-zinc-300 hover:text-white transition-colors"
              >
                {selectedFileIds.size === filteredFiles.length ? "Deselect All" : "Select All Visible"}
              </button>
              <span className="text-zinc-600">•</span>
              <span className="text-xs font-mono font-bold text-cyan-300">
                {selectedFileIds.size} of {filteredFiles.length} selected
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={selectedFileIds.size === 0 || batchActionLoading}
                onClick={handleBatchDownloadZip}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white transition-all hover:brightness-110 disabled:opacity-50 shadow-md"
              >
                {batchActionLoading ? <RefreshCw className="animate-spin" size={13} /> : <Archive size={13} />}
                <span>Download as ZIP</span>
              </button>

              <button
                type="button"
                disabled={selectedFileIds.size === 0 || batchActionLoading}
                onClick={handleBatchDelete}
                className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-300 transition-all hover:bg-rose-500/20 disabled:opacity-50"
              >
                <Trash2 size={13} />
                <span>Delete ({selectedFileIds.size})</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Main Assets Display (Grid or List View) */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]"
            />
          ))}
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02] py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-zinc-500 mb-4">
            <FolderOpen size={28} />
          </div>
          <h3 className="text-base font-bold text-white">No assets found in this view</h3>
          <p className="mt-1 text-xs text-zinc-400 max-w-sm">
            {searchQuery
              ? `No files match your search query "${searchQuery}".`
              : "Try switching category filters or drop files above to start your collection!"}
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/tools/ai/img-gen"
              className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 text-xs font-bold text-white hover:brightness-110"
            >
              Generate AI Art
            </Link>
            <Link
              href="/tools/image/eraser"
              className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white"
            >
              Remove Background
            </Link>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredFiles.map((file) => {
            const badge = getToolBadge(file.toolType);
            const BadgeIcon = badge.icon;
            const isSelected = selectedFileIds.has(file.id);
            const mediaUrl = file.resultUrl || file.originalUrl;
            const isImage =
              file.fileType === "image" ||
              file.toolType.includes("image") ||
              file.toolType.includes("eraser") ||
              file.toolType.includes("skin") ||
              file.toolType.includes("meme");

            return (
              <div
                key={file.id}
                onClick={() => {
                  if (isSelectionMode) toggleSelectFile(file.id);
                  else setActiveLightboxFile(file);
                }}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-2xl border bg-[#0b0c17] transition-all duration-300 cursor-pointer",
                  isSelected
                    ? "border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                    : "border-white/10 hover:border-cyan-400/40 hover:shadow-xl hover:-translate-y-1"
                )}
              >
                {/* Media Thumbnail Container with Transparency Checkerboard */}
                <div className="relative aspect-square w-full overflow-hidden bg-[linear-gradient(45deg,#131422_25%,transparent_25%),linear-gradient(-45deg,#131422_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#131422_75%),linear-gradient(-45deg,transparent_75%,#131422_75%)] bg-[size:14px_14px] bg-[#090a14]">
                  {isImage && mediaUrl ? (
                    <img
                      src={mediaUrl}
                      alt={file.originalName}
                      className={cn(
                        "h-full w-full transition-transform duration-500 group-hover:scale-105",
                        file.toolType.includes("skin") ? "object-contain p-2" : "object-cover"
                      )}
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-zinc-500">
                      <FileText size={32} className="text-zinc-400" />
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{file.fileType}</span>
                    </div>
                  )}

                  {/* Top Badge: Tool Type */}
                  <div
                    className={cn(
                      "absolute left-2 top-2 z-10 flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-bold backdrop-blur-md shadow-md",
                      badge.color
                    )}
                  >
                    <BadgeIcon size={10} />
                    <span>{badge.label}</span>
                  </div>

                  {/* Selection Mode Checkbox / Maximize trigger */}
                  {isSelectionMode ? (
                    <button
                      type="button"
                      onClick={(e) => toggleSelectFile(file.id, e)}
                      className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-lg border bg-black/70 backdrop-blur-md"
                    >
                      {isSelected ? (
                        <CheckSquare size={15} className="text-cyan-400" />
                      ) : (
                        <Square size={15} className="text-zinc-400" />
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveLightboxFile(file);
                      }}
                      className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-black/60 text-zinc-300 opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 hover:text-white"
                      title="Preview in full resolution"
                    >
                      <Maximize2 size={11} />
                    </button>
                  )}

                  {/* Hover Quick Actions Bar */}
                  {!isSelectionMode && (
                    <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-white/10 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => handleDirectDownload(file, e)}
                        className="flex h-6 items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-2 text-[10px] font-bold text-white backdrop-blur-md hover:bg-white/20"
                        title="Download clean file"
                      >
                        <Download size={10} />
                        <span>Save</span>
                      </button>

                      {/* Tool Handoff Dropdown Trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveToolMenuFileId(activeToolMenuFileId === file.id ? null : file.id);
                          }}
                          className="flex h-6 items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/20 px-2 text-[10px] font-bold text-purple-200 backdrop-blur-md hover:bg-purple-500/30"
                          title="Pipe into companion tool"
                        >
                          <Zap size={10} className="text-purple-300" />
                          <span>Open in...</span>
                          <ChevronDown size={9} />
                        </button>

                        {/* Interactive Handoff Menu */}
                        {activeToolMenuFileId === file.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute bottom-full right-0 mb-1.5 w-44 rounded-xl border border-white/15 bg-[#121326] p-1.5 shadow-2xl backdrop-blur-2xl z-30"
                          >
                            <p className="px-2 py-1 text-[9px] font-black uppercase tracking-wider text-zinc-500">
                              Pipe into Tool
                            </p>
                            <button
                              type="button"
                              onClick={(e) => handlePipeToTool(file, "/tools/image/eraser", e)}
                              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white"
                            >
                              <Scissors size={12} className="text-emerald-400" />
                              <span>Remove Background</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handlePipeToTool(file, "/tools/meme-generator", e)}
                              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white"
                            >
                              <Smile size={12} className="text-amber-400" />
                              <span>Turn into Meme</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handlePipeToTool(file, "/tools/image/resizer", e)}
                              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white"
                            >
                              <Maximize2 size={12} className="text-cyan-400" />
                              <span>Resize & Crop</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handlePipeToTool(file, "/tools/image/compressor", e)}
                              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white"
                            >
                              <Zap size={12} className="text-purple-400" />
                              <span>Compress File</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handlePipeToTool(file, "/tools/image/converter", e)}
                              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white"
                            >
                              <RefreshCw size={12} className="text-blue-400" />
                              <span>Convert Format</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Info Footer */}
                <div className="p-2.5">
                  <p className="truncate text-xs font-bold text-white" title={file.originalName}>
                    {file.originalName}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400">
                    <span>{formatBytes(file.metadata?.sizeBytes)}</span>
                    <span>{formatTimeAgo(file.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-2">
          {filteredFiles.map((file) => {
            const badge = getToolBadge(file.toolType);
            const isSelected = selectedFileIds.has(file.id);
            const mediaUrl = file.resultUrl || file.originalUrl;

            return (
              <div
                key={file.id}
                onClick={() => {
                  if (isSelectionMode) toggleSelectFile(file.id);
                  else setActiveLightboxFile(file);
                }}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-2.5 sm:p-3 transition-all cursor-pointer",
                  isSelected
                    ? "border-cyan-400 bg-cyan-500/10"
                    : "border-white/10 bg-[#0b0c17] hover:border-white/20 hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isSelectionMode && (
                    <button
                      type="button"
                      onClick={(e) => toggleSelectFile(file.id, e)}
                      className="shrink-0 text-cyan-400"
                    >
                      {isSelected ? <CheckSquare size={16} /> : <Square size={16} className="text-zinc-500" />}
                    </button>
                  )}

                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-black/40 border border-white/10">
                    {mediaUrl ? (
                      <img src={mediaUrl} alt={file.originalName} className="h-full w-full object-cover" />
                    ) : (
                      <FileText className="m-auto h-full text-zinc-500" size={18} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-white max-w-xs sm:max-w-md">
                      {file.originalName}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <span className={cn("font-semibold", badge.color.split(" ")[1])}>{badge.label}</span>
                      <span>•</span>
                      <span>{formatBytes(file.metadata?.sizeBytes)}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(file.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(e) => handleDirectDownload(file, e)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                    title="Download"
                  >
                    <Download size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteFile(file.id, e)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Lightbox Preview Modal */}
      <AnimatePresence>
        {activeLightboxFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl"
            onClick={() => setActiveLightboxFile(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#0a0b16] shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Cloud size={18} className="text-cyan-400 shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{activeLightboxFile.originalName}</h4>
                    <p className="text-[11px] text-zinc-400">
                      {formatBytes(activeLightboxFile.metadata?.sizeBytes)} • {new Date(activeLightboxFile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteFile(activeLightboxFile.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors"
                    title="Delete file"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLightboxFile(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Body Preview with Transparency Checkerboard */}
              <div className="flex flex-1 items-center justify-center overflow-auto bg-[linear-gradient(45deg,#131422_25%,transparent_25%),linear-gradient(-45deg,#131422_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#131422_75%),linear-gradient(-45deg,transparent_75%,#131422_75%)] bg-[size:16px_16px] bg-[#090a14] p-6 min-h-[350px]">
                {activeLightboxFile.resultUrl || activeLightboxFile.originalUrl ? (
                  <img
                    src={activeLightboxFile.resultUrl || activeLightboxFile.originalUrl!}
                    alt={activeLightboxFile.originalName}
                    className="max-h-[60vh] w-auto rounded-xl object-contain shadow-2xl"
                  />
                ) : (
                  <p className="text-zinc-500">No visual preview available</p>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#070810] px-6 py-4">
                {/* 1-Click Pipeline Quick Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePipeToTool(activeLightboxFile, "/tools/image/eraser")}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/25"
                  >
                    <Scissors size={13} />
                    <span>Cutout</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePipeToTool(activeLightboxFile, "/tools/meme-generator")}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/25"
                  >
                    <Smile size={13} />
                    <span>Make Meme</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePipeToTool(activeLightboxFile, "/tools/image/resizer")}
                    className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/15 px-3 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/25"
                  >
                    <Maximize2 size={13} />
                    <span>Resize</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePipeToTool(activeLightboxFile, "/tools/image/compressor")}
                    className="flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/15 px-3 py-1.5 text-xs font-bold text-purple-200 hover:bg-purple-500/25"
                  >
                    <Zap size={13} />
                    <span>Compress</span>
                  </button>
                </div>

                {/* Direct Download Button */}
                <button
                  type="button"
                  onClick={() => handleDirectDownload(activeLightboxFile)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:brightness-110"
                >
                  <Download size={14} />
                  <span>Download Clean File</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pro Plan Upgrade Modal */}
      {showProModal && (
        <BuyCreditsModal
          isOpen={showProModal}
          onClose={() => setShowProModal(false)}
          initialCategory="pro"
        />
      )}
    </div>
  );
}
