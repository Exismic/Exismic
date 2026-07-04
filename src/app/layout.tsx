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

import { JsonLd, defaultSchemaData } from "@/components/seo/JsonLd";

import { constructMetadata } from "@/lib/seo";
import Script from "next/script";

export const metadata: Metadata = constructMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

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
        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "q6s4m5v6k8");
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased text-white bg-[#030303]`} suppressHydrationWarning>
        <JsonLd type="Organization" data={defaultSchemaData.organization} />
        <JsonLd type="WebSite" data={defaultSchemaData.website} />
        <Suspense fallback={null}>
          <AppLoader>
            <SessionProvider>
              <ProfileThemeProvider>
                <I18nProvider>
                  <AppShell hasSession={Boolean(session)}>{children}</AppShell>
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
