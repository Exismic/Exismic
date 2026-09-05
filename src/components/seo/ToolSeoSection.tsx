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
  // Category-specific content engine to ensure high-value unique text on every tool page
  const getCategoryDefaults = (catId: string, name: string, desc: string) => {
    switch (catId) {
      case "image":
        return {
          features: [
            `Lossless Visual Fidelity: Preserves edge sharpness, color grading, and transparent alpha channels.`,
            `Universal Format Compatibility: Seamlessly handles PNG, JPG, WebP, SVG, and high-res camera RAW files.`,
            `Zero-Latency Processing: Powered by client-side WebAssembly and GPU-accelerated canvas pipelines.`,
            `Commercial-Grade Output: Export print-ready and web-optimized assets with zero watermarks or compression artifacts.`
          ],
          howToSteps: [
            `Select your image (PNG, JPG, or WebP) or drag and drop it directly onto the ${name} canvas above.`,
            `Adjust resolution, quality sliders, or specialized editing settings to match your design requirements.`,
            `Preview the real-time side-by-side comparison and download your high-resolution image instantly.`
          ],
          faqs: [
            {
              question: `Does using ${name} reduce the quality or resolution of my original image?`,
              answer: `No. ${name} employs smart perceptual algorithms that preserve maximum pixel sharpness and color depth while applying the requested modifications.`,
            },
            {
              question: `What image file formats are supported by ${name}?`,
              answer: `${name} supports all standard modern graphic formats including PNG, JPG/JPEG, WebP, GIF, and SVG with transparent alpha support.`,
            },
            {
              question: `Can I use graphics and assets processed with ${name} for commercial projects?`,
              answer: `Yes, 100%. Any graphic, wallpaper, or design processed through Exismic is completely yours to use for personal, commercial, or client projects with zero watermarks.`,
            },
            {
              question: `How does Exismic protect my private photos and uploads?`,
              answer: `Privacy is our core foundation. Your uploads are processed securely in an encrypted sandbox and are never stored, trained upon, or shared with third parties.`,
            },
          ]
        };
      case "video":
        return {
          features: [
            `Hardware-Accelerated Encoding: High-throughput video rendering without frame drops or jitter.`,
            `Crisp Bitrate Retention: Balances compact file size with pristine 1080p and 4K visual clarity.`,
            `Multi-Codec Architecture: Native compatibility with MP4, MOV, WebM, and MKV video containers.`,
            `Watermark-Free Rendering: Produce studio-ready video clips for YouTube, TikTok, Reels, and ads.`
          ],
          howToSteps: [
            `Upload your video file (MP4, MOV, or WebM) into the ${name} processing workspace.`,
            `Configure timeline cuts, resolution presets, or enhancement filters tailored to your project.`,
            `Click process and download your smooth, high-definition video export immediately.`
          ],
          faqs: [
            {
              question: `What video resolutions and aspect ratios does ${name} support?`,
              answer: `${name} supports standard 16:9 widescreen, 9:16 vertical reels/shorts, 1:1 square feeds, and 4:5 social media formats up to 4K resolution.`,
            },
            {
              question: `Will my video have a watermark after processing?`,
              answer: `No! All videos rendered on Exismic are 100% clean and free of watermarks, ready for direct upload to social media, YouTube, or client delivery.`,
            },
            {
              question: `How long does video processing take on ${name}?`,
              answer: `Most standard clips process in under 15–30 seconds thanks to our distributed serverless GPU pipeline and WebAssembly optimizations.`,
            },
            {
              question: `Is there a file size limit for video uploads?`,
              answer: `Exismic supports generous video file sizes for free users, with expanded multi-gigabyte limits and priority rendering queues available for Exismic Pro members.`,
            },
          ]
        };
      case "audio":
        return {
          features: [
            `High-Resolution Acoustic Fidelity: Supports pristine 320kbps audio bitrate and 48kHz studio sample rates.`,
            `Neural Frequency Isolation: Separates acoustic layers, vocals, and instruments with minimal spectral bleed.`,
            `Universal Audio Codecs: Complete support for MP3, WAV, FLAC, AAC, OGG, and M4A sound files.`,
            `Instant Waveform Preview: Real-time interactive playback to inspect processed audio before exporting.`
          ],
          howToSteps: [
            `Select your audio file (MP3, WAV, FLAC, or M4A) or drag it into the ${name} workspace.`,
            `Tune your frequency filters, volume normalization, or isolation parameters.`,
            `Audition the live audio waveform and download your studio-quality stem or master track.`
          ],
          faqs: [
            {
              question: `Does ${name} alter the stereo depth or sample rate of my audio track?`,
              answer: `No. ${name} preserves the native stereo field, phase alignment, and dynamic range of your original audio file without adding artificial distortion.`,
            },
            {
              question: `What audio formats are compatible with ${name}?`,
              answer: `You can upload and export across all major audio formats including MP3, WAV, FLAC, AAC, M4A, and OGG.`,
            },
            {
              question: `Can I use isolated vocals and music tracks from ${name} in commercial productions?`,
              answer: `Yes, any audio processed through ${name} can be used in your music production, podcasts, YouTube videos, and commercial media.`,
            },
            {
              question: `How fast is audio rendering on Exismic?`,
              answer: `Our dedicated neural audio pipelines process typical 3–5 minute audio tracks in approximately 5 to 10 seconds.`,
            },
          ]
        };
      case "pdf":
        return {
          features: [
            `Vector Font & Layout Integrity: Preserves typographic hierarchies, hyperlinks, and vector diagrams intact.`,
            `Zero-Trace Document Security: Automated memory wipes immediately purge all PDF data after processing.`,
            `ISO 32000 Standard Compliance: Produces fully compatible PDF documents readable on Acrobat, Apple Preview, and browsers.`,
            `Multi-Page Batch Handling: Organize, merge, split, and compress large multi-chapter PDF files effortlessly.`
          ],
          howToSteps: [
            `Drag and drop your PDF document or digital form into the ${name} upload area.`,
            `Arrange page orders, select desired compression levels, or configure conversion options.`,
            `Click generate and download your clean, optimized PDF document instantly.`
          ],
          faqs: [
            {
              question: `Are my confidential contracts and documents safe on Exismic?`,
              answer: `Absolutely. Exismic uses end-to-end SSL encryption. Your documents are processed in an ephemeral sandbox and are permanently deleted after your session ends.`,
            },
            {
              question: `Will ${name} disrupt fonts, formatting, or hyperlinks in my PDF?`,
              answer: `No. Our PDF engine adheres strictly to the ISO 32000 standard, guaranteeing that embedded vector fonts, vector lines, and clickable links remain pixel-perfect.`,
            },
            {
              question: `Can I use ${name} on my smartphone or tablet?`,
              answer: `Yes! ${name} is 100% mobile-optimized and functions smoothly in Safari, Chrome, and Firefox on iOS and Android devices without installing any software.`,
            },
            {
              question: `Is there a limitation on the number of pages I can process?`,
              answer: `Exismic handles large documents with dozens of pages with ease. Heavy enterprise documents benefit from Exismic Pro's high-memory worker tier.`,
            },
          ]
        };
      case "developer":
      case "ai":
        return {
          features: [
            `Syntactic Precision & AST Parsing: Clean, compliant code and schemas validated against strict specifications.`,
            `Client-Side Sandboxed Execution: Code generation and transformations run safely with zero remote telemetry.`,
            `Production-Ready Output: Formatted according to modern software engineering conventions and linting rules.`,
            `One-Click Clipboard Sync: Copy clean code, types, or syntax directly to your clipboard or project repo.`
          ],
          howToSteps: [
            `Input your source code, prompt, or schema into the ${name} editor above.`,
            `Choose your target dialect, formatting options, or generation parameters.`,
            `Copy the resulting clean code or export it directly into your codebase.`
          ],
          faqs: [
            {
              question: `Is my proprietary source code or data transmitted or logged?`,
              answer: `No. Exismic developer tools operate in strict privacy-first environments. Your source code and data are never logged, stored, or used for model training.`,
            },
            {
              question: `What specifications and languages does ${name} adhere to?`,
              answer: `${name} follows modern industry specifications including ECMAScript, TypeScript, RFC standards, and standard POSIX guidelines.`,
            },
            {
              question: `Can I integrate code generated by ${name} directly into commercial applications?`,
              answer: `Yes! All code, schemas, and configurations produced by ${name} are completely open for use in open-source or commercial proprietary software.`,
            },
            {
              question: `Does ${name} require installation of any local dependencies?`,
              answer: `None at all. ${name} runs directly in your browser with zero npm packages or CLI tools required.`,
            },
          ]
        };
      default:
        return {
          features: [
            `Streamlined Productivity: Purpose-built algorithms that turn complex tasks into one-click workflows.`,
            `Privacy-First Architecture: Your inputs and files are never stored or monetized.`,
            `Accessible Everywhere: Fully web-powered tool accessible on desktop, tablet, and mobile browsers.`,
            `High-Precision Engine: Tailored specifically for ${name.toLowerCase()} to guarantee studio-grade results.`
          ],
          howToSteps: [
            `Upload your file or enter your data into the ${name} workspace above.`,
            `Select your desired export quality or parameters to customize your workflow.`,
            `Click process and download your instant high-resolution result immediately.`
          ],
          faqs: [
            {
              question: `Is ${name} free to use on Exismic?`,
              answer: `${name} is free to use on Exismic with standard quality exports. For lossless full HD processing and priority speed, upgrade to Exismic Pro.`,
            },
            {
              question: `How does Exismic protect my privacy and files?`,
              answer: `All uploads are processed securely. We never store or monetize your uploaded photos, documents, or data. Processed files are automatically purged from our cache.`,
            },
            {
              question: `Can I use ${name} on mobile devices?`,
              answer: `Yes! ${name} is fully optimized for all mobile browsers, iPhones, Android devices, tablets, and desktop computers without needing any app downloads.`,
            },
            {
              question: `Why choose Exismic's ${name}?`,
              answer: `Exismic delivers an ultra-fast, ad-free studio experience backed by serverless GPU nodes, giving you clean, professional-grade outputs in seconds.`,
            },
          ]
        };
    }
  };

  const catDefaults = getCategoryDefaults(categoryId, toolName, toolDescription);

  const defaultFeatures = features || catDefaults.features;
  const defaultHowToSteps = howToSteps || catDefaults.howToSteps;
  const defaultFaqs = faqs || catDefaults.faqs;

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
