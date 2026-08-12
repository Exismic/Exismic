import { TOOLS, CATEGORIES } from "@/data/tools";
import { ToolDetailClient } from "@/app/tools/[category]/[toolId]/ToolDetailClient";
import { getToolMetadata, getToolJsonLd } from "@/lib/seo";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { ToolSeoSection } from "@/components/seo/ToolSeoSection";

export async function generateCategoryToolMetadata(category: string, toolId: string): Promise<Metadata> {
  return getToolMetadata(toolId, category);
}

export async function renderCategoryToolPage(categoryId: string, toolId: string) {
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

  const jsonLd = getToolJsonLd(tool, category);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolDetailClient 
        tool={tool} 
        category={category} 
        relatedTools={relatedTools} 
        categoryId={categoryId} 
        toolId={toolId} 
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <ToolSeoSection 
          toolName={tool.name}
          toolDescription={tool.seoDescription || tool.description}
          categoryName={category.name}
          categoryId={categoryId}
          toolSlug={tool.id}
          showRelatedTools={true}
        />
      </div>
    </>
  );
}
