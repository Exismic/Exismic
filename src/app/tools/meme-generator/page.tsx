import { constructMetadata, getToolJsonLd, SITE_URL } from "@/lib/seo";
import MemeGenerator from "./MemeGeneratorClient";
import { Metadata } from "next";
import { TOOLS, CATEGORIES } from "@/data/tools";

export const metadata: Metadata = constructMetadata({
  title: "Online Meme Generator - Create Funny Memes with AI Instantly",
  description: "Generate viral and funny memes in seconds using classic templates or your own images. Fast, free, and watermark-free online meme maker.",
  canonicalUrl: "/tools/meme-generator",
  keywords: ["meme generator","online meme maker","funny meme creator","meme templates","drake meme generator","Exismic"],
});

export default function Page() {
  const tool = TOOLS.find(t => t.id === "meme-generator" || t.href === "/tools/meme-generator") || {
    id: "meme-generator",
    name: "Online Meme Generator",
    description: "Generate viral and funny memes in seconds using classic templates or your own images. Fast, free, and watermark-free online meme maker.",
    href: "/tools/meme-generator"
  };

  const jsonLd = getToolJsonLd(tool);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MemeGenerator />
    </>
  );
}
