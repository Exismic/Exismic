import { getToolMetadata, getToolJsonLd } from "@/lib/seo";
import { Metadata } from "next";
import SvgVectorizer from "@/components/tool/SvgVectorizer";
import { ToolSeoSection } from "@/components/seo/ToolSeoSection";
import { TOOLS } from "@/data/tools";
import { Maximize } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return getToolMetadata("svg-vectorizer", "image");
}

export default function SvgVectorizerPage() {
  const tool = TOOLS.find(t => t.id === "svg-vectorizer" || t.href === "/tools/image/vectorizer");
  const jsonLdSchemas = tool ? getToolJsonLd(tool) : [];

  return (
    <div className="min-h-screen bg-[#050505] px-4 pb-6 pt-24 font-sans text-white selection:bg-blue-500/30 sm:px-6 md:px-12 md:pb-12 md:pt-28" suppressHydrationWarning>
      {/* JSON-LD Schemas for Googlebot */}
      {jsonLdSchemas.map((schema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="p-2 bg-blue-600/20 rounded-xl">
                <Maximize className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight py-1 leading-normal bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-blue-400">
                Image Vectorizer
              </h1>
            </div>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl font-medium">
              Instantly convert PNG, JPG, and WEBP raster files into scalable vector graphics (SVG) for free.
            </p>
          </div>
        </header>

        <main className="space-y-16">
          <SvgVectorizer />

          <ToolSeoSection 
            toolName="Image Vectorizer"
            toolDescription="Convert PNG, JPG, and WEBP raster graphics into infinite-resolution vector SVG paths automatically using advanced Potrace edge tracing algorithms."
            categoryName="Image Tools"
            categoryId="image"
            toolSlug="svg-vectorizer"
            showRelatedTools={true}
            features={[
              "Instant Browser Tracing: Vectorize raster images directly in client memory with zero server lag.",
              "Adjustable Threshold & Geometry: Fine-tune luminance thresholds and corner policy for smooth curves.",
              "Custom Path Fill & Background: Select custom hex colors for vector paths and solid or transparent backgrounds.",
              "Scalable SVG Output: Export clean, lightweight SVG files ready for web, print, and logo design."
            ]}
            faqs={[
              {
                question: "What is an SVG Vectorizer?",
                answer: "An SVG Vectorizer converts pixel-based raster graphics (like PNG or JPG) into scalable vector paths (SVG) made of mathematical lines and curves that never pixelate when zoomed."
              },
              {
                question: "Is this image vectorizer free?",
                answer: "Yes, Exismic Image Vectorizer is 100% free with unlimited SVG exports and instant browser processing."
              },
              {
                question: "What file formats are supported?",
                answer: "You can upload PNG, JPG, JPEG, and WEBP image files up to 10MB."
              }
            ]}
          />
        </main>
      </div>

      {/* Atmospheric Background */}
      <div className="fixed top-0 right-0 -z-10 w-[700px] h-[700px] bg-blue-600/[0.04] blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-purple-600/[0.03] blur-[150px] rounded-full pointer-events-none animate-pulse" />
    </div>
  );
}

