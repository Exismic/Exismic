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
import { headers, cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";
import { MaintenanceScreen } from "@/components/layout/MaintenanceScreen";

import { getCachedMaintenanceConfig, getCachedActiveAnnouncements, getCachedUserRoleStatus } from "@/lib/server/cached-config";

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

  // Fast cookie check before making any Supabase auth network calls
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.startsWith("sb-") || c.name.includes("auth") || c.name.includes("token") || c.name.includes("session")
  );

  // 2. PARALLELIZE Auth session (only if auth cookie exists) and cached database config queries
  const [sessionResult, maintenanceCfg, activeAnnouncements] = await Promise.all([
    hasAuthCookie
      ? (async () => {
          try {
            const supabase = await createClient();
            return await supabase.auth.getUser();
          } catch {
            return { data: { user: null } };
          }
        })()
      : Promise.resolve({ data: { user: null } }),
    getCachedMaintenanceConfig(),
    getCachedActiveAnnouncements(),
  ]);

  const user = sessionResult?.data?.user || null;
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
        </Suspense>
      </body>
    </html>
  );
}
