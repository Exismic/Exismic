import { CATEGORIES } from "@/data/tools";
import { CategoryClient } from "./CategoryClient";
import { CategorySeoSection } from "@/components/seo/CategorySeoSection";
import { Metadata } from "next";
import { constructMetadata, getCategoryJsonLd, SITE_URL } from "@/lib/seo";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const category = CATEGORIES.find(c => c.id === id);
  
  if (!category) return { title: "Category Not Found" };

  const name = category.name;
  
  let seoTitle = `${name} - Professional Free AI Tools | Exismic`;
  let seoDesc = `Explore our suite of ${name.toLowerCase()}. ${category.description} Free, fast, and studio-grade results online.`;
  const keywords = [name.toLowerCase(), `free ${name.toLowerCase()}`, `online ${name.toLowerCase()}`, "AI tools", "Exismic"];

  if (id === 'image') {
    seoTitle = "Image Tools - Background Removal, Resizing, Compression & Conversion";
    seoDesc = "Remove image backgrounds, resize and compress pictures, convert formats, trace images to SVG, and create collages or Minecraft skins with Exismic image tools.";
    keywords.push("remove background free", "vectorize image", "photo restorer", "image compressor");
  } else if (id === 'video') {
    seoTitle = "Online Video Tools - Trim, Compress, Merge, Subtitles, GIFs & Enhancement";
    seoDesc = "Trim, compress, and merge video clips, generate subtitles, convert video to GIF, and apply enhancement filters with Exismic's online video tools.";
    keywords.push("video to gif", "auto subtitles generator", "video compressor", "trim video online");
  } else if (id === 'ai') {
    seoTitle = "AI Magic Studio - Writing, Coding, Logo Generation & Smart Chat";
    seoDesc = "Unlock creativity with Exismic AI magic. Generate articles, write code, craft logos, and converse with high-intelligence AI models.";
    keywords.push("AI writing assistant", "AI code generator", "AI logo creator", "AI chat online");
  } else if (id === 'audio') {
    seoTitle = "AI Audio Tools - Vocal Remover, Stem Splitter, TTS & Music Generator";
    seoDesc = "Isolate vocals, split music stems, remove background noise, generate realistic text-to-speech, and create original AI music tracks.";
    keywords.push("vocal remover free", "stem splitter online", "text to speech AI", "AI music generator");
  } else if (id === 'pdf') {
    seoTitle = "Smart PDF Tools - Merge, Split, Compress, OCR & Convert PDFs Online";
    seoDesc = "Manage your document workflow easily. Merge, split, compress, extract text with OCR, and convert PDF files fast and securely.";
    keywords.push("merge PDF free", "compress PDF", "PDF OCR text extractor", "convert PDF to Word");
  } else if (id === 'productivity') {
    seoTitle = "Productivity Tools - QR Codes, Resumes, Invoices, Colors & Typing";
    seoDesc = "Create QR codes, explore color palettes, test typing speed, build or review resumes, draft application text, and prepare invoices with Exismic productivity tools.";
  } else if (id === 'business') {
    seoTitle = "Business & Finance Calculators - GST, EMI, Salary & Profit Margins";
    seoDesc = "Estimate GST, loan payments, profit margins, and take-home salary with Exismic business calculators. Review the inputs, formulas, and assumptions for your case.";
  } else if (id === 'seo') {
    seoTitle = "Free SEO Tools - Meta Tag Generators, Sitemaps, Robots.txt & Schema Markup";
    seoDesc = "Optimize your website search ranking with instant SERP previewers, canonical generator, meta description creator, sitemaps, and Schema.org markup.";
  } else if (id === 'developer') {
    seoTitle = "Developer Tools - Regex Tester, Cron Generator, Hash Generator & SQL Builder";
    seoDesc = "Essential web developer utilities: test regex expressions, build cron expressions, generate MD5/SHA-256 hashes, format JSON, and build SQL queries.";
  } else if (id === 'student') {
    seoTitle = "Student & Academic AI Tools - Math Solver, Flashcards, Notes & Citations";
    seoDesc = "Ace your studies with AI step-by-step math solver, automatic PDF study note generator, flashcards maker, and APA/MLA citation builder.";
  } else if (id === 'creator') {
    seoTitle = "Creator Tools - Scripts, Carousels, Thumbnail Analysis & Post Formatting";
    seoDesc = "Draft video hooks, design carousels, inspect thumbnails, format LinkedIn posts, create social mockups, and read scripts with Exismic creator tools.";
  }

  return constructMetadata({
    title: seoTitle,
    description: seoDesc,
    canonicalUrl: `${SITE_URL}/category/${id}`,
    keywords,
  });
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ id: c.id }));
}

export default async function CategoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  const category = CATEGORIES.find(c => c.id === id);

  if (!category) {
    console.error("[CategoryPage] Category not found for id:", id, "Available:", CATEGORIES.map(c => c.id));
    notFound();
  }

  const jsonLd = getCategoryJsonLd(category);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryClient categoryId={id} />
      <CategorySeoSection
        categoryId={id}
        categoryName={category.name}
        categoryDescription={category.description}
      />
    </>
  );
}
