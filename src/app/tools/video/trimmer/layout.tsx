import type { Metadata } from "next";
import { getToolMetadata } from "@/lib/seo";

export const metadata: Metadata = getToolMetadata("video-trimmer");

export default function VideoTrimmerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
