"use client";

import { useState, useRef, useEffect, useMemo, useId } from "react";
import type { Session } from "@supabase/supabase-js";
import { Bell, Trash2, Clock, Sparkles, Zap, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: string;
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);
  const instanceId = useId().replace(/:/g, "");

  const hasUnread = notifications.some(n => !n.read);

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
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('Notification')
        .select('*')
        .eq('userId', session.user.id)
        .order('createdAt', { ascending: false })
        .limit(10);

      if (!error && data) {
        setNotifications(data);
      }
    };

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
  }, [instanceId, session, supabase]);

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
    const { error } = await supabase
      .from('Notification')
      .update({ read: true })
      .eq('id', id);
    
    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const markAllRead = async () => {
    if (!session?.user?.id) return;
    const { error } = await supabase
      .from('Notification')
      .update({ read: true })
      .eq('userId', session.user.id)
      .eq('read', false);
    
    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const clearAll = async () => {
    if (!session?.user?.id) return;
    const { error } = await supabase
      .from('Notification')
      .delete()
      .eq('userId', session.user.id);
    
    if (!error) {
      setNotifications([]);
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={hasUnread ? "Open notifications, unread items available" : "Open notifications"}
        className={cn(
          "group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border backdrop-blur-2xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40 active:scale-95",
          isOpen
            ? "border-cyan-300/25 bg-cyan-300/[0.08] text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.11),inset_0_1px_0_rgba(255,255,255,0.08)]"
            : "border-white/[0.09] bg-[#08080d]/84 text-zinc-400 shadow-[0_16px_45px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.055)] hover:border-purple-300/20 hover:bg-[#0a0a11] hover:text-white"
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(168,85,247,0.16),transparent_45%),radial-gradient(circle_at_80%_85%,rgba(34,211,238,0.1),transparent_42%)]"
        />
        <Bell size={17} strokeWidth={2.2} className={cn("relative z-10 transition-transform duration-300", !isOpen && "group-hover:-rotate-12")} />
        
        {hasUnread && (
          <>
            <span className="absolute right-2.5 top-2.5 z-10 h-2 w-2 rounded-full border-2 border-[#08080d] bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.9)]" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 animate-ping rounded-full bg-cyan-300 opacity-60" />
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute right-0 top-full z-50 mt-3 w-[min(24rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0e]/95 shadow-3xl backdrop-blur-2xl sm:rounded-3xl"
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
            <div className="max-h-[min(400px,calc(100dvh-10rem))] overflow-y-auto no-scrollbar py-2">
              {!session ? (
                <div className="p-12 text-center text-zinc-500 text-xs font-medium uppercase tracking-widest">
                  Sign in to see notifications
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((n) => (
                  <div 
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={cn(
                      "p-4 mx-2 rounded-2xl transition-all flex gap-4 cursor-pointer relative group/item",
                      !n.read ? "bg-white/[0.03] hover:bg-white/[0.05]" : "opacity-60 hover:opacity-100 hover:bg-white/[0.02]"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      n.type === 'success' ? "bg-emerald-500/10 text-emerald-500" : 
                      n.type === 'warning' ? "bg-red-500/10 text-red-500" : "bg-accent-blue/10 text-accent-blue"
                    )}>
                       {n.type === 'success' ? <Zap size={18} /> : 
                        n.type === 'warning' ? <AlertCircle size={18} /> : <Clock size={18} />}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                       <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white tracking-tight">{n.title}</p>
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1">
                             {formatTime(n.createdAt)}
                          </span>
                       </div>
                       <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">{n.message}</p>
                    </div>

                    {!n.read && (
                      <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-accent-blue rounded-full" />
                    )}
                  </div>
                ))
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
        )}
      </AnimatePresence>
    </div>
  );
}
