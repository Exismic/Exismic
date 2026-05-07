// Build Trigger: 2026-04-30T21:27
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Search, Bell, Sparkles } from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

import { SessionProvider } from "@/components/providers/SessionProvider";
import { UserMenu } from "@/components/layout/UserMenu";
import { SearchBar } from "@/components/layout/SearchBar";
import { NotificationsDropdown } from "@/components/layout/NotificationsDropdown";
import { AppLoader } from "@/components/providers/AppLoader";
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { Footer } from "@/components/layout/Footer";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { LanguageSelector } from "@/components/LanguageSelector";
import { CreditBadge } from "@/components/ui/CreditBadge";

export const metadata: Metadata = {
  title: "Lumora | All your tools in one simple place",
  description: "The easiest way to use AI tools for photos, videos, audio, and documents.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased text-white bg-[#030303]`} suppressHydrationWarning>
        <Suspense fallback={null}>
          <AppLoader>
            <SessionProvider>
              <I18nProvider>
                <div className="flex min-h-screen" suppressHydrationWarning>
                  {session && <Sidebar />}
                  <main suppressHydrationWarning className="flex-1 flex flex-col min-w-0 bg-[#030303]">
                    {session && (
                      <header suppressHydrationWarning className="h-20 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#030303]/60 backdrop-blur-2xl z-40">
                        <SearchBar />
                        <div className="flex items-center gap-6 ml-8">
                          <LanguageSelector />
                          <NotificationsDropdown />
                          <div className="h-8 w-px bg-white/5"></div>
                          <div className="flex items-center gap-6">
                            <CreditBadge />
                            <UserMenu />
                          </div>
                        </div>
                      </header>
                    )}
                    <div suppressHydrationWarning className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
                      <div className="flex-1">{children}</div>
                      <Footer />
                      <div suppressHydrationWarning className="fixed inset-0 grain pointer-events-none z-50 opacity-[0.02]" />
                    </div>
                  </main>
                </div>
              </I18nProvider>
            </SessionProvider>
          </AppLoader>
        </Suspense>
      </body>
    </html>
  );
}
