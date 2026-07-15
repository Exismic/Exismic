// Build Trigger: 2026-04-30T21:27
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

import { SessionProvider } from "@/components/providers/SessionProvider";
import { AppLoader } from "@/components/providers/AppLoader";
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { ProfileThemeProvider } from "@/components/providers/ProfileThemeProvider";
import { AppShell } from "@/components/layout/AppShell";
import { ConsentAwareAnalytics } from "@/components/providers/ConsentAwareAnalytics";
import { ReferralTracker } from "@/components/layout/ReferralTracker";

import { JsonLd, defaultSchemaData } from "@/components/seo/JsonLd";
import { constructMetadata } from "@/lib/seo";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Wrench } from "lucide-react";
import { redirect } from "next/navigation";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";

export const metadata: Metadata = constructMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // 1. Resolve request route path from middleware header
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // 2. Do not run maintenance/suspension checks on auth or API requests
  const isAuthRoute = pathname.startsWith("/auth") || pathname.startsWith("/api");

  let isMaintenance = false;
  let isAdmin = false;
  let isSuspended = false;
  let activeAnnouncements: any[] = [];

  if (!isAuthRoute) {
    try {
      const maintenanceCfg = await prisma.systemConfig.findUnique({
        where: { key: "maintenance_mode" },
      });
      isMaintenance = maintenanceCfg?.value === "true";

      if (session?.user?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { role: true, status: true },
        });
        isAdmin = dbUser?.role === "admin";
        isSuspended = dbUser?.status === "suspended";
      }

      // Fetch active site announcements
      activeAnnouncements = await prisma.announcement.findMany({
        where: { active: true },
        orderBy: { createdAt: "desc" },
      });
    } catch (dbError) {
      console.error("[MAINTENANCE_CHECK_ERROR]", dbError);
    }
  }

  // 3. Kick out suspended users
  if (isSuspended) {
    await supabase.auth.signOut();
    redirect("/auth/login?error=suspended");
  }

  // 3. Render upgrade screen if mode is active and user lacks privilege
  if (isMaintenance && !isAdmin && !isAuthRoute) {
    return (
      <html lang="en" className="dark" suppressHydrationWarning>
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#030303" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        </head>
        <body className={`${inter.variable} ${outfit.variable} font-sans antialiased text-white bg-[#030303] flex items-center justify-center min-h-screen relative px-6 overflow-hidden`} suppressHydrationWarning>
          <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-accent-purple/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-accent-cyan/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

          <div className="relative max-w-lg w-full bg-[#0b0c12]/80 border border-white/5 p-8 sm:p-12 rounded-[3.5rem] text-center backdrop-blur-2xl shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center mx-auto text-accent-purple relative overflow-hidden">
              <div className="absolute inset-0 bg-accent-purple/25 blur-md" />
              <Wrench size={26} className="relative z-10 animate-pulse" />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">System Upgrade</h1>
              <p className="text-transparent bg-clip-text bg-linear-to-r from-accent-purple to-accent-cyan text-xs font-black uppercase tracking-widest">
                Exismic Creative Studio
              </p>
            </div>

            <p className="text-zinc-400 text-sm leading-relaxed font-semibold">
              We are currently performing scheduled maintenance to deploy advanced creative features. We will be back online shortly. Thank you for your patience!
            </p>

            <div className="pt-5 border-t border-white/5 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">
                Status: Temporary Hold
              </span>
              <a 
                href="/auth/login" 
                className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
              >
                Admin Access &rarr;
              </a>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#07070a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://mgirjaamphcgnispdofo.supabase.co" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased text-white bg-[#030303]`} suppressHydrationWarning>
        <JsonLd type="Organization" data={defaultSchemaData.organization} />
        <JsonLd type="WebSite" data={defaultSchemaData.website} />
        <Suspense fallback={null}>
          <AppLoader>
            <SessionProvider>
              <ProfileThemeProvider>
                <I18nProvider>
                  <AnnouncementBanner announcements={activeAnnouncements} />
                  <AppShell hasSession={Boolean(session)}>{children}</AppShell>
                  <ReferralTracker />
                  <ConsentAwareAnalytics />
                  <CookieConsent />
                </I18nProvider>
              </ProfileThemeProvider>
            </SessionProvider>
          </AppLoader>
        </Suspense>
      </body>
    </html>
  );
}
