import { constructMetadata, getToolJsonLd, SITE_URL } from "@/lib/seo";
import TypingSpeedTesterPage from "./TypingTestClient";
import { Metadata } from "next";
import { TOOLS, CATEGORIES } from "@/data/tools";

export const metadata: Metadata = constructMetadata({
  title: "AI Typing Speed Test & WPM Trainer Online | Exismic",
  description: "Test your typing speed (WPM) and accuracy with interactive prompts. Improve your keyboard efficiency with real-time feedback.",
  canonicalUrl: "/tools/typing-test",
  keywords: ["typing test","wpm test","typing speed test","online typing test","keyboard speed test","Exismic"],
});

export default function Page() {
  const tool = TOOLS.find(t => t.id === "typing-test" || t.href === "/tools/typing-test") || {
    id: "typing-test",
    name: "AI Typing Speed Test & WPM Trainer Online | Exismic",
    description: "Test your typing speed (WPM) and accuracy with interactive prompts. Improve your keyboard efficiency with real-time feedback.",
    href: "/tools/typing-test"
  };

  const jsonLd = getToolJsonLd(tool);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TypingSpeedTesterPage />
    </>
  );
}
