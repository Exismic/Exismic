import { renderCategoryToolPage, generateCategoryToolMetadata } from "@/lib/tool-page-render";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateCategoryToolMetadata("image", "resizer");
}

export default async function ImageResizerPage() {
  return renderCategoryToolPage("image", "resizer");
}
