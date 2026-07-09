"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Paperclip, 
  X, 
  Trash2, 
  Copy, 
  Check, 
  User, 
  Sparkles, 
  Share2, 
  PanelLeftClose, 
  PanelLeftOpen, 
  ArrowUp, 
  Send,
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
  Orbit,
  BriefcaseBusiness,
  Rocket,
  Flame,
  Zap,
  Layout,
  Layers,
  Code,
  Terminal,
  GraduationCap,
  BookOpen,
  ImagePlus,
  Pencil,
  GitBranch,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat, cleanTitle, type ChatMode, type Message } from "@/components/providers/ChatProvider";
import { ExismicLogo } from "./ChatSidebar";
import { ExismicMark } from "@/components/ui/ExismicLogo";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const SLASH_COMMANDS = [
  { id: 'new', icon: <Plus size={16} className="text-cyan-400" />, label: 'New Conversation', desc: 'Start a fresh creative session' },
  { id: 'clear', icon: <Trash2 size={16} className="text-red-400" />, label: 'Clear Chat', desc: 'Remove all messages from this view' },
  { id: 'summarize', icon: <FileText size={16} className="text-emerald-400" />, label: 'Summarize Chat', desc: 'Generate a brief summary of the conversation' },
  { id: 'export', icon: <Share2 size={16} className="text-orange-400" />, label: 'Export Chat', desc: 'Save this conversation as a document' },
  { id: 'remove-bg', icon: <Layers size={16} className="text-fuchsia-300" />, label: 'Remove Background', desc: 'Make an attached image transparent' },
  { id: 'compress-image', icon: <Minimize2 size={16} className="text-cyan-300" />, label: 'Compress Image', desc: 'Reduce image size while preserving quality' },
  { id: 'convert-image', icon: <RefreshCw size={16} className="text-violet-300" />, label: 'Convert Image', desc: 'Convert an image to WebP' },
  { id: 'resize-image', icon: <Maximize2 size={16} className="text-blue-300" />, label: 'Resize Image', desc: 'Resize an image to exact dimensions' },
];

const CHAT_MODES: { id: ChatMode; label: string; short: string; description: string }[] = [
  { id: "auto", label: "Auto Mode", short: "Auto", description: "Detects the best mode per request" },
  { id: "default", label: "Default", short: "Default", description: "Balanced Exismic replies" },
  { id: "coding", label: "Coding Mode", short: "Coding", description: "Code, architecture, debugging" },
  { id: "research", label: "Research Mode", short: "Research", description: "Careful analysis and tradeoffs" },
  { id: "business", label: "Business Mode", short: "Business", description: "Strategy, execution, metrics" },
  { id: "creative", label: "Creative Mode", short: "Creative", description: "Original concepts and polish" },
  { id: "fast", label: "Fast Answers", short: "Fast", description: "Short, direct responses" },
];

function formatArtifactSize(bytes?: number) {
  if (!bytes || bytes < 1) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const getChatModeVisual = (modeId?: ChatMode) => {
  switch (modeId) {
    case "auto":
      return {
        icon: Orbit,
        text: "text-cyan-200",
        border: "border-cyan-300/25",
        bg: "bg-cyan-300/10",
        glow: "shadow-[0_0_20px_rgba(34,211,238,0.18)]",
        gradient: "from-cyan-400/18 via-purple-500/14 to-fuchsia-400/12",
        dot: "bg-cyan-300",
      };
    case "coding":
      return {
        icon: Terminal,
        text: "text-emerald-200",
        border: "border-emerald-300/25",
        bg: "bg-emerald-300/10",
        glow: "shadow-[0_0_20px_rgba(52,211,153,0.16)]",
        gradient: "from-emerald-400/16 via-cyan-400/10 to-blue-400/10",
        dot: "bg-emerald-300",
      };
    case "research":
      return {
        icon: Search,
        text: "text-sky-200",
        border: "border-sky-300/25",
        bg: "bg-sky-300/10",
        glow: "shadow-[0_0_20px_rgba(56,189,248,0.15)]",
        gradient: "from-sky-400/16 via-blue-500/12 to-violet-400/10",
        dot: "bg-sky-300",
      };
    case "business":
      return {
        icon: BriefcaseBusiness,
        text: "text-amber-200",
        border: "border-amber-300/25",
        bg: "bg-amber-300/10",
        glow: "shadow-[0_0_20px_rgba(251,191,36,0.14)]",
        gradient: "from-amber-400/15 via-orange-400/10 to-purple-400/10",
        dot: "bg-amber-300",
      };
    case "creative":
      return {
        icon: Palette,
        text: "text-fuchsia-200",
        border: "border-fuchsia-300/25",
        bg: "bg-fuchsia-300/10",
        glow: "shadow-[0_0_20px_rgba(217,70,239,0.16)]",
        gradient: "from-fuchsia-400/16 via-pink-400/12 to-cyan-400/10",
        dot: "bg-fuchsia-300",
      };
    case "fast":
      return {
        icon: Zap,
        text: "text-yellow-200",
        border: "border-yellow-300/25",
        bg: "bg-yellow-300/10",
        glow: "shadow-[0_0_20px_rgba(250,204,21,0.14)]",
        gradient: "from-yellow-300/15 via-cyan-300/10 to-purple-400/10",
        dot: "bg-yellow-300",
      };
    default:
      return {
        icon: Brain,
        text: "text-purple-200",
        border: "border-purple-300/25",
        bg: "bg-purple-300/10",
        glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)]",
        gradient: "from-purple-400/15 via-cyan-400/10 to-white/5",
        dot: "bg-purple-300",
      };
  }
};

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
    isUploading,
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
    studentMode,
    toggleStudentMode,
    chatMode,
    updateChatMode,
    chatSettings,
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
    editAndResendMessage,
    branchConversation,
    rememberMessage,
    stopGeneration,
    confirmDeleteSession,
    rollSuggestions,
    processFiles,
    toast
  } = useChat();

  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const firstAttachment = attachments[0];
  const attachedImageCount = attachments.filter(item => item.type.startsWith("image/")).length;
  const canSubmit = (input.trim().length > 0 || attachments.length > 0) && !isUploading;

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
      const blob = new Blob([`EXISMIC CHAT EXPORT\nGenerated: ${new Date().toLocaleString()}\n\n${text}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exismic-chat-${new Date().getTime()}.txt`;
      a.click();
      toast("Chat Exported Successfully", "success");
    } else if (['remove-bg', 'compress-image', 'convert-image', 'resize-image'].includes(cmdId)) {
      const prompts: Record<string, string> = {
        'remove-bg': 'Remove the background from this image.',
        'compress-image': 'Compress this image to 80% quality.',
        'convert-image': 'Convert this image into WebP.',
        'resize-image': 'Resize this image to 1080 x 1080.',
      };
      setInput(prompts[cmdId]);
      window.setTimeout(() => textareaRef.current?.focus(), 0);

      const hasImage = attachments.some(item => item.type.startsWith('image/'))
        || messages.some(message => message.attachments?.some(item => item.type.startsWith('image/')));
      if (!hasImage) {
        window.setTimeout(() => fileInputRef.current?.click(), 80);
      }
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast("Link Copied to Clipboard!", "success");
    }
  };

  const handleDownload = async (url: string, filename = "exismic-chat-generation.png") => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
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

  const handleGenerateExampleImage = (content: string) => {
    const concept = content.replace(/\s+/g, " ").slice(0, 700);
    handleSend(
      `Generate a clear educational example image that helps students understand this explanation. Focus on the main concept only: ${concept}`,
      { forceImage: true }
    );
  };

  const startEditingMessage = (index: number, content: string) => {
    setEditingMessageIndex(index);
    setEditingDraft(content);
  };

  const cancelEditingMessage = () => {
    setEditingMessageIndex(null);
    setEditingDraft("");
  };

  const saveEditedMessage = async () => {
    if (editingMessageIndex === null || !editingDraft.trim()) return;
    const index = editingMessageIndex;
    const content = editingDraft;
    cancelEditingMessage();
    await editAndResendMessage(index, content);
  };

  const runResponseAction = (action: "shorter" | "deeper" | "steps" | "image", content: string) => {
    const excerpt = content.replace(/\s+/g, " ").slice(0, 1000);

    if (action === "image") {
      handleSend(
        `Generate a clear visual image that explains the main idea from this response: ${excerpt}`,
        { forceImage: true }
      );
      return;
    }

    const prompts = {
      shorter: `Rewrite your last answer in a shorter, sharper version. Keep only the most important points:\n\n${excerpt}`,
      deeper: `Explain your last answer in more depth with a practical example and important caveats:\n\n${excerpt}`,
      steps: `Turn your last answer into a clean step-by-step checklist with clear action items:\n\n${excerpt}`,
    };

    handleSend(prompts[action]);
  };

  const getFollowUpChips = (message: Message) => {
    if (message.isImage) return ["Create a variation", "Explain the prompt", "Make it more premium"];
    if (message.studentMode) return ["Give me a quiz", "Explain like I am new", "Show a real example"];

    const text = message.content.toLowerCase();
    if (text.includes("code") || text.includes("api") || text.includes("function")) {
      return ["Show code example", "Find edge cases", "Make it production-ready"];
    }
    if (text.includes("plan") || text.includes("strategy") || text.includes("steps")) {
      return ["Make a checklist", "Prioritize this", "What can go wrong?"];
    }
    return ["Summarize this", "Go deeper", "Turn into steps"];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    if (val.startsWith('/')) {
      setSelectedCommandIndex(0);
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
      void processFiles(files);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length > 0) {
      void processFiles(files);
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

        if (/^\s*(={4,}|-{4,})\s*$/.test(line)) {
          return (
            <div key={li} className="my-5 h-px w-full bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent" />
          );
        }
        
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

  const isAssistantTyping = messages.some(message => message.role === "assistant" && message.isTyping);
  const activeChatMode = CHAT_MODES.find(mode => mode.id === chatMode) || CHAT_MODES[0];
  const activeModeVisual = getChatModeVisual(activeChatMode.id);
  const ActiveModeIcon = activeModeVisual.icon;

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
          : "w-full h-[calc(100dvh-120px)] min-h-[520px] md:min-h-[560px] bg-[#0c0c10]/90 backdrop-blur-3xl border border-white/[0.05] rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] shadow-2xl relative"
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
        <div className="min-h-14 px-2.5 sm:px-4 md:px-5 border-b border-white/[0.05] flex items-center justify-between bg-[#08080a]/65 backdrop-blur-md shrink-0 z-50">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button 
              onClick={() => {
                setIsModeMenuOpen(false);
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

              {studentMode && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 text-[8px] font-black uppercase tracking-widest text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.12)] shrink-0">
                  <BookOpen size={8.5} className="text-cyan-300" />
                  <span>Student Mode</span>
                </div>
              )}
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 pointer-events-none">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.04] backdrop-blur-md">
              <div className="w-1 h-1 rounded-full bg-accent-purple animate-pulse" />
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{agentStatus}</span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsModeMenuOpen((open) => !open)}
                className={cn(
                  "group/mode flex min-h-10 min-w-[132px] items-center justify-between gap-2 overflow-hidden rounded-xl border px-3 text-zinc-300 shadow-[0_10px_30px_rgba(0,0,0,0.24)] transition-all active:scale-95",
                  isModeMenuOpen
                    ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
                    : "border-white/5 bg-white/[0.035] hover:border-cyan-300/15 hover:bg-white/[0.06] hover:text-white"
                )}
                title="Select Chat Mode"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className={cn("relative flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border", activeModeVisual.border, activeModeVisual.bg)}>
                    <ActiveModeIcon size={13} className={activeModeVisual.text} />
                    <span className={cn("absolute inset-0 rounded-lg blur-md opacity-0 transition-opacity group-hover/mode:opacity-60", activeModeVisual.bg)} />
                  </span>
                  <span className="truncate text-[10px] font-black uppercase tracking-[0.14em]">
                    {activeChatMode.short}
                  </span>
                </span>
                <ChevronDown size={13} className={cn("text-zinc-500 transition-transform", isModeMenuOpen && "rotate-180 text-cyan-200")} />
              </button>

              <AnimatePresence>
                {isModeMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-[calc(100%+0.6rem)] z-[200] w-[270px] overflow-hidden rounded-2xl border border-white/10 bg-[#08080d]/95 p-1.5 shadow-[0_24px_80px_rgba(0,0,0,0.72),0_0_45px_rgba(34,211,238,0.08)] backdrop-blur-2xl"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
                    {CHAT_MODES.map((mode) => {
                      const visual = getChatModeVisual(mode.id);
                      const ModeIcon = visual.icon;
                      const selected = chatMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => {
                            updateChatMode(mode.id);
                            setIsModeMenuOpen(false);
                          }}
                          className={cn(
                            "group/item relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-left transition-all",
                            selected
                              ? cn("bg-gradient-to-r text-white", visual.gradient)
                              : "text-zinc-400 hover:bg-white/[0.045] hover:text-white"
                          )}
                        >
                          {selected && (
                            <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                          )}
                          <span className={cn(
                            "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all",
                            selected
                              ? cn(visual.border, visual.bg, visual.text, visual.glow)
                              : "border-white/5 bg-white/[0.025] text-zinc-500 group-hover/item:text-cyan-200"
                          )}>
                            <ModeIcon size={13} />
                            {selected && <span className={cn("absolute inset-0 rounded-xl blur-lg", visual.bg)} />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[10px] font-black uppercase tracking-[0.16em]">
                              {mode.short}
                            </span>
                            <span className="mt-0.5 block truncate text-[10px] font-semibold text-zinc-500 group-hover/item:text-zinc-400">
                              {mode.description}
                            </span>
                          </span>
                          {selected && (
                            <span className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_10px_currentColor]", visual.dot, visual.text)} />
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => {
                setIsModeMenuOpen(false);
                toggleStudentMode(!studentMode);
              }}
              className={cn(
                "min-h-10 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-[0.14em] transition-all active:scale-95",
                studentMode
                  ? "bg-gradient-to-r from-cyan-500/18 to-purple-500/18 border-cyan-400/25 text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.14)]"
                  : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              )}
              title="Toggle Student Mode"
            >
              <GraduationCap size={13} strokeWidth={2.5} />
              <span className="hidden lg:inline">Student Mode</span>
            </button>

            <button 
              onClick={() => {
                setIsModeMenuOpen(false);
                startNewChat();
              }}
              className="min-h-10 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-zinc-300 hover:text-white hover:bg-white/10 transition-all active:scale-95"
              title="New Chat"
            >
              <Plus size={12} strokeWidth={2.5} />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            <button 
              onClick={() => {
                setIsModeMenuOpen(false);
                handleShare();
              }}
              className="min-h-10 min-w-10 rounded-lg bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center"
              title="Share Chat Link"
            >
              <Share2 size={13} />
            </button>

            <div className="h-3 w-px bg-white/10 mx-0.5" />

            <button 
              onClick={() => {
                setIsModeMenuOpen(false);
                setIsImmersive(!isImmersive);
              }}
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
              onClick={() => {
                setIsModeMenuOpen(false);
                setIsSettingsOpen(true);
              }}
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
        </div>

        {/* Message flow container */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-2.5 sm:px-4 md:px-6 custom-scrollbar relative">
           <div className="max-w-[850px] mx-auto min-h-full flex flex-col pt-5 sm:pt-8">
              {isSessionLoading ? (
                <ChatSkeleton />
              ) : messages.length === 0 ? (
                
                // Welcome Screen
                <div className="flex-1 flex flex-col items-center justify-start 2xl:justify-center pt-6 sm:pt-8 pb-56 sm:pb-60 md:pb-64 text-center px-1 sm:px-4">
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.96, y: 15 }} 
                     animate={{ opacity: 1, scale: 1, y: 0 }} 
                     transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} 
                     className="space-y-5 sm:space-y-6 mb-8 sm:mb-12"
                   >
                      <div className="relative inline-block group">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-accent-purple/35 to-accent-cyan/35 blur-xl opacity-80 group-hover:opacity-100 transition-opacity rounded-full animate-pulse-glow" />
                        <ExismicLogo size={88} showText={false} className="mx-auto relative z-10 hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="space-y-3 flex flex-col items-center mt-6">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-[1.05] sm:leading-[1.1] px-2">
                          {studentMode ? (
                            <>Learn Anything <span className="animated-gradient-text">Clearly</span>.</>
                          ) : (
                            <>Unlimited <span className="animated-gradient-text">Creativity</span>.</>
                          )}
                        </h2>
                        <p className="text-zinc-500 text-sm md:text-base font-medium max-w-md mx-auto drop-shadow-md">
                          {studentMode
                            ? "Ask a topic, upload a reference, or request a step-by-step lesson with examples and practice."
                            : "Define the Future. What shall we build today?"}
                        </p>
                      </div>
                   </motion.div>                    {/* Starter cards suggestions */}
                    <div className="w-full max-w-5xl mt-2 mb-4 sm:mb-6 px-1">
                       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-5.5 px-1 sm:px-3">
                          <div className="flex items-center gap-2 min-w-0">
                             <div className="relative flex items-center justify-center">
                               <Sparkles size={14} className="text-accent-cyan animate-pulse absolute blur-[3px]" />
                               <Sparkles size={14} className="text-accent-cyan animate-pulse relative z-10" />
                             </div>
                             <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.16em] sm:tracking-[0.25em] bg-clip-text text-transparent bg-gradient-to-r from-zinc-400 via-zinc-100 to-zinc-400 truncate">Suggested Workflows</span>
                          </div>
                          <button 
                            onClick={rollSuggestions}
                            disabled={isRerolling}
                            className="flex min-h-10 w-fit items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.16em] sm:tracking-[0.2em] text-zinc-400 hover:text-white transition-all duration-300 active:scale-95 bg-white/[0.02] hover:bg-white/5 border border-white/5 hover:border-purple-500/30 hover:shadow-[0_0_15px_rgba(168,85,247,0.1)] rounded-xl px-3 py-2"
                            title="Show different suggestions"
                          >
                            <RefreshCw size={10} className={cn("text-zinc-400 transition-colors duration-300", isRerolling && "animate-spin text-accent-purple")} />
                            Reroll
                          </button>
                       </div>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <AnimatePresence mode="sync">
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
                                       "group min-h-[92px] p-4 sm:p-4.5 rounded-2xl bg-[#0b0b0f]/45 backdrop-blur-xl border border-white/[0.05] hover:bg-[#0e0e16]/80 hover:border-purple-500/25 transition-all duration-500 text-left flex items-start gap-3 sm:gap-4 relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.4)] md:hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.15),0_10px_35px_-10px_rgba(6,182,212,0.12)] md:hover:-translate-y-1 md:hover:scale-[1.015] active:scale-[0.99] touch-manipulation"
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
                <div className="space-y-7 sm:space-y-10 md:space-y-12 pb-44">
                  {messages.map((msg, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 15, scale: 0.98 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.75 }}
                      className={cn("flex gap-2.5 sm:gap-4 md:gap-5 w-full group/message", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}
                    >
                      {/* Avatar */}
                      <div className="flex flex-col items-center mt-1 shrink-0">
                        {msg.role === 'assistant' ? (
                          <div className="relative shrink-0">
                             <ExismicMark size={40} />
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
                        "flex flex-col max-w-[calc(100%-3.25rem)] sm:max-w-[85%] md:max-w-[78%] relative min-w-0", 
                        msg.role === 'user' ? "items-end" : "items-start"
                      )}>
                        {msg.role === 'user' ? (
                          <div className="relative p-[1px] bg-white/[0.04] group-hover/message:bg-white/[0.08] transition-all duration-500 rounded-2xl sm:rounded-3xl rounded-tr-md shadow-xl max-w-full">
                            <div className="relative px-4 py-3.5 sm:px-6 sm:py-4 bg-[#0d0d12]/90 backdrop-blur-xl text-zinc-100 rounded-[calc(1rem-1px)] sm:rounded-[calc(1.5rem-1px)] rounded-tr-[calc(0.4rem-1px)]">
                              {editingMessageIndex === i ? (
                                <div className="relative z-10 min-w-[min(70vw,520px)] space-y-3">
                                  <textarea
                                    value={editingDraft}
                                    onChange={(event) => setEditingDraft(event.target.value)}
                                    onKeyDown={(event) => {
                                      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                                        event.preventDefault();
                                        saveEditedMessage();
                                      }
                                      if (event.key === "Escape") {
                                        event.preventDefault();
                                        cancelEditingMessage();
                                      }
                                    }}
                                    className="min-h-[110px] w-full resize-y rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-[14.5px] font-medium leading-relaxed text-white outline-none transition focus:border-cyan-300/30 focus:ring-2 focus:ring-cyan-300/10"
                                    autoFocus
                                  />
                                  <div className="flex flex-wrap items-center justify-end gap-2">
                                    <button
                                      onClick={cancelEditingMessage}
                                      className="min-h-9 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-[9px] font-black uppercase tracking-widest text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={saveEditedMessage}
                                      disabled={!editingDraft.trim() || isLoading}
                                      className="min-h-9 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 px-4 text-[9px] font-black uppercase tracking-widest text-white shadow-[0_0_24px_rgba(34,211,238,0.18)] transition hover:brightness-110 active:scale-95 disabled:opacity-50"
                                    >
                                      Save & Retry
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="relative z-10 text-[14.5px] sm:text-[15px] md:text-[15.5px] leading-[1.65] sm:leading-[1.7] font-medium tracking-tight whitespace-pre-wrap break-words">
                                  {renderMessageContent(msg.content)}
                                </div>
                              )}

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

                            {editingMessageIndex !== i && (
                              <div className="mt-2 flex flex-wrap justify-end gap-2">
                                <button
                                  onClick={() => branchConversation(i)}
                                  disabled={isLoading}
                                  className="flex min-h-9 items-center gap-1.5 rounded-xl border border-white/[0.06] bg-[#09090c]/90 px-3 text-[9px] font-black uppercase tracking-widest text-zinc-500 opacity-100 shadow-lg backdrop-blur-md transition-all hover:bg-cyan-300/10 hover:text-cyan-100 active:scale-95 disabled:opacity-45 sm:opacity-0 sm:group-hover/message:opacity-100"
                                  title="Branch from here"
                                >
                                  <GitBranch size={11} />
                                  Branch
                                </button>
                                <button
                                  onClick={() => rememberMessage(msg.content)}
                                  disabled={isLoading}
                                  className="flex min-h-9 items-center gap-1.5 rounded-xl border border-white/[0.06] bg-[#09090c]/90 px-3 text-[9px] font-black uppercase tracking-widest text-zinc-500 opacity-100 shadow-lg backdrop-blur-md transition-all hover:bg-purple-300/10 hover:text-purple-100 active:scale-95 disabled:opacity-45 sm:opacity-0 sm:group-hover/message:opacity-100"
                                  title="Save this to AI memory"
                                >
                                  <Brain size={11} />
                                  Remember
                                </button>
                                <button
                                  onClick={() => startEditingMessage(i, msg.content)}
                                  disabled={isLoading}
                                  className="flex min-h-9 items-center gap-1.5 rounded-xl border border-white/[0.06] bg-[#09090c]/90 px-3 text-[9px] font-black uppercase tracking-widest text-zinc-500 opacity-100 shadow-lg backdrop-blur-md transition-all hover:bg-white/[0.06] hover:text-white active:scale-95 disabled:opacity-45 sm:opacity-0 sm:group-hover/message:opacity-100"
                                  title="Edit and retry from here"
                                >
                                  <Pencil size={11} />
                                  Edit
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (() => {
                            const messageMode = msg.chatMode ? (CHAT_MODES.find(mode => mode.id === msg.chatMode) || CHAT_MODES[1]) : null;
                            const messageVisual = getChatModeVisual(msg.chatMode);
                            const MessageModeIcon = messageVisual.icon;
                            const showDetectedMode = !msg.studentMode && messageMode && msg.chatMode !== "default";

                            return (
                          <div className={cn(
                            "relative max-w-full min-w-0 rounded-3xl border px-4 py-3.5 sm:px-5 sm:py-4 transition-all duration-500",
                            msg.isTyping
                              ? "border-cyan-300/15 bg-cyan-300/[0.035] shadow-[0_0_32px_rgba(34,211,238,0.08)]"
                              : "border-white/[0.04] bg-white/[0.018] shadow-[0_18px_55px_rgba(0,0,0,0.18)]"
                          )}>
                            {showDetectedMode && (
                              <motion.div
                                initial={{ opacity: 0, y: -5, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={cn(
                                  "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em]",
                                  messageVisual.border,
                                  messageVisual.bg,
                                  messageVisual.text,
                                  messageVisual.glow
                                )}
                              >
                                <MessageModeIcon size={10.5} />
                                <span>Auto detected {messageMode.short}</span>
                              </motion.div>
                            )}

                            <div className="flex flex-wrap items-center gap-1.5 mb-2.5 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 select-none">
                              <Sparkles size={10} className="text-accent-purple animate-pulse" />
                              <span>{msg.studentMode ? "Exismic Tutor" : "Exismic Ai"}</span>
                              {msg.studentMode && (
                                <span className="ml-1 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[8px] tracking-[0.2em] text-cyan-200">
                                  Student Mode
                                </span>
                              )}
                              {showDetectedMode && (
                                <span className={cn("ml-1 rounded-full border px-2 py-0.5 text-[8px] tracking-[0.2em]", messageVisual.border, messageVisual.bg, messageVisual.text)}>
                                  {messageMode.short}
                                </span>
                              )}
                            </div>
                            
                            <div className={cn(
                              "relative z-10 text-[14.5px] sm:text-[15px] md:text-[16px] leading-[1.7] md:leading-[1.75] font-medium tracking-tight whitespace-pre-wrap break-words transition-all duration-300",
                              msg.isTyping ? "text-zinc-100" : "text-zinc-200"
                            )}>
                              {msg.isTyping && !msg.content.trim() ? (
                                <span className="inline-flex items-center gap-2 text-zinc-400">
                                  <span>Exismic is typing</span>
                                  <span className="flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-bounce" />
                                    <span className="h-1.5 w-1.5 rounded-full bg-purple-300 animate-bounce [animation-delay:140ms]" />
                                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce [animation-delay:280ms]" />
                                  </span>
                                </span>
                              ) : (
                                <>
                                  {renderMessageContent(msg.content)}
                                  {msg.isTyping && (
                                    <span className="ml-1 inline-block h-5 w-[2px] translate-y-1 rounded-full bg-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.75)] animate-pulse" />
                                  )}
                                </>
                              )}
                            </div>

                            {msg.toolRun && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 overflow-hidden rounded-lg border border-cyan-300/15 bg-[#080a10] shadow-[0_22px_55px_rgba(0,0,0,0.38),0_0_30px_rgba(34,211,238,0.06)]"
                              >
                                <div className="h-px bg-gradient-to-r from-fuchsia-400/70 via-violet-400/70 to-cyan-300/70" />
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
                                  <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-300/15 bg-cyan-300/[0.07] text-cyan-200">
                                      <Boxes size={18} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="truncate text-[12px] font-black uppercase tracking-[0.1em] text-white">
                                        {msg.toolRun.label}
                                      </p>
                                      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                                        {msg.toolRun.priority ? "Priority processing" : msg.toolRun.processingLabel || "Completed"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="inline-flex min-h-8 items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.07] px-3 text-[8px] font-black uppercase tracking-[0.16em] text-emerald-200">
                                    <Check size={11} />
                                    Completed
                                  </div>
                                </div>

                                <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden bg-[linear-gradient(45deg,rgba(255,255,255,0.025)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.025)_75%),linear-gradient(45deg,rgba(255,255,255,0.025)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.025)_75%)] bg-[length:24px_24px] bg-[position:0_0,12px_12px] p-4">
                                  <img
                                    src={msg.toolRun.resultUrl}
                                    alt={`${msg.toolRun.label} result`}
                                    className="max-h-[360px] max-w-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.45)]"
                                  />
                                </div>

                                <div className="flex flex-col gap-3 border-t border-white/[0.06] p-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {msg.toolRun.format && (
                                      <span className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-zinc-400">
                                        {msg.toolRun.format}
                                      </span>
                                    )}
                                    {msg.toolRun.width && msg.toolRun.height && (
                                      <span className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-zinc-400">
                                        {msg.toolRun.width} x {msg.toolRun.height}
                                      </span>
                                    )}
                                    {formatArtifactSize(msg.toolRun.size) && (
                                      <span className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-zinc-400">
                                        {formatArtifactSize(msg.toolRun.size)}
                                      </span>
                                    )}
                                    <span className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-zinc-400">
                                      {msg.toolRun.credits ? `${msg.toolRun.credits} credit` : "Free"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => window.open(msg.toolRun!.resultUrl, "_blank")}
                                      className="flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035] text-zinc-400 transition hover:border-white/15 hover:text-white"
                                      title="Open result"
                                    >
                                      <Maximize2 size={15} />
                                    </button>
                                    <button
                                      onClick={() => handleDownload(msg.toolRun!.resultUrl, msg.toolRun!.downloadName)}
                                      className="flex min-h-10 items-center gap-2 rounded-lg border border-cyan-300/20 bg-gradient-to-r from-violet-500/90 to-cyan-500/90 px-4 text-[9px] font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_28px_rgba(34,211,238,0.14)] transition hover:brightness-110 active:scale-95"
                                    >
                                      <Download size={14} />
                                      Download
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}

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
                                      &quot;{msg.enhancedPrompt}&quot;
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Toolbar actions */}
                            <div className="mt-4 flex w-fit max-w-full flex-wrap items-center gap-1 rounded-xl border border-white/[0.06] bg-[#09090c]/90 p-1 opacity-100 shadow-lg backdrop-blur-md transition-all duration-300 sm:opacity-70 sm:group-hover/message:opacity-100">
                               <button 
                                  onClick={() => { 
                                    navigator.clipboard.writeText(msg.content); 
                                    toast("Copied to clipboard", "success"); 
                                  }} 
                                  className="min-h-9 min-w-9 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center"
                                  title="Copy Response"
                               >
                                  <Copy size={11} />
                               </button>
                               <button
                                  onClick={() => branchConversation(i)}
                                  disabled={isLoading}
                                  className="min-h-9 rounded-lg px-2.5 text-zinc-500 hover:text-cyan-100 hover:bg-cyan-300/10 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                                  title="Branch From Here"
                               >
                                  <GitBranch size={11} />
                                  <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">Branch</span>
                               </button>
                               <button
                                  onClick={() => rememberMessage(msg.content)}
                                  disabled={isLoading || msg.isTyping}
                                  className="min-h-9 rounded-lg px-2.5 text-zinc-500 hover:text-purple-100 hover:bg-purple-300/10 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                                  title="Save Response To Memory"
                               >
                                  <Brain size={11} />
                                  <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">Remember</span>
                               </button>
                               {!msg.isTyping && !msg.isImage && !msg.toolRun && (
                                 <>
                                   <button
                                      onClick={() => runResponseAction("shorter", msg.content)}
                                      disabled={isLoading}
                                      className="min-h-9 rounded-lg px-2.5 text-zinc-500 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center disabled:opacity-50"
                                      title="Make Shorter"
                                   >
                                      <span className="text-[9px] font-black uppercase tracking-widest">Shorter</span>
                                   </button>
                                   <button
                                      onClick={() => runResponseAction("deeper", msg.content)}
                                      disabled={isLoading}
                                      className="min-h-9 rounded-lg px-2.5 text-zinc-500 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center disabled:opacity-50"
                                      title="Explain More"
                                   >
                                      <span className="text-[9px] font-black uppercase tracking-widest">Deeper</span>
                                   </button>
                                   <button
                                      onClick={() => runResponseAction("steps", msg.content)}
                                      disabled={isLoading}
                                      className="min-h-9 rounded-lg px-2.5 text-zinc-500 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center disabled:opacity-50"
                                      title="Turn Into Steps"
                                   >
                                      <span className="text-[9px] font-black uppercase tracking-widest">Steps</span>
                                   </button>
                                 </>
                               )}
                               {msg.studentMode && !msg.isImage && msg.content.trim().length > 80 && (
                                 <button
                                    onClick={() => handleGenerateExampleImage(msg.content)}
                                    disabled={isLoading}
                                    className="min-h-9 rounded-lg px-2.5 text-cyan-300 hover:text-white hover:bg-cyan-400/10 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                                    title="Generate Example Image"
                                 >
                                    <ImagePlus size={11} />
                                    <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">Example Image</span>
                                 </button>
                               )}
                               {!msg.toolRun && <button
                                  onClick={() => {
                                    const userMessages = messages.filter(m => m.role === 'user');
                                    if (userMessages.length > 0) {
                                      const lastUserMsg = userMessages[userMessages.length - 1].content;
                                      setMessages(prev => prev.slice(0, i));
                                      handleSend(lastUserMsg);
                                    }
                                  }} 
                                  className="min-h-9 min-w-9 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center"
                                  title="Regenerate Response"
                               >
                                  <RefreshCw size={11} />
                               </button>}
                            </div>

                            {chatSettings.smartFollowUps && i === messages.length - 1 && !msg.isTyping && !msg.toolRun && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {getFollowUpChips(msg).map((chip) => (
                                  <button
                                    key={chip}
                                    onClick={() => handleSend(`${chip}: ${msg.content.slice(0, 900)}`)}
                                    disabled={isLoading}
                                    className="min-h-9 rounded-full border border-white/[0.06] bg-white/[0.025] px-3 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400 transition-all hover:border-cyan-300/25 hover:bg-cyan-300/10 hover:text-cyan-100 active:scale-95 disabled:opacity-50"
                                  >
                                    {chip}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                            );
                          })()
                        }
                        
                        <span className={cn(
                          "text-[8px] text-zinc-600 mt-2 block tracking-wider uppercase font-black px-2 select-none",
                          msg.role === 'user' ? "text-right" : "text-left"
                        )}>
                          {msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && !isAssistantTyping && (
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
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" />
                                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:200ms]" />
                                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:400ms]" />
                                </div>
                                <span className="text-[11px] font-black text-white uppercase tracking-widest italic animate-pulse">{agentStatus}</span>
                              </div>
                              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none">Preparing a polished response</span>
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
                     "bg-[#07070c]/70 backdrop-blur-3xl rounded-[20px] sm:rounded-[22.5px] p-3 sm:p-4 md:p-5 pb-3 md:pb-3.5 flex flex-col gap-3 sm:gap-4 transition-all duration-500 relative overflow-visible",
                     input.trim().length > 0 && "bg-[#090912]/80"
                  )}>
                     {/* Text area and main input section */}
                     <div className="flex items-start gap-2.5 sm:gap-4">
                        {/* File Attachment Button inside clean squircle container */}
                        <div className="relative z-10 pt-0.5 shrink-0">
                           <motion.button 
                             onClick={() => fileInputRef.current?.click()} 
                             disabled={isUploading}
                             whileHover={{ scale: 1.06 }}
                             whileTap={{ scale: 0.94 }}
                             className={cn(
                               "w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] border flex items-center justify-center transition-all duration-300 active:scale-95 group/attach relative overflow-hidden touch-manipulation disabled:cursor-wait disabled:opacity-70",
                               attachments.length > 0
                                 ? "border-cyan-300/25 bg-[#080b11] text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]"
                                 : "border-white/[0.06] bg-white/[0.025] text-zinc-400 hover:border-cyan-400/20 hover:bg-cyan-400/[0.06] hover:text-cyan-100 hover:shadow-[0_0_20px_rgba(34,211,238,0.12)]"
                             )}
                             title={attachments.length > 0 ? "Add another file" : "Upload images or text files"}
                           >
                             {isUploading ? (
                               <RefreshCw size={18} className="relative z-10 animate-spin text-cyan-300" />
                             ) : firstAttachment?.preview ? (
                               <>
                                 <img
                                   src={firstAttachment.preview}
                                   alt=""
                                   className="absolute inset-0 h-full w-full object-cover"
                                 />
                                 <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover/attach:bg-black/55" />
                                 <Plus
                                   size={18}
                                   strokeWidth={2.5}
                                   className="relative z-10 scale-75 text-white opacity-0 drop-shadow-md transition-all duration-300 group-hover/attach:scale-100 group-hover/attach:opacity-100"
                                 />
                               </>
                             ) : firstAttachment ? (
                               <FileText size={18} className="relative z-10 text-cyan-200" />
                             ) : (
                               <>
                                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover/attach:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />
                                 <ImagePlus size={19} className="relative z-10 transition-all duration-300 group-hover/attach:rotate-3 group-hover/attach:scale-105" />
                               </>
                             )}
                             
                             {attachments.length > 0 && (
                               <motion.div 
                                 initial={{ scale: 0 }}
                                 animate={{ scale: 1 }}
                                 className="absolute right-1 top-1 z-20 flex h-4 min-w-4 items-center justify-center rounded-full border border-white/30 bg-[#080a10]/90 px-1 text-[8px] font-black text-white shadow-[0_2px_8px_rgba(0,0,0,0.55)] backdrop-blur-md"
                               >
                                 {attachments.length}
                               </motion.div>
                             )}
                           </motion.button>
                           <input
                             type="file"
                             ref={fileInputRef}
                             className="hidden"
                             multiple
                             accept="image/jpeg,image/png,image/webp,image/gif,text/plain,text/markdown,text/csv,application/json"
                             onChange={handleFileUpload}
                           />
                        </div>

                        {/* The text area container */}
                        <div className="flex-1 min-h-[48px] relative">
                           <AnimatePresence>
                            {showCommands && (
                              <motion.div 
                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                className="absolute bottom-full left-0 z-[9999] mb-4 max-h-[min(420px,55vh)] w-full overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0c0c10]/98 p-1.5 shadow-[0_25px_50px_rgba(0,0,0,0.9)] backdrop-blur-3xl custom-scrollbar md:w-[380px]"
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
                                    <div className="basis-full flex items-center justify-between gap-3 pb-1">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="relative flex h-2 w-2 shrink-0">
                                          <span className="absolute inset-0 rounded-full bg-cyan-300/60 animate-ping" />
                                          <span className="relative h-2 w-2 rounded-full bg-cyan-300" />
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-100/80 truncate">
                                          {attachments.some(item => item.type.startsWith("image/"))
                                            ? "Exismic Vision ready"
                                            : "Files ready for analysis"}
                                        </span>
                                      </div>
                                      <span className="text-[9px] font-bold text-zinc-600 shrink-0">
                                        {attachedImageCount > 0
                                          ? `${attachedImageCount}/5 images`
                                          : `${attachments.length} ${attachments.length === 1 ? "file" : "files"}`}
                                      </span>
                                    </div>
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
                                          className="w-6 h-6 rounded-md bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 flex items-center justify-center ml-1 transition-all opacity-100 sm:opacity-0 sm:group-hover/chip:opacity-100 active:scale-90"
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
                                onFocus={() => {
                                  if (input.startsWith('/')) setShowCommands(true);
                                }}
                                placeholder="Ask anything... or press '/' for commands" 
                                className="w-full bg-transparent border-0 ring-0 outline-none focus:ring-0 focus:outline-none focus:border-transparent text-[15px] md:text-[16px] text-white placeholder-zinc-500/70 focus:placeholder-zinc-500/40 py-2 px-0.5 min-h-[44px] max-h-[220px] sm:max-h-[300px] resize-none overflow-y-auto no-scrollbar font-medium relative z-10 leading-relaxed placeholder:font-medium placeholder:tracking-wide"
                                rows={1}
                             />
                           </div>
                        </div>

                        {/* Premium Action send button */}
                        <div className="relative z-10 shrink-0 pt-0.5">
                           <AnimatePresence>
                             {canSubmit && !isLoading && (
                               <motion.div
                                 initial={{ opacity: 0, scale: 0.75 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 exit={{ opacity: 0, scale: 0.75 }}
                                 className="absolute inset-1 rounded-[16px] bg-gradient-to-br from-fuchsia-500/55 via-violet-500/45 to-cyan-400/55 blur-xl pointer-events-none"
                               />
                             )}
                           </AnimatePresence>
                           <motion.button 
                             onClick={() => isLoading ? stopGeneration() : handleSend()}
                             disabled={!canSubmit && !isLoading}
                             initial={{ scale: 0.95 }}
                             animate={{ 
                                scale: (canSubmit || isLoading) ? 1 : 0.95,
                                boxShadow: isLoading
                                  ? "0 0 20px rgba(248,113,113,0.25), 0 0 40px rgba(248,113,113,0.12)"
                                  : canSubmit
                                    ? "0 0 20px rgba(168,85,247,0.35), 0 0 40px rgba(6,182,212,0.15)"
                                    : "none"
                             }}
                             whileHover={(canSubmit || isLoading) ? { scale: 1.06, y: -1 } : {}}
                             whileTap={(canSubmit || isLoading) ? { scale: 0.94 } : {}}
                             transition={{ type: "spring", stiffness: 400, damping: 15 }}
                             className={cn(
                                 "w-11 h-11 sm:w-12 sm:h-12 rounded-[15px] flex items-center justify-center transition-all duration-500 shrink-0 border relative overflow-hidden group/send touch-manipulation isolate",
                                 isLoading
                                     ? "bg-[#160b10] border-red-400/30 text-red-200 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                                     : canSubmit
                                     ? "bg-[linear-gradient(135deg,#d946ef_0%,#7c3aed_38%,#4f6df5_66%,#13c9e7_100%)] bg-[length:220%_220%] animate-gradient border-white/15 text-white cursor-pointer shadow-[0_12px_32px_rgba(76,70,229,0.32),inset_0_1px_0_rgba(255,255,255,0.35)]"
                                     : "bg-[#0b0b11]/80 text-zinc-600 border-white/[0.06] cursor-not-allowed shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                             )}
                             title={isLoading ? "Stop generation" : isUploading ? "Preparing attachments" : "Send message"}
                           >
                              {canSubmit && !isLoading && (
                                <>
                                  <div className="absolute inset-[2px] rounded-[12px] bg-[#080910]/82 pointer-events-none" />
                                  <div className="absolute inset-[3px] rounded-[11px] bg-[radial-gradient(circle_at_28%_18%,rgba(216,180,254,0.25),transparent_38%),linear-gradient(145deg,rgba(124,58,237,0.28),rgba(8,9,16,0.2)_52%,rgba(6,182,212,0.2))] pointer-events-none" />
                                  <div className="absolute inset-x-2 top-[3px] h-px bg-gradient-to-r from-transparent via-white/55 to-transparent pointer-events-none" />
                                </>
                              )}

                              {canSubmit && !isLoading && (
                                <div className="absolute inset-0 z-[1] bg-gradient-to-r from-transparent via-white/16 to-transparent -translate-x-full group-hover/send:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />
                              )}
                              
                              {isLoading ? (
                                <X size={18} strokeWidth={2.5} className="relative z-10" />
                              ) : (
                                <Send
                                  size={18}
                                  strokeWidth={2.4}
                                  className={cn(
                                    "relative z-10 transition-all duration-300",
                                    canSubmit
                                      ? "text-white drop-shadow-[0_0_7px_rgba(165,243,252,0.65)] group-hover/send:translate-x-0.5 group-hover/send:-translate-y-0.5"
                                      : "text-zinc-600"
                                  )}
                                />
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
                     <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-white/[0.03] pt-3 px-0.5 relative z-10 select-none">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                                isAssistantTyping ? "text-purple-300" : input.trim().length > 0 ? "text-cyan-400" : "text-zinc-500"
                              )}>
                                {isAssistantTyping ? "Exismic Typing..." : input.trim().length > 0 ? "Typing..." : "Ready"}
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

                <div className="space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-wide">Chat Mode</h4>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
                      Tune Exismic for code, research, business, creative work, or quick answers.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {CHAT_MODES.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => updateChatMode(mode.id)}
                        className={cn(
                          "min-h-10 rounded-xl border px-3 text-left text-[9px] font-black uppercase tracking-widest transition-all active:scale-95",
                          chatMode === mode.id
                            ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.1)]"
                            : "border-white/5 bg-white/[0.02] text-zinc-500 hover:bg-white/[0.05] hover:text-white"
                        )}
                      >
                        {mode.short}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-white/[0.04]" />

                <Link
                  href="/chat/settings"
                  onClick={() => setIsSettingsOpen(false)}
                  className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-4 transition-all hover:border-cyan-300/30 hover:bg-cyan-300/[0.08]"
                >
                  <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
                      <Brain size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-black uppercase tracking-widest text-white">Advanced AI Settings</span>
                      <span className="mt-1 block text-[10px] font-semibold leading-relaxed text-zinc-400">Memory, default modes, custom instructions, typing animation, and response style.</span>
                    </span>
                  </span>
                  <ArrowUp size={15} className="shrink-0 rotate-45 text-cyan-200 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>

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
                        <span className="text-[11px] font-black text-white tracking-wide uppercase italic">EXISMIC-3.5-MAX</span>
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
