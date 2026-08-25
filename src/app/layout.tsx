// Build Trigger: 2026-07-29T10:48:00Z
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });

import { SessionProvider } from "@/components/providers/SessionProvider";
import { AppLoader } from "@/components/providers/AppLoader";
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { ProfileThemeProvider } from "@/components/providers/ProfileThemeProvider";
import { AppShell } from "@/components/layout/AppShell";
import { ConsentAwareAnalytics } from "@/components/providers/ConsentAwareAnalytics";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ReferralTracker } from "@/components/layout/ReferralTracker";

import { JsonLd, defaultSchemaData } from "@/components/seo/JsonLd";
import { constructMetadata } from "@/lib/seo";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";
import { MaintenanceScreen } from "@/components/layout/MaintenanceScreen";

export const dynamic = "force-dynamic";
export const metadata: Metadata = constructMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Resolve request route path from middleware header
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAuthRoute = pathname.startsWith("/auth") || pathname.startsWith("/api") || pathname.startsWith("/maintenance");

  const supabase = await createClient();

  // 2. PARALLELIZE Auth session and database config queries concurrently via Promise.all
  const [sessionResult, maintenanceCfg, activeAnnouncements] = await Promise.all([
    supabase.auth.getUser().catch(() => ({ data: { user: null } })),
    prisma.systemConfig.findUnique({ where: { key: "maintenance_mode" } }).catch(() => null),
    prisma.announcement.findMany({ where: { active: true }, orderBy: { createdAt: "desc" } }).catch(() => []),
  ]);

  const user = sessionResult?.data?.user || null;
  const isMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true" || process.env.MAINTENANCE_MODE === "true" || maintenanceCfg?.value === "true";
  let isAdmin = false;
  let isSuspended = false;

  // 3. Fast indexed user role check if user is logged in
  if (user?.id) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true, status: true, email: true },
      });
      isAdmin = dbUser?.role === "admin" || (dbUser?.email ? isAdminEmail(dbUser.email) : false);
      isSuspended = dbUser?.status === "suspended";
    } catch (dbError) {
      console.error("[USER_ROLE_CHECK_ERROR]", dbError);
    }
  }

  // 4. Kick out suspended users
  if (isSuspended) {
    await supabase.auth.signOut();
    redirect("/auth/login?error=suspended");
  }

  // 5. Render upgrade screen if mode is active and user lacks admin privilege
  if (isMaintenance && !isAdmin && !isAuthRoute) {
    return (
      <html lang="en" className="dark" suppressHydrationWarning>
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#030408" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        </head>
        <body className={`${inter.variable} ${outfit.variable} font-sans antialiased text-white bg-[#030408]`} suppressHydrationWarning>
          <MaintenanceScreen />
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
        <link rel="preconnect" href="https://translate.googleapis.com" />
        <link rel="preconnect" href="https://translate.google.com" />
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
                  <AppShell hasSession={Boolean(user)}>{children}</AppShell>
                  <ReferralTracker />
                  <ConsentAwareAnalytics />
                  <Analytics />
                  <SpeedInsights />
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
