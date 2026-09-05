import { TOOLS, Tool } from './tools';

export interface WorkflowSuggestion {
  targetToolId: string;
  badge?: string;
  reason: string;
  actionText?: string;
  tone?: string;
}

export interface ToolWorkflowConfig {
  headline?: string;
  subtitle?: string;
  suggestions: WorkflowSuggestion[];
}

/**
 * Intelligent cross-tool workflow recommendations mapping.
 * Maps tool IDs to their complementary next steps.
 * All descriptions and action text use simple, natural English.
 */
export const TOOL_WORKFLOWS: Record<string, ToolWorkflowConfig> = {
  // Resume & Career Tools
  'resume-builder': {
    headline: 'Recommended Next Steps for Your Resume',
    subtitle: 'Optimize your new resume for job applications, recruiters, and scanners.',
    suggestions: [
      {
        targetToolId: 'resume-analyzer',
        badge: 'Recommended',
        reason: 'Scan your resume against any job description to check your match rate and missing keywords.',
        actionText: 'Scan ATS Score',
        tone: 'from-blue-500/10 to-indigo-500/10 border-blue-500/30 text-blue-300'
      },
      {
        targetToolId: 'cover-letter-generator',
        badge: 'Popular',
        reason: 'Generate a matching application letter tailored to the work history on your resume.',
        actionText: 'Write Cover Letter',
        tone: 'from-purple-500/10 to-fuchsia-500/10 border-purple-500/30 text-purple-300'
      },
      {
        targetToolId: 'resume-bullet-generator',
        reason: 'Upgrade simple job duty statements into strong, achievement-focused bullet points.',
        actionText: 'Polish Bullets',
        tone: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-300'
      },
      {
        targetToolId: 'grammar-checker',
        reason: 'Proofread your resume text for spelling, active tone, and formatting flaws.',
        actionText: 'Check Grammar',
        tone: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-300'
      }
    ]
  },
  'resume-analyzer': {
    headline: 'Improve & Match Your Resume',
    subtitle: 'Use these tools to boost your match score and apply with confidence.',
    suggestions: [
      {
        targetToolId: 'cover-letter-generator',
        badge: 'Next Step',
        reason: 'Generate a targeted cover letter tailored to the exact job requirements you just analyzed.',
        actionText: 'Tailor Cover Letter',
        tone: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-cyan-300'
      },
      {
        targetToolId: 'resume-bullet-generator',
        badge: 'Boost Score',
        reason: 'Rewrite low-scoring bullet points with strong action verbs and quantified achievements.',
        actionText: 'Fix Weak Bullets',
        tone: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-300'
      },
      {
        targetToolId: 'resume-builder',
        reason: 'Apply your improved points directly inside a clean, ATS-ready resume template.',
        actionText: 'Edit in Builder',
        tone: 'from-purple-500/10 to-indigo-500/10 border-purple-500/30 text-purple-300'
      },
      {
        targetToolId: 'ai-humanizer',
        reason: 'Make your resume summary sound natural, confident, and authentic.',
        actionText: 'Humanize Summary',
        tone: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-300'
      }
    ]
  },
  'resume-bullet-generator': {
    headline: 'Put Your Bullets to Work',
    subtitle: 'Take your newly generated achievement bullets directly into your job application.',
    suggestions: [
      {
        targetToolId: 'resume-builder',
        badge: 'Recommended',
        reason: 'Paste your new accomplishment bullets into a professional ATS resume template.',
        actionText: 'Build Resume',
        tone: 'from-purple-500/10 to-indigo-500/10 border-purple-500/30 text-purple-300'
      },
      {
        targetToolId: 'cover-letter-generator',
        badge: 'Popular',
        reason: 'Highlight these same achievements in a tailored application letter.',
        actionText: 'Write Cover Letter',
        tone: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-cyan-300'
      },
      {
        targetToolId: 'resume-analyzer',
        reason: 'Test your updated resume against your target job description.',
        actionText: 'Scan ATS Score',
        tone: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-300'
      }
    ]
  },
  'cover-letter-generator': {
    headline: 'Polish & Complete Your Application',
    subtitle: 'Make sure your application materials are flawless before sending them out.',
    suggestions: [
      {
        targetToolId: 'grammar-checker',
        badge: 'Proofread',
        reason: 'Check for typos, punctuation, and clear phrasing before sending to recruiters.',
        actionText: 'Proofread Letter',
        tone: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-300'
      },
      {
        targetToolId: 'ai-humanizer',
        badge: 'Natural Tone',
        reason: 'Ensure your cover letter sounds authentic, friendly, and engaging.',
        actionText: 'Humanize Tone',
        tone: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-300'
      },
      {
        targetToolId: 'resume-analyzer',
        reason: 'Make sure your resume matches the job description as well as your cover letter.',
        actionText: 'Scan Resume ATS',
        tone: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-cyan-300'
      }
    ]
  },

  // YouTube & Video Tools
  'youtube-summarizer': {
    headline: 'Take Your Summary Further',
    subtitle: 'Turn your video summary into social posts, study cards, or natural notes.',
    suggestions: [
      {
        targetToolId: 'social-caption-generator',
        badge: 'Popular',
        reason: 'Turn the main points into engaging posts for Twitter, LinkedIn, or Instagram.',
        actionText: 'Create Social Post',
        tone: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-cyan-300'
      },
      {
        targetToolId: 'flashcard-generator',
        badge: 'Study Tool',
        reason: 'Convert key takeaways into interactive cards for fast revision.',
        actionText: 'Make Flashcards',
        tone: 'from-purple-500/10 to-fuchsia-500/10 border-purple-500/30 text-purple-300'
      },
      {
        targetToolId: 'pdf-to-notes',
        reason: 'Organize these takeaways into a structured study guide with questions and answers.',
        actionText: 'Organize Notes',
        tone: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-300'
      },
      {
        targetToolId: 'ai-humanizer',
        reason: 'Rewrite summary notes into friendly, conversational language.',
        actionText: 'Make It Natural',
        tone: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-300'
      }
    ]
  },

  // Student & Academic Tools
  'pdf-to-notes': {
    headline: 'Study & Review Your Notes',
    subtitle: 'Turn your new study notes into interactive flashcards or drafted essays.',
    suggestions: [
      {
        targetToolId: 'flashcard-generator',
        badge: 'Recommended',
        reason: 'Create digital study cards directly from your synthesized notes for exam prep.',
        actionText: 'Make Flashcards',
        tone: 'from-purple-500/10 to-fuchsia-500/10 border-purple-500/30 text-purple-300'
      },
      {
        targetToolId: 'ai-writer',
        badge: 'Expand',
        reason: 'Use these notes to draft an essay outline, report, or presentation.',
        actionText: 'Draft Essay',
        tone: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-cyan-300'
      },
      {
        targetToolId: 'grammar-checker',
        reason: 'Proofread summary points and definitions for clear, error-free study.',
        actionText: 'Check Grammar',
        tone: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-300'
      }
    ]
  },
  'flashcard-generator': {
    headline: 'Continue Studying',
    subtitle: 'Complement your flashcard study deck with deeper reading and notes.',
    suggestions: [
      {
        targetToolId: 'pdf-to-notes',
        badge: 'Study Notes',
        reason: 'Extract full notes, summaries, and Q&A guides from your textbooks.',
        actionText: 'PDF Study Notes',
        tone: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-300'
      },
      {
        targetToolId: 'citation-generator',
        reason: 'Generate formatted APA, MLA, or Harvard references for your study sources.',
        actionText: 'Make Citations',
        tone: 'from-blue-500/10 to-indigo-500/10 border-blue-500/30 text-blue-300'
      },
      {
        targetToolId: 'ai-writer',
        reason: 'Draft practice essays or study guides based on your flashcard topics.',
        actionText: 'Draft Study Guide',
        tone: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-300'
      }
    ]
  },

  // Writing & Copy Tools
  'ai-writer': {
    headline: 'Polish Your Generated Draft',
    subtitle: 'Humanize text, verify originality, or turn it into social content.',
    suggestions: [
      {
        targetToolId: 'ai-humanizer',
        badge: 'Recommended',
        reason: 'Rewrite stiff phrasing so your content sounds 100% natural and authentic.',
        actionText: 'Humanize Text',
        tone: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-300'
      },
      {
        targetToolId: 'ai-detector',
        badge: 'Scan',
        reason: 'Check how natural your text reads and see sentence-level scores.',
        actionText: 'Check AI Score',
        tone: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-cyan-300'
      },
      {
        targetToolId: 'social-caption-generator',
        reason: 'Condense your long draft into short, catchy posts for social media.',
        actionText: 'Make Social Post',
        tone: 'from-purple-500/10 to-fuchsia-500/10 border-purple-500/30 text-purple-300'
      },
      {
        targetToolId: 'grammar-checker',
        reason: 'Fix grammar, spelling, and punctuation across your draft.',
        actionText: 'Proofread Copy',
        tone: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-300'
      }
    ]
  },
  'ai-humanizer': {
    headline: 'Verify & Share Your Text',
    subtitle: 'Make sure your text reads well and share it with your audience.',
    suggestions: [
      {
        targetToolId: 'ai-detector',
        badge: 'Recommended',
        reason: 'Confirm that your humanized writing scores as natural and human.',
        actionText: 'Verify AI Score',
        tone: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-cyan-300'
      },
      {
        targetToolId: 'grammar-checker',
        badge: 'Proofread',
        reason: 'Double check tone, punctuation, and flow for flawless presentation.',
        actionText: 'Check Grammar',
        tone: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-300'
      },
      {
        targetToolId: 'social-caption-generator',
        reason: 'Format your polished text into engaging posts for LinkedIn or Twitter.',
        actionText: 'Share to Social',
        tone: 'from-purple-500/10 to-fuchsia-500/10 border-purple-500/30 text-purple-300'
      }
    ]
  },
  'ai-detector': {
    headline: 'Improve Flagged Text',
    subtitle: 'Make stiff or robotic sentences sound authentic and smooth.',
    suggestions: [
      {
        targetToolId: 'ai-humanizer',
        badge: 'Fix Score',
        reason: 'Rewrite flagged sentences with natural rhythm and conversational tone.',
        actionText: 'Humanize Now',
        tone: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-300'
      },
      {
        targetToolId: 'grammar-checker',
        reason: 'Rephrase rigid phrasing with clear, direct sentence structure.',
        actionText: 'Improve Phrasing',
        tone: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-300'
      }
    ]
  },
  'grammar-checker': {
    headline: 'Next Steps for Your Polished Copy',
    subtitle: 'Humanize your writing or share it across social channels.',
    suggestions: [
      {
        targetToolId: 'ai-humanizer',
        badge: 'Recommended',
        reason: 'Give your grammatically correct writing an effortless, friendly human voice.',
        actionText: 'Make It Natural',
        tone: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-300'
      },
      {
        targetToolId: 'social-caption-generator',
        reason: 'Turn your clean prose into engaging social media posts.',
        actionText: 'Create Social Post',
        tone: 'from-purple-500/10 to-fuchsia-500/10 border-purple-500/30 text-purple-300'
      },
      {
        targetToolId: 'ai-writer',
        reason: 'Expand your checked paragraphs into a full article or essay.',
        actionText: 'Expand with AI',
        tone: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-cyan-300'
      }
    ]
  },
  'social-caption-generator': {
    headline: 'Maximize Your Social Reach',
    subtitle: 'Expand your captions into full articles or pair them with images.',
    suggestions: [
      {
        targetToolId: 'ai-humanizer',
        badge: 'Recommended',
        reason: 'Make sure your captions sound authentic, relatable, and human.',
        actionText: 'Humanize Tone',
        tone: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-300'
      },
      {
        targetToolId: 'ai-writer',
        reason: 'Expand this caption into a full blog post or detailed guide.',
        actionText: 'Write Full Article',
        tone: 'from-blue-500/10 to-indigo-500/10 border-blue-500/30 text-blue-300'
      },
      {
        targetToolId: 'hashtag-generator',
        reason: 'Discover trending tags to give your caption maximum visibility.',
        actionText: 'Find Hashtags',
        tone: 'from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-300'
      }
    ]
  },

  // Image & Visual Design Tools
  'image-eraser': {
    headline: 'Next Steps for Your Clean Cutout',
    subtitle: 'Enhance, resize, or convert your transparent image.',
    suggestions: [
      {
        targetToolId: 'image-resizer',
        badge: 'Popular',
        reason: 'Crop and frame your transparent cutout to exact avatar or banner dimensions.',
        actionText: 'Resize & Crop',
        tone: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-cyan-300'
      },
      {
        targetToolId: 'image-compressor',
        badge: 'Optimize',
        reason: 'Compress file size without losing transparent cutout resolution.',
        actionText: 'Compress PNG',
        tone: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-300'
      },
      {
        targetToolId: 'meme-generator',
        reason: 'Add funny captions and stickers to your cutout image.',
        actionText: 'Make a Meme',
        tone: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-300'
      },
      {
        targetToolId: 'image-converter',
        reason: 'Save as WebP, JPG, or PNG in one click.',
        actionText: 'Convert Format',
        tone: 'from-purple-500/10 to-indigo-500/10 border-purple-500/30 text-purple-300'
      }
    ]
  },
  'bg-remove': {
    headline: 'Next Steps for Your Cutout',
    subtitle: 'Enhance, resize, or convert your transparent image.',
    suggestions: [
      {
        targetToolId: 'image-resizer',
        badge: 'Popular',
        reason: 'Crop and frame your transparent cutout to exact avatar or banner dimensions.',
        actionText: 'Resize & Crop',
        tone: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-cyan-300'
      },
      {
        targetToolId: 'image-compressor',
        badge: 'Optimize',
        reason: 'Compress file size without losing transparent cutout resolution.',
        actionText: 'Compress PNG',
        tone: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-300'
      },
      {
        targetToolId: 'meme-generator',
        reason: 'Add funny captions and stickers to your cutout image.',
        actionText: 'Make a Meme',
        tone: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-300'
      }
    ]
  },

  // Business Tools
  'invoice-generator': {
    headline: 'Complete Your Business Workflow',
    subtitle: 'Calculate taxes, profit margins, and loan payments accurately.',
    suggestions: [
      {
        targetToolId: 'gst-calculator',
        badge: 'Tax Helper',
        reason: 'Calculate inclusive or exclusive tax slabs for your client billing.',
        actionText: 'Calculate GST',
        tone: 'from-blue-500/10 to-indigo-500/10 border-blue-500/30 text-blue-300'
      },
      {
        targetToolId: 'profit-margin-calculator',
        reason: 'Check markups and gross margins before quoting client project fees.',
        actionText: 'Check Margins',
        tone: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-300'
      }
    ]
  }
};

/**
 * Normalizes tool IDs to handle aliases.
 */
function normalizeToolId(id: string): string {
  if (id === 'bg-remove') return 'image-eraser';
  return id;
}

/**
 * Retrieves recommended tools for a given tool ID.
 * Always returns contextually relevant companions.
 * If no explicit workflow exists, picks tools from the SAME category.
 */
export function getSuggestedToolsFor(currentToolId: string, currentCategoryId?: string): {
  headline: string;
  subtitle: string;
  items: Array<{ tool: Tool; suggestion: WorkflowSuggestion }>;
} {
  const normId = normalizeToolId(currentToolId);
  const workflow = TOOL_WORKFLOWS[normId] || TOOL_WORKFLOWS[currentToolId];

  if (workflow && workflow.suggestions.length > 0) {
    const items: Array<{ tool: Tool; suggestion: WorkflowSuggestion }> = [];
    for (const sugg of workflow.suggestions) {
      const found = TOOLS.find(t => t.id === sugg.targetToolId || normalizeToolId(t.id) === sugg.targetToolId);
      if (found && found.id !== currentToolId) {
        items.push({ tool: found, suggestion: sugg });
      }
    }

    if (items.length > 0) {
      return {
        headline: workflow.headline || 'Recommended Next Steps',
        subtitle: workflow.subtitle || 'Keep going — take your result into one of these companion tools.',
        items: items.slice(0, 4)
      };
    }
  }

  // Fallback: strictly pick companion tools from the SAME category!
  const resolvedCategory = currentCategoryId || TOOLS.find(t => t.id === currentToolId)?.category || 'productivity';
  const categoryCompanions = TOOLS
    .filter(t => t.category === resolvedCategory && t.id !== currentToolId)
    .slice(0, 3);

  const defaultTones = [
    'from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-cyan-300',
    'from-purple-500/10 to-fuchsia-500/10 border-purple-500/30 text-purple-300',
    'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-300'
  ];

  return {
    headline: 'Explore Companion Tools',
    subtitle: 'More tools in this category to help you complete your task faster.',
    items: categoryCompanions.map((t, idx) => ({
      tool: t,
      suggestion: {
        targetToolId: t.id,
        reason: t.description,
        actionText: 'Open Tool',
        tone: defaultTones[idx % defaultTones.length]
      }
    }))
  };
}
