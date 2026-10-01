"use client";

import React, { useState, useMemo } from "react";
import { 
  Code2, 
  Copy, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Check, 
  FileCode2, 
  RotateCcw, 
  Download, 
  Tag, 
  Globe, 
  ShieldCheck, 
  Star, 
  HelpCircle, 
  ShoppingBag, 
  Building2, 
  FileText,
  Layers,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import { CyberDropdown, type DropdownOption } from "@/components/ui/CyberDropdown";

const CURRENCY_OPTIONS: DropdownOption[] = [
  { value: "USD", label: "USD ($)", description: "United States Dollar", badge: "$" },
  { value: "EUR", label: "EUR (€)", description: "European Euro", badge: "€" },
  { value: "GBP", label: "GBP (£)", description: "British Pound", badge: "£" },
  { value: "INR", label: "INR (₹)", description: "Indian Rupee", badge: "₹" },
  { value: "CAD", label: "CAD ($)", description: "Canadian Dollar", badge: "CA$" },
  { value: "AUD", label: "AUD ($)", description: "Australian Dollar", badge: "AU$" },
  { value: "JPY", label: "JPY (¥)", description: "Japanese Yen", badge: "¥" },
];

export type SchemaType = "faq" | "article" | "product" | "localBusiness" | "organization";

// 6 Curated Schema Blueprints (Standard: Preloaded Blueprint #1, Zero Empty Voids)
export interface SchemaBlueprint {
  id: string;
  title: string;
  category: string;
  type: SchemaType;
  description: string;
}

export const SCHEMA_BLUEPRINTS: SchemaBlueprint[] = [
  {
    id: "faq-rich",
    title: "FAQ Page Accordion",
    category: "Rich Snippets",
    type: "faq",
    description: "Generates expandable question and answer accordions directly in Google search."
  },
  {
    id: "product-reviews",
    title: "Product with Ratings & Price",
    category: "E-Commerce",
    type: "product",
    description: "Displays star reviews, in-stock status, and currency price directly under your listing."
  },
  {
    id: "editorial-article",
    title: "News Article & Blog Post",
    category: "Publishing",
    type: "article",
    description: "Author byline, date published, and publisher credentials for Google Discover."
  },
  {
    id: "local-store",
    title: "Local Business & Store",
    category: "Local SEO",
    type: "localBusiness",
    description: "Physical location, telephone, address, and opening hours for Google Maps."
  },
  {
    id: "brand-identity",
    title: "Organization Knowledge Graph",
    category: "Brand Trust",
    type: "organization",
    description: "Official company logo, website URL, and verified social media profiles."
  },
  {
    id: "saas-app",
    title: "Software & SaaS Pricing",
    category: "Software",
    type: "product",
    description: "Subscription tier schema highlighting starting price, user rating, and instant access."
  }
];

export default function SchemaMarkupGenerator() {
  const [schemaType, setSchemaType] = useState<SchemaType>("faq");
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("faq-rich");

  // FAQ State
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([
    { 
      question: "What is Schema Markup?", 
      answer: "Schema markup is code (semantic vocabulary) that you put on your website to help search engines provide more informative search results for users." 
    },
    { 
      question: "Does Schema Markup improve Google search rankings?", 
      answer: "While structured data itself is not a direct ranking factor, rich snippets significantly improve click-through rates (CTR) by displaying star ratings, pricing, and FAQ accordions." 
    },
    { 
      question: "How do I add JSON-LD to my website?", 
      answer: "Simply paste the generated JSON-LD script tag directly into the <head> or <body> section of your HTML page." 
    }
  ]);

  // Article State
  const [headline, setHeadline] = useState("The Ultimate Guide to Modern SEO & Search Architecture");
  const [author, setAuthor] = useState("Elena Rostova");
  const [publisher, setPublisher] = useState("Exismic Media");
  const [articleImage, setArticleImage] = useState("https://example.com/images/seo-guide-cover.jpg");

  // Product State
  const [productName, setProductName] = useState("AudioNova Wireless Noise Cancelling Headphones");
  const [brand, setBrand] = useState("AudioNova");
  const [sku, setSku] = useState("AN-NC-2026");
  const [price, setPrice] = useState("149.99");
  const [currency, setCurrency] = useState("USD");
  const [ratingValue, setRatingValue] = useState("4.8");
  const [reviewCount, setReviewCount] = useState("240");

  // Local Business State
  const [businessName, setBusinessName] = useState("Apex Dental Studio");
  const [telephone, setTelephone] = useState("+1-555-839-2041");
  const [streetAddress, setStreetAddress] = useState("742 Evergreen Terrace");
  const [city, setCity] = useState("Austin");
  const [postalCode, setPostalCode] = useState("78701");

  // Organization State
  const [orgName, setOrgName] = useState("Exismic AI");
  const [orgUrl, setOrgUrl] = useState("https://exismic.com");
  const [logoUrl, setLogoUrl] = useState("https://exismic.com/logo.png");
  const [sameAsTwitter, setSameAsTwitter] = useState("https://twitter.com/exismic");

  const [copied, setCopied] = useState<boolean>(false);

  // Generate Structured JSON-LD
  const jsonLd = useMemo(() => {
    if (schemaType === "faq") {
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs
          .filter((f) => f.question.trim().length > 0)
          .map((f) => ({
            "@type": "Question",
            "name": f.question.trim(),
            "acceptedAnswer": {
              "@type": "Answer",
              "text": f.answer.trim()
            }
          }))
      };
    }

    if (schemaType === "article") {
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": headline,
        "image": articleImage ? [articleImage] : undefined,
        "author": {
          "@type": "Person",
          "name": author
        },
        "publisher": {
          "@type": "Organization",
          "name": publisher,
          "logo": {
            "@type": "ImageObject",
            "url": logoUrl
          }
        },
        "datePublished": new Date().toISOString().split("T")[0],
        "dateModified": new Date().toISOString().split("T")[0]
      };
    }

    if (schemaType === "product") {
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": productName,
        "brand": {
          "@type": "Brand",
          "name": brand
        },
        "sku": sku,
        "offers": {
          "@type": "Offer",
          "price": price,
          "priceCurrency": currency,
          "availability": "https://schema.org/InStock",
          "url": "https://example.com/product"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": ratingValue,
          "reviewCount": reviewCount
        }
      };
    }

    if (schemaType === "localBusiness") {
      return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": businessName,
        "telephone": telephone,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": streetAddress,
          "addressLocality": city,
          "postalCode": postalCode,
          "addressCountry": "US"
        },
        "priceRange": "$$"
      };
    }

    if (schemaType === "organization") {
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": orgName,
        "url": orgUrl,
        "logo": logoUrl,
        "sameAs": sameAsTwitter ? [sameAsTwitter] : []
      };
    }

    return {};
  }, [
    schemaType, 
    faqs, 
    headline, 
    author, 
    publisher, 
    articleImage, 
    productName, 
    brand, 
    sku, 
    price, 
    currency, 
    ratingValue, 
    reviewCount,
    businessName,
    telephone,
    streetAddress,
    city,
    postalCode,
    orgName,
    orgUrl,
    logoUrl,
    sameAsTwitter
  ]);

  const scriptTagOutput = `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;

  // Load a Blueprint
  const handleSelectBlueprint = (bp: SchemaBlueprint) => {
    setSelectedBlueprintId(bp.id);
    setSchemaType(bp.type);
  };

  // Add FAQ Item
  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  // Remove FAQ Item
  const removeFaq = (idx: number) => {
    if (faqs.length <= 1) return;
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  // Reset to Baseline
  const handleReset = () => {
    setSelectedBlueprintId("faq-rich");
    setSchemaType("faq");
    setFaqs([
      { question: "What is Exismic?", answer: "Exismic is a suite of next-gen creative and developer tools." },
      { question: "Is this free?", answer: "Yes, you can use these tools online directly in your browser." }
    ]);
  };

  // Copy Output
  const handleCopy = () => {
    navigator.clipboard.writeText(scriptTagOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download .json
  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(jsonLd, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schema-${schemaType}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Deck: Telemetry HUD & Studio Actions */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Category Badge & Studio Telemetry */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black uppercase tracking-wider shadow-[0_0_12px_rgba(6,182,212,0.15)]">
              <Code2 size={13} className="text-cyan-400" />
              <span>SEO Webmaster Studio</span>
            </div>

            {/* Active Entity Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <span className="text-xs font-bold text-zinc-300">Schema Entity:</span>
              <span className="text-sm font-black text-cyan-400 uppercase">
                {schemaType === "faq" ? "FAQPage" : schemaType === "localBusiness" ? "LocalBusiness" : schemaType}
              </span>
            </div>

            {/* Rich Snippet Verification Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <ShieldCheck size={14} className="text-cyan-400" />
              <span className="text-xs font-bold text-zinc-300">Google Rich Results:</span>
              <span className="text-xs font-black text-cyan-400">
                ✓ Schema.org Validated
              </span>
            </div>
          </div>

          {/* Right: Reset & Download */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Reset fields to baseline"
            >
              <RotateCcw size={16} />
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} className="text-cyan-400" />
              <span className="hidden sm:inline">Download JSON-LD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Blueprint Selector Bar (Standard: 6 Blueprints, Preloaded Blueprint #1) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Tag size={13} className="text-cyan-400" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Google Rich Snippet Blueprints
            </span>
          </div>
          <span className="text-[11px] font-medium text-zinc-500">
            Click any blueprint to inspect verified Schema.org structured data templates
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {SCHEMA_BLUEPRINTS.map((bp) => {
            const isSelected = selectedBlueprintId === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => handleSelectBlueprint(bp)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group",
                  isSelected
                    ? "bg-cyan-500/15 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40"
                    : "bg-white/[0.02] border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 whitespace-nowrap shrink-0">
                    {bp.category}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 truncate text-right">
                    {bp.type}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {bp.title}
                  </p>
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {bp.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Interactive Workspace (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Schema Form Fields): 6 Cols */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl space-y-5">
            {/* Schema Type Switcher Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Choose Schema Entity Type
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { id: "faq", label: "FAQ Page", icon: HelpCircle },
                  { id: "product", label: "Product", icon: ShoppingBag },
                  { id: "article", label: "Article", icon: FileText },
                  { id: "localBusiness", label: "Local Store", icon: Building2 },
                  { id: "organization", label: "Organization", icon: Globe }
                ].map((item) => {
                  const Icon = item.icon;
                  const isCur = schemaType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSchemaType(item.id as SchemaType);
                        setSelectedBlueprintId("");
                      }}
                      className={cn(
                        "p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1",
                        isCur
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 font-black shadow-md shadow-cyan-500/10"
                          : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                      )}
                    >
                      <Icon size={14} className={isCur ? "text-cyan-400" : "text-zinc-500"} />
                      <span className="text-[10px] uppercase font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Entity Form */}
            <div className="pt-2 border-t border-white/10">
              {/* 1. FAQ Schema Fields */}
              {schemaType === "faq" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                      FAQ Question & Answer Pairs ({faqs.length})
                    </span>
                    <button
                      type="button"
                      onClick={addFaq}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/30 flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Plus size={13} />
                      <span>Add Question</span>
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {faqs.map((f, i) => (
                      <div key={i} className="p-3.5 rounded-2xl border border-white/10 bg-black/40 space-y-2 relative group">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-cyan-400">Q#{i + 1}</span>
                          {faqs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFaq(i)}
                              className="text-zinc-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                              title="Delete pair"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={f.question}
                          onChange={(e) => {
                            const copy = [...faqs];
                            copy[i].question = e.target.value;
                            setFaqs(copy);
                          }}
                          placeholder="What is your product return policy?"
                          className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-xs font-bold text-white focus:border-cyan-500 focus:outline-none"
                        />
                        <textarea
                          rows={2}
                          value={f.answer}
                          onChange={(e) => {
                            const copy = [...faqs];
                            copy[i].answer = e.target.value;
                            setFaqs(copy);
                          }}
                          placeholder="We offer a 30-day money-back guarantee with free return shipping..."
                          className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-xs font-medium text-zinc-300 focus:border-cyan-500 focus:outline-none resize-none leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Product Schema Fields */}
              {schemaType === "product" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Product Name</label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300">Brand Name</label>
                      <input
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300">SKU / Model Number</label>
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300">Price Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-bold"
                      />
                    </div>
                    <CyberDropdown
                      label="Currency Code"
                      value={currency}
                      onChange={setCurrency}
                      options={CURRENCY_OPTIONS}
                      themeColor="cyan"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300">Rating (1.0 to 5.0)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={ratingValue}
                        onChange={(e) => setRatingValue(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300">Total Review Count</label>
                      <input
                        type="number"
                        value={reviewCount}
                        onChange={(e) => setReviewCount(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Article Schema Fields */}
              {schemaType === "article" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Article Headline</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300">Author Name</label>
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300">Publisher Name</label>
                      <input
                        type="text"
                        value={publisher}
                        onChange={(e) => setPublisher(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Featured Article Image URL</label>
                    <input
                      type="text"
                      value={articleImage}
                      onChange={(e) => setArticleImage(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              {/* 4. Local Business Schema Fields */}
              {schemaType === "localBusiness" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300">Business Name</label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300">Telephone</label>
                      <input
                        type="text"
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Street Address</label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300">City / Locality</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300">Postal Code</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Organization Schema Fields */}
              {schemaType === "organization" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Legal Organization Name</label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Website URL</label>
                    <input
                      type="text"
                      value={orgUrl}
                      onChange={(e) => setOrgUrl(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Brand Logo URL</label>
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Social Media URL (`sameAs`)</label>
                    <input
                      type="text"
                      value={sameAsTwitter}
                      onChange={(e) => setSameAsTwitter(e.target.value)}
                      placeholder="https://x.com/yourbrand"
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (JSON-LD Code Output & SERP Rich Card): 6 Cols */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <FileCode2 size={15} className="text-cyan-400" />
                  <span>JSON-LD Schema Script Tag</span>
                </span>
                <span className="text-[11px] font-mono text-cyan-400">application/ld+json</span>
              </div>

              {/* Code Container */}
              <pre className="w-full min-h-[340px] max-h-[420px] rounded-2xl border border-white/10 bg-black/80 p-4 text-xs font-mono text-cyan-300 overflow-y-auto leading-relaxed select-all">
                {scriptTagOutput}
              </pre>

              {/* Rich Snippets Verification Strip */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-cyan-300">
                  <CheckCircle2 size={14} className="text-cyan-400" />
                  <span>Valid Schema.org syntax ready for Google Rich Results Test</span>
                </div>
                {schemaType === "product" && (
                  <div className="flex items-center gap-2 text-amber-400">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span>Eligible for golden star rating snippet in Google SERPs</span>
                  </div>
                )}
                {schemaType === "faq" && (
                  <div className="flex items-center gap-2 text-cyan-300">
                    <HelpCircle size={14} className="text-cyan-400" />
                    <span>Eligible for interactive FAQ accordion search results</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={16} className="text-cyan-400" />
                    <span>Copied JSON-LD!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} className="text-zinc-300" />
                    <span>Copy JSON-LD Script</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadJson}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <Download size={16} className="text-black" />
                <span>Download .json</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Result Retention Bar */}
      <ResultRetentionBar
        toolType="schema-markup-generator"
        toolName="Schema Markup Generator"
        title={`Schema Markup: ${schemaType.toUpperCase()} Structured Data`}
        content={scriptTagOutput}
        downloadLabel="Download JSON-LD"
        downloadAction={handleDownloadJson}
        onCopy={handleCopy}
      />

      {/* Chained Companion Tools in SEO */}
      <ToolWorkflowChaining
        currentToolId="schema-markup-generator"
        categoryId="seo"
        outputContent={scriptTagOutput}
      />

      {/* Suggested Tools */}
      <ToolSuggestions
        currentToolId="schema-markup-generator"
        categoryId="seo"
        outputContent={scriptTagOutput}
      />
    </div>
  );
}
