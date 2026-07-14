export type ToolReliabilityLevel =
  | "operational"
  | "service-backed"
  | "client-only"
  | "limited"
  | "unavailable";

export interface ToolReliability {
  level: ToolReliabilityLevel;
  label: string;
  headline: string;
  description: string;
  requirements?: string[];
  dependencyGroups?: Array<{
    label: string;
    env: string[];
    optional?: boolean;
  }>;
}

const SERVICE_BACKED: ToolReliability = {
  level: "service-backed",
  label: "AI Powered",
  headline: "AI-Powered Workflow",
  description:
    "This tool uses Exismic backend processing and requires active AI provider API keys.",
};

const CLIENT_ONLY: ToolReliability = {
  level: "client-only",
  label: "Offline",
  headline: "Runs in your browser",
  description:
    "This tool completes its work locally in your browser and does not require external API services.",
};

const SERVER_PROCESSED: ToolReliability = {
  level: "operational",
  label: "Live",
  headline: "Secure document processing",
  description:
    "This tool validates the upload on Exismic servers and returns the generated file directly without persistent result storage.",
};

export const TOOL_RELIABILITY: Record<string, ToolReliability> = {
  "image-eraser": {
    ...SERVICE_BACKED,
    label: "AI Powered",
    description:
      "Background removal uses advanced image segmenters with local or cloud processing fallbacks.",
    requirements: [
      "Image processing service configuration",
      "Image processing authentication token",
    ],
    dependencyGroups: [
      { label: "Image processing endpoint", env: ["MODAL_IMAGE_PRIORITY_URL", "MODAL_IMAGE_URL", "MODAL_IMAGE_NORMAL_URL"], optional: true },
      { label: "Image processing API key", env: ["MODAL_IMAGE_PRIORITY_API_KEY", "MODAL_IMAGE_API_KEY", "MODAL_IMAGE_NORMAL_API_KEY"], optional: true },
      { label: "Fallback provider", env: ["HUGGINGFACE_TOKEN", "REMOVE_BG_API_KEY", "FAL_KEY"], optional: true },
    ],
  },
  "image-restorer": {
    level: "unavailable",
    label: "Maintenance",
    headline: "Photo Restorer is temporarily offline",
    description:
      "This tool is undergoing routine optimization and performance updates. It will be back online shortly.",
  },
  "image-minecraft-skin": {
    ...SERVICE_BACKED,
    label: "AI Powered",
    headline: "UV-safe character generation",
    description:
      "Exismic turns the character brief into a structured design, compiles a valid 64x64 skin texture, and verifies it in an interactive 3D preview.",
    requirements: ["Language model credentials"],
    dependencyGroups: [
      { label: "AI design director", env: ["GROQ_API_KEYS", "GROQ_API_KEY"], optional: true },
    ],
  },
  "watermark-remover": {
    ...SERVICE_BACKED,
    label: "AI Powered",
    description:
      "Watermark removal uses server-side inpainting. Results depend on the configured image inpainting service.",
    requirements: ["Inpainting API configuration"],
    dependencyGroups: [
      { label: "Watermark remover endpoint", env: ["MODAL_WATERMARK_REMOVER_PRIORITY_URL", "MODAL_WATERMARK_REMOVER_URL", "MODAL_WATERMARK_REMOVER_NORMAL_URL"] },
      { label: "Watermark remover API key", env: ["MODAL_WATERMARK_REMOVER_PRIORITY_API_KEY", "MODAL_WATERMARK_REMOVER_API_KEY", "MODAL_WATERMARK_REMOVER_NORMAL_API_KEY"], optional: true },
    ],
  },
  "ai-img-gen": {
    ...SERVICE_BACKED,
    label: "AI Powered",
    requirements: ["Image generation provider credentials"],
    dependencyGroups: [
      { label: "Image generation provider", env: ["TOGETHER_API_KEY", "FAL_KEY", "HUGGINGFACE_TOKEN"] },
    ],
  },
  "ai-logo": {
    ...SERVICE_BACKED,
    label: "AI Powered",
    requirements: ["Image generation provider credentials"],
    dependencyGroups: [
      { label: "Image generation provider", env: ["TOGETHER_API_KEY", "FAL_KEY", "HUGGINGFACE_TOKEN"] },
    ],
  },
  "ai-writer": {
    ...SERVICE_BACKED,
    label: "AI Powered",
    requirements: ["Language model API credentials"],
    dependencyGroups: [{ label: "Language model provider", env: ["GROQ_API_KEYS", "GROQ_API_KEY"] }],
  },
  "ai-code": {
    ...SERVICE_BACKED,
    label: "AI Powered",
    requirements: ["Language model API credentials"],
    dependencyGroups: [{ label: "Language model provider", env: ["GROQ_API_KEYS", "GROQ_API_KEY"] }],
  },
  "ai-chat": {
    ...SERVICE_BACKED,
    label: "AI Powered",
    requirements: ["Language model API credentials"],
    dependencyGroups: [{ label: "Language model provider", env: ["GROQ_API_KEYS", "GROQ_API_KEY"] }],
  },
  "screenshot-to-code": {
    ...SERVICE_BACKED,
    label: "AI Powered",
    requirements: ["Vision language model credentials"],
    dependencyGroups: [{ label: "Vision provider", env: ["GROQ_API_KEYS", "GROQ_API_KEY"] }],
  },
  "social-caption-generator": {
    ...SERVICE_BACKED,
    label: "AI Powered",
    requirements: ["Vision language model credentials"],
    dependencyGroups: [{ label: "Vision provider", env: ["GROQ_API_KEYS", "GROQ_API_KEY"] }],
  },
  "resume-builder": {
    ...SERVICE_BACKED,
    label: "AI Powered",
    description:
      "The resume editor runs locally; AI rewrite, full generation, and ATS analysis require language model credentials.",
    requirements: ["Language model API credentials"],
    dependencyGroups: [{ label: "Language model provider", env: ["GROQ_API_KEYS", "GROQ_API_KEY"], optional: true }],
  },
  "audio-vocal-remover": {
    ...SERVICE_BACKED,
    label: "AI Powered",
    requirements: ["Audio processing engine configuration"],
    dependencyGroups: [
      { label: "Audio engine endpoint", env: ["MODAL_AUDIO_URL", "NEXT_PUBLIC_MODAL_AUDIO_URL"], optional: true },
      { label: "Fallback engine credentials", env: ["HUGGINGFACE_TOKEN"], optional: true },
    ],
  },
  "audio-stem-splitter": {
    ...SERVICE_BACKED,
    label: "AI Powered",
    requirements: ["Audio processing engine configuration"],
    dependencyGroups: [
      { label: "Audio engine endpoint", env: ["MODAL_AUDIO_URL", "NEXT_PUBLIC_MODAL_AUDIO_URL"], optional: true },
      { label: "Fallback engine credentials", env: ["HUGGINGFACE_TOKEN"], optional: true },
    ],
  },
  "audio-noise-remover": {
    ...SERVICE_BACKED,
    label: "AI Powered",
    requirements: ["Audio processing engine configuration"],
    dependencyGroups: [
      { label: "Audio engine endpoint", env: ["MODAL_AUDIO_URL"], optional: true },
      { label: "Fallback engine credentials", env: ["HUGGINGFACE_TOKEN"], optional: true },
    ],
  },
  "audio-tts": {
    ...SERVICE_BACKED,
    label: "AI Powered",
    requirements: ["Speech synthesis API credentials"],
    dependencyGroups: [{ label: "Speech synthesis provider", env: ["ELEVENLABS_API_KEY"] }],
  },
  "audio-stt": {
    ...SERVICE_BACKED,
    label: "AI Powered",
    description:
      "Speech transcription uses a multilingual Whisper model through Exismic's secured backend.",
    requirements: ["Language model API credentials"],
    dependencyGroups: [{ label: "Transcription provider", env: ["GROQ_API_KEYS", "GROQ_API_KEY"] }],
  },
  "video-bg-remover": {
    level: "unavailable",
    label: "Maintenance",
    headline: "Video BG Remover is temporarily offline",
    description:
      "This tool is undergoing routine optimization and performance updates. It will be back online shortly.",
  },
  "video-trimmer": {
    ...SERVICE_BACKED,
    description: "Server-side trimming re-encodes the selected range for reliable playback and accurate cut points.",
    requirements: ["Video processing service configuration"],
    dependencyGroups: [
      { label: "Video processing endpoint", env: ["MODAL_VIDEO_URL"], optional: true },
      { label: "Server-side media handler", env: ["FFMPEG_PATH"], optional: true },
    ],
  },
  "video-compressor": {
    ...SERVICE_BACKED,
    description: "Quality-tuned H.264 and VP9 encoding reduces size while retaining the source audio.",
    requirements: ["Video processing service configuration"],
    dependencyGroups: [{ label: "Video processing endpoint", env: ["MODAL_VIDEO_URL"] }],
  },
  "video-subtitles": {
    ...SERVICE_BACKED,
    description: "Whisper transcription creates standards-compliant SRT captions and can burn them into an MP4.",
    requirements: ["Video processing service configuration"],
    dependencyGroups: [{ label: "Video processing endpoint", env: ["MODAL_VIDEO_URL"] }],
  },
  "video-enhancer": {
    ...SERVICE_BACKED,
    description: "Server-side denoise, sharpening, color, stabilization, and upscale filters produce a real enhanced MP4.",
    requirements: ["Video enhancement service configuration"],
    dependencyGroups: [{ label: "Video enhancer endpoint", env: ["MODAL_VIDEO_ENHANCER_PRIORITY_URL", "MODAL_VIDEO_ENHANCER_URL", "MODAL_VIDEO_PRIORITY_URL", "MODAL_VIDEO_URL"] }],
  },
  "video-gif": {
    ...SERVICE_BACKED,
    description: "Palette generation and high-quality dithering create smoother, cleaner looping GIFs.",
    requirements: ["Video processing service configuration"],
    dependencyGroups: [{ label: "Video processing endpoint", env: ["MODAL_VIDEO_URL"], optional: true }],
  },
  "video-merger": {
    ...SERVICE_BACKED,
    description: "Clips are normalized to a consistent frame, frame rate, and audio format before they are joined.",
    requirements: ["Video merger service configuration"],
    dependencyGroups: [{ label: "Video merger endpoint", env: ["MODAL_VIDEO_MERGER_URL", "MODAL_VIDEO_URL"], optional: true }],
  },
  "face-swap": {
    level: "unavailable",
    label: "Planned",
    headline: "Face Swap is planned",
    description:
      "The catalog entry exists, but the face-swap processor has not been connected yet. The upload flow will be enabled once live.",
  },
  "audio-voice-changer": {
    ...SERVICE_BACKED,
    label: "AI Powered",
    headline: "Performance-preserving voice conversion",
    description:
      "Voice Changer securely converts uploaded speech through Exismic's server-side voice provider.",
    requirements: ["ElevenLabs API credentials"],
    dependencyGroups: [
      { label: "Voice conversion provider", env: ["ELEVENLABS_API_KEY"] },
      { label: "Output voice", env: ["ELEVENLABS_VOICE_CHANGER_VOICE_ID"], optional: true },
    ],
  },
  "audio-music-gen": {
    level: "unavailable",
    label: "Planned",
    headline: "AI Music Generator is planned",
    description:
      "The catalog entry exists, but AI music generation has not been connected yet. The creation flow will be enabled once live.",
  },
  "image-compressor": CLIENT_ONLY,
  "image-resizer": CLIENT_ONLY,
  "image-converter": CLIENT_ONLY,
  "image-collage": CLIENT_ONLY,
  "youtube-thumbnail": CLIENT_ONLY,
  "meme-generator": CLIENT_ONLY,
  "typing-test": CLIENT_ONLY,
  "invoice-generator": {
    ...CLIENT_ONLY,
    description:
      "The invoice editor and PDF export run locally in your browser. AI invoice drafting requires active language model credentials.",
    requirements: ["Language model API credentials"],
    dependencyGroups: [{ label: "Language model assistant", env: ["GROQ_API_KEYS", "GROQ_API_KEY"], optional: true }],
  },
  "discord-card": {
    level: "service-backed",
    label: "Live",
    headline: "Live Discord profile",
    description:
      "Profile cosmetics use public Discord profile data. Live status can come directly from Exismic's Discord bot when the user shares its server, with Lanyard kept as a compatibility fallback.",
    requirements: ["Public Discord profile access", "Shared Discord server for official live presence"],
  },
  "pdf-merger": SERVER_PROCESSED,
  "pdf-splitter": SERVER_PROCESSED,
  "pdf-compressor": {
    ...SERVER_PROCESSED,
    description:
      "Exismic safely repacks PDF objects and only returns a smaller file when optimization genuinely reduces its size.",
  },
  "pdf-to-img": CLIENT_ONLY,
  "pdf-img-to-pdf": SERVER_PROCESSED,
  "pdf-to-word": {
    ...SERVER_PROCESSED,
    description:
      "PDF to Word extracts embedded text into an editable DOCX. Scanned documents should use OCR first.",
  },
  "pdf-ocr": {
    ...CLIENT_ONLY,
    description:
      "OCR renders pages and recognizes text in your browser. Language data is loaded only when a scan starts.",
  },
  "productivity-qr": CLIENT_ONLY,
  "productivity-passgen": CLIENT_ONLY,
  "productivity-units": CLIENT_ONLY,
  "productivity-palette": CLIENT_ONLY,
  "productivity-json": CLIENT_ONLY,
  "hashtag-generator": CLIENT_ONLY,
  "resume-analyzer": {
    ...SERVICE_BACKED,
    label: "AI Powered",
    headline: "ATS resume compatibility scan",
    description: "Exismic extracts text from your resume and matches it against your target job description using custom Llama model analysis.",
    requirements: ["Language model credentials"],
    dependencyGroups: [{ label: "Language model provider", env: ["GROQ_API_KEYS", "GROQ_API_KEY"] }],
  },
  "sfx-generator": {
    ...SERVICE_BACKED,
    label: "AI Powered",
    headline: "Sound effects generation",
    description: "Exismic interfaces with ElevenLabs audio models to generate high-fidelity sound clips from your text descriptions.",
    requirements: ["ElevenLabs API credentials"],
    dependencyGroups: [{ label: "Voice synthesis engine", env: ["ELEVENLABS_API_KEY"] }],
  },
  "svg-vectorizer": {
    ...SERVER_PROCESSED,
    headline: "Raster-to-Vector Tracing",
    description: "Exismic runs vector contour tracing locally on the server to convert your PNG/JPG bitmaps into fully scalable SVG graphics.",
  },
  "landing-page-generator": {
    ...SERVICE_BACKED,
    label: "AI Powered",
    headline: "Page synthesis engine",
    description: "Exismic queries Groq's high-performance LLMs to construct clean, modular, and fully styled Tailwind HTML templates from your prompts.",
    requirements: ["Groq API credentials"],
    dependencyGroups: [{ label: "Language model provider", env: ["GROQ_API_KEYS", "GROQ_API_KEY"] }],
  },
  "youtube-summarizer": {
    ...SERVICE_BACKED,
    label: "AI Powered",
    headline: "Video parsing & analysis",
    description: "Exismic downloads caption tracks directly from YouTube and uses Groq Llama-3.3 LLMs to transcribe, summarize, and draft content summaries.",
    requirements: ["Groq API credentials"],
    dependencyGroups: [{ label: "Language model provider", env: ["GROQ_API_KEYS", "GROQ_API_KEY"] }],
  },
  "qr-generator": {
    level: "operational",
    label: "AI Powered",
    headline: "Artistic controlnet diffusion",
    description: "Exismic generates high-contrast QR codes and blends them with Stable Diffusion artwork via Hugging Face's serverless GPU inference pipeline.",
    requirements: [],
    dependencyGroups: [],
  },
  "ambient-mixer": {
    level: "operational",
    label: "Audio Tool",
    headline: "Multichannel sound board & AI music",
    description: "Exismic uses the HTML5 Web Audio API to mix ambient loops client-side, with backing tracks generated by Meta's MusicGen model via Hugging Face.",
    requirements: [],
    dependencyGroups: [],
  },
};

export function getToolReliability(toolId: string): ToolReliability {
  return (
    TOOL_RELIABILITY[toolId] ?? {
      level: "operational",
      label: "Live",
      headline: "Operational",
      description: "This tool has an active Exismic workflow.",
    }
  );
}

export function isToolUnavailable(toolId: string) {
  return getToolReliability(toolId).level === "unavailable";
}
