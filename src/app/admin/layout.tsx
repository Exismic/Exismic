import Link from "next/link";
import type React from "react";
import type { Metadata } from "next";
import { BarChart3, Mail, Shield, SlidersHorizontal, WalletCards } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/auth/login?returnUrl=/admin");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  const hasAdminRole = dbUser?.role === "admin";
  const hasAdminEmail = isAdminEmail(user.email);
  const isAuthorized = hasAdminRole || hasAdminEmail;

  if (!isAuthorized) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white">
      <div className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-300/10 text-purple-200">
              <Shield size={19} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em]">Exismic Admin</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">{user.email}</p>
            </div>
          </Link>

          <nav className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {[
              { href: "/admin", label: "Dashboard", icon: BarChart3 },
              { href: "/admin/system", label: "System Config", icon: SlidersHorizontal },
              { href: "/admin/system#email", label: "Email Logs", icon: Mail },
              { href: "/admin/system#payments", label: "Payments", icon: WalletCards },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
