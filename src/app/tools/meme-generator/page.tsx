import { constructMetadata, SITE_URL } from "@/lib/seo";
import MemeGenerator from "./MemeGeneratorClient";
import { Metadata } from "next";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Online Meme Generator - Create Funny Memes with AI Instantly",
  description: "Generate viral and funny memes in seconds using classic templates or your own images. Fast, free, and watermark-free online meme maker.",
  canonicalUrl: "/tools/meme-generator",
  keywords: ["meme generator","online meme maker","funny meme creator","meme templates","drake meme generator","Exismic"],
});

export default function Page() {
  return (
    <ToolPageShell
      toolId="meme-generator"
      categoryId="creator"
      customTitle="Meme Studio"
      customDescription="Create funny, high-impact memes in seconds using classic templates or your own uploaded images."
    >
      <MemeGenerator />
    </ToolPageShell>
  );
}
