import { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { Dashboard } from "@/components/tool/Dashboard";
import { LandingPage } from "@/components/layout/LandingPage";
import { createClient } from "@/utils/supabase/server";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import { HomeToolConcierge } from "@/components/tool/HomeToolConcierge";
import { cookies } from "next/headers";

export const metadata: Metadata = constructMetadata({
  title: "Exismic - All-in-One AI Tools | Free Background Remover, Image Generator & More",
  canonicalUrl: `${SITE_URL}/`,
  description: "Experience the elite AI-powered studio. Remove backgrounds, generate images, edit videos, restore photos, and create music — everything you need in one simple place.",
});

const faqSchema = {
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Exismic free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Exismic offers a generous free tier for all our tools, including our flagship background remover and AI image generator."
      }
    },
    {
      "@type": "Question",
      name: "What AI tools does Exismic offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Exismic provides over 50+ AI tools including AI Image Generation, Background Removal, Vocal Separation, PDF Processing, and AI Writing."
      }
    },
    {
      "@type": "Question",
      name: "Do I need a credit card to sign up?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No credit card is required to start using Exismic's free tools."
      }
    }
  ]
};

export default async function Home() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.includes("auth-token") || c.name.startsWith("sb-")
  );

  let user = null;
  if (hasAuthCookie) {
    try {
      const supabase = await createClient();
      const result = await supabase.auth.getUser();
      user = result?.data?.user || null;
    } catch {
      user = null;
    }
  }

  if (!user) {
    return (
      <>
        <LandingPage />
        <HomeToolConcierge />
      </>
    );
  }

  return (
    <>
      <JsonLd type="FAQPage" data={faqSchema} />
      {/* Main Interactive Dashboard */}
      <Dashboard initialUser={user} />

      {/* Ambient Depth Background */}
      <div className="fixed inset-0 -z-50 pointer-events-none bg-[#030303]" />
      <HomeToolConcierge />
    </>
  );
}
