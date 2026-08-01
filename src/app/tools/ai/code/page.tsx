import { constructMetadata, getToolJsonLd, SITE_URL } from "@/lib/seo";
import CodeStudioClient from "./CodeStudioClient";
import { Metadata } from "next";
import { TOOLS, CATEGORIES } from "@/data/tools";

export const metadata: Metadata = constructMetadata({
  title: "Exismic Code Studio & Live Compiler Online",
  description: "Build, edit, compile, and preview codebases with Exismic's AI Code Studio. Interactive browser sandbox with real-time AI code generation.",
  canonicalUrl: "/tools/ai/code",
  keywords: ["AI code generator","online code studio","interactive sandbox","AI programming assistant","live code compiler","Exismic"],
});

export default function Page() {
  const tool = TOOLS.find(t => t.id === "ai-code" || t.href === "/tools/ai/code") || {
    id: "ai-code",
    name: "Exismic Code Studio & Live Compiler Online",
    description: "Build, edit, compile, and preview codebases with Exismic's AI Code Studio. Interactive browser sandbox with real-time AI code generation.",
    href: "/tools/ai/code"
  };

  const jsonLd = getToolJsonLd(tool);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CodeStudioClient />
    </>
  );
}

