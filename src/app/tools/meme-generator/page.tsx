import { constructMetadata, SITE_URL } from "@/lib/seo";
import MemeGenerator from "./MemeGeneratorClient";
import { Metadata } from "next";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Online Meme Generator - Add Captions to Templates & Photos",
  description: "Create memes from classic templates or your own pictures. Edit caption text, font, color, outline, and placement, then download PNG.",
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
