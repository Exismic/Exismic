import type { Metadata } from "next";
import { getToolMetadata } from "@/lib/seo";

export const metadata: Metadata = getToolMetadata("video-enhancer");

export default function VideoEnhancerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
