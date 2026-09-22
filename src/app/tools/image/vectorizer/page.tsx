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
      customDescription="Turn low-res logos, sketches, and pictures into infinitely scalable vector graphics (SVG) with razor-sharp lines that never pixelate or blur."
    >
      <SvgVectorizer />
    </ToolPageShell>
  );
}
