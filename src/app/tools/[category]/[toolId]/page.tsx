import React, { Suspense } from "react";
import { generateCategoryToolMetadata, renderCategoryToolPage } from "@/lib/tool-page-render";
import { Metadata } from "next";
import { TOOLS } from "@/data/tools";

interface PageProps {
  params: Promise<{ category: string; toolId: string }>;
}

export async function generateStaticParams() {
  return TOOLS.filter((tool) => {
    const parts = tool.href.split("/").filter(Boolean);
    return parts.length === 3 && parts[0] === "tools";
  }).map((tool) => {
    const parts = tool.href.split("/").filter(Boolean);
    return { category: parts[1], toolId: parts[2] };
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, toolId } = await params;
  return generateCategoryToolMetadata(category, toolId);
}

export default async function ToolDetailPage({ params }: PageProps) {
  const { category, toolId } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07090e]" />}>
      {await renderCategoryToolPage(category, toolId)}
    </Suspense>
  );
}



