/**
 * Centralized Groq & AI model definitions for Exismic.
 * Updating model names here propagates across all API routes and background tools.
 */

export const GROQ_TEXT_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
] as const;

export const GROQ_VISION_MODELS = [
  "llama-3.2-11b-vision-preview",
  "llama-3.2-90b-vision-preview",
] as const;

export const DEFAULT_GROQ_TEXT_MODEL = GROQ_TEXT_MODELS[0];
export const FALLBACK_GROQ_TEXT_MODEL = GROQ_TEXT_MODELS[1];

export const DEFAULT_GROQ_VISION_MODEL = GROQ_VISION_MODELS[0];
export const FALLBACK_GROQ_VISION_MODEL = GROQ_VISION_MODELS[1];
