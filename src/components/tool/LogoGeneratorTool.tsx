"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Download, 
  RefreshCw, 
  Image as ImageIcon, 
  Settings2, 
  History,
  Trash2,
  Maximize2,
  Wand2,
  Plus,
  X,
  Palette,
  Laptop,
  Smartphone,
  Eye,
  Check,
  Layout as LayoutIcon,
  Sliders,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useCredits } from "@/hooks/useCredits";

interface LogoGeneratorOptions {
  brandName: string;
  slogan: string;
  concept: string;
  layout: "icon-only" | "text-only" | "combination";
  stylePreset: string;
  backgroundType: "transparent" | "solid-dark" | "solid-light" | "solid-custom" | "gradient" | "pattern";
  colorPalette: string;
  customColors: string;
  bgCustomColor: string;
  tolerance: number;
}

const LOGO_LAYOUTS = [
  { id: "icon-only", name: "Icon Only", desc: "Pure symbol focused" },
  { id: "text-only", name: "Text Only", desc: "Wordmark typography" },
  { id: "combination", name: "Icon + Text", desc: "Balanced brand mark" }
];

const STYLE_PRESETS = [
  { id: "minimal", name: "Minimalist", icon: "📐", suffix: "minimalist vector design, simple clean geometry, negative space, flat vector style, Swiss design style, pure and clean logo concept" },
  { id: "modern", name: "Modern", icon: "✨", suffix: "sleek modern style, high contrast, clean lines, contemporary branding, professional aesthetic, corporate identity" },
  { id: "vintage", name: "Vintage / Retro", icon: "📜", suffix: "vintage retro style, heritage emblem, classic engraving, rustic insignia, hand-drawn vector detailing, stamps style" },
  { id: "tech", name: "Tech / Digital", icon: "💻", suffix: "cutting-edge technology branding, digital microchip elements, circuit geometric lines, cybernetic theme, abstract tech design" },
  { id: "luxury", name: "Luxury / Premium", icon: "👑", suffix: "luxury gold and dark premium brand identity, elegant thin lines, prestigious emblem, high-end high-class sophistication, premium crest" },
  { id: "gaming", name: "Gaming / Mascot", icon: "🎮", suffix: "gaming team esports logo, bold mascot, sharp energetic vector graphics, high contrast, aggressive shapes, cool team badge" },
  { id: "abstract", name: "Abstract", icon: "🌀", suffix: "abstract conceptual symbol, artistic shape, creative double meaning, modern art branding, unique symbol" }
];

const BACKGROUND_TYPES = [
  { id: "transparent", name: "Transparent Grid", desc: "Easy key-out backdrop", suffix: "isolated on a clean, solid, pure white background, flat graphic design, centered" },
  { id: "solid-dark", name: "Solid Dark", desc: "Premium dark backdrop", suffix: "set against a solid, clean, flat charcoal dark gray background, centered" },
  { id: "solid-light", name: "Solid Light", desc: "Clean light backdrop", suffix: "set against a solid, clean, flat neutral light gray background, centered" },
  { id: "solid-custom", name: "Solid Custom Color", desc: "Custom brand backdrop", suffix: "set against a solid, clean, flat custom color background, centered" },
  { id: "gradient", name: "Elegant Gradient", desc: "Dynamic color transition", suffix: "set against a smooth, modern, elegant gradient background with vibrant colorful tones, aesthetic branding presentation" },
  { id: "pattern", name: "Geometric Pattern", desc: "Subtle vector textures", suffix: "featuring a subtle, modern, geometric vector pattern background, brand identity layout" }
];

const COLOR_PALETTES = [
  { id: "sunset", name: "Sunset Glow", colors: ["#ec4899", "#f43f5e", "#eab308"], desc: "Warm pinks, roses, and gold" },
  { id: "tech", name: "Cool Tech", colors: ["#06b6d4", "#3b82f6", "#6366f1"], desc: "Cyan, royal blue, and indigo" },
  { id: "luxury", name: "Luxury Gold", colors: ["#d97706", "#b45309", "#18181b"], desc: "Deep amber gold and rich black" },
  { id: "emerald", name: "Nordic Forest", colors: ["#10b981", "#047857", "#064e3b"], desc: "Emeralds and deep organic greens" },
  { id: "cyber", name: "Neon Cyber", colors: ["#a855f7", "#06b6d4", "#ec4899"], desc: "Fluorescent purple, cyan, and magenta" },
  { id: "nordic", name: "Minimal Mono", colors: ["#ffffff", "#a1a1aa", "#18181b"], desc: "Pure black, whites, and cool grays" }
];

export function LogoGeneratorTool() {
  const { deductCredits, credits, plan, notification } = useCredits();
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [history, setHistory] = useState<{url: string, brandName: string, prompt: string}[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'mockups' | 'history'>('generate');
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [estimatedTime, setEstimatedTime] = useState(6.0);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
  
  // Background removal states
  const [transparentLogoUrl, setTransparentLogoUrl] = useState<string | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgRemovalEnabled, setBgRemovalEnabled] = useState(false);

  // Decimal countdown timer
  useEffect(() => {
    let timer: any;
    if (isGenerating) {
      setEstimatedTime(6.0);
      timer = setInterval(() => {
        setEstimatedTime(prev => {
          if (prev <= 0.6) return 0.5;
          return Number((prev - 0.1).toFixed(1));
        });
      }, 100);
    } else {
      setEstimatedTime(6.0);
    }
    return () => clearInterval(timer);
  }, [isGenerating]);

  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("lumora_logo_history");
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const { register, handleSubmit, setValue, watch } = useForm<LogoGeneratorOptions>({
    defaultValues: {
      brandName: "",
      slogan: "",
      concept: "",
      layout: "combination",
      stylePreset: "minimal",
      backgroundType: "transparent",
      colorPalette: "tech",
      customColors: "",
      bgCustomColor: "",
      tolerance: 30
    }
  });

  const selectedLayout = watch("layout");
  const selectedStyle = watch("stylePreset");
  const selectedBg = watch("backgroundType");
  const selectedPalette = watch("colorPalette");
  const customColors = watch("customColors");
  const brandName = watch("brandName");
  const slogan = watch("slogan");
  const tolerance = watch("tolerance");

  // Re-run background removal when tolerance changes or background removal gets toggled
  useEffect(() => {
    if (results.length > 0 && bgRemovalEnabled) {
      applyBackgroundRemoval(results[0], tolerance);
    } else {
      setTransparentLogoUrl(null);
    }
  }, [results, bgRemovalEnabled, tolerance]);

  const applyBackgroundRemoval = async (imageUrl: string, currentTolerance: number) => {
    setIsRemovingBg(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setTransparentLogoUrl(imageUrl);
          setIsRemovingBg(false);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Auto-detect background color using top-left corner pixel
        const bgR = data[0];
        const bgG = data[1];
        const bgB = data[2];

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          
          // Color distance formula
          const dist = Math.sqrt(
            Math.pow(r - bgR, 2) + 
            Math.pow(g - bgG, 2) + 
            Math.pow(b - bgB, 2)
          );

          if (dist < currentTolerance) {
            data[i+3] = 0; // set alpha to fully transparent
          }
        }
        ctx.putImageData(imgData, 0, 0);
        setTransparentLogoUrl(canvas.toDataURL("image/png"));
        setIsRemovingBg(false);
      };
      img.onerror = () => {
        setIsRemovingBg(false);
      };
    } catch (e) {
      console.error(e);
      setIsRemovingBg(false);
    }
  };

  const onSubmit = async (data: LogoGeneratorOptions) => {
    if (!data.concept.trim()) {
      setError("Please describe your logo concept first.");
      return;
    }

    const cost = 10;
    if (credits < cost) {
      setError(
        <div className="flex flex-col gap-3">
          <p>Insufficient credits. You need {cost} credits but only have {credits}.</p>
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="w-fit px-4 py-2 rounded-lg bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
          >
            Upgrade Now
          </button>
        </div>
      );
      return;
    }

    setIsGenerating(true);
    setError(null);
    setEnhancedPrompt(null);
    setBgRemovalEnabled(false); // Reset bg removal on new submit

    try {
      // 1. Build Layout Core
      let layoutText = "";
      if (data.layout === "icon-only") {
        layoutText = "minimalist graphic vector icon logo, clean brand emblem, no lettering, no typography, single central mark";
      } else if (data.layout === "text-only") {
        layoutText = `typographic wordmark logo displaying the letters "${data.brandName || "Brand"}", clean custom lettering design, modern logo typography`;
      } else {
        layoutText = `combination mark logo featuring a clean vector icon symbol accompanied by the typographic lettering "${data.brandName || "Brand"}", balanced layout`;
      }

      // 2. Style Preset
      const styleObj = STYLE_PRESETS.find(s => s.id === data.stylePreset);
      const styleText = styleObj ? styleObj.suffix : "modern clean style";

      // 3. Background type
      let bgText = "";
      if (data.backgroundType === "solid-custom" && data.bgCustomColor.trim()) {
        bgText = `set against a solid, clean, flat ${data.bgCustomColor.trim()} background, centered`;
      } else {
        const bgObj = BACKGROUND_TYPES.find(b => b.id === data.backgroundType);
        bgText = bgObj ? bgObj.suffix : "solid white background";
      }

      // 4. Color Palette
      let colorText = "";
      if (data.customColors.trim()) {
        colorText = `utilizing a professional brand color scheme of ${data.customColors.trim()}`;
      } else {
        const paletteObj = COLOR_PALETTES.find(p => p.id === data.colorPalette);
        colorText = paletteObj ? `utilizing a professional cohesive palette matching ${paletteObj.name} style` : "";
      }

      // 5. Final enhanced prompt construction
      const finalPrompt = `A professional, clean, minimalist ${layoutText}, depicting: ${data.concept.trim()}, ${styleText}, ${colorText}, ${bgText}, vector art style, clean lines, centered composition, high quality, professional brand identity, no photo, no realistic render, no complex messy shading, no extra text, scalable design.`;

      const resp = await axios.post("/api/tools/ai/image-generate", {
        prompt: finalPrompt,
        width: 1024,
        height: 1024,
        steps: 4,
        guidance: 3.5,
        n: 1
      });

      if (resp.data.success) {
        const newUrl = resp.data.imageUrl;
        setResults([newUrl]);
        setEnhancedPrompt(resp.data.enhancedPrompt || null);
        
        // Auto-enable transparent background key-out on transparent layouts
        if (data.backgroundType === "transparent") {
          setBgRemovalEnabled(true);
        }

        const newHistoryItem = { 
          url: newUrl, 
          brandName: data.brandName || "Untitled Logo",
          prompt: finalPrompt
        };

        setHistory(prev => {
          const updated = [newHistoryItem, ...prev];
          localStorage.setItem("lumora_logo_history", JSON.stringify(updated));
          return updated;
        });
        
        toast.success("Logo generated successfully!");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to generate logo. Please try again.";
      const needsUpgrade = err.response?.data?.needsUpgrade;
      
      setError(
        needsUpgrade ? (
          <div className="flex flex-col gap-3">
            <p>{errorMsg}</p>
            <button 
              onClick={() => window.location.href = '/pricing'}
              className="w-fit px-4 py-2 rounded-lg bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
            >
              View Pro Plans
            </button>
          </div>
        ) : errorMsg
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string, transparent = false) => {
    const targetUrl = (transparent && transparentLogoUrl) ? transparentLogoUrl : url;
    try {
      const response = await fetch(targetUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${brandName || "brand"}-logo-${transparent ? "transparent-" : ""}gen.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Download started successfully!");
    } catch (err) {
      console.error("Download failed", err);
      toast.error("Download failed.");
    }
  };

  const toast = {
    success: (msg: string) => {
      // Handled via the useCredits notification or window alerts fallback
      alert(`[SUCCESS] ${msg}`);
    },
    error: (msg: string) => {
      alert(`[ERROR] ${msg}`);
    }
  };

  const logoToRender = transparentLogoUrl || (results.length > 0 ? results[0] : null);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 min-h-[700px] text-left selection:bg-cyan-500/30">
      
      {/* 1. Specialized Logo Configuration Panel (Left) */}
      <div className="xl:col-span-1 space-y-6 glass-dark p-6 md:p-8 rounded-[2.5rem] border border-white/5 flex flex-col h-fit sticky top-32">
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
           <Settings2 className="text-zinc-500" size={18} />
           <span className="text-xs font-black uppercase tracking-widest text-zinc-100">Logo Studio Config</span>
        </div>

        <div className="space-y-5 custom-scrollbar max-h-[70vh] pr-1 overflow-y-auto">
          {/* Brand Name & Slogan */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Brand Identity</label>
            <input 
              type="text"
              {...register("brandName")}
              placeholder="Brand Name (e.g. Lumora)"
              className="w-full bg-[#07070a] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-700 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
            <input 
              type="text"
              {...register("slogan")}
              placeholder="Slogan / Tagline (e.g. AI-driven OS)"
              className="w-full bg-[#07070a] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-700 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
          </div>

          <div className="h-px bg-white/5" />

          {/* Logo Layout Selectors */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Layout Option</label>
            <div className="flex flex-col gap-2">
              {LOGO_LAYOUTS.map(lay => (
                <button
                  key={lay.id}
                  type="button"
                  onClick={() => setValue("layout", lay.id as any)}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all flex justify-between items-center",
                    selectedLayout === lay.id 
                      ? "bg-cyan-500/15 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]" 
                      : "bg-[#07070a] border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-wide">{lay.name}</span>
                    <span className="text-[8px] text-zinc-500 font-medium">{lay.desc}</span>
                  </div>
                  {selectedLayout === lay.id && <Check size={12} className="text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Style Presets Grid */}
          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Style Presets</label>
             <div className="grid grid-cols-2 gap-2">
                {STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setValue("stylePreset", preset.id)}
                    className={cn(
                      "p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all truncate leading-tight group",
                      selectedStyle === preset.id 
                        ? "bg-purple-500/15 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                        : "bg-[#07070a] border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
                    )}
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">{preset.icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-wider">{preset.name}</span>
                  </button>
                ))}
             </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Color Palettes Picker */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Color Palette</label>
              <Palette size={12} className="text-zinc-500" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {COLOR_PALETTES.map(pal => (
                <button
                  key={pal.id}
                  type="button"
                  onClick={() => { setValue("colorPalette", pal.id); setValue("customColors", ""); }}
                  className={cn(
                    "p-2.5 rounded-xl border text-left flex flex-col gap-2 transition-all justify-between",
                    selectedPalette === pal.id && !customColors
                      ? "bg-cyan-500/15 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                      : "bg-[#07070a] border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
                  )}
                >
                  <span className="text-[9px] font-black uppercase tracking-wide leading-none">{pal.name}</span>
                  <div className="flex gap-1">
                    {pal.colors.map((c, i) => (
                      <div key={i} className="w-3 h-3 rounded-full border border-black/50" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Custom colors */}
            <input 
              type="text"
              {...register("customColors")}
              placeholder="Or type custom colors (e.g. Gold, Midnight Blue)"
              className="w-full bg-[#07070a] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-700 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all mt-1"
            />
          </div>

          <div className="h-px bg-white/5" />

          {/* Background Styling */}
          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Logo Background</label>
             <div className="grid grid-cols-1 gap-2">
                {BACKGROUND_TYPES.map(bg => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setValue("backgroundType", bg.id as any)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all flex items-center justify-between",
                      selectedBg === bg.id 
                        ? "bg-purple-500/15 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                        : "bg-[#07070a] border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-wide">{bg.name}</span>
                      <span className="text-[8px] text-zinc-500 font-medium">{bg.desc}</span>
                    </div>
                    {selectedBg === bg.id && <Check size={12} className="text-purple-400" />}
                  </button>
                ))}
             </div>
             {selectedBg === "solid-custom" && (
                <input 
                  type="text"
                  {...register("bgCustomColor")}
                  placeholder="Custom background color (e.g. Deep Blue, #ff5722)"
                  className="w-full bg-[#07070a] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-700 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all mt-1"
                />
             )}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
           <span className="text-[8px] font-black tracking-widest text-zinc-500 uppercase">Lumora Brand Engine v2</span>
           <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
        </div>
      </div>

      {/* 2. Main Studio Panel (Right / 3/4 Width) */}
      <div className="xl:col-span-3 space-y-6 flex flex-col h-full">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
           {/* Concept Input Glass Card */}
           <div className="relative group p-1 bg-gradient-to-b from-cyan-500/20 to-transparent rounded-[2.5rem]">
              <div className="bg-[#050507]/90 rounded-[2.3rem] overflow-hidden border border-white/5 shadow-2xl backdrop-blur-3xl">
                <textarea 
                  {...register("concept")}
                  placeholder="Describe your logo concept in detail (e.g. 'A sleek geometric falcon in mid-flight', 'A coffee mug shaped like a house', 'A modern letter G composed of gradients')..."
                  className="w-full min-h-[140px] p-8 pb-16 bg-transparent text-lg font-medium text-white placeholder:text-zinc-700 focus:outline-none transition-all resize-none"
                />
                
                {/* Footer inputs toolbar */}
                <div className="absolute bottom-4 left-8 right-8 flex items-center justify-between border-t border-white/5 pt-3">
                   <div className="flex items-center gap-4">
                      <button 
                        type="button"
                        onClick={() => {
                          const samples = [
                            "A sleek geometric fox head made of intersecting cyan and purple shapes.",
                            "Minimalist coffee bean sprouting leaves, natural and organic identity.",
                            "A futuristic letter 'A' with sharp cybernetic circuit elements.",
                            "Luxury abstract crest depicting a golden wave and dark royal shield.",
                            "Minimalist line-art cat silhouette curling around a small moon.",
                            "Tech logo representing three layered glass blocks floating in isometric grid."
                          ];
                          setValue("concept", samples[Math.floor(Math.random() * samples.length)]);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                      >
                         Surprise Idea
                      </button>
                      <span className="text-[8px] font-bold text-zinc-650 uppercase tracking-widest">
                         {watch("concept").length} Chars
                      </span>
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-1.5 text-cyan-400">
                         <Wand2 size={11} className="animate-spin-slow" />
                         <span className="text-[9px] font-black uppercase tracking-widest">Logo Enhancer Enabled</span>
                      </div>
                   </div>
                </div>
              </div>
           </div>

           {/* Tab Switchers and Generate Action */}
           <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center bg-[#09090c] border border-white/5 p-1 rounded-2xl gap-1">
                 <button 
                  type="button"
                  onClick={() => setActiveTab('generate')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5",
                    activeTab === 'generate' ? "bg-white/10 text-white shadow" : "text-zinc-500 hover:text-zinc-300"
                  )}
                 >
                    <Eye size={12} /> Studio Canvas
                 </button>
                 <button 
                  type="button"
                  disabled={results.length === 0}
                  onClick={() => setActiveTab('mockups')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed",
                    activeTab === 'mockups' ? "bg-white/10 text-white shadow" : "text-zinc-500 hover:text-zinc-300"
                  )}
                 >
                    <Laptop size={12} /> Mockup Previews
                 </button>
                 <button 
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5",
                    activeTab === 'history' ? "bg-white/10 text-white shadow" : "text-zinc-500 hover:text-zinc-300"
                  )}
                 >
                    <History size={12} /> History
                 </button>
              </div>

              {/* Generate button */}
              <button 
                type="submit"
                disabled={isGenerating}
                className={cn(
                  "px-8 py-4.5 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center gap-4 relative overflow-hidden group",
                  isGenerating ? "opacity-70 scale-95 cursor-not-allowed" : "hover:scale-[1.02] active:scale-95 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                )}
              >
                {/* Hover shine sweep */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                
                 {isGenerating ? (
                   <>
                    <RefreshCw size={14} className="animate-spin text-cyan-400" />
                    Generating Logo...
                   </>
                 ) : (
                   <div className="flex items-center gap-3">
                     <Sparkles size={16} className="text-white animate-pulse" />
                     <div className="flex flex-col items-start gap-0.5">
                       <span className="leading-none">Design Brand Logo</span>
                       <span className="text-[8px] font-bold text-white/50 tracking-widest leading-none">Deduct 10 Credits</span>
                     </div>
                   </div>
                 )}
              </button>
           </div>
        </form>

        {/* 3. Interactive Display Workspace */}
        <div className="flex-1 min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {/* TAB A: Generating Canvas */}
            {activeTab === 'generate' && (
              <motion.div 
                key="canvas"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full"
              >
                {/* Preview Box (2 cols on large screens) */}
                <div className="lg:col-span-2 flex flex-col gap-6 h-full">
                  {error && (
                    <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold animate-shake">
                       {error}
                    </div>
                  )}

                  {/* Main Screen Container */}
                  <div className="flex-1 min-h-[420px] rounded-[2.5rem] glass-dark border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
                     {isGenerating ? (
                       <div className="text-center space-y-6 relative z-10 p-12">
                          <div className="relative w-28 h-28 mx-auto">
                             <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border-t-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                             />
                             <motion.div 
                                animate={{ rotate: -360 }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-2 rounded-full border-b-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                             />
                             <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles size={32} className="text-white animate-pulse" />
                             </div>
                          </div>
                          <div className="space-y-3">
                             <h3 className="text-xl font-black text-white tracking-tight animate-pulse uppercase italic">Compiling Logo Vector...</h3>
                             <div className="flex flex-col items-center gap-1.5">
                                <div className="px-3.5 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-cyan-400">
                                   <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                                   <span>Inference Remaining: ~{estimatedTime}s</span>
                                </div>
                                <p className="text-zinc-650 font-bold text-[8px] uppercase tracking-[0.2em] mt-1">Generating pure crisp shapes on solid backdrop</p>
                             </div>
                          </div>
                       </div>
                     ) : results.length > 0 ? (
                       <div className="w-full h-full p-6 flex flex-col justify-between relative z-10">
                          {/* Logo frame with background togglers */}
                          <div className="flex-1 flex items-center justify-center relative min-h-[300px]">
                            {/* Backdrop rendering based on selection */}
                            <div className={cn(
                              "w-80 h-80 rounded-3xl flex items-center justify-center p-8 transition-all duration-300 relative shadow-inner overflow-hidden",
                              // If bg removal is active, render checkerboard background
                              bgRemovalEnabled 
                                ? "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-[#121216]/20 border border-white/10"
                                : selectedBg === "transparent"
                                ? "bg-white border border-white/10"
                                : selectedBg === "solid-dark"
                                ? "bg-zinc-900 border border-white/5"
                                : selectedBg === "solid-light"
                                ? "bg-zinc-100 border border-zinc-200"
                                : "bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-cyan-900/30 border border-white/5"
                            )}>
                              {isRemovingBg ? (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                                  <RefreshCw size={24} className="animate-spin text-cyan-400" />
                                </div>
                              ) : (
                                <img 
                                   src={logoToRender || ""} 
                                   alt="Generated AI Logo" 
                                   className="max-w-full max-h-full object-contain drop-shadow-xl"
                                />
                              )}
                            </div>
                          </div>

                          {/* Quick details */}
                          <div className="mt-4 border-t border-white/5 pt-4 flex justify-between items-center px-2">
                             <div className="text-left">
                               <p className="text-[10px] font-black uppercase text-white tracking-widest">{brandName || "Brand Name"}</p>
                               <p className="text-[8px] text-zinc-500 uppercase tracking-widest">{slogan || "Brand Slogan"}</p>
                             </div>
                             <div className="text-[8px] font-mono text-zinc-650 uppercase">
                               Model: Flux Schnell Vector
                             </div>
                          </div>
                       </div>
                     ) : (
                       <div className="text-center space-y-6 opacity-30 group-hover:opacity-60 transition-all p-16">
                          <div className="w-20 h-20 rounded-[1.8rem] bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto text-zinc-600">
                             <ImageIcon size={32} />
                          </div>
                          <div className="space-y-1">
                             <h4 className="text-lg font-black text-white uppercase italic tracking-wider">Awaiting brand generation</h4>
                             <p className="text-xs text-zinc-500 font-medium max-w-xs mx-auto">Fill in the logo parameters on the left and describe your concept above to start.</p>
                          </div>
                       </div>
                     )}

                     {/* Visual Neon Accents */}
                     <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/[0.03] blur-[100px] rounded-full -z-10" />
                     <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/[0.03] blur-[100px] rounded-full -z-10" />
                  </div>
                </div>

                {/* Transparency Control & Action Panel (1 col) */}
                <div className="lg:col-span-1 space-y-6 flex flex-col justify-between h-full">
                  <div className="glass-dark border border-white/5 rounded-[2.5rem] p-6 space-y-6 flex-1 flex flex-col justify-start">
                    <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                      <Sliders size={14} className="text-zinc-500" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-200">Refine & Export</span>
                    </div>

                    {results.length > 0 ? (
                      <div className="space-y-5 flex-1 flex flex-col">
                        
                        {/* Background Removal / Transparency Toggle */}
                        <div className="space-y-3.5 bg-white/[0.01] border border-white/5 p-4.5 rounded-2xl">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase text-zinc-300">Remove Background</span>
                              <span className="text-[8px] text-zinc-500 font-medium">ChromaKey out solid colors</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setBgRemovalEnabled(!bgRemovalEnabled)}
                              className={cn(
                                "w-10 h-6 rounded-full transition-all flex items-center p-0.5 relative border",
                                bgRemovalEnabled 
                                  ? "bg-cyan-500/20 border-cyan-400 justify-end" 
                                  : "bg-[#07070a] border-white/10 justify-start"
                              )}
                            >
                              <motion.div 
                                layout 
                                className={cn("w-4.5 h-4.5 rounded-full shadow", bgRemovalEnabled ? "bg-cyan-400" : "bg-zinc-600")} 
                              />
                            </button>
                          </div>

                          {bgRemovalEnabled && (
                            <div className="space-y-2 pt-2 border-t border-white/5">
                              <div className="flex justify-between items-center text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                                <span>Chroma Tolerance</span>
                                <span className="text-cyan-400">{tolerance}</span>
                              </div>
                              <input 
                                type="range" 
                                min="5" 
                                max="120"
                                value={tolerance}
                                onChange={(e) => setValue("tolerance", parseInt(e.target.value))}
                                className="w-full accent-cyan-400 bg-zinc-800 rounded-lg h-1.5 cursor-pointer"
                              />
                            </div>
                          )}
                        </div>

                        {/* Download Options */}
                        <div className="space-y-3 mt-auto">
                          <label className="text-[8px] font-black uppercase text-zinc-500 tracking-wider">Export Branding Assets</label>
                          <button
                            type="button"
                            onClick={() => handleDownload(results[0], false)}
                            className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                          >
                            <Download size={14} /> Download Original PNG
                          </button>
                          
                          <button
                            type="button"
                            disabled={!logoToRender}
                            onClick={() => handleDownload(results[0], true)}
                            className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Download size={14} /> Download Transparent PNG
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              // Simulate vector SVG container wrapped representation
                              const svgContent = `
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="100%" height="100%">
                                  <defs>
                                    <clipPath id="circleView">
                                      <circle cx="512" cy="512" r="500" />
                                    </clipPath>
                                  </defs>
                                  <rect width="100%" height="100%" fill="#ffffff" />
                                  <image href="${results[0]}" width="1024" height="1024" />
                                  <text x="512" y="950" font-family="Helvetica" font-weight="bold" font-size="32" fill="#000000" text-anchor="middle">${brandName || ""}</text>
                                </svg>
                              `;
                              const blob = new Blob([svgContent], { type: "image/svg+xml" });
                              const blobUrl = URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.href = blobUrl;
                              link.download = `${brandName || "brand"}-vector-wrapper.svg`;
                              link.click();
                              URL.revokeObjectURL(blobUrl);
                            }}
                            className="w-full py-3 bg-[#08080c] border border-white/10 hover:bg-white/5 text-zinc-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                          >
                            <Download size={14} /> Export Scalable SVG (Wrap)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-zinc-600 space-y-2">
                        <FileText size={24} className="text-zinc-700 animate-pulse" />
                        <p className="text-[9px] font-black uppercase tracking-wider">Awaiting Generation</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB B: Mockups Previews */}
            {activeTab === 'mockups' && results.length > 0 && (
              <motion.div 
                key="mockups"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* 1. Business Card Mock */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Luxury Business Card</span>
                  <div className="w-full aspect-[1.586/1] bg-gradient-to-br from-[#0c0c12] to-[#14141c] border border-white/10 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden select-none">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-2xl rounded-full" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 blur-2xl rounded-full" />
                    
                    <div className="flex justify-between items-start">
                      <div className="w-9 h-7 bg-yellow-600/10 border border-yellow-500/20 rounded-md flex items-center justify-center">
                        <div className="w-5 h-4 border border-yellow-500/10 rounded" />
                      </div>
                      <span className="text-[8px] font-mono tracking-widest text-zinc-600">LUMORA ELITE MEMBERSHIP</span>
                    </div>

                    <div className="flex items-center gap-4">
                      {logoToRender && (
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl p-1 shadow flex items-center justify-center">
                          <img src={logoToRender} className="max-w-full max-h-full object-contain" alt="Logo preview" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-base font-black tracking-tight text-white uppercase leading-tight">{brandName || "Brand Identity"}</h4>
                        <p className="text-[8px] text-zinc-400 uppercase tracking-widest leading-none mt-1">{slogan || "Brand tagline"}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-white/5 pt-4">
                      <div>
                        <p className="text-[6px] text-zinc-500 uppercase tracking-wider">Card Representative</p>
                        <p className="text-[9px] font-bold text-white uppercase tracking-wider mt-0.5">Syed Rayan</p>
                      </div>
                      <span className="text-[7px] font-mono text-zinc-500">4000 1289 0084 9012</span>
                    </div>
                  </div>
                </div>

                {/* 2. T-Shirt Mock */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Branded Apparel (Chest Print)</span>
                  <div className="w-full aspect-[1.586/1] bg-[#0c0c0f] border border-white/5 rounded-3xl flex items-center justify-center relative p-6 overflow-hidden shadow-2xl">
                    <div className="w-36 h-48 bg-[#18181e] border border-zinc-800 rounded-lg relative flex flex-col items-center justify-start pt-10 shadow-3xl">
                      {/* Sleeve Left */}
                      <div className="absolute -left-8 top-0 w-8 h-12 bg-[#18181e] border-l border-t border-b border-zinc-800 rounded-l-md rotate-12 origin-top-right" />
                      {/* Sleeve Right */}
                      <div className="absolute -right-8 top-0 w-8 h-12 bg-[#18181e] border-r border-t border-b border-zinc-800 rounded-r-md -rotate-12 origin-top-left" />
                      {/* Collar */}
                      <div className="w-12 h-5 bg-[#0c0c0f] border-b border-zinc-850 rounded-b-full absolute top-0" />

                      {/* Logo print */}
                      {logoToRender && (
                        <div className="flex flex-col items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                          <img src={logoToRender} className="w-10 h-10 object-contain" alt="Logo preview" />
                          <span className="text-[6px] font-black text-zinc-500 uppercase tracking-widest">{brandName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Smartphone Splash Mock */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Smartphone Loading Screen</span>
                  <div className="w-full aspect-[1.586/1] bg-[#0c0c0f] border border-white/5 rounded-3xl flex items-center justify-center p-6 shadow-2xl relative overflow-hidden">
                    <div className="w-28 h-48 bg-black border-[3px] border-zinc-850 rounded-[1.8rem] shadow-3xl relative overflow-hidden flex flex-col justify-between p-3 select-none">
                      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-2 bg-zinc-850 rounded-full" />
                      <div className="flex justify-between items-center text-[5px] font-bold text-zinc-500 pt-0.5">
                        <span>9:41</span>
                        <span>100%</span>
                      </div>

                      <div className="flex-1 flex flex-col items-center justify-center gap-2">
                        {logoToRender && (
                          <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center p-1">
                            <img src={logoToRender} className="max-w-full max-h-full object-contain" alt="Logo preview" />
                          </div>
                        )}
                        <h4 className="text-[8px] font-black tracking-widest text-white uppercase">{brandName || "App"}</h4>
                        <span className="text-[5px] text-zinc-650 uppercase tracking-wide animate-pulse">Initializing...</span>
                      </div>

                      <div className="w-14 h-0.5 bg-zinc-800 rounded-full mx-auto" />
                    </div>
                  </div>
                </div>

                {/* 4. SaaS Website Header */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">SaaS Website Header</span>
                  <div className="w-full aspect-[1.586/1] bg-[#08080c] border border-white/5 rounded-3xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden select-none">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-1.5">
                        {logoToRender && <img src={logoToRender} className="w-4.5 h-4.5 object-contain" alt="Logo preview" />}
                        <span className="text-[8px] font-black text-white uppercase tracking-tight">{brandName}</span>
                      </div>
                      <div className="flex gap-3 text-[6px] font-bold text-zinc-500 uppercase">
                        <span>Features</span>
                        <span>Pricing</span>
                        <span>Docs</span>
                      </div>
                      <button className="px-2 py-0.5 bg-white text-black text-[5px] font-black uppercase rounded">Start Free</button>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-1.5 mt-2">
                      <h2 className="text-[10px] font-black text-white leading-tight uppercase italic">
                        Deploy with <span className="text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">{brandName || "Brand"}</span>
                      </h2>
                      <p className="text-[5px] text-zinc-500 font-medium max-w-xs">{slogan || "Scale your brand with next-generation AI integrations."}</p>
                      <div className="flex gap-1.5">
                        <button className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-[4px] font-black uppercase rounded shadow-lg">Start Free</button>
                        <button className="px-2 py-0.5 bg-white/5 border border-white/10 text-zinc-300 text-[4px] font-black uppercase rounded">Docs</button>
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB C: Logo History */}
            {activeTab === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {history.length > 0 ? history.map((item, i) => (
                  <div key={i} className="group relative aspect-square rounded-[2rem] overflow-hidden glass border border-white/5 shadow-xl select-none">
                     <img src={item.url} alt="History Art" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                     <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-5 flex flex-col justify-end text-left">
                        <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400 mb-1 leading-none">{item.brandName}</span>
                        <p className="text-[9px] text-zinc-300 line-clamp-2 font-bold mb-4 italic leading-relaxed">"{item.prompt}"</p>
                        <div className="flex gap-2">
                           <button 
                              onClick={() => {
                                 setResults([item.url]);
                                 setValue("brandName", item.brandName);
                                 setValue("concept", item.prompt);
                                 setActiveTab('generate');
                              }} 
                              className="flex-1 py-2.5 rounded-xl bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                           >
                              Load
                           </button>
                           <button 
                              onClick={() => handleDownload(item.url)}
                              className="p-2.5 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors border border-white/10"
                           >
                              <Download size={14} />
                           </button>
                        </div>
                     </div>
                  </div>
                )) : (
                  <div className="col-span-full h-96 flex flex-col items-center justify-center space-y-4 opacity-30 text-center">
                     <div className="p-6 rounded-full bg-zinc-800/50">
                        <History size={48} className="text-zinc-650 animate-pulse" />
                     </div>
                     <div className="text-center">
                        <p className="font-black text-zinc-500 uppercase tracking-[0.2em] text-[10px]">No History Yet</p>
                        <p className="text-[8px] text-zinc-600 font-bold uppercase mt-2">Design your first brand logo to begin</p>
                     </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
    </div>
  );
}
