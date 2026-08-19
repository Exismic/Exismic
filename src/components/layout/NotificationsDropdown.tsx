"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useMemo, useId, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { Bell, Trash2, Clock, Sparkles, Zap, AlertCircle, Loader2, Gift, ArrowRight, Coins, ShoppingBag } from "lucide-react";
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

export function NotificationsDropdown() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [isDailyClaimAvailable, setIsDailyClaimAvailable] = useState(true);
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
  const unreadCount = notifications.filter(n => !n.read).length + (isBonusUnclaimed ? 1 : 0);
  const hasUnread = unreadCount > 0;

  // Fetch Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Notification',
          filter: `userId=eq.${session.user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 10));
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
    try {
      const response = await fetch("/api/user/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-read", id }),
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.warn("Failed to mark notification as read:", err);
    }
  };

  const markAllRead = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch("/api/user/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-all-read" }),
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.warn("Failed to mark all notifications as read:", err);
    }
  };

  const clearAll = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch("/api/user/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear-all" }),
      });
      if (response.ok) {
        setNotifications([]);
      }
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
    return then.toLocaleDateString();
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
        aria-label={hasUnread ? "Open notifications, unread items available" : "Open notifications"}
        className={cn(
          "group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40 active:scale-95",
          isOpen
            ? "border-cyan-300/40 bg-cyan-300/[0.12] text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.25)]"
            : "border-white/[0.12] bg-[#06070e]/92 text-zinc-300 shadow-[0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur-2xl hover:border-cyan-300/40 hover:bg-[#0a0c16] hover:text-white hover:shadow-[0_0_20px_rgba(34,211,238,0.18)]"
        )}
      >
        {/* Inner background radial glow clipped within border */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.2),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(34,211,238,0.15),transparent_45%)]"
        />

        <Bell 
          size={18} 
          strokeWidth={2.2} 
          className={cn(
            "relative z-10 transition-transform duration-300",
            isOpen ? "text-cyan-200" : "text-zinc-300 group-hover:rotate-12 group-hover:text-cyan-200"
          )} 
        />
        
        {/* Floating Unread Count Badge */}
        {unreadCount > 0 && (
          <div className="absolute -right-1.5 -top-1.5 z-30 flex items-center justify-center">
            <span className="absolute -inset-0.5 rounded-full bg-rose-500 blur-[2px] opacity-75 animate-pulse" />
            <span className="relative flex h-5 min-w-[20px] items-center justify-center rounded-full border border-rose-300/40 bg-rose-500 px-1.5 text-[9.5px] font-black text-white shadow-[0_0_12px_rgba(244,63,94,0.8)]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close notifications"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 top-20 z-[150] cursor-default bg-black/70 backdrop-blur-[3px] md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="fixed inset-x-2 top-[4.75rem] isolate z-[160] overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0e] shadow-3xl sm:rounded-3xl md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-3 md:w-[min(24rem,calc(100vw-1rem))] md:bg-[#0c0c0e]/95 md:backdrop-blur-2xl"
            >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-white/5 bg-white/[0.02] p-4 sm:p-5">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center text-accent-blue">
                     <Sparkles size={16} />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Notifications</h3>
               </div>
               {notifications.length > 0 && (
                 <button 
                  onClick={markAllRead}
                  className="shrink-0 text-[9px] font-black uppercase tracking-wider text-zinc-500 transition-colors hover:text-white sm:text-[10px] sm:tracking-widest"
                 >
                   Mark all as read
                 </button>
               )}
            </div>

            {/* List */}
            <div className="max-h-[min(420px,calc(100dvh-10rem))] overflow-y-auto no-scrollbar py-2">
              {isBonusUnclaimed && (
                <Link
                  href="/shop"
                  onClick={() => setIsOpen(false)}
                  className="mx-2 mb-3 flex items-center justify-between gap-3 rounded-2xl border border-amber-400/30 bg-[linear-gradient(135deg,rgba(245,158,11,0.14),rgba(168,85,247,0.12))] p-3.5 shadow-[0_0_20px_rgba(245,158,11,0.18)] transition-all hover:scale-[1.02] hover:border-amber-400/70 group/daily-banner"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/20 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                      <Gift size={18} className="animate-bounce" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black uppercase tracking-wider text-amber-200">Daily Bonus Ready!</p>
                        <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[8px] font-black text-amber-300 border border-amber-400/40">CLAIM</span>
                      </div>
                      <p className="text-[10px] font-medium text-zinc-400">Tap to open your daily shop vault reward</p>
                    </div>
                  </div>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-black shadow-md transition-transform group-hover/daily-banner:translate-x-0.5">
                    <ArrowRight size={14} />
                  </div>
                </Link>
              )}
              {!session ? (
                <div className="p-12 text-center text-zinc-500 text-xs font-medium uppercase tracking-widest">
                  Sign in to see notifications
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((n) => {
                  const isGiveaway = n.title.toLowerCase().includes("giveaway") || n.message.toLowerCase().includes("giveaway");

                  return (
                    <div 
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        if (isGiveaway) {
                          setIsOpen(false);
                          router.push("/giveaway");
                        }
                      }}
                      className={cn(
                        "p-4 mx-2 rounded-2xl transition-all flex gap-4 cursor-pointer relative group/item",
                        isGiveaway
                          ? "bg-amber-500/[0.06] hover:bg-amber-500/10 border border-amber-400/20"
                          : !n.read
                          ? "bg-white/[0.03] hover:bg-white/[0.05]"
                          : "opacity-60 hover:opacity-100 hover:bg-white/[0.02]"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        isGiveaway ? "bg-amber-400/20 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]" :
                        n.type === 'success' ? "bg-emerald-500/10 text-emerald-500" : 
                        n.type === 'warning' ? "bg-red-500/10 text-red-500" : "bg-accent-blue/10 text-accent-blue"
                      )}>
                         {isGiveaway ? <Gift size={18} /> :
                          n.type === 'success' ? <Zap size={18} /> : 
                          n.type === 'warning' ? <AlertCircle size={18} /> : <Clock size={18} />}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                         <div className="flex items-center justify-between">
                            <p className={cn("text-xs font-bold tracking-tight", isGiveaway ? "text-amber-200" : "text-white")}>{n.title}</p>
                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1">
                               {formatTime(n.createdAt)}
                            </span>
                         </div>
                         <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">{n.message}</p>
                         {isGiveaway && (
                           <div className="mt-2 inline-flex items-center gap-1 rounded-lg bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-[9px] font-black text-amber-300">
                             <span>View Giveaway Details</span>
                             <ArrowRight size={10} />
                           </div>
                         )}
                       {n.type.startsWith("claim:") && (
                          <button
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
                            className="mt-2 w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1"
                          >
                            {claimingId === n.id ? (
                              <>
                                <Loader2 size={10} className="animate-spin" /> Claiming...
                              </>
                            ) : (
                              "Claim Reward"
                            )}
                          </button>
                        )}
                    </div>

                    {!n.read && (
                      <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-accent-blue rounded-full" />
                    )}
                  </div>
                  );
                })
              ) : (
                <div className="p-12 text-center space-y-4">
                   <div className="w-16 h-16 rounded-[2rem] bg-white/5 flex items-center justify-center mx-auto text-zinc-700">
                      <Bell size={32} />
                   </div>
                   <div className="space-y-1">
                      <p className="text-sm font-bold text-zinc-400">All caught up!</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">No new notifications.</p>
                   </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-white/5 flex justify-center bg-white/[0.02]">
                 <button 
                  onClick={clearAll}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-400 transition-colors"
                 >
                   <Trash2 size={12} />
                   Clear all
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
