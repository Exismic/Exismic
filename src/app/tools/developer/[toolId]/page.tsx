import { generateCategoryToolMetadata, renderCategoryToolPage } from "@/lib/tool-page-render";
import { Metadata } from "next";
import { TOOLS } from "@/data/tools";

interface PageProps {
  params: Promise<{ toolId: string }>;
}

export async function generateStaticParams() {
  return TOOLS.filter(t => t.category === "developer").map((t) => {
    const parts = t.href.split("/").filter(Boolean);
    return { toolId: parts[parts.length - 1] || t.id };
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { toolId } = await params;
  return generateCategoryToolMetadata("developer", toolId);
}

export default async function Page({ params }: PageProps) {
  const { toolId } = await params;
  return renderCategoryToolPage("developer", toolId);
}
