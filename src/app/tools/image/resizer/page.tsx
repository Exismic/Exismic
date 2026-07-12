import type { Metadata } from "next";
import { CATEGORIES, TOOLS } from "@/data/tools";
import { getToolMetadata } from "@/lib/seo";
import { ToolDetailClient } from "../../[category]/[toolId]/ToolDetailClient";

const tool = TOOLS.find((item) => item.id === "image-resizer");
const category = CATEGORIES.find((item) => item.id === "image");

export const metadata: Metadata = getToolMetadata("image-resizer");

export default function ImageResizerPage() {
  if (!tool || !category) return null;

  const relatedTools = TOOLS.filter(
    (item) => item.category === category.id && item.id !== tool.id
  ).slice(0, 3);

  return (
    <ToolDetailClient
      tool={tool}
      category={category}
      relatedTools={relatedTools}
      categoryId={category.id}
      toolId="resizer"
    />
  );
}
