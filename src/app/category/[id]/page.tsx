import { CATEGORIES } from "@/data/tools";
import { CategoryClient } from "./CategoryClient";
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
  let keywords = [name.toLowerCase(), `free ${name.toLowerCase()}`, `online ${name.toLowerCase()}`, "AI tools", "Exismic"];

  if (id === 'image') {
    seoTitle = "Best Free AI Image Tools - Magic Eraser, Background Remover & Vectorizer";
    seoDesc = "Transform and edit images with Exismic AI. Instantly remove backgrounds, upscale, compress, vectorize SVG, and restore old photos free online.";
    keywords.push("remove background free", "vectorize image", "photo restorer", "image compressor");
  } else if (id === 'video') {
    seoTitle = "Pro AI Video Tools - Background Remover, Subtitle Gen, Trimmer & Enhancer";
    seoDesc = "Edit, trim, compress videos, generate auto subtitles, and isolate backgrounds with Exismic's studio-grade AI video suite.";
    keywords.push("video background remover", "auto subtitles generator", "video compressor", "trim video online");
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
    seoTitle = "Productivity Utilities - QR Code, Passwords, Unit Converters & JSON Formatters";
    seoDesc = "Boost your daily workflow with fast, secure productivity tools: QR code generator, password generator, unit converters, and JSON formatters.";
  } else if (id === 'business') {
    seoTitle = "Business & Finance Calculators - Invoices, GST, EMI & Profit Margins";
    seoDesc = "Generate professional invoices, calculate GST, compute loan EMI, and analyze profit margins with Exismic's business utilities.";
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
    seoTitle = "Creator & Social Media Tools - YouTube Thumbnail Maker, Captions & Formatting";
    seoDesc = "Grow your social audience with YouTube thumbnail creation, viral hashtag generators, video script writers, and LinkedIn post formatting.";
  }

  return constructMetadata({
    title: seoTitle,
    description: seoDesc,
    canonicalUrl: `${SITE_URL}/category/${id}`,
    keywords,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { id } = await params;
  const category = CATEGORIES.find(c => c.id === id);

  if (!category) {
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
    </>
  );
}

