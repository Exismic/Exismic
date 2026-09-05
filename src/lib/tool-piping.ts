"use client";

import { useEffect, useState, useCallback } from "react";

export interface PipedPayload {
  sourceToolId: string;
  sourceToolName: string;
  content: string;
  fieldHint?: "text" | "topic" | "resume" | "bullets" | "jobDesc";
  timestamp: number;
}

const STORAGE_KEY = "exismic_piped_payload_v1";
const LEGACY_STORAGE_KEY = "exismic_piped_content";

const TOOL_NAMES: Record<string, string> = {
  "youtube-summarizer": "YouTube Summarizer",
  "resume-builder": "Resume Builder",
  "resume-analyzer": "Resume Scanner",
  "resume-bullet-generator": "Resume Bullet Polisher",
  "cover-letter-generator": "Cover Letter Generator",
  "ai-writer": "AI Writer",
  "ai-humanizer": "AI Humanizer",
  "ai-detector": "AI Detector",
  "grammar-checker": "Grammar Checker",
  "pdf-to-notes": "PDF Study Notes",
  "social-caption-generator": "Social Caption Generator",
  "flashcard-generator": "Flashcard Generator",
  "bg-remove": "Background Remover",
  "image-eraser": "Background Remover",
  "image-resizer": "Image Resizer",
  "image-compressor": "Image Compressor",
  "image-restorer": "Photo Enhancer",
  "meme-generator": "Meme Generator",
  "image-converter": "Image Converter",
  "invoice-generator": "Invoice Generator",
};

export function getFriendlyToolName(toolId: string): string {
  if (TOOL_NAMES[toolId]) return TOOL_NAMES[toolId];
  return toolId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Stores data to be piped to the next tool in sessionStorage.
 */
export function setPipedContent({
  sourceToolId,
  sourceToolName,
  content,
  fieldHint = "text",
}: {
  sourceToolId: string;
  sourceToolName?: string;
  content: string;
  fieldHint?: "text" | "topic" | "resume" | "bullets" | "jobDesc";
}): void {
  if (typeof window === "undefined" || !content) return;

  const resolvedName = sourceToolName || getFriendlyToolName(sourceToolId);
  const payload: PipedPayload = {
    sourceToolId,
    sourceToolName: resolvedName,
    content: content.trim(),
    fieldHint,
    timestamp: Date.now(),
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    sessionStorage.setItem(LEGACY_STORAGE_KEY, content.slice(0, 10000));
  } catch (err) {
    console.warn("Could not save piped content:", err);
  }
}

/**
 * Retrieves the piped payload. If consume is true, it removes it from storage.
 */
export function getPipedContent(consume = true): PipedPayload | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      if (consume) {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(LEGACY_STORAGE_KEY);
      }
      const parsed = JSON.parse(raw) as PipedPayload;
      // Expire after 10 minutes
      if (Date.now() - parsed.timestamp > 10 * 60 * 1000) {
        return null;
      }
      return parsed;
    }

    // Legacy fallback check
    const legacyContent = sessionStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyContent) {
      if (consume) {
        sessionStorage.removeItem(LEGACY_STORAGE_KEY);
      }
      return {
        sourceToolId: "previous-tool",
        sourceToolName: "Previous Tool",
        content: legacyContent.trim(),
        fieldHint: "text",
        timestamp: Date.now(),
      };
    }
  } catch {
    // Ignore storage parse issues
  }

  return null;
}

/**
 * React hook to automatically consume piped content on mount and pre-fill form fields.
 */
export function usePipedContent(onLoaded?: (payload: PipedPayload) => void) {
  const [pipedPayload, setPipedPayload] = useState<PipedPayload | null>(null);

  useEffect(() => {
    const payload = getPipedContent(true);
    if (payload && payload.content) {
      setPipedPayload(payload);
      if (onLoaded) {
        onLoaded(payload);
      }
    }
  }, []);

  const clearPiped = useCallback(() => {
    setPipedPayload(null);
  }, []);

  return {
    pipedPayload,
    isPiped: Boolean(pipedPayload && pipedPayload.content),
    clearPiped,
  };
}
