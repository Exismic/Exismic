import { constructMetadata, SITE_URL } from "@/lib/seo";
import TypingSpeedTesterPage from "./TypingTestClient";
import { Metadata } from "next";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "AI Typing Speed Test & WPM Trainer Online | Exismic",
  description: "Test your typing speed (WPM) and accuracy with interactive prompts. Improve your keyboard efficiency with real-time feedback.",
  canonicalUrl: "/tools/typing-test",
  keywords: ["typing test","wpm test","typing speed test","online typing test","keyboard speed test","Exismic"],
});

export default function Page() {
  return (
    <ToolPageShell
      toolId="typing-test"
      categoryId="productivity"
      customTitle="Typing Speed Test"
      customDescription="Test your typing speed (WPM), accuracy, and consistency with live feedback and customizable duration modes."
    >
      <TypingSpeedTesterPage />
    </ToolPageShell>
  );
}
