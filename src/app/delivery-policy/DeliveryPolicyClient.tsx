"use client";

import { motion } from "framer-motion";
import {
  Zap,
  CheckCircle2,
  Clock,
  Mail,
  ShieldCheck,
  CreditCard,
  RefreshCcw,
  FileCheck,
  HelpCircle,
  ArrowRight,
  AlertCircle,
  Coins,
  Globe,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";
import { ExismicMark } from "@/components/ui/ExismicLogo";

const DELIVERY_SECTIONS = [
  {
    id: "digital-nature",
    title: "1. 100% Digital Delivery (Zero Physical Shipping)",
    icon: Zap,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    content:
      "Exismic operates entirely as an online cloud software platform (SaaS) and artificial intelligence tool suite. All services, including Exismic Pro memberships, Generation Credit packs, and Sparks cosmetic rewards, are completely digital. No physical goods, boxed media, or parcels are ever manufactured, shipped, or delivered via postal courier. Consequently, no physical shipping fees or handling charges are ever billed to your payment card.",
  },
  {
    id: "fulfillment-speed",
    title: "2. Instant Automated Delivery Timeline (0 to 5 Seconds)",
    icon: Clock,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    content:
      "Service delivery is instantaneous. The moment your transaction is authorized and verified by our certified payment partners (Razorpay for UPI, Net Banking, and Indian Cards; PayPal for International Cards and PayPal accounts), our automated provisioning system directly applies your upgrade to your account. Your credit balance or Pro subscription status updates within seconds without requiring manual staff approval.",
  },
  {
    id: "confirmation-and-receipts",
    title: "3. Order Confirmation & Email Receipts",
    icon: FileCheck,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    content:
      "Immediately following successful payment authorization, an electronic order confirmation and detailed tax invoice receipt are dispatched to your registered account email address. Your digital receipt contains your unique Transaction Reference ID, itemized breakdown, tax details, and payment timestamp. You can also view and download full historical invoices at any time in your Account Billing portal.",
    link: { text: "Open Account Billing", url: "/account/billing" },
  },
  {
    id: "credit-packs",
    title: "4. Provisioning of Generation Credits & Sparks",
    icon: Coins,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    content:
      "When purchasing Generation Credit packs (Starter, Creator, or Studio) or redeeming promotional Sparks vouchers, your credits are immediately deposited into your permanent Cloud Reserve balance. Top-up credits never expire and carry over indefinitely month-to-month. You can start using them right away on any tool in the studio (such as AI background removal, image generation, voice isolator, or document conversion).",
  },
  {
    id: "troubleshooting-delays",
    title: "5. Troubleshooting Delays or Connection Hiccups",
    icon: RefreshCcw,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    content:
      "On rare occasions, brief banking gateway congestion or slow internet connections may cause a temporary delay of 15 to 60 seconds before your browser displays your new credit balance. If your balance does not appear immediately: (1) Refresh your browser window or sign out and sign back in; (2) Check your email inbox for your payment confirmation receipt. If your account does not reflect the purchase after 3 minutes, please reach out to our dedicated support desk.",
  },
  {
    id: "support-and-guarantee",
    title: "6. Guaranteed Delivery Support & Resolution",
    icon: ShieldCheck,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    content:
      "We guarantee that every verified payment receives full credit delivery. If money has been debited from your bank account or card but our payment processor failed to communicate confirmation back to Exismic, our automated reconciliation system re-checks pending webhooks every 5 minutes. If an unfulfilled purchase is confirmed, our billing specialists will either immediately credit your account manually or issue a complete refund according to our Refund Policy.",
    link: { text: "Contact Support Desk", url: "/help" },
  },
];

export default function DeliveryPolicyClient() {
  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-accent-purple/30 pb-32 relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[15%] w-[650px] h-[650px] bg-emerald-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[20%] left-[-10%] w-[700px] h-[700px] bg-cyan-500/10 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
      </div>

      <main className="max-w-5xl mx-auto px-5 sm:px-6 pt-24 sm:pt-28 space-y-12 relative z-10">
        <PageBreadcrumb items={[{ label: "Digital Delivery Policy" }]} />

        {/* Hero Section */}
        <header className="relative w-full rounded-[2.5rem] bg-[#090a10]/80 backdrop-blur-2xl border border-white/10 p-8 sm:p-12 md:p-16 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 text-xs font-bold tracking-wide uppercase shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Zap size={14} className="text-emerald-300" />
              <span>Electronic Service Delivery & Fulfillment</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Instant digital access.{" "}
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                Zero waiting.
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-zinc-300 font-medium leading-relaxed max-w-2xl">
              Exismic is 100% cloud-based software. Learn how our instant digital delivery works, how purchases are confirmed, and what to do if you ever need support.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-emerald-400" />
                <span>Delivery Speed: <strong className="text-white">Instant (0–5s)</strong></span>
              </div>
              <span className="hidden sm:inline text-zinc-600">•</span>
              <div className="flex items-center gap-1.5">
                <Globe size={14} className="text-cyan-400" />
                <span>Physical Shipping: <strong className="text-white">None (100% Electronic)</strong></span>
              </div>
              <span className="hidden sm:inline text-zinc-600">•</span>
              <div className="flex items-center gap-1.5">
                <Lock size={14} className="text-purple-400" />
                <span>Payment Gateways: <strong className="text-white">Razorpay & PayPal</strong></span>
              </div>
            </div>
          </div>
        </header>

        {/* Highlight Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-[#090a10]/70 border border-white/10 p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Zap size={15} />
              <span>Instant Activation</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Pro subscriptions and top-up credits are activated automatically the millisecond payment clears.
            </p>
          </div>

          <div className="rounded-2xl bg-[#090a10]/70 border border-white/10 p-5 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Mail size={15} />
              <span>Email Confirmation</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Tax invoice receipts with full itemized breakdown are emailed immediately upon successful checkout.
            </p>
          </div>

          <div className="rounded-2xl bg-[#090a10]/70 border border-white/10 p-5 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={15} />
              <span>Delivery Guarantee</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Automated reconciliation guarantees that every debit gets fulfilled or resolved by our billing desk.
            </p>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-6">
          {DELIVERY_SECTIONS.map((section) => {
            const Icon = section.icon;

            return (
              <motion.article
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="relative rounded-[2rem] bg-[#090a10]/80 backdrop-blur-xl border border-white/10 p-6 sm:p-8 md:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.5)] space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${section.bg} ${section.border} border ${section.color}`}>
                    <Icon size={20} />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {section.title}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pl-0 sm:pl-12">
                  {section.content}
                </p>

                {section.link && (
                  <div className="pl-0 sm:pl-12 pt-2">
                    <Link
                      href={section.link.url}
                      className="inline-flex items-center gap-2 text-xs font-bold text-cyan-300 hover:text-cyan-200 transition-colors"
                    >
                      <span>{section.link.text}</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>

        {/* Category Laser Horizon Bridge */}
        <div className="relative w-full py-8">
          <div
            className="absolute inset-0 pointer-events-none blur-xl opacity-40"
            style={{ background: "radial-gradient(ellipse at center, #10b981, transparent 70%)" }}
          />
          <div
            className="w-full h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.2) 15%, #10b981 50%, rgba(16,185,129,0.2) 85%, transparent 100%)",
            }}
          />
          <div
            className="w-1/3 mx-auto h-0.5 -mt-px blur-[1px]"
            style={{
              background: "linear-gradient(90deg, transparent 0%, #ffffff 50%, transparent 100%)",
            }}
          />
        </div>

        {/* Bottom Helpful Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 pb-8">
          <Link href="/help" className="hover:text-emerald-300 transition-colors">
            Contact Support Desk
          </Link>
          <span>•</span>
          <Link href="/refund-policy" className="hover:text-emerald-300 transition-colors">
            Refund & Cancellation Policy
          </Link>
          <span>•</span>
          <Link href="/terms-of-service" className="hover:text-emerald-300 transition-colors">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/privacy-policy" className="hover:text-emerald-300 transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/help" className="hover:text-emerald-300 transition-colors">
            Help Center
          </Link>
        </div>
      </main>
    </div>
  );
}
