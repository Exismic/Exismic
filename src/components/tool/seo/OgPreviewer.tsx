"use client";

import React, { useState } from "react";
import { Share2, Copy, Check, Globe, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OgPreviewer() {
  const [ogTitle, setOgTitle] = useState("Exismic - All-in-One AI Tools Studio");
  const [ogDesc, setOgDesc] = useState("Create, edit, convert, and enhance images, video, audio, PDFs, and documents online.");
  const [ogImage, setOgImage] = useState("https://www.exismic.xyz/og-image.png");
  const [ogUrl, setOgUrl] = useState("https://www.exismic.xyz");
  const [platform, setPlatform] = useState<"twitter" | "linkedin" | "discord">("twitter");
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    const code = `<!-- Open Graph / Facebook / LinkedIn -->\n` +
      `<meta property="og:type" content="website" />\n` +
      `<meta property="og:url" content="${ogUrl}" />\n` +
      `<meta property="og:title" content="${ogTitle}" />\n` +
      `<meta property="og:description" content="${ogDesc}" />\n` +
      `<meta property="og:image" content="${ogImage}" />\n\n` +
      `<!-- Twitter -->\n` +
      `<meta name="twitter:card" content="summary_large_image" />\n` +
      `<meta name="twitter:url" content="${ogUrl}" />\n` +
      `<meta name="twitter:title" content="${ogTitle}" />\n` +
      `<meta name="twitter:description" content="${ogDesc}" />\n` +
      `<meta name="twitter:image" content="${ogImage}" />`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-teal-900/20 to-neutral-900 border border-cyan-500/20 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
          <Share2 className="w-3.5 h-3.5" /> Social Media Preview Engine
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Open Graph (OG) Social Link Previewer
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base max-w-2xl">
          Preview how your website link cards will render when shared on Twitter/X, LinkedIn, Facebook, and Discord before publishing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-6 space-y-4 p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl shadow-xl">
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
              og:title
            </label>
            <input
              type="text"
              value={ogTitle}
              onChange={(e) => setOgTitle(e.target.value)}
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
              og:description
            </label>
            <textarea
              value={ogDesc}
              onChange={(e) => setOgDesc(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
              og:image URL
            </label>
            <input
              type="text"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
              og:url
            </label>
            <input
              type="text"
              value={ogUrl}
              onChange={(e) => setOgUrl(e.target.value)}
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <button
            onClick={handleCopyCode}
            className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied All Social Meta Tags!" : "Copy OG Meta Tags"}
          </button>
        </div>

        {/* Live Card Simulator */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl shadow-xl flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Social Embed Card
              </span>
              <div className="flex items-center gap-1">
                {(["twitter", "linkedin", "discord"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all",
                      platform === p ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-neutral-400"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Social Card */}
            <div className="w-full max-w-[420px] mx-auto rounded-2xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-2xl my-auto">
              <div className="aspect-[1.91/1] w-full bg-neutral-900 relative overflow-hidden flex items-center justify-center">
                {ogImage ? (
                  <img src={ogImage} alt="OG Banner" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-neutral-700" />
                )}
              </div>
              <div className="p-4 space-y-1 bg-neutral-900/90 border-t border-neutral-800">
                <span className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                  {new URL(ogUrl || "https://example.com").hostname}
                </span>
                <h4 className="text-sm font-bold text-white line-clamp-1">
                  {ogTitle || "Page Title"}
                </h4>
                <p className="text-xs text-neutral-400 line-clamp-2">
                  {ogDesc || "Social card description..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
