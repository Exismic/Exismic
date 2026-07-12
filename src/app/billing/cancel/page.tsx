import Link from "next/link";
import { XCircle } from "lucide-react";

export default function BillingCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030306] px-4 text-white">
      <div className="max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center">
        <XCircle className="mx-auto text-zinc-500" size={54} />
        <h1 className="mt-6 text-3xl font-black">Checkout cancelled</h1>
        <p className="mt-3 text-sm font-medium leading-6 text-zinc-500">No payment was captured and your account was not changed.</p>
        <Link href="/pricing" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-6 text-[10px] font-black uppercase tracking-[0.18em] text-black">Back to pricing</Link>
      </div>
    </main>
  );
}
