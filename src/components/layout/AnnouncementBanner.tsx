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
    cardBg: "bg-gradient-to-r from-[#120824]/95 via-[#0e071c]/98 to-[#0b0517]/95 border-purple-500/30 text-purple-100 shadow-[0_12px_40px_rgba(147,51,234,0.18)]",
    topLine: "before:from-purple-500/0 before:via-purple-400/60 before:to-purple-500/0",
    badgeBg: "bg-purple-500/15 border-purple-400/30 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]",
    tagPill: "bg-purple-500/15 border-purple-400/30 text-purple-300",
    tagLabel: "SYSTEM ANNOUNCEMENT",
    icon: <Info size={16} className="text-purple-300 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" />,
    pulseDot: "bg-purple-400 shadow-[0_0_8px_#c084fc]",
  };

  if (type === "warning") {
    colorConfig = {
      cardBg: "bg-gradient-to-r from-[#211406]/95 via-[#180f04]/98 to-[#120a02]/95 border-amber-500/30 text-amber-100 shadow-[0_12px_40px_rgba(245,158,11,0.18)]",
      topLine: "before:from-amber-500/0 before:via-amber-400/60 before:to-amber-500/0",
      badgeBg: "bg-amber-500/15 border-amber-400/30 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
      tagPill: "bg-amber-500/15 border-amber-400/30 text-amber-300",
      tagLabel: "CRITICAL ALERT",
      icon: <AlertTriangle size={16} className="text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]" />,
      pulseDot: "bg-amber-400 shadow-[0_0_8px_#fcd34d]",
    };
  } else if (type === "success") {
    colorConfig = {
      cardBg: "bg-gradient-to-r from-[#062016]/95 via-[#041710]/98 to-[#02100a]/95 border-emerald-500/30 text-emerald-100 shadow-[0_12px_40px_rgba(16,185,129,0.18)]",
      topLine: "before:from-emerald-500/0 before:via-emerald-400/60 before:to-emerald-500/0",
      badgeBg: "bg-emerald-500/15 border-emerald-400/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
      tagPill: "bg-emerald-500/15 border-emerald-400/30 text-emerald-300",
      tagLabel: "SYSTEM NOTICE",
      icon: <CheckCircle2 size={16} className="text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.8)]" />,
      pulseDot: "bg-emerald-400 shadow-[0_0_8px_#6ee7b7]",
    };
  }

  return (
    <div
      className={cn(
        "relative group overflow-hidden rounded-2xl border backdrop-blur-2xl p-4 sm:p-5 transition-all duration-300",
        "before:absolute before:inset-x-0 before:top-0 before:h-[1.5px] before:bg-gradient-to-r",
        colorConfig.cardBg,
        colorConfig.topLine,
        className
      )}
    >
      {/* Background radial shimmer */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 rounded-full bg-white/[0.03] blur-2xl pointer-events-none group-hover:bg-white/[0.06] transition-all" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          {/* Glowing Animated Icon Container */}
          <div className={cn(
            "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border backdrop-blur-md transition-transform duration-300 group-hover:scale-105",
            colorConfig.badgeBg
          )}>
            {colorConfig.icon}
            {/* Live Indicator Dot */}
            <span className={cn(
              "absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full ring-2 ring-black animate-pulse",
              colorConfig.pulseDot
            )} />
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.25em]",
                colorConfig.tagPill
              )}>
                <Sparkles size={9} className="animate-pulse" />
                {colorConfig.tagLabel}
              </span>
              {isPreview && (
                <span className="rounded-md bg-white/10 border border-white/15 px-1.5 py-0.5 text-[8px] font-bold text-zinc-300 uppercase tracking-widest">
                  Live Preview Mode
                </span>
              )}
            </div>

            <h5 className="text-xs font-black uppercase tracking-[0.16em] text-white leading-tight break-words drop-shadow-sm">
              {announcement.title || "ANNOUNCEMENT TITLE PREVIEW"}
            </h5>

            <p className="text-xs font-medium leading-relaxed text-zinc-300/90 break-words">
              {announcement.content || "Your announcement body text will render here live as you type."}
            </p>
          </div>
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] border border-white/10 text-zinc-400 hover:text-white hover:bg-white/15 hover:border-white/25 active:scale-95 transition-all"
            aria-label="Dismiss banner"
          >
            <X size={13} />
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
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[80] w-[calc(100%_-2rem)] max-w-4xl space-y-3 pointer-events-none">
      <AnimatePresence>
        {visibleAnnouncements.map((announcement) => (
          <motion.div
            key={announcement.id || announcement.title}
            initial={{ opacity: 0, y: -25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto"
          >
            <AnnouncementCard
              announcement={announcement}
              onDismiss={() => handleDismiss(announcement.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
