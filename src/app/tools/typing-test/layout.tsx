import type { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Typing Speed Test - WPM, Accuracy and Key Heatmap | Lumora",
  description:
    "Measure typing speed, accuracy, and consistency with timed tests, daily challenges, and improvement insights.",
  canonicalUrl: `${SITE_URL}/tools/typing-test`,
});

export default function TypingTestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
