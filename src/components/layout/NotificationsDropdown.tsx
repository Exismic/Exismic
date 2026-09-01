"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useMemo, useId, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { 
  Bell, 
  BellRing,
  Trash2, 
  Clock, 
  Coins, 
  Gift, 
  Trophy, 
  Crown, 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  Tag, 
  Check, 
  CheckCheck, 
  Loader2, 
  ArrowRight, 
  Inbox, 
  Flame,
  Sparkles,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useCredits } from "@/hooks/useCredits";

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: string;
}

// Clean leading emojis and symbols from raw titles (e.g., "🎁 Credits Credited" -> "Credits Credited")
function cleanNotificationTitle(title: string): string {
  if (!title) return "";
  return title.replace(/^[\p{Extended_Pictographic}\p{Emoji_Presentation}\u2600-\u2B55\uFE0F\s]+/gu, "").trim() || title;
}

interface NotificationCategoryConfig {
  icon: typeof Bell;
  categoryName: string;
  badgeClass: string;
  iconContainerClass: string;
  borderAccentClass: string;
  dotClass: string;
  isGiveaway: boolean;
  isClaimable: boolean;
  claimDetails?: {
    type: "credits" | "pro";
    amount: number;
  } | null;
}

function resolveNotificationMeta(n: Notification): NotificationCategoryConfig {
  const titleLower = (n.title || "").toLowerCase();
  const messageLower = (n.message || "").toLowerCase();
  const combined = `${titleLower} ${messageLower}`;

  // 1. Claimable Admin Gift / Reward
  if (n.type.startsWith("claim:")) {
    const parts = n.type.split(":");
    const rewardType = parts[1] === "pro" ? "pro" : "credits";
    const amount = parseInt(parts[2], 10) || 0;

    return {
      icon: Gift,
      categoryName: "Gift Reward",
      badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      iconContainerClass: "bg-gradient-to-br from-amber-500/20 via-amber-600/15 to-purple-500/20 text-amber-300 border-amber-400/40 shadow-[0_0_16px_rgba(245,158,11,0.25)]",
      borderAccentClass: "border-amber-400/30 bg-gradient-to-r from-amber-500/[0.06] via-transparent to-transparent",
      dotClass: "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]",
      isGiveaway: false,
      isClaimable: true,
      claimDetails: { type: rewardType, amount },
    };
  }

  // 2. Giveaway Contest / Winning
  if (combined.includes("giveaway") || combined.includes("prize") || combined.includes("raffle") || combined.includes("tournament")) {
    return {
      icon: Trophy,
      categoryName: "Giveaway",
      badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      iconContainerClass: "bg-gradient-to-br from-amber-400/20 via-orange-500/20 to-amber-600/20 text-amber-300 border-amber-400/40 shadow-[0_0_16px_rgba(245,158,11,0.3)]",
      borderAccentClass: "border-amber-400/35 bg-gradient-to-r from-amber-500/[0.08] via-orange-950/20 to-transparent",
      dotClass: "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]",
      isGiveaway: true,
      isClaimable: false,
    };
  }

  // 3. Credits / Currency / Admin Balances / Payments / Top-ups
  if (
    combined.includes("credit") ||
    combined.includes("balance") ||
    combined.includes("deposit") ||
    combined.includes("top up") ||
    combined.includes("top-up") ||
    combined.includes("payment") ||
    combined.includes("refund")
  ) {
    return {
      icon: Coins,
      categoryName: "Credits",
      badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      iconContainerClass: "bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-emerald-600/20 text-emerald-400 border-emerald-400/30 shadow-[0_0_14px_rgba(16,185,129,0.22)]",
      borderAccentClass: "border-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.04] via-transparent to-transparent",
      dotClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]",
      isGiveaway: false,
      isClaimable: false,
    };
  }

  // 4. Pro Tier / Membership / Subscription
  if (combined.includes("pro") || combined.includes("subscription") || combined.includes("membership") || combined.includes("upgrade")) {
    return {
      icon: Crown,
      categoryName: "Pro Access",
      badgeClass: "bg-purple-500/15 text-purple-300 border-purple-500/30",
      iconContainerClass: "bg-gradient-to-br from-purple-500/20 via-fuchsia-500/15 to-purple-600/20 text-purple-300 border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.25)]",
      borderAccentClass: "border-purple-500/25 bg-gradient-to-r from-purple-500/[0.05] via-transparent to-transparent",
      dotClass: "bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.9)]",
      isGiveaway: false,
      isClaimable: false,
    };
  }

  // 5. Account Security / Suspensions / Warnings / Moderation
  if (
    n.type === "warning" ||
    combined.includes("warning") ||
    combined.includes("suspend") ||
    combined.includes("violation") ||
    combined.includes("security") ||
    combined.includes("anomaly") ||
    combined.includes("blocked")
  ) {
    return {
      icon: ShieldAlert,
      categoryName: "Security",
      badgeClass: "bg-rose-500/15 text-rose-300 border-rose-500/30",
      iconContainerClass: "bg-gradient-to-br from-rose-500/20 via-red-600/15 to-rose-600/20 text-rose-400 border-rose-500/35 shadow-[0_0_15px_rgba(244,63,94,0.25)]",
      borderAccentClass: "border-rose-500/25 bg-gradient-to-r from-rose-500/[0.05] via-transparent to-transparent",
      dotClass: "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.9)]",
      isGiveaway: false,
      isClaimable: false,
    };
  }

  // 6. Account Re-activation / Verification
  if (combined.includes("re-activated") || combined.includes("verified") || combined.includes("restored")) {
    return {
      icon: ShieldCheck,
      categoryName: "Verified",
      badgeClass: "bg-teal-500/15 text-teal-300 border-teal-500/30",
      iconContainerClass: "bg-gradient-to-br from-teal-500/20 via-emerald-500/15 to-teal-600/20 text-teal-300 border-teal-400/30 shadow-[0_0_14px_rgba(20,184,166,0.22)]",
      borderAccentClass: "border-teal-500/20 bg-gradient-to-r from-teal-500/[0.04] via-transparent to-transparent",
      dotClass: "bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.9)]",
      isGiveaway: false,
      isClaimable: false,
    };
  }

  // 7. Referral System & Commissions
  if (combined.includes("referral") || combined.includes("referrer") || combined.includes("friend") || combined.includes("commission") || combined.includes("invite")) {
    return {
      icon: Users,
      categoryName: "Referral",
      badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
      iconContainerClass: "bg-gradient-to-br from-cyan-500/20 via-sky-500/15 to-cyan-600/20 text-cyan-300 border-cyan-400/30 shadow-[0_0_14px_rgba(34,211,238,0.22)]",
      borderAccentClass: "border-cyan-500/20 bg-gradient-to-r from-cyan-500/[0.04] via-transparent to-transparent",
      dotClass: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]",
      isGiveaway: false,
      isClaimable: false,
    };
  }

  // 8. Promo Codes & Discounts
  if (combined.includes("promo") || combined.includes("discount") || combined.includes("coupon") || combined.includes("retention") || combined.includes("voucher")) {
    return {
      icon: Tag,
      categoryName: "Promo",
      badgeClass: "bg-teal-500/15 text-teal-300 border-teal-500/30",
      iconContainerClass: "bg-gradient-to-br from-teal-500/20 via-emerald-500/15 to-teal-600/20 text-teal-300 border-teal-400/30 shadow-[0_0_14px_rgba(20,184,166,0.22)]",
      borderAccentClass: "border-teal-500/20 bg-gradient-to-r from-teal-500/[0.04] via-transparent to-transparent",
      dotClass: "bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.9)]",
      isGiveaway: false,
      isClaimable: false,
    };
  }

  // 9. Default System Notice
  return {
    icon: BellRing,
    categoryName: "System",
    badgeClass: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    iconContainerClass: "bg-gradient-to-br from-indigo-500/20 via-blue-500/15 to-indigo-600/20 text-indigo-300 border-indigo-400/30 shadow-[0_0_14px_rgba(99,102,241,0.2)]",
    borderAccentClass: "border-indigo-500/20 bg-gradient-to-r from-indigo-500/[0.04] via-transparent to-transparent",
    dotClass: "bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.9)]",
    isGiveaway: false,
    isClaimable: false,
  };
}

export function NotificationsDropdown() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [isDailyClaimAvailable, setIsDailyClaimAvailable] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);
  const instanceId = useId().replace(/:/g, "");
  const { todayClaim } = useCredits();

  useEffect(() => {
    try {
      const lastClaim = localStorage.getItem("exismic_vip_daily_claim");
      if (lastClaim) {
        const lastDate = new Date(lastClaim).toDateString();
        const todayDate = new Date().toDateString();
        if (lastDate === todayDate) {
          setIsDailyClaimAvailable(false);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const isBonusUnclaimed = Boolean(session && !todayClaim && isDailyClaimAvailable);
  const rawUnreadCount = notifications.filter(n => !n.read).length;
  const unreadCount = rawUnreadCount + (isBonusUnclaimed ? 1 : 0);
  const hasUnread = unreadCount > 0;

  // Filtered list
  const filteredNotifications = useMemo(() => {
    if (activeFilter === "unread") {
      return notifications.filter(n => !n.read);
    }
    return notifications;
  }, [notifications, activeFilter]);

  // Fetch Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: Session | null) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Fetch Initial Notifications & Subscribe to Changes
  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(`/api/user/notifications?t=${Date.now()}`, { cache: "no-store" });
      const json = await response.json();
      if (response.ok && json.success && json.data) {
        setNotifications(json.data);
      }
    } catch (err) {
      console.warn("Failed to fetch notifications:", err);
    }
  }, [session]);

  useEffect(() => {
    if (!session?.user?.id) return;

    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel(`user-notifications-${session.user.id}-${instanceId}`)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'Notification',
          filter: `userId=eq.${session.user.id}`,
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 15));
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => prev.map(n => n.id === payload.new.id ? (payload.new as Notification) : n));
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [instanceId, session, supabase, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await fetch("/api/user/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-read", id }),
      });
    } catch (err) {
      console.warn("Failed to mark notification as read:", err);
    }
  };

  const markAllRead = async () => {
    if (!session?.user?.id || rawUnreadCount === 0) return;
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch("/api/user/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-all-read" }),
      });
    } catch (err) {
      console.warn("Failed to mark all notifications as read:", err);
    }
  };

  const deleteNotification = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Optimistic UI removal
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await fetch("/api/user/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
    } catch (err) {
      console.warn("Failed to delete notification:", err);
    }
  };

  const clearAll = async () => {
    if (!session?.user?.id || notifications.length === 0) return;
    setNotifications([]);
    try {
      await fetch("/api/user/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear-all" }),
      });
    } catch (err) {
      console.warn("Failed to clear notifications:", err);
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const toggleDropdown = () => {
    const nextOpenStatus = !isOpen;
    setIsOpen(nextOpenStatus);
    if (nextOpenStatus && session?.user?.id) {
      fetchNotifications();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={hasUnread ? `Open notifications, ${unreadCount} unread items` : "Open notifications"}
        className={cn(
          "group/bell relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-2xl p-[1px] select-none isolate transition-all duration-500 hover:scale-[1.03] active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(168,85,247,0.12)] hover:shadow-[0_15px_40px_rgba(34,211,238,0.25),0_0_25px_rgba(168,85,247,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40"
        )}
      >
        {/* Radiant Cyber Halo Glow */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/35 via-indigo-500/30 to-cyan-500/35 transition-all duration-500",
            isOpen ? "opacity-100 blur-[6px]" : "opacity-60 blur-[4px] group-hover/bell:opacity-100 group-hover/bell:blur-[6px]"
          )}
        />

        {/* Metallic Gradient Outer Border Rim */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 rounded-2xl p-[1px] transition-all duration-300",
            isOpen
              ? "bg-gradient-to-r from-purple-400 via-cyan-300 to-indigo-300"
              : "bg-gradient-to-r from-purple-500/40 via-cyan-400/40 to-indigo-500/40 group-hover/bell:from-purple-400/90 group-hover/bell:via-cyan-300 group-hover/bell:to-indigo-400/90"
          )}
        />

        {/* Glassmorphic Cyber-Obsidian Core */}
        <div
          className={cn(
            "relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border backdrop-blur-2xl transition-all duration-300",
            isOpen
              ? "bg-gradient-to-r from-[#0d102b]/95 via-[#101638]/95 to-[#0e112d]/95 border-cyan-400/50"
              : "bg-gradient-to-r from-[#060814]/95 via-[#0b0e22]/95 to-[#070918]/95 border-purple-500/20 group-hover/bell:border-cyan-400/40"
          )}
        >
          {/* Ambient Radial Lighting */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.25),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(34,211,238,0.18),transparent_45%)]"
          />

          {/* Shimmer Light Sweep on Hover */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -left-12 w-8 skew-x-[-22deg] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-[1px] transition-transform duration-1000 group-hover/bell:translate-x-28"
          />

          <Bell 
            size={17} 
            strokeWidth={2.2} 
            className={cn(
              "relative z-10 transition-all duration-300",
              isOpen
                ? "text-cyan-200 drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]"
                : "text-zinc-300 group-hover/bell:rotate-12 group-hover/bell:text-cyan-200 group-hover/bell:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            )} 
          />
        </div>
        
        {/* Floating Unread Count Badge */}
        {unreadCount > 0 && (
          <div className="absolute -right-1.5 -top-1.5 z-30 flex items-center justify-center pointer-events-none">
            <span className="absolute -inset-0.5 rounded-full bg-rose-500 blur-[2px] opacity-80 animate-pulse" />
            <span className="relative flex h-5 min-w-[20px] items-center justify-center rounded-full border border-rose-300/40 bg-gradient-to-r from-rose-500 to-pink-500 px-1.5 text-[9.5px] font-black text-white shadow-[0_0_12px_rgba(244,63,94,0.8)]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.button
              type="button"
              aria-label="Close notifications"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 top-20 z-[150] cursor-default bg-black/80 backdrop-blur-[4px] md:hidden"
            />

            {/* Notification Card Popover */}
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-x-3 top-[4.75rem] isolate z-[250] flex max-h-[min(540px,calc(100dvh-6rem))] flex-col overflow-hidden rounded-3xl border border-white/[0.1] bg-[#090a12]/98 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(168,85,247,0.12)] backdrop-blur-2xl md:absolute md:inset-x-auto md:left-0 md:right-auto md:top-full md:mt-2.5 md:w-[min(26rem,calc(100vw-1.5rem))]"
            >
              {/* Header Container */}
              <div className="relative border-b border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
                {/* Header Ambient Glow */}
                <div 
                  aria-hidden="true" 
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" 
                />

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 via-indigo-500/15 to-transparent text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.25)]">
                      <BellRing size={16} strokeWidth={2.2} />
                      {rawUnreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)] animate-pulse" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black tracking-tight text-white">Notifications</h3>
                      {rawUnreadCount > 0 ? (
                        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-cyan-300">
                          {rawUnreadCount} New
                        </span>
                      ) : (
                        <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                          All Caught Up
                        </span>
                      )}
                    </div>
                  </div>

                  {rawUnreadCount > 0 && (
                    <button 
                      onClick={markAllRead}
                      className="group/read flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 transition-all hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200"
                    >
                      <CheckCheck size={12} className="text-zinc-500 transition-colors group-hover/read:text-cyan-300" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                {notifications.length > 0 && (
                  <div className="mt-3.5 flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-black/40 p-1">
                    <button
                      type="button"
                      onClick={() => setActiveFilter("all")}
                      className={cn(
                        "relative flex-1 rounded-lg py-1 text-center text-[10px] font-black uppercase tracking-wider transition-all",
                        activeFilter === "all"
                          ? "bg-white/[0.1] text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                          : "text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      All ({notifications.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFilter("unread")}
                      className={cn(
                        "relative flex-1 rounded-lg py-1 text-center text-[10px] font-black uppercase tracking-wider transition-all",
                        activeFilter === "unread"
                          ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                          : "text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      Unread {rawUnreadCount > 0 ? `(${rawUnreadCount})` : ""}
                    </button>
                  </div>
                )}
              </div>

              {/* Scrollable Notification List */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
                {/* Daily Bonus Vault Banner */}
                {isBonusUnclaimed && (
                  <Link
                    href="/shop"
                    onClick={() => setIsOpen(false)}
                    className="group/daily-banner relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/[0.16] via-amber-950/25 to-purple-950/20 p-3.5 shadow-[0_0_25px_rgba(245,158,11,0.18)] transition-all duration-300 hover:scale-[1.01] hover:border-amber-400/70"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/50 bg-amber-400/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                        <Gift size={20} className="animate-bounce" />
                        <Sparkles size={10} className="absolute -top-1 -right-1 text-amber-200 animate-spin" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black uppercase tracking-wider text-amber-200">Daily Bonus Ready!</p>
                          <span className="rounded-md bg-amber-400/25 px-1.5 py-0.5 text-[8px] font-black tracking-widest text-amber-300 border border-amber-400/40">
                            CLAIM
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-zinc-300/80">Tap to unlock your daily shop vault reward</p>
                      </div>
                    </div>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-transform duration-300 group-hover/daily-banner:translate-x-1">
                      <ArrowRight size={14} strokeWidth={2.5} />
                    </div>
                  </Link>
                )}

                {/* State: Not Signed In */}
                {!session ? (
                  <div className="p-10 text-center space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-zinc-500">
                      <Bell size={22} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                      Sign in to see notifications
                    </p>
                  </div>
                ) : filteredNotifications.length > 0 ? (
                  /* Notification Items */
                  filteredNotifications.map((n) => {
                    const meta = resolveNotificationMeta(n);
                    const IconComponent = meta.icon;
                    const cleanTitle = cleanNotificationTitle(n.title);

                    return (
                      <motion.div 
                        key={n.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => {
                          if (!n.read) markAsRead(n.id);
                          if (meta.isGiveaway) {
                            setIsOpen(false);
                            router.push("/giveaway");
                          }
                        }}
                        className={cn(
                          "group/item relative flex flex-col gap-2 rounded-2xl p-3.5 transition-all duration-200 cursor-pointer overflow-hidden border",
                          meta.isGiveaway 
                            ? meta.borderAccentClass
                            : !n.read
                            ? "bg-white/[0.045] hover:bg-white/[0.07] border-white/[0.1] shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                            : "bg-white/[0.015] hover:bg-white/[0.04] border-white/[0.04] opacity-75 hover:opacity-100"
                        )}
                      >
                        {/* Left Glow Accent for Unread */}
                        {!n.read && (
                          <div 
                            aria-hidden="true"
                            className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-400 via-purple-400 to-indigo-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                          />
                        )}

                        {/* Top Meta Bar */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={cn("rounded-md border px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider", meta.badgeClass)}>
                              {meta.categoryName}
                            </span>
                            {!n.read && (
                              <span className={cn("h-1.5 w-1.5 rounded-full", meta.dotClass)} />
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500">
                              <Clock size={10} className="text-zinc-600" />
                              {formatTime(n.createdAt)}
                            </span>

                            {/* Quick Action Buttons (Mark Read & Dismiss) */}
                            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/item:opacity-100">
                              {!n.read && (
                                <button
                                  type="button"
                                  title="Mark as read"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(n.id);
                                  }}
                                  className="flex h-5 w-5 items-center justify-center rounded-md border border-white/[0.1] bg-white/[0.05] text-zinc-400 hover:border-cyan-400/40 hover:bg-cyan-500/20 hover:text-cyan-200 transition-colors"
                                >
                                  <Check size={11} strokeWidth={2.5} />
                                </button>
                              )}
                              <button
                                type="button"
                                title="Dismiss notification"
                                onClick={(e) => deleteNotification(n.id, e)}
                                className="flex h-5 w-5 items-center justify-center rounded-md border border-white/[0.1] bg-white/[0.05] text-zinc-400 hover:border-rose-400/40 hover:bg-rose-500/20 hover:text-rose-200 transition-colors"
                              >
                                <Trash2 size={11} strokeWidth={2} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Main Body with Clean Icon & Content */}
                        <div className="flex items-start gap-3 pt-0.5">
                          <div className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border mt-0.5 transition-transform duration-300 group-hover/item:scale-105",
                            meta.iconContainerClass
                          )}>
                            <IconComponent size={17} strokeWidth={2.2} />
                          </div>
                          
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className={cn(
                              "text-xs font-bold leading-snug break-words tracking-tight",
                              meta.isGiveaway ? "text-amber-200" : "text-white"
                            )}>
                              {cleanTitle}
                            </p>

                            <p className="text-[11px] text-zinc-300/80 font-normal leading-relaxed break-words">
                              {n.message}
                            </p>
                          </div>
                        </div>

                        {/* Special Interactive Widget: Giveaway CTA */}
                        {meta.isGiveaway && (
                          <div className="mt-1 flex items-center justify-between rounded-xl border border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 p-2 px-3 shadow-[0_0_12px_rgba(245,158,11,0.15)] transition group-hover/item:border-amber-400/60">
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
                              <Flame size={12} className="text-amber-400" />
                              <span>Giveaway Dashboard</span>
                            </div>
                            <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-300">
                              <span>Open</span>
                              <ArrowRight size={10} className="transition-transform group-hover/item:translate-x-1" />
                            </div>
                          </div>
                        )}

                        {/* Special Interactive Widget: Claim Reward CTA */}
                        {meta.isClaimable && (
                          <div className="mt-1.5 rounded-xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 to-purple-500/10 p-2.5 space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-amber-200">
                              <span>Reward Available:</span>
                              <span className="rounded-md bg-amber-400/20 px-2 py-0.5 font-black text-amber-300 border border-amber-400/30">
                                {meta.claimDetails?.type === "credits"
                                  ? `+${meta.claimDetails.amount.toLocaleString()} Credits`
                                  : `${meta.claimDetails?.amount} Days Pro`}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                setClaimingId(n.id);
                                try {
                                  const response = await fetch("/api/user/notifications", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ action: "claim", id: n.id }),
                                  });
                                  const data = await response.json();
                                  if (response.ok && data.success) {
                                    setNotifications(prev => prev.filter(item => item.id !== n.id));
                                    window.location.reload();
                                  } else {
                                    alert(data.error || "Failed to claim reward.");
                                  }
                                } catch (err) {
                                  console.error(err);
                                } finally {
                                  setClaimingId(null);
                                }
                              }}
                              disabled={claimingId === n.id}
                              className="w-full py-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(52,211,153,0.3)] hover:shadow-[0_0_20px_rgba(52,211,153,0.5)] flex items-center justify-center gap-1.5 active:scale-[0.98]"
                            >
                              {claimingId === n.id ? (
                                <>
                                  <Loader2 size={12} className="animate-spin" /> Claiming...
                                </>
                              ) : (
                                <>
                                  <Gift size={12} /> Claim Reward Now
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                ) : (
                  /* Empty State */
                  <div className="py-12 px-6 text-center space-y-3.5">
                    <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] text-zinc-500 shadow-inner">
                      <Inbox size={26} strokeWidth={1.8} className="text-zinc-600" />
                      <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1),transparent_70%)]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-zinc-300">
                        {activeFilter === "unread" ? "No unread notifications" : "All caught up!"}
                      </p>
                      <p className="text-[10px] font-medium text-zinc-500">
                        {activeFilter === "unread" 
                          ? "You've read all your latest notifications." 
                          : "New notifications and rewards will appear here."}
                      </p>
                    </div>
                    {activeFilter === "unread" && notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveFilter("all")}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-cyan-300 hover:bg-white/[0.08] transition-colors"
                      >
                        View all ({notifications.length})
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Bar */}
              {notifications.length > 0 && (
                <div className="flex items-center justify-between border-t border-white/[0.08] bg-white/[0.02] p-3 px-4">
                  <span className="text-[10px] font-bold text-zinc-500">
                    {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                  </span>

                  <button 
                    onClick={clearAll}
                    className="group/clear flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-500 transition-colors hover:text-rose-400"
                  >
                    <Trash2 size={11} className="transition-transform group-hover/clear:scale-110" />
                    <span>Clear all</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
