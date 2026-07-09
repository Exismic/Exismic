const fs = require('fs');

let content = fs.readFileSync('src/components/tool/Dashboard.tsx', 'utf-8');

if (!content.includes('CATEGORY_ANIM_STYLES')) {
    content = content.replace('import { ProBackground } from "@/components/pro/ProBackground";', 
                              'import { ProBackground } from "@/components/pro/ProBackground";\nimport { CATEGORY_ANIM_STYLES } from "@/lib/category-styles";');
}

const old_type = `type DashboardAction = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  glow: string;
  accent: string;
  isPremium?: boolean;
};`;
const new_type = `type DashboardAction = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  category: keyof typeof CATEGORY_ANIM_STYLES;
  isPremium?: boolean;
};`;
content = content.replace(old_type, new_type);

const old_creative = `const CREATIVE_SUITE: DashboardAction[] = [
  {
    label: "AI Image Generator",
    description: "Generate stunning high-fidelity 4K art and photos from text prompts.",
    href: "/tools/ai/img-gen",
    icon: ImageIcon,
    glow: "from-cyan-600/20 to-blue-600/20",
    accent: "text-accent-cyan"
  },
  {
    label: "Background Remover",
    description: "Instantly isolate products, subjects, and portraits from backgrounds.",
    href: "/tools/image/bg-remover",
    icon: Brush,
    glow: "from-purple-600/20 to-pink-600/20",
    accent: "text-accent-purple",
    isPremium: true
  },
  {
    label: "Magic Eraser",
    description: "Remove unwanted objects, text, and defects from photos instantly.",
    href: "/tools/image/eraser",
    icon: Wand2,
    glow: "from-pink-600/20 to-red-600/20",
    accent: "text-pink-500"
  },
  {
    label: "Social Media Caption Generator",
    description: "Create engaging high-conversion copy and captions for your platforms.",
    href: "/tools/social-caption-generator",
    icon: Sparkles,
    glow: "from-amber-600/20 to-orange-600/20",
    accent: "text-amber-500"
  },
  {
    label: "Resume Builder",
    description: "Design premium ATS-optimized professional resumes using smart builders.",
    href: "/tools/resume-builder",
    icon: FileText,
    glow: "from-emerald-600/20 to-teal-600/20",
    accent: "text-emerald-500",
    isPremium: true
  },
  {
    label: "Vocal Remover",
    description: "Extract vocals or split music tracks into clear instrumental stems.",
    href: "/tools/audio/vocal-remover",
    icon: Mic2,
    glow: "from-blue-600/20 to-cyan-600/20",
    accent: "text-accent-blue"
  }
];`;

const new_creative = `const CREATIVE_SUITE: DashboardAction[] = [
  {
    label: "AI Image Generator",
    description: "Generate stunning high-fidelity 4K art and photos from text prompts.",
    href: "/tools/ai/img-gen",
    icon: ImageIcon,
    category: "ai"
  },
  {
    label: "Background Remover",
    description: "Instantly isolate products, subjects, and portraits from backgrounds.",
    href: "/tools/image/bg-remover",
    icon: Brush,
    isPremium: true,
    category: "image"
  },
  {
    label: "Magic Eraser",
    description: "Remove unwanted objects, text, and defects from photos instantly.",
    href: "/tools/image/eraser",
    icon: Wand2,
    category: "image"
  },
  {
    label: "Social Media Caption Generator",
    description: "Create engaging high-conversion copy and captions for your platforms.",
    href: "/tools/social-caption-generator",
    icon: Sparkles,
    category: "ai"
  },
  {
    label: "Resume Builder",
    description: "Design premium ATS-optimized professional resumes using smart builders.",
    href: "/tools/resume-builder",
    icon: FileText,
    isPremium: true,
    category: "productivity"
  },
  {
    label: "Vocal Remover",
    description: "Extract vocals or split music tracks into clear instrumental stems.",
    href: "/tools/audio/vocal-remover",
    icon: Mic2,
    category: "audio"
  }
];`;
content = content.replace(old_creative, new_creative);

const old_dev = `const DEVELOPER_SUITE: DashboardAction[] = [
  {
    label: "Code Studio",
    description: "Full stack AI IDE with Monaco editor, live previews, and agentic assistant.",
    href: "/tools/ai/code",
    icon: Code2,
    glow: "from-purple-600/30 via-red-500/30 to-orange-500/20 shadow-[0_0_50px_rgba(239,68,68,0.15)]",
    accent: "text-red-500",
    isPremium: true
  },
  {
    label: "AI Code Generator",
    description: "Write, refactor, and debug production code instantly using AI chat.",
    href: "/tools/ai/code?mode=chat",
    icon: Terminal,
    glow: "from-red-600/20 via-orange-500/20 to-yellow-500/20 shadow-[0_0_30px_rgba(249,115,22,0.1)]",
    accent: "text-orange-500",
    isPremium: true
  },
  {
    label: "Screenshot to Code",
    description: "Upload mockups and design screenshots to compile clean React markup.",
    href: "/tools/screenshot-to-code",
    icon: Monitor,
    glow: "from-orange-600/20 via-amber-500/20 to-yellow-500/20",
    accent: "text-amber-500",
    isPremium: true
  },
  {
    label: "Format Converter",
    description: "Quickly convert code formats, JSON configurations, and markup languages.",
    href: "/tools/format-converter",
    icon: RefreshCw,
    glow: "from-zinc-600/20 to-zinc-800/20",
    accent: "text-zinc-400"
  }
];`;
const new_dev = `const DEVELOPER_SUITE: DashboardAction[] = [
  {
    label: "Code Studio",
    description: "Full stack AI IDE with Monaco editor, live previews, and agentic assistant.",
    href: "/tools/ai/code",
    icon: Code2,
    isPremium: true,
    category: "ai"
  },
  {
    label: "AI Code Generator",
    description: "Write, refactor, and debug production code instantly using AI chat.",
    href: "/tools/ai/code?mode=chat",
    icon: Terminal,
    isPremium: true,
    category: "ai"
  },
  {
    label: "Screenshot to Code",
    description: "Upload mockups and design screenshots to compile clean React markup.",
    href: "/tools/screenshot-to-code",
    icon: Monitor,
    isPremium: true,
    category: "ai"
  },
  {
    label: "Format Converter",
    description: "Quickly convert code formats, JSON configurations, and markup languages.",
    href: "/tools/format-converter",
    icon: RefreshCw,
    category: "productivity"
  }
];`;
content = content.replace(old_dev, new_dev);

const old_prod = `const PRODUCTIVITY_SUITE: DashboardAction[] = [
  {
    label: "Invoice Generator",
    description: "Generate sleek professional custom PDF invoices for clients instantly.",
    href: "/tools/productivity/invoice",
    icon: Layers,
    glow: "from-emerald-600/20 to-cyan-600/20",
    accent: "text-emerald-400"
  },
  {
    label: "PDF Tools",
    description: "Compress, merge, lock, and manage PDF documents directly in-browser.",
    href: "/tools/productivity/pdf",
    icon: FileText,
    glow: "from-red-600/20 to-orange-600/20",
    accent: "text-red-400"
  },
  {
    label: "Unit Converter",
    description: "Convert length, weights, and metrics accurately with conversion scales.",
    href: "/tools/productivity/units",
    icon: Scale,
    glow: "from-blue-600/20 to-zinc-600/20",
    accent: "text-accent-blue"
  }
];`;

const new_prod = `const PRODUCTIVITY_SUITE: DashboardAction[] = [
  {
    label: "Invoice Generator",
    description: "Generate sleek professional custom PDF invoices for clients instantly.",
    href: "/tools/productivity/invoice",
    icon: Layers,
    category: "productivity"
  },
  {
    label: "PDF Tools",
    description: "Compress, merge, lock, and manage PDF documents directly in-browser.",
    href: "/tools/productivity/pdf",
    icon: FileText,
    category: "pdf"
  },
  {
    label: "Unit Converter",
    description: "Convert length, weights, and metrics accurately with conversion scales.",
    href: "/tools/productivity/units",
    icon: Scale,
    category: "productivity"
  }
];`;
content = content.replace(old_prod, new_prod);

const match = content.match(/function SuiteCard\(\{ action, i \}: \{ action: DashboardAction; i: number \}\) \{[\s\S]*?\n\}\n/);

const new_suite_card = `function SuiteCard({ action, i }: { action: DashboardAction; i: number }) {
  const isPro = action.isPremium;
  const style = CATEGORY_ANIM_STYLES[action.category] || CATEGORY_ANIM_STYLES.ai;

  return (
    <Link href={action.href}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 * i, duration: 0.6 }}
        whileHover={{ y: -4, scale: 1.01 }}
        className={cn(
          "group relative min-h-[190px] p-5 sm:p-6 rounded-[1.75rem] sm:rounded-[2.5rem] bg-[#0A0A0A]/80 backdrop-blur-2xl border transition-all duration-500 overflow-hidden h-full flex flex-col justify-between touch-manipulation active:scale-[0.99]",
          isPro 
            ? "border-amber-500/30 hover:border-amber-400/80 shadow-[inset_0_1px_2px_rgba(245,158,11,0.1),0_0_15px_rgba(245,158,11,0.05)] hover:shadow-[0_0_50px_rgba(245,158,11,0.25)]" 
            : style.cardBorder
        )}
      >
        {/* Animated Border */}
        <div className="absolute inset-[-100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10">
          <div className={cn(
            "absolute inset-0 animate-[spin_4s_linear_infinite]",
            isPro ? "bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.9)_25%,transparent_50%)]" : style.spinHover
          )} />
        </div>
        {isPro && (
          <div className="absolute inset-[-100%] opacity-100 group-hover:opacity-0 transition-opacity duration-500 pointer-events-none -z-10">
            <div className="absolute inset-0 animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.4)_25%,transparent_50%)]" />
          </div>
        )}
        {/* Inner Mask to hide border behind card background */}
        <div className="absolute inset-[1px] bg-[#0A0A0A]/95 rounded-[1.75rem] sm:rounded-[2.5rem] -z-10" />

        {/* Premium Pro Badge */}
        {action.isPremium && (
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
            <ProBadge size="sm" type={action.label.includes("Code") || action.label.includes("Screenshot") ? "studio" : "default"} />
          </div>
        )}

        {/* Shine Hover Effect Layer */}
        <div className="absolute inset-0 rounded-[1.75rem] sm:rounded-[2.5rem] overflow-hidden pointer-events-none z-10">
          <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-linear-to-r from-transparent via-white/5 to-transparent" />
        </div>

        {/* Ambient Hover Glows */}
        <div className={cn(
          "absolute -inset-px rounded-[1.75rem] sm:rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl -z-20",
          isPro ? "bg-amber-500/20 group-hover:bg-amber-400/40" : style.aura
        )} />

        <div className="space-y-4 relative z-10">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500 md:group-hover:scale-110 md:group-hover:rotate-3 shadow-2xl bg-zinc-900/40 border border-white/5"
          )}>
            <div className={cn(
              "absolute inset-0 opacity-10",
              isPro ? "bg-amber-500" : style.aura.split(" ")[0]
            )} />
            <action.icon size={22} className={cn(
              "relative z-10 transition-all duration-500 group-hover:scale-110", 
              isPro ? "text-amber-500 group-hover:text-amber-400 group-hover:drop-shadow-[0_0_20px_rgba(245,158,11,0.9)]" : style.iconGlow
            )} />
          </div>

          <div className="space-y-1.5">
            <h3 className={cn(
              "pr-10 text-base font-bold leading-snug tracking-tight text-white transition-colors [overflow-wrap:normal] [word-break:normal] group-hover:text-white sm:text-lg",
              isPro ? "group-hover:bg-[linear-gradient(110deg,#fde68a_0%,#ffffff_45%,#fbbf24_55%,#ffffff_100%)] group-hover:bg-clip-text group-hover:text-transparent group-hover:drop-shadow-[0_2px_15px_rgba(245,158,11,0.2)]" : "group-hover:text-transparent group-hover:bg-clip-text " + style.textGrad
            )}>
              {action.label}
            </h3>
            <p className="line-clamp-3 text-xs leading-relaxed text-zinc-500 transition-colors [overflow-wrap:normal] [word-break:normal] group-hover:text-zinc-300 sm:line-clamp-2 sm:text-[13px]">
              {action.description}
            </p>
          </div>
        </div>

        {/* Premium Button CTA */}
        <div className="mt-6 sm:mt-8 relative z-10">
          <div className={cn(
            "w-full min-h-12 py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl flex items-center justify-center gap-2 sm:gap-3 font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all duration-500 relative overflow-hidden",
            isPro 
              ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-amber-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-[1.02] group-hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] border border-amber-300/50" 
              : cn("group-hover:scale-[1.02] border shadow-lg", style.buttonGrad)
          )}>
            <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shine_2s_linear_infinite]" />
            <span className="relative z-10 flex items-center gap-2 sm:gap-3">
              Launch Tool
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
`;

if (match) {
    content = content.replace(match[0], new_suite_card);
} else {
    console.log("SuiteCard not found.");
}

fs.writeFileSync('src/components/tool/Dashboard.tsx', content, 'utf-8');
console.log('Done');
