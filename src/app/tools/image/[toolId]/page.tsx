import { generateCategoryToolMetadata, renderCategoryToolPage } from "@/lib/tool-page-render";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ toolId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { toolId } = await params;
  return generateCategoryToolMetadata("image", toolId);
}

export default async function Page({ params }: PageProps) {
  const { toolId } = await params;
  return renderCategoryToolPage("image", toolId);
}
