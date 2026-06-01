"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { createClient } from "@/utils/supabase/client";
import { useCredits } from "@/hooks/useCredits";

// --- Types & Interfaces ---
export interface Message {
  role: "user" | "assistant";
  content: string;
  attachments?: { type: string, data: string, name?: string }[];
  timestamp?: string;
  imageUrl?: string;
  isImage?: boolean;
  enhancedPrompt?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
}

interface ChatContextType {
  // States
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
  sessions: ChatSession[];
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  deleteModal: { isOpen: boolean, sessionId: string | null };
  setDeleteModal: React.Dispatch<React.SetStateAction<{ isOpen: boolean, sessionId: string | null }>>;
  attachments: { id: string, name: string, type: string, data: string, preview: string }[];
  setAttachments: React.Dispatch<React.SetStateAction<{ id: string, name: string, type: string, data: string, preview: string }[]>>;
  copiedId: number | null;
  setCopiedId: React.Dispatch<React.SetStateAction<number | null>>;
  agentStatus: string;
  showCommands: boolean;
  setShowCommands: React.Dispatch<React.SetStateAction<boolean>>;
  currentSuggestions: any[];
  isRerolling: boolean;
  showClearConfirm: boolean;
  setShowClearConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  isImmersive: boolean;
  setIsImmersive: React.Dispatch<React.SetStateAction<boolean>>;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  safeMode: boolean;
  toggleSafeMode: (val: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isGeneratingImage: boolean;
  isSessionLoading: boolean;
  session: any;
  isPro: boolean;
  plan: string | null;
  messagesUsed: number;

  // Refs
  scrollRef: React.RefObject<HTMLDivElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;

  // Functions
  fetchSessions: () => Promise<void>;
  loadSession: (id: string) => Promise<void>;
  startNewChat: () => void;
  handleSend: (content?: string) => Promise<void>;
  confirmDeleteSession: () => Promise<void>;
  openDeleteModal: (id: string) => void;
  rollSuggestions: () => void;
  processFiles: (files: File[]) => void;
  toast: (msg: string, type?: "success" | "warning" | "info") => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const cleanTitle = (title: string): string => {
  if (!title) return "Untitled Chat";
  return title
    .replace(/[#*\_`\-\+\[\]\(\)]/g, "")
    .replace(/\s+/g, " ")
    .trim() || "Untitled Chat";
};

// Shuffle cards from AiChatTool suggestions
const STARTER_CARDS = [
  { title: "System Architecture", desc: "Design a scalable cloud infrastructure.", prompt: "Design a scalable cloud architecture for a high-traffic application using microservices." },
  { title: "Code Refactoring", desc: "Optimize complex algorithms for speed.", prompt: "Optimize this sorting algorithm for better time complexity." },
  { title: "Database Design", desc: "Schema for a real-time chat app.", prompt: "Design a PostgreSQL database schema for a real-time messaging application." },
  { title: "API Development", desc: "Build a robust RESTful backend.", prompt: "Write a robust Express.js REST API with authentication and rate limiting." },
  { title: "Cybersecurity", desc: "Audit smart contract vulnerabilities.", prompt: "What are the most common vulnerabilities in Solidity smart contracts?" },
  { title: "Dockerization", desc: "Containerize modern microservices.", prompt: "Write a production-ready Dockerfile and docker-compose.yml for a Node.js and Redis app." },
  { title: "Market Analysis", desc: "Explore the world of smart AI.", prompt: "Analyze the current market landscape for autonomous AI agents." },
  { title: "Data Science", desc: "Create a smart prediction tool.", prompt: "Write a Python script using PyTorch to train a simple predictive model." },
  { title: "Deep Research", desc: "Summarize complex research papers.", prompt: "Summarize the latest advancements in quantum computing from recent academic papers." },
  { title: "Prompt Engineering", desc: "Build high-performing system prompts.", prompt: "Draft a system prompt that forces an LLM to respond strictly in structured JSON schema." },
  { title: "Creative Concepting", desc: "Brainstorm unique branding strategies.", prompt: "Brainstorm 5 unique branding concepts for a new luxury tech brand." },
  { title: "Content Strategy", desc: "Plan a viral marketing campaign.", prompt: "Create a 30-day viral content marketing strategy for a new tech product." },
  { title: "Startup Ideas", desc: "Generate SaaS ideas for 2026.", prompt: "Generate 5 innovative B2B SaaS startup ideas that leverage generative AI." },
  { title: "Growth Hacking", desc: "Strategies for zero-to-one scaling.", prompt: "What are the most effective zero-to-one growth hacking strategies for bootstrapped startups?" },
  { title: "UI/UX Review", desc: "Critique and improve interface flows.", prompt: "What are the best practices for designing an intuitive mobile onboarding flow?" },
  { title: "Design Systems", desc: "Tokens & theme specs for UI.", prompt: "Propose a Tailwind theme color token specification for a luxury dark-mode design system." },
];

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const urlId = (params?.chatId || params?.id) as string | undefined;

  // --- States ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, sessionId: string | null }>({ isOpen: false, sessionId: null });
  const [attachments, setAttachments] = useState<{ id: string, name: string, type: string, data: string, preview: string }[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [agentStatus, setAgentStatus] = useState("Ready to help");
  const [showCommands, setShowCommands] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<any[]>([]);
  const [isRerolling, setIsRerolling] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isImmersive, setIsImmersive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [safeMode, setSafeMode] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [sessionCache, setSessionCache] = useState<Record<string, Message[]>>({});
  const [session, setSession] = useState<any>(null);

  const { consumeMessage, messagesUsed, plan, isPro, notification, toast } = useCredits();

  // --- Refs ---
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const supabase = createClient();

  // --- Initialization & Hooks ---
  useEffect(() => {
    rollSuggestions();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    fetchSessions();
    
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("lumora_safe_mode");
    if (stored !== null) {
      setSafeMode(stored === "true");
    }
  }, []);

  // Sync Immersive State with HTML Tag
  useEffect(() => {
    if (isImmersive) {
      document.documentElement.classList.add("ai-chat-active");
    } else {
      document.documentElement.classList.remove("ai-chat-active");
    }
    return () => {
      document.documentElement.classList.remove("ai-chat-active");
    };
  }, [isImmersive]);

  // Sync route param chatId with active session state
  useEffect(() => {
    if (urlId) {
      if (urlId !== sessionId) {
        loadSession(urlId);
      }
    } else {
      if (sessionId) {
        setSessionId(null);
        setMessages([]);
        setError(null);
      }
    }
  }, [urlId]);

  // Loading Status Rotator
  useEffect(() => {
    if (!isLoading) {
      setAgentStatus("System Ready");
      return;
    }
    const statuses = ["Thinking...", "Working...", "Writing...", "Polishing..."];
    let i = 0;
    const interval = setInterval(() => {
      setAgentStatus(statuses[i % statuses.length]);
      i++;
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // --- Handlers & Functions ---
  const toggleSafeMode = (val: boolean) => {
    if (!val && !isPro) {
      toast("Creative Mode is exclusive to Lumora Pro/Elite users.", "warning");
      return;
    }
    setSafeMode(val);
    localStorage.setItem("lumora_safe_mode", String(val));
    toast(val ? "Safe Mode activated (NSFW Filter active)" : "Creative Mode activated (NSFW Filter relaxed)", "success");
  };

  const fetchSessions = async () => {
    try {
      const res = await axios.get("/api/tools/ai/chat");
      setSessions(res.data.sessions || []);
    } catch (e) {
      console.error("Failed to fetch sessions:", e);
    }
  };

  const rollSuggestions = () => {
    setIsRerolling(true);
    setTimeout(() => {
      setCurrentSuggestions(prev => {
        const prevTitles = prev.map(card => card.title);
        const pool = STARTER_CARDS.filter(card => !prevTitles.includes(card.title));
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 4);
      });
      setIsRerolling(false);
    }, 400);
  };

  const loadSession = async (id: string) => {
    if (id === sessionId) return;

    // Sync URL if needed
    if (urlId !== id) {
      router.push(`/chat/${id}`);
    }

    setSessionId(id);

    // Check cache for instant UI switch
    const cachedMessages = sessionCache[id];
    if (cachedMessages) {
      setMessages(cachedMessages);
      if (window.innerWidth < 768) setIsSidebarOpen(false);

      // Stale-while-revalidate update in background
      try {
        const res = await axios.get(`/api/tools/ai/chat/${id}`);
        const freshMessages = res.data.messages || [];
        setMessages(freshMessages);
        setSessionCache(prev => ({ ...prev, [id]: freshMessages }));
      } catch (e) {
        console.warn("Background revalidation failed:", e);
      }
      return;
    }

    // Cache miss - Load session fully with loading skeleton
    try {
      setIsSessionLoading(true);
      setMessages([]);
      setError(null);
      if (window.innerWidth < 768) setIsSidebarOpen(false);

      const res = await axios.get(`/api/tools/ai/chat/${id}`);
      const freshMessages = res.data.messages || [];

      setMessages(freshMessages);
      setSessionCache(prev => ({ ...prev, [id]: freshMessages }));
    } catch (e) {
      console.error("Failed to load session:", e);
      setError("Failed to get your chat.");
    } finally {
      setIsSessionLoading(false);
    }
  };

  const startNewChat = () => {
    setSessionId(null);
    setMessages([]);
    setError(null);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
    router.push("/chat");
  };

  const handleSend = async (content: string = input) => {
    if (!content.trim() || isLoading) return;

    const isImageRequest = (prompt: string) => {
      const p = prompt.toLowerCase();
      const bypass = ["how to", "code", "python", "javascript", "tutorial", "guide", "steps", "instruction", "html", "css", "c++", "c#", "java", "script", "program", "api"];
      const hasBypass = bypass.some(b => p.includes(b));
      if (hasBypass) return false;

      const actions = ["generate", "create", "make", "draw", "show", "paint", "render", "visualize", "produce", "design"];
      const visuals = ["image", "picture", "photo", "pic", "artwork", "drawing", "illustration", "visual", "painting", "render", "portrait", "graphic"];
      const hasAction = actions.some(act => p.includes(act));
      const hasVisual = visuals.some(vis => p.includes(vis));

      if (hasAction && hasVisual) return true;
      if (p.includes("draw me") || p.includes("paint me") || p.includes("show me a") || p.startsWith("visual of")) {
        return true;
      }
      return false;
    };

    const userMsg: Message = {
      role: "user",
      content: content.trim(),
      attachments: attachments.map(a => ({ type: a.type, data: a.data, name: a.name })),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    // Instant UI Update
    setMessages(prev => {
      const next = [...prev, userMsg];
      if (sessionId) {
        setSessionCache(c => ({ ...c, [sessionId]: next }));
      }
      return next;
    });

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsLoading(true);
    setError(null);
    setAttachments([]);

    if (isImageRequest(content)) {
      setIsGeneratingImage(true);
    }

    const canSend = await consumeMessage();
    if (!canSend && !session) {
      toast("Please sign in to save your chat history.", "info");
    }

    try {
      const res = await axios.post("/api/tools/ai/chat", {
        messages: [...messages, userMsg],
        sessionId,
        attachments: userMsg.attachments,
        safeMode
      });

      if (res.data.blocked) {
        toast("Flagged by NSFW Safety Filter", "warning");
      }

      const nextSessionId = res.data.id || sessionId;
      const assistantMsg: Message = {
        role: "assistant",
        content: res.data.message || "No response.",
        imageUrl: res.data.imageUrl,
        isImage: res.data.isImage,
        enhancedPrompt: res.data.enhancedPrompt,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages(prev => {
        const next = [...prev, assistantMsg];
        if (nextSessionId) {
          setSessionCache(c => ({ ...c, [nextSessionId]: next }));
        }
        return next;
      });

      setSessionId(nextSessionId);
      if (nextSessionId && nextSessionId !== sessionId) {
        router.push(`/chat/${nextSessionId}`);
      }
      fetchSessions();
    } catch (e: any) {
      const msg = e.response?.data?.error || e.message || "Connection lost";
      setError(msg);
      toast(msg, "warning");
    } finally {
      setIsLoading(false);
      setIsGeneratingImage(false);
    }
  };

  const confirmDeleteSession = async () => {
    if (!deleteModal.sessionId) return;
    const id = deleteModal.sessionId;

    // Store original sessions for rollback if error occurs
    const originalSessions = [...sessions];

    // Optimistically update sessions UI instantly!
    setSessions(prev => prev.filter(s => s.id !== id));
    setDeleteModal({ isOpen: false, sessionId: null });

    // Instantly transition out of the chat if deleting the current active session
    if (sessionId === id) {
      startNewChat();
    }

    try {
      await axios.delete(`/api/tools/ai/chat/${id}`);
      // Refresh to ensure absolute sync with backend
      fetchSessions();
    } catch (e) {
      console.error("Failed to delete session:", e);
      // Rollback to original sessions list on failure
      setSessions(originalSessions);
      toast("Failed to delete conversation. Please try again.", "warning");
    }
  };

  const openDeleteModal = (id: string) => {
    setDeleteModal({ isOpen: true, sessionId: id });
  };

  const processFiles = (files: File[]) => {
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast(`${file.name} is too large. Max size is 10MB.`, "warning");
        return;
      }

      const reader = new FileReader();
      reader.onload = (f) => {
        const isImage = file.type.startsWith("image/");
        const dataUrl = f.target?.result as string;

        setAttachments(prev => {
          if (prev.some(item => item.name === file.name && item.type === file.type)) {
            return prev;
          }
          return [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
            data: dataUrl,
            preview: isImage ? dataUrl : ""
          }];
        });
      };

      if (file.type.startsWith("image/")) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  return (
    <ChatContext.Provider
      value={{
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
        plan,
        messagesUsed,

        scrollRef,
        textareaRef,
        fileInputRef,

        fetchSessions,
        loadSession,
        startNewChat,
        handleSend,
        confirmDeleteSession,
        openDeleteModal,
        rollSuggestions,
        processFiles,
        toast,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
