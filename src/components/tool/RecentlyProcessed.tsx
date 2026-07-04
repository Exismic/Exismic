"use client";

import React, { useEffect, useState } from "react";
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
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { TOOLS } from "@/data/tools";
import { isDownloadableResultUrl, normalizeHistoryToolType, type ResultFileType } from "@/lib/results";
import { Skeleton, SkeletonLine } from "@/components/ui/Skeleton";

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
  if (type.includes('image')) return <ImageIcon className="w-10 h-10 text-accent-purple" />;
  if (type.includes('audio')) return <AudioWaveform className="w-10 h-10 text-accent-cyan" />;
  if (type.includes('video')) return <Video className="w-10 h-10 text-accent-blue" />;
  if (type.includes('pdf')) return <FileText className="w-10 h-10 text-emerald-500" />;
  return <Sparkles className="w-10 h-10 text-white" />;
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
  const rawPreferences = window.localStorage.getItem("lumora:user-preferences");
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
  const supabase = createClient();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(`/api/files/history?limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setItems(data);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };

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
    window.addEventListener("lumora-preferences-updated", handlePreferencesUpdate);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
      window.removeEventListener("lumora-preferences-updated", handlePreferencesUpdate);
    };
  }, [limit, supabase]);

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

  const getToolInfo = (toolId: string) => {
    const normalizedToolId = normalizeHistoryToolType(toolId);
    const tool = TOOLS.find(t => t.id === normalizedToolId);
    return {
      name: tool?.name || "AI Tool",
      href: tool?.href || "/tools"
    };
  };

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

        <div className="flex flex-col gap-5 md:flex-row md:gap-8">
          {Array.from({ length: fullPage ? 6 : 3 }).map((_, index) => (
            <div
              key={index}
              className="w-full rounded-[1.75rem] border border-white/5 bg-white/[0.025] p-2 md:w-[340px] md:rounded-[2.5rem]"
            >
              <Skeleton className="aspect-[16/10] rounded-[1.35rem] md:rounded-[2rem]" />
              <div className="p-4 sm:p-5 md:p-6">
                <SkeletonLine className="h-4 w-4/5" />
                <SkeletonLine className="mt-3 w-1/2" />
                <div className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                  <Skeleton className="h-12 rounded-2xl" />
                  <Skeleton className="h-12 rounded-2xl" />
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
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 glass-dark p-6 sm:p-10 md:p-16 rounded-[2rem] md:rounded-[3rem] border border-white/5">
          <div className="w-[4.5rem] h-[4.5rem] sm:w-24 sm:h-24 rounded-full bg-zinc-900 flex items-center justify-center mx-auto text-zinc-700">
             <History size={40} />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter">Nothing here yet</h3>
            <p className="text-zinc-500 font-medium max-w-sm mx-auto">Try a tool to see your work here. It only takes a second.</p>
          </div>
          <Link 
            href="/tools" 
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl premium-gradient text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
          >
            Start now <Sparkles size={16} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="px-0 sm:px-4 space-y-8 md:space-y-12 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 md:gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue shadow-3xl border border-accent-blue/10">
              <History size={24} />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
                {fullPage ? "All saved results" : "Your recent work"}
              </h2>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                {fullPage ? "A unified archive of processed outputs" : "Everything you made recently"}
                {preferences.autoRefreshHistory && <span className="ml-2 text-cyan-300/70">• Live</span>}
              </p>
            </div>
          </div>
        </div>
        
        {!fullPage && (
        <Link 
          href="/history" 
          className="group flex min-h-11 w-fit items-center gap-3 px-5 sm:px-6 py-3 rounded-full glass-dark border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white/10 transition-all"
        >
          See all
          <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </Link>
        )}
      </div>

      <div className="relative group/container">
        <div className="md:overflow-x-auto pb-8 md:pb-12 -mx-1 sm:-mx-4 px-1 sm:px-4 custom-scrollbar scroll-smooth no-scrollbar md:scrollbar-visible">
          <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-stretch md:min-w-max">
            <AnimatePresence mode="popLayout">
              {items.map((item, i) => {
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
                    initial={{ opacity: 0, scale: 0.9, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: i * 0.1,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ y: -6 }}
                    className="w-full md:w-[340px] p-1.5 sm:p-2 rounded-[1.75rem] md:rounded-[2.5rem] glass-dark border border-white/5 group hover:border-white/20 hover:shadow-[0_20px_50px_rgba(168,85,247,0.15)] transition-all duration-500 relative touch-manipulation"
                  >
                    <div className="absolute inset-0 rounded-[1.75rem] md:rounded-[2.5rem] bg-gradient-to-br from-accent-purple/0 to-accent-blue/0 group-hover:from-accent-purple/5 group-hover:to-accent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    
                    <div className="relative aspect-[16/10] rounded-[1.35rem] md:rounded-[2rem] overflow-hidden bg-zinc-950/50 flex items-center justify-center transition-transform duration-700 group-hover:scale-[0.98]">
                      {(item.fileType === 'image' || item.resultUrl?.match(/\.(webp|jpg|jpeg|gif|png)/i)) && downloadableUrl ? (
                        <>
                          <img 
                            src={downloadableUrl}
                            alt={item.originalName} 
                            loading={preferences.highFidelityPreview ? "eager" : "lazy"}
                            decoding={preferences.highFidelityPreview ? "sync" : "async"}
                            fetchPriority={preferences.highFidelityPreview ? "high" : "auto"}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
                          />
                          {item.fileType === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                              <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                                <Play fill="currentColor" size={20} />
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity duration-700">
                          <FileIcon type={item.fileType} />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 group-hover:text-zinc-400">
                            {item.fileType.toUpperCase()} PREVIEW
                          </span>
                        </div>
                      )}

                      <div className="absolute top-4 right-4 z-20">
                        <div className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border",
                          item.status === 'completed' ? "border-emerald-500/30" : "border-amber-500/30"
                        )}>
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            item.status === 'completed' ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-spin"
                          )} />
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest leading-none",
                            item.status === 'completed' ? "text-emerald-500" : "text-amber-500"
                          )}>{item.status === 'completed' ? 'Done' : 'Working'}</span>
                        </div>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                    </div>

                    <div className="p-4 sm:p-5 md:p-6 space-y-5 md:space-y-6">
                      <div className="min-h-[3rem]">
                        <p className="text-white font-black text-sm break-words line-clamp-2 uppercase italic tracking-tight mb-1 group-hover:text-accent-purple transition-colors">
                          {item.originalName}
                        </p>
                        <div className="flex flex-col gap-1 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate">
                            {toolInfo.name}
                          </p>
                          <div className="flex items-center gap-1 text-[9px] font-medium text-zinc-600 uppercase tracking-tighter">
                            <History size={10} />
                            {formatTimeAgo(item.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 pt-2">
                         <Link 
                          href={toolInfo.href}
                          className="flex min-h-12 items-center justify-center gap-2 py-3.5 px-3 rounded-2xl bg-zinc-900/50 border border-white/5 text-zinc-400 font-black text-[10px] uppercase tracking-widest hover:bg-zinc-800 hover:text-white hover:border-white/10 transition-all active:scale-95"
                         >
                            <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
                            Do it again
                         </Link>
                         {downloadableUrl ? (
                           <a
                            href={downloadableUrl}
                            download={item.originalName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex min-h-12 items-center justify-center gap-2 py-3.5 px-3 rounded-2xl premium-gradient text-white font-black text-[10px] uppercase tracking-widest shadow-lg hover:shadow-accent-purple/20 transition-all active:scale-95"
                           >
                              <Download size={14} />
                              Save
                           </a>
                         ) : (
                           <div className="flex min-h-12 items-center justify-center gap-2 py-3.5 px-3 rounded-2xl bg-white/[0.03] border border-white/5 text-zinc-600 font-black text-[10px] uppercase tracking-widest">
                              <FileText size={14} />
                              Text saved
                           </div>
                         )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#030303] to-transparent pointer-events-none opacity-0 group-hover/container:opacity-100 transition-opacity" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#030303] to-transparent pointer-events-none opacity-0 group-hover/container:opacity-100 transition-opacity" />
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.4);
        }
      `}</style>
    </section>
  );
}
