import { PricingCards } from "@/components/billing/PricingCards";
import { SITE_URL } from "@/lib/seo";
import { Check, Crown, HelpCircle, ShieldCheck, Sparkles, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

const PRICING_FAQS = [
  {
    question: "How do Exismic Generation Credits work?",
    answer:
      "Generation credits are the fuel used to run AI processing jobs such as background removal, image generation, audio isolation, and resume analysis. Free users receive a daily credit refresh of 50 credits at midnight, while purchased credit packs (Starter, Creator, Studio) are permanent and never expire.",
  },
  {
    question: "What is included with an Exismic Pro membership?",
    answer:
      "Exismic Pro unlocks 500 daily generation credits refreshed every 24 hours, priority GPU worker queues, high-memory limits for heavy documents and multi-gigabyte videos, full 4K output generation, exclusive starter avatar frames and glowing name cosmetics, and zero watermarks across the entire platform.",
  },
  {
    question: "Do purchased credit packs expire?",
    answer:
      "No! Any credit package purchased through our shop (500, 1,500, or 5,000 credits) is added to your permanent lifetime reserve. These credits never expire, never reset at midnight, and remain safely in your account until you decide to spend them.",
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer:
      "Yes. You can cancel your Exismic Pro subscription with 1 click directly inside your Account Settings (/account/settings) or via your payment provider (Razorpay or PayPal). You will retain full Pro benefits until the end of your current paid billing period.",
  },
  {
    question: "Which payment methods are supported?",
    answer:
      "For users in India, we support UPI, Google Pay, PhonePe, Paytm, Indian debit/credit cards, and net banking via Razorpay in INR. For international creators, we support PayPal, Visa, Mastercard, and American Express in USD.",
  },
  {
    question: "Can I try Exismic tools for free before purchasing?",
    answer:
      "Yes! Exismic is free to start. Every visitor can test our creative suite immediately with their daily allowance of credits without even needing to enter a credit card.",
  },
];

const COMPARISON_ROWS = [
  {
    feature: "Daily Generation Credits",
    free: "50 cr / day",
    starter: "50 cr daily + 500 permanent",
    creator: "50 cr daily + 1,500 permanent",
    pro: "500 cr / day",
  },
  {
    feature: "Permanent Balance (Never Expires)",
    free: "No",
    starter: "500 credits",
    creator: "1,500 credits",
    pro: "Permanent bonus packs stackable",
  },
  {
    feature: "GPU Processing Priority",
    free: "Standard Queue",
    starter: "Standard Queue",
    creator: "Fast Queue",
    pro: "Dedicated Priority High-Speed Queue",
  },
  {
    feature: "Max Video & Audio Limits",
    free: "Standard Limits",
    starter: "Standard Limits",
    creator: "Expanded Limits",
    pro: "Multi-Gigabyte Extended Limits",
  },
  {
    feature: "Watermark-Free Exports",
    free: "Yes (100% Clean)",
    starter: "Yes (100% Clean)",
    creator: "Yes (100% Clean)",
    pro: "Yes (100% Clean)",
  },
  {
    feature: "Cloud Drive Storage",
    free: "50 MB",
    starter: "50 MB",
    creator: "100 MB",
    pro: "5 GB High-Speed Vault",
  },
  {
    feature: "Exclusive Profile Cosmetics",
    free: "Sparks Rewards Shop",
    starter: "Sparks Rewards Shop",
    creator: "Sparks Rewards Shop",
    pro: "5 Pro Starter Frames + 5 Name Styles",
  },
];

export default function PricingPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PRICING_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Exismic AI Creative Suite",
    description: "All-in-one web AI creative suite for image editing, video processing, audio isolation, PDF management, and coding utilities.",
    brand: {
      "@type": "Brand",
      name: "Exismic",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "0",
      highPrice: "6.99",
      offerCount: "4",
      offers: [
        {
          "@type": "Offer",
          name: "Exismic Free",
          price: "0",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          name: "Starter Credit Pack",
          price: "3.99",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          name: "Creator Credit Pack",
          price: "8.99",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          name: "Exismic Pro Monthly",
          price: "6.99",
          priceCurrency: "USD",
        },
      ],
    },
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#030306] px-4 py-20 text-white sm:px-6 lg:px-8">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.22),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.12),transparent_32%)]" />

      <section className="relative z-10 mx-auto max-w-7xl space-y-20">
        {/* HERO HEADER */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-[0.2em] text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <Sparkles size={13} className="text-cyan-300" />
            <span>Transparent Pricing & Plans</span>
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
            Choose your Exismic plan.
          </h1>
          <p className="mt-5 text-base font-medium leading-relaxed text-zinc-400 sm:text-lg">
            Fair, simple pricing tailored to your workflow. Start with free daily credits, top up with permanent credits that never expire, or unlock unlimited potential with Exismic Pro.
          </p>
        </div>

        {/* PRICING CARDS (SSR HYDRATED) */}
        <PricingCards />

        {/* PLAN COMPARISON MATRIX */}
        <div className="space-y-8 rounded-3xl border border-white/10 bg-zinc-950/60 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-purple-400">
                <Crown size={14} />
                <span>Feature Breakdown</span>
              </div>
              <h2 className="text-2xl font-black text-white sm:text-3xl mt-1">
                Compare Plan Capabilities
              </h2>
            </div>
            <Link
              href="/rewards/guide"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 self-start sm:self-auto"
            >
              <span>Read Full Currencies & Credit Guide</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-black uppercase tracking-wider text-zinc-400">
                  <th className="py-4 pr-4">Feature</th>
                  <th className="py-4 px-4">Free Tier</th>
                  <th className="py-4 px-4">Starter Pack</th>
                  <th className="py-4 px-4">Creator Choice</th>
                  <th className="py-4 pl-4 text-cyan-300">Exismic Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium text-zinc-300">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 pr-4 font-bold text-white">{row.feature}</td>
                    <td className="py-4 px-4 text-zinc-400">{row.free}</td>
                    <td className="py-4 px-4 text-zinc-300">{row.starter}</td>
                    <td className="py-4 px-4 text-zinc-300">{row.creator}</td>
                    <td className="py-4 pl-4 font-bold text-cyan-300">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-300 border border-amber-400/30 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                Frequently Asked Questions
              </h2>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                Everything you need to know about billing, credits, and subscriptions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PRICING_FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="space-y-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-500/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <div className="size-7 rounded-lg bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-black flex items-center justify-center shrink-0">
                    Q
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug">
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

        {/* TRUST & LEGAL BAR */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
            <span>All transactions are 256-bit SSL encrypted. Instant delivery upon checkout.</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <Link href="/terms-of-service" className="hover:text-white transition-colors underline">
              Terms & Refund Policy
            </Link>
            <span>•</span>
            <Link href="/help" className="hover:text-white transition-colors underline">
              Billing Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
