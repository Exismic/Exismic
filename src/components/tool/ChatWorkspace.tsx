"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Send, 
  Paperclip, 
  X, 
  MessageSquare, 
  Trash2, 
  Copy, 
  Check, 
  User, 
  Sparkles, 
  Share2, 
  PanelLeftClose, 
  PanelLeftOpen, 
  ArrowUp, 
  FileText, 
  RefreshCw, 
  Minimize2, 
  Maximize2, 
  Sliders, 
  ShieldCheck, 
  Download,
  Settings,
  Cpu,
  Database,
  Globe,
  Lock,
  Boxes,
  TrendingUp,
  Brain,
  Search,
  Palette,
  Rocket,
  Flame,
  Layout,
  Layers,
  Code,
  Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat, cleanTitle } from "@/components/providers/ChatProvider";
import { LumoraLogo } from "./ChatSidebar";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import GradientHeading from "../ui/GradientHeading";
import GradientText from "../ui/GradientText";

const SLASH_COMMANDS = [
  { id: 'new', icon: <Plus size={16} className="text-cyan-400" />, label: 'New Conversation', desc: 'Start a fresh creative session' },
  { id: 'clear', icon: <Trash2 size={16} className="text-red-400" />, label: 'Clear Chat', desc: 'Remove all messages from this view' },
  { id: 'summarize', icon: <FileText size={16} className="text-emerald-400" />, label: 'Summarize Chat', desc: 'Generate a brief summary of the conversation' },
  { id: 'export', icon: <Share2 size={16} className="text-orange-400" />, label: 'Export Chat', desc: 'Save this conversation as a document' },
];

const ChatSkeleton = () => (
  <div className="flex flex-col gap-8 py-8 px-4 md:px-8 max-w-[850px] mx-auto w-full">
    {/* User bubble skeleton */}
    <div className="flex gap-4 self-end max-w-[70%] items-start justify-end w-full">
      <div className="flex flex-col gap-2 items-end min-w-0">
        <div className="h-3 w-24 bg-white/[0.04] border border-white/5 rounded-full animate-pulse" />
        <div className="h-12 w-64 md:w-80 bg-white/[0.03] border border-white/5 rounded-2xl animate-pulse" />
      </div>
      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/5 animate-pulse shrink-0" />
    </div>

    {/* AI bubble skeleton */}
    <div className="flex gap-4 self-start max-w-[70%] items-start w-full">
      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 animate-pulse shrink-0" />
      <div className="flex flex-col gap-2 min-w-0">
        <div className="h-3 w-20 bg-white/[0.04] border border-white/5 rounded-full animate-pulse" />
        <div className="h-20 w-72 md:w-96 bg-white/[0.03] border border-white/5 rounded-2xl animate-pulse" />
      </div>
    </div>
  </div>
);

const getWorkflowDetails = (title: string) => {
  switch (title) {
    case "System Architecture":
      return {
        icon: Cpu,
        color: "text-purple-400",
        bg: "from-purple-500/15 to-indigo-500/5",
        accent: "rgba(168, 85, 247, 0.3)"
      };
    case "Code Refactoring":
      return {
        icon: Code,
        color: "text-blue-400",
        bg: "from-blue-500/15 to-indigo-500/5",
        accent: "rgba(59, 130, 246, 0.3)"
      };
    case "Database Design":
      return {
        icon: Database,
        color: "text-cyan-400",
        bg: "from-cyan-500/15 to-blue-500/5",
        accent: "rgba(6, 182, 212, 0.3)"
      };
    case "API Development":
      return {
        icon: Globe,
        color: "text-emerald-400",
        bg: "from-emerald-500/15 to-teal-500/5",
        accent: "rgba(16, 185, 129, 0.3)"
      };
    case "Cybersecurity":
      return {
        icon: Lock,
        color: "text-rose-400",
        bg: "from-rose-500/15 to-red-500/5",
        accent: "rgba(244, 63, 94, 0.3)"
      };
    case "Dockerization":
      return {
        icon: Boxes,
        color: "text-sky-400",
        bg: "from-sky-500/15 to-blue-500/5",
        accent: "rgba(56, 189, 248, 0.3)"
      };
    case "Market Analysis":
      return {
        icon: TrendingUp,
        color: "text-amber-400",
        bg: "from-amber-500/15 to-orange-500/5",
        accent: "rgba(245, 158, 11, 0.3)"
      };
    case "Data Science":
      return {
        icon: Brain,
        color: "text-pink-400",
        bg: "from-pink-500/15 to-purple-500/5",
        accent: "rgba(236, 72, 153, 0.3)"
      };
    case "Deep Research":
      return {
        icon: Search,
        color: "text-violet-400",
        bg: "from-violet-500/15 to-purple-500/5",
        accent: "rgba(139, 92, 246, 0.3)"
      };
    case "Prompt Engineering":
      return {
        icon: Terminal,
        color: "text-teal-400",
        bg: "from-teal-500/15 to-emerald-500/5",
        accent: "rgba(20, 184, 166, 0.3)"
      };
    case "Creative Concepting":
      return {
        icon: Palette,
        color: "text-fuchsia-400",
        bg: "from-fuchsia-500/15 to-pink-500/5",
        accent: "rgba(217, 70, 239, 0.3)"
      };
    case "Content Strategy":
      return {
        icon: FileText,
        color: "text-indigo-400",
        bg: "from-indigo-500/15 to-blue-500/5",
        accent: "rgba(129, 140, 248, 0.3)"
      };
    case "Startup Ideas":
      return {
        icon: Rocket,
        color: "text-orange-400",
        bg: "from-orange-500/15 to-red-500/5",
        accent: "rgba(249, 115, 22, 0.3)"
      };
    case "Growth Hacking":
      return {
        icon: Flame,
        color: "text-red-400",
        bg: "from-red-500/15 to-rose-500/5",
        accent: "rgba(239, 68, 68, 0.3)"
      };
    case "UI/UX Review":
      return {
        icon: Layout,
        color: "text-cyan-400",
        bg: "from-cyan-500/15 to-teal-500/5",
        accent: "rgba(6, 182, 212, 0.3)"
      };
    case "Design Systems":
      return {
        icon: Layers,
        color: "text-violet-400",
        bg: "from-violet-500/15 to-fuchsia-500/5",
        accent: "rgba(167, 139, 250, 0.3)"
      };
    default:
      return {
        icon: Sparkles,
        color: "text-accent-cyan",
        bg: "from-accent-cyan/15 to-accent-purple/5",
        accent: "rgba(6, 182, 212, 0.3)"
      };
  }
};

export function ChatWorkspace() {
  const {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    error,
    sessionId,
    sessions,
    isSidebarOpen,
    setIsSidebarOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    deleteModal,
    setDeleteModal,
    attachments,
    setAttachments,
    copiedId,
    setCopiedId,
    agentStatus,
    showCommands,
    setShowCommands,
    currentSuggestions,
    isRerolling,
    showClearConfirm,
    setShowClearConfirm,
    isImmersive,
    setIsImmersive,
    isDragging,
    setIsDragging,
    safeMode,
    toggleSafeMode,
    isSettingsOpen,
    setIsSettingsOpen,
    isGeneratingImage,
    isSessionLoading,
    session,
    isPro,

    scrollRef,
    textareaRef,
    fileInputRef,

    loadSession,
    startNewChat,
    handleSend,
    confirmDeleteSession,
    rollSuggestions,
    processFiles,
    toast
  } = useChat();

  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

  // --- Keyboard Shortcuts & Commands ---
  const executeCommand = (cmdId: string) => {
    setShowCommands(false);
    setInput('');
    setSelectedCommandIndex(0);
    
    if (cmdId === 'new') {
      startNewChat();
    } else if (cmdId === 'clear') {
      if (messages.length === 0) {
         toast("Nothing to clear. Start a conversation first.", "warning");
         return;
      }
      setShowClearConfirm(true);
    } else if (cmdId === 'summarize') {
      if (messages.length < 3) {
         toast("Not enough messages to summarize yet. Keep chatting!", "warning");
         return;
      }
      handleSend("Please provide a concise, professional summary of our conversation so far, highlighting key decisions or insights.");
    } else if (cmdId === 'export') {
      if (messages.length === 0) {
         toast("Nothing to export. Start a conversation first.", "warning");
         return;
      }
      const text = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n---\n\n');
      const blob = new Blob([`LUMORA CHAT EXPORT\nGenerated: ${new Date().toLocaleString()}\n\n${text}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lumora-chat-${new Date().getTime()}.txt`;
      a.click();
      toast("Chat Exported Successfully", "success");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast("Link Copied to Clipboard!", "success");
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `lumora-chat-gen-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast("Image Downloaded Successfully", "success");
    } catch (err) {
      console.error("Download failed", err);
      toast("Failed to download image", "warning");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    if (val.startsWith('/')) {
      setShowCommands(true);
    } else {
      setShowCommands(false);
    }
  };

  // --- Drag & Drop Files ---
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  // --- Custom Markdown-Like Parser ---
  const renderMessageContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const match = part.match(/```([\w]*)\n([\s\S]*?)```/);
        const lang = match ? match[1] : 'text';
        const code = match ? match[2] : part.replace(/```/g, '');
        return (
          <div key={i} className="my-6 rounded-2xl overflow-x-auto border border-white/5 bg-[#0a0a0a] shadow-2xl custom-scrollbar">
            <div className="px-5 py-3 bg-[#111] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-cyan-400" />
                 <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{lang || 'code'}</span>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  setCopiedId(i);
                  setTimeout(() => setCopiedId(null), 2000);
                }} 
                className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded-lg flex items-center gap-2 text-[10px] font-bold bg-white/5 hover:bg-white/10"
              >
                {copiedId === i ? <Check size={12} /> : <Copy size={12} />}
                {copiedId === i ? 'Copied' : 'Copy'}
              </button>
            </div>
            <SyntaxHighlighter language={lang} style={vscDarkPlus} customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '14px', lineHeight: '1.6', fontFamily: '"JetBrains Mono", monospace' }}>
              {code.trim()}
            </SyntaxHighlighter>
          </div>
        );
      }
      
      return part.split('\n').map((line, li) => {
        if (!line.trim()) return <div key={li} className="h-4" />;
        
        if (line.startsWith('###### ')) {
          return <h6 key={li} className="text-sm font-black text-white mt-4 mb-2 uppercase tracking-widest">{line.slice(7)}</h6>;
        }
        if (line.startsWith('##### ')) {
          return <h5 key={li} className="text-base font-black text-white mt-5 mb-2 tracking-tight">{line.slice(6)}</h5>;
        }
        if (line.startsWith('#### ')) {
          return <h4 key={li} className="text-lg font-black text-white mt-6 mb-3 tracking-tight">{line.slice(5)}</h4>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={li} className="text-2xl font-black text-white mt-8 mb-4 tracking-tight">{line.slice(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={li} className="text-3xl font-black text-white mt-10 mb-5 tracking-tighter">{line.slice(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={li} className="text-4xl font-black text-white mt-12 mb-6 tracking-tighter">{line.slice(2)}</h1>;
        }

        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          return (
            <div key={li} className="flex gap-4 mb-4 ml-2 group/list">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan mt-2.5 shrink-0 shadow-[0_0_10px_#00ffff] group-hover/list:scale-125 transition-transform" />
              <div className="flex-1">
                {line.trim().slice(2).split(/(\[.*?\]\s*\(.*?\))|(\*\*.*?\*\*|\*.*?\*|`.*?`)/g).map((token, ti) => {
                  if (!token) return null;
                  if (token.startsWith('[') && token.includes('(')) {
                    const match = token.match(/\[(.*?)\]\s*\((.*?)\)/);
                    if (match) {
                      const text = match[1];
                      const url = match[2];
                      return (
                        <a 
                          key={ti} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-accent-cyan hover:text-cyan-300 underline underline-offset-4 decoration-accent-cyan/30 hover:decoration-cyan-300/80 transition-colors font-bold inline-flex items-center gap-1 group/link"
                        >
                          {text}
                          <ArrowUp className="rotate-45 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" size={10} />
                        </a>
                      );
                    }
                  }
                  if (token.startsWith('**') && token.endsWith('**')) return <strong key={ti} className="text-white font-black tracking-tight">{token.slice(2, -2)}</strong>;
                  if (token.startsWith('*') && token.endsWith('*')) return <strong key={ti} className="text-white font-black tracking-tight">{token.slice(1, -1)}</strong>;
                  if (token.startsWith('`') && token.endsWith('`')) return <code key={ti} className="bg-white/10 px-2 py-0.5 rounded-lg text-accent-cyan font-mono text-sm border border-white/5">{token.slice(1, -1)}</code>;
                  return token;
                })}
              </div>
            </div>
          );
        }
        
        return (
          <p key={li} className="mb-4 last:mb-0 text-zinc-300 leading-relaxed">
            {line.split(/(!\[.*?\]\(.*?\))|(\[.*?\]\s*\(.*?\))|(\*\*.*?\*\*|\*.*?\*|`.*?`)/g).map((token, ti) => {
              if (!token) return null;
              
              if (token.startsWith('![') && token.includes('](')) {
                const match = token.match(/!\[(.*?)\]\((.*?)\)/);
                if (match) {
                  const alt = match[1];
                  const url = match[2];
                  return (
                    <div key={ti} className="my-6 relative group/img">
                      <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-xl opacity-0 group-hover/img:opacity-100 transition-opacity rounded-[2rem]" />
                      <img 
                        src={url} 
                        alt={alt} 
                        className="rounded-[2rem] border border-white/10 shadow-2xl max-w-full h-auto object-cover relative z-10 hover:scale-[1.02] transition-transform duration-500" 
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.classList.add('animate-in', 'fade-in', 'zoom-in', 'duration-700');
                        }}
                      />
                      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover/img:opacity-100 transition-opacity">
                         <a 
                           href={url} 
                           target="_blank" 
                           rel="noreferrer"
                           className="p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 transition-all block"
                         >
                            <ArrowUp className="rotate-45" size={18} />
                         </a>
                      </div>
                    </div>
                  );
                }
              }

              if (token.startsWith('[') && token.includes('(')) {
                const match = token.match(/\[(.*?)\]\s*\((.*?)\)/);
                if (match) {
                  const text = match[1];
                  const url = match[2];
                  return (
                    <a 
                      key={ti} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-accent-cyan hover:text-cyan-300 underline underline-offset-4 decoration-accent-cyan/30 hover:decoration-cyan-300/80 transition-colors font-bold inline-flex items-center gap-1 group/link"
                    >
                      {text}
                      <ArrowUp className="rotate-45 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" size={10} />
                    </a>
                  );
                }
              }

              if (token.startsWith('**') && token.endsWith('**')) return <strong key={ti} className="text-white font-black tracking-tight">{token.slice(2, -2)}</strong>;
              if (token.startsWith('*') && token.endsWith('*')) return <strong key={ti} className="text-white font-black tracking-tight">{token.slice(1, -1)}</strong>;
              if (token.startsWith('`') && token.endsWith('`')) return <code key={ti} className="bg-white/10 px-2 py-0.5 rounded-lg text-accent-cyan font-mono text-[14px] border border-white/5">{token.slice(1, -1)}</code>;
              return token;
            })}
          </p>
        );
      });
    });
  };

  return (
    <div 
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "text-zinc-300 font-sans selection:bg-purple-500/30 overflow-hidden flex flex-col transition-all duration-300 relative flex-1 w-full",
        isImmersive 
          ? cn(
              "fixed inset-y-0 right-0 bg-[#060608] z-[200] h-[100dvh]",
              isSidebarCollapsed 
                ? "left-0 md:left-16 w-full md:w-[calc(100vw-64px)]" 
                : "left-0 md:left-[304px] w-full md:w-[calc(100vw-304px)]"
            )
          : "w-full h-[calc(100dvh-140px)] min-h-[560px] bg-[#0c0c10]/90 backdrop-blur-3xl border border-white/[0.05] rounded-[2rem] md:rounded-[2.5rem] shadow-2xl relative"
      )}
    >
      
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-purple-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[60%] h-[60%] bg-cyan-600/5 blur-[150px] rounded-full" />
      </div>

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[999] bg-[#060608]/85 backdrop-blur-md flex items-center justify-center p-8 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="border-2 border-dashed border-accent-purple/50 bg-[#0d0d12]/60 rounded-[2.5rem] w-full h-full flex flex-col items-center justify-center p-12 space-y-6 shadow-[0_0_50px_rgba(168,85,247,0.15)]"
            >
              <div className="w-20 h-20 rounded-3xl bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-center text-accent-purple shadow-[0_0_30px_rgba(168,85,247,0.2)] animate-bounce">
                <Paperclip size={36} />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">Drop files to attach</h3>
                <p className="text-zinc-500 text-sm font-semibold max-w-sm">Support images and text files. Max file size: 10MB.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 relative bg-transparent h-full">
        
        {/* Sleek top bar */}
        <header className="h-14 px-4 md:px-5 border-b border-white/[0.05] flex items-center justify-between bg-[#08080a]/65 backdrop-blur-md shrink-0 z-50">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsSidebarOpen(!isSidebarOpen);
                } else {
                  setIsSidebarCollapsed(!isSidebarCollapsed);
                }
              }} 
              className="min-h-10 min-w-10 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all active:scale-95 flex items-center justify-center"
              title="Toggle Sidebar"
            >
              {(isSidebarOpen && !isSidebarCollapsed) ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
            
            <div className="hidden sm:block h-3 w-px bg-white/10 mx-1.5" />

            <div className="hidden sm:flex items-center gap-2.5 max-w-[280px]">
              <span className="truncate text-[11px] font-bold text-zinc-400 uppercase tracking-tight">
                {sessionId ? (cleanTitle(sessions.find(s => s.id === sessionId)?.title || "Active Chat")) : "New Chat"}
              </span>
              <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] shrink-0" />
              
              <div 
                onClick={() => toggleSafeMode(!safeMode)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest cursor-pointer select-none transition-all active:scale-95 shrink-0",
                  safeMode 
                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10" 
                    : "bg-purple-500/5 border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
                )}
                title="Toggle Creative Mode"
              >
                <ShieldCheck size={8.5} className={cn(safeMode ? "text-emerald-400" : "text-purple-400")} />
                <span>{safeMode ? "Safe Mode • Light" : "Creative Mode"}</span>
              </div>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 pointer-events-none">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.04] backdrop-blur-md">
              <div className="w-1 h-1 rounded-full bg-accent-purple animate-pulse" />
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{agentStatus}</span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button 
              onClick={startNewChat}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-zinc-300 hover:text-white hover:bg-white/10 transition-all active:scale-95"
              title="New Chat"
            >
              <Plus size={12} strokeWidth={2.5} />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            <button 
              onClick={handleShare}
              className="min-h-10 min-w-10 rounded-lg bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center"
              title="Share Chat Link"
            >
              <Share2 size={13} />
            </button>

            <div className="h-3 w-px bg-white/10 mx-0.5" />

            <button 
              onClick={() => setIsImmersive(!isImmersive)} 
              className={cn(
                "min-h-10 min-w-10 rounded-lg transition-all active:scale-95 flex items-center justify-center",
                isImmersive 
                  ? "bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20" 
                  : "bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              )}
              title={isImmersive ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isImmersive ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="min-h-10 min-w-10 rounded-lg bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center"
              title="Settings"
            >
              <Settings size={13} />
            </button>

            <Link 
              href="/category/ai"
              className="min-h-10 min-w-10 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all active:scale-95 flex items-center justify-center"
              title="Close AI Chat"
            >
              <X size={13} />
            </Link>
          </div>
        </header>

        {/* Message flow container */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-6 custom-scrollbar relative">
           <div className="max-w-[850px] mx-auto min-h-full flex flex-col pt-8">
              {isSessionLoading ? (
                <ChatSkeleton />
              ) : messages.length === 0 ? (
                
                // Welcome Screen
                <div className="flex-1 flex flex-col items-center justify-center pb-28 text-center px-4">
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.96, y: 15 }} 
                     animate={{ opacity: 1, scale: 1, y: 0 }} 
                     transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} 
                     className="space-y-6 mb-12"
                   >
                      <div className="relative inline-block group">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-accent-purple/35 to-accent-cyan/35 blur-xl opacity-80 group-hover:opacity-100 transition-opacity rounded-full animate-pulse-glow" />
                        <LumoraLogo size={88} showText={false} className="mx-auto relative z-10 hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="space-y-3 flex flex-col items-center mt-6">
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-[1.1] px-2">
                          Unlimited <span className="animated-gradient-text">Creativity</span>.
                        </h2>
                        <p className="text-zinc-500 text-sm md:text-base font-medium max-w-md mx-auto drop-shadow-md">
                          Define the Future. What shall we build today?
                        </p>
                      </div>
                   </motion.div>                    {/* Starter cards suggestions */}
                    <div className="w-full max-w-5xl mt-2 px-1">
                       <div className="flex items-center justify-between mb-5.5 px-3">
                          <div className="flex items-center gap-2">
                             <div className="relative flex items-center justify-center">
                               <Sparkles size={14} className="text-accent-cyan animate-pulse absolute blur-[3px]" />
                               <Sparkles size={14} className="text-accent-cyan animate-pulse relative z-10" />
                             </div>
                             <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] bg-clip-text text-transparent bg-gradient-to-r from-zinc-400 via-zinc-100 to-zinc-400">Suggested Workflows</span>
                          </div>
                          <button 
                            onClick={rollSuggestions}
                            disabled={isRerolling}
                            className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-all duration-300 active:scale-95 bg-white/[0.02] hover:bg-white/5 border border-white/5 hover:border-purple-500/30 hover:shadow-[0_0_15px_rgba(168,85,247,0.1)] rounded-lg px-3 py-1.5"
                            title="Show different suggestions"
                          >
                            <RefreshCw size={10} className={cn("text-zinc-400 transition-colors duration-300", isRerolling && "animate-spin text-accent-purple")} />
                            Reroll
                          </button>
                       </div>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <AnimatePresence mode="wait">
                             {!isRerolling && currentSuggestions.map((card, i) => {
                               const details = getWorkflowDetails(card.title);
                               const CardIcon = details.icon;
                               return (
                                 <motion.button 
                                     key={card.title} 
                                     initial={{ opacity: 0, y: 15, scale: 0.97 }} 
                                     animate={{ opacity: 1, y: 0, scale: 1 }} 
                                     exit={{ opacity: 0, scale: 0.97, y: -10 }}
                                     transition={{ delay: 0.02 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                     onClick={() => handleSend(card.prompt)} 
                                     className={cn(
                                       "group p-4.5 rounded-2xl bg-[#0b0b0f]/45 backdrop-blur-xl border border-white/[0.05] hover:bg-[#0e0e16]/80 hover:border-purple-500/25 transition-all duration-500 text-left flex items-start gap-4 relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.15),0_10px_35px_-10px_rgba(6,182,212,0.12)] hover:-translate-y-1 hover:scale-[1.015] active:scale-[0.99]"
                                     )}
                                  >
                                     {/* Accent gradient line at top */}
                                     <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/20 to-cyan-500/20 group-hover:via-purple-500/50 group-hover:to-cyan-500/50 transition-all duration-700 pointer-events-none" />

                                     {/* Glow radial overlay */}
                                     <div className="absolute -inset-24 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.06),rgba(6,182,212,0.03),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                     {/* Metallic sweep shine effect */}
                                     <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                                     {/* Icon with beautiful double layer glow */}
                                     <div className={cn(
                                       "relative flex items-center justify-center w-11 h-11 rounded-xl border border-white/[0.06] transition-all duration-500 shrink-0",
                                       "bg-white/[0.02] group-hover:bg-white/[0.04] group-hover:scale-105"
                                     )}>
                                        {/* Glow Layer */}
                                        <CardIcon className={cn("absolute w-5 h-5 blur-[4px] opacity-0 group-hover:opacity-80 transition-opacity duration-500", details.color)} />
                                        {/* Crisp front layer */}
                                        <CardIcon className={cn("w-5 h-5 relative z-10 transition-transform duration-500 group-hover:rotate-3", details.color)} />
                                     </div>

                                     {/* Content wrapper */}
                                     <div className="flex-grow min-w-0 flex flex-col justify-center">
                                        <h4 className="text-zinc-100 font-bold text-[13px] leading-snug tracking-tight group-hover:text-white transition-colors duration-300 flex items-center gap-1.5">
                                          {card.title}
                                          <Sparkles size={10} className="text-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-500 ml-1 shrink-0 animate-pulse" />
                                        </h4>
                                        <p className="text-zinc-400 text-[11px] leading-relaxed mt-1.5 group-hover:text-zinc-300 transition-colors duration-300 line-clamp-2 font-normal">
                                          {card.desc}
                                        </p>
                                     </div>
                                  </motion.button>
                               );
                             })}
                          </AnimatePresence>
                       </div>
                    </div>
                 </div>
              ) : (
                
                // Active messages flow
                <div className="space-y-12 pb-44">
                  {messages.map((msg, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 15, scale: 0.98 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.75 }}
                      className={cn("flex gap-5 w-full group/message", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}
                    >
                      {/* Avatar */}
                      <div className="flex flex-col items-center mt-1 shrink-0">
                        {msg.role === 'assistant' ? (
                          <div className="relative shrink-0">
                             <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center shadow-md relative z-10 group-hover/message:border-accent-purple/30 transition-colors duration-500">
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-400 font-black text-xs">L</span>
                             </div>
                             <div className="absolute -inset-1 bg-accent-purple/10 blur-sm opacity-0 group-hover/message:opacity-100 transition-opacity duration-500 rounded-xl" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 overflow-hidden shadow-md shrink-0 flex items-center justify-center">
                             {session?.user?.user_metadata?.avatar_url ? (
                                <img src={session.user.user_metadata.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                             ) : (
                                <div className="w-full h-full bg-linear-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                                  <User size={16} className="text-zinc-500" />
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                      
                      {/* Bubble */}
                      <div className={cn(
                        "flex flex-col max-w-[85%] md:max-w-[78%] relative", 
                        msg.role === 'user' ? "items-end" : "items-start"
                      )}>
                        {msg.role === 'user' ? (
                          <div className="relative p-[1px] bg-white/[0.04] group-hover/message:bg-white/[0.08] transition-all duration-500 rounded-3xl rounded-tr-md shadow-xl max-w-full">
                            <div className="relative px-6 py-4 bg-[#0d0d12]/90 backdrop-blur-xl text-zinc-100 rounded-[calc(1.5rem-1px)] rounded-tr-[calc(0.4rem-1px)]">
                              <div className="relative z-10 text-[15px] md:text-[15.5px] leading-[1.7] font-medium tracking-tight whitespace-pre-wrap">
                                {renderMessageContent(msg.content)}
                              </div>

                              {/* Render Image Previews */}
                              {msg.attachments && msg.attachments.some(a => a.type.startsWith('image/')) && (
                                <div className="flex flex-wrap gap-3.5 mt-4.5 mb-1.5 relative z-10">
                                  {msg.attachments.filter(a => a.type.startsWith('image/')).map((at, idx) => (
                                    <div key={idx} className="relative group/img bubble-image-preview max-w-full">
                                      <div className="absolute -inset-1.5 bg-gradient-to-r from-accent-purple/15 to-accent-cyan/15 blur-lg opacity-0 group-hover/img:opacity-100 transition-opacity rounded-2xl" />
                                      <a href={at.data} target="_blank" rel="noreferrer" className="block relative z-10 overflow-hidden rounded-2xl border border-white/10 shadow-lg hover:scale-[1.01] hover:border-white/25 transition-all duration-300">
                                        <img src={at.data} className="max-h-[220px] max-w-full md:max-w-[450px] object-cover" alt={at.name || "Attached"} />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* File chips */}
                              {msg.attachments && msg.attachments.some(a => !a.type.startsWith('image/')) && (
                                <div className="flex flex-wrap gap-2 mt-4 pt-3.5 border-t border-white/[0.04] relative z-10">
                                  {msg.attachments.filter(a => !a.type.startsWith('image/')).map((at, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-white/[0.02] border border-white/5 max-w-[220px]">
                                      <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-white/10 flex items-center justify-center shrink-0">
                                        <FileText size={14} className="text-accent-cyan" />
                                      </div>
                                      <div className="flex flex-col min-w-0 text-left">
                                        <span className="text-[10px] font-bold text-white truncate max-w-[130px]" title={at.name}>{at.name || 'Attachment'}</span>
                                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-none mt-0.5">
                                          {at.type.split('/')[1] || 'file'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="relative px-2 py-1 max-w-full">
                            <div className="flex items-center gap-1.5 mb-2.5 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 select-none">
                              <Sparkles size={10} className="text-accent-purple animate-pulse" />
                              <span>Lumora AI</span>
                            </div>
                            
                            <div className="relative z-10 text-[15px] md:text-[16px] leading-[1.75] text-zinc-200 font-medium tracking-tight whitespace-pre-wrap">
                              {renderMessageContent(msg.content)}
                            </div>

                            {msg.isImage && msg.imageUrl && (
                              <div className="mt-4 relative rounded-[2rem] overflow-hidden border border-white/10 group/img max-w-full md:max-w-lg shadow-2xl bg-zinc-950 flex flex-col">
                                <div className="relative aspect-square md:aspect-[4/3] bg-zinc-900 overflow-hidden rounded-[2rem]">
                                  <img 
                                    src={msg.imageUrl} 
                                    alt="Generated AI Artwork" 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                    <button 
                                      onClick={() => handleDownload(msg.imageUrl!)}
                                      className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-lg"
                                      title="Download Image"
                                    >
                                      <Download size={18} />
                                    </button>
                                    <button 
                                      onClick={() => window.open(msg.imageUrl!, '_blank')}
                                      className="w-12 h-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform border border-white/10 shadow-lg"
                                      title="View Fullsize"
                                    >
                                      <Maximize2 size={18} />
                                    </button>
                                  </div>
                                </div>
                                {msg.enhancedPrompt && (
                                  <div className="p-4 border-t border-white/[0.04] bg-[#0c0c0e]/80 backdrop-blur-md text-left space-y-1">
                                    <div className="flex items-center gap-1.5 text-accent-purple select-none">
                                      <Sparkles size={11} className="animate-pulse" />
                                      <span className="text-[9px] font-black uppercase tracking-[0.25em]">Enhanced Prompt</span>
                                    </div>
                                    <p className="text-[11px] text-zinc-400 font-medium leading-relaxed italic">
                                      "{msg.enhancedPrompt}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Toolbar actions */}
                            <div className="absolute -bottom-10 left-2 opacity-0 group-hover/message:opacity-100 transition-all duration-300 flex items-center gap-1 bg-[#09090c]/90 backdrop-blur-md border border-white/[0.06] rounded-xl p-1 shadow-lg z-25">
                               <button 
                                  onClick={() => { 
                                    navigator.clipboard.writeText(msg.content); 
                                    toast("Copied to clipboard", "success"); 
                                  }} 
                                  className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center"
                                  title="Copy Response"
                               >
                                  <Copy size={11} />
                               </button>
                               <button 
                                  onClick={() => {
                                    const userMessages = messages.filter(m => m.role === 'user');
                                    if (userMessages.length > 0) {
                                      const lastUserMsg = userMessages[userMessages.length - 1].content;
                                      setMessages(prev => prev.slice(0, i));
                                      handleSend(lastUserMsg);
                                    }
                                  }} 
                                  className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center"
                                  title="Regenerate Response"
                               >
                                  <RefreshCw size={11} />
                               </button>
                            </div>
                          </div>
                        )}
                        
                        <span className={cn(
                          "text-[8px] text-zinc-600 mt-2 block tracking-wider uppercase font-black px-2 select-none",
                          msg.role === 'user' ? "text-right" : "text-left"
                        )}>
                          {msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-5">
                       <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center animate-pulse border border-white/5 shadow-md">
                          <Sparkles size={16} className="text-purple-500 animate-pulse" />
                       </div>
                       <div className="flex flex-col justify-center">
                          {isGeneratingImage ? (
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-ping shrink-0" />
                                <span className="text-[11px] font-black text-white uppercase tracking-widest italic animate-pulse">Generating your masterpiece...</span>
                              </div>
                              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none">Invoking Flux.1 Schnell Engines (~2-6s)</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                               <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" />
                               <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:200ms]" />
                               <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:400ms]" />
                            </div>
                          )}
                       </div>
                    </motion.div>
                  )}
                </div>
              )}
           </div>
        </div>

        {/* Input box */}
        <div className="absolute bottom-0 left-0 right-0 z-50 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pointer-events-none sm:p-4 md:p-8">
           {/* Beautiful fading background behind the input container */}
           <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#060608] via-[#060608]/98 to-transparent pointer-events-none -z-10" />
           
           <div className="max-w-[850px] mx-auto relative group/input pointer-events-auto transition-all duration-500 hover:scale-[1.002] active:scale-[0.998] group-focus-within/input:scale-[1.01]">
              
               {/* Volumetric layered neon glow that reacts on focus/typing */}
               <div className={cn(
                  "absolute -inset-4 bg-gradient-to-r from-accent-purple/20 via-accent-cyan/10 to-accent-purple/20 rounded-[2.5rem] blur-3xl opacity-0 group-focus-within/input:opacity-80 transition-all duration-700 -z-10",
                  input.trim().length > 0 && "opacity-100 scale-105 duration-1000 from-accent-purple/30 via-accent-cyan/20 to-accent-purple/30"
               )} />
               <div className={cn(
                  "absolute -inset-1.5 bg-gradient-to-r from-accent-purple/15 to-accent-cyan/15 rounded-[2rem] blur-xl opacity-0 group-focus-within/input:opacity-90 transition-all duration-500 -z-10",
                  input.trim().length > 0 && "opacity-100 scale-102"
               )} />
               
               {/* Outer border wrapper (for pixel-perfect border gradient) */}
               <div className={cn(
                  "w-full rounded-[24px] p-[1.5px] transition-all duration-500 bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative",
                  "group-focus-within/input:from-purple-500/35 group-focus-within/input:via-indigo-500/20 group-focus-within/input:to-cyan-500/35",
                  input.trim().length > 0 && "from-purple-500/45 via-[#6366f1]/30 to-cyan-500/45"
               )}>
                  {/* Subtle top edge highlight */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent rounded-t-[24px] pointer-events-none z-10" />

                  {/* Inner glass content */}
                  <div className={cn(
                     "bg-[#07070c]/70 backdrop-blur-3xl rounded-[22.5px] p-4 md:p-5 pb-3 md:pb-3.5 flex flex-col gap-4 transition-all duration-500 relative overflow-hidden",
                     input.trim().length > 0 && "bg-[#090912]/80"
                  )}>
                     {/* Text area and main input section */}
                     <div className="flex items-start gap-4">
                        {/* File Attachment Button inside clean squircle container */}
                        <div className="relative z-10 pt-0.5 shrink-0">
                           <motion.button 
                             onClick={() => fileInputRef.current?.click()} 
                             whileHover={{ scale: 1.06 }}
                             whileTap={{ scale: 0.94 }}
                             className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-300 active:scale-95 group/attach relative overflow-hidden"
                             title="Upload Attachment"
                           >
                             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover/attach:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
                             <Paperclip size={19} className="group-hover/attach:rotate-12 group-hover/attach:scale-105 group-hover/attach:text-purple-400 transition-all duration-300" />
                             
                             {/* Attachment count badge */}
                             {attachments.length > 0 && (
                               <motion.div 
                                 initial={{ scale: 0 }}
                                 animate={{ scale: 1 }}
                                 className="absolute -top-1 -right-1 w-5.5 h-5.5 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-500 border-2 border-[#060608] flex items-center justify-center text-[9px] font-black text-white shadow-lg"
                               >
                                 {attachments.length}
                               </motion.div>
                             )}
                           </motion.button>
                           <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
                        </div>

                        {/* The text area container */}
                        <div className="flex-1 min-h-[48px] relative">
                           <AnimatePresence>
                            {showCommands && (
                              <motion.div 
                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                className="absolute bottom-full left-0 mb-4 w-full md:w-[350px] bg-[#0c0c10]/98 backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-1.5 shadow-[0_25px_50px_rgba(0,0,0,0.9)] z-[9999] overflow-hidden"
                              >
                                <div className="px-3 py-1.5 border-b border-white/5 mb-1.5 flex items-center justify-between relative z-10">
                                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Smart Commands</p>
                                  <div className="px-1 py-0.5 rounded bg-white/5 text-[8px] font-bold text-zinc-600">ESC</div>
                                </div>
                                <div className="flex flex-col gap-0.5 relative z-10">
                                  {SLASH_COMMANDS.map((cmd, idx) => (
                                    <button 
                                      key={cmd.id}
                                      onClick={() => executeCommand(cmd.id)}
                                      onMouseEnter={() => setSelectedCommandIndex(idx)}
                                      className={cn(
                                        "flex items-center gap-2.5 w-full text-left p-2.5 rounded-xl transition-all border border-transparent",
                                        selectedCommandIndex === idx ? "bg-white/5 border-white/[0.05]" : "hover:bg-white/5"
                                      )}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center shrink-0">
                                          {cmd.icon}
                                        </div>
                                        <div className="flex flex-col">
                                          <span className={cn("text-xs font-black transition-colors", selectedCommandIndex === idx ? "text-purple-400" : "text-white")}>{cmd.label}</span>
                                          <span className="text-[9px] font-semibold text-zinc-500">{cmd.desc}</span>
                                        </div>
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                           </AnimatePresence>
                           
                           <div className="flex flex-col w-full">
                             {/* File attachments layout */}
                             <AnimatePresence>
                               {attachments.length > 0 && (
                                 <motion.div 
                                   initial={{ opacity: 0, height: 0, y: 5 }} 
                                   animate={{ opacity: 1, height: "auto", y: 0 }} 
                                   exit={{ opacity: 0, height: 0, y: 5 }} 
                                   className="flex flex-wrap gap-2 pb-3 mb-2 border-b border-white/[0.04] overflow-hidden"
                                 >
                                    {attachments.map(at => (
                                      <motion.div 
                                        key={at.id} 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="relative flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors shadow-sm group/chip max-w-[200px]"
                                      >
                                        {at.preview ? (
                                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10">
                                            <img src={at.preview} className="w-full h-full object-cover" alt="" />
                                          </div>
                                        ) : (
                                          <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-white/10 flex items-center justify-center shrink-0">
                                            <FileText size={14} className="text-accent-cyan" />
                                          </div>
                                        )}
                                        <div className="flex flex-col min-w-0 text-left">
                                          <span className="text-[10px] font-bold text-white truncate max-w-[100px]">{at.name}</span>
                                          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-none mt-0.5">
                                            {at.type.split('/')[1] || 'file'}
                                          </span>
                                        </div>
                                        <button 
                                          onClick={() => setAttachments(prev => prev.filter(a => a.id !== at.id))} 
                                          className="w-4.5 h-4.5 rounded-md bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 flex items-center justify-center ml-2 transition-all opacity-0 group-hover/chip:opacity-100 active:scale-90"
                                          title="Remove File"
                                        >
                                          <X size={10} />
                                        </button>
                                      </motion.div>
                                    ))}
                                 </motion.div>
                               )}
                             </AnimatePresence>
                             
                             <textarea 
                                ref={textareaRef}
                                value={input} 
                                onChange={(e) => {
                                  handleInputChange(e);
                                  const target = e.target as HTMLTextAreaElement;
                                  target.style.height = 'auto';
                                  target.style.height = `${Math.min(target.scrollHeight, 300)}px`;
                                }}
                                onKeyDown={(e) => { 
                                   if (showCommands) {
                                     if (e.key === 'ArrowDown') {
                                       e.preventDefault();
                                       setSelectedCommandIndex(prev => (prev + 1) % SLASH_COMMANDS.length);
                                     } else if (e.key === 'ArrowUp') {
                                       e.preventDefault();
                                       setSelectedCommandIndex(prev => (prev - 1 + SLASH_COMMANDS.length) % SLASH_COMMANDS.length);
                                     } else if (e.key === 'Enter') {
                                       e.preventDefault();
                                       executeCommand(SLASH_COMMANDS[selectedCommandIndex].id);
                                     } else if (e.key === 'Escape') {
                                       setShowCommands(false);
                                     }
                                   } else {
                                     if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } 
                                     if (e.key === 'Escape') setShowCommands(false);
                                   }
                                }} 
                                placeholder="Ask anything... or press '/' for commands" 
                                className="w-full bg-transparent border-0 ring-0 outline-none focus:ring-0 focus:outline-none focus:border-transparent text-[15.5px] md:text-[16px] text-white placeholder-zinc-500/70 focus:placeholder-zinc-500/40 py-2.5 px-0.5 min-h-[48px] max-h-[300px] resize-none overflow-y-auto no-scrollbar font-medium relative z-10 leading-relaxed placeholder:font-medium placeholder:tracking-wide"
                                rows={1}
                             />
                           </div>
                        </div>

                        {/* Premium Action send button */}
                        <div className="relative z-10 shrink-0 pt-0.5">
                           <motion.button 
                             onClick={() => handleSend()} 
                             disabled={!input.trim() || isLoading} 
                             initial={{ scale: 0.95 }}
                             animate={{ 
                                scale: input.trim() && !isLoading ? 1 : 0.95,
                                boxShadow: input.trim() && !isLoading 
                                  ? "0 0 20px rgba(168,85,247,0.35), 0 0 40px rgba(6,182,212,0.15)" 
                                  : "none"
                             }}
                             whileHover={input.trim() && !isLoading ? { scale: 1.06, y: -1 } : {}}
                             whileTap={input.trim() && !isLoading ? { scale: 0.94 } : {}}
                             transition={{ type: "spring", stiffness: 400, damping: 15 }}
                             className={cn(
                                 "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0 border relative overflow-hidden group/send",
                                 input.trim() && !isLoading 
                                     ? "bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-500 border-transparent text-white cursor-pointer" 
                                     : "bg-white/[0.02] text-zinc-600 border-white/[0.04] cursor-not-allowed"
                             )}
                           >
                              {/* Sheen sweep animation overlay */}
                              {input.trim() && !isLoading && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/send:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
                              )}
                              
                              {isLoading ? (
                                <div className="w-4.5 h-4.5 border-[2px] border-zinc-400 border-t-black rounded-full animate-spin" />
                              ) : (
                                <ArrowUp size={20} strokeWidth={3} className={cn("transition-transform duration-300", input.trim() && "group-hover/send:translate-y-[-1px]")} />
                              )}
                           </motion.button>
                        </div>
                     </div>

                     {/* Dynamic glowing accent beam */}
                     <div className={cn(
                        "h-[1px] w-0 bg-gradient-to-r from-purple-500/60 via-cyan-400/80 to-indigo-500/60 transition-all duration-700 ease-out rounded-full opacity-0 pointer-events-none",
                        input.trim().length > 0 && "w-full opacity-100 duration-1000 shadow-[0_1px_8px_rgba(6,182,212,0.5)]"
                     )} />

                     {/* Micro footer actions panel inside input container */}
                     <div className="flex items-center justify-between border-t border-white/[0.03] pt-3 px-0.5 relative z-10 select-none">
                        <div className="flex items-center gap-3">
                           {/* Live active beacon */}
                           <div className="flex items-center gap-2">
                              <span className={cn(
                                "w-2 h-2 rounded-full transition-all duration-500 relative flex items-center justify-center",
                                input.trim().length > 0 ? "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" : "bg-zinc-600"
                              )}>
                                {input.trim().length > 0 && (
                                  <span className="absolute -inset-1 rounded-full bg-cyan-400/50 animate-ping opacity-75" />
                                )}
                              </span>
                              <span className={cn(
                                "text-[9.5px] font-black uppercase tracking-widest leading-none transition-colors duration-300",
                                input.trim().length > 0 ? "text-cyan-400" : "text-zinc-500"
                              )}>
                                {input.trim().length > 0 ? "Typing..." : "Ready"}
                              </span>
                           </div>
                           {input.trim().length > 0 && (
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider animate-in fade-in duration-300">
                                • {input.trim().length} chars
                              </span>
                           )}
                        </div>
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none hidden sm:inline">
                          Press Enter to Send
                        </span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Premium Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
              className="relative max-w-md w-full bg-[#0a0a0f]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden z-10"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[40px] rounded-full -z-10" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 blur-[40px] rounded-full -z-10" />

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.04]">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Sliders size={14} className="text-accent-purple" />
                  Chat Settings
                </h3>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Safe Mode Switch Option */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-wide">Creative Mode</h4>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
                      Relax safety parameters and NSFW filters. This unlocks deep imagination for creative writing and image generations.
                    </p>
                  </div>
                  <button 
                    onClick={() => toggleSafeMode(!safeMode)}
                    className={cn(
                      "w-12 h-6.5 rounded-full p-1 transition-colors duration-300 relative shrink-0 outline-none",
                      !safeMode ? "bg-purple-600" : "bg-zinc-800"
                    )}
                  >
                    <div className={cn(
                      "w-4.5 h-4.5 rounded-full bg-white transition-transform duration-300 shadow-md",
                      !safeMode ? "translate-x-5.5" : "translate-x-0"
                    )} />
                  </button>
                </div>

                <div className="h-px bg-white/[0.04]" />

                {/* Model Info Option */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-wide">AI Engine</h4>
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <Sparkles size={14} className="text-purple-400 animate-pulse" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-white tracking-wide uppercase italic">LUMORA-3.5-MAX</span>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none mt-1">Direct API Access</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 text-[8px] font-black uppercase tracking-widest">
                      Active
                    </span>
                  </div>
                </div>

                <div className="h-px bg-white/[0.04]" />

                {/* Clear Chat Short explanation */}
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-wide">Clear Chat History</h4>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
                      Clear current session messages. This cannot be undone.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsSettingsOpen(false);
                      if (messages.length === 0) {
                        toast("Nothing to clear.", "warning");
                      } else {
                        setShowClearConfirm(true);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
