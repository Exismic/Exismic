/**
 * Centralized Groq & AI model definitions for Exismic.
 * Updating model names here propagates across all API routes and background tools.
 */

export const GROQ_TEXT_MODELS = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.6-27b",
] as const;

export const GROQ_VISION_MODELS = [
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "qwen/qwen3.6-27b",
] as const;

export const DEFAULT_GROQ_TEXT_MODEL = GROQ_TEXT_MODELS[0];
export const FALLBACK_GROQ_TEXT_MODEL = GROQ_TEXT_MODELS[1];

export const DEFAULT_GROQ_VISION_MODEL = GROQ_VISION_MODELS[0];
export const FALLBACK_GROQ_VISION_MODEL = GROQ_VISION_MODELS[1];
