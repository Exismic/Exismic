import { TOOLS, Tool } from './tools';

export interface WorkflowSuggestion {
  targetToolId: string;
  badge?: string;
  reason: string;
  actionText?: string;
}

export interface ToolWorkflowConfig {
  headline?: string;
  subtitle?: string;
  suggestions: WorkflowSuggestion[];
}

/**
 * Intelligent cross-tool workflow recommendations mapping.
 * Maps tool IDs to their complementary next steps.
 */
export const TOOL_WORKFLOWS: Record<string, ToolWorkflowConfig> = {
  // Resume & Career Tools
  'resume-builder': {
    headline: 'Recommended Next Steps for Your Resume',
    subtitle: 'Optimize your new resume for job applications and ATS scanners.',
    suggestions: [
      {
        targetToolId: 'resume-analyzer',
        badge: 'Recommended',
        reason: 'Scan your resume against job descriptions to score ATS compatibility & missing keywords.',
        actionText: 'Scan ATS Score'
      },
      {
        targetToolId: 'resume-bullet-generator',
        badge: 'Popular',
        reason: 'Generate STAR-formula metric bullet points tailored to your target position.',
        actionText: 'Enhance Bullets'
      },
      {
        targetToolId: 'grammar-checker',
        reason: 'Proofread your resume for spelling, tone, and grammar flaws.',
        actionText: 'Check Grammar'
      }
    ]
  },
  'resume-analyzer': {
    headline: 'Upgrade & Fix Your Resume',
    subtitle: 'Use these tools to boost your ATS match score based on feedback.',
    suggestions: [
      {
        targetToolId: 'resume-builder',
        badge: 'Essential',
        reason: 'Edit and rebuild your resume using clean, ATS-formatted templates.',
        actionText: 'Open Builder'
      },
      {
        targetToolId: 'resume-bullet-generator',
        badge: 'STAR Method',
        reason: 'Rewrite low-scoring achievement bullets with impactful metric statements.',
        actionText: 'Fix Bullets'
      },
      {
        targetToolId: 'ai-humanizer',
        reason: 'Make AI-written resume sections sound natural and human.',
        actionText: 'Humanize Text'
      }
    ]
  },
  'resume-bullet-generator': {
    headline: 'Complete Your Resume Optimization',
    subtitle: 'Take your newly generated STAR bullets directly into your resume.',
    suggestions: [
      {
        targetToolId: 'resume-builder',
        badge: 'Next Step',
        reason: 'Paste your new STAR bullets into a professional ATS resume template.',
        actionText: 'Build Resume'
      },
      {
        targetToolId: 'resume-analyzer',
        reason: 'Scan your complete resume to test ATS match confidence.',
        actionText: 'Run ATS Test'
      }
    ]
  },

  // Image & Visual Design Tools
  'image-eraser': {
    headline: 'Next Steps for Your Clean Cutout',
    subtitle: 'Enhance, resize, or compress your background-removed photo.',
    suggestions: [
      {
        targetToolId: 'image-resizer',
        badge: 'Popular',
        reason: 'Crop and frame your transparent PNG to exact social media dimensions.',
        actionText: 'Resize & Crop'
      },
      {
        targetToolId: 'image-compressor',
        badge: 'Optimize',
        reason: 'Compress file size without losing transparent cutout resolution.',
        actionText: 'Compress PNG'
      },
      {
        targetToolId: 'svg-vectorizer',
        reason: 'Trace your image into a scalable vector SVG file.',
        actionText: 'Vectorize SVG'
      }
    ]
  },
  'svg-vectorizer': {
    headline: 'Continue Editing Vector Assets',
    subtitle: 'Remove background or resize your new SVG vector graphic.',
    suggestions: [
      {
        targetToolId: 'image-eraser',
        reason: 'Remove remaining background elements from your source photo.',
        actionText: 'Remove Background'
      },
      {
        targetToolId: 'image-converter',
        reason: 'Convert SVG files to high-res WebP or PNG format.',
        actionText: 'Convert Format'
      }
    ]
  },
  'image-compressor': {
    headline: 'Further Process Your Compressed Images',
    subtitle: 'Convert formats or remove backgrounds for web readiness.',
    suggestions: [
      {
        targetToolId: 'image-converter',
        badge: 'Web Ready',
        reason: 'Convert images to ultra-fast WEBP format for web performance.',
        actionText: 'Convert to WEBP'
      },
      {
        targetToolId: 'image-resizer',
        reason: 'Adjust pixel dimensions for desktop & mobile viewports.',
        actionText: 'Resize Dimensions'
      }
    ]
  },
  'ai-img-gen': {
    headline: 'Refine & Polish Your AI Artwork',
    subtitle: 'Remove background, upscale, or convert your AI-generated art.',
    suggestions: [
      {
        targetToolId: 'image-eraser',
        badge: 'AI Cutout',
        reason: 'Isolate the main subject from your AI image background.',
        actionText: 'Cutout Subject'
      },
      {
        targetToolId: 'image-restorer',
        badge: 'Upscale',
        reason: 'Enhance facial details and clarity using AI restoration.',
        actionText: 'Enhance Clarity'
      },
      {
        targetToolId: 'social-caption-generator',
        reason: 'Generate viral Instagram and Twitter captions for your artwork.',
        actionText: 'Generate Caption'
      }
    ]
  },

  // Writing & AI Tools
  'ai-writer': {
    headline: 'Perfect Your AI Copy',
    subtitle: 'Humanize text, check AI probability, or polish grammar.',
    suggestions: [
      {
        targetToolId: 'ai-humanizer',
        badge: 'Bypass AI',
        reason: 'Rewrite AI draft to sound 100% natural and pass AI detectors.',
        actionText: 'Humanize Text'
      },
      {
        targetToolId: 'ai-detector',
        badge: 'Scan Text',
        reason: 'Check sentence-level perplexity and AI writing confidence.',
        actionText: 'Detect AI'
      },
      {
        targetToolId: 'grammar-checker',
        reason: 'Fix grammar, spelling, and tone across your generated draft.',
        actionText: 'Fix Grammar'
      }
    ]
  },
  'ai-humanizer': {
    headline: 'Verify & Polish Your Writing',
    subtitle: 'Test AI detector scores and refine grammar.',
    suggestions: [
      {
        targetToolId: 'ai-detector',
        badge: 'Recommended',
        reason: 'Verify that your humanized draft scores as human-written.',
        actionText: 'Run AI Detector'
      },
      {
        targetToolId: 'grammar-checker',
        reason: 'Ensure flow, punctuation, and clarity are pristine.',
        actionText: 'Check Style'
      }
    ]
  },
  'ai-detector': {
    headline: 'Fix High AI Confidence Passages',
    subtitle: 'Use these tools to make flagged sentences sound authentic.',
    suggestions: [
      {
        targetToolId: 'ai-humanizer',
        badge: 'Fix AI Score',
        reason: 'Transform flagged sentences into smooth, organic human prose.',
        actionText: 'Humanize Now'
      },
      {
        targetToolId: 'grammar-checker',
        reason: 'Rephrase rigid phrasing with natural sentence structure.',
        actionText: 'Polish Tone'
      }
    ]
  },

  // Student & Academic Tools
  'productivity-units': {
    headline: 'More Student & Science Tools',
    subtitle: 'Explore companion tools for math, physics, and academic study.',
    suggestions: [
      {
        targetToolId: 'pdf-ocr',
        badge: 'Scan Notes',
        reason: 'Extract printable formulas and text from scanned PDF textbooks.',
        actionText: 'OCR Scan'
      },
      {
        targetToolId: 'ai-writer',
        reason: 'Draft lab reports, essay outlines, and research summaries.',
        actionText: 'Draft Essay'
      }
    ]
  },
  'pdf-ocr': {
    headline: 'Next Steps with Extracted Text',
    subtitle: 'Summarize, convert, or format your scanned text.',
    suggestions: [
      {
        targetToolId: 'pdf-to-word',
        badge: 'Convert Doc',
        reason: 'Convert scanned PDF directly to an editable Microsoft Word document.',
        actionText: 'Convert to Word'
      },
      {
        targetToolId: 'ai-writer',
        reason: 'Summarize or rewrite your extracted OCR text with AI.',
        actionText: 'Summarize Text'
      }
    ]
  },

  // Audio Tools
  'audio-vocal-remover': {
    headline: 'Complete Audio Studio Workflow',
    subtitle: 'Split full instrumental stems or clean background noise.',
    suggestions: [
      {
        targetToolId: 'audio-stem-splitter',
        badge: 'Full Stems',
        reason: 'Separate drums, bass, vocals, and synth tracks independently.',
        actionText: 'Split Stems'
      },
      {
        targetToolId: 'audio-noise-remover',
        reason: 'Clean hums, hiss, and background room noise from vocals.',
        actionText: 'Denoise Audio'
      }
    ]
  },
  'audio-tts': {
    headline: 'Add Subtitles or Transcribe Speech',
    subtitle: 'Enhance your voiceovers with transcription and subtitles.',
    suggestions: [
      {
        targetToolId: 'audio-stt',
        badge: 'Transcribe',
        reason: 'Transcribe spoken audio into timestamped text transcripts.',
        actionText: 'Transcribe Speech'
      },
      {
        targetToolId: 'video-subtitles',
        reason: 'Auto-generate timed captions and burn them onto your video.',
        actionText: 'Add Subtitles'
      }
    ]
  }
};

/**
 * Retrieves recommended tools for a given tool ID.
 * Uses exact workflow mapping if defined, otherwise falls back to category companions.
 */
export function getSuggestedToolsFor(currentToolId: string, currentCategoryId: string): {
  headline: string;
  subtitle: string;
  items: Array<{ tool: Tool; suggestion: WorkflowSuggestion }>;
} {
  const workflow = TOOL_WORKFLOWS[currentToolId];

  if (workflow && workflow.suggestions.length > 0) {
    const items: Array<{ tool: Tool; suggestion: WorkflowSuggestion }> = [];
    for (const sugg of workflow.suggestions) {
      const found = TOOLS.find(t => t.id === sugg.targetToolId);
      if (found && found.id !== currentToolId) {
        items.push({ tool: found, suggestion: sugg });
      }
    }

    if (items.length > 0) {
      return {
        headline: workflow.headline || 'Recommended Next Tools',
        subtitle: workflow.subtitle || 'Supercharge your output with complementary tools.',
        items
      };
    }
  }

  // Fallback: Pick up to 3 tools from the same category
  const categoryCompanions = TOOLS.filter(t => t.category === currentCategoryId && t.id !== currentToolId).slice(0, 3);
  return {
    headline: 'Explore Companion Tools',
    subtitle: 'More tools to streamline your workflow in this category.',
    items: categoryCompanions.map(t => ({
      tool: t,
      suggestion: {
        targetToolId: t.id,
        reason: t.description,
        actionText: 'Launch Tool'
      }
    }))
  };
}
