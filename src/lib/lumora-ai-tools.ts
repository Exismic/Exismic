import { z } from "zod";

export type LumoraAiToolId =
  | "background-remover"
  | "image-compressor"
  | "image-converter"
  | "image-resizer";

const qualitySchema = z.number().int().min(1).max(100).default(82);
const formatSchema = z.enum(["jpg", "jpeg", "png", "webp", "gif"]);

export const lumoraAiToolRegistry = {
  "background-remover": {
    id: "background-remover",
    label: "Background Remover",
    endpoint: "/api/tools/image/bg-remove",
    creditCost: 1,
    parameters: z.object({}),
  },
  "image-compressor": {
    id: "image-compressor",
    label: "Image Compressor",
    endpoint: "/api/tools/image/compressor",
    creditCost: 0,
    parameters: z.object({
      quality: qualitySchema,
      format: z.enum(["original", "jpg", "jpeg", "png", "webp", "avif"]).default("original"),
      maxWidth: z.number().int().min(1).max(8000).optional(),
      maxHeight: z.number().int().min(1).max(8000).optional(),
      removeMetadata: z.boolean().default(true),
    }),
  },
  "image-converter": {
    id: "image-converter",
    label: "Image Converter",
    endpoint: "/api/tools/image/converter",
    creditCost: 0,
    parameters: z.object({
      targetFormat: formatSchema.default("webp"),
      quality: qualitySchema,
    }),
  },
  "image-resizer": {
    id: "image-resizer",
    label: "Image Resizer",
    endpoint: "/api/tools/image/resizer",
    creditCost: 0,
    parameters: z.object({
      width: z.number().int().min(1).max(8000),
      height: z.number().int().min(1).max(8000),
      format: z.enum(["jpg", "jpeg", "png", "webp"]).default("jpg"),
      quality: qualitySchema,
    }),
  },
} as const;

export interface DetectedLumoraTool {
  toolId: LumoraAiToolId;
  parameters: Record<string, unknown>;
  missing?: "dimensions";
}

function extractQuality(prompt: string) {
  const match = prompt.match(/\b(?:quality|at)\s*(?:of\s*)?(\d{1,3})\s*%/i)
    || prompt.match(/\b(?:to\s+)?(\d{1,3})\s*%\s*(?:quality)?\b/i);
  if (!match) return 82;
  return Math.min(100, Math.max(1, Number(match[1])));
}

function extractFormat(prompt: string) {
  const match = prompt.match(/\b(?:to|as|into|format)\s+(jpe?g|png|webp|gif|avif)\b/i);
  if (!match) return undefined;
  return match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
}

function extractDimensions(prompt: string) {
  const pair = prompt.match(/\b(\d{2,4})\s*(?:x|×|by)\s*(\d{2,4})\b/i);
  if (pair) {
    return { width: Number(pair[1]), height: Number(pair[2]) };
  }

  const width = prompt.match(/\bwidth\s*(?:of|to|=|:)?\s*(\d{2,4})\b/i);
  const height = prompt.match(/\bheight\s*(?:of|to|=|:)?\s*(\d{2,4})\b/i);
  if (width && height) {
    return { width: Number(width[1]), height: Number(height[1]) };
  }

  return undefined;
}

export function detectLumoraTool(prompt: string): DetectedLumoraTool | null {
  const normalized = prompt.toLowerCase().replace(/\s+/g, " ").trim();
  if (/\b(?:how\s+to|explain|teach\s+me|what\s+is)\b/i.test(normalized)) return null;
  const quality = extractQuality(prompt);
  const requestedFormat = extractFormat(prompt);

  if (
    /\b(remove|erase|delete|cut\s*out)\b.{0,24}\b(background|bg)\b/i.test(normalized)
    || /\btransparent\s+background\b/i.test(normalized)
  ) {
    return { toolId: "background-remover", parameters: {} };
  }

  if (/\b(resize|scale|change\s+(?:the\s+)?dimensions?)\b/i.test(normalized)) {
    const dimensions = extractDimensions(prompt);
    if (!dimensions) {
      return { toolId: "image-resizer", parameters: {}, missing: "dimensions" };
    }
    return {
      toolId: "image-resizer",
      parameters: {
        ...dimensions,
        format: requestedFormat === "gif" || requestedFormat === "avif" ? "jpg" : requestedFormat || "jpg",
        quality,
      },
    };
  }

  if (/\b(convert|change\s+(?:the\s+)?format|export)\b/i.test(normalized) && requestedFormat) {
    return {
      toolId: "image-converter",
      parameters: {
        targetFormat: requestedFormat === "avif" ? "webp" : requestedFormat,
        quality,
      },
    };
  }

  if (/\b(compress|optimi[sz]e|reduce\s+(?:the\s+)?(?:file\s+)?size|make\s+(?:it\s+)?smaller)\b/i.test(normalized)) {
    const dimensions = extractDimensions(prompt);
    return {
      toolId: "image-compressor",
      parameters: {
        quality,
        format: requestedFormat || "original",
        maxWidth: dimensions?.width,
        maxHeight: dimensions?.height,
        removeMetadata: true,
      },
    };
  }

  return null;
}

export function validateLumoraToolParameters(tool: DetectedLumoraTool) {
  return lumoraAiToolRegistry[tool.toolId].parameters.parse(tool.parameters);
}
