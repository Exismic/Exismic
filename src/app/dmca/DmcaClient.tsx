"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Scale,
  ShieldCheck,
  AlertCircle,
  Mail,
  Copy,
  Check,
  Building2,
  MapPin,
  Clock,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";
import { ExismicMark } from "@/components/ui/ExismicLogo";

const DMCA_SECTIONS = [
  {
    id: "commitment",
    title: "1. Intellectual Property & Safe Harbor Commitment",
    icon: Scale,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    content:
      "Exismic respects the intellectual property rights of creators, artists, and rights holders worldwide. In accordance with the Digital Millennium Copyright Act (17 U.S.C. § 512), we respond expeditiously to valid notices of claimed copyright infringement submitted to our designated copyright agent.",
  },
  {
    id: "designated-agent",
    title: "2. Designated Copyright Agent Contact Information",
    icon: Building2,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    content:
      "Formal written notifications of claimed copyright infringement must be sent directly to Exismic's Designated Copyright Agent via electronic mail. Submitting notices directly to dmca@exismic.xyz ensures immediate review and expedited legal triage.",
  },
  {
    id: "notice-requirements",
    title: "3. How to Submit a Valid Notice of Infringement",
    icon: FileText,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    content:
      "Under 17 U.S.C. § 512(c)(3), an actionable notice of claimed infringement must include all of the following six elements to be legally effective:",
    checklist: [
      "A physical or electronic signature of a person authorized to act on behalf of the copyright owner.",
      "Clear identification of the copyrighted work claimed to have been infringed (or a representative list if multiple works).",
      "Identification of the specific material claimed to be infringing, including direct URLs or sufficient details to allow us to locate it.",
      "Your contact details, including your full legal name, physical address, telephone number, and active email address.",
      "A statement that you have a good-faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.",
      "A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner.",
    ],
  },
  {
    id: "counter-notification",
    title: "4. Counter-Notification Procedure for Users",
    icon: ShieldCheck,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    content:
      "If material you submitted was removed or disabled due to a copyright notice and you believe this was due to mistake, misidentification, or fair use, you may submit a formal Counter-Notification to our Designated Agent. The counter-notice must include: your signature, identification of the removed material, a statement under penalty of perjury of your good-faith belief of mistake or misidentification, your contact information, and your consent to federal district court jurisdiction.",
  },
  {
    id: "repeat-infringers",
    title: "5. Repeat Infringer Policy & Account Termination",
    icon: AlertCircle,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    content:
      "Exismic maintains a strict repeat infringer policy. We will permanently terminate account access, revoke all platform privileges, and forfeit remaining compute credit balances for users determined to be repeat or serial infringers of intellectual property rights.",
  },
];

export default function DmcaClient() {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("dmca@exismic.xyz");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-accent-purple/30 pb-32 relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[25%] w-[650px] h-[650px] bg-purple-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[700px] h-[700px] bg-cyan-500/10 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
      </div>

      <main className="max-w-5xl mx-auto px-5 sm:px-6 pt-24 sm:pt-28 space-y-12 relative z-10">
        <PageBreadcrumb items={[{ label: "DMCA & Copyright Policy" }]} />

        {/* Hero Section */}
        <header className="relative w-full rounded-[2.5rem] bg-[#090a10]/80 backdrop-blur-2xl border border-white/10 p-8 sm:p-12 md:p-16 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/15 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-purple-400/30 bg-purple-500/10 text-purple-300 text-xs font-bold tracking-wide uppercase shadow-[0_0_20px_rgba(168,85,247,0.2)]">
              <Scale size={14} className="text-purple-300" />
              <span>Intellectual Property Protection & Safe Harbor</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-white">
              DMCA & Copyright{" "}
              <span className="bg-gradient-to-r from-purple-300 via-fuchsia-200 to-cyan-300 bg-clip-text text-transparent">
                Compliance.
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-zinc-300 font-medium leading-relaxed max-w-2xl">
              We respect and protect copyright ownership. Review our designated agent details, formal takedown notice instructions, and counter-notification process.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-purple-400" />
                <span>Notice Triage: <strong className="text-white">Within 24–48 Hours</strong></span>
              </div>
              <span className="hidden sm:inline text-zinc-600">•</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-cyan-400" />
                <span>Standard: <strong className="text-white">17 U.S.C. § 512 Safe Harbor</strong></span>
              </div>
            </div>
          </div>
        </header>

        {/* Designated Copyright Agent Card */}
        <div className="rounded-[2rem] bg-[#090a10]/80 backdrop-blur-xl border border-purple-500/20 p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-purple-400">
                Official Designated Representative
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                Designated Copyright Agent
              </h2>
            </div>

            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-xs font-bold text-purple-300 transition-colors self-start sm:self-auto"
            >
              {copiedEmail ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied dmca@exismic.xyz</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Agent Email</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs text-zinc-300">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Designated Contact Name
              </span>
              <p className="text-white font-medium">Syed Rayan · DMCA Compliance Director</p>
              <p className="text-zinc-400">Exismic AI Studio / Raxstdioz LLC</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Electronic Mail (Fastest)
              </span>
              <p className="font-mono text-cyan-300 font-semibold text-sm">dmca@exismic.xyz</p>
              <p className="text-zinc-400">Also CC: legal@exismic.xyz</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Operating Structure
              </span>
              <p className="text-white font-medium">Cloud-Native Digital Studio</p>
              <p className="text-zinc-400">100% remote digital operations · Direct electronic legal triage via dmca@exismic.xyz</p>
            </div>
          </div>
        </div>

        {/* Detailed Policy Sections */}
        <div className="space-y-6">
          {DMCA_SECTIONS.map((section) => {
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

                {section.checklist && (
                  <div className="pl-0 sm:pl-12 pt-2">
                    <ul className="space-y-2.5 text-xs text-zinc-300">
                      {section.checklist.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                          <CheckCircle2 size={15} className="text-purple-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
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
            style={{ background: "radial-gradient(ellipse at center, #a855f7, transparent 70%)" }}
          />
          <div
            className="w-full h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.2) 15%, #a855f7 50%, rgba(168,85,247,0.2) 85%, transparent 100%)",
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
          <Link href="/terms-of-service" className="hover:text-purple-300 transition-colors">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/privacy-policy" className="hover:text-purple-300 transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/help" className="hover:text-purple-300 transition-colors">
            Contact Support Desk
          </Link>
          <span>•</span>
          <Link href="/delivery-policy" className="hover:text-purple-300 transition-colors">
            Digital Delivery Policy
          </Link>
        </div>
      </main>
    </div>
  );
}
