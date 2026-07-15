"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, X, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: any;
}

interface AnnouncementBannerProps {
  announcements: Announcement[];
}

export function AnnouncementBanner({ announcements }: AnnouncementBannerProps) {
  const [visibleAnnouncements, setVisibleAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    // Filter out dismissed announcements using localStorage
    const filtered = announcements.filter(
      (a) => !localStorage.getItem(`dismissed-announcement-${a.id}`)
    );
    setVisibleAnnouncements(filtered);
  }, [announcements]);

  const handleDismiss = (id: string) => {
    localStorage.setItem(`dismissed-announcement-${id}`, "true");
    setVisibleAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[80] w-[calc(100%_-2rem)] max-w-4xl space-y-3 pointer-events-none">
      <AnimatePresence>
        {visibleAnnouncements.map((announcement) => {
          let typeColor = "border-purple-500/20 bg-[#0c0813]/90 text-purple-200 shadow-purple-500/5";
          let typeIcon = <Info size={16} className="text-purple-400" />;

          if (announcement.type === "warning") {
            typeColor = "border-amber-500/20 bg-[#140e07]/90 text-amber-200 shadow-amber-500/5";
            typeIcon = <AlertTriangle size={16} className="text-amber-400" />;
          } else if (announcement.type === "success") {
            typeColor = "border-emerald-500/20 bg-[#07130f]/90 text-emerald-200 shadow-emerald-500/5";
            typeIcon = <CheckCircle2 size={16} className="text-emerald-400" />;
          }

          return (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="pointer-events-auto"
            >
              <div
                className={cn(
                  "relative flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300",
                  typeColor
                )}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 shadow-inner">
                    {typeIcon}
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] leading-none opacity-80">
                      {announcement.title}
                    </h5>
                    <p className="text-xs font-semibold leading-relaxed text-zinc-300">
                      {announcement.content}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDismiss(announcement.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
                  aria-label="Dismiss banner"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
