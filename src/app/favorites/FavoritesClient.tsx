"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Star, Compass, ArrowRight, UserCircle2, Sparkles } from "lucide-react";
import { ALL_TOOLS, TOOLS, type Tool } from "@/data/tools";
import { ToolCard } from "@/components/ui/ToolCard";
import { FavoritesMigration } from "@/components/ui/FavoritesMigration";
import { FAVORITES_CHANGED_EVENT } from "@/lib/favorites";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";
import { cn } from "@/lib/utils";

interface FavoritesClientProps {
  initialServerFavorites: string[];
  isAuthenticated: boolean;
}

const CATEGORY_NAMES: Record<string, string> = {
  image: "Image Tool",
  video: "Video Tool",
  audio: "Audio Tool",
  pdf: "PDF Tool",
  ai: "AI Tool",
  productivity: "Productivity",
  business: "Business",
  seo: "SEO Tool",
  developer: "Developer",
  student: "Study Tool",
  creator: "Creator Tool",
};

export function FavoritesClient({
  initialServerFavorites,
  isAuthenticated,
}: FavoritesClientProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(initialServerFavorites);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (isAuthenticated) {
      setFavoriteIds(initialServerFavorites);
    } else if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("exismic_guest_favorites") || "[]";
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setFavoriteIds(parsed);
        }
      } catch {
        setFavoriteIds([]);
      }
    }
  }, [initialServerFavorites, isAuthenticated]);

  // Subscribe to real-time favorite changes across cards, tabs, and workspace headers
  useEffect(() => {
    const handleFavoritesChanged = (event: Event) => {
      const updated = (event as CustomEvent<{ favorites?: string[] }>).detail?.favorites;
      if (Array.isArray(updated)) {
        setFavoriteIds(updated);
      }
    };

    window.addEventListener(FAVORITES_CHANGED_EVENT, handleFavoritesChanged);
    return () => window.removeEventListener(FAVORITES_CHANGED_EVENT, handleFavoritesChanged);
  }, []);

  const favoritedTools = useMemo(() => {
    const pool = ALL_TOOLS || TOOLS;
    return pool.filter((tool) => favoriteIds.includes(tool.id));
  }, [favoriteIds]);

  const recommendedTools = useMemo(() => {
    return TOOLS.filter((t) => !favoriteIds.includes(t.id)).slice(0, 4);
  }, [favoriteIds]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 sm:space-y-10 pb-28 md:pb-32 overflow-x-hidden relative">
      {/* High-End Ambient Lighting Architecture */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[5%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 via-orange-500/5 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-bl from-cyan-500/10 via-blue-500/5 to-transparent blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.025]" />
      </div>

      <PageBreadcrumb items={[{ label: "Favorite Tools" }]} />
      <FavoritesMigration />

      {/* Guest Notice Banner if browsing locally without an account */}
      {!isAuthenticated && mounted && favoritedTools.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-950/20 to-transparent p-4 sm:p-5 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-[0_10px_30px_rgba(245,158,11,0.1)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Star size={18} className="fill-amber-400 text-amber-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black text-amber-200">
                Viewing Local Device Favorites
              </p>
              <p className="text-[11px] font-medium text-zinc-400">
                Your saved tools are stored on this browser. Log in or create a free account to sync them across all your devices.
              </p>
            </div>
          </div>
          <Link
            href="/auth/login"
            className="self-start sm:self-auto shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-black transition-all hover:brightness-110 active:scale-95 shadow-md"
          >
            <span>Log In to Sync</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Header Section */}
      <div className="relative space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            {/* Signature Rotating Conic Aura Orb */}
            <div className="relative h-14 w-14 rounded-2xl flex items-center justify-center overflow-hidden bg-[#090a14] border border-amber-400/30 shadow-[0_0_30px_rgba(245,158,11,0.25)] shrink-0 group">
              <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] opacity-75 pointer-events-none bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.7)_25%,transparent_50%)]" />
              <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] bg-[#090a14] z-0" />
              <Star size={24} className="relative z-10 text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic break-words">
                  Your Favorites
                </h1>
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-sm">
                  {favoritedTools.length} {favoritedTools.length === 1 ? "Tool" : "Tools"} Saved
                </span>
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Quick access to your saved creative and studio tools
              </p>
            </div>
          </div>

          {favoritedTools.length > 0 && (
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/40 text-xs font-bold text-zinc-300 hover:text-white transition-all duration-300 group"
            >
              <span>Explore All Tools</span>
              <ArrowRight size={13} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </div>

      {favoritedTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {favoritedTools.map((tool, idx) => (
            <ToolCard 
              key={tool.id} 
              {...tool} 
              index={idx} 
              initialFavorited={true}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 sm:py-28 md:py-32 px-6 flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 rounded-[2.5rem] border-2 border-white/[0.08] bg-gradient-to-b from-[#0f111e]/90 via-[#0a0a14]/85 to-[#06060c]/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="relative h-20 w-20 rounded-3xl flex items-center justify-center overflow-hidden bg-[#090a14] border border-amber-400/30 shadow-[0_0_35px_rgba(245,158,11,0.2)]">
            <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] opacity-60 pointer-events-none bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.8)_25%,transparent_50%)]" />
            <div className="absolute inset-[1.5px] rounded-[calc(1.5rem-1.5px)] bg-[#090a14] z-0" />
            <Star size={36} className="relative z-10 text-amber-400 fill-amber-400/20" />
          </div>

          <div className="space-y-2 max-w-md relative z-10">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">
              No favorites saved yet
            </h2>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Click the star icon on any tool card in Exismic Studio to add it here for instant, 1-click access.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
            <Link 
              href="/tools" 
              className="group inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>Explore All Studio Tools</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            {!isAuthenticated && (
              <Link 
                href="/auth/login" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-wider transition-all"
              >
                <UserCircle2 size={15} />
                <span>Log In</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Suggested / Discover More Section */}
      {recommendedTools.length > 0 && (
        <div className="space-y-6 sm:space-y-8 pt-8">
          {/* Laser Horizon Bridge */}
          <div className="relative my-4">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent shadow-[0_0_25px_rgba(245,158,11,0.6)]" />
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-xl flex items-center justify-center overflow-hidden bg-[#090a14] border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.2)] shrink-0">
                <div className="absolute inset-[-100%] animate-[spin_6s_linear_infinite] opacity-50 pointer-events-none bg-[conic-gradient(from_0deg,transparent_0%,rgba(6,182,212,0.6)_25%,transparent_50%)]" />
                <div className="absolute inset-[1.5px] rounded-[calc(0.75rem-1.5px)] bg-[#090a14] z-0" />
                <Compass size={18} className="relative z-10 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase italic">
                  Discover More Tools
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Recommended engines to expand your creative workflow
                </p>
              </div>
            </div>

            <Link
              href="/tools"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors group"
            >
              <span>View Full Catalog</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {recommendedTools.map((tool) => (
              <Link 
                key={tool.id} 
                href={tool.href} 
                className="group relative overflow-hidden rounded-[1.75rem] border-2 border-white/[0.08] bg-gradient-to-b from-[#0f111e]/90 via-[#0a0a14]/85 to-[#06060c]/90 p-5 sm:p-6 backdrop-blur-2xl shadow-lg hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300 flex flex-col justify-between"
              >
                {/* Micro Dot Matrix Watermark */}
                <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none" />
                
                {/* Diagonal Shine Sweep on Hover */}
                <div className="absolute inset-0 -translate-x-full bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.06),transparent)] skew-x-[-30deg] transition-transform duration-700 group-hover:translate-x-full pointer-events-none" />

                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border border-white/10 bg-white/[0.03] text-zinc-400 group-hover:border-cyan-400/30 group-hover:text-cyan-300 transition-colors">
                      {CATEGORY_NAMES[tool.category] || "Studio Tool"}
                    </span>
                    <ArrowRight size={13} className="text-zinc-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white group-hover:text-cyan-100 transition-colors tracking-tight line-clamp-1">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-zinc-400 font-medium line-clamp-2 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] mt-4 flex items-center justify-between text-[11px] font-bold text-zinc-500 group-hover:text-cyan-300 transition-colors relative z-10">
                  <span>Launch Tool</span>
                  <span className="text-[10px] text-zinc-600 group-hover:text-cyan-400">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
