import React from "react";
import Link from "next/link";
import { Sparkles, HelpCircle, CheckCircle2, Zap, ArrowRight, ShieldCheck, Cpu } from "lucide-react";
import { Tool, Category, TOOLS } from "@/data/tools";
import { SITE_URL } from "@/lib/seo";

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
}: ToolSeoSectionProps) {
  // Default features if none supplied
  const defaultFeatures = features || [
    `Lightning-Fast Processing: Get instant, studio-grade results directly in your browser.`,
    `Privacy-First & Secure: Your files and inputs are processed safely with end-to-end security.`,
    `No Software Installation Required: Fully cloud-powered tool accessible on desktop and mobile.`,
    `High Precision AI Output: Leverages state-of-the-art algorithms tailored for ${toolName.toLowerCase()}.`,
  ];

  // Default how-to steps if none supplied
  const defaultHowToSteps = howToSteps || [
    `Upload or enter your input data into the ${toolName} interface above.`,
    `Adjust any desired options or parameters to customize your workflow.`,
    `Click the processing button and download or copy your instant high-quality result.`,
  ];

  // Default FAQs if none supplied
  const defaultFaqs = faqs || [
    {
      question: `Is ${toolName} free to use on Exismic?`,
      answer: `${toolName} is free to try on Exismic with daily free generation credits. For unlimited high-speed processing, batch jobs, and priority queues, upgrade to Exismic Pro.`,
    },
    {
      question: `How does ${toolName} protect my privacy and data?`,
      answer: `Exismic processes data securely. We do not store or sell your uploaded files or text inputs. All processed items are automatically purged according to strict privacy standards.`,
    },
    {
      question: `Can I use ${toolName} on mobile devices?`,
      answer: `Yes! ${toolName} is fully responsive and works seamlessly across desktops, tablets, and smartphones without needing any app downloads.`,
    },
    {
      question: `Why choose Exismic's ${toolName} over other online tools?`,
      answer: `Exismic provides an ultra-fast, ad-free interface powered by state-of-the-art server infrastructure, giving you clean, professional-grade outputs in seconds.`,
    },
  ];

  // Related tools from same or popular categories
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
    <section className="mt-16 w-full space-y-12 border-t border-white/10 pt-12 text-left">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <div className="mx-auto max-w-5xl space-y-12 px-4 sm:px-6">
        {/* Main Content & Description */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-cyan-300">
            <Sparkles size={14} className="text-cyan-400" />
            <span>Comprehensive Guide & Overview</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            About {toolName}
          </h2>
          <p className="text-base font-medium leading-relaxed text-zinc-300 sm:text-lg">
            {toolDescription} Designed for creators, developers, students, and professionals, {toolName} provides instant, studio-grade processing directly inside your browser with zero setup required.
          </p>
        </div>

        {/* How to Use Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap size={18} />
            </div>
            <h2 className="text-xl font-black text-white sm:text-2xl">
              How to Use {toolName} in 3 Simple Steps
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {defaultHowToSteps.map((step, idx) => (
              <div
                key={idx}
                className="relative flex flex-col justify-between rounded-2xl border border-white/10 bg-black/40 p-6 transition-all hover:border-cyan-500/30"
              >
                <div className="space-y-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-lg bg-cyan-500/20 text-xs font-black text-cyan-300">
                    0{idx + 1}
                  </span>
                  <p className="text-sm font-semibold leading-relaxed text-zinc-200">
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Cpu size={18} />
            </div>
            <h2 className="text-xl font-black text-white sm:text-2xl">
              Why Choose Exismic {toolName}?
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {defaultFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.01] p-5 backdrop-blur-sm"
              >
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-400" />
                <p className="text-sm font-medium leading-relaxed text-zinc-300">{feat}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <HelpCircle size={18} />
            </div>
            <h2 className="text-xl font-black text-white sm:text-2xl">
              Frequently Asked Questions (FAQ)
            </h2>
          </div>
          <div className="space-y-4">
            {defaultFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="space-y-2 rounded-2xl border border-white/10 bg-black/30 p-6"
              >
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-cyan-400 font-mono">Q:</span> {faq.question}
                </h3>
                <p className="text-sm font-medium leading-relaxed text-zinc-400 pl-6">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Tools Internal Linking Graph */}
        {relatedTools.length > 0 && (
          <div className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.01] p-6 sm:p-8">
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
                  className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-black/40 p-4 transition-all hover:border-cyan-500/40 hover:bg-cyan-500/[0.02]"
                >
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {relTool.name}
                    </h4>
                    <p className="text-xs font-medium text-zinc-400 line-clamp-2">
                      {relTool.description}
                    </p>
                  </div>
                  <span className="mt-3 text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
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
