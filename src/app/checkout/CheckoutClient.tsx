"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  CreditCard,
  HelpCircle,
  Loader2,
  ShieldCheck,
  Smartphone,
  Tag,
  Ticket,
  User,
  Zap,
  Gift,
  Mail,
  MessageSquare,
  Crown,
  Coins,
} from "lucide-react";
import { PRICING_CONFIG, isExismic17PromoActive, getIsIndia } from "@/config/pricing";
import { cn } from "@/lib/utils";
import { BILLING_PLANS, getBillingPlan, getPlanPrice, type BillingPlanId } from "@/lib/billing/plans";
import {
  CardBrandBadgesRow,
  RupayIcon,
  UpiIcon,
} from "@/components/billing/CardBrandIcons";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { loadRazorpayCheckout } from "@/lib/payments/loadRazorpayCheckout";
import { reportPaymentFailure } from "@/lib/payments/reportPaymentFailure";

interface CheckoutClientProps {
  initialPlanId?: string;
  initialMarket?: "IN" | "GLOBAL";
}

type AppliedCoupon = {
  code: string;
  displayFinal: string;
  displayOriginal?: string;
  discountLabel: string;
  note?: string;
};

type PaymentLoadingMethod =
  | "card"
  | "paypal"
  | "apple_pay"
  | "google_pay"
  | "razorpay_upi"
  | "razorpay_card"
  | null;

export function CheckoutClient({ initialPlanId = "starter", initialMarket }: CheckoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Authentication & live credit balance
  const { user } = useAuth();
  const { credits, isPro, loading: creditsLoading } = useCredits();

  const planParam = searchParams.get("plan") || initialPlanId;
  const couponParam = searchParams.get("coupon") || "";

  // Market & Currency Detection (Default is sync checked via initialMarket, getIsIndia(), or URL query)
  const [market, setMarket] = useState<"GLOBAL" | "IN">(() => {
    if (initialMarket) return initialMarket;
    if (typeof window === "undefined") return "GLOBAL";
    const marketQuery = new URLSearchParams(window.location.search).get("market")?.toUpperCase();
    if (marketQuery === "IN" || marketQuery === "GLOBAL") return marketQuery as "GLOBAL" | "IN";
    return getIsIndia() ? "IN" : "GLOBAL";
  });

  useEffect(() => {
    const marketQuery = searchParams.get("market")?.toUpperCase();
    if (marketQuery === "IN" || marketQuery === "GLOBAL") {
      setMarket(marketQuery as "GLOBAL" | "IN");
      return;
    }
    // Check auto-geo detection in background
    fetch("/api/billing/market")
      .then((res) => res.json())
      .then((data) => {
        if (data?.market === "IN" || data?.market === "GLOBAL") {
          const isInd = data.countryCode === "UNKNOWN" ? getIsIndia() : data.market === "IN";
          setMarket(isInd ? "IN" : "GLOBAL");
        }
      })
      .catch(() => {
        setMarket(getIsIndia() ? "IN" : "GLOBAL");
      });
  }, [searchParams]);



  // Normalize tier aliases
  const normalizedPlanId = (
    { tier_1: "starter", tier_2: "creator", tier_3: "ultimate" }[planParam] || planParam
  ) as BillingPlanId;

  const plan = getBillingPlan(normalizedPlanId) || BILLING_PLANS.starter;
  const isGift = searchParams.get("gift") === "true";
  const [recipientEmail, setRecipientEmail] = useState(
    () => searchParams.get("recipientEmail") || ""
  );
  const [recipientName, setRecipientName] = useState(
    () => searchParams.get("recipientName") || ""
  );
  const [recipientMessage, setRecipientMessage] = useState(
    () => searchParams.get("recipientMessage") || ""
  );
  const [recipientEmailError, setRecipientEmailError] = useState("");

  function handleSwitchPlan(newPlanId: BillingPlanId) {
    const params = new URLSearchParams();
    params.set("plan", newPlanId);
    if (isGift) {
      params.set("gift", "true");
      if (recipientEmail.trim()) params.set("recipientEmail", recipientEmail.trim());
      if (recipientName.trim()) params.set("recipientName", recipientName.trim());
      if (recipientMessage.trim()) params.set("recipientMessage", recipientMessage.trim());
    }
    if (coupon?.code || couponParam) {
      params.set("coupon", coupon?.code || couponParam);
    }
    if (market === "IN") {
      params.set("market", "IN");
    }
    router.replace(`/checkout?${params.toString()}`, { scroll: false });
  }
  const isSubscription = !isGift && (plan.interval === "month" || plan.interval === "year");
  const yearly = plan.id === "pro_yearly";
  const isGiftPro = plan.id === "pro" || plan.id === "pro_yearly";

  // Dynamic price based on detected market (USD for Global, INR for Indian users)
  const basePrice = getPlanPrice(plan.id, market);
  const automaticDiscount = isExismic17PromoActive() && basePrice.isDiscounted;

  // Promo code state
  const [showPromoField, setShowPromoField] = useState(Boolean(couponParam));
  const [promoInput, setPromoInput] = useState(couponParam);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Payment execution state
  const [loadingMethod, setLoadingMethod] = useState<PaymentLoadingMethod>(null);
  const [paymentError, setPaymentError] = useState("");



  function cleanPaymentErrorMessage(raw: string): string {
    if (!raw) return "Payment could not be started. Please try again or choose another payment method.";
    if (/vercel|client id|secret|auth.*failed|gateway auth|status 401|api-m|unauthorized|internal|syntaxerror|token|undefined|500/i.test(raw)) {
      return "We couldn't connect to PayPal right now. Please try another payment method or try again in a moment.";
    }
    return raw;
  }

  // FAQ Drawer state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Pricing calculations
  const totalDisplay =
    coupon?.displayFinal ||
    (automaticDiscount ? basePrice.display : basePrice.display);
  const regularDisplay = basePrice.regularDisplay;
  const parseNum = (s: string) => parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
  const regNum = parseNum(regularDisplay);
  const totNum = parseNum(totalDisplay);
  const savingsAmount = Math.max(0, regNum - totNum);
  const hasSavings = savingsAmount > 0;

  // Credit details
  const pack = PRICING_CONFIG.CREDIT_PACKAGES.find((p) => p.billingPlanId === plan.id);
  const creditsAmount = pack ? pack.credits + pack.bonusCredits : plan.credits;

  // Promo code validation
  async function applyPromoCode(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!promoInput.trim() || couponLoading) return;

    setCouponLoading(true);
    setCouponError("");
    setCoupon(null);

    try {
      const res = await fetch("/api/billing/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoInput.trim(),
          planId: plan.id,
          marketOverride: market,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.error || "This coupon code is invalid.");
      }

      setCoupon(data);
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Unable to validate coupon code.");
    } finally {
      setCouponLoading(false);
    }
  }

  // Auto-validate coupon from URL if present
  useEffect(() => {
    if (couponParam) {
      applyPromoCode();
    }
  }, [couponParam]);

  // Listen for popup payment completion messages
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "EXISMIC_PAYMENT_SUCCESS") {
        const confirmedId = event.data.orderId;
        if (confirmedId) {
          window.location.assign(
            `/billing/success?order=${encodeURIComponent(confirmedId)}&type=${isSubscription ? "pro" : "credits"}&plan=${encodeURIComponent(plan.id)}`
          );
        }
      } else if (event.data?.type === "EXISMIC_PAYMENT_CANCELLED") {
        setLoadingMethod(null);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isSubscription, plan.id]);

  // Global Checkout -> Open secure payment popup (Card, PayPal, Apple Pay, Google Pay)
  async function handleStartGlobalCheckout(method: "card" | "paypal" | "apple_pay" | "google_pay") {
    if (!user) {
      router.push(`/auth/login?plan=${plan.id}&returnUrl=${encodeURIComponent(`/checkout?plan=${plan.id}&market=${market}`)}`);
      return;
    }

    setLoadingMethod(method);
    setPaymentError("");
    setRecipientEmailError("");

    if (isGift) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!recipientEmail.trim() || !emailRegex.test(recipientEmail.trim())) {
        setRecipientEmailError("Please enter a valid recipient email address so we can deliver their gift pass.");
        setPaymentError("Please provide the recipient's email address above before paying.");
        return;
      }
    }

    // Calculate center coordinates for popup
    const popupWidth = 520;
    const popupHeight = 740;
    const left = typeof window !== "undefined" ? window.screenX + Math.max(0, (window.outerWidth - popupWidth) / 2) : 100;
    const top = typeof window !== "undefined" ? window.screenY + Math.max(0, (window.outerHeight - popupHeight) / 2) : 100;
    const popupFeatures = `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,status=no,toolbar=no,location=no`;

    // Open popup immediately during user click event to prevent browser popup blockers
    let popup: Window | null = null;
    try {
      popup = window.open("about:blank", "ExismicSecurePayment", popupFeatures);
      if (popup) {
        popup.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Secure Checkout • Exismic</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body {
                  margin: 0; padding: 24px;
                  background: #070b16; color: #fff;
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                  display: flex; align-items: center; justify-content: center;
                  min-height: 80vh; text-align: center;
                }
                .spinner {
                  width: 38px; height: 38px;
                  border: 3px solid rgba(168, 85, 247, 0.2);
                  border-top-color: #a855f7;
                  border-radius: 50%;
                  animation: spin 0.8s linear infinite;
                  margin: 0 auto 16px auto;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                h3 { font-size: 17px; font-weight: 700; margin: 0 0 6px 0; color: #f4f4f5; }
                p { font-size: 13px; color: #a1a1aa; margin: 0; line-height: 1.5; }
              </style>
            </head>
            <body>
              <div>
                <div class="spinner"></div>
                <h3>Connecting to Secure Checkout</h3>
                <p>Please wait while we open your payment window…</p>
              </div>
            </body>
          </html>
        `);
      }
    } catch {
      popup = null;
    }

    try {
      const res = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          marketOverride: "GLOBAL",
          couponCode: coupon?.code,
          paymentMethod: method,
          isGift,
          recipientEmail: recipientEmail.trim() || undefined,
          recipientName: recipientName.trim() || undefined,
          recipientMessage: recipientMessage || undefined,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || "Could not prepare checkout.");
      }

      if (orderData.approvalUrl) {
        if (popup && !popup.closed) {
          popup.location.href = orderData.approvalUrl;
          popup.focus();

          // Monitor if user manually closes the popup window without completing payment
          const timer = setInterval(() => {
            if (popup?.closed) {
              clearInterval(timer);
              setLoadingMethod(null);
            }
          }, 800);
          return;
        } else {
          // Fallback if browser blocked the popup
          window.location.assign(orderData.approvalUrl);
          return;
        }
      }

      if (orderData.orderId) {
        if (popup && !popup.closed) {
          popup.close();
        }
        window.location.assign(`/billing/success?order=${encodeURIComponent(orderData.orderId)}&type=${isSubscription ? "pro" : "credits"}&plan=${encodeURIComponent(plan.id)}`);
        return;
      }

      throw new Error("Unable to open checkout. Please try again.");
    } catch (err) {
      if (popup && !popup.closed) {
        popup.close();
      }
      setPaymentError(cleanPaymentErrorMessage(err instanceof Error ? err.message : "Unable to start checkout. Please try again."));
      setLoadingMethod(null);
    }
  }

  // Indian Checkout -> Razorpay (UPI, Net Banking, Indian Cards)
  async function handleStartRazorpayCheckout(paymentType: "upi" | "card") {
    if (!user) {
      router.push(`/auth/login?plan=${plan.id}&returnUrl=${encodeURIComponent(`/checkout?plan=${plan.id}&market=${market}`)}`);
      return;
    }

    setLoadingMethod(paymentType === "upi" ? "razorpay_upi" : "razorpay_card");
    setPaymentError("");
    setRecipientEmailError("");

    if (isGift) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!recipientEmail.trim() || !emailRegex.test(recipientEmail.trim())) {
        setRecipientEmailError("Please enter a valid recipient email address so we can deliver their gift pass.");
        setPaymentError("Please provide the recipient's email address above before paying.");
        return;
      }
    }

    try {
      const res = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          marketOverride: "IN",
          couponCode: coupon?.code,
          isGift,
          recipientEmail: recipientEmail.trim() || undefined,
          recipientName: recipientName.trim() || undefined,
          recipientMessage: recipientMessage || undefined,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || "Could not prepare checkout.");
      }

      if (orderData.gateway === "mock" && orderData.approvalUrl) {
        window.location.assign(orderData.approvalUrl);
        return;
      }

      if (orderData.gateway !== "razorpay") {
        throw new Error("Payment gateway is temporarily unavailable.");
      }

      const Razorpay = await loadRazorpayCheckout();
      const checkout = new Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Exismic",
        description: orderData.plan?.name || `${plan.name} purchase`,
        ...(orderData.razorpaySubscriptionId
          ? { subscription_id: orderData.razorpaySubscriptionId }
          : { order_id: orderData.razorpayOrderId }),
        prefill: {
          name: (user as unknown as { user_metadata?: { full_name?: string } })?.user_metadata?.full_name || (user?.email ? user.email.split("@")[0] : ""),
          email: user?.email || "",
          contact: (user as unknown as { user_metadata?: { phone?: string } })?.user_metadata?.phone || "",
        },
        theme: { color: "#a855f7" },
        modal: {
          ondismiss: () => setLoadingMethod(null),
        },
        config: paymentType === "card"
          ? {
              display: {
                blocks: {
                  card_block: {
                    name: "Debit or Credit Card",
                    instruments: [{ method: "card" }],
                  },
                  other_block: {
                    name: "Other Payment Methods",
                    instruments: [{ method: "upi" }, { method: "netbanking" }],
                  },
                },
                sequence: ["block.card_block", "block.other_block"],
                preferences: {
                  show_default_blocks: false,
                },
              },
            }
          : {
              display: {
                blocks: {
                  upi_block: {
                    name: "UPI (Google Pay, PhonePe, Paytm)",
                    instruments: [{ method: "upi" }],
                  },
                  netbanking_block: {
                    name: "Net Banking",
                    instruments: [{ method: "netbanking" }],
                  },
                  card_block: {
                    name: "Debit or Credit Card",
                    instruments: [{ method: "card" }],
                  },
                },
                sequence: ["block.upi_block", "block.netbanking_block", "block.card_block"],
                preferences: {
                  show_default_blocks: false,
                },
              },
            },
        handler: async (payment: unknown) => {
          try {
            const verified = await fetch("/api/billing/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payment),
            });
            const result = await verified.json();
            if (!verified.ok || !result.success || !result.orderId) {
              throw new Error(result.error || "Payment confirmation is pending.");
            }
            window.location.assign(`/billing/success?order=${encodeURIComponent(result.orderId)}&type=${isSubscription ? "pro" : "credits"}&plan=${encodeURIComponent(plan.id)}`);
          } catch {
            window.location.assign(`/billing/success?order=${encodeURIComponent(orderData.orderId)}&type=${isSubscription ? "pro" : "credits"}&plan=${encodeURIComponent(plan.id)}`);
            setLoadingMethod(null);
          }
        },
      });

      checkout.on("payment.failed", (failure: unknown) => {
        void reportPaymentFailure(orderData.orderId, failure);
        setPaymentError("Payment was not completed. You can try again.");
        setLoadingMethod(null);
      });

      checkout.open();
    } catch (err) {
      setPaymentError(cleanPaymentErrorMessage(err instanceof Error ? err.message : "Unable to start payment. Please try again."));
      setLoadingMethod(null);
    }
  }

  // Feature list based on plan (Crisp, 100% truthful, zero filler or fake claims)
  const featuresList = isGift
    ? [
        "Voucher code delivered directly to recipient's email address upon payment",
        "Redeemable by any user within 12 months with 1 click",
        plan.id === "pro" || plan.id === "pro_yearly"
          ? "Full Exismic Pro membership privileges activate upon redemption"
          : `${creditsAmount.toLocaleString()} credits added to recipient's balance permanently`,
        "Zero recurring fees or renewal charges (100% one-time purchase)",
      ]
    : isSubscription
    ? [
        "500 daily credits refreshed every day",
        "Fastest generation speed & priority processing queue",
        "Private generations & saved creation history",
        "Cancel anytime in 1 click in your account settings",
      ]
    : [
        `${creditsAmount.toLocaleString()} credits added to your balance instantly`,
        "Credits never expire — keep in your account forever",
        "Full access to all AI image, audio & creative tools",
        "One-time purchase (no subscriptions or renewal fees)",
      ];

  // FAQ questions list (3 genuine, high-value questions - zero filler)
  const faqs = [
    isGift
      ? {
          q: "How does the recipient receive their gift pass?",
          a: "Once payment completes, our system automatically emails your recipient with their private voucher code, your personal message, and a 1-click redemption link. You will also receive a copy and receipt for your records.",
        }
      : isSubscription
      ? {
          q: "Can I cancel my subscription anytime?",
          a: "Yes, anytime with 1 click directly in your account settings. No phone calls, no questions asked, and zero cancellation fees. Your Pro privileges remain active until your billing period finishes.",
        }
      : {
          q: "Is this a one-time purchase or a subscription?",
          a: "This is a 100% one-time purchase. There are zero recurring fees, no auto-renewals, and your purchased credits stay in your account permanently.",
        },
    {
      q: "Do purchased credits ever expire?",
      a: "Never. Credits purchased through credit packs stay in your balance permanently until you choose to use them. They never expire or disappear.",
    },
    {
      q: "What payment methods are supported?",
      a:
        market === "IN"
          ? "We support all major Indian payment methods via Razorpay: UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking across 50+ banks, and all RuPay, Visa, and Mastercard cards."
          : "We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, and Google Pay with zero extra processing fees.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#04060a] text-white selection:bg-purple-500/30 selection:text-purple-200 flex flex-col justify-center items-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      {/* Ambient glowing atmospheric lighting (Deep Purple / Violet / Fuchsia) */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[850px] h-[450px] rounded-full bg-purple-600/[0.14] blur-[160px]" />
        <div className="absolute top-[20%] left-[-140px] w-[520px] h-[520px] rounded-full bg-violet-600/[0.14] blur-[170px]" />
        <div className="absolute bottom-[10%] right-[-140px] w-[520px] h-[520px] rounded-full bg-fuchsia-600/[0.1] blur-[170px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] [background-size:20px_20px] opacity-75" />
      </div>

      {/* Signature Exismic laser horizon divider at top */}
      <div className="fixed top-0 inset-x-0 z-30 h-[1px] bg-gradient-to-r from-transparent via-purple-500/70 to-transparent" />

      {/* Top Header / Back Navigation */}
      <div className="relative z-10 w-full max-w-5xl mb-4 flex items-center justify-between">
        <Link
          href="/shop"
          className="group inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-zinc-400 transition-colors hover:text-white"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] transition-all group-hover:border-purple-400/50 group-hover:bg-purple-500/15 group-hover:text-purple-300">
            <ArrowLeft size={16} />
          </div>
          <span>Back to plans</span>
        </Link>
      </div>

      {/* Master Unified Executive Glass Console */}
      <div className="relative z-10 w-full max-w-5xl rounded-[32px] border border-white/[0.12] bg-[#070b16]/95 backdrop-blur-3xl shadow-[0_25px_90px_rgba(147,51,234,0.18),0_40px_100px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Top radiant laser accent rim */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-90" />

        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
          {/* LEFT PANE: Payment Hub (lg:col-span-7) */}
          <div className="lg:col-span-7 p-6 sm:p-7 space-y-3.5 flex flex-col">
            {/* Title & Badging */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                {isGift ? "Gift Voucher Checkout" : "Payment Checkout"}
              </span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-purple-200 bg-clip-text text-transparent">
                {isGift ? `Gift ${plan.name} Pass` : isSubscription ? `Start your ${plan.name}` : `Get ${plan.name}`}
              </h1>
            </div>

            {/* OPTION 1: LIVE ACCOUNT & BALANCE PREVIEW */}
            <div className="rounded-2xl border border-white/[0.09] bg-gradient-to-r from-purple-500/[0.07] via-white/[0.02] to-transparent p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Account Identity */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-purple-400/40 bg-purple-500/20 text-purple-300 font-bold text-xs shadow-[0_0_12px_rgba(168,85,247,0.25)]">
                  {isGift ? (
                    <Gift size={15} className="text-amber-300" />
                  ) : user?.email ? (
                    user.email.charAt(0).toUpperCase()
                  ) : (
                    <User size={14} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                    {isGift ? (recipientName ? `Gift for ${recipientName}` : "Gift Voucher") : "Purchasing for"}
                  </div>
                  <div className="text-xs font-bold text-white break-all max-w-[210px] sm:max-w-[240px]">
                    {isGift ? `Buyer: ${user?.email || "Your Account"}` : (user?.email || (user as unknown as { name?: string })?.name || "Your Account")}
                  </div>
                </div>
              </div>

              {/* Live Credit / Plan Transition Preview */}
              <div className="flex min-w-0 items-center gap-2 bg-black/50 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs">
                {isGift ? (
                  <div className="flex items-center gap-1.5 font-medium text-amber-300 text-[11px]">
                    <Ticket size={12} className="text-amber-400 shrink-0" />
                    <span>Single-use gift code</span>
                  </div>
                ) : !isSubscription ? (
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5 font-medium">
                    <span className="text-zinc-400 font-mono text-[11px]">
                      {creditsLoading ? "…" : `${credits.toLocaleString()} cr`}
                    </span>
                    <ArrowRight size={12} className="text-purple-400 shrink-0" />
                    <span className="text-purple-300 font-bold font-mono text-[11px]">
                      {creditsLoading ? "…" : `${(credits + creditsAmount).toLocaleString()} cr`}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 ml-0.5">
                      (+{creditsAmount.toLocaleString()})
                    </span>
                  </div>
                ) : (
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5 font-medium">
                    <span className="text-zinc-400 text-[11px]">
                      {isPro ? "Pro Active" : "Free Plan"}
                    </span>
                    <ArrowRight size={12} className="text-purple-400 shrink-0" />
                    <span className="text-purple-300 font-bold text-[11px]">
                      {yearly ? "Annual Pro" : "Monthly Pro"}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 ml-0.5">
                      (+500 daily cr)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {paymentError && (
              <div
                role="alert"
                className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs sm:text-sm text-rose-300 font-medium flex items-start gap-2.5"
              >
                <div className="h-2 w-2 rounded-full bg-rose-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                <span className="leading-relaxed">{paymentError}</span>
              </div>
            )}

            {/* GIFT MODE: Recipient Information Card */}
            {isGift && (
              <div className="rounded-2xl border border-amber-400/35 bg-gradient-to-br from-amber-500/[0.08] via-purple-500/[0.05] to-black/60 p-4 space-y-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-400/40 bg-amber-500/20 text-amber-300 shrink-0">
                      <Gift size={14} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white uppercase tracking-wider block truncate">
                        Recipient Details
                      </span>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        Voucher code arrives directly to your recipient&apos;s email on payment completion
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full shrink-0">
                    Direct Email Arrival
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Recipient Email (Required) */}
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1">
                      <span>Recipient Email</span>
                      <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative flex items-center rounded-xl border border-white/10 bg-black/60 p-1 focus-within:border-amber-400/80 focus-within:ring-1 focus-within:ring-amber-400/30 transition-all">
                      <Mail size={14} className="text-zinc-500 ml-2.5 shrink-0" />
                      <input
                        type="email"
                        placeholder="recipient@example.com"
                        value={recipientEmail}
                        onChange={(e) => {
                          setRecipientEmail(e.target.value);
                          if (recipientEmailError) setRecipientEmailError("");
                        }}
                        className="w-full bg-transparent px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                      />
                    </div>
                    {recipientEmailError && (
                      <p className="text-[10px] text-rose-400 font-medium">{recipientEmailError}</p>
                    )}
                  </div>

                  {/* Recipient Name (Optional) */}
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-300">
                      Recipient Name <span className="text-zinc-500 font-normal">(Optional)</span>
                    </label>
                    <div className="relative flex items-center rounded-xl border border-white/10 bg-black/60 p-1 focus-within:border-purple-400/80 focus-within:ring-1 focus-within:ring-purple-400/30 transition-all">
                      <User size={14} className="text-zinc-500 ml-2.5 shrink-0" />
                      <input
                        type="text"
                        placeholder="e.g. Alex"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        maxLength={40}
                        className="w-full bg-transparent px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Personal Greeting / Note (Optional) */}
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-300">
                    Personal Note <span className="text-zinc-500 font-normal">(Optional)</span>
                  </label>
                  <div className="relative flex items-center rounded-xl border border-white/10 bg-black/60 p-1 focus-within:border-purple-400/80 focus-within:ring-1 focus-within:ring-purple-400/30 transition-all">
                    <MessageSquare size={14} className="text-zinc-500 ml-2.5 shrink-0" />
                    <input
                      type="text"
                      placeholder="Happy building! Enjoy your Exismic pass."
                      value={recipientMessage}
                      onChange={(e) => setRecipientMessage(e.target.value)}
                      maxLength={100}
                      className="w-full bg-transparent px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Live delivery summary footer */}
                {(recipientEmail.trim() || recipientName.trim()) && (
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-400 border-t border-white/[0.06]">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="truncate">
                      Will deliver to: <strong className="text-white">{recipientEmail.trim() || "recipient@example.com"}</strong>
                      {recipientName.trim() ? ` (for ${recipientName.trim()})` : ""}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* GIFT MODE: Gift Pass Switcher */}
            {isGift && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-bold text-zinc-300">Choose Gift Voucher</span>
                  <span className="text-amber-300 font-medium">1-time single-use passes</span>
                </div>

                {/* Category Switcher Tabs */}
                <div className="flex rounded-xl border border-white/10 bg-black/40 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isGiftPro) handleSwitchPlan("pro");
                    }}
                    className={cn(
                      "flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                      isGiftPro
                        ? "bg-purple-500/25 border border-purple-400/60 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                    )}
                  >
                    <Crown size={12} className={isGiftPro ? "text-purple-300" : "text-zinc-500"} />
                    <span>Pro Passes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (isGiftPro) handleSwitchPlan("creator");
                    }}
                    className={cn(
                      "flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                      !isGiftPro
                        ? "bg-cyan-500/25 border border-cyan-400/60 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                    )}
                  >
                    <Coins size={12} className={!isGiftPro ? "text-cyan-300" : "text-zinc-500"} />
                    <span>Credit Packs</span>
                  </button>
                </div>

                {/* Pro Passes */}
                {isGiftPro && (
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    {[
                      { id: "pro", name: "1-Month Pro", sub: "500 daily credits (15k/mo)", badge: "Flexible" },
                      { id: "pro_yearly", name: "1-Year Pro", sub: "182,500 total credits", badge: "Save 25%" },
                    ].map((t) => {
                      const active = plan.id === t.id;
                      const tierPrice = getPlanPrice(t.id as BillingPlanId, market);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleSwitchPlan(t.id as BillingPlanId)}
                          className={`min-w-0 p-2 sm:p-2.5 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                            active
                              ? "bg-gradient-to-b from-purple-600/30 to-violet-700/15 border border-purple-400/70 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                              : "bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] text-zinc-400"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-1 w-full">
                            <span className={`text-xs font-bold ${active ? "text-white" : "text-zinc-300"}`}>
                              {t.name}
                            </span>
                            <span className="whitespace-nowrap text-[8.5px] font-extrabold uppercase tracking-wide px-1 sm:px-1.5 py-0.5 rounded-md bg-purple-500/30 border border-purple-400/40 text-purple-200">
                              {t.badge}
                            </span>
                          </div>
                          <div className="mt-1">
                            <div className="text-[11px] font-mono text-purple-300 font-semibold">
                              {tierPrice.display}
                            </div>
                            <div className="text-[9.5px] text-zinc-400 leading-tight mt-0.5">
                              {t.sub}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Credit Packs */}
                {!isGiftPro && (
                  <div className="grid grid-cols-3 gap-2 pt-0.5">
                    {[
                      { id: "starter", name: "Starter", cr: "500 cr" },
                      { id: "creator", name: "Creator", cr: "2,000 cr", popular: true },
                      { id: "ultimate", name: "Studio", cr: "6,000 cr" },
                    ].map((t) => {
                      const active = plan.id === t.id;
                      const tierPrice = getPlanPrice(t.id as BillingPlanId, market);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleSwitchPlan(t.id as BillingPlanId)}
                          className={`min-w-0 p-2 sm:p-2.5 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                            active
                              ? "bg-gradient-to-b from-cyan-600/30 to-blue-700/15 border border-cyan-400/70 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                              : "bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] text-zinc-400"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-1 w-full">
                            <span className={`text-xs font-bold ${active ? "text-white" : "text-zinc-300"}`}>
                              {t.name}
                            </span>
                            {t.popular && (
                              <span className="text-[8px] font-extrabold uppercase tracking-wide px-1 py-0.5 rounded-md bg-cyan-500/30 border border-cyan-400/40 text-cyan-200">
                                Popular
                              </span>
                            )}
                          </div>
                          <div className="mt-1">
                            <div className="text-[11px] font-mono text-cyan-300 font-semibold">
                              {tierPrice.display}
                            </div>
                            <div className="text-[9.5px] text-zinc-400 leading-tight mt-0.5">
                              {t.cr}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Interactive Package Switcher Strip */}
            {!isGift && !isSubscription && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Selected Package</span>
                  <span className="text-purple-300 font-medium">Credits never expire</span>
                </div>
                <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  {[
                    { id: "starter", name: "Starter", cr: "500" },
                    { id: "creator", name: "Creator", cr: "2,000", popular: true },
                    { id: "ultimate", name: "Studio", cr: "6,000" },
                  ].map((t) => {
                    const active = plan.id === t.id;
                    const tierPrice = getPlanPrice(t.id as BillingPlanId, market);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSwitchPlan(t.id as BillingPlanId)}
                        className={`min-w-0 p-2 sm:p-2.5 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                          active
                            ? "bg-gradient-to-b from-purple-600/25 to-violet-700/10 border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.25)]"
                            : "hover:bg-white/[0.05] border border-transparent text-zinc-400"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1 w-full">
                          <span className={`text-xs font-bold ${active ? "text-white" : "text-zinc-300"}`}>
                            {t.name}
                          </span>
                          {t.popular && (
                            <span className="whitespace-nowrap text-[8.5px] font-extrabold uppercase tracking-wide px-1 sm:px-1.5 py-0.5 rounded-md bg-purple-500/30 border border-purple-400/40 text-purple-200">
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="mt-1">
                          <div className="text-[11px] font-mono text-purple-300 font-semibold">
                            {t.cr} cr
                          </div>
                          <div className="text-[10px] text-zinc-400 font-medium font-mono">
                            {tierPrice.display}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!isGift && isSubscription && (
              <div className="space-y-1.5">
                <span className="text-[11px] text-zinc-400">Billing Interval</span>
                <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  {[
                    { id: "pro", name: "Monthly", suffix: "/ mo" },
                    { id: "pro_yearly", name: "Annual", suffix: "/ yr", badge: "Save 25%" },
                  ].map((t) => {
                    const active = plan.id === t.id;
                    const tierPrice = getPlanPrice(t.id as BillingPlanId, market);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSwitchPlan(t.id as BillingPlanId)}
                        className={`min-w-0 p-2 sm:p-2.5 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                          active
                            ? "bg-gradient-to-b from-purple-600/25 to-violet-700/10 border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.25)]"
                            : "hover:bg-white/[0.05] border border-transparent text-zinc-400"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1 w-full">
                          <span className={`text-xs font-bold ${active ? "text-white" : "text-zinc-300"}`}>
                            {t.name}
                          </span>
                          {t.badge && (
                            <span className="whitespace-nowrap text-[8.5px] font-extrabold uppercase tracking-wide px-1 sm:px-1.5 py-0.5 rounded-md bg-purple-500/30 border border-purple-400/40 text-purple-200">
                              {t.badge}
                            </span>
                          )}
                        </div>
                        <div className="mt-1">
                          <div className="text-[11px] font-mono text-purple-300 font-semibold">
                            {tierPrice.display} {t.suffix}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PAYMENT METHODS SECTION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Payment Method
                </span>
                {market === "IN" && (
                  <span className="text-[11px] font-semibold text-purple-400 flex items-center gap-1">
                    <span>Razorpay India</span>
                  </span>
                )}
              </div>

              {/* SEPARATE PAYMENT METHODS FOR INDIAN USERS (RAZORPAY: UPI, NET BANKING, CARDS) */}
              {market === "IN" ? (
                <div className="space-y-3">
                  {/* Hero Option: UPI & Net Banking via Razorpay */}
                  <button
                    type="button"
                    onClick={() => handleStartRazorpayCheckout("upi")}
                    disabled={loadingMethod !== null}
                    className="group relative flex min-h-16 w-full items-center rounded-2xl border border-white/[0.12] bg-gradient-to-r from-[#120d22]/90 via-[#0e0c1c]/80 to-[#0a0815]/90 hover:from-[#1b1233] hover:to-[#120d22] hover:border-purple-400/50 px-4 py-3 sm:px-5 text-left transition-all hover:shadow-[0_0_25px_rgba(168,85,247,0.22)] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex flex-1 items-center gap-3 sm:gap-3.5 min-w-0">
                      <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-purple-400/40 bg-purple-500/15 text-purple-300 group-hover:border-purple-400/70 group-hover:bg-purple-500/25 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                        <Smartphone size={20} />
                      </div>
                      <div className="flex flex-1 flex-col min-w-0 gap-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] sm:text-base font-bold text-white tracking-tight">
                            UPI & Net Banking
                          </span>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {loadingMethod === "razorpay_upi" ? (
                              <Loader2 size={16} className="animate-spin text-purple-400" />
                            ) : (
                              <>
                                <UpiIcon />
                                <Building2 size={15} className="hidden sm:block text-zinc-400 ml-1" />
                              </>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-zinc-400 leading-relaxed">
                          Google Pay, PhonePe, Paytm, HDFC, ICICI, SBI
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Secondary Indian Option: Debit or Credit Card (RuPay, Visa, Mastercard) */}
                  <button
                    type="button"
                    onClick={() => handleStartRazorpayCheckout("card")}
                    disabled={loadingMethod !== null}
                    className="group relative flex min-h-14 w-full flex-col items-stretch justify-between gap-1 rounded-2xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06] hover:border-purple-400/40 px-4 py-2 sm:py-3 sm:flex-row sm:items-center sm:gap-2 sm:px-5 text-left transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex flex-1 items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-zinc-300">
                        <CreditCard size={16} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-white">
                          Debit or Credit Card
                        </span>
                        <span className="text-[11px] text-zinc-400 leading-relaxed">
                          RuPay, Visa, Mastercard, Maestro
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 shrink-0 sm:pl-2">
                      {loadingMethod === "razorpay_card" ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                          <Loader2 size={16} className="animate-spin text-purple-400" />
                          <span className="hidden sm:inline">Connecting…</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <RupayIcon />
                          <CardBrandBadgesRow activeBrand="unknown" />
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              ) : (
                /* GLOBAL PAYMENT METHODS FOR USD USERS (CARD, PAYPAL, APPLE PAY, GOOGLE PAY) */
                <div className="space-y-3">
                  {/* Hero Option: Debit or Credit Card */}
                  <button
                    type="button"
                    onClick={() => handleStartGlobalCheckout("card")}
                    disabled={loadingMethod !== null}
                    className="group relative flex min-h-16 w-full flex-col items-stretch justify-between gap-1 rounded-2xl border border-purple-500/35 bg-gradient-to-r from-purple-950/40 via-[#0e0c1c]/90 to-[#120d24]/90 hover:from-purple-900/40 hover:to-[#1a1233] hover:border-purple-400/60 px-4 py-2 sm:py-3 sm:flex-row sm:items-center sm:gap-2 sm:px-5 text-left transition-all hover:shadow-[0_0_25px_rgba(168,85,247,0.22)] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex flex-1 items-center gap-3.5 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-400/40 bg-purple-500/20 text-purple-300 group-hover:border-purple-400/70 group-hover:bg-purple-500/30 transition-all shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                        <CreditCard size={20} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                          Debit or Credit Card
                        </span>
                        <span className="text-xs text-zinc-400 leading-relaxed">
                          Visa, Mastercard, Amex, Discover
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 shrink-0 sm:pl-2">
                      {loadingMethod === "card" ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                          <Loader2 size={16} className="animate-spin text-purple-400" />
                          <span className="hidden sm:inline">Connecting…</span>
                        </div>
                      ) : (
                        <>
                          <CardBrandBadgesRow activeBrand="unknown" />
                          <div className="hidden sm:flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-400 group-hover:text-white group-hover:border-purple-400/40 group-hover:bg-purple-500/20 transition-all">
                            <ArrowRight size={14} />
                          </div>
                        </>
                      )}
                    </div>
                  </button>

                  {/* Laser Bridge Divider */}
                  <div className="relative flex items-center justify-center py-0.5">
                    <div className="flex-grow h-px bg-gradient-to-r from-transparent via-white/[0.12] to-white/[0.04]" />
                    <span className="flex-shrink mx-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Or express checkout
                    </span>
                    <div className="flex-grow h-px bg-gradient-to-l from-transparent via-white/[0.12] to-white/[0.04]" />
                  </div>

                  {/* Express PayPal Button */}
                  <button
                    type="button"
                    onClick={() => handleStartGlobalCheckout("paypal")}
                    disabled={loadingMethod !== null}
                    className="group relative flex h-13 w-full items-center justify-center rounded-2xl bg-gradient-to-b from-[#ffc439] to-[#f4b000] hover:from-[#ffd059] hover:to-[#f8bb1a] px-5 shadow-[0_4px_20px_rgba(255,196,57,0.25)] transition-all hover:scale-[1.005] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                    title="Pay with PayPal"
                  >
                    {loadingMethod === "paypal" ? (
                      <div className="flex items-center gap-2 text-sm font-bold text-[#003087]">
                        <Loader2 size={18} className="animate-spin text-[#003087]" />
                        <span>Connecting to PayPal…</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 select-none">
                        <span className="italic font-black text-2xl tracking-tight text-[#003087]">Pay</span>
                        <span className="italic font-black text-2xl tracking-tight text-[#0079c1]">Pal</span>
                      </div>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Provider Security & Terms Notice (Restored to Left Pane) */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 space-y-1 text-xs">
              <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                <ShieldCheck size={14} className="text-purple-400 shrink-0" />
                <span>
                  {market === "IN"
                    ? "Payment processed securely through Razorpay"
                    : "Payment processed securely through PayPal"}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                {market === "IN"
                  ? "Your payment is handled securely through Razorpay. Exismic never sees or stores your card or bank details."
                  : "Your payment is handled securely through PayPal. Exismic never sees or stores your card details."}
              </p>
              <p className="text-[11px] leading-relaxed text-zinc-500">
                {market === "IN" ? (
                  <>
                    Review Razorpay&apos;s{" "}
                    <a
                      href="https://razorpay.com/terms/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 underline underline-offset-2 hover:text-white"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="https://razorpay.com/privacy/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 underline underline-offset-2 hover:text-white"
                    >
                      Privacy Policy
                    </a>
                    .
                  </>
                ) : (
                  <>
                    You can review PayPal&apos;s{" "}
                    <a
                      href="https://www.paypal.com/us/legalhub/useragreement-full"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 underline underline-offset-2 hover:text-white"
                    >
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="https://www.paypal.com/us/legalhub/privacy-full"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 underline underline-offset-2 hover:text-white"
                    >
                      Privacy Statement
                    </a>{" "}
                    before completing your order.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* RIGHT PANE: Order Summary (lg:col-span-5) */}
          <div className="lg:col-span-5 p-6 sm:p-7 bg-gradient-to-b from-[#110d22]/90 via-[#0d091a]/95 to-[#080512]/95 flex flex-col space-y-5 relative overflow-hidden">
            {/* Ambient subtle corner glow (Deep Purple) */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/[0.12] rounded-full blur-[90px] pointer-events-none" />

            {/* UPPER HALF: Overview, Gift Preview Card, Features */}
            <div className="space-y-4 relative z-10">
              {/* Product Title & Badge */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/35 bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                    {isGift ? (
                      <>
                        <Gift size={13} className="text-amber-400" />
                        <span>Single-Use Gift Pass</span>
                      </>
                    ) : (
                      <>
                        <Zap size={13} className="text-purple-400" />
                        <span>
                          {isSubscription
                            ? yearly
                              ? "Annual Membership"
                              : "Monthly Membership"
                            : `${creditsAmount.toLocaleString()} Credits Included`}
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {isGift ? `${plan.name} Gift Pass` : plan.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {isGift
                      ? "1-time gift voucher • Redeemable within 12 months"
                      : isSubscription
                      ? yearly
                        ? "Billed annually • Cancel anytime in settings"
                        : "Billed monthly • Cancel anytime in settings"
                      : "Permanent credit pack • No auto-renew"}
                  </p>
                </div>

                {hasSavings && (
                  <span className="rounded-full border border-purple-400/40 bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-200 shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                    Save {market === "IN" ? `₹${savingsAmount.toFixed(0)}` : `$${savingsAmount.toFixed(2)}`}
                  </span>
                )}
              </div>

              {/* Digital Gift Pass Live Preview Card (Only shown if isGift) */}
              {isGift && (
                <div className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-black/60 p-4 backdrop-blur-md shadow-[0_0_25px_rgba(245,158,11,0.1)]">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Gift size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">Digital Gift Voucher</p>
                        <p className="text-[10px] text-zinc-400">Official Exismic Pro Pass</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-medium rounded-full bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-amber-300">
                      12-MO VALIDITY
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-3 text-zinc-300">
                      <span className="text-zinc-500 text-[11px]">Recipient</span>
                      <span className="min-w-0 break-words text-right font-semibold text-white max-w-[180px]">
                        {recipientName.trim() || (recipientEmail.trim() ? recipientEmail.trim() : "Unassigned Recipient")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-zinc-300">
                      <span className="text-zinc-500 text-[11px]">Delivery To</span>
                      <span className="min-w-0 break-all text-right font-mono text-zinc-300 text-[11px] max-w-[180px]">
                        {recipientEmail.trim() ? recipientEmail.trim() : "Will be sent after checkout"}
                      </span>
                    </div>

                    {recipientMessage.trim() && (
                      <div className="pt-1.5 border-t border-white/[0.06] text-[11px] text-zinc-300 italic">
                        &ldquo;{recipientMessage.trim()}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* What's Included */}
              <div className="space-y-2.5 pt-3 border-t border-white/[0.08]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-purple-300/80">
                  What&apos;s included
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-200">
                  {featuresList.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-purple-400/40 bg-purple-500/20 text-purple-300 mt-0.5 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                        <Check size={12} strokeWidth={2.5} />
                      </div>
                      <span className="leading-snug font-medium text-zinc-100">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* LOWER HALF: Itemized breakdown, due today, fine print */}
            <div className="space-y-3 relative z-10 pt-4 border-t border-white/[0.08]">
              {/* Itemized Price Breakdown */}
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>
                    {isSubscription ? (yearly ? "Annual price" : "Monthly price") : "Package price"}
                  </span>
                  <span className={hasSavings ? "text-zinc-500 line-through font-mono" : "text-zinc-200 font-mono"}>
                    {hasSavings ? regularDisplay : totalDisplay}
                  </span>
                </div>

                {hasSavings && (
                  <div className="flex items-center justify-between text-purple-300 font-medium">
                    <span>Promotion discount</span>
                    <span className="font-mono">
                      -{market === "IN" ? `₹${savingsAmount.toFixed(0)}` : `$${savingsAmount.toFixed(2)}`}
                    </span>
                  </div>
                )}

                {coupon && (
                  <div className="flex items-center justify-between text-purple-300 font-medium">
                    <span className="flex items-center gap-1.5">
                      Coupon ({coupon.code})
                      <button
                        type="button"
                        onClick={() => setCoupon(null)}
                        className="text-[11px] text-zinc-400 hover:text-white underline font-normal cursor-pointer"
                      >
                        Remove
                      </button>
                    </span>
                    <span className="font-mono">{coupon.discountLabel}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-zinc-400">
                  <span>Estimated tax</span>
                  <span className="text-zinc-200 font-mono">
                    {market === "IN" ? "₹0" : "$0.00"}
                  </span>
                </div>

                {/* Promo Code Input Toggle */}
                {!automaticDiscount && (
                  <div className="pt-0.5">
                    {!showPromoField && !coupon ? (
                      <button
                        type="button"
                        onClick={() => setShowPromoField(true)}
                        className="inline-flex min-h-11 items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors cursor-pointer group"
                      >
                        <Tag size={12} className="text-purple-400/80 group-hover:text-purple-300 transition-colors" />
                        <span>Have a promo code?</span>
                      </button>
                    ) : (
                      <form onSubmit={applyPromoCode} className="space-y-1.5">
                        <div className="relative flex items-center rounded-xl border border-purple-500/35 bg-[#0b0817] px-2 sm:px-3 py-1.5 focus-within:border-purple-400 focus-within:ring-1 focus-within:ring-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.12)] transition-all">
                          <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
                            <Tag size={13} className="text-purple-400 shrink-0" />
                            <input
                              aria-label="Promo code"
                              placeholder="Promo code"
                              value={promoInput}
                              onChange={(e) => setPromoInput(e.target.value)}
                              disabled={couponLoading || loadingMethod !== null}
                              className="min-w-0 flex-1 bg-transparent text-xs text-white placeholder-zinc-500 uppercase tracking-normal font-mono focus:outline-none"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={couponLoading || !promoInput.trim() || loadingMethod !== null}
                            className="min-h-11 shrink-0 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 px-2 sm:px-3 py-1 text-[11px] font-bold text-white transition active:scale-95 disabled:opacity-40 cursor-pointer shadow-sm"
                          >
                            {couponLoading ? "Checking…" : "Apply"}
                          </button>
                          {!coupon && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowPromoField(false);
                                setPromoInput("");
                                setCouponError("");
                              }}
                              aria-label="Close promo code"
                              className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 text-xs px-1 cursor-pointer"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        {couponError && (
                          <p className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-300">
                            {couponError}
                          </p>
                        )}
                      </form>
                    )}
                  </div>
                )}

                {/* Due today */}
                <div className="border-t border-white/[0.12] pt-2 mt-2 flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-bold text-white">Due today</span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {isSubscription ? (yearly ? "Charged annually" : "Charged monthly") : "Single one-time payment"}
                    </p>
                  </div>
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-[0_0_25px_rgba(168,85,247,0.25)]">
                    {totalDisplay}
                  </span>
                </div>
              </div>

              {/* Fine Print / Policy Links */}
              <p className="pt-2 border-t border-white/[0.06] text-[11px] leading-relaxed text-zinc-500">
                {isGift
                  ? `One-time gift purchase of ${plan.name}. Generates a single-use gift code redeemable within 12 months. `
                  : isSubscription
                  ? `${totalDisplay} billed ${yearly ? "annually" : "monthly"} until cancelled. Cancel anytime in Settings. `
                  : `One-time purchase of ${creditsAmount.toLocaleString()} credits. Never expires. `}
                By continuing, you agree to Exismic&apos;s{" "}
                <Link
                  href="/terms-of-service"
                  target="_blank"
                  className="text-zinc-400 underline underline-offset-2 hover:text-white"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy-policy"
                  target="_blank"
                  className="text-zinc-400 underline underline-offset-2 hover:text-white"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BUYER FAQ SECTION (Single-column unified executive glass suite - Zero blank voids) */}
      <div className="relative z-10 w-full max-w-5xl mt-6 space-y-3">
        <div className="flex items-center gap-2 px-1">
          <HelpCircle size={15} className="text-purple-400 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Frequently Asked Questions
          </span>
        </div>

        <div className="rounded-3xl border border-white/[0.1] bg-[#070b16]/90 backdrop-blur-2xl divide-y divide-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className={`transition-colors duration-200 ${
                  isOpen ? "bg-purple-500/[0.04]" : "hover:bg-white/[0.02]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-2 w-2 shrink-0 rounded-full transition-colors ${
                        isOpen ? "bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" : "bg-zinc-600 group-hover:bg-purple-400/60"
                      }`}
                    />
                    <span
                      className={`text-xs sm:text-sm font-semibold transition-colors ${
                        isOpen ? "text-white font-bold" : "text-zinc-300 group-hover:text-white"
                      }`}
                    >
                      {faq.q}
                    </span>
                  </div>
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition-all duration-200 ${
                      isOpen
                        ? "rotate-180 text-purple-300 border-purple-400/50 bg-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                        : "group-hover:text-white group-hover:border-white/[0.15]"
                    }`}
                  >
                    <ChevronDown size={14} />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs leading-relaxed text-zinc-300/90 pl-9 sm:pl-10">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
