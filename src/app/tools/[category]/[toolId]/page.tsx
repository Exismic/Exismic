import { generateCategoryToolMetadata, renderCategoryToolPage } from "@/lib/tool-page-render";
import { Metadata } from "next";
import { TOOLS } from "@/data/tools";

interface PageProps {
  params: Promise<{ category: string; toolId: string }>;
}

export async function generateStaticParams() {
  return TOOLS.map((tool) => {
    const parts = tool.href.split("/").filter(Boolean);
    if (parts.length === 3 && parts[0] === "tools") {
      return { category: parts[1], toolId: parts[2] };
    }
    return { category: tool.category, toolId: tool.id };
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, toolId } = await params;
  return generateCategoryToolMetadata(category, toolId);
}

export default async function ToolDetailPage({ params }: PageProps) {
  const { category, toolId } = await params;
  return renderCategoryToolPage(category, toolId);
}



