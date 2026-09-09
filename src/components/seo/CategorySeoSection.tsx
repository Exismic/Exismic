import React from "react";
import Link from "next/link";
import { CATEGORIES } from "@/data/tools";
import { Sparkles, HelpCircle, CheckCircle2, ArrowRight, Zap, Layers } from "lucide-react";

interface CategorySeoSectionProps {
  categoryId: string;
  categoryName: string;
  categoryDescription: string;
}

export function CategorySeoSection({
  categoryId,
  categoryName,
  categoryDescription,
}: CategorySeoSectionProps) {
  const getCategoryContent = (id: string, name: string) => {
    switch (id) {
      case "developer":
        return {
          title: "Engineered for Modern Web Developers",
          intro:
            "Exismic's developer toolkit delivers high-throughput utilities designed to run directly in your browser with zero latency and zero data leakage. From testing complex regular expressions and building cron schedules to generating cryptographic hashes and formatting JSON, all processing executes locally in an isolated sandbox.",
          features: [
            "Client-Side Sandboxing: Code and sensitive JSON payloads are parsed locally with zero telemetry logging.",
            "AST & Spec Compliance: Formatted outputs strictly follow ECMAScript, TypeScript, and RFC standards.",
            "Zero Dependency Overhead: Instant tools that replace bulky npm CLI packages and browser extensions.",
            "One-Click Clipboard Exports: Instantly copy formatted code, hashes, or SQL queries directly into your codebase.",
          ],
          faqs: [
            {
              question: "Are my code snippets, JSON feeds, or database queries logged on Exismic?",
              answer:
                "No. Exismic developer tools operate in strict privacy-first environments. Transformations, hashing, and regex evaluations run client-side in your browser and are never stored or inspected.",
            },
            {
              question: "Can I use outputs from Exismic developer tools in commercial proprietary projects?",
              answer:
                "Yes, 100%. All code, types, SQL queries, and hashes generated on Exismic are completely unencumbered and open for commercial production use.",
            },
            {
              question: "Does Exismic support modern JavaScript and TypeScript dialects?",
              answer:
                "Yes. Our developer utilities support ES2024+, TypeScript 5+, JSON5, standard SQL dialects (PostgreSQL, MySQL, SQLite), and POSIX cron formats.",
            },
            {
              question: "Are developer tools free on Exismic?",
              answer:
                "All core developer tools (Regex Tester, JSON Formatter, Hash Generator, UUID Creator, Cron Builder) are completely free with unlimited daily usage.",
            },
          ],
        };

      case "student":
        return {
          title: "Supercharge Your Academic Research & Studies",
          intro:
            "Exismic's student suite empowers learners to study smarter and write with academic rigor. Generate structured essay outlines, evaluate sentence readability and grade levels, build flashcard decks from lecture notes, and compare texts for plagiarism and citation integrity.",
          features: [
            "Academic Rigor & Integrity: Tools engineered to assist your research, outline logic, and citation accuracy.",
            "Step-by-Step Learning: Math solver and readability tools explain intermediate steps to facilitate deep understanding.",
            "Standard Citation Formats: Built-in support for APA 7th, MLA 9th, Chicago, and Harvard academic styles.",
            "Cross-Platform Accessibility: Study from laptops, tablets, or smartphones with zero software installation.",
          ],
          faqs: [
            {
              question: "How does the AI Essay Outline Builder work?",
              answer:
                "The outline builder takes your topic or thesis statement and generates a comprehensive, paragraph-by-paragraph structure with topic sentences, supporting arguments, and research prompts.",
            },
            {
              question: "Does Exismic save or share my student papers and research?",
              answer:
                "Never. Your academic papers, essays, and notes are processed in an ephemeral sandbox and permanently deleted immediately after processing.",
            },
            {
              question: "How does the Readability Assessor evaluate text?",
              answer:
                "It calculates standard linguistic metrics including the Flesch-Kincaid Grade Level, Flesch Reading Ease, and average sentence length, while offering simplified rewrites to enhance clarity.",
            },
            {
              question: "Can students use Exismic for free?",
              answer:
                "Yes! Every student gets a daily allowance of free generation credits refreshed every 24 hours to use across all academic and creative tools.",
            },
          ],
        };

      case "image":
        return {
          title: "Studio-Grade Image & Graphic Workflows",
          intro:
            "Transform, refine, and generate visual media in seconds. Exismic delivers GPU-accelerated magic background erasure, lossless image compression, precise resizing, format conversion, and custom Minecraft 3D skin authoring.",
          features: [
            "Lossless Edge Preservation: Intelligent cutout algorithms preserve fine details like hair, fur, and semi-transparent alpha channels.",
            "Zero Watermarks: All image exports from Exismic are 100% clean and watermark-free for commercial client work.",
            "Next-Gen Formats: Full read and write support for PNG, JPG, WebP, AVIF, SVG, and high-resolution textures.",
            "Pipeline Chaining: Send your generated cutout directly to compressor, resizer, or meme studio with 1 click.",
          ],
          faqs: [
            {
              question: "Does Exismic degrade photo resolution or sharpness?",
              answer:
                "No. Exismic uses perceptual image preservation algorithms that maintain pixel sharpness and vibrant color depth.",
            },
            {
              question: "Can I use edited images commercially?",
              answer:
                "Yes. Any asset processed or created on Exismic is completely yours for personal, client, or commercial use without royalties.",
            },
            {
              question: "How does the Minecraft Skin Maker work?",
              answer:
                "Our AI skin maker turns text prompts into game-ready 64x64 PNG skins with full 3D interactive inspection and layer editing.",
            },
            {
              question: "Are uploads stored on Exismic servers?",
              answer:
                "Your uploads are processed securely in an encrypted sandbox and are never shared or trained upon.",
            },
          ],
        };

      case "creator":
        return {
          title: "Audience Growth & Social Media Workflows",
          intro:
            "Built for digital creators, YouTubers, newsletter writers, and social media strategists. Generate viral video hooks, design multi-slide carousel graphics, analyze thumbnail visual contrast, and format high-engagement LinkedIn articles.",
          features: [
            "Audience Retention Science: Script hooks and carousel layouts structured around proven organic engagement formulas.",
            "Multi-Platform Native: Formatted specifically for YouTube, Instagram Reels, TikTok, LinkedIn, and X.",
            "Visual Thumbnail Analysis: Preview your video thumbnails against light and dark feed backgrounds with contrast ratings.",
            "Clean Exports: Download ready-to-publish assets and copy clean formatting directly to your clipboard.",
          ],
          faqs: [
            {
              question: "How do the creator tools help improve video reach?",
              answer:
                "Our hook script generator and thumbnail analyzer focus on the first 3 seconds of viewer psychology and visual contrast to maximize click-through rate (CTR) and average view duration (AVD).",
            },
            {
              question: "Can I format LinkedIn posts with bold and italic text?",
              answer:
                "Yes! Our LinkedIn Formatter converts text into compliant Unicode styling with clean line spacing that reads effortlessly on mobile feeds.",
            },
            {
              question: "Does Exismic claim rights to my scripts or designs?",
              answer:
                "Never. You retain 100% copyright and ownership of all content and assets generated on Exismic.",
            },
            {
              question: "How many credits do creator tools cost?",
              answer:
                "Most creator utilities cost between 5 and 15 credits, and all users receive free credits every day.",
            },
          ],
        };

      default:
        return {
          title: `Comprehensive ${name} Solutions Online`,
          intro: `Access Exismic's purpose-built suite of online ${name.toLowerCase()}. Streamline repetitive tasks, enhance creative output, and achieve professional results in seconds directly within your browser.`,
          features: [
            "Instant In-Browser Processing: Zero software installation, zero setup, accessible on any modern device.",
            "Privacy-First Security: Uploaded files and inputs are strictly sandboxed and never monetized or exposed.",
            "Studio-Grade Precision: High-fidelity outputs built to meet professional creator and business standards.",
            "Daily Free Allowance: Test, create, and refine with free daily generation credits refreshed every 24 hours.",
          ],
          faqs: [
            {
              question: `Are ${name} on Exismic free to use?`,
              answer: `Yes! Every tool in our ${name.toLowerCase()} suite can be accessed for free with your daily credit allowance. Pro subscriptions are available for extended capacity.`,
            },
            {
              question: `Do I need to install any software to use ${name}?`,
              answer: `None at all. All Exismic tools run entirely inside modern web browsers on desktop, tablet, and mobile devices.`,
            },
            {
              question: `How does Exismic safeguard user privacy?`,
              answer: `We use end-to-end SSL encryption. Your uploaded documents and generated files are ephemeral and automatically purged after processing.`,
            },
            {
              question: `Can I use assets from ${name} for commercial projects?`,
              answer: `Yes, all outputs generated through Exismic are 100% royalty-free and approved for commercial and client deliverables.`,
            },
          ],
        };
    }
  };

  const content = getCategoryContent(categoryId, categoryName);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const otherCategories = CATEGORIES.filter((c) => c.id !== categoryId).slice(0, 4);

  return (
    <section className="mt-20 w-full text-left">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6">
        {/* HERO ABOUT CONTAINER */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 via-zinc-950/80 to-black/90 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl">
          <div className="absolute -top-32 -left-32 size-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <Sparkles size={14} className="text-cyan-300" />
              <span>Category Overview & Standards</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-zinc-400 tracking-tight">
              {content.title}
            </h2>

            <p className="text-base sm:text-lg font-medium text-zinc-300 leading-relaxed max-w-4xl">
              {content.intro}
            </p>
          </div>
        </div>

        {/* KEY HIGHLIGHTS GRID */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                Why Creators Rely on Exismic {categoryName}
              </h2>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                Precision engineering and high-performance infrastructure
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {content.features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-500/[0.02]"
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
                Frequently Asked Questions about {categoryName}
              </h2>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                Key questions answered regarding performance, pricing, and specs
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {content.faqs.map((faq, idx) => (
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

        {/* RELATED CATEGORIES NAVIGATION */}
        <div className="space-y-6 rounded-3xl border border-white/10 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Layers size={18} className="text-purple-400" />
              <h3 className="text-base font-black uppercase tracking-wider">
                Explore Other Creative Suites
              </h3>
            </div>
            <Link
              href="/tools"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300"
            >
              <span>All 117+ Tools</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {otherCategories.map((otherCat) => (
              <Link
                key={otherCat.id}
                href={`/category/${otherCat.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-black/40 p-5 transition-all hover:border-cyan-500/40 hover:bg-cyan-500/[0.02]"
              >
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {otherCat.name}
                  </h4>
                  <p className="text-xs font-medium text-zinc-400 line-clamp-2">
                    {otherCat.description}
                  </p>
                </div>
                <span className="mt-4 text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                  View Suite <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
