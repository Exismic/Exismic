import type { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Online Meme Generator - Create Memes Fast | Exismic",
  description: "Create and export custom memes with images, captions, layouts, and styling controls.",
  canonicalUrl: `${SITE_URL}/tools/meme-generator`,
});

export default function MemeGeneratorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
