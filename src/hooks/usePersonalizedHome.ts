"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { TOOLS, type Tool } from "@/data/tools";
import { normalizeHistoryToolType, type ResultFileType } from "@/lib/results";
import { 
  getGuestFileHistory, 
  HISTORY_UPDATED_EVENT, 
  getReplayUrl, 
  type ToolHistoryMetadata,
  type GuestHistoryItem 
} from "@/lib/history";
import { FAVORITES_CHANGED_EVENT } from "@/lib/favorites";

export interface HistoryItemRecord {
  id: string;
  toolType: string;
  originalName: string;
  originalUrl?: string;
  resultUrl?: string;
  fileType: ResultFileType;
  createdAt: string;
  timestamp?: string;
  metadata?: ToolHistoryMetadata | Record<string, any>;
}

export interface ContinueUsingState {
  tool: Tool;
  timeAgo: string;
  prompt?: string;
  replayUrl: string;
  fileType?: ResultFileType;
  resultUrl?: string;
  isNewUser: boolean;
}

export interface RecentlyUsedToolItem {
  tool: Tool;
  timeAgo: string;
  replayUrl: string;
  prompt?: string;
  fileType?: ResultFileType;
  resultUrl?: string;
}

export interface RecommendedToolItem {
  tool: Tool;
  reason: string;
  badge: string;
}

export function formatTimeAgo(dateString: string): string {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Recently";

  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return mins === 1 ? "1 min ago" : `${mins} mins ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function getEffectiveToolCategory(tool?: Tool | null): string {
  if (!tool) return "image";
  const id = (tool.id || "").toLowerCase();
  const href = (tool.href || "").toLowerCase();
  const name = (tool.name || "").toLowerCase();
  const cat = (tool.category || "").toLowerCase();

  // 1. Image & Graphic tools (AI Image Gen, Minecraft Skin, Eraser, Resizer, Compressor, Converter, Meme, etc.)
  if (
    id.includes("img") ||
    id.includes("image") ||
    id.includes("eraser") ||
    id.includes("compressor") ||
    id.includes("resizer") ||
    id.includes("converter") ||
    id.includes("watermark") ||
    id.includes("minecraft") ||
    id.includes("vector") ||
    id.includes("upscaler") ||
    id.includes("meme") ||
    id.includes("collage") ||
    href.includes("/image") ||
    href.includes("img-gen") ||
    name.includes("image") ||
    name.includes("photo") ||
    name.includes("skin maker")
  ) {
    return "image";
  }

  // 2. Audio tools
  if (
    id.includes("audio") ||
    id.includes("vocal") ||
    id.includes("voice") ||
    id.includes("speech") ||
    href.includes("/audio") ||
    cat === "audio"
  ) {
    return "audio";
  }

  // 3. PDF tools
  if (
    id.includes("pdf") ||
    href.includes("/pdf") ||
    cat === "pdf"
  ) {
    return "pdf";
  }

  // 4. Developer tools
  if (
    id.includes("code") ||
    id.includes("regex") ||
    id.includes("json") ||
    id.includes("developer") ||
    id.includes("css") ||
    cat === "developer"
  ) {
    return "developer";
  }

  // 5. Productivity & Document tools
  if (
    id.includes("invoice") ||
    id.includes("resume") ||
    id.includes("calculator") ||
    id.includes("cv") ||
    cat === "productivity" ||
    cat === "business"
  ) {
    return "productivity";
  }

  // 6. Creator & Social tools
  if (
    id.includes("caption") ||
    id.includes("hook") ||
    id.includes("script") ||
    cat === "creator"
  ) {
    return "creator";
  }

  // 7. AI tools
  if (cat === "ai" || id.startsWith("ai-")) {
    return "ai";
  }

  return cat || "image";
}

export function findCanonicalTool(toolType: string): Tool | undefined {
  const normalized = normalizeHistoryToolType(toolType);

  // 1. Direct ID match
  let tool = TOOLS.find((t) => t.id === normalized || t.id === toolType);
  if (tool) return tool;

  // 2. Slug match against href
  tool = TOOLS.find((t) => {
    const segments = t.href.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    return last === normalized || last === toolType;
  });
  if (tool) return tool;

  // 3. Fallback partial ID match
  return TOOLS.find((t) => t.id.includes(normalized) || normalized.includes(t.id));
}

// Fallback starter essentials for brand-new users
const DEFAULT_FAVORITE_IDS = [
  "ai-img-gen",
  "image-eraser",
  "pdf-merger",
  "audio-vocal-remover",
];

export function usePersonalizedHome(initialFavorites: string[] = []) {
  const [historyItems, setHistoryItems] = useState<HistoryItemRecord[]>([]);
  const [favorites, setFavorites] = useState<string[]>(initialFavorites);
  const [loading, setLoading] = useState(true);

  // Sync favorites when props change
  useEffect(() => {
    if (initialFavorites.length > 0) {
      setFavorites(initialFavorites);
    }
  }, [initialFavorites]);

  // Fetch history (combines server + local guest history)
  const loadHistory = useCallback(async () => {
    try {
      let serverItems: HistoryItemRecord[] = [];
      try {
        const res = await fetch("/api/files/history?limit=25", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            serverItems = data;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch server history:", err);
      }

      const guestItems = getGuestFileHistory();

      // Merge and deduplicate by ID
      const map = new Map<string, HistoryItemRecord>();
      [...serverItems, ...guestItems].forEach((item) => {
        if (!map.has(item.id)) {
          map.set(item.id, {
            ...item,
            createdAt: item.createdAt || item.timestamp || new Date().toISOString(),
          });
        }
      });

      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setHistoryItems(merged);
    } catch (e) {
      console.error("usePersonalizedHome error loading history:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();

    const handleHistoryUpdate = () => {
      loadHistory();
    };

    const handleFavoritesUpdate = (e: Event) => {
      const nextFavorites = (e as CustomEvent<{ favorites?: string[] }>).detail?.favorites;
      if (Array.isArray(nextFavorites)) {
        setFavorites(nextFavorites);
      }
    };

    window.addEventListener(HISTORY_UPDATED_EVENT, handleHistoryUpdate);
    window.addEventListener(FAVORITES_CHANGED_EVENT, handleFavoritesUpdate);

    return () => {
      window.removeEventListener(HISTORY_UPDATED_EVENT, handleHistoryUpdate);
      window.removeEventListener(FAVORITES_CHANGED_EVENT, handleFavoritesUpdate);
    };
  }, [loadHistory]);

  // 1. CONTINUE USING (Most recent activity or starter spotlight)
  const continueUsing = useMemo<ContinueUsingState>(() => {
    if (historyItems.length > 0) {
      const latest = historyItems[0];
      const tool = findCanonicalTool(latest.toolType);

      if (tool) {
        const promptText =
          (latest.metadata?.prompt as string) ||
          (latest.originalName && !latest.originalName.startsWith("guest_") && !latest.originalName.startsWith("output_")
            ? latest.originalName
            : undefined);

        return {
          tool,
          timeAgo: formatTimeAgo(latest.createdAt),
          prompt: promptText,
          replayUrl: getReplayUrl(latest.toolType, latest.metadata, "edit"),
          fileType: latest.fileType,
          resultUrl: latest.resultUrl,
          isNewUser: false,
        };
      }
    }

    // Default starter spotlight
    const fallbackTool =
      TOOLS.find((t) => t.id === "ai-img-gen") ||
      TOOLS.find((t) => t.id === "image-eraser") ||
      TOOLS[0];

    return {
      tool: fallbackTool,
      timeAgo: "Ready to launch",
      prompt: "Generate stunning photorealistic art with 50 free daily credits",
      replayUrl: fallbackTool.href,
      isNewUser: true,
    };
  }, [historyItems]);

  // 2. RECENTLY USED (Deduplicated distinct tools used recently)
  const recentlyUsed = useMemo<RecentlyUsedToolItem[]>(() => {
    const seen = new Set<string>();
    const list: RecentlyUsedToolItem[] = [];

    for (const item of historyItems) {
      const tool = findCanonicalTool(item.toolType);
      if (tool && !seen.has(tool.id)) {
        seen.add(tool.id);
        const promptText =
          (item.metadata?.prompt as string) ||
          (item.originalName && !item.originalName.startsWith("guest_") && !item.originalName.startsWith("output_")
            ? item.originalName
            : undefined);

        list.push({
          tool,
          timeAgo: formatTimeAgo(item.createdAt),
          replayUrl: getReplayUrl(item.toolType, item.metadata, "edit"),
          prompt: promptText,
          fileType: item.fileType,
          resultUrl: item.resultUrl,
        });

        if (list.length >= 5) break;
      }
    }

    return list;
  }, [historyItems]);

  // 3. YOUR FAVORITES (Resolved Tool objects)
  const favoriteTools = useMemo<Tool[]>(() => {
    const targetIds = favorites.length > 0 ? favorites : DEFAULT_FAVORITE_IDS;
    const resolved: Tool[] = [];

    for (const id of targetIds) {
      const tool = findCanonicalTool(id);
      if (tool && !resolved.some((t) => t.id === tool.id)) {
        resolved.push(tool);
      }
    }

    return resolved;
  }, [favorites]);

  const hasCustomFavorites = favorites.length > 0;

  // 4. RECOMMENDED FOR YOU (Intelligent Activity-Based Recommendations)
  const recommendedTools = useMemo<RecommendedToolItem[]>(() => {
    const activeFavorites = favorites.length > 0 ? favorites : DEFAULT_FAVORITE_IDS;
    const excludedIds = new Set<string>([
      ...recentlyUsed.map((r) => r.tool.id),
      ...activeFavorites,
    ]);
    if (continueUsing.tool) {
      excludedIds.add(continueUsing.tool.id);
    }

    // Inspect user's actual past activities by semantic category and tool identity
    const hasImageActivity = recentlyUsed.some(
      (r) => getEffectiveToolCategory(r.tool) === "image"
    );
    const hasResumeActivity = recentlyUsed.some(
      (r) => r.tool.id.includes("resume") || r.tool.name.toLowerCase().includes("resume")
    );
    const hasAudioActivity = recentlyUsed.some(
      (r) => getEffectiveToolCategory(r.tool) === "audio"
    );
    const hasDevActivity = recentlyUsed.some(
      (r) => getEffectiveToolCategory(r.tool) === "developer"
    );

    const candidates: RecommendedToolItem[] = [];

    const tryAdd = (toolId: string, reason: string, badge: string) => {
      if (excludedIds.has(toolId)) return;
      if (candidates.some((c) => c.tool.id === toolId)) return;
      const tool = TOOLS.find((t) => t.id === toolId);
      if (tool) {
        candidates.push({ tool, reason, badge });
      }
    };

    // 1. If user creates images/skins/visuals, recommend pipeline tools that pair with generated art:
    if (hasImageActivity) {
      tryAdd("meme-generator", "Turn your generated art into viral memes", "Meme Studio");
      tryAdd("image-resizer", "Crop & resize for Instagram, YouTube & web", "Image Suite");
      tryAdd("image-compressor", "Reduce image file size without quality loss", "Optimizer");
      tryAdd("image-converter", "Convert creations to WebP, PNG, SVG, JPG", "Converter");
      tryAdd("watermark-remover", "Clean up unwanted watermarks or logos", "Enhancer");
      tryAdd("image-eraser", "1-click AI background & object eraser", "AI Eraser");
    }

    // 2. If user worked on Resume/CV documents:
    if (hasResumeActivity) {
      tryAdd("invoice-generator", "Create branded client & project invoices", "Productivity");
      tryAdd("pdf-merger", "Merge resume, portfolio & certificates", "PDF Studio");
      tryAdd("pdf-compressor", "Shrink PDF document size for email", "PDF Studio");
    }

    // 3. If user worked on Audio:
    if (hasAudioActivity) {
      tryAdd("audio-vocal-remover", "Isolate vocals and instrumentals", "Audio Lab");
      tryAdd("text-to-speech", "Generate realistic voiceovers with AI", "Voice AI");
    }

    // 4. If user worked on Developer code:
    if (hasDevActivity) {
      tryAdd("json-to-types", "Convert JSON data into TypeScript types", "Dev Suite");
      tryAdd("json-formatter", "Format and validate JSON objects", "Dev Suite");
    }

    // 5. Fallback studio picks to guarantee 4 high-value recommendations (especially for new users)
    const studioEssentials = [
      { id: "meme-generator", reason: "Create viral memes and trending social posts", badge: "Meme Studio" },
      { id: "invoice-generator", reason: "Create clean professional client invoices", badge: "Productivity" },
      { id: "image-resizer", reason: "Resize & crop for Instagram, YouTube & web", badge: "Image Suite" },
      { id: "image-compressor", reason: "Compress images with zero quality loss", badge: "Optimizer" },
      { id: "image-converter", reason: "Convert between WebP, PNG, SVG & JPG", badge: "Converter" },
      { id: "image-eraser", reason: "1-click AI background & object eraser", badge: "AI Vision" },
      { id: "audio-vocal-remover", reason: "Isolate vocals and instrumentals", badge: "Audio Lab" },
      { id: "pdf-merger", reason: "Combine and organize PDF documents", badge: "PDF Studio" },
    ];

    for (const fb of studioEssentials) {
      if (candidates.length >= 4) break;
      tryAdd(fb.id, fb.reason, fb.badge);
    }

    return candidates.slice(0, 4);
  }, [recentlyUsed, continueUsing, favorites]);

  return {
    continueUsing,
    recentlyUsed,
    favoriteTools,
    hasCustomFavorites,
    recommendedTools,
    loading,
    refreshHistory: loadHistory,
  };
}
