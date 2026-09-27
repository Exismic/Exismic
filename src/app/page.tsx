import { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { Dashboard } from "@/components/tool/Dashboard";
import { LandingPage } from "@/components/layout/LandingPage";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import { HomeToolConcierge } from "@/components/tool/HomeToolConcierge";
import { getCachedAuthUser } from "@/lib/server/cached-auth";

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

export default async function Home(props: {
  searchParams?: Promise<{ preview?: string; view?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const user = await getCachedAuthUser();

  const showLanding = !user || searchParams?.preview === "landing" || searchParams?.view === "landing";

  if (showLanding) {
    return <LandingPage />;
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
