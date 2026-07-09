"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { createClient } from "@/utils/supabase/client";
import { useCredits } from "@/hooks/useCredits";

// --- Types & Interfaces ---
export type ChatMode = "auto" | "default" | "coding" | "research" | "business" | "creative" | "fast";

export interface ChatToolRun {
  toolId: "background-remover" | "image-compressor" | "image-converter" | "image-resizer";
  label: string;
  status: "completed";
  resultUrl: string;
  downloadName: string;
  format?: string;
  width?: number;
  height?: number;
  size?: number;
  quality?: number;
  credits?: number;
  priority?: boolean;
  processingLabel?: string;
}

export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  attachments?: { type: string, data: string, name?: string }[];
  timestamp?: string;
  imageUrl?: string;
  isImage?: boolean;
  enhancedPrompt?: string;
  isTyping?: boolean;
  chatMode?: ChatMode;
  studentMode?: boolean;
  toolRun?: ChatToolRun;
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: string;
  data: string;
  preview: string;
  file?: File;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
}

export interface AiChatSettings {
  defaultChatMode: ChatMode;
  defaultStudentMode: boolean;
  memoryEnabled: boolean;
  typingAnimation: boolean;
  smartFollowUps: boolean;
  responseStyle: "balanced" | "concise" | "detailed" | "teacher" | "operator";
  detailLevel: "short" | "standard" | "deep";
  customInstructions: string;
}

export const DEFAULT_AI_CHAT_SETTINGS: AiChatSettings = {
  defaultChatMode: "auto",
  defaultStudentMode: false,
  memoryEnabled: true,
  typingAnimation: true,
  smartFollowUps: true,
  responseStyle: "balanced",
  detailLevel: "standard",
  customInstructions: "",
};

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
  attachments: ChatAttachment[];
  setAttachments: React.Dispatch<React.SetStateAction<ChatAttachment[]>>;
  isUploading: boolean;
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
  studentMode: boolean;
  toggleStudentMode: (val: boolean) => void;
  chatMode: ChatMode;
  updateChatMode: (mode: ChatMode) => void;
  chatSettings: AiChatSettings;
  saveChatSettings: (settings: Partial<AiChatSettings>) => Promise<void>;
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
  handleSend: (content?: string, options?: { forceImage?: boolean }) => Promise<void>;
  editAndResendMessage: (messageIndex: number, content: string) => Promise<void>;
  branchConversation: (messageIndex: number) => Promise<void>;
  rememberMessage: (content: string) => Promise<void>;
  stopGeneration: () => void;
  confirmDeleteSession: () => Promise<void>;
  openDeleteModal: (id: string) => void;
  rollSuggestions: () => void;
  processFiles: (files: File[]) => Promise<void>;
  toast: (msg: string, type?: "success" | "warning" | "info") => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const MAX_VISION_IMAGES = 5;
const MAX_IMAGE_SOURCE_BYTES = 20 * 1024 * 1024;
const MAX_TEXT_FILE_BYTES = 1024 * 1024;
const TARGET_IMAGE_BYTES = 480 * 1024;
const SUPPORTED_TEXT_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
]);

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Could not read the optimized image."));
    reader.readAsDataURL(blob);
  });
}

async function optimizeImageForVision(file: File) {
  const bitmap = await createImageBitmap(file);
  try {
    const maxDimension = 1800;
    const initialScale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    let width = Math.max(1, Math.round(bitmap.width * initialScale));
    let height = Math.max(1, Math.round(bitmap.height * initialScale));
    let quality = 0.9;
    let output: Blob | null = null;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("Image optimization is unavailable in this browser.");

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(bitmap, 0, 0, width, height);

      output = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
      if (!output) throw new Error("Could not optimize this image.");
      if (output.size <= TARGET_IMAGE_BYTES) break;

      if (quality > 0.62) {
        quality -= 0.09;
      } else {
        width = Math.max(1, Math.round(width * 0.82));
        height = Math.max(1, Math.round(height * 0.82));
      }
    }

    if (!output) throw new Error("Could not optimize this image.");
    return {
      data: await blobToDataUrl(output),
      type: "image/jpeg",
      width,
      height,
      size: output.size,
    };
  } finally {
    bitmap.close();
  }
}

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
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [agentStatus, setAgentStatus] = useState("Ready to help");
  const [showCommands, setShowCommands] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<any[]>([]);
  const [isRerolling, setIsRerolling] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isImmersive, setIsImmersive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [safeMode, setSafeMode] = useState(true);
  const [studentMode, setStudentMode] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("auto");
  const [chatSettings, setChatSettings] = useState<AiChatSettings>(DEFAULT_AI_CHAT_SETTINGS);
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
  const typingStopRef = useRef(false);
  const requestAbortRef = useRef<AbortController | null>(null);
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
    const stored = localStorage.getItem("exismic_safe_mode");
    if (stored !== null) {
      setSafeMode(stored === "true");
    }

    const storedStudentMode = localStorage.getItem("exismic_student_mode");
    if (storedStudentMode !== null) {
      setStudentMode(storedStudentMode === "true");
    }

    const storedChatMode = localStorage.getItem("exismic_chat_mode") as ChatMode | null;
    if (storedChatMode && ["auto", "default", "coding", "research", "business", "creative", "fast"].includes(storedChatMode)) {
      setChatMode(storedChatMode);
    }

    axios.get("/api/tools/ai/chat/settings")
      .then(res => {
        const nextSettings = { ...DEFAULT_AI_CHAT_SETTINGS, ...(res.data.settings || {}) };
        setChatSettings(nextSettings);

        if (!localStorage.getItem("exismic_chat_mode")) {
          setChatMode(nextSettings.defaultChatMode);
        }
        if (!localStorage.getItem("exismic_student_mode")) {
          setStudentMode(nextSettings.defaultStudentMode);
        }
      })
      .catch(() => {
        // Anonymous or offline sessions still get local chat settings.
      });
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
    const statuses = studentMode
      ? ["Teaching...", "Breaking it down...", "Finding examples...", "Preparing practice..."]
      : ["Thinking...", "Working...", "Writing...", "Polishing..."];
    let i = 0;
    const interval = setInterval(() => {
      setAgentStatus(statuses[i % statuses.length]);
      i++;
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading, studentMode]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // --- Handlers & Functions ---
  const toggleSafeMode = (val: boolean) => {
    if (!val && !isPro) {
      toast("Creative Mode is exclusive to Exismic Pro/Elite users.", "warning");
      return;
    }
    setSafeMode(val);
    localStorage.setItem("exismic_safe_mode", String(val));
    toast(val ? "Safe Mode activated (NSFW Filter active)" : "Creative Mode activated (NSFW Filter relaxed)", "success");
  };

  const toggleStudentMode = (val: boolean) => {
    setStudentMode(val);
    localStorage.setItem("exismic_student_mode", String(val));
    toast(
      val
        ? "Student Mode activated. Exismic will teach step-by-step."
        : "Student Mode turned off.",
      "success"
    );
  };

  const updateChatMode = (mode: ChatMode) => {
    setChatMode(mode);
    localStorage.setItem("exismic_chat_mode", mode);
    const label = mode === "auto" ? "Auto" : mode === "default" ? "Default" : mode.charAt(0).toUpperCase() + mode.slice(1);
    toast(`${label} mode selected.`, "success");
  };

  const saveChatSettings = async (settings: Partial<AiChatSettings>) => {
    const nextSettings = { ...chatSettings, ...settings };
    setChatSettings(nextSettings);

    if (settings.defaultChatMode) {
      localStorage.setItem("exismic_chat_mode", settings.defaultChatMode);
      setChatMode(settings.defaultChatMode);
    }
    if (typeof settings.defaultStudentMode === "boolean") {
      localStorage.setItem("exismic_student_mode", String(settings.defaultStudentMode));
      setStudentMode(settings.defaultStudentMode);
    }

    try {
      const res = await axios.post("/api/tools/ai/chat/settings", { settings: nextSettings });
      setChatSettings({ ...DEFAULT_AI_CHAT_SETTINGS, ...(res.data.settings || nextSettings) });
      toast("AI Chat settings saved.", "success");
    } catch (e: any) {
      toast(e.response?.data?.error || "Could not save AI Chat settings.", "warning");
      throw e;
    }
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

  const typeAssistantMessage = (message: Message, activeSessionId: string | null) => {
    typingStopRef.current = false;
    const typingId = `assistant-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const fullContent = message.content || "";

    if (!chatSettings.typingAnimation) {
      const completeMessage: Message = { ...message, id: typingId, isTyping: false };
      setMessages(prev => {
        const next = [...prev, completeMessage];
        if (activeSessionId) {
          setSessionCache(c => ({ ...c, [activeSessionId]: next }));
        }
        return next;
      });
      return Promise.resolve();
    }

    const typingMessage: Message = { ...message, id: typingId, content: "", isTyping: true };

    setMessages(prev => {
      const next = [...prev, typingMessage];
      if (activeSessionId) {
        setSessionCache(c => ({ ...c, [activeSessionId]: next }));
      }
      return next;
    });

    return new Promise<void>((resolve) => {
      if (!fullContent.trim()) {
        setMessages(prev => {
          const next = prev.map(m => m.id === typingId ? { ...message, id: typingId, isTyping: false } : m);
          if (activeSessionId) {
            setSessionCache(c => ({ ...c, [activeSessionId]: next }));
          }
          return next;
        });
        resolve();
        return;
      }

      const words = fullContent.match(/\S+\s*/g) || [fullContent];
      const groupSize = fullContent.length > 2800 ? 5 : fullContent.length > 1600 ? 3 : 1;
      const chunks: string[] = [];

      for (let i = 0; i < words.length; i += groupSize) {
        chunks.push(words.slice(i, i + groupSize).join(""));
      }

      let chunkIndex = 0;
      let visibleContent = "";
      const baseDelay = fullContent.length > 2800 ? 14 : fullContent.length > 1600 ? 20 : 34;

      const revealNextChunk = () => {
        if (typingStopRef.current) {
          setMessages(prev => {
            const next = prev.map(m => (
              m.id === typingId
                ? { ...message, id: typingId, content: visibleContent || "Response stopped.", isTyping: false }
                : m
            ));
            if (activeSessionId) {
              setSessionCache(c => ({ ...c, [activeSessionId]: next }));
            }
            return next;
          });
          resolve();
          return;
        }

        visibleContent += chunks[chunkIndex] || "";
        chunkIndex += 1;

        setMessages(prev => prev.map(m => (
          m.id === typingId
            ? { ...m, content: visibleContent, isTyping: chunkIndex < chunks.length }
            : m
        )));

        if (chunkIndex < chunks.length) {
          const punctuationPause = /[.!?:]\s*$/.test(visibleContent) ? 90 : 0;
          window.setTimeout(revealNextChunk, baseDelay + punctuationPause + Math.random() * 22);
          return;
        }

        setMessages(prev => {
          const next = prev.map(m => (
            m.id === typingId
              ? { ...message, id: typingId, content: fullContent, isTyping: false }
              : m
          ));
          if (activeSessionId) {
            setSessionCache(c => ({ ...c, [activeSessionId]: next }));
          }
          return next;
        });
        resolve();
      };

      window.setTimeout(revealNextChunk, 160);
    });
  };

  const stopGeneration = () => {
    typingStopRef.current = true;
    requestAbortRef.current?.abort();
    requestAbortRef.current = null;
    setIsLoading(false);
    setIsGeneratingImage(false);

    setMessages(prev => {
      const next = prev.map(message => (
        message.isTyping
          ? { ...message, content: message.content || "Response stopped.", isTyping: false }
          : message
      ));
      if (sessionId) {
        setSessionCache(c => ({ ...c, [sessionId]: next }));
      }
      return next;
    });

    toast("Generation stopped.", "info");
  };

  const handleSend = async (content: string = input, options?: { forceImage?: boolean }) => {
    if ((!content.trim() && attachments.length === 0) || isLoading || isUploading) return;
    const pendingAttachments = [...attachments];

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

    const normalizedContent = content.trim() || "Analyze the attached image and explain what you observe.";
    const userMsg: Message = {
      role: "user",
      content: normalizedContent,
      attachments: attachments.map(a => ({ type: a.type, data: a.data, name: a.name })),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    const nextMessages = [...messages, userMsg];
    const hasImageContext = nextMessages.some(message => (
      message.attachments?.some(attachment => attachment.type.startsWith("image/"))
    ));
    const isExplicitToolRequest = hasImageContext
      && !/\b(?:how\s+to|explain|teach\s+me|what\s+is)\b/i.test(normalizedContent)
      && /\b(?:remove|erase|delete|cut\s*out|compress|optimi[sz]e|reduce|smaller|convert|export|format|resize|scale|dimensions?|transparent\s+background)\b/i.test(normalizedContent);

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

    if (options?.forceImage || isImageRequest(normalizedContent)) {
      setIsGeneratingImage(true);
    }

    try {
      const abortController = new AbortController();
      requestAbortRef.current = abortController;

      if (isExplicitToolRequest && !options?.forceImage) {
        setAgentStatus("Running a Exismic tool...");
        const toolForm = new FormData();
        toolForm.append("prompt", normalizedContent);
        toolForm.append("messages", JSON.stringify(nextMessages));
        if (sessionId) toolForm.append("sessionId", sessionId);
        const originalImage = pendingAttachments.find(attachment => (
          attachment.type.startsWith("image/") && attachment.file
        ));
        if (originalImage?.file) {
          toolForm.append("file", originalImage.file, originalImage.name);
        }

        const toolResponse = await axios.post("/api/tools/ai/orchestrate", toolForm, {
          signal: abortController.signal,
        });

        if (toolResponse.data?.handled) {
          const nextSessionId = toolResponse.data.id || sessionId;
          const assistantMsg: Message = {
            role: "assistant",
            content: toolResponse.data.message || "The Exismic tool is ready.",
            toolRun: toolResponse.data.toolRun,
            chatMode,
            studentMode,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };

          setSessionId(nextSessionId);
          if (nextSessionId && nextSessionId !== sessionId) {
            router.push(`/chat/${nextSessionId}`);
          }
          await typeAssistantMessage(assistantMsg, nextSessionId);
          if (toolResponse.data.toolRun) {
            toast(`${toolResponse.data.toolRun.label} completed.`, "success");
          }
          fetchSessions();
          return;
        }
      }

      setAgentStatus("Exismic is thinking...");
      const canSend = await consumeMessage();
      if (!canSend && !session) {
        toast("Please sign in to save your chat history.", "info");
      }

      const res = await axios.post("/api/tools/ai/chat", {
        messages: nextMessages,
        sessionId,
        safeMode,
        studentMode,
        chatMode,
        forceImage: options?.forceImage || false
      }, {
        signal: abortController.signal
      });

      requestAbortRef.current = null;

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
        chatMode: (res.data.chatMode as ChatMode) || chatMode,
        studentMode: typeof res.data.studentMode === "boolean" ? res.data.studentMode : studentMode,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setSessionId(nextSessionId);
      if (nextSessionId && nextSessionId !== sessionId) {
        router.push(`/chat/${nextSessionId}`);
      }
      await typeAssistantMessage(assistantMsg, nextSessionId);
      fetchSessions();
    } catch (e: any) {
      if (e?.code === "ERR_CANCELED" || e?.name === "CanceledError") {
        toast("Generation stopped.", "info");
        return;
      }
      const msg = e.response?.data?.error || e.message || "Connection lost";
      setError(msg);
      toast(msg, "warning");
    } finally {
      requestAbortRef.current = null;
      setIsLoading(false);
      setIsGeneratingImage(false);
      setAgentStatus("Ready to help");
    }
  };

  const editAndResendMessage = async (messageIndex: number, content: string) => {
    const trimmedContent = content.trim();
    const targetMessage = messages[messageIndex];

    if (!trimmedContent || isLoading || !targetMessage || targetMessage.role !== "user") return;

    const editedUserMessage: Message = {
      ...targetMessage,
      content: trimmedContent,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    const nextHistory = [...messages.slice(0, messageIndex), editedUserMessage];

    setMessages(nextHistory);
    if (sessionId) {
      setSessionCache(c => ({ ...c, [sessionId]: nextHistory }));
    }
    setIsLoading(true);
    setError(null);
    setAttachments([]);
    typingStopRef.current = false;

    const canSend = await consumeMessage();
    if (!canSend && !session) {
      toast("Please sign in to save your chat history.", "info");
    }

    try {
      const abortController = new AbortController();
      requestAbortRef.current = abortController;

      const res = await axios.post("/api/tools/ai/chat", {
        messages: nextHistory,
        sessionId,
        safeMode,
        studentMode,
        chatMode,
        forceImage: false
      }, {
        signal: abortController.signal
      });

      requestAbortRef.current = null;

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
        chatMode: (res.data.chatMode as ChatMode) || chatMode,
        studentMode: typeof res.data.studentMode === "boolean" ? res.data.studentMode : studentMode,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setSessionId(nextSessionId);
      if (nextSessionId && nextSessionId !== sessionId) {
        router.push(`/chat/${nextSessionId}`);
      }
      await typeAssistantMessage(assistantMsg, nextSessionId);
      fetchSessions();
    } catch (e: any) {
      if (e?.code === "ERR_CANCELED" || e?.name === "CanceledError") {
        toast("Generation stopped.", "info");
        return;
      }
      const msg = e.response?.data?.error || e.message || "Connection lost";
      setError(msg);
      toast(msg, "warning");
    } finally {
      requestAbortRef.current = null;
      setIsLoading(false);
      setIsGeneratingImage(false);
    }
  };

  const branchConversation = async (messageIndex: number) => {
    if (isLoading || messageIndex < 0 || messageIndex >= messages.length) return;

    const branchMessages = messages
      .slice(0, messageIndex + 1)
      .map(({ id, isTyping, ...message }) => message);

    try {
      const res = await axios.post("/api/tools/ai/chat/branch", {
        sourceSessionId: sessionId,
        messages: branchMessages,
      });

      const newSessionId = res.data.id;
      const branchTitle = res.data.title || "Branched Chat";
      const branchedMessages = res.data.messages || branchMessages;

      if (!newSessionId) throw new Error("Branch session was not created");

      const now = new Date().toISOString();
      setSessionId(newSessionId);
      setMessages(branchedMessages);
      setSessionCache(c => ({ ...c, [newSessionId]: branchedMessages }));
      setSessions(prev => [
        {
          id: newSessionId,
          title: branchTitle,
          createdAt: now,
          updatedAt: now,
          lastMessage: branchedMessages[branchedMessages.length - 1]?.content || "Branched chat",
        },
        ...prev
      ]);
      router.push(`/chat/${newSessionId}`);
      fetchSessions();
      toast("Branch created. You can explore from here.", "success");
    } catch (e: any) {
      const msg = e.response?.data?.error || e.message || "Could not create branch";
      toast(msg, "warning");
    }
  };

  const rememberMessage = async (content: string) => {
    const memory = content.replace(/\s+/g, " ").trim().slice(0, 500);
    if (!memory) {
      toast("Nothing useful to remember here.", "warning");
      return;
    }

    try {
      const res = await axios.post("/api/tools/ai/chat/settings", {
        action: "add-memory",
        memory,
      });
      setChatSettings({ ...DEFAULT_AI_CHAT_SETTINGS, ...(res.data.settings || chatSettings) });
      toast("Saved to AI memory.", "success");
    } catch (e: any) {
      toast(e.response?.data?.error || "Could not save memory.", "warning");
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

  const processFiles = async (files: File[]) => {
    if (!files.length || isUploading) return;

    const existingImages = attachments.filter(item => item.type.startsWith("image/")).length;
    const availableImageSlots = Math.max(0, MAX_VISION_IMAGES - existingImages);
    const seenNames = new Set(attachments.map(item => item.name.trim().toLowerCase()));
    let acceptedImages = 0;
    let added = 0;

    setIsUploading(true);
    try {
      for (const file of files) {
        const normalizedName = file.name.trim().toLowerCase();
        if (seenNames.has(normalizedName)) {
          toast(`${file.name} is already attached.`, "info");
          continue;
        }

        if (file.type.startsWith("image/")) {
          if (acceptedImages >= availableImageSlots) {
            toast(`Exismic Vision accepts up to ${MAX_VISION_IMAGES} images per message.`, "warning");
            continue;
          }
          if (file.size > MAX_IMAGE_SOURCE_BYTES) {
            toast(`${file.name} is larger than 20MB.`, "warning");
            continue;
          }

          try {
            const optimized = await optimizeImageForVision(file);
            const attachment: ChatAttachment = {
              id: crypto.randomUUID(),
              name: file.name,
              type: optimized.type,
              data: optimized.data,
              preview: optimized.data,
              file,
            };
            setAttachments(prev => [...prev, attachment]);
            seenNames.add(normalizedName);
            acceptedImages += 1;
            added += 1;
          } catch (error) {
            console.error("Image optimization failed:", error);
            toast(`Could not prepare ${file.name} for analysis.`, "warning");
          }
          continue;
        }

        if (!SUPPORTED_TEXT_TYPES.has(file.type)) {
          toast(`${file.name} is not supported yet. Upload an image, TXT, Markdown, CSV, or JSON file.`, "warning");
          continue;
        }
        if (file.size > MAX_TEXT_FILE_BYTES) {
          toast(`${file.name} is larger than the 1MB text-file limit.`, "warning");
          continue;
        }

        try {
          const text = await file.text();
          const attachment: ChatAttachment = {
            id: crypto.randomUUID(),
            name: file.name,
            type: file.type,
            data: text,
            preview: "",
          };
          setAttachments(prev => [...prev, attachment]);
          seenNames.add(normalizedName);
          added += 1;
        } catch (error) {
          console.error("Text attachment read failed:", error);
          toast(`Could not read ${file.name}.`, "warning");
        }
      }

      if (added > 0) {
        toast(`${added} ${added === 1 ? "file" : "files"} ready for Exismic analysis.`, "success");
      }
    } finally {
      setIsUploading(false);
    }
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
        saveChatSettings,
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
        editAndResendMessage,
        branchConversation,
        rememberMessage,
        stopGeneration,
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
