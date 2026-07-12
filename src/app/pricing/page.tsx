import { PricingCards } from "@/components/billing/PricingCards";

export default function PricingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#030306] px-4 py-24 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.22),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.12),transparent_32%)]" />
      <section className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200">Billing</p>
          <h1 className="mt-5 text-5xl font-black tracking-tight sm:text-7xl">Choose your Exismic plan.</h1>
          <p className="mt-5 text-base font-medium leading-8 text-zinc-500 sm:text-lg">
            Pricing adapts automatically by country. India uses INR with Razorpay. International checkout uses USD with PayPal.
          </p>
        </div>
        <PricingCards />
      </section>
    </main>
  );
}
