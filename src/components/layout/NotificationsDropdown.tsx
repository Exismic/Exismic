"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, Trash2, Clock, Sparkles, Wand2, Zap, AlertCircle, Loader2 } from "lucide-react";
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
  const [session, setSession] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

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
      .channel(`user-notifications-${session.user.id}`)
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
  }, [session, supabase]);

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
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2.5 rounded-xl transition-all relative group",
          isOpen ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
        )}
      >
        <Bell size={20} className={cn(isOpen ? "" : "group-hover:rotate-12 transition-transform")} />
        
        {hasUnread && (
          <>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent-blue rounded-full border-2 border-[#030303] z-10"></span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent-blue rounded-full blur-[2px] animate-ping opacity-75"></span>
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-[#0c0c0e]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-3xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center text-accent-blue">
                     <Sparkles size={16} />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Notifications</h3>
               </div>
               {notifications.length > 0 && (
                 <button 
                  onClick={markAllRead}
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                 >
                   Mark all as read
                 </button>
               )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto no-scrollbar py-2">
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
