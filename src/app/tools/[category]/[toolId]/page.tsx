import { TOOLS, CATEGORIES } from "@/data/tools";
import { ToolDetailClient } from "./ToolDetailClient";
import { getToolMetadata } from "@/lib/seo";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ category: string; toolId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, toolId } = await params;
  return getToolMetadata(toolId, category);
}

export default async function ToolDetailPage({ params }: PageProps) {
  const { category: categoryId, toolId } = await params;
  
  if (categoryId === "ai" && (toolId === "chat" || toolId === "ai-chat")) {
    redirect("/chat");
  }
  
  const tool = TOOLS.find(t => t.id === toolId || t.id === `${categoryId}-${toolId}`);
  const category = CATEGORIES.find(c => c.id === categoryId);

  if (tool && tool.href !== `/tools/${categoryId}/${toolId}`) {
    redirect(tool.href);
  }

  const relatedTools = TOOLS.filter(t => t.category === categoryId && t.id !== tool?.id && t.indexable !== false).slice(0, 3);

  if (!tool || !category) {
    notFound();
  }

  return (
      <ToolDetailClient 
        tool={tool} 
        category={category} 
        relatedTools={relatedTools} 
        categoryId={categoryId} 
        toolId={toolId} 
      />
  );
}
