import { ToolDetailClient } from "@/app/tools/[category]/[toolId]/ToolDetailClient";
import { CATEGORIES, TOOLS } from "@/data/tools";
import { getToolMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";

export const metadata = getToolMetadata("video-bg-remover");

export default function VideoBackgroundRemoverPage() {
  const tool = TOOLS.find((entry) => entry.id === "video-bg-remover");
  const category = CATEGORIES.find((entry) => entry.id === "video");
  if (!tool || !category) notFound();

  const relatedTools = TOOLS.filter(
    (entry) => entry.category === "video" && entry.id !== tool.id,
  ).slice(0, 3);

  return (
    <ToolDetailClient
      tool={tool}
      category={category}
      relatedTools={relatedTools}
      categoryId="video"
      toolId="bg-remover"
    />
  );
}
