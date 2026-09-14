import { TOOLS, Tool } from "@/data/tools";

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he", "in", "is", "it",
  "its", "of", "on", "that", "the", "to", "was", "were", "will", "with", "your", "you", "our",
  "free", "online", "tool", "tools", "generator", "checker", "maker", "easy", "best", "fast", "instant",
  "generate", "check", "create", "convert"
]);

function tokenize(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return new Set(words);
}

// Explicit semantic workflow clusters based on genuine user tasks and tool workflows
const WORKFLOW_CLUSTERS: Set<string>[] = [
  // 1. AI Text Editing, Integrity & Writing
  new Set([
    "ai-humanizer",
    "ai-detector",
    "grammar-checker",
    "ai-writer",
    "email-reply-generator",
    "social-caption-generator",
    "student-plagiarism-checker",
    "student-readability-assessor"
  ]),

  // 2. Career & Employment Documentation
  new Set([
    "resume-builder",
    "resume-analyzer",
    "resume-bullet-generator",
    "cover-letter-generator",
    "invoice-generator"
  ]),

  // 3. Image Editing & Graphic Processing
  new Set([
    "image-eraser",
    "image-compressor",
    "image-resizer",
    "image-converter",
    "image-watermark-remover",
    "image-vectorizer",
    "image-collage",
    "meme-generator",
    "youtube-thumbnail"
  ]),

  // 4. Generative AI Media & Branding
  new Set([
    "ai-img-gen",
    "ai-logo",
    "landing-page-generator",
    "youtube-summarizer",
    "qr-generator"
  ]),

  // 5. Video Creation & Post-Production
  new Set([
    "video-trimmer",
    "video-compressor",
    "video-subtitles",
    "video-enhancer",
    "video-to-gif",
    "video-merger"
  ]),

  // 6. Audio Engineering & Music
  new Set([
    "audio-vocal-remover",
    "audio-stem-splitter",
    "audio-noise-remover",
    "audio-tts",
    "audio-stt",
    "audio-voice-changer",
    "sfx-generator",
    "ambient-mixer"
  ]),

  // 7. PDF & Document Workflows
  new Set([
    "pdf-merger",
    "pdf-splitter",
    "pdf-compressor",
    "pdf-to-img",
    "pdf-img-to-pdf",
    "pdf-to-word",
    "pdf-ocr",
    "pdf-to-notes"
  ]),

  // 8. Search Engine Optimization (SEO)
  new Set([
    "meta-title-generator",
    "meta-description-generator",
    "robots-txt-generator",
    "sitemap-generator",
    "keyword-density-checker",
    "schema-markup-generator",
    "seo-serp-simulator",
    "seo-og-previewer",
    "seo-canonical-generator"
  ]),

  // 9. Web Developer & Encoding Utilities
  new Set([
    "base64-encoder",
    "uuid-generator",
    "hash-generator",
    "regex-tester",
    "lorem-ipsum-generator",
    "developer-json-to-types",
    "developer-svg-optimizer",
    "developer-cron-generator",
    "sql-builder",
    "productivity-json",
    "productivity-passgen"
  ]),

  // 10. Student Academic & Study Suite
  new Set([
    "math-solver",
    "pdf-to-notes",
    "flashcard-generator",
    "citation-generator",
    "student-essay-outline-builder",
    "student-plagiarism-checker",
    "student-readability-assessor"
  ]),

  // 11. Business, Invoicing & Financial Calculators
  new Set([
    "gst-calculator",
    "profit-margin-calculator",
    "emi-calculator",
    "salary-calculator",
    "invoice-generator"
  ]),

  // 12. Social Media Creator Suite
  new Set([
    "youtube-thumbnail",
    "meme-generator",
    "hashtag-generator",
    "social-caption-generator",
    "creator-hook-script-generator",
    "creator-linkedin-formatter",
    "creator-thumbnail-analyzer",
    "creator-carousel-generator"
  ])
];

/**
 * Returns 2 to 4 genuinely relevant peer tools based on semantic workflow clusters,
 * shared category affinity, and meaningful descriptive token overlap.
 * Strictly excludes the current tool and duplicate destinations.
 */
export function getRelatedTools(currentTool: Tool, minCount = 2, maxCount = 4): Tool[] {
  const currentTokens = tokenize(
    `${currentTool.name} ${currentTool.description} ${(currentTool.seoKeywords || []).join(" ")} ${(currentTool.suggestions || []).join(" ")}`
  );

  const matchedClusters = WORKFLOW_CLUSTERS.filter((cluster) =>
    cluster.has(currentTool.id)
  );

  const candidates = TOOLS.filter(
    (t) =>
      t.id !== currentTool.id &&
      t.indexable !== false &&
      !t.hidden &&
      t.href.startsWith("/tools/")
  );

  const scored = candidates.map((candidate) => {
    let score = 0;

    // 1. Semantic workflow cluster match (highest affinity: shared user workflow)
    for (const cluster of matchedClusters) {
      if (cluster.has(candidate.id)) {
        score += 50;
      }
    }

    // 2. Primary category match (thematic affinity)
    if (candidate.category === currentTool.category) {
      score += 30;
    }

    // 3. Keyword / descriptive token overlap
    const candidateTokens = tokenize(
      `${candidate.name} ${candidate.description} ${(candidate.seoKeywords || []).join(" ")} ${(candidate.suggestions || []).join(" ")}`
    );

    let tokenMatches = 0;
    for (const token of candidateTokens) {
      if (currentTokens.has(token)) {
        tokenMatches++;
      }
    }
    score += Math.min(tokenMatches * 5, 25);

    return { candidate, score };
  });

  // Filter only genuinely relevant candidates (threshold >= 30)
  const relevant = scored.filter((item) => item.score >= 30);
  relevant.sort((a, b) => b.score - a.score);

  if (relevant.length === 0) {
    // Graceful fallback to same-category tools if no cluster matched
    const sameCat = candidates.filter((c) => c.category === currentTool.category);
    return sameCat.slice(0, Math.min(sameCat.length, maxCount));
  }

  const count = Math.min(Math.max(relevant.length, minCount), maxCount);
  return relevant.slice(0, count).map((item) => item.candidate);
}
