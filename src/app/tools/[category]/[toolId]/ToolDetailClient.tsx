"use client";

import { useState, useEffect } from "react";
import { FAVORITES_CHANGED_EVENT } from "@/lib/favorites";
import { Tool, Category, ICON_MAP } from "@/data/tools";
import { ToolCard } from "@/components/ui/ToolCard";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { ImageGeneratorTool } from "@/components/tool/ImageGeneratorTool";
import { LogoGeneratorTool } from "@/components/tool/LogoGeneratorTool";
import { PasswordGenerator } from "@/components/tool/PasswordGenerator";
import { UnitConverter } from "@/components/tool/UnitConverter";
import { PaletteGenerator } from "@/components/tool/PaletteGenerator";
import { JsonFormatter } from "@/components/tool/JsonFormatter";
import { BackgroundRemover } from "@/components/tool/BackgroundRemover";
import { BulkImageCompressor } from "@/components/tool/BulkImageCompressor";
import { ImageResizerCropper } from "@/components/tool/ImageResizerCropper";
import { ImageFormatConverter } from "@/components/tool/ImageFormatConverter";
import { PhotoRestorer } from "@/components/tool/PhotoRestorer";
import { WatermarkRemover } from "@/components/tool/WatermarkRemover";
import { CollageMaker } from "@/components/tool/CollageMaker";
import { MinecraftSkinMaker } from "@/components/tool/MinecraftSkinMaker";
import { VocalRemover } from "@/components/tool/VocalRemover";
import { StemSplitter } from "@/components/tool/StemSplitter";
import { NoiseRemover } from "@/components/tool/NoiseRemover";
import { VoiceChanger } from "@/components/tool/VoiceChanger";
import { TextToSpeech } from "@/components/tool/TextToSpeech";
import { SpeechToText } from "@/components/tool/SpeechToText";
import VideoBackgroundRemover from "@/components/tool/VideoBackgroundRemover";
import { AiChatTool } from "@/components/tool/AiChatTool";
import AiWriter from "@/components/tool/AiWriter";
import PdfMerger from "@/components/tool/PdfMerger";
import PdfSplitter from "@/components/tool/PdfSplitter";
import PdfCompressor from "@/components/tool/PdfCompressor";
import PdfToImage from "@/components/tool/PdfToImage";
import ImgToPdf from "@/components/tool/ImgToPdf";
import PdfToWord from "@/components/tool/PdfToWord";
import OcrExtractor from "@/components/tool/OcrExtractor";
import Link from "next/link";
import { 
  Upload, 
  Play,
  CheckCircle2,
  Sparkles,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Script from "next/script";
import { ProtectedTool } from "@/components/tool/ProtectedTool";
import axios from "axios";
import { ToolReliabilityNotice } from "@/components/tool/ToolReliability";
import { isToolUnavailable } from "@/lib/tool-reliability";
import { ToolWorkspaceHeader } from "@/components/tool/ToolWorkspaceFrame";
import { CATEGORY_ANIM_STYLES } from "@/lib/category-styles";
import { ToolQualitySelector } from "@/components/tool/ToolQualitySelector";
import { isQualityUpgradeableTool } from "@/lib/tool-quality-policy";
import { PRICING_CONFIG } from "@/config/pricing";
import { SITE_URL } from "@/lib/seo";

interface ToolDetailClientProps {
  tool: Tool;
  category: Category;
  relatedTools: Tool[];
  categoryId: string;
  toolId: string;
}

export function ToolDetailClient({ tool, category, relatedTools, categoryId, toolId }: ToolDetailClientProps) {
  const endpoint = `/api/tools/${categoryId}/${toolId.replace('img-', '').replace('vid-', '').replace('pdf-', '')}`;
  const { processFile, isProcessing, progress, error, result, reset } = useToolProcessor(endpoint);
  
  const [fileName, setFileName] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [showShareToast, setShowShareToast] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axios.get('/api/user/favorites');
        setIsFavorited(response.data.favorites.includes(tool.id));
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
      }
    };
    fetchFavorites();
  }, [tool.id]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  const handleFavorite = async () => {
    const previousState = isFavorited;
    setIsFavorited(!isFavorited);
    
    try {
      await axios.post('/api/user/favorites', {
        toolId: tool.id,
        action: previousState ? 'remove' : 'add'
      }).then((response) => {
        setIsFavorited(response.data.isFavorited === true);
        window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED_EVENT, {
          detail: { favorites: response.data.favorites },
        }));
      });
    } catch (err) {
      console.error("Failed to update favorite:", err);
      setIsFavorited(previousState);
    }
  };

  const Icon = ICON_MAP[tool.icon] || Sparkles;
  const unavailable = isToolUnavailable(tool.id);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    await processFile(file);
  };

  const handleGenerate = async () => {
    if (!textInput.trim()) return;
    reset();
    const blob = new Blob([textInput], { type: 'text/plain' });
    const file = new File([blob], "prompt.txt", { type: 'text/plain' });
    await processFile(file);
  };

  const displayResult = result && !tool.requiresFileUpload
    ? `data:text/plain;charset=utf-8,${encodeURIComponent(result)}`
    : result;

  const isSpecialTool = [
    'ai-img-gen', 'ai-logo', 'ai-writer', 'ai-chat',
    'productivity-passgen', 'productivity-units', 'productivity-palette', 'productivity-json',
    'image-eraser', 'image-compressor', 'image-resizer', 'image-converter', 'image-restorer', 'watermark-remover', 'image-collage', 'image-minecraft-skin',
    'audio-vocal-remover', 'audio-stem-splitter', 'audio-noise-remover', 'audio-voice-changer', 'audio-tts', 'audio-stt',
    'pdf-merger', 'pdf-splitter', 'pdf-compressor', 'pdf-to-img', 'pdf-img-to-pdf', 'pdf-to-word', 'pdf-ocr',
    'video-bg-remover'
  ].includes(tool.id);

  // Structured Data for Google (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": tool.name,
    "description": tool.description,
    "url": `${SITE_URL}${tool.href}`,
    "applicationCategory": categoryId === "productivity" ? "UtilitiesApplication" : categoryId === "ai" ? "BusinessApplication" : "MultimediaApplication",
    "operatingSystem": "Any operating system with a modern web browser",
    "browserRequirements": "Requires JavaScript and a modern web browser",
    "isAccessibleForFree": !tool.isProTool,
    "offers": {
      "@type": "Offer",
      "price": tool.isProTool ? PRICING_CONFIG.PRO_PLAN.USD.toString() : "0",
      "priceCurrency": "USD"
    }
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Tools", "item": `${SITE_URL}/tools` },
      { "@type": "ListItem", "position": 2, "name": category.name, "item": `${SITE_URL}/category/${category.id}` },
      { "@type": "ListItem", "position": 3, "name": tool.name, "item": `${SITE_URL}${tool.href}` },
    ],
  };

  const PageContent = (
    <div className="mx-auto max-w-[1440px] space-y-6 overflow-x-hidden px-3 pb-24 pt-24 sm:px-5 sm:pt-24 md:space-y-8 md:px-8 md:pb-28 md:pt-28">
      {tool.indexable !== false && (
        <>
          <Script id={`tool-schema-${tool.id}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <Script id={`tool-breadcrumbs-${tool.id}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        </>
      )}
      {categoryId === 'pdf' && (
        <Script 
          src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
          strategy="beforeInteractive"
          onLoad={() => {
            if (typeof window !== 'undefined') {
              const pdfWindow = window as Window & {
                pdfjsLib?: { GlobalWorkerOptions: { workerSrc: string } };
              };
              if (pdfWindow.pdfjsLib) {
                pdfWindow.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
              }
            }
          }}
        />
      )}
      {tool.id !== "ai-chat" && (
        <ToolWorkspaceHeader
          name={tool.name}
          description={tool.description}
          categoryName={category.name}
          categoryId={categoryId}
          toolId={tool.id}
          icon={Icon}
          isPro={Boolean(tool.pro)}
          isFavorited={isFavorited}
          showShareToast={showShareToast}
          onShare={handleShare}
          onFavorite={handleFavorite}
        />
      )}

      {!unavailable && <ToolReliabilityNotice toolId={tool.id} />}

      {!tool.isProTool && isQualityUpgradeableTool(tool.id) && (
        <ToolQualitySelector toolId={tool.id} />
      )}

       <div className="grid grid-cols-1 gap-5 xl:grid-cols-3 xl:gap-8">
          <div className={cn(isSpecialTool ? "xl:col-span-3" : "xl:col-span-2", "min-w-0 space-y-5 md:space-y-7")}>
             {unavailable ? (() => {
                const isGold = tool.pro || tool.isProTool;
                const animStyle = CATEGORY_ANIM_STYLES[categoryId] || CATEGORY_ANIM_STYLES.pdf;

                return (
                <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-white/5 bg-[#0b0c12] p-10 sm:p-16 lg:p-24 flex flex-col items-center justify-center text-center shadow-2xl group">
                  {/* Animated Ambient Background */}
                  <div className={cn("absolute inset-0 blur-[100px] opacity-40 animate-pulse transition-all duration-1000", isGold ? "bg-amber-500/20" : animStyle.aura)} />
                  <div className={cn("absolute inset-[-50%] animate-[spin_8s_linear_infinite] opacity-30", isGold ? "bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.3)_25%,transparent_50%)]" : animStyle.spinIdle)} />
                  <div className="absolute inset-0 bg-[#0b0c12]/80 backdrop-blur-3xl" />
                  <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.03)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shine_4s_linear_infinite]" />
                  
                  <div className="relative z-10 flex flex-col items-center max-w-lg space-y-10">
                    <div className="flex size-24 sm:size-32 items-center justify-center rounded-[2.5rem] bg-[#0b0c12] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group-hover:scale-110 transition-transform duration-700">
                      <div className={cn("absolute inset-0 blur-xl animate-pulse", isGold ? "bg-amber-500/30" : animStyle.aura)} />
                      <div className={cn("absolute inset-[-100%] animate-[spin_3s_linear_infinite]", isGold ? "bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.6)_25%,transparent_50%)]" : animStyle.spinHover)} />
                      <div className="absolute inset-[2px] rounded-[calc(2.5rem-2px)] bg-[#0b0c12] flex items-center justify-center z-10">
                        <Icon size={56} className={cn("relative z-20 transition-all duration-500", isGold ? "text-amber-300 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]" : animStyle.iconGlow)} />
                      </div>
                    </div>
                    
                    <div className="space-y-6 flex flex-col items-center">
                      <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-opacity-10 backdrop-blur-md shadow-lg text-[10px] sm:text-xs font-black uppercase tracking-[0.4em]", isGold ? "border-amber-400/30 bg-amber-400/10 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]" : animStyle.badge)}>
                        <Sparkles size={14} className={isGold ? "text-amber-400" : "opacity-80"} />
                        In Development
                      </div>
                      <h2 className={cn("text-5xl sm:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-[length:200%_100%] animate-[shine_4s_linear_infinite]", isGold ? "bg-[linear-gradient(110deg,#fde68a_0%,#ffffff_45%,#fbbf24_55%,#ffffff_100%)] drop-shadow-[0_2px_15px_rgba(245,158,11,0.3)]" : animStyle.textGrad)}>
                        Coming Soon
                      </h2>
                      <p className="text-sm sm:text-base font-medium leading-relaxed text-zinc-400 px-4">
                        We are currently engineering the high-performance backend for this tool. It will be available to you very soon.
                      </p>
                    </div>

                    <div className="pt-6 w-full sm:w-auto">
                      <Link href="/tools" className={cn("relative overflow-hidden flex min-h-14 items-center justify-center rounded-2xl px-12 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 border", isGold ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-amber-950 shadow-[0_0_30px_rgba(245,158,11,0.4)] border-amber-300/50" : animStyle.buttonGrad)}>
                        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shine_2s_linear_infinite]" />
                        <span className="relative z-10 flex items-center gap-3">Explore Live Tools <Play size={14} className="fill-current" /></span>
                      </Link>
                    </div>
                  </div>
                </div>
                );
             })() : tool.id === 'ai-img-gen' ? (
                <ImageGeneratorTool />
             ) : tool.id === 'ai-logo' ? (
                <LogoGeneratorTool />
             ) : tool.id === 'ai-chat' ? (
                <AiChatTool />
             ) : tool.id === 'ai-writer' ? (
                <AiWriter />
             ) : tool.id === 'productivity-passgen' ? (
                <PasswordGenerator />
             ) : tool.id === 'productivity-units' ? (
                <UnitConverter />
             ) : tool.id === 'productivity-palette' ? (
                <PaletteGenerator />
             ) : tool.id === 'productivity-json' ? (
                <JsonFormatter />
             ) : tool.id === 'image-eraser' ? (
                <BackgroundRemover />
             ) : tool.id === 'image-compressor' ? (
                <BulkImageCompressor />
             ) : tool.id === 'image-resizer' ? (
                <ImageResizerCropper />
             ) : tool.id === 'image-converter' ? (
                <ImageFormatConverter />
             ) : tool.id === 'image-restorer' ? (
                <PhotoRestorer />
             ) : tool.id === 'watermark-remover' ? (
                <WatermarkRemover />
             ) : tool.id === 'image-collage' ? (
                <CollageMaker />
             ) : tool.id === 'image-minecraft-skin' ? (
                <MinecraftSkinMaker />
             ) : tool.id === 'audio-vocal-remover' ? (
                <VocalRemover />
             ) : tool.id === 'audio-stem-splitter' ? (
                <StemSplitter />
             ) : tool.id === 'audio-noise-remover' ? (
                <NoiseRemover />
             ) : tool.id === 'audio-voice-changer' ? (
                <VoiceChanger />
             ) : tool.id === 'audio-tts' ? (
                <TextToSpeech />
             ) : tool.id === 'audio-stt' ? (
                <SpeechToText />
             ) : tool.id === 'video-bg-remover' ? (
                <VideoBackgroundRemover />
             ) : tool.id === 'pdf-merger' ? (
                <PdfMerger />
             ) : tool.id === 'pdf-splitter' ? (
                <PdfSplitter />
             ) : tool.id === 'pdf-compressor' ? (
                <PdfCompressor />
             ) : tool.id === 'pdf-to-img' ? (
                <PdfToImage />
             ) : tool.id === 'pdf-img-to-pdf' ? (
                <ImgToPdf />
             ) : tool.id === 'pdf-to-word' ? (
                <PdfToWord />
             ) : tool.id === 'pdf-ocr' ? (
                <OcrExtractor />
             ) : (
                <div className="space-y-5">
                   <div className="relative group">
                      <div className={cn(
                        "min-h-[380px] rounded-lg border border-white/10 bg-zinc-950/65 p-5 shadow-xl transition-all duration-300 sm:min-h-[450px] sm:p-8",
                        "group-hover:border-white/20",
                        tool.requiresFileUpload && "border-dashed"
                      )}>
                         <AnimatePresence mode="wait">
                            {!isProcessing && !result && !error && (
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full h-full flex flex-col items-center justify-center text-center space-y-8">
                                 {tool.requiresFileUpload ? (
                                   fileName ? (
                                     <div className="space-y-6">
                                        <div className="mx-auto flex size-16 items-center justify-center rounded-lg border border-cyan-300/15 bg-cyan-300/[0.05] text-cyan-200"><Play size={26} /></div>
                                        <p className="break-all text-xl font-bold text-white">{fileName}</p>
                                        <button onClick={() => setFileName(null)} className="min-h-11 rounded-md px-4 text-xs font-bold text-zinc-500 transition hover:bg-white/5 hover:text-white">Remove file</button>
                                     </div>
                                   ) : (
                                     <>
                                       <div className="flex size-16 items-center justify-center rounded-lg border border-cyan-300/15 bg-cyan-300/[0.05] text-cyan-200 shadow-lg transition-all group-hover:border-cyan-300/30"><Upload size={28} /></div>
                                       <div className="space-y-2">
                                         <p className="text-center text-xl font-bold text-white">Choose a file</p>
                                         <p className="text-center text-sm font-medium text-zinc-500">Drop it here or browse. Supported: {tool.acceptedFileTypes?.join(', ') || 'Various formats'}</p>
                                       </div>
                                       <label className="premium-gradient flex min-h-12 cursor-pointer items-center justify-center rounded-md px-6 text-xs font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98]">
                                         Select Files
                                         <input type="file" className="hidden" accept={tool.acceptedFileTypes?.join(',')} onChange={handleFileChange} />
                                       </label>
                                     </>
                                   )
                                 ) : (
                                   <div className="w-full space-y-8 text-left">
                                     <div className="relative">
                                       <textarea 
                                         className="min-h-[260px] w-full resize-none rounded-lg border border-white/10 bg-zinc-900/50 p-5 text-base text-white shadow-inner outline-none transition-all placeholder-zinc-700 focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-300/5 sm:min-h-[300px] sm:p-7 sm:text-lg"
                                         placeholder={tool.placeholderPrompt || "Enter your instructions here..."}
                                         value={textInput}
                                         onChange={(e) => setTextInput(e.target.value)}
                                       />
                                       <div className="static mt-4 sm:absolute sm:bottom-8 sm:right-8">
                                         <button onClick={handleGenerate} className="premium-gradient flex min-h-12 w-full items-center justify-center gap-2 rounded-md px-6 text-xs font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98] sm:w-auto">
                                           <Sparkles size={18} /> Generate
                                         </button>
                                       </div>
                                     </div>
                                   </div>
                                 )}
                              </motion.div>
                            )}
                            {isProcessing && (
                              <div className="w-full h-full flex flex-col items-center justify-center space-y-10 py-12">
                                 <div className="relative w-40 h-40">
                                    <svg className="w-full h-full transform -rotate-90">
                                       <circle cx="80" cy="80" r="75" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-zinc-800" />
                                       <circle cx="80" cy="80" r="75" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-accent-purple transition-all duration-300" style={{ strokeDasharray: 471, strokeDashoffset: 471 - (471 * progress) / 100 }} />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center"><span className="text-3xl font-black text-white">{progress}%</span></div>
                                 </div>
                              </div>
                            )}
                            {error && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex min-h-[300px] flex-col items-center justify-center gap-5 rounded-lg border border-red-500/20 bg-red-500/[0.04] p-6 text-center"
                              >
                                <div className="flex size-14 items-center justify-center rounded-md border border-red-400/20 bg-red-500/10 text-red-200">
                                  <Sparkles size={28} />
                                </div>
                                <div className="max-w-md space-y-2">
                                  <p className="text-xl font-black tracking-tight text-white">Processing failed</p>
                                  <p className="text-sm font-medium leading-relaxed text-zinc-400">{error}</p>
                                </div>
                                <button onClick={reset} className="min-h-12 rounded-md bg-white px-6 text-xs font-bold text-black transition-all hover:bg-zinc-200">
                                  Try again
                                </button>
                              </motion.div>
                            )}
                            {result && (
                               <div className="flex flex-col items-stretch justify-between gap-5 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.04] p-5 sm:flex-row sm:items-center sm:p-6">
                                  <div className="flex items-center gap-4 text-left">
                                     <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-emerald-400/10 text-emerald-300"><CheckCircle2 size={26} /></div>
                                     <div>
                                        <p className="text-xl font-bold tracking-tight text-white">Ready to download</p>
                                        <p className="text-zinc-500 font-medium">Your content has been processed and is ready.</p>
                                     </div>
                                  </div>
                                  <a href={displayResult || "#"} download={`exismic-${tool.id}-result.txt`} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-400 px-6 text-xs font-bold text-black transition-all hover:bg-emerald-300 sm:w-auto">
                                     <Download size={20} /> Download result
                                  </a>
                               </div>
                            )}
                         </AnimatePresence>
                      </div>
                   </div>
                </div>
             )}
          </div>

          {!isSpecialTool && (
            <div className="min-w-0 space-y-5 text-left">
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Related Tools</h3>
                     <div className="flex-1 h-px bg-zinc-800/50 mx-6" />
                  </div>
                  <div className="space-y-3">
                     {relatedTools.map((t, idx) => (
                        <ToolCard key={t.id} {...t} index={idx} className="transition-transform hover:translate-x-0.5" />
                     ))}
                  </div>
               </div>

               <div className="group relative overflow-hidden rounded-lg border border-violet-300/15 bg-violet-300/[0.04] p-5 sm:p-6">
                  <div className="relative z-10 space-y-4">
                     <div className="flex size-11 items-center justify-center rounded-md bg-violet-300/10 text-violet-200">
                        <Sparkles size={20} />
                     </div>
                     <div>
                       <h3 className="text-lg font-bold tracking-tight text-white">Exismic Pro</h3>
                       <p className="mt-1 text-xs font-medium leading-relaxed text-zinc-500">Priority processing, larger batches, and premium creative controls.</p>
                     </div>
                     <Link href="/pro" className="flex min-h-12 w-full items-center justify-center rounded-md bg-white px-5 text-xs font-bold text-black transition-all hover:bg-zinc-200">
                        Explore Pro
                     </Link>
                  </div>
               </div>
            </div>
          )}
       </div>

    </div>
  );

  return tool.isProTool ? (
    <ProtectedTool>
      {PageContent}
    </ProtectedTool>
  ) : PageContent;
}
