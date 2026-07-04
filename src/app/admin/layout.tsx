import Link from "next/link";
import type React from "react";
import { AlertTriangle, BarChart3, LockKeyhole, Mail, Shield, SlidersHorizontal, WalletCards } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { isAdminConfigured, isAdminEmail } from "@/lib/admin";

export const dynamic = "force-dynamic";

function AdminGateCard({
  icon,
  title,
  message,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#020202] px-6 py-24 text-white">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_0%,rgba(124,58,237,0.16),transparent_32%),radial-gradient(circle_at_90%_10%,rgba(6,182,212,0.10),transparent_30%)]" />
      <div className="relative z-10 mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 text-center shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-purple-200">
          {icon}
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight">{title}</h1>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">{message}</p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </main>
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!isAdminConfigured()) {
    return (
      <AdminGateCard
        icon={<AlertTriangle size={30} />}
        title="Admin Not Configured"
        message="Set ADMIN_EMAILS in your environment with the exact email addresses allowed to access Lumora admin pages."
      />
    );
  }

  if (!user?.email) {
    return (
      <AdminGateCard
        icon={<LockKeyhole size={30} />}
        title="Admin Sign In Required"
        message="This dashboard is private. Sign in with an email listed in ADMIN_EMAILS to continue."
        action={
          <Link href="/auth/login?returnUrl=/admin/system" className="inline-flex rounded-2xl bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-black transition hover:bg-zinc-200">
            Sign In
          </Link>
        }
      />
    );
  }

  if (!isAdminEmail(user.email)) {
    return (
      <AdminGateCard
        icon={<Shield size={30} />}
        title="Admin Access Denied"
        message="Your account is signed in, but this email is not listed in ADMIN_EMAILS."
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white">
      <div className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/admin/system" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-300/10 text-purple-200">
              <Shield size={19} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em]">Lumora Admin</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">{user.email}</p>
            </div>
          </Link>

          <nav className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {[
              { href: "/admin/system", label: "System", icon: BarChart3 },
              { href: "/admin/system#tools", label: "Tools", icon: SlidersHorizontal },
              { href: "/admin/system#email", label: "Email", icon: Mail },
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
