/**
 * Centralized Groq & AI model definitions for Exismic.
 * Updating model names here propagates across all API routes and background tools.
 */

export const GROQ_TEXT_MODELS = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
  "qwen/qwen3.6-27b",
  "groq/compound",
  "allam-2-7b",
] as const;

export const GROQ_VISION_MODELS = [
  "qwen/qwen3.8-27b",
] as const;

export const DEFAULT_GROQ_TEXT_MODEL = GROQ_TEXT_MODELS[0];
export const FALLBACK_GROQ_TEXT_MODEL = GROQ_TEXT_MODELS[1];

export const DEFAULT_GROQ_VISION_MODEL = GROQ_VISION_MODELS[0];
// Groq currently lists one image-capable model; never fall back to a text-only model.
export const FALLBACK_GROQ_VISION_MODEL = GROQ_VISION_MODELS[0];
