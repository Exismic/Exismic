"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, X, AlertTriangle, CheckCircle2, Info, Sparkles, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Announcement {
  id?: string;
  title: string;
  content: string;
  type: string; // "info" | "warning" | "success"
  createdAt?: any;
}

export interface AnnouncementCardProps {
  announcement: Announcement;
  onDismiss?: () => void;
  isPreview?: boolean;
  className?: string;
}

export function AnnouncementCard({
  announcement,
  onDismiss,
  isPreview = false,
  className,
}: AnnouncementCardProps) {
  const type = announcement.type || "info";

  let colorConfig = {
    cardBg: "bg-[#0b0817]/95 border-purple-500/30 text-purple-100 shadow-[0_10px_35px_rgba(147,51,234,0.25)]",
    topLine: "from-purple-500/0 via-purple-400/80 to-purple-500/0",
    badgeBg: "bg-purple-500/20 border-purple-400/40 text-purple-300",
    tagPill: "bg-purple-500/15 border-purple-400/30 text-purple-300",
    tagLabel: "ANNOUNCEMENT",
    icon: <Info size={15} className="text-purple-300 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" />,
    pulseDot: "bg-purple-400 shadow-[0_0_8px_#c084fc]",
  };

  if (type === "warning") {
    colorConfig = {
      cardBg: "bg-[#140c03]/95 border-amber-500/30 text-amber-100 shadow-[0_10px_35px_rgba(245,158,11,0.25)]",
      topLine: "from-amber-500/0 via-amber-400/80 to-amber-500/0",
      badgeBg: "bg-amber-500/20 border-amber-400/40 text-amber-300",
      tagPill: "bg-amber-500/15 border-amber-400/30 text-amber-300",
      tagLabel: "CRITICAL ALERT",
      icon: <AlertTriangle size={15} className="text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]" />,
      pulseDot: "bg-amber-400 shadow-[0_0_8px_#fcd34d]",
    };
  } else if (type === "success") {
    colorConfig = {
      cardBg: "bg-[#04120c]/95 border-emerald-500/30 text-emerald-100 shadow-[0_10px_35px_rgba(16,185,129,0.25)]",
      topLine: "from-emerald-500/0 via-emerald-400/80 to-emerald-500/0",
      badgeBg: "bg-emerald-500/20 border-emerald-400/40 text-emerald-300",
      tagPill: "bg-emerald-500/15 border-emerald-400/30 text-emerald-300",
      tagLabel: "SYSTEM UPDATE",
      icon: <CheckCircle2 size={15} className="text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.8)]" />,
      pulseDot: "bg-emerald-400 shadow-[0_0_8px_#6ee7b7]",
    };
  }

  return (
    <div
      className={cn(
        "relative group overflow-hidden rounded-2xl border backdrop-blur-2xl px-4 py-3 sm:px-5 sm:py-3.5 transition-all duration-300",
        colorConfig.cardBg,
        className
      )}
    >
      {/* Top Gradient Shimmer Line */}
      <div className={cn("absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r", colorConfig.topLine)} />

      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 rounded-full bg-white/[0.03] blur-xl pointer-events-none group-hover:bg-white/[0.06] transition-all" />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Glowing Icon Container */}
          <div className={cn(
            "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border backdrop-blur-md transition-transform duration-300 group-hover:scale-105",
            colorConfig.badgeBg
          )}>
            {colorConfig.icon}
            <span className={cn(
              "absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-black animate-pulse",
              colorConfig.pulseDot
            )} />
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.2 text-[8px] font-black uppercase tracking-[0.2em]",
                colorConfig.tagPill
              )}>
                <Sparkles size={8} className="animate-pulse" />
                {colorConfig.tagLabel}
              </span>
              {announcement.title && (
                <span className="text-xs font-black uppercase tracking-wider text-white truncate drop-shadow-sm">
                  {announcement.title}
                </span>
              )}
              {isPreview && (
                <span className="rounded bg-white/10 border border-white/15 px-1 py-0.2 text-[7px] font-bold text-zinc-300 uppercase tracking-widest">
                  Preview
                </span>
              )}
            </div>

            <p className="text-[11px] sm:text-xs font-medium leading-snug text-zinc-300/90 break-words line-clamp-2">
              {announcement.content || "Announcement text."}
            </p>
          </div>
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] border border-white/10 text-zinc-400 hover:text-white hover:bg-white/15 hover:border-white/25 active:scale-95 transition-all cursor-pointer"
            aria-label="Dismiss announcement"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

interface AnnouncementBannerProps {
  announcements: Announcement[];
}

export function AnnouncementBanner({ announcements }: AnnouncementBannerProps) {
  const [visibleAnnouncements, setVisibleAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    // Filter out dismissed announcements using localStorage
    const filtered = announcements.filter(
      (a) => a.id && !localStorage.getItem(`dismissed-announcement-${a.id}`)
    );
    setVisibleAnnouncements(filtered);
  }, [announcements]);

  const handleDismiss = (id?: string) => {
    if (!id) return;
    localStorage.setItem(`dismissed-announcement-${id}`, "true");
    setVisibleAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  if (visibleAnnouncements.length === 0) return null;

  return (
    <aside aria-label="System announcements" className="fixed top-20 right-4 sm:right-6 z-[80] w-[calc(100%_-2rem)] max-w-lg space-y-2 pointer-events-none">
      <AnimatePresence>
        {visibleAnnouncements.map((announcement) => (
          <motion.div
            key={announcement.id || announcement.title}
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="pointer-events-auto shadow-2xl"
          >
            <AnnouncementCard
              announcement={announcement}
              onDismiss={() => handleDismiss(announcement.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </aside>
  );
}
