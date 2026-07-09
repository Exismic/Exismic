import type { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "About Exismic - The AI Creative Workspace",
  description:
    "Learn how Exismic brings image, video, audio, PDF, productivity, and AI tools into one focused creative workspace.",
  canonicalUrl: `${SITE_URL}/about`,
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
