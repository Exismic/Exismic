import { CREDIT_COSTS } from "@/lib/credit-policy";

export interface ApiToolDefinition {
  toolId: string;
  name: string;
  category: "ai" | "image" | "student" | "pdf" | "video" | "audio";
  description: string;
  creditCost: number;
  inputSchema: {
    fields: {
      name: string;
      type: "string" | "number" | "boolean" | "array";
      required: boolean;
      description: string;
      default?: any;
    }[];
    example: Record<string, any>;
  };
  outputExample: Record<string, any>;
}

export const API_TOOL_REGISTRY: Record<string, ApiToolDefinition> = {
  "generate-text": {
    toolId: "generate-text",
    name: "AI Text & Content Generator",
    category: "ai",
    description: "Generate high quality text, articles, summaries, and responses using Groq GPT OSS & Qwen LLMs.",
    creditCost: 5,
    inputSchema: {
      fields: [
        { name: "prompt", type: "string", required: true, description: "The prompt or instruction for the AI" },
        { name: "systemPrompt", type: "string", required: false, description: "Optional system persona instructions" },
        { name: "temperature", type: "number", required: false, description: "Creativity temperature (0.0 to 1.0)", default: 0.7 },
        { name: "maxTokens", type: "number", required: false, description: "Max output tokens limit", default: 2048 },
      ],
      example: {
        prompt: "Write a high-converting email newsletter about AI in web development",
        temperature: 0.7,
      },
    },
    outputExample: {
      success: true,
      text: "Subject: The AI Revolution in Web Dev...",
      model: "openai/gpt-oss-120b",
      usage: { creditsDeducted: 5, remainingCredits: 495 },
    },
  },

  "bg-remove": {
    toolId: "bg-remove",
    name: "AI Background Remover",
    category: "image",
    description: "Remove image backgrounds with high precision, returning transparent PNGs.",
    creditCost: 4,
    inputSchema: {
      fields: [
        { name: "imageUrl", type: "string", required: false, description: "Public URL of the image to process" },
        { name: "imageBase64", type: "string", required: false, description: "Base64 data URI string of the image" },
      ],
      example: {
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
      },
    },
    outputExample: {
      success: true,
      format: "png",
      imageBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      usage: { creditsDeducted: 4, remainingCredits: 491 },
    },
  },

  "essay-outline": {
    toolId: "essay-outline",
    name: "Academic Essay Outline Generator",
    category: "student",
    description: "Generate structured, university-grade essay outlines with thesis options and academic citations.",
    creditCost: 5,
    inputSchema: {
      fields: [
        { name: "topic", type: "string", required: true, description: "Essay topic or thesis question" },
        { name: "paperType", type: "string", required: false, description: "Type of paper (e.g. argumentative, analytical, expository)", default: "argumentative" },
        { name: "academicTone", type: "string", required: false, description: "Academic tone level", default: "undergraduate" },
      ],
      example: {
        topic: "The Ethical Implications of Generative AI in Creative Industries",
        paperType: "argumentative",
        academicTone: "undergraduate",
      },
    },
    outputExample: {
      success: true,
      data: {
        thesisOptions: ["Option 1...", "Option 2..."],
        sections: [{ title: "I. Introduction", points: ["Hook...", "Context..."] }],
        scholarKeywords: ["AI ethics creative labor", "algorithmic copyright"],
      },
      usage: { creditsDeducted: 5, remainingCredits: 486 },
    },
  },

  "plagiarism-checker": {
    toolId: "plagiarism-checker",
    name: "Semantic Plagiarism & Paraphrase Auditor",
    category: "student",
    description: "Compare source and draft text to identify exact overlaps and semantic paraphrasing.",
    creditCost: 6,
    inputSchema: {
      fields: [
        { name: "doc1", type: "string", required: true, description: "Original source document text" },
        { name: "doc2", type: "string", required: true, description: "Draft document text to audit" },
      ],
      example: {
        doc1: "Artificial intelligence systems analyze large datasets to recognize intricate patterns.",
        doc2: "AI software inspects vast amounts of information to discover complex trends.",
      },
    },
    outputExample: {
      success: true,
      data: {
        exactMatchScore: 12,
        semanticSimilarityScore: 88,
        riskLevel: "Moderate Paraphrase Risk",
        summary: "High semantic overlap detected in sentence structures.",
      },
      usage: { creditsDeducted: 6, remainingCredits: 480 },
    },
  },

  "readability-assessor": {
    toolId: "readability-assessor",
    name: "Linguistic Readability & Complexity Assessor",
    category: "student",
    description: "Evaluate Flesch-Kincaid grade level, detect jargon, and receive simplified rewrites.",
    creditCost: 4,
    inputSchema: {
      fields: [
        { name: "text", type: "string", required: true, description: "Text passage to evaluate" },
      ],
      example: {
        text: "The epistemological foundations of decentralized algorithmic governance require careful empirical scrutiny.",
      },
    },
    outputExample: {
      success: true,
      data: {
        fleschEase: 32,
        gradeLevel: "Graduate Level",
        targetAudience: "Academic / Specialist",
        jargonWords: ["epistemological", "algorithmic"],
      },
      usage: { creditsDeducted: 4, remainingCredits: 476 },
    },
  },

  "youtube-summarizer": {
    toolId: "youtube-summarizer",
    name: "YouTube Video AI Summarizer & Repurposer",
    category: "ai",
    description: "Extract transcripts and generate structured summaries, blog posts, or social media threads.",
    creditCost: 8,
    inputSchema: {
      fields: [
        { name: "url", type: "string", required: true, description: "YouTube video URL" },
        { name: "format", type: "string", required: false, description: "'summary' | 'blog' | 'thread' | 'transcript'", default: "summary" },
      ],
      example: {
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        format: "summary",
      },
    },
    outputExample: {
      success: true,
      title: "Video Title",
      result: "# Summary Overview\nKey takeaways from the video...",
      usage: { creditsDeducted: 8, remainingCredits: 468 },
    },
  },

  "landing-page-generator": {
    toolId: "landing-page-generator",
    name: "AI Landing Page HTML Generator",
    category: "ai",
    description: "Generate responsive, Tailwind-styled landing page HTML drafts from natural language prompts.",
    creditCost: 12,
    inputSchema: {
      fields: [
        { name: "prompt", type: "string", required: true, description: "Description of the product or service" },
        { name: "style", type: "string", required: false, description: "Design style ('modern' | 'minimal' | 'cyberpunk' | 'luxury')", default: "modern" },
      ],
      example: {
        prompt: "A modern SaaS for automated cloud cost optimization with dark theme and glassmorphism",
        style: "modern",
      },
    },
    outputExample: {
      success: true,
      html: "<!DOCTYPE html><html lang='en'><head>...</head><body>...</body></html>",
      usage: { creditsDeducted: 12, remainingCredits: 456 },
    },
  },
};

export function getAllApiTools(): ApiToolDefinition[] {
  return Object.values(API_TOOL_REGISTRY);
}

export function getApiToolDefinition(toolId: string): ApiToolDefinition | null {
  return API_TOOL_REGISTRY[toolId] || null;
}
