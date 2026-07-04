"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Hash, 
  Send, 
  Copy, 
  CheckCircle2, 
  Star, 
  Camera, 
  MessageSquare, 
  Play, 
  Smartphone, 
  Globe, 
  Zap, 
  Layers, 
  TrendingUp, 
  Target, 
  RotateCcw,
  Sparkles,
  ChevronRight,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

type Platform = "all" | "instagram" | "youtube" | "tiktok" | "twitter";

interface HashtagGroup {
  category: string;
  icon: React.ReactNode;
  tags: string[];
}

export default function HashtagGenerator() {
  const [keywords, setKeywords] = useState("");
  const [platform, setPlatform] = useState<Platform>("all");
  const [count, setCount] = useState(15);
  const [mixTrending, setMixTrending] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<HashtagGroup[] | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [isCopiedAll, setIsCopiedAll] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const generateHashtags = async () => {
    if (!keywords.trim()) return;

    setIsGenerating(true);
    setResults(null);

    const baseTags = keywords
      .toLowerCase()
      .split(/[\s,]+/)
      .map((tag) => tag.replace(/[^a-z0-9]/g, ""))
      .filter(Boolean)
      .slice(0, 8);
    const phrase = baseTags.join("");
    const platformTags: Record<Platform, string[]> = {
      all: ["discover", "creator", "community", "newcontent"],
      instagram: ["instagramreels", "reels", "explorepage", "instacreator"],
      youtube: ["youtube", "youtubeshorts", "videocreator", "watchnow"],
      tiktok: ["tiktok", "tiktokcreator", "fyp", "shortformvideo"],
      twitter: ["twittercommunity", "thread", "buildinpublic", "conversation"],
    };
    const reachTags = mixTrending ? platformTags[platform] : [];
    const nicheTags = baseTags.flatMap((tag) => [
      tag,
      `${tag}tips`,
      `${tag}guide`,
      `${tag}community`,
      `learn${tag}`,
    ]);
    const longTailTags = [
      `best${phrase}`,
      `${phrase}ideas`,
      `${phrase}forbeginners`,
      `${phrase}${platform === "all" ? "content" : platform}`,
      ...baseTags.flatMap((tag) => [`daily${tag}`, `${tag}inspiration`]),
    ];
    const unique = (tags: string[]) => Array.from(new Set(tags)).filter(Boolean);
    const reachCount = mixTrending ? Math.ceil(count * 0.25) : 0;
    const nicheCount = Math.ceil(count * 0.5);
    const longTailCount = Math.max(0, count - reachCount - nicheCount);
    await Promise.resolve();

    setResults([
      ...(mixTrending
        ? [{ category: "Reach", icon: <TrendingUp className="w-4 h-4" />, tags: unique(reachTags).slice(0, reachCount) }]
        : []),
      { category: "Niche", icon: <Target className="w-4 h-4" />, tags: unique(nicheTags).slice(0, nicheCount) },
      { category: "Long-tail", icon: <Layers className="w-4 h-4" />, tags: unique(longTailTags).slice(0, longTailCount) },
    ].filter((group) => group.tags.length > 0));

    setIsGenerating(false);
  };

  const copyToClipboard = (tag: string) => {
    navigator.clipboard.writeText(`#${tag}`);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  const copyAll = () => {
    if (!results) return;
    const allTags = results.flatMap(g => g.tags).map(t => `#${t}`).join(" ");
    navigator.clipboard.writeText(allTags);
    setIsCopiedAll(true);
    setTimeout(() => setIsCopiedAll(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-cyan-500/30" suppressHydrationWarning>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center md:justify-start gap-3 mb-4"
            >
              <div className="p-2 bg-cyan-600/20 rounded-xl">
                <Hash className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-cyan-400">
                Hashtag Generator
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-lg md:text-xl max-w-2xl font-medium"
            >
              Build focused, platform-aware hashtag sets for your content.
            </motion.p>
          </div>

          <button 
            onClick={() => setIsFavorite(!isFavorite)}
            className={cn(
              "p-4 rounded-2xl border transition-all self-center md:self-end",
              isFavorite ? "bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-600/20" : "bg-white/5 border-white/10 text-gray-500"
            )}
          >
             <Star className={cn("w-5 h-5", isFavorite && "fill-current")} />
          </button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Controls Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-3xl shadow-2xl">
              <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/5">
                <Zap className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-black uppercase tracking-[0.3em] italic">Parameters</h3>
              </div>

              <div className="space-y-10">
                {/* Keywords Input */}
                <div>
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] block mb-4 italic">Content Keywords</label>
                   <textarea 
                     value={keywords}
                     onChange={(e) => setKeywords(e.target.value)}
                     className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-cyan-500 outline-none transition-all shadow-inner h-32 resize-none"
                     placeholder="e.g. fitness motivation gym workout"
                   />
                </div>

                {/* Platform Selector */}
                <div>
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] block mb-4 italic">Target Ecosystem</label>
                   <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "all", icon: <Globe className="w-3 h-3" /> },
                        { id: "instagram", icon: <Camera className="w-3 h-3" /> },
                        { id: "youtube", icon: <Play className="w-3 h-3" /> },
                        { id: "twitter", icon: <MessageSquare className="w-3 h-3" /> },
                        { id: "tiktok", icon: <Smartphone className="w-3 h-3" /> },
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setPlatform(p.id as Platform)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                            platform === p.id 
                              ? "bg-cyan-600 border-cyan-500 text-white" 
                              : "border-white/5 bg-white/5 text-gray-500 hover:bg-white/10"
                          )}
                        >
                           {p.icon}
                           {p.id}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Count Slider */}
                <div>
                   <div className="flex justify-between items-center mb-4">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] italic">Tag Density</label>
                      <span className="text-cyan-400 font-bold">{count}</span>
                   </div>
                   <input 
                     type="range"
                     min={5}
                     max={30}
                     value={count}
                     onChange={(e) => setCount(parseInt(e.target.value))}
                     className="w-full accent-cyan-500 h-1 bg-white/10 rounded-full appearance-none"
                   />
                </div>

                {/* Trending Toggle */}
                <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reach Mix</span>
                      <span className="text-[9px] font-medium text-zinc-600 uppercase">Include broad discovery tags</span>
                   </div>
                   <button 
                     onClick={() => setMixTrending(!mixTrending)}
                     className={cn(
                       "w-12 h-6 rounded-full relative transition-all duration-300",
                       mixTrending ? "bg-cyan-600" : "bg-white/5 border border-white/10"
                     )}
                   >
                      <motion.div 
                        className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-lg"
                        animate={{ x: mixTrending ? 24 : 0 }}
                      />
                   </button>
                </div>

                <button
                  onClick={generateHashtags}
                  disabled={isGenerating || !keywords.trim()}
                  className="w-full py-5 bg-white text-black rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 shadow-2xl disabled:opacity-50"
                >
                  {isGenerating ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Generate Hashtags
                </button>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8">
             <AnimatePresence mode="wait">
                {isGenerating ? (
                   <motion.div
                     key="loading"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12"
                   >
                      <div className="relative w-24 h-24 mb-8">
                         <div className="absolute inset-0 rounded-full border-4 border-cyan-500/10" />
                         <motion.div 
                           className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent"
                           animate={{ rotate: 360 }}
                           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                         />
                         <Hash className="absolute inset-0 m-auto w-8 h-8 text-cyan-400 animate-pulse" />
                      </div>
                      <h4 className="text-2xl font-bold mb-2">Building your hashtag set...</h4>
                      <p className="text-gray-500 uppercase text-[10px] tracking-widest font-black">Optimizing for {platform}</p>
                   </motion.div>
                ) : results ? (
                   <motion.div
                     key="results"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="space-y-8"
                   >
                      <div className="flex items-center justify-between px-4">
                         <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 italic">Analysis Complete</span>
                         </div>
                         <button 
                           onClick={copyAll}
                           className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors"
                         >
                            {isCopiedAll ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {isCopiedAll ? "All Copied" : "Copy All Results"}
                         </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {results.map((group, idx) => (
                           <motion.div
                             key={group.category}
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: idx * 0.1 }}
                             className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8"
                           >
                              <div className="flex items-center gap-3 mb-6">
                                 <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
                                    {group.icon}
                                 </div>
                                 <h4 className="font-black text-sm uppercase tracking-widest italic">{group.category}</h4>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                 {group.tags.map(tag => (
                                   <button
                                     key={tag}
                                     onClick={() => copyToClipboard(tag)}
                                     className={cn(
                                       "px-4 py-2 rounded-xl text-[10px] font-bold transition-all border",
                                       copiedTag === tag 
                                         ? "bg-cyan-600 border-cyan-500 text-white" 
                                         : "bg-white/5 border-white/5 text-gray-400 hover:border-white/20 hover:text-white"
                                     )}
                                   >
                                      #{tag}
                                   </button>
                                 ))}
                              </div>
                           </motion.div>
                         ))}
                      </div>

                      {/* Summary Card */}
                      <div className="bg-gradient-to-br from-cyan-600/10 to-purple-600/10 border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-between">
                         <div className="flex items-start gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl">
                               <Info className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                               <h5 className="font-bold text-sm mb-1 uppercase italic tracking-tight">Reach Potential: HIGH</h5>
                               <p className="text-[10px] text-gray-500 leading-relaxed uppercase font-medium max-w-md">
                                  This mix of trending and niche tags provides optimal discovery while targeting high-intent communities.
                               </p>
                            </div>
                         </div>
                         <button 
                           onClick={() => setResults(null)}
                           className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-gray-500 hover:text-white"
                         >
                            <RotateCcw className="w-5 h-5" />
                         </button>
                      </div>
                   </motion.div>
                ) : (
                   <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] p-12 text-center">
                      <div className="p-8 rounded-full bg-white/5 mb-6">
                         <Sparkles className="w-12 h-12 text-zinc-700" />
                      </div>
                      <h4 className="text-2xl font-bold mb-2">Ready to Trend?</h4>
                      <p className="text-zinc-600 uppercase text-[10px] tracking-[0.2em] font-black max-w-xs">
                         Enter your content keywords on the left to generate high-conversion hashtags.
                      </p>
                   </div>
                )}
             </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Atmospheric Background */}
      <div className="fixed top-0 right-0 -z-10 w-[700px] h-[700px] bg-cyan-600/[0.04] blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-purple-600/[0.03] blur-[150px] rounded-full pointer-events-none animate-pulse" />
    </div>
  );
}
