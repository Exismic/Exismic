import { getToolMetadata } from "@/lib/seo";
import { Metadata } from "next";
import SvgVectorizer from "@/components/tool/SvgVectorizer";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export async function generateMetadata(): Promise<Metadata> {
  return getToolMetadata("svg-vectorizer", "image");
}

export default function SvgVectorizerPage() {
  return (
    <ToolPageShell
      toolId="svg-vectorizer"
      categoryId="image"
      customTitle="Image Vectorizer"
      customDescription="Convert PNG, JPG, and WEBP raster images into infinite-resolution vector SVG graphics with client-side edge tracing."
    >
      <SvgVectorizer />
    </ToolPageShell>
  );
}
