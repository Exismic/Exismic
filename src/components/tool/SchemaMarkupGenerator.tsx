"use client";

import React, { useState, useMemo } from "react";
import { 
  Code2, 
  Copy, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Check,
  FileCode2
} from "lucide-react";
import { cn } from "@/lib/utils";

type SchemaType = "faq" | "article" | "product" | "organization";

interface FaqItem {
  question: string;
  answer: string;
}

export default function SchemaMarkupGenerator() {
  const [schemaType, setSchemaType] = useState<SchemaType>("faq");
  
  // FAQ fields
  const [faqs, setFaqs] = useState<FaqItem[]>([
    { question: "What is Exismic AI Studio?", answer: "Exismic is a suite of next-gen AI tools for creators and developers." },
    { question: "Is there a free trial?", answer: "Yes, every free account includes 50 daily credits." }
  ]);

  // Article fields
  const [headline, setHeadline] = useState("How to Build AI Tools Fast");
  const [author, setAuthor] = useState("Syed Rayan");
  const [publisher, setPublisher] = useState("Exismic AI");

  // Product fields
  const [productName, setProductName] = useState("Exismic Pro Pass");
  const [price, setPrice] = useState("499");
  const [currency, setCurrency] = useState("INR");

  const [copied, setCopied] = useState(false);

  const jsonLd = useMemo(() => {
    if (schemaType === "faq") {
      return JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map((f) => ({
            "@type": "Question",
            "name": f.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": f.answer
            }
          }))
        },
        null,
        2
      );
    }

    if (schemaType === "article") {
      return JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": headline,
          "author": {
            "@type": "Person",
            "name": author
          },
          "publisher": {
            "@type": "Organization",
            "name": publisher
          },
          "datePublished": new Date().toISOString().split("T")[0]
        },
        null,
        2
      );
    }

    if (schemaType === "product") {
      return JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": productName,
          "offers": {
            "@type": "Offer",
            "price": price,
            "priceCurrency": currency,
            "availability": "https://schema.org/InStock"
          }
        },
        null,
        2
      );
    }

    return "";
  }, [schemaType, faqs, headline, author, publisher, productName, price, currency]);

  const scriptTagOutput = `<script type="application/ld+json">\n${jsonLd}\n</script>`;

  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptTagOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 via-zinc-950 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black uppercase tracking-wider">
              <Code2 size={14} className="text-cyan-400" />
              <span>Structured Data</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Schema Markup Generator
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Generate Google-compliant JSON-LD structured data for FAQ, Article, Product, and Business schemas.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400">Select Schema Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(["faq", "article", "product"] as SchemaType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSchemaType(t)}
                  className={cn(
                    "py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider border cursor-pointer",
                    schemaType === t 
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300" 
                      : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white"
                  )}
                >
                  {t === "faq" ? "FAQ Page" : t === "article" ? "Article" : "Product"}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Form based on schemaType */}
          <div className="space-y-4 pt-2 flex-1">
            {schemaType === "faq" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-300">FAQ Question Pairs</span>
                  <button type="button" onClick={addFaq} className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer">
                    <Plus size={14} /> Add Pair
                  </button>
                </div>
                {faqs.map((f, i) => (
                  <div key={i} className="p-3 rounded-2xl border border-white/10 bg-black/40 space-y-2 relative">
                    <input
                      type="text"
                      value={f.question}
                      onChange={(e) => {
                        const copy = [...faqs];
                        copy[i].question = e.target.value;
                        setFaqs(copy);
                      }}
                      placeholder="Question..."
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={f.answer}
                      onChange={(e) => {
                        const copy = [...faqs];
                        copy[i].answer = e.target.value;
                        setFaqs(copy);
                      }}
                      placeholder="Answer..."
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            )}

            {schemaType === "article" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Author Name</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {schemaType === "product" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Product Name</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-400">Price</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-400">Currency</label>
                    <input
                      type="text"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Output */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <FileCode2 size={15} className="text-cyan-400" />
            JSON-LD Schema Script Output
          </label>

          <pre className="w-full flex-1 min-h-[260px] rounded-2xl border border-white/10 bg-black/80 p-4 text-[11px] font-mono text-cyan-300 overflow-y-auto leading-relaxed">
            {scriptTagOutput}
          </pre>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
            <span>{copied ? "Copied JSON-LD Code!" : "Copy JSON-LD Script Tag"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
