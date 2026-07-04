import type { Metadata } from "next";
import { getToolMetadata } from "@/lib/seo";

export const metadata: Metadata = getToolMetadata("video-compressor");

export default function VideoCompressorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
