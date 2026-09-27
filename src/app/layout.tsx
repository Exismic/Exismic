// Build Trigger: 2026-07-29T10:48:00Z
import type { Metadata } from "next";
import "./globals.css";

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
import { headers, cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";
import { MaintenanceScreen } from "@/components/layout/MaintenanceScreen";

import { getCachedMaintenanceConfig, getCachedActiveAnnouncements, getCachedUserRoleStatus } from "@/lib/server/cached-config";
import { getCachedAuthUser } from "@/lib/server/cached-auth";

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

  // 2. PARALLELIZE Request-cached Auth session and cached database config queries
  const [user, maintenanceCfg, activeAnnouncements] = await Promise.all([
    getCachedAuthUser(),
    getCachedMaintenanceConfig(),
    getCachedActiveAnnouncements(),
  ]);
  const isMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true" || process.env.MAINTENANCE_MODE === "true" || maintenanceCfg?.value === "true";
  let isAdmin = false;
  let isSuspended = false;

  // 3. Fast indexed user role check if user is logged in
  if (user) {
    // Direct check on Supabase auth user (works immediately without waiting on DB sync)
    if (
      (user.email && isAdminEmail(user.email)) ||
      user.app_metadata?.role === "admin" ||
      user.user_metadata?.role === "admin"
    ) {
      isAdmin = true;
    }

    if (user.id) {
      try {
        const dbUser = await getCachedUserRoleStatus(user.id);
        if (dbUser?.role === "admin" || (dbUser?.email && isAdminEmail(dbUser.email))) {
          isAdmin = true;
        }
        isSuspended = dbUser?.status === "suspended";
      } catch (dbError) {
        console.error("[USER_ROLE_CHECK_ERROR]", dbError);
      }
    }
  }

  // 4. Kick out suspended users
  if (isSuspended) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore signOut errors during redirect
    }
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
        <body className="font-sans antialiased text-white bg-[#030408]" suppressHydrationWarning>
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://mgirjaamphcgnispdofo.supabase.co" />
        <link rel="preconnect" href="https://translate.googleapis.com" />
        <link rel="preconnect" href="https://translate.google.com" />
      </head>
      <body className="font-sans antialiased text-white bg-[#030303]" suppressHydrationWarning>
        <JsonLd type="Organization" data={defaultSchemaData.organization} />
        <JsonLd type="WebSite" data={defaultSchemaData.website} />
        <AppLoader>
          <SessionProvider>
            <ProfileThemeProvider>
              <I18nProvider>
                <AnnouncementBanner announcements={activeAnnouncements} />
                <AppShell hasSession={Boolean(user)}>{children}</AppShell>
                {isMaintenance && isAdmin && (
                  <aside aria-label="Maintenance Mode Admin Bypass" className="fixed bottom-4 right-4 z-[9999] px-3.5 py-1.5 rounded-full bg-[#070814]/90 border border-purple-500/30 text-purple-300 text-[11px] font-medium shadow-2xl backdrop-blur-xl flex items-center gap-2 pointer-events-none ring-1 ring-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                    <span>Maintenance active • Admin bypass enabled</span>
                  </aside>
                )}
                <ReferralTracker />
                <ConsentAwareAnalytics />
                <Analytics />
                <SpeedInsights />
                <CookieConsent />
              </I18nProvider>
            </ProfileThemeProvider>
          </SessionProvider>
        </AppLoader>
      </body>
    </html>
  );
}
