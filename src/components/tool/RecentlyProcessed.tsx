"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, 
  RefreshCw, 
  History, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  Play, 
  AudioWaveform,
  ExternalLink,
  Trash2,
  Search,
  Check,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { TOOLS } from "@/data/tools";
import { isDownloadableResultUrl, normalizeHistoryToolType, type ResultFileType } from "@/lib/results";
import { Skeleton, SkeletonLine } from "@/components/ui/Skeleton";
import { getFunctionalStorageItem } from "@/lib/cookie-consent";

interface ProcessedItem {
  id: string;
  originalName: string;
  toolType: string;
  originalUrl?: string;
  resultUrl?: string;
  fileType: ResultFileType;
  timestamp: string; // mapped from createdAt
  status: string;
  createdAt: string;
}

const FileIcon = ({ type }: { type: string }) => {
  if (type.includes('image')) return <ImageIcon className="w-10 h-10 text-cyan-400" />;
  if (type.includes('audio')) return <AudioWaveform className="w-10 h-10 text-purple-400" />;
  if (type.includes('video')) return <Video className="w-10 h-10 text-blue-400" />;
  if (type.includes('pdf') || type.includes('doc')) return <FileText className="w-10 h-10 text-emerald-400" />;
  return <FileText className="w-10 h-10 text-zinc-400" />;
};

const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

interface RecentlyProcessedProps {
  limit?: number;
  fullPage?: boolean;
}

const DEFAULT_HISTORY_PREFERENCES = {
  autoRefreshHistory: true,
  highFidelityPreview: false,
};

function readHistoryPreferences() {
  if (typeof window === "undefined") return DEFAULT_HISTORY_PREFERENCES;
  const rawPreferences = getFunctionalStorageItem("exismic:user-preferences");
  if (!rawPreferences) return DEFAULT_HISTORY_PREFERENCES;

  try {
    const parsed = JSON.parse(rawPreferences);
    return {
      autoRefreshHistory: typeof parsed.autoRefreshHistory === "boolean" ? parsed.autoRefreshHistory : true,
      highFidelityPreview: typeof parsed.highFidelityPreview === "boolean" ? parsed.highFidelityPreview : false,
    };
  } catch {
    return DEFAULT_HISTORY_PREFERENCES;
  }
}

export function RecentlyProcessed({ limit = 10, fullPage = false }: RecentlyProcessedProps) {
  const [items, setItems] = useState<ProcessedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState(readHistoryPreferences);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const supabase = createClient();
  const historyFetchRef = React.useRef<Promise<any> | null>(null);

  const loadHistory = useCallback(async () => {
    if (historyFetchRef.current) return historyFetchRef.current;

    historyFetchRef.current = (async () => {
      try {
        const response = await fetch(`/api/files/history?limit=${limit}`, { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          setItems(data);
          return data;
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        historyFetchRef.current = null;
      }
    })();

    return historyFetchRef.current;
  }, [limit]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession?.user) {
        await loadHistory();
      }
      setLoading(false);
    };

    getSession();

    const handlePreferencesUpdate = (event: Event) => {
      const detail = (event as CustomEvent).detail || {};
      setPreferences({
        autoRefreshHistory: typeof detail.autoRefreshHistory === "boolean" ? detail.autoRefreshHistory : true,
        highFidelityPreview: typeof detail.highFidelityPreview === "boolean" ? detail.highFidelityPreview : false,
      });
    };
    window.addEventListener("exismic-preferences-updated", handlePreferencesUpdate);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (!session?.user) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      loadHistory().finally(() => setLoading(false));
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("exismic-preferences-updated", handlePreferencesUpdate);
    };
  }, [supabase, loadHistory]);

  useEffect(() => {
    if (!preferences.autoRefreshHistory) return;

    const refreshTimer = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/files/history?limit=${limit}`, { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          setItems(data);
        }
      } catch (error) {
        console.warn("Auto-refresh history failed:", error);
      }
    }, 15000);

    return () => window.clearInterval(refreshTimer);
  }, [limit, preferences.autoRefreshHistory]);

  const deleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/files/history?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete history item:", error);
    }
  };

  const getToolInfo = (toolId: string) => {
    const normalizedToolId = normalizeHistoryToolType(toolId);
    const tool = TOOLS.find(t => t.id === normalizedToolId);
    return {
      name: tool?.name || "AI Tool",
      href: tool?.href || "/tools"
    };
  };

  // Filter items based on search and category inputs
  const filteredItems = items.filter(item => {
    const matchesSearch = item.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.fileType.toLowerCase().includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <section className="px-0 sm:px-4 space-y-8 md:space-y-12 overflow-hidden">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="space-y-3">
              <SkeletonLine className="h-5 w-56 max-w-[70vw]" />
              <SkeletonLine className="w-44 max-w-[60vw]" />
            </div>
          </div>
          {!fullPage && <Skeleton className="h-11 w-28 rounded-full" />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: fullPage ? 6 : 3 }).map((_, index) => (
            <div
              key={index}
              className="w-full rounded-[2rem] border border-white/5 bg-white/[0.025] p-3"
            >
              <Skeleton className="aspect-[16/10] rounded-[1.5rem]" />
              <div className="p-4 space-y-3">
                <SkeletonLine className="h-4 w-4/5" />
                <SkeletonLine className="w-1/2" />
                <div className="mt-4 flex flex-col gap-2">
                  <Skeleton className="h-10 rounded-xl" />
                  <Skeleton className="h-10 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className={cn(fullPage ? "px-0 py-4" : "px-4 py-12")}>
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 bg-[#0a0b14]/80 p-8 sm:p-12 md:p-16 rounded-[2.5rem] md:rounded-[3rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-zinc-500 shadow-inner">
             <History size={36} />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight">No creations found</h3>
            <p className="text-zinc-400 font-medium max-w-sm mx-auto text-sm">
              Try running one of our AI tools to automatically populate your personal history vault!
            </p>
          </div>
          <Link 
            href="/tools" 
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg hover:shadow-cyan-500/25"
          >
            <span>Explore All Tools</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="px-0 space-y-8 md:space-y-10 overflow-x-hidden">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <History size={20} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase italic">
              {fullPage ? "All Saved Results" : "Recent Creations"}
            </h2>
            <p className="text-xs font-semibold text-zinc-400 flex items-center gap-2 mt-0.5">
              <span>{filteredItems.length} {filteredItems.length === 1 ? "file" : "files"} available</span>
              {preferences.autoRefreshHistory && <span className="text-cyan-300 font-bold">• Live Sync</span>}
            </p>
          </div>
        </div>
        
        {!fullPage && (
          <Link 
            href="/history" 
            className="group flex min-h-11 w-fit items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/30 hover:bg-cyan-500/10 text-xs font-bold text-zinc-300 hover:text-white transition-all shadow-md"
          >
            <span>View Full Vault</span>
            <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-cyan-400" />
          </Link>
        )}
      </div>

      {/* Interactive Search and Category Filters */}
      {fullPage && (
        <div className="flex flex-col lg:flex-row items-center gap-4 bg-[#0a0c16]/80 border border-white/10 p-3 sm:p-4 rounded-3xl backdrop-blur-2xl relative z-30 shadow-2xl">
          <div className="relative flex-1 w-full">
            <input 
              type="text" 
              placeholder="Search processed files by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 bg-white/[0.04] border border-white/10 hover:border-white/20 focus:border-cyan-400/50 focus:bg-cyan-950/20 focus:shadow-[0_0_20px_rgba(34,211,238,0.15)] rounded-2xl pl-11 pr-4 text-xs font-bold text-white placeholder-zinc-500 outline-none transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              <Search size={16} strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {[
              { id: "all", label: "All Formats" },
              { id: "image", label: "Images" },
              { id: "audio", label: "Audios" },
              { id: "video", label: "Videos" },
              { id: "pdf", label: "Documents" },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  selectedCategory === cat.id 
                    ? "bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.4)]" 
                    : "bg-white/[0.03] border border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.08]"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Results */}
      <div className="relative group/container w-full">
        <div className="pb-8 md:pb-12 w-full">
          {filteredItems.length === 0 ? (
            <div className="w-full text-center py-16 bg-[#0a0b14]/60 border border-white/10 rounded-[2.5rem] backdrop-blur-md">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-zinc-500 mb-4 shadow-inner">
                <History size={24} />
              </div>
              <h4 className="text-base font-black uppercase italic tracking-tight text-white">No matching creations</h4>
              <p className="text-xs font-semibold text-zinc-500 mt-1 max-w-sm mx-auto">
                No files matched your filter criteria. Try selecting another tab or resetting search.
              </p>
            </div>
          ) : (
            <div className={cn(
              "grid gap-6 items-stretch w-full",
              fullPage 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            )}>
            <AnimatePresence mode="popLayout">
              {(fullPage ? filteredItems : filteredItems.slice(0, 3)).map((item, i) => {
                const toolInfo = getToolInfo(item.toolType);
                const downloadableUrl = isDownloadableResultUrl(item.resultUrl)
                  ? item.resultUrl
                  : isDownloadableResultUrl(item.originalUrl)
                    ? item.originalUrl
                    : null;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ 
                      duration: 0.35, 
                      delay: i * 0.04,
                      type: "spring",
                      stiffness: 140,
                      damping: 18
                    }}
                    className="w-full h-full p-2.5 rounded-[2rem] bg-[#0c0d1c]/90 backdrop-blur-2xl border border-white/10 group hover:border-cyan-400/40 hover:shadow-[0_20px_60px_rgba(6,182,212,0.15)] transition-all duration-500 relative touch-manipulation overflow-hidden shadow-xl hover:-translate-y-1.5 flex flex-col justify-between"
                  >
                    <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-500/0 via-purple-500/0 to-transparent group-hover:from-cyan-500/5 group-hover:via-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    
                    {/* Media Preview Box */}
                    <div>
                      <div className="relative aspect-[16/10] rounded-[1.5rem] overflow-hidden bg-black/60 border border-white/5 flex items-center justify-center transition-transform duration-700 group-hover:scale-[0.99]">
                        {(item.fileType === 'image' || item.resultUrl?.match(/\.(webp|jpg|jpeg|gif|png)/i)) && downloadableUrl ? (
                          <>
                            <img 
                              src={downloadableUrl}
                              alt={item.originalName} 
                              loading={preferences.highFidelityPreview ? "eager" : "lazy"}
                              decoding={preferences.highFidelityPreview ? "sync" : "async"}
                              fetchPriority={preferences.highFidelityPreview ? "high" : "auto"}
                              className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity duration-700"
                            />
                            {item.fileType === 'video' && (
                              <div className="absolute inset-0 flex items-center justify-center z-10">
                                <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg">
                                  <Play fill="currentColor" size={18} />
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-3 opacity-50 group-hover:opacity-100 transition-opacity duration-700">
                            <FileIcon type={item.fileType} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300">
                              {item.fileType.toUpperCase()} PREVIEW
                            </span>
                          </div>
                        )}

                        {/* Trash Delete Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteItem(item.id);
                          }}
                          className="absolute top-3 left-3 z-20 p-2.5 rounded-xl bg-black/70 hover:bg-rose-950/90 border border-white/10 hover:border-rose-500/40 text-zinc-400 hover:text-rose-400 backdrop-blur-xl transition-all duration-300 active:scale-90 shadow-md cursor-pointer"
                          title="Delete from history"
                        >
                          <Trash2 size={13} strokeWidth={2.5} />
                        </button>

                        {/* Status Chip */}
                        <div className="absolute top-3 right-3 z-20">
                          <div className={cn(
                            "flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-xl border text-[9px] font-black uppercase tracking-wider",
                            item.status === 'completed' 
                              ? "border-emerald-500/40 text-emerald-400" 
                              : "border-amber-500/40 text-amber-400"
                          )}>
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              item.status === 'completed' ? "bg-emerald-400" : "bg-amber-400 animate-spin"
                            )} />
                            <span>{item.status === 'completed' ? 'Done' : 'Working'}</span>
                          </div>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                      </div>

                      {/* File Details */}
                      <div className="p-3.5 sm:p-4 space-y-2">
                        <p className="text-white font-black text-sm break-words line-clamp-1 uppercase italic tracking-tight group-hover:text-cyan-300 transition-colors" title={item.originalName}>
                          {item.originalName}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate">
                            {toolInfo.name}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-500 shrink-0">
                            <History size={11} className="shrink-0 text-zinc-600" />
                            <span>{formatTimeAgo(item.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-3.5 pt-0 flex flex-col gap-2 w-full">
                      <Link 
                        href={toolInfo.href}
                        className="group/btn flex w-full min-h-[2.4rem] items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/40 hover:bg-cyan-500/10 text-zinc-300 hover:text-white font-bold text-xs transition-all active:scale-95 text-center"
                      >
                        <RefreshCw size={12} className="group-hover/btn:rotate-180 transition-transform duration-700 text-cyan-400 shrink-0" />
                        <span>Open in Tool / Retry</span>
                      </Link>

                      {downloadableUrl ? (
                        <a
                          href={downloadableUrl}
                          download={item.originalName}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full min-h-[2.5rem] items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-600 to-indigo-600 hover:from-cyan-400 hover:via-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.35)] transition-all active:scale-95"
                        >
                          <Download size={13} className="shrink-0" />
                          <span>Save Result</span>
                        </a>
                      ) : (
                        <div className="flex w-full min-h-[2.5rem] items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white/[0.03] border border-white/5 text-zinc-500 font-bold text-xs uppercase tracking-wider">
                          <FileText size={13} className="shrink-0 text-zinc-600" />
                          <span>Processed</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          )}
        </div>
      </div>
    </section>
  );
}
