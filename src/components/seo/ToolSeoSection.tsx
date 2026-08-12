import React from "react";
import Link from "next/link";
import { Sparkles, HelpCircle, CheckCircle2, Zap, ArrowRight, Cpu, ShieldCheck } from "lucide-react";
import { TOOLS } from "@/data/tools";

interface ToolSeoSectionProps {
  toolName: string;
  toolDescription: string;
  categoryName?: string;
  categoryId?: string;
  toolSlug?: string;
  features?: string[];
  howToSteps?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  keywords?: string[];
  showRelatedTools?: boolean;
}

export function ToolSeoSection({
  toolName,
  toolDescription,
  categoryName = "AI & Productivity Tools",
  categoryId = "ai",
  toolSlug,
  features,
  howToSteps,
  faqs,
  keywords,
  showRelatedTools = false,
}: ToolSeoSectionProps) {
  // Default features if none supplied
  const defaultFeatures = features || [
    `Lightning-Fast Processing: Get instant, studio-grade results directly in your browser.`,
    `Privacy-First & Secure: Your files and inputs are processed safely with end-to-end encryption.`,
    `No Installation Required: Fully web-powered tool accessible on desktop, tablet, and mobile.`,
    `High Precision AI Engine: Leverages state-of-the-art algorithms tailored specifically for ${toolName.toLowerCase()}.`,
  ];

  // Default how-to steps if none supplied
  const defaultHowToSteps = howToSteps || [
    `Upload or enter your input file or data into the ${toolName} workspace above.`,
    `Select your desired export quality or parameters to customize your workflow.`,
    `Click process and download your instant high-resolution result immediately.`,
  ];

  // Default FAQs if none supplied
  const defaultFaqs = faqs || [
    {
      question: `Is ${toolName} free to use on Exismic?`,
      answer: `${toolName} is free to use on Exismic with standard quality exports. For lossless full HD processing, zero queue wait times, and priority speed, upgrade to Exismic Pro.`,
    },
    {
      question: `How does Exismic protect my privacy and files?`,
      answer: `All uploads are processed securely. We never store or monetize your uploaded photos, documents, or data. Processed files are automatically purged from our cache.`,
    },
    {
      question: `Can I use ${toolName} on mobile devices?`,
      answer: `Yes! ${toolName} is fully optimized for all mobile browsers, iPhones, Android devices, tablets, and desktop computers without needing any app downloads.`,
    },
    {
      question: `Why choose Exismic's ${toolName}?`,
      answer: `Exismic delivers an ultra-fast, ad-free studio experience backed by serverless GPU nodes, giving you clean, professional-grade outputs in seconds.`,
    },
  ];

  // Related tools from same category
  const relatedTools = TOOLS.filter(
    (t) => t.category === categoryId && t.name !== toolName && t.indexable !== false
  ).slice(0, 4);

  // FAQ Schema JSON-LD for Googlebot
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": defaultFaqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use ${toolName}`,
    "description": toolDescription,
    "step": defaultHowToSteps.map((step, idx) => ({
      "@type": "HowToStep",
      "position": idx + 1,
      "name": `Step ${idx + 1}`,
      "text": step,
    })),
  };

  return (
    <section className="mt-16 w-full text-left">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6">
        
        {/* HERO ABOUT CONTAINER */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 via-zinc-950/80 to-black/90 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl">
          {/* Ambient Background Auras */}
          <div className="absolute -top-32 -left-32 size-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <Sparkles size={14} className="text-cyan-300 animate-pulse" />
              <span>Comprehensive Guide & Overview</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-zinc-400 tracking-tight">
              About {toolName}
            </h2>

            <p className="text-base sm:text-lg font-medium text-zinc-300 leading-relaxed max-w-4xl">
              {toolDescription} Designed for creators, developers, students, and digital professionals, {toolName} delivers instant, studio-grade processing directly inside your browser with zero installation or setup required.
            </p>
          </div>
        </div>

        {/* 3-STEP HOW TO USE SECTION */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                How to Use {toolName} in 3 Simple Steps
              </h2>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Streamlined workflow designed for maximum efficiency</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {defaultHowToSteps.map((step, idx) => (
              <div
                key={idx}
                className="relative group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-7 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/[0.03] hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="size-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-cyan-500/25">
                      0{idx + 1}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400/60 group-hover:text-cyan-300 transition-colors">Step 0{idx + 1}</span>
                  </div>
                  <p className="text-sm font-semibold leading-relaxed text-zinc-200">
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KEY FEATURES GRID */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-300 border border-purple-400/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
              <Cpu size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                Why Choose Exismic {toolName}?
              </h2>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-0.5">High precision processing backed by enterprise infrastructure</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {defaultFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md transition-all duration-300 hover:border-purple-400/30 hover:bg-purple-500/[0.03]"
              >
                <div className="size-8 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                  <CheckCircle2 size={18} />
                </div>
                <p className="text-sm font-medium leading-relaxed text-zinc-200">{feat}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-300 border border-amber-400/30 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                Frequently Asked Questions (FAQ)
              </h2>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Everything you need to know about {toolName}</p>
            </div>
          </div>

          <div className="space-y-4">
            {defaultFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="space-y-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-500/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <div className="size-7 rounded-lg bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-black flex items-center justify-center shrink-0">
                    Q
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {faq.question}
                  </h3>
                </div>
                <p className="text-sm font-medium leading-relaxed text-zinc-400 pl-10">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* RELATED TOOLS (IF ENABLED) */}
        {showRelatedTools && relatedTools.length > 0 && (
          <div className="space-y-6 rounded-3xl border border-white/10 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black uppercase tracking-wider text-white">
                Explore More {categoryName}
              </h3>
              <Link
                href="/tools"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300"
              >
                <span>View All Tools</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedTools.map((relTool) => (
                <Link
                  key={relTool.id}
                  href={relTool.href}
                  className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-black/40 p-5 transition-all hover:border-cyan-500/40 hover:bg-cyan-500/[0.02]"
                >
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {relTool.name}
                    </h4>
                    <p className="text-xs font-medium text-zinc-400 line-clamp-2">
                      {relTool.description}
                    </p>
                  </div>
                  <span className="mt-4 text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                    Try Tool <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
