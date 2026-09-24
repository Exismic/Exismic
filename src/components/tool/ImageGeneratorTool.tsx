"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Palette,
  Camera,
  Film,
  Brush,
  Cpu,
  Compass,
  Box,
  Layers,
  Download,
  RefreshCw,
  RotateCcw,
  History,
  Maximize2,
  Wand2,
  ChevronDown,
  ChevronUp,
  Zap,
  ShieldCheck,
  Award,
  Shuffle,
  SlidersHorizontal,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  X,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getFunctionalStorageItem, setFunctionalStorageItem } from "@/lib/cookie-consent";
import axios from "axios";
import { useCredits } from "@/hooks/useCredits";
import { downloadWithBrandPolicy } from "@/utils/watermark";
import { MediaPipelineBar } from "./MediaPipelineBar";
import { ResultRetentionBar } from "./ResultRetentionBar";
import { saveFileHistory } from "@/lib/history";

interface GeneratorOptions {
  prompt: string;
  width: number;
  height: number;
  steps: number;
  guidance: number;
  n: number;
}

interface AspectRatioOption {
  name: string;
  label: string;
  width: number;
  height: number;
  iconWidth: string;
  iconHeight: string;
}

const ASPECT_RATIOS: AspectRatioOption[] = [
  { name: "1:1 Square", label: "Square (1:1)", width: 1024, height: 1024, iconWidth: "w-4", iconHeight: "h-4" },
  { name: "16:9 Cinema", label: "Cinema (16:9)", width: 1280, height: 720, iconWidth: "w-5", iconHeight: "h-3" },
  { name: "9:16 Portrait", label: "Story (9:16)", width: 720, height: 1280, iconWidth: "w-3", iconHeight: "h-5" },
  { name: "4:3 Classic", label: "Standard (4:3)", width: 1024, height: 768, iconWidth: "w-4", iconHeight: "h-3" },
  { name: "3:2 Photo", label: "DSLR (3:2)", width: 1152, height: 768, iconWidth: "w-4.5", iconHeight: "h-3" },
];

interface StylePreset {
  id: string;
  name: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  suffix: string;
  desc: string;
}

const STYLE_PRESETS: StylePreset[] = [
  { id: "none", name: "Natural (Raw)", badge: "Unfiltered", icon: Palette, suffix: "", desc: "Direct prompt interpretation" },
  { id: "realistic", name: "Photorealistic", badge: "Studio 8K", icon: Camera, suffix: ", photorealistic raw portrait, cinematic lighting, 8k, extremely detailed, real photography", desc: "Crisp camera lens & real-life lighting" },
  { id: "cinematic", name: "Cinematic Still", badge: "Film 35mm", icon: Film, suffix: ", cinematic movie shot, heavy contrast, dramatic lens flare, unreal engine 5 render, epic depth of field", desc: "Dramatic lighting & anamorphic depth" },
  { id: "anime", name: "Anime & Manga", badge: "Vector Art", icon: Brush, suffix: ", gorgeous anime illustration, clean vectors, colorful line art, studio ghibli aesthetic", desc: "Vibrant stylized illustration" },
  { id: "cyberpunk", name: "Cyberpunk", badge: "Neon Sci-Fi", icon: Cpu, suffix: ", futuristic cyberpunk theme, neon glows, wet metropolitan city streets, hyper-detailed sci-fi concept art", desc: "Holographic glows & high-tech cityscapes" },
  { id: "fantasy", name: "Fantasy Realm", badge: "Mythical", icon: Compass, suffix: ", dreamy magical fantasy setting, whimsical glow, bright colors, starry sky background, highly detailed", desc: "Lush mythical atmosphere & wonder" },
  { id: "3d-render", name: "3D Digital Art", badge: "Isometric", icon: Box, suffix: ", gorgeous 3d model render, stylized smooth clay render, blender render, vibrant colors", desc: "Clean dimensional geometry & soft shading" },
  { id: "minimalist", name: "Minimalist Vector", badge: "Graphic", icon: Layers, suffix: ", clean minimalist vector illustration, flat aesthetic, elegant color palette, high contrast", desc: "Sleek graphic poster design" },
];

const EXAMPLE_PROMPTS = [
  "A futuristic cyberpunk city with neon lights and flying cars, cinematic lighting, 8k resolution.",
  "An ethereal forest with glowing mushrooms and a crystal clear lake, studio quality lighting.",
  "Portrait of a mechanical owl with emerald eyes, extremely detailed, macro photography.",
  "Minimalist abstract landscape of a red desert on a distant planet, flat design style.",
  "A gorgeous glass greenhouse floating in a starry space nebulae, celestial hyper-detailed art.",
  "Sleek hypercar speeding down a neon Japanese highway at midnight, motion blur, cinematic reflections.",
  "A cute baby dragon sleeping inside a golden teacup, extremely cozy cinematic render.",
  "Architectural marvel of a solarpunk vertical garden skyscraper during golden hour.",
  "A mythical snow leopard prowling through misty Himalayan mountain peaks at dawn, photorealistic raw portrait."
];

interface Blueprint {
  id: string;
  title: string;
  tag: string;
  prompt: string;
  styleId: string;
  aspectName: string;
  width: number;
  height: number;
  previewUrl: string;
  category: string;
}

const INSTANT_BLUEPRINTS: Blueprint[] = [
  {
    id: "cyberpunk-runner",
    title: "Cyberpunk Neo-Tokyo",
    tag: "Sci-Fi / Cinematic",
    prompt: "Sleek chrome cybernetic runner standing on a rain-drenched rooftop in Neo-Tokyo, holographic neon reflections, volumetric mist, cinematic wide angle, 8k",
    styleId: "cyberpunk",
    aspectName: "16:9 Cinema",
    width: 1280,
    height: 720,
    previewUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80",
    category: "Futuristic Urban"
  },
  {
    id: "fantasy-grove",
    title: "Bioluminescent Forest",
    tag: "Fantasy / Nature",
    prompt: "An ancient glowing tree with bioluminescent crystal petals, soft floating orbs, misty twilight river, studio quality fantasy landscape, rich atmosphere",
    styleId: "fantasy",
    aspectName: "1:1 Square",
    width: 1024,
    height: 1024,
    previewUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    category: "Mythical Realm"
  },
  {
    id: "studio-portrait",
    title: "Alpine Wildlife Vista",
    tag: "Photorealistic / Lens",
    prompt: "Cinematic atmospheric mountain vista with pristine snowy ridges, golden dawn rim light, crisp 85mm lens depth of field, photorealistic raw landscape",
    styleId: "realistic",
    aspectName: "4:3 Classic",
    width: 1024,
    height: 768,
    previewUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
    category: "Raw Photography"
  },
  {
    id: "solarpunk-haven",
    title: "Dimensional Fluid Art",
    tag: "Concept Art / 3D",
    prompt: "Fluid dynamic acrylic waves swirling in mid-air, floating holographic bubbles, smooth vibrant gradient ribbons, clean studio lighting, 3d render",
    styleId: "3d-render",
    aspectName: "16:9 Cinema",
    width: 1280,
    height: 720,
    previewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    category: "Modern 3D"
  },
];

export function ImageGeneratorTool() {
  const { deductCredits, credits, isPro, setShowUpsell } = useCredits();
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [history, setHistory] = useState<{ url: string; prompt: string; width: number; height: number; styleName?: string; createdAt?: string }[]>([]);
  const [activeTab, setActiveTab] = useState<"generate" | "history">("generate");
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [powerPackMeta, setPowerPackMeta] = useState<{ priority?: boolean; noWatermark?: boolean; commercialLicense?: boolean } | null>(null);

  const [selectedStyle, setSelectedStyle] = useState("none");
  const [estimatedTime, setEstimatedTime] = useState(4.0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Synchronized credit cost from credit-policy.ts (ai-img-gen: 20)
  const TOOL_CREDIT_COST = 20;

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = getFunctionalStorageItem("exismic_image_history");
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Decimal countdown timer for inference
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const startEstimate = isPro ? 2.5 : 4.5;
    const floorEstimate = isPro ? 0.3 : 0.5;
    if (isGenerating) {
      setEstimatedTime(startEstimate);
      timer = setInterval(() => {
        setEstimatedTime((prev) => {
          if (prev <= floorEstimate + 0.1) return floorEstimate;
          return Number((prev - 0.1).toFixed(1));
        });
      }, 100);
    } else {
      setEstimatedTime(startEstimate);
    }
    return () => clearInterval(timer);
  }, [isGenerating, isPro]);

  const { register, handleSubmit, setValue, watch } = useForm<GeneratorOptions>({
    defaultValues: {
      prompt: "",
      width: 1024,
      height: 1024,
      steps: 4,
      guidance: 3.5,
      n: 1,
    },
  });

  const currentPrompt = watch("prompt");
  const currentWidth = watch("width");
  const currentHeight = watch("height");
  const currentSteps = watch("steps");
  const currentGuidance = watch("guidance");

  const onSubmit = async (data: GeneratorOptions) => {
    if (!data.prompt.trim()) {
      setError("Please describe the artwork you want to create in the prompt field.");
      return;
    }

    if (credits < TOOL_CREDIT_COST) {
      setError(
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1">
          <div>
            <p className="font-bold text-white text-sm">Low credit balance</p>
            <p className="text-xs text-zinc-400">
              You need {TOOL_CREDIT_COST} credits to generate an image. Your current balance is {credits} credits.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowUpsell(true)}
            className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all shadow-md cursor-pointer"
          >
            Refill Credits
          </button>
        </div>
      );
      return;
    }

    setIsGenerating(true);
    setError(null);
    setEnhancedPrompt(null);
    setPowerPackMeta(null);

    try {
      const preset = STYLE_PRESETS.find((p) => p.id === selectedStyle);
      const finalPrompt = preset && preset.suffix ? `${data.prompt.trim()}${preset.suffix}` : data.prompt.trim();

      const resp = await axios.post("/api/tools/ai/image-generate", {
        ...data,
        prompt: finalPrompt,
      });

      if (resp.data.success) {
        const newUrl = resp.data.imageUrl;
        setResults([newUrl]);
        setEnhancedPrompt(resp.data.enhancedPrompt || null);
        setPowerPackMeta({
          priority: resp.data.priority,
          noWatermark: resp.data.noWatermark,
          commercialLicense: resp.data.commercialLicense,
        });

        const currentStyleObj = STYLE_PRESETS.find((p) => p.id === selectedStyle);
        const newHistoryItem = {
          url: newUrl,
          prompt: data.prompt,
          width: data.width,
          height: data.height,
          styleName: currentStyleObj?.name || "Natural",
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setHistory((prev) => {
          const updated = [newHistoryItem, ...prev];
          setFunctionalStorageItem("exismic_image_history", JSON.stringify(updated.slice(0, 30)));
          return updated;
        });

        // Deduct client-side cache credits
        deductCredits(TOOL_CREDIT_COST);

        // Record to unified history vault
        const currentRatio = ASPECT_RATIOS.find((r) => r.width === data.width && r.height === data.height)?.name || `${data.width}x${data.height}`;
        saveFileHistory({
          toolType: "image-generator",
          originalName: data.prompt,
          resultUrl: newUrl,
          fileType: "image",
          status: "completed",
          metadata: {
            prompt: data.prompt,
            aspectRatio: currentRatio,
            width: data.width,
            height: data.height,
            style: selectedStyle,
            styleName: currentStyleObj?.name || "Natural",
            model: "flux",
            targetHref: "/tools/ai/img-gen",
            toolName: "AI Image Generator",
          },
        });
      }
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err)
        ? err.response?.data?.error || "Unable to generate image right now. Please try again."
        : "Unable to generate image right now. Please try again.";
      const needsUpgrade = axios.isAxiosError(err) && Boolean(err.response?.data?.needsUpgrade);

      setError(
        needsUpgrade ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1">
            <div>
              <p className="font-bold text-white text-sm">Pro limit reached</p>
              <p className="text-xs text-zinc-400">{errorMsg}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowUpsell(true)}
              className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all shadow-md cursor-pointer"
            >
              Unlock Pro / Refill
            </button>
          </div>
        ) : (
          errorMsg
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Replay from History listener
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const urlPrompt = params.get("prompt");
    const urlStyle = params.get("style");
    const urlRatio = params.get("aspectRatio");
    const autorun = params.get("autorun") === "1";

    if (urlPrompt) {
      setValue("prompt", urlPrompt);
    }
    if (urlStyle && STYLE_PRESETS.some((p) => p.id === urlStyle)) {
      setSelectedStyle(urlStyle);
    }
    if (urlRatio) {
      const matchedRatio = ASPECT_RATIOS.find(
        (r) =>
          r.name.toLowerCase().includes(urlRatio.toLowerCase()) ||
          `${r.width}x${r.height}` === urlRatio ||
          `${r.width}:${r.height}` === urlRatio
      );
      if (matchedRatio) {
        setValue("width", matchedRatio.width);
        setValue("height", matchedRatio.height);
      }
    }

    if (autorun && urlPrompt) {
      const timer = setTimeout(() => {
        handleSubmit(onSubmit)();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSurprise = () => {
    const random = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];
    setValue("prompt", random);
  };

  const handleApplyBlueprint = (blueprint: Blueprint) => {
    setValue("prompt", blueprint.prompt);
    setSelectedStyle(blueprint.styleId);
    setValue("width", blueprint.width);
    setValue("height", blueprint.height);
    // Smooth scroll slightly if on mobile
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleVariations = () => {
    if (results.length === 0) return;
    let p = watch("prompt");
    const variationSuffix = ", alternative angle, cinematic lighting variation";
    if (!p.includes("variation")) {
      p = `${p}${variationSuffix}`;
      setValue("prompt", p);
    }
    handleSubmit(onSubmit)();
  };

  const handleDownload = async (url: string) => {
    try {
      setIsDownloading(true);
      await downloadWithBrandPolicy({
        imageUrl: url,
        fileName: `exismic-artwork-${Date.now()}.png`,
        isPro,
      });
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!currentPrompt) return;
    navigator.clipboard.writeText(currentPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="w-full space-y-6 pb-6 lg:pb-2">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Creative Controls Sidebar (xl:col-span-4) */}
        <div className="xl:col-span-4 space-y-6">
          <div className="rounded-[2.5rem] bg-[#0c0d12]/90 border border-amber-500/20 backdrop-blur-2xl shadow-[0_0_50px_rgba(245,158,11,0.06)] overflow-hidden">
            {/* macOS Titlebar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/15 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <div className="flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300/90">
                  Studio Controls
                </span>
              </div>
            </div>

            <div className="p-6 space-y-7">
              {/* Aspect Ratio / Dimensions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    Canvas Dimensions
                  </label>
                  <span className="text-[10px] font-bold text-amber-400/80 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    {ASPECT_RATIOS.find((r) => r.width === currentWidth && r.height === currentHeight)?.name || `${currentWidth}x${currentHeight}`}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 gap-2">
                  {ASPECT_RATIOS.map((ratio) => {
                    const isSelected = currentWidth === ratio.width && currentHeight === ratio.height;
                    return (
                      <button
                        key={ratio.name}
                        type="button"
                        onClick={() => {
                          setValue("width", ratio.width);
                          setValue("height", ratio.height);
                        }}
                        className={cn(
                          "p-3 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3 group relative overflow-hidden",
                          isSelected
                            ? "bg-amber-500/15 border-amber-400/60 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                            : "bg-white/[0.03] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] hover:border-white/10"
                        )}
                      >
                        <div
                          className={cn(
                            "rounded border flex items-center justify-center shrink-0 transition-colors",
                            ratio.iconWidth,
                            ratio.iconHeight,
                            isSelected ? "border-amber-400 bg-amber-400/30" : "border-zinc-600 bg-zinc-800/60"
                          )}
                        />
                        <div className="min-w-0">
                          <p className="text-[11px] font-black tracking-tight leading-tight truncate">{ratio.name}</p>
                          <p className="text-[9px] text-zinc-500 font-medium tracking-wide">
                            {ratio.width} × {ratio.height}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Style Presets */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2">
                    <Brush className="w-3.5 h-3.5 text-amber-400" />
                    Artistic Style
                  </label>
                  <span className="text-[10px] font-bold text-zinc-400">
                    {STYLE_PRESETS.find((p) => p.id === selectedStyle)?.badge}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {STYLE_PRESETS.map((preset) => {
                    const isSelected = selectedStyle === preset.id;
                    const IconComp = preset.icon;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedStyle(preset.id)}
                        className={cn(
                          "p-3 rounded-2xl border text-left transition-all duration-300 relative group overflow-hidden flex flex-col justify-between gap-1.5",
                          isSelected
                            ? "bg-amber-500/15 border-amber-400/60 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                            : "bg-white/[0.03] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] hover:border-white/10"
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div
                            className={cn(
                              "w-7 h-7 rounded-xl flex items-center justify-center transition-colors",
                              isSelected ? "bg-amber-400/20 text-amber-300" : "bg-white/5 text-zinc-400 group-hover:text-zinc-200"
                            )}
                          >
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <span
                            className={cn(
                              "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                              isSelected
                                ? "bg-amber-400/20 text-amber-300 border-amber-400/30"
                                : "bg-white/5 text-zinc-500 border-white/5"
                            )}
                          >
                            {preset.badge}
                          </span>
                        </div>
                        <div>
                          <p className="text-[11px] font-black tracking-tight leading-snug truncate">{preset.name}</p>
                          <p className="text-[9px] text-zinc-500 truncate leading-none mt-0.5">{preset.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fine-Tuning Precision Controls (Accordion) */}
              <div className="pt-2 border-t border-amber-500/10">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between py-2 text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-amber-300 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                    Fine-Tuning Controls
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden space-y-4 pt-3 pb-1"
                    >
                      {/* Quality / Detail Steps */}
                      <div className="space-y-2 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-zinc-300">Rendering Detail</span>
                          <span className="font-black text-amber-400">
                            {currentSteps <= 4 ? "Fast Draft (4)" : currentSteps <= 8 ? "Balanced (8)" : `High Detail (${currentSteps})`}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          {...register("steps")}
                          className="w-full accent-amber-400 bg-zinc-800 rounded-lg h-1.5 cursor-pointer"
                        />
                        <div className="flex justify-between text-[8px] text-zinc-500 font-bold uppercase tracking-wider">
                          <span>Speed</span>
                          <span>Maximum Detail</span>
                        </div>
                      </div>

                      {/* Prompt Adherence / Guidance */}
                      <div className="space-y-2 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-zinc-300">Prompt Adherence</span>
                          <span className="font-black text-amber-400">
                            {Number(currentGuidance) <= 2.5 ? "Creative (2.5)" : Number(currentGuidance) <= 4.0 ? "Balanced (3.5)" : "Strict Match (5.0)"}
                          </span>
                        </div>
                        <input
                          type="range"
                          step="0.5"
                          min="1"
                          max="10"
                          {...register("guidance")}
                          className="w-full accent-amber-400 bg-zinc-800 rounded-lg h-1.5 cursor-pointer"
                        />
                        <div className="flex justify-between text-[8px] text-zinc-500 font-bold uppercase tracking-wider">
                          <span>Flexible</span>
                          <span>Strict Follow</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Studio Quality Guarantee Banner */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-300">
                  <Award className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-zinc-100 tracking-tight">Ultra High-Speed Studio</p>
                  <p className="text-[9px] text-amber-400/90 font-medium tracking-wide">
                    {isPro ? "Priority Pro queue • Instant 2-4s rendering" : "Fast generation • 20 credits per artwork"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Creative Stage & Prompt Studio (xl:col-span-8) */}
        <div className="xl:col-span-8 space-y-6">
          {/* Main Obsidian Stage Container */}
          <div className="rounded-[2.5rem] bg-[#0c0d12]/90 border border-amber-500/20 backdrop-blur-2xl shadow-[0_0_50px_rgba(245,158,11,0.06)] overflow-hidden">
            {/* Stage Titlebar & Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-amber-500/15 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 ml-2 hidden sm:inline-block">
                  AI Image Studio
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("generate")}
                  className={cn(
                    "px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2",
                    activeTab === "generate"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                      : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Studio Canvas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("history")}
                  className={cn(
                    "px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2",
                    activeTab === "history"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                      : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  <History className="w-3.5 h-3.5" />
                  History
                  {history.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black flex items-center justify-center">
                      {history.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Prompt Studio Input & Primary Action */}
            <div className="p-6 border-b border-white/5 space-y-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="relative group rounded-3xl border border-amber-500/20 bg-black/40 focus-within:border-amber-400/60 focus-within:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all">
                  <textarea
                    {...register("prompt")}
                    rows={4}
                    placeholder="Describe your scene in vivid detail (e.g., A futuristic cyberpunk street in Neo-Tokyo with glowing neon reflections, rain mist, volumetric lighting, 8k resolution)..."
                    className="w-full p-5 bg-transparent text-sm sm:text-base font-medium text-white placeholder:text-zinc-600 focus:outline-none resize-none leading-relaxed"
                  />

                  {/* Prompt Controls Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-white/5 bg-white/[0.01]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSurprise}
                        className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-wider text-zinc-300 hover:text-amber-300 hover:bg-amber-500/10 hover:border-amber-500/20 transition-all flex items-center gap-1.5"
                      >
                        <Shuffle className="w-3 h-3 text-amber-400" />
                        Surprise Me
                      </button>
                      {currentPrompt && (
                        <button
                          type="button"
                          onClick={handleCopyPrompt}
                          className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-white transition-all flex items-center gap-1"
                          title="Copy prompt"
                        >
                          {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        {currentPrompt.length} Characters
                      </span>
                      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                        <Wand2 className="w-3 h-3 text-amber-400" />
                        Auto Optimizer Active
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                      <span>Balance:</span>
                      <span className="text-amber-400 font-black">{credits} Credits</span>
                    </div>
                    {isPro && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-amber-300" /> Pro Priority
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className={cn(
                      "px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 flex items-center gap-3 shadow-xl relative overflow-hidden",
                      isGenerating
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
                        : "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-amber-950 shadow-[0_0_30px_rgba(245,158,11,0.35)] hover:shadow-[0_0_40px_rgba(245,158,11,0.55)] hover:scale-[1.02] active:scale-[0.98]"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Rendering Artwork...</span>
                      </>
                    ) : (
                      <>
                        <Palette className="w-4 h-4" />
                        <span>Generate Artwork</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-950/20 border border-amber-950/20 text-[10px] font-black">
                          {TOOL_CREDIT_COST} Credits
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="mx-6 mt-6 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-bold leading-relaxed">
                {error}
              </div>
            )}

            {/* Display Stage Area (Canvas or History) */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === "generate" ? (
                  <motion.div
                    key="stage-generate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {isGenerating ? (
                      /* Rendering Progress Stage */
                      <div className="min-h-[460px] rounded-3xl bg-black/40 border border-amber-500/20 flex flex-col items-center justify-center text-center p-8 space-y-6 relative overflow-hidden">
                        {/* Ambient Neon Orbit Rings */}
                        <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-t-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.5)]"
                          />
                          <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-3 rounded-full border-b-2 border-yellow-300 shadow-[0_0_20px_rgba(253,224,71,0.4)]"
                          />
                          <ImageIcon className="w-10 h-10 text-amber-300 animate-pulse relative z-10" />
                        </div>

                        <div className="space-y-3 max-w-md">
                          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-[10px] font-black uppercase tracking-widest text-amber-300">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            Estimated Time: ~{estimatedTime}s
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            {isPro ? "Synthesizing with Pro Priority..." : "Crafting your visual artwork..."}
                          </h3>
                          <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                            Composing high-resolution visual layers, ambient lighting, and rich texture details.
                          </p>
                        </div>
                      </div>
                    ) : results.length > 0 ? (
                      /* Completed Artwork Display Stage */
                      <div className="space-y-6">
                        <div className="relative rounded-3xl overflow-hidden bg-black/60 border border-amber-500/20 shadow-2xl group">
                          <img
                            src={results[0]}
                            alt="Generated AI Artwork"
                            className="w-full max-h-[650px] object-contain mx-auto transition-transform duration-500 group-hover:scale-[1.01]"
                          />

                          {/* Quick Overlay Action Buttons */}
                          <div className="absolute top-4 right-4 flex items-center gap-2 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => setFullscreenImage(results[0])}
                              className="p-3 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white hover:bg-black hover:scale-105 transition-all shadow-xl"
                              title="View Fullscreen"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => window.open(results[0], "_blank")}
                              className="p-3 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white hover:bg-black hover:scale-105 transition-all shadow-xl"
                              title="Open original in new tab"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Enhanced Prompt Display (if modified by engine) */}
                        {enhancedPrompt && (
                          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left space-y-1.5">
                            <div className="flex items-center gap-2 text-amber-400">
                              <Wand2 className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                Optimized Generation Prompt
                              </span>
                            </div>
                            <p className="text-xs text-zinc-300 font-medium italic leading-relaxed">
                              &ldquo;{enhancedPrompt}&rdquo;
                            </p>
                          </div>
                        )}

                        {/* Pro Studio Rights Badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                            <Zap className="w-3.5 h-3.5" />
                            <span>{isPro ? "Priority Generation" : "Fast Cloud Compute"}</span>
                          </div>
                          <div className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{isPro ? "Zero Watermark Export" : "Standard Web Export"}</span>
                          </div>
                          <div className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-sky-500/20 bg-sky-500/5 text-sky-300 text-[10px] font-black uppercase tracking-wider">
                            <Award className="w-3.5 h-3.5" />
                            <span>Commercial Ready</span>
                          </div>
                        </div>

                        {/* Primary Image Action Controls */}
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => handleDownload(results[0])}
                            disabled={isDownloading}
                            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-white via-zinc-100 to-zinc-200 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                          >
                            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            <span>{isDownloading ? "Preparing File..." : isPro ? "Download Clean PNG" : "Download PNG"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleVariations}
                            className="px-5 py-3.5 rounded-2xl bg-white/[0.05] border border-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-white/10 hover:border-amber-400/40 transition-all"
                          >
                            <RefreshCw className="w-4 h-4 text-amber-400" />
                            <span>Create Variation</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubmit(onSubmit)()}
                            className="px-5 py-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-amber-500/20 transition-all"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Regenerate</span>
                          </button>
                        </div>

                        {/* Integrated Retention & Cloud Vault Bar */}
                        <ResultRetentionBar
                          toolType="ai-img-gen"
                          toolName="AI Image Generator"
                          title={watch("prompt")}
                          fileUrl={results[0]}
                          metadata={{
                            prompt: watch("prompt"),
                            aspectRatio: ASPECT_RATIOS.find((r) => r.width === currentWidth && r.height === currentHeight)?.name,
                            style: selectedStyle,
                          }}
                          downloadAction={() => handleDownload(results[0])}
                          downloadLabel="Save PNG"
                        />

                        {/* 1-Click Multi-Tool Pipeline */}
                        <MediaPipelineBar
                          imageUrl={results[0]}
                          imageName={`exismic-ai-${Date.now()}.png`}
                          sourceToolId="ai-img-gen"
                          sourceToolName="AI Image Generator"
                          actions={["eraser", "meme", "resizer", "compressor", "converter"]}
                          title="Companion Workflow Pipeline"
                          subtitle="Carry this visual artwork directly into companion tools with zero re-uploading"
                        />
                      </div>
                    ) : (
                      /* Zero-Void State: 4 Instant Demonstration Blueprints ($0 Compute Previews) */
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
                          <div>
                            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                              <Compass className="w-4 h-4 text-amber-400" />
                              Instant Demonstration Blueprints
                            </h3>
                            <p className="text-xs text-zinc-400 font-medium mt-0.5">
                              Click any sample blueprint below to immediately load prompts, aspect ratios, and lighting styles.
                            </p>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 w-fit">
                            $0 Compute Previews
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {INSTANT_BLUEPRINTS.map((bp) => (
                            <div
                              key={bp.id}
                              className="group relative rounded-3xl overflow-hidden border border-white/5 bg-white/[0.02] hover:border-amber-400/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all duration-500 flex flex-col justify-between"
                            >
                              {/* Preview Thumbnail */}
                              <div className="relative h-44 w-full overflow-hidden bg-zinc-900">
                                <img
                                  src={bp.previewUrl}
                                  alt={bp.title}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                  <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-wider text-amber-300">
                                    {bp.tag}
                                  </span>
                                </div>
                                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                  <p className="text-sm font-black text-white tracking-tight drop-shadow-md">
                                    {bp.title}
                                  </p>
                                  <span className="text-[9px] font-bold text-zinc-300 bg-black/60 px-2 py-0.5 rounded-md">
                                    {bp.aspectName}
                                  </span>
                                </div>
                              </div>

                              {/* Prompt & Action */}
                              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                                <p className="text-[11px] text-zinc-400 font-medium line-clamp-2 leading-relaxed">
                                  &ldquo;{bp.prompt}&rdquo;
                                </p>

                                <button
                                  type="button"
                                  onClick={() => handleApplyBlueprint(bp)}
                                  className="w-full py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-black text-xs uppercase tracking-wider hover:bg-amber-400 hover:text-amber-950 transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                                >
                                  <span>Use This Blueprint</span>
                                  <Play className="w-3 h-3 fill-current" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* History Gallery Tab */
                  <motion.div
                    key="stage-history"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {history.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {history.map((item, index) => (
                          <div
                            key={index}
                            className="group relative rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between"
                          >
                            <div className="relative aspect-square w-full bg-zinc-900 overflow-hidden">
                              <img
                                src={item.url}
                                alt="History Creation"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end gap-2">
                                <p className="text-[10px] text-zinc-200 line-clamp-3 font-medium italic">
                                  &ldquo;{item.prompt}&rdquo;
                                </p>
                                <div className="flex gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setResults([item.url]);
                                      setValue("prompt", item.prompt);
                                      setValue("width", item.width);
                                      setValue("height", item.height);
                                      setActiveTab("generate");
                                    }}
                                    className="flex-1 py-2 rounded-xl bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider hover:brightness-110 transition-all"
                                  >
                                    Load
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDownload(item.url)}
                                    className="p-2 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-all"
                                    title="Download"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="p-3 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-400">
                              <span className="truncate max-w-[140px] font-bold text-zinc-300">{item.styleName || "Natural"}</span>
                              <span className="text-[9px] text-zinc-500">{item.createdAt || `${item.width}x${item.height}`}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="min-h-[350px] rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center p-8 space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                          <History className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-white tracking-wide uppercase">No Artwork History Yet</h4>
                          <p className="text-xs text-zinc-500 max-w-sm">
                            Artworks you create in this session will automatically appear here for one-click re-loading and downloading.
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal View */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
            onClick={() => setFullscreenImage(null)}
          >
            <div className="relative max-w-6xl max-h-[90vh] flex flex-col items-center">
              <button
                type="button"
                onClick={() => setFullscreenImage(null)}
                className="absolute -top-12 right-0 p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={fullscreenImage}
                alt="Artwork Fullscreen"
                className="max-h-[85vh] w-auto object-contain rounded-2xl border border-white/10 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
