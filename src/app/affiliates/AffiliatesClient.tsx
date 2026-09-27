"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  TrendingUp,
  DollarSign,
  Gift,
  Coins,
  Share2,
  CheckCircle2,
  ArrowRight,
  BadgePercent,
  Calendar,
  CreditCard,
  ShieldCheck,
  Send,
  Loader2,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Award,
  Zap,
  ChevronDown,
  Check,
} from "lucide-react";
import Link from "next/link";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";
import { ExismicMark } from "@/components/ui/ExismicLogo";
import { submitAffiliateApplication } from "@/app/actions/affiliate";

const AUDIENCE_OPTIONS = [
  {
    value: "Under 1,000",
    label: "Under 1,000 followers / visitors",
    subtext: "Emerging creator or builder",
    badge: "Starter",
  },
  {
    value: "1k - 10k",
    label: "1,000 – 10,000 followers",
    subtext: "Growing YouTube, blog, or newsletter",
    badge: "20% Rev-Share",
  },
  {
    value: "10k - 50k",
    label: "10,000 – 50,000 followers",
    subtext: "Established creator or educator",
    badge: "25% Rev-Share",
  },
  {
    value: "50k - 200k",
    label: "50,000 – 200,000 followers",
    subtext: "High-reach media publication",
    badge: "25% Rev-Share",
  },
  {
    value: "200k+",
    label: "200,000+ subscribers / followers",
    subtext: "Top-tier channel or creator agency",
    badge: "30% VIP Ambassador",
  },
];

const PROGRAM_PILLARS = [
  {
    icon: BadgePercent,
    title: "Up to 30% Recurring",
    desc: "Earn high recurring commission on every active Exismic Pro referral for up to 12 months.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: Calendar,
    title: "60-Day Cookie Window",
    desc: "Receive credit even if your audience browses and decides to upgrade weeks later.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: DollarSign,
    title: "Monthly Payouts",
    desc: "Reliable automated monthly payments directly to your PayPal account or bank account.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Dedicated Support",
    desc: "Get access to pre-made marketing materials, demo graphics, and direct partner desk assistance.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
];

const TIERS = [
  {
    name: "Community Creator",
    commission: "20%",
    period: "Recurring for 12 months",
    payout: "$50 minimum threshold",
    desc: "Great for individual designers, developers, students, and small tech channels.",
    features: [
      "Custom referral link & tracking",
      "Real-time click & conversion dashboard",
      "Standard creator marketing kit",
      "Monthly PayPal or bank payouts",
    ],
    border: "border-white/10",
    badge: "Starting Tier",
    badgeStyle: "bg-white/5 text-zinc-300 border-white/10",
  },
  {
    name: "Verified Partner",
    commission: "25%",
    period: "Recurring for 12 months",
    payout: "$25 minimum threshold",
    desc: "Designed for active YouTubers, newsletter writers, design educators, and bloggers.",
    features: [
      "25% recurring rev-share on Pro plans",
      "Priority affiliate manager review",
      "Custom vanity coupon codes (e.g. YOURNAME20)",
      "Free Exismic Pro account for reviews",
      "Early beta access to new tools",
    ],
    popular: true,
    border: "border-amber-400/50 shadow-[0_0_35px_rgba(245,158,11,0.25)]",
    badge: "Most Popular",
    badgeStyle: "bg-amber-400/20 text-amber-300 border-amber-400/40",
  },
  {
    name: "Studio Ambassador",
    commission: "30%",
    period: "Extended recurring term",
    payout: "$0 minimum threshold",
    desc: "For prominent creator agencies, large communities, and top media publications.",
    features: [
      "30% recurring commission on all referrals",
      "Dedicated 1-on-1 partner manager",
      "Co-branded landing pages for your audience",
      "Sponsored community giveaway credits",
      "Custom enterprise terms & bespoke perks",
    ],
    border: "border-purple-400/40 shadow-[0_0_35px_rgba(168,85,247,0.2)]",
    badge: "VIP Ambassador",
    badgeStyle: "bg-purple-400/20 text-purple-300 border-purple-400/40",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Apply in 2 Minutes",
    desc: "Fill in the partner application below with your channels or website. We review and approve applications within 24 hours.",
  },
  {
    step: "02",
    title: "Share with Your Community",
    desc: "Use your unique link or custom discount code in video descriptions, blog reviews, tutorials, newsletters, or social posts.",
  },
  {
    step: "03",
    title: "Earn Recurring Income",
    desc: "Watch your commissions grow in real-time and receive monthly automated payouts with zero headache or hidden fees.",
  },
];

export default function AffiliatesClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    channel: "",
    audienceSize: "1k - 10k",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isAudienceDropdownOpen, setIsAudienceDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAudienceDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.channel) {
      setStatusMessage({ type: "error", text: "Please provide your name, email, and channel link." });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("channel", formData.channel);
      data.append("audienceSize", formData.audienceSize);
      data.append("message", formData.message);

      const res = await submitAffiliateApplication(data);
      if (res?.error) {
        setStatusMessage({ type: "error", text: res.error });
      } else {
        setStatusMessage({
          type: "success",
          text: "Application submitted successfully! Our partnership team has been notified and will review your channel within 24 hours.",
        });
        setFormData({
          name: "",
          email: "",
          channel: "",
          audienceSize: "1k - 10k",
          message: "",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "An error occurred while submitting your application. Please email partners@exismic.xyz directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-accent-purple/30 pb-32 relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[20%] w-[650px] h-[650px] bg-amber-500/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-[20%] left-[-10%] w-[700px] h-[700px] bg-purple-500/10 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
      </div>

      <main className="max-w-6xl mx-auto px-5 sm:px-6 pt-24 sm:pt-28 space-y-16 relative z-10">
        <PageBreadcrumb items={[{ label: "Creator & Partner Program" }]} />

        {/* Hero Section */}
        <header className="relative w-full rounded-[2.5rem] bg-[#090a10]/80 backdrop-blur-2xl border border-white/10 p-8 sm:p-12 md:p-16 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.7)] text-center sm:text-left">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4 mx-auto sm:mx-0">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-300 text-xs font-bold tracking-wide uppercase shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Users size={14} className="text-amber-300" />
              <span>Official Creator & Partner Program</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Earn recurring income{" "}
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                sharing tools you love.
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-zinc-300 font-medium leading-relaxed max-w-2xl">
              Partner with Exismic and earn up to 30% recurring commissions every month. Help your audience create, convert, and ship faster with our focused AI tools suite.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <BadgePercent size={14} className="text-amber-400" />
                <span>Commission: <strong className="text-white">Up to 30% Recurring</strong></span>
              </div>
              <span className="hidden sm:inline text-zinc-600">•</span>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-cyan-400" />
                <span>Cookie Window: <strong className="text-white">60 Days</strong></span>
              </div>
              <span className="hidden sm:inline text-zinc-600">•</span>
              <div className="flex items-center gap-1.5">
                <DollarSign size={14} className="text-emerald-400" />
                <span>Payouts: <strong className="text-white">Automated Monthly</strong></span>
              </div>
            </div>
          </div>
        </header>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROGRAM_PILLARS.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <div
                key={pillar.title}
                className="rounded-2xl bg-[#090a10]/70 border border-white/10 p-5 space-y-2.5 transition-all duration-300 hover:border-white/20 hover:bg-[#0c0d16]"
              >
                <div className={`p-2.5 rounded-xl ${pillar.bg} ${pillar.border} border ${pillar.color} w-fit`}>
                  <Icon size={18} />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">{pillar.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{pillar.desc}</p>
              </div>
            );
          })}
        </div>

        {/* 3 Steps Section */}
        <div className="rounded-[2.5rem] bg-[#090a10]/80 backdrop-blur-xl border border-white/10 p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              How the affiliate partnership works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <div
                key={step.step}
                className="relative rounded-2xl bg-white/[0.02] border border-white/5 p-6 space-y-3"
              >
                <span className="text-3xl font-black text-amber-400/30 font-mono block">
                  {step.step}
                </span>
                <h3 className="text-base font-bold text-white tracking-tight">{step.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Tiers Grid */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
              Transparent Commission Structure
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Choose your partner tier
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              As your audience and referrals grow, your commission rate and benefits upgrade automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-[2rem] bg-[#090a10]/90 backdrop-blur-xl border ${tier.border} p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${tier.badgeStyle}`}>
                      {tier.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{tier.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{tier.desc}</p>
                  </div>

                  <div className="py-2 border-y border-white/5">
                    <span className="text-3xl sm:text-4xl font-black text-white">{tier.commission}</span>
                    <span className="text-xs text-amber-300 font-bold ml-1.5 uppercase tracking-wide">
                      Commission
                    </span>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{tier.period}</p>
                  </div>

                  <ul className="space-y-2.5 pt-2">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                        <CheckCircle2 size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/5 text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>Threshold:</span>
                  <strong className="text-white">{tier.payout}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Application Form */}
        <div className="rounded-[2.5rem] bg-[#090a10]/90 backdrop-blur-2xl border border-amber-500/20 p-8 sm:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
              Ready to Partner?
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Apply for your unique partner link
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Submit your channels below and our creator partnership team will get back to you within 24 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Full Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Alex Rivera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.05] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Email Address <span className="text-amber-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex@youtube.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.05] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Channel or Website URL <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://youtube.com/@yourchannel"
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.05] transition-all"
                />
              </div>

              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Estimated Audience Size
                </label>

                {/* Custom Luxury Dropdown Trigger */}
                <button
                  type="button"
                  onClick={() => setIsAudienceDropdownOpen((prev) => !prev)}
                  className={`w-full px-4 py-3 rounded-xl bg-[#090a10] border text-left text-sm transition-all flex items-center justify-between gap-3 group ${
                    isAudienceDropdownOpen
                      ? "border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] bg-[#0d0e17]"
                      : "border-white/10 hover:border-amber-400/40 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1 rounded-md bg-amber-500/10 text-amber-400 shrink-0">
                      <Users size={14} />
                    </div>
                    <span className="font-semibold text-white truncate">
                      {AUDIENCE_OPTIONS.find((o) => o.value === formData.audienceSize)?.label || formData.audienceSize}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/20">
                      {AUDIENCE_OPTIONS.find((o) => o.value === formData.audienceSize)?.badge}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-zinc-400 transition-transform duration-300 ${
                        isAudienceDropdownOpen ? "rotate-180 text-amber-400" : "group-hover:text-zinc-200"
                      }`}
                    />
                  </div>
                </button>

                {/* Custom Animated Floating Options Menu */}
                <AnimatePresence>
                  {isAudienceDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-[#0a0b12]/98 backdrop-blur-2xl border border-amber-500/30 p-2 shadow-[0_25px_60px_rgba(0,0,0,0.95)] z-50 space-y-1"
                    >
                      {AUDIENCE_OPTIONS.map((option) => {
                        const isSelected = formData.audienceSize === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, audienceSize: option.value });
                              setIsAudienceDropdownOpen(false);
                            }}
                            className={`w-full px-3.5 py-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-3 group ${
                              isSelected
                                ? "bg-amber-400/15 border border-amber-400/40 text-white"
                                : "hover:bg-white/[0.05] border border-transparent text-zinc-300 hover:text-white"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${isSelected ? "text-amber-300" : "text-zinc-200"}`}>
                                  {option.label}
                                </span>
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/5">
                                  {option.badge}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{option.subtext}</p>
                            </div>

                            {isSelected && (
                              <div className="shrink-0 p-1 rounded-full bg-amber-400 text-black">
                                <Check size={12} strokeWidth={3} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Additional Notes or Audience Details (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Tell us a little bit about what content you create and how you plan to feature Exismic..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.05] transition-all resize-none"
              />
            </div>

            {/* Status Message */}
            <AnimatePresence mode="wait">
              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`flex items-start gap-3 p-4 rounded-xl text-xs leading-relaxed border ${
                    statusMessage.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}
                >
                  {statusMessage.type === "success" ? (
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  )}
                  <span>{statusMessage.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 p-px font-bold text-black shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative flex items-center justify-center gap-2 px-6 py-3.5 rounded-[11px] bg-gradient-to-r from-amber-300 to-yellow-300 group-hover:from-amber-200 group-hover:to-yellow-200 text-amber-950 font-black text-sm uppercase tracking-wider transition-all">
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit Partner Application</span>
                  </>
                )}
              </span>
            </button>
          </form>
        </div>

        {/* Category Laser Horizon Bridge */}
        <div className="relative w-full py-8">
          <div
            className="absolute inset-0 pointer-events-none blur-xl opacity-40"
            style={{ background: "radial-gradient(ellipse at center, #f59e0b, transparent 70%)" }}
          />
          <div
            className="w-full h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.2) 15%, #f59e0b 50%, rgba(245,158,11,0.2) 85%, transparent 100%)",
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
          <Link href="/referrals" className="hover:text-amber-300 transition-colors">
            Peer Referral Codes
          </Link>
          <span>•</span>
          <Link href="/brand" className="hover:text-amber-300 transition-colors">
            Brand Assets & Press Kit
          </Link>
          <span>•</span>
          <Link href="/pro" className="hover:text-amber-300 transition-colors">
            Exismic Pro Plans
          </Link>
          <span>•</span>
          <Link href="/help" className="hover:text-amber-300 transition-colors">
            Contact Partnerships Desk
          </Link>
        </div>
      </main>
    </div>
  );
}
