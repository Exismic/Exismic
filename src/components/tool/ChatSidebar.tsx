"use client";

import { useChat } from "@/components/providers/ChatProvider";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  History, 
  Settings,
  X
} from "lucide-react";
import { UserProfile } from "../ui/UserProfile";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { usePro } from "@/hooks/usePro";
import { createClient } from "@/utils/supabase/client";
import type { Session as SupabaseSession } from "@supabase/supabase-js";

// Markdown Stripper Utility to ensure titles and subtitles are clean and elegant
const stripMarkdown = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, "") // HTML tags
    .replace(/```[\s\S]*?```/g, "") // Code blocks
    .replace(/`([^`]+)`/g, "$1") // Inline code
    .replace(/\*\*([^*]+)\*\*/g, "$1") // Bold
    .replace(/\*([^*]+)\*/g, "$1") // Italic
    .replace(/__([^_]+)__/g, "$1") // Bold
    .replace(/_([^_]+)_/g, "$1") // Italic
    .replace(/#+\s+(.*)/g, "$1") // Headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links
    .replace(/^\s*[-*+]\s+/gm, "") // Lists
    .replace(/^\s*\d+\.\s+/gm, "") // Numbered lists
    .replace(/^\s*>\s+/gm, "") // Blockquotes
    .replace(/[#*\_`\-\+\[\]\(\)]/g, "") // Special characters
    .replace(/\s+/g, " ") // Clean duplicate whitespace
    .trim();
};

const cleanTitleText = (title: string): string => {
  if (!title) return "Untitled Chat";
  const cleaned = stripMarkdown(title);
  return cleaned || "Untitled Chat";
};

const cleanSubtitleText = (text: string): string => {
  if (!text) return "No messages yet";
  const cleaned = stripMarkdown(text);
  if (cleaned.length > 70) {
    return cleaned.substring(0, 67) + "...";
  }
  return cleaned || "No messages yet";
};

import { LumoraLogo } from "@/components/ui/LumoraLogo";
export { LumoraLogo };

export function ChatSidebar() {
  const {
    sessionId,
    sessions,
    isSidebarOpen,
    setIsSidebarOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    startNewChat,
    loadSession,
    openDeleteModal,
    session,
    isPro,
    deleteModal,
    setDeleteModal,
    confirmDeleteSession
  } = useChat();

  const { user: dbUser } = usePro();
  const [supabaseSession, setSupabaseSession] = useState<SupabaseSession | null>(null);
  const [frameOverride, setFrameOverride] = useState<string | null>(null);
  const [gradientOverride, setGradientOverride] = useState<string | null>(null);
  const supabase = createClient();
  const localFrameId = frameOverride ?? supabaseSession?.user?.user_metadata?.avatar_frame ?? dbUser?.avatar_frame ?? null;
  const localGradientId = gradientOverride ?? supabaseSession?.user?.user_metadata?.name_gradient ?? dbUser?.name_gradient ?? null;

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSupabaseSession(session);
    }
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const handleFrameUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      setFrameOverride(customEvent.detail);
    };
    const handleGradientUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      setGradientOverride(customEvent.detail);
    };
    window.addEventListener('avatar-frame-updated', handleFrameUpdate);
    window.addEventListener('name-gradient-updated', handleGradientUpdate);
    return () => {
      window.removeEventListener('avatar-frame-updated', handleFrameUpdate);
      window.removeEventListener('name-gradient-updated', handleGradientUpdate);
    };
  }, []);

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return days === 1 ? 'Yesterday' : `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300 cursor-pointer"
        />
      )}
      
      <aside 
        className={cn(
          "chat-tool-sidebar h-full bg-[#08080c]/98 backdrop-blur-3xl border-r border-white/[0.04] flex flex-col shrink-0 transition-all duration-300 ease-in-out z-[210] overflow-hidden",
          isSidebarCollapsed ? "w-16" : "w-[calc(100vw-16px)] max-w-[304px] md:w-[304px]",
          "fixed md:relative inset-y-0 left-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div 
          className={cn(
            "flex flex-col h-full transition-all duration-300 ease-in-out shrink-0",
            isSidebarCollapsed ? "px-2 py-5" : "p-3 sm:p-4",
            isSidebarCollapsed ? "w-16" : "w-[calc(100vw-16px)] max-w-[304px] md:w-[304px]"
          )}
        >
          {/* Lumora Logo */}
          {isSidebarCollapsed ? (
            <div 
              className="flex justify-center mb-6 cursor-pointer hover:scale-105 active:scale-95 transition-transform" 
              onClick={() => setIsSidebarCollapsed(false)} 
              title="Expand Sidebar"
            >
               <LumoraLogo size={28} showText={false} />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 mb-6 px-2">
               <LumoraLogo size={28} showText={true} />
               <button
                 type="button"
                 onClick={() => setIsSidebarOpen(false)}
                 className="md:hidden w-11 h-11 rounded-2xl border border-white/[0.06] bg-white/[0.04] text-zinc-400 flex items-center justify-center active:scale-95 transition-all"
                 aria-label="Close chat sidebar"
               >
                 <X size={17} strokeWidth={2.5} />
               </button>
            </div>
          )}

          {/* New Chat Button */}
          {isSidebarCollapsed ? (
            <button 
              onClick={startNewChat} 
              className="w-11 h-11 rounded-xl bg-white text-zinc-950 flex items-center justify-center mx-auto mb-6 hover:bg-zinc-200 transition-all active:scale-[0.95] shadow-lg"
              title="New Chat"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
          ) : (
            <button 
              onClick={startNewChat} 
              className="w-full min-h-12 px-4 py-3.5 rounded-2xl bg-white text-zinc-950 font-black text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 mb-6 hover:bg-zinc-200 transition-all active:scale-[0.97] shadow-xl touch-manipulation"
            >
              <Plus size={16} strokeWidth={3} />
              New Chat
            </button>
          )}

          {/* Sessions List */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 custom-scrollbar">
            {isSidebarCollapsed ? (
              <div className="flex flex-col items-center gap-3">
                 <button 
                   onClick={(e) => { e.preventDefault(); setIsSidebarCollapsed(false); }}
                   className="w-11 h-11 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 flex items-center justify-center mx-auto text-zinc-400 hover:text-white transition-all mb-4 touch-manipulation" 
                   title="Expand History"
                 >
                   <History size={15} />
                 </button>

                 {sessions.length === 0 ? (
                   <div className="flex items-center justify-center py-6 opacity-30">
                     <MessageSquare size={16} className="text-zinc-600" />
                   </div>
                 ) : (
                   sessions.map(s => (
                     <button 
                       key={s.id}
                       onClick={(e) => { e.preventDefault(); loadSession(s.id); }}
                       className={cn(
                         "w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 relative group/icon touch-manipulation",
                         sessionId === s.id 
                           ? "bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-md" 
                           : "bg-[#0c0c12]/40 border-white/[0.04] text-zinc-500 hover:text-zinc-200 hover:border-white/10"
                       )}
                       title={cleanTitleText(s.title)}
                     >
                       <MessageSquare size={15} />
                       {sessionId === s.id && (
                         <div className="absolute right-1.5 top-1.5 w-1.5 h-1.5 bg-accent-purple rounded-full shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
                       )}
                       
                       <div className="absolute left-full ml-3 px-3 py-2 bg-[#09090d] border border-white/10 text-white text-[10px] font-semibold rounded-lg opacity-0 pointer-events-none group-hover/icon:opacity-100 transition-opacity whitespace-nowrap z-[999] shadow-2xl">
                         {cleanTitleText(s.title)}
                       </div>
                     </button>
                   ))
                 )}
              </div>
            ) : (
              <>
                <div className="px-3 mb-3 text-zinc-600 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History size={13} className="text-zinc-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">History</span>
                  </div>
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{sessions.length} Sessions</span>
                </div>

                <div className="space-y-3.5 pr-0.5">
                  {sessions.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4 opacity-40">
                        <div className="w-11 h-11 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-700">
                           <MessageSquare size={18} />
                        </div>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">No conversations yet.<br/>Start chatting!</p>
                     </div>
                  ) : (
                     <AnimatePresence initial={false}>
                       {sessions.map(s => (
                         <motion.div 
                           key={s.id} 
                           layout
                           initial={{ opacity: 0, y: 12, scale: 0.96 }}
                           animate={{ opacity: 1, y: 0, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.92, y: -10, transition: { duration: 0.18, ease: "easeInOut" } }}
                           className="group/item relative px-0 sm:px-1"
                         >
                           {/* Luxury Glow Ring Backdrop for Active Card */}
                           {sessionId === s.id && (
                             <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-cyan-500/15 blur-md rounded-2xl opacity-100 transition-opacity duration-300" />
                           )}

                           <button 
                             onClick={(e) => { e.preventDefault(); loadSession(s.id); }} 
                             className={cn(
                               "w-full min-h-[72px] text-left p-3.5 sm:p-4 rounded-2xl transition-all duration-300 ease-out flex flex-col gap-1.5 border relative overflow-hidden group/card touch-manipulation",
                               sessionId === s.id 
                                 ? "bg-gradient-to-r from-purple-500/[0.07] to-cyan-500/[0.07] border-purple-500/25 shadow-[0_8px_30px_rgba(168,85,247,0.12),inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-xl z-10" 
                                 : "bg-[#0b0b0f]/35 border-white/[0.03] text-zinc-400 hover:border-purple-500/20 hover:bg-white/[0.04] hover:shadow-[0_8px_20px_rgba(168,85,247,0.06),0_0_15px_rgba(6,182,212,0.03),inset_0_1px_1px_rgba(255,255,255,0.02)] md:hover:-translate-y-0.5 z-10"
                             )}
                           >
                             <div className="flex items-start justify-between gap-3 w-full relative z-10">
                               <span className={cn(
                                 "min-w-0 text-[12.5px] tracking-tight flex-1 transition-colors duration-300 mt-[0.5px] line-clamp-1 break-words",
                                 sessionId === s.id 
                                   ? "text-white font-extrabold" 
                                   : "text-zinc-300 group-hover/card:text-zinc-100 font-bold"
                               )}>
                                 {cleanTitleText(s.title)}
                               </span>
                               <span className="hidden min-[360px]:inline text-[8.5px] font-black text-zinc-500 shrink-0 uppercase tracking-widest md:group-hover/item:opacity-0 transition-opacity duration-300 mt-1">
                                 {formatTimeAgo(s.updatedAt || s.createdAt)}
                               </span>
                             </div>
                             
                             <p className={cn(
                               "text-[10.5px] font-medium line-clamp-1 leading-relaxed transition-colors duration-300 relative z-10 pr-10 break-words",
                               sessionId === s.id 
                                 ? "text-zinc-400 font-semibold" 
                                 : "text-zinc-500 group-hover/card:text-zinc-400"
                             )}>
                               {cleanSubtitleText(s.lastMessage || "")}
                             </p>

                             {/* Premium Active Indicator Bar */}
                             {sessionId === s.id && (
                               <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3.5px] h-7 bg-gradient-to-b from-purple-500 via-indigo-500 to-cyan-500 rounded-r-full shadow-[0_0_12px_rgba(168,85,247,0.8)] z-25" />
                             )}
                           </button>
                           
                           {/* Sleek Delete button with instant active scaling */}
                           <button 
                             onClick={(e) => { e.stopPropagation(); openDeleteModal(s.id); }} 
                             className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 text-zinc-500 hover:text-red-400 opacity-100 md:opacity-0 md:group-hover/item:opacity-100 transition-all duration-300 hover:bg-red-500/15 hover:shadow-[0_0_10px_rgba(239,68,68,0.2)] active:scale-90 rounded-xl z-30 pointer-events-auto cursor-pointer flex items-center justify-center touch-manipulation"
                             title="Delete Conversation"
                             aria-label="Delete conversation"
                           >
                             <Trash2 size={13.5} />
                           </button>
                         </motion.div>
                       ))}
                     </AnimatePresence>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sidebar User profile info at bottom */}
          <div className="pt-4 mt-auto border-t border-white/[0.04] bg-transparent shrink-0">
             {isSidebarCollapsed ? (
               <div className="flex flex-col items-center gap-3.5">
                 {/* Collapsed Avatar Squircle Trigger */}
                 <div 
                   className={cn(
                     "p-[1.5px] rounded-xl cursor-pointer transition-all duration-500 hover:scale-105 active:scale-95 relative group/collapsed-avatar shadow-md",
                     isPro 
                       ? "bg-gradient-to-tr from-purple-500/40 via-cyan-400/30 to-pink-500/40 hover:from-purple-500 hover:via-cyan-400 hover:to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.15)] hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]" 
                       : "bg-white/10 hover:bg-white/20"
                   )}
                   onClick={() => setIsSidebarCollapsed(false)}
                   title="Expand Sidebar"
                 >
                   <div 
                     className="w-9 h-9 rounded-[10px] bg-[#0b0b11] flex items-center justify-center overflow-hidden shadow-inner relative z-10" 
                   >
                     {session?.user?.user_metadata?.avatar_url ? (
                        <img src={session.user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                     ) : (
                        <div 
                          className={cn(
                            "w-full h-full flex items-center justify-center font-sans font-extrabold text-[10px] uppercase",
                            isPro 
                              ? "bg-gradient-to-br from-purple-500 via-cyan-400 to-pink-500 text-white" 
                              : "bg-zinc-900 text-zinc-400"
                          )}
                        >
                           {(session?.user?.user_metadata?.full_name || session?.user?.email || "G")[0].toUpperCase()}
                        </div>
                     )}
                   </div>
                   {/* Status beacon dot */}
                   <span className={cn(
                     "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-[#07070b] rounded-full z-20 shadow-sm flex items-center justify-center",
                     isPro ? "bg-emerald-500" : "bg-cyan-500"
                   )}>
                     <span className={cn(
                       "absolute inset-0 rounded-full animate-ping opacity-60",
                       isPro ? "bg-emerald-400" : "bg-cyan-400"
                     )} />
                   </span>
                 </div>
                 
                 <Link 
                    href="/account/settings" 
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center text-zinc-400 transition-all duration-500 border border-white/[0.05] bg-white/[0.02]",
                      isPro 
                        ? "hover:text-white hover:bg-purple-500/10 hover:border-purple-500/30 hover:shadow-[0_0_8px_rgba(168,85,247,0.15)]"
                        : "hover:text-white hover:bg-white/10 hover:border-white/20"
                    )}
                    title="Account Settings"
                 >
                    <Settings size={12.5} />
                 </Link>
               </div>
             ) : (
               <UserProfile 
                 fullName={session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || "Explorer"} 
                 email={session?.user?.email} 
                 avatarUrl={session?.user?.user_metadata?.avatar_url} 
                 isPro={isPro} 
                 frameId={localFrameId || undefined}
                 gradientId={localGradientId}
                 variant="sidebar" 
               />
             )}
          </div>
       </div>
      </aside>

      {/* Delete Conversation Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop Blur Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModal({ isOpen: false, sessionId: null })}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Premium Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
              className="relative max-w-sm w-full bg-[#0a0a0f]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] text-center overflow-hidden z-10"
            >
              {/* Background luxury gradient glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/10 blur-[40px] rounded-full -z-10" />

              {/* Animated Alert Trash Icon */}
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4.5 shadow-lg shadow-red-500/5 relative overflow-hidden group/delete-icon">
                 {/* Shimmer sweep inside icon */}
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/delete-icon:translate-x-full transition-transform duration-1000" />
                 <Trash2 size={22} className="relative z-10 animate-pulse" />
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-extrabold text-white tracking-wide uppercase leading-tight mb-2">
                Delete Conversation?
              </h3>
              <p className="text-xs font-semibold text-zinc-400 leading-relaxed mb-6">
                Are you sure you want to discard this chat session? This action is permanent and cannot be undone.
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3.5">
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, sessionId: null })}
                  className="py-3 px-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/15 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteSession}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-500 to-red-600 bg-[length:200%_auto] hover:bg-[position:right_center] hover:shadow-[0_0_20px_rgba(239,68,68,0.35)] text-white text-xs font-black uppercase tracking-wider transition-all duration-500 active:scale-[0.98]"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
