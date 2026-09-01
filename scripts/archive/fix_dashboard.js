const fs = require('fs');

let content = fs.readFileSync('src/components/tool/Dashboard.tsx', 'utf-8');

// 1. Replace DashboardAction type if not already having category
const typeRegex = /type DashboardAction = \{[\s\S]*?\};/;
const newType = `type DashboardAction = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  category?: keyof typeof CATEGORY_ANIM_STYLES;
  isPremium?: boolean;
};`;
if (!content.includes('category?: keyof typeof CATEGORY_ANIM_STYLES;')) {
    content = content.replace(typeRegex, newType);
}

// 2. Fix CREATIVE_SUITE
content = content.replace(/label: "AI Image Generator",[\s\S]*?icon: ImageIcon,[\s\S]*?}/, `label: "AI Image Generator",
    description: "Generate stunning high-fidelity 4K art and photos from text prompts.",
    href: "/tools/ai/img-gen",
    icon: ImageIcon,
    category: "ai"
  }`);

content = content.replace(/label: "Background Remover",[\s\S]*?icon: Brush,[\s\S]*?}/, `label: "Background Remover",
    description: "Instantly isolate products, subjects, and portraits from backgrounds.",
    href: "/tools/image/bg-remover",
    icon: Brush,
    isPremium: true,
    category: "image"
  }`);

content = content.replace(/label: "Magic Eraser",[\s\S]*?icon: Wand2,[\s\S]*?}/, `label: "Magic Eraser",
    description: "Remove unwanted objects, text, and defects from photos instantly.",
    href: "/tools/image/eraser",
    icon: Wand2,
    category: "image"
  }`);

content = content.replace(/label: "Social Media Caption Generator",[\s\S]*?icon: Sparkles,[\s\S]*?}/, `label: "Social Media Caption Generator",
    description: "Create engaging high-conversion copy and captions for your platforms.",
    href: "/tools/social-caption-generator",
    icon: Sparkles,
    category: "ai"
  }`);

content = content.replace(/label: "Resume Builder",[\s\S]*?icon: FileText,[\s\S]*?}/, `label: "Resume Builder",
    description: "Design premium ATS-optimized professional resumes using smart builders.",
    href: "/tools/resume-builder",
    icon: FileText,
    isPremium: true,
    category: "productivity"
  }`);

content = content.replace(/label: "Vocal Remover",[\s\S]*?icon: Mic2,[\s\S]*?}/, `label: "Vocal Remover",
    description: "Extract vocals or split music tracks into clear instrumental stems.",
    href: "/tools/audio/vocal-remover",
    icon: Mic2,
    category: "audio"
  }`);

// 3. Fix DEVELOPER_SUITE
content = content.replace(/label: "Code Studio",[\s\S]*?icon: Code2,[\s\S]*?}/, `label: "Code Studio",
    description: "Full stack AI IDE with Monaco editor, live previews, and agentic assistant.",
    href: "/tools/ai/code",
    icon: Code2,
    isPremium: true,
    category: "ai"
  }`);

content = content.replace(/label: "AI Code Generator",[\s\S]*?icon: Terminal,[\s\S]*?}/, `label: "AI Code Generator",
    description: "Write, refactor, and debug production code instantly using AI chat.",
    href: "/tools/ai/code\\?mode=chat",
    icon: Terminal,
    isPremium: true,
    category: "ai"
  }`);

content = content.replace(/label: "Screenshot to Code",[\s\S]*?icon: Monitor,[\s\S]*?}/, `label: "Screenshot to Code",
    description: "Upload mockups and design screenshots to compile clean React markup.",
    href: "/tools/screenshot-to-code",
    icon: Monitor,
    isPremium: true,
    category: "ai"
  }`);

content = content.replace(/label: "Format Converter",[\s\S]*?icon: RefreshCw,[\s\S]*?}/, `label: "Format Converter",
    description: "Quickly convert code formats, JSON configurations, and markup languages.",
    href: "/tools/format-converter",
    icon: RefreshCw,
    category: "productivity"
  }`);

// 4. Fix PRODUCTIVITY_SUITE
content = content.replace(/label: "Invoice Generator",[\s\S]*?icon: Layers,[\s\S]*?}/, `label: "Invoice Generator",
    description: "Generate sleek professional custom PDF invoices for clients instantly.",
    href: "/tools/productivity/invoice",
    icon: Layers,
    category: "productivity"
  }`);

content = content.replace(/label: "PDF Tools",[\s\S]*?icon: FileText,[\s\S]*?}/, `label: "PDF Tools",
    description: "Compress, merge, lock, and manage PDF documents directly in-browser.",
    href: "/tools/productivity/pdf",
    icon: FileText,
    category: "pdf"
  }`);

content = content.replace(/label: "Unit Converter",[\s\S]*?icon: Scale,[\s\S]*?}/, `label: "Unit Converter",
    description: "Convert length, weights, and metrics accurately with conversion scales.",
    href: "/tools/productivity/units",
    icon: Scale,
    category: "productivity"
  }`);

// 5. Fix SuiteCard h3 styles
const h3Regex = /<h3 className=\{cn\([\s\S]*?isPro \? "group-hover:bg-\[linear-gradient\(110deg,#fde68a_0%,#ffffff_45%,#fbbf24_55%,#ffffff_100%\)\] group-hover:bg-clip-text group-hover:text-transparent group-hover:drop-shadow-\[0_2px_15px_rgba\(245,158,11,0\.2\)\]" : "group-hover:text-transparent group-hover:bg-clip-text " \+ style\.textGrad[\s\S]*?\}\>[\s\S]*?<\/h3>/g;

const newH3 = `<h3 className={cn(
              "pr-10 text-base font-bold leading-snug tracking-tight text-white transition-colors [overflow-wrap:normal] [word-break:normal] sm:text-lg",
              isPro 
                ? "group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-[linear-gradient(110deg,#fde68a_0%,#ffffff_45%,#fbbf24_55%,#ffffff_100%)] group-hover:drop-shadow-[0_2px_15px_rgba(245,158,11,0.2)]" 
                : cn("group-hover:text-transparent group-hover:bg-clip-text", style.textGrad.replace(/bg-\\\\[/g, 'group-hover:bg-[').replace(/drop-shadow-\\\\[/g, 'group-hover:drop-shadow-['))
            )}>
              {action.label}
            </h3>`;

content = content.replace(h3Regex, newH3);

// Fix style fallback
content = content.replace('const style = CATEGORY_ANIM_STYLES[action.category] || CATEGORY_ANIM_STYLES.ai;', 'const style = CATEGORY_ANIM_STYLES[action.category || "ai"] || CATEGORY_ANIM_STYLES.ai;');

fs.writeFileSync('src/components/tool/Dashboard.tsx', content, 'utf-8');
console.log("Fixes applied.");
