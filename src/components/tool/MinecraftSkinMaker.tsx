"use client";

import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  Box,
  Check,
  Download,
  Eye,
  Footprints,
  Image as ImageIcon,
  Loader2,
  Palette,
  RefreshCw,
  ScanFace,
  Shirt,
  Sparkles,
  Upload,
  User,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCredits } from "@/hooks/useCredits";
import { MinecraftSkinEditor } from "@/components/tool/MinecraftSkinEditor";
import type {
  MinecraftArmModel,
  MinecraftSkinDesign,
  MinecraftSkinPart,
} from "@/lib/minecraft-skin";

type PreviewMode = "character" | "texture" | "editor";
type StyleMode = "balanced" | "pixel-detailed" | "minimal" | "high-contrast";
type ReferenceMode = "rebuild" | "guided" | "inspire";

interface GeneratedSkin {
  skinUrl: string;
  design: MinecraftSkinDesign;
  armModel: MinecraftArmModel;
  seed: number;
  priority: boolean;
  cost: number;
  referenceRebuilt?: boolean;
  referenceGuided?: boolean;
}

const PROMPT_STARTERS = [
  "Neon samurai with a cyan visor",
  "Forest ranger with enchanted armor",
  "Royal ice mage with silver details",
  "Streetwear astronaut in purple and white",
];

const PARTS: Array<{
  id: MinecraftSkinPart;
  label: string;
  description: string;
  icon: typeof User;
}> = [
  { id: "all", label: "Full skin", description: "Rebuild everything", icon: User },
  { id: "head", label: "Head", description: "Face, hair and headwear", icon: ScanFace },
  { id: "torso", label: "Torso", description: "Top and chest details", icon: Shirt },
  { id: "arms", label: "Arms", description: "Sleeves and gloves", icon: Wand2 },
  { id: "legs", label: "Legs", description: "Pants and footwear", icon: Footprints },
];

const STYLE_OPTIONS: Array<{ id: StyleMode; label: string }> = [
  { id: "balanced", label: "Balanced" },
  { id: "pixel-detailed", label: "Detailed" },
  { id: "minimal", label: "Minimal" },
  { id: "high-contrast", label: "High contrast" },
];

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The reference image could not be read."));
    reader.readAsDataURL(file);
  });
}

async function optimizeReferenceImage(file: File) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    throw new Error("Use a PNG, JPG, or WEBP reference image.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Reference images must be smaller than 8MB.");
  }

  const source = await readFileAsDataUrl(file);
  const image = new window.Image();
  image.src = source;
  await image.decode();
  const looksLikeSkinLayout =
    image.naturalWidth >= 64 &&
    image.naturalHeight >= 64 &&
    Math.abs(image.naturalWidth / image.naturalHeight - 1) <= 0.08;
  if (file.size <= 4 * 1024 * 1024) {
    return { dataUrl: source, looksLikeSkinLayout };
  }
  const scale = Math.min(1, 768 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image processing is not supported in this browser.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return {
    dataUrl: canvas.toDataURL("image/jpeg", 0.86),
    looksLikeSkinLayout,
  };
}

function SkinViewer({
  skinUrl,
  armModel,
  autoRotate,
}: {
  skinUrl: string;
  armModel: MinecraftArmModel;
  autoRotate: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const shell = shellRef.current;
    if (!canvas || !shell || !skinUrl) return;
    let disposed = false;
    let viewer: import("skinview3d").SkinViewer | null = null;
    let observer: ResizeObserver | null = null;

    void import("skinview3d").then(({ IdleAnimation, SkinViewer: Viewer }) => {
      if (disposed) return;
      const resize = () => {
        if (!viewer) return;
        const width = Math.max(280, shell.clientWidth);
        const height = Math.max(360, shell.clientHeight);
        viewer.setSize(width, height);
      };

      viewer = new Viewer({
        canvas,
        width: Math.max(280, shell.clientWidth),
        height: Math.max(360, shell.clientHeight),
        skin: skinUrl,
        model: armModel === "slim" ? "slim" : "default",
        animation: new IdleAnimation(),
      });
      viewer.background = 0x070810;
      viewer.autoRotate = autoRotate;
      viewer.autoRotateSpeed = 0.55;
      viewer.controls.enablePan = false;
      viewer.controls.enableZoom = true;
      viewer.zoom = 1.02;
      observer = new ResizeObserver(resize);
      observer.observe(shell);
    });

    return () => {
      disposed = true;
      observer?.disconnect();
      viewer?.dispose();
    };
  }, [armModel, autoRotate, skinUrl]);

  return (
    <div ref={shellRef} className="relative h-[420px] min-h-[360px] w-full overflow-hidden rounded-lg sm:h-[520px]">
      <canvas
        ref={canvasRef}
        className="h-full w-full touch-none"
        aria-label="Interactive 3D Minecraft skin preview"
      />
      <div className="pointer-events-none absolute inset-x-6 bottom-5 flex justify-center">
        <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[11px] font-medium text-zinc-300 backdrop-blur-md">
          Drag to rotate · Scroll to zoom
        </span>
      </div>
    </div>
  );
}

export function MinecraftSkinMaker() {
  const { credits, isPro, userId, refreshCredits } = useCredits();
  const [prompt, setPrompt] = useState("");
  const [armModel, setArmModel] = useState<MinecraftArmModel>("classic");
  const [style, setStyle] = useState<StyleMode>("balanced");
  const [targetPart, setTargetPart] = useState<MinecraftSkinPart>("all");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceName, setReferenceName] = useState<string | null>(null);
  const [referenceMode, setReferenceMode] = useState<ReferenceMode>("guided");
  const [result, setResult] = useState<GeneratedSkin | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("character");
  const [autoRotate, setAutoRotate] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isGenerating) {
      setProgress(0);
      return;
    }
    setProgress(8);
    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 92) return current;
        const increment = current < 45 ? 7 : current < 75 ? 3 : 1;
        return Math.min(92, current + increment);
      });
    }, 420);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  useEffect(() => {
    if (result && targetPart !== "all" && armModel !== result.armModel) {
      setTargetPart("all");
      setNotice("Arm model changed. The next generation will rebuild the full skin.");
    }
  }, [armModel, result, targetPart]);

  const handleReference = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      const optimized = await optimizeReferenceImage(file);
      setReferenceImage(optimized.dataUrl);
      setReferenceName(file.name);
      setReferenceMode("guided");
      setNotice(
        optimized.looksLikeSkinLayout
          ? "Skin-layout reference detected. Guided Remix is selected so Lumora preserves its pixels and applies your prompt edits."
          : "Reference added. Guided remix will preserve its identity while applying your prompt."
      );
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not use this reference.");
    }
  };

  const generate = async () => {
    if (!userId) {
      setError("Sign in to generate and save Minecraft skins.");
      return;
    }
    if (prompt.trim().length < 3) {
      setError("Describe the character you want to create.");
      return;
    }
    if (targetPart !== "all" && !result) {
      setError("Generate a full skin before changing individual body parts.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/tools/image/minecraft-skin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          armModel,
          style,
          targetPart,
          baseSkinUrl: targetPart === "all" ? undefined : result?.skinUrl,
          referenceImage: referenceImage || undefined,
          referenceMode,
        }),
      });
      const payload = await response.json() as GeneratedSkin & {
        success?: boolean;
        error?: string;
      };
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Lumora could not generate this skin.");
      }

      setProgress(100);
      setResult(payload);
      setArmModel(payload.armModel);
      setPreviewMode("character");
      setNotice(
        payload.referenceRebuilt
          ? "Reference rebuilt as a cleaned, game-ready 64×64 skin without redesigning it."
          : payload.referenceGuided
            ? "Reference pixels preserved. Lumora changed only the UV details requested in your prompt."
            : targetPart === "all"
              ? "Skin compiled and validated at 64×64."
              : `${PARTS.find((part) => part.id === targetPart)?.label} updated without changing the rest of the skin.`
      );
      refreshCredits();
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Skin generation failed.");
    } finally {
      window.setTimeout(() => setIsGenerating(false), 300);
    }
  };

  const downloadSkin = async () => {
    if (!result) return;
    try {
      const response = await fetch(result.skinUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${result.design.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "lumora-skin"}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setNotice("Minecraft-ready PNG downloaded.");
    } catch {
      setError("The skin could not be downloaded. Please try again.");
    }
  };

  const applyEditorAiEdit = async (
    command: string,
    editorTargetPart: MinecraftSkinPart,
    editorReference: string
  ) => {
    if (!result) throw new Error("Generate or rebuild a skin before using AI edits.");
    const response = await fetch("/api/tools/image/minecraft-skin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: command,
        armModel: result.armModel,
        style,
        targetPart: editorTargetPart,
        baseSkinUrl: result.skinUrl,
        referenceImage: editorReference,
        referenceMode: "guided",
      }),
    });
    const payload = await response.json() as GeneratedSkin & { success?: boolean; error?: string };
    if (!response.ok || !payload.success) {
      throw new Error(payload.error || "Lumora could not apply that AI edit.");
    }
    setResult(payload);
    setNotice("AI edit applied to the current skin while preserving every unrelated UV pixel.");
    refreshCredits();
  };

  const currentCost = referenceImage && referenceMode === "rebuild"
    ? (isPro ? 1 : 2)
    : targetPart === "all"
      ? (isPro ? 8 : 12)
      : (isPro ? 2 : 4);

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#06070b] shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-70" />

      <header className="relative border-b border-white/8 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-lg border border-cyan-300/25 bg-[linear-gradient(145deg,rgba(126,34,206,0.28),rgba(6,182,212,0.18))] shadow-[0_0_28px_rgba(34,211,238,0.12)]">
              <Box className="size-6 text-cyan-200" />
            </div>
            <div className="min-w-0">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/8 px-2.5 py-1 text-[10px] font-bold text-emerald-200">
                  UV-safe output
                </span>
                {isPro && (
                  <span className="rounded-full border border-violet-300/20 bg-violet-300/8 px-2.5 py-1 text-[10px] font-bold text-violet-200">
                    <Zap className="mr-1 inline size-3" />
                    Priority mode
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-white sm:text-2xl">Minecraft Skin Studio</h2>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                AI-directed character design, compiled into a valid game-ready texture.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold text-zinc-500">AVAILABLE</p>
              <p className="mt-0.5 text-sm font-bold text-white">{credits.toLocaleString()} credits</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-[10px] font-semibold text-zinc-500">THIS RENDER</p>
              <p className="mt-0.5 text-sm font-bold text-cyan-200">{currentCost} credits</p>
            </div>
          </div>
        </div>
      </header>

      <div className="relative grid min-w-0 grid-cols-1 xl:grid-cols-[minmax(320px,0.82fr)_minmax(0,1.18fr)]">
        <section className="min-w-0 border-b border-white/8 p-4 sm:p-6 xl:border-b-0 xl:border-r xl:p-8">
          <div className="space-y-7">
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <label htmlFor="skin-prompt" className="text-xs font-bold text-white">
                  Character brief
                </label>
                <span className="text-[11px] text-zinc-600">{prompt.length}/600</span>
              </div>
              <div className="relative">
                <textarea
                  id="skin-prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value.slice(0, 600))}
                  placeholder="Example: A frost knight with cracked ice armor, a pale blue visor, dark boots, and a small snowflake emblem..."
                  className="min-h-36 w-full resize-y rounded-lg border border-white/10 bg-black/35 px-4 py-4 pr-12 text-sm leading-6 text-white outline-none transition focus:border-cyan-300/45 focus:ring-2 focus:ring-cyan-300/10"
                />
                <Sparkles className="absolute right-4 top-4 size-5 text-violet-300" />
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {PROMPT_STARTERS.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => setPrompt(starter)}
                    className="min-h-11 shrink-0 rounded-md border border-white/10 bg-white/[0.03] px-3 text-left text-[11px] font-medium text-zinc-300 transition hover:border-violet-300/30 hover:bg-violet-400/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-white">Reference image</p>
                <span className="text-[11px] text-zinc-600">Optional</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => void handleReference(event.target.files?.[0])}
              />
              {referenceImage ? (
                <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/[0.045] p-3">
                  <div className="flex min-h-20 items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={referenceImage}
                      alt=""
                      className="size-16 rounded-md border border-white/10 object-cover [image-rendering:pixelated]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{referenceName}</p>
                      <p className="mt-1 text-xs leading-5 text-zinc-400">
                        {referenceMode === "rebuild"
                          ? "Preserve this texture's UV layout and original pixel design."
                          : referenceMode === "guided"
                            ? "Preserve the character identity, then apply explicit prompt changes."
                            : "Use its colors, outfit, and character cues as inspiration."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setReferenceImage(null);
                        setReferenceName(null);
                        setReferenceMode("guided");
                      }}
                      className="grid size-11 shrink-0 place-items-center rounded-md border border-white/10 text-zinc-400 transition hover:border-red-300/30 hover:bg-red-400/10 hover:text-red-200"
                      aria-label="Remove reference image"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-1 rounded-lg border border-white/10 bg-black/30 p-1 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setReferenceMode("rebuild")}
                      className={cn(
                        "min-h-12 rounded-md px-3 text-left transition",
                        referenceMode === "rebuild"
                          ? "bg-cyan-300/12 text-white shadow-sm"
                          : "text-zinc-500 hover:text-zinc-200"
                      )}
                    >
                      <span className="block text-xs font-bold">Rebuild this skin</span>
                      <span className="mt-0.5 block text-[10px]">Exact cleanup, no prompt edits</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReferenceMode("guided")}
                      className={cn(
                        "min-h-12 rounded-md px-3 text-left transition",
                        referenceMode === "guided"
                          ? "bg-blue-300/12 text-white shadow-sm"
                          : "text-zinc-500 hover:text-zinc-200"
                      )}
                    >
                      <span className="block text-xs font-bold">Guided remix</span>
                      <span className="mt-0.5 block text-[10px]">Reference + prompt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReferenceMode("inspire")}
                      className={cn(
                        "min-h-12 rounded-md px-3 text-left transition",
                        referenceMode === "inspire"
                          ? "bg-violet-300/12 text-white shadow-sm"
                          : "text-zinc-500 hover:text-zinc-200"
                      )}
                    >
                      <span className="block text-xs font-bold">Use as inspiration</span>
                      <span className="mt-0.5 block text-[10px]">For art and photos</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    void handleReference(event.dataTransfer.files?.[0]);
                  }}
                  className="flex min-h-24 w-full items-center gap-4 rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-4 text-left transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-md border border-white/10 bg-black/30">
                    <Upload className="size-5 text-cyan-200" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">Add character inspiration</span>
                    <span className="mt-1 block text-xs leading-5 text-zinc-500">PNG, JPG or WEBP · 8MB maximum</span>
                  </span>
                </button>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-3 text-xs font-bold text-white">Arm model</p>
                <div className="grid grid-cols-2 rounded-lg border border-white/10 bg-black/30 p-1">
                  {(["classic", "slim"] as const).map((model) => (
                    <button
                      key={model}
                      type="button"
                      onClick={() => setArmModel(model)}
                      className={cn(
                        "min-h-11 rounded-md px-3 text-xs font-semibold capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50",
                        armModel === model
                          ? "bg-white/10 text-white shadow-sm"
                          : "text-zinc-500 hover:text-zinc-200"
                      )}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs font-bold text-white">Pixel treatment</p>
                <select
                  value={style}
                  onChange={(event) => setStyle(event.target.value as StyleMode)}
                  className="min-h-12 w-full rounded-lg border border-white/10 bg-[#0b0c12] px-3 text-sm font-medium text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/10"
                >
                  {STYLE_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-bold text-white">Generate area</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 xl:grid-cols-2 2xl:grid-cols-5">
                {PARTS.map((part) => {
                  const Icon = part.icon;
                  const disabled = part.id !== "all" && !result;
                  return (
                    <button
                      key={part.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => setTargetPart(part.id)}
                      title={part.description}
                      className={cn(
                        "flex min-h-14 items-center gap-2 rounded-md border px-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50",
                        targetPart === part.id
                          ? "border-cyan-300/35 bg-cyan-300/10 text-white"
                          : "border-white/8 bg-white/[0.025] text-zinc-500 hover:border-white/15 hover:text-zinc-200",
                        disabled && "cursor-not-allowed opacity-35"
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="text-[11px] font-semibold">{part.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-3 rounded-lg border border-red-400/20 bg-red-400/8 p-4 text-sm leading-6 text-red-100"
                >
                  <X className="mt-0.5 size-4 shrink-0 text-red-300" />
                  <span>{error}</span>
                </motion.div>
              )}
              {!error && notice && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-3 rounded-lg border border-emerald-300/18 bg-emerald-300/[0.055] p-4 text-sm leading-6 text-emerald-100"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                  <span>{notice}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => void generate()}
              disabled={isGenerating}
              className="group relative flex min-h-14 w-full items-center justify-center overflow-hidden rounded-lg border border-cyan-200/25 bg-[linear-gradient(105deg,#7c3aed_0%,#2563eb_50%,#06b6d4_100%)] px-5 text-sm font-black text-white shadow-[0_16px_38px_rgba(37,99,235,0.22)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:cursor-wait disabled:opacity-70"
            >
              <span className="absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-white/20 blur-md transition-transform duration-700 group-hover:translate-x-[440%]" />
              <span className="relative flex items-center gap-2">
                {isGenerating ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Compiling skin · {progress}%
                  </>
                ) : (
                  <>
                    <Sparkles className="size-5" />
                    {referenceImage && referenceMode === "rebuild" && targetPart === "all"
                      ? "Rebuild reference skin"
                      : referenceImage && referenceMode === "guided" && targetPart === "all"
                        ? "Create guided remix"
                      : targetPart === "all"
                        ? "Generate Minecraft skin"
                        : `Regenerate ${targetPart}`}
                    <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px]">{currentCost}</span>
                  </>
                )}
              </span>
            </button>
            {isGenerating && (
              <div className="h-1 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-300"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.35 }}
                />
              </div>
            )}
          </div>
        </section>

        <section className="min-w-0 p-4 sm:p-6 xl:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold text-white">Live preview</p>
              <p className="mt-1 text-xs text-zinc-500">The preview and downloaded texture use the same pixels.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="grid grid-cols-3 rounded-lg border border-white/10 bg-black/30 p-1">
                <button
                  type="button"
                  onClick={() => setPreviewMode("character")}
                  className={cn(
                    "flex min-h-10 items-center gap-2 rounded-md px-3 text-xs font-semibold transition",
                    previewMode === "character" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"
                  )}
                >
                  <Eye className="size-4" />
                  3D
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("texture")}
                  className={cn(
                    "flex min-h-10 items-center gap-2 rounded-md px-3 text-xs font-semibold transition",
                    previewMode === "texture" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"
                  )}
                >
                  <ImageIcon className="size-4" />
                  Texture
                </button>
                <button
                  type="button"
                  disabled={!result}
                  onClick={() => setPreviewMode("editor")}
                  className={cn(
                    "flex min-h-10 items-center gap-2 rounded-md px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-30",
                    previewMode === "editor" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"
                  )}
                >
                  <Wand2 className="size-4" />
                  Edit
                </button>
              </div>
              {previewMode === "character" && result && (
                <button
                  type="button"
                  onClick={() => setAutoRotate((current) => !current)}
                  className={cn(
                    "grid size-11 place-items-center rounded-md border transition",
                    autoRotate
                      ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-200"
                      : "border-white/10 bg-white/[0.03] text-zinc-500"
                  )}
                  aria-label={autoRotate ? "Stop automatic rotation" : "Start automatic rotation"}
                  title={autoRotate ? "Stop automatic rotation" : "Start automatic rotation"}
                >
                  <RefreshCw className={cn("size-4", autoRotate && "animate-[spin_7s_linear_infinite]")} />
                </button>
              )}
            </div>
          </div>

          <div className="relative mt-5 overflow-hidden rounded-lg border border-white/10 bg-[#070810]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.13),transparent_35%),radial-gradient(circle_at_15%_90%,rgba(168,85,247,0.11),transparent_30%)]" />
            {result ? (
              previewMode === "character" ? (
                <SkinViewer
                  skinUrl={result.skinUrl}
                  armModel={result.armModel}
                  autoRotate={autoRotate}
                />
              ) : previewMode === "texture" ? (
                <div className="relative flex h-[420px] items-center justify-center p-8 sm:h-[520px]">
                  <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-[10px] font-semibold text-zinc-400">
                    64 × 64 PNG
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.skinUrl}
                    alt={`${result.design.name} skin texture`}
                    className="h-auto w-full max-w-[420px] border border-white/10 bg-black shadow-[0_18px_50px_rgba(0,0,0,0.45)] [image-rendering:pixelated]"
                  />
                </div>
              ) : (
                <MinecraftSkinEditor
                  skinUrl={result.skinUrl}
                  skinName={result.design.name}
                  armModel={result.armModel}
                  onSaved={(skinUrl) => {
                    setResult((current) => current ? { ...current, skinUrl } : current);
                    setNotice("Pixel edits saved. The 3D preview and download now use the edited texture.");
                  }}
                  onAiEdit={applyEditorAiEdit}
                />
              )
            ) : (
              <div className="relative flex h-[420px] flex-col items-center justify-center px-6 text-center sm:h-[520px]">
                <motion.div
                  animate={{ y: [0, -8, 0], rotateY: [0, 12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative grid size-24 place-items-center rounded-lg border border-violet-300/25 bg-[linear-gradient(145deg,rgba(124,58,237,0.22),rgba(6,182,212,0.12))] shadow-[0_0_55px_rgba(99,102,241,0.18)]"
                >
                  <Box className="size-11 text-cyan-100" />
                  <span className="absolute -right-2 -top-2 grid size-8 place-items-center rounded-full border border-cyan-200/25 bg-[#0a1020]">
                    <Sparkles className="size-4 text-violet-200" />
                  </span>
                </motion.div>
                <h3 className="mt-7 text-xl font-black text-white">Your character will appear here</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-500">
                  Describe the character, choose an arm model, and Lumora will compile a game-ready skin.
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-2">
                  {["Valid UV map", "Opaque base layer", "Java + Bedrock"].map((label) => (
                    <span key={label} className="rounded-full border border-white/8 bg-white/[0.025] px-3 py-1.5 text-[11px] font-medium text-zinc-400">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.025] p-4 sm:p-5">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-md border border-emerald-300/20 bg-emerald-300/8">
                    <BadgeCheck className="size-5 text-emerald-200" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-black text-white">{result.design.name}</h3>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                        {result.armModel}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-6 text-zinc-400">{result.design.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {[
                        ...(result.design.traits || []),
                        result.design.eyeShape === "angry" ? "angry eyes" : "",
                        result.design.facialHair !== "none" ? result.design.facialHair : "",
                        result.design.faceStyle !== "open" ? result.design.faceStyle : "",
                        result.design.pattern !== "clean" ? result.design.pattern : "",
                        result.design.emblem ? `${result.design.emblem} emblem` : "",
                      ].filter(Boolean).slice(0, 8).map((trait, index) => (
                        <span
                          key={`${trait}-${index}`}
                          className="rounded-full border border-blue-300/12 bg-blue-300/[0.055] px-2.5 py-1 text-[10px] font-medium capitalize text-blue-100"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Palette className="mr-1 size-4 text-zinc-500" />
                      {Object.entries(result.design.palette).slice(0, 9).map(([name, color]) => (
                        <span
                          key={name}
                          className="size-6 rounded-full border border-white/15 shadow-sm"
                          style={{ backgroundColor: color }}
                          title={`${name}: ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void downloadSkin()}
                className="flex min-h-14 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white px-6 text-sm font-black text-black transition hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 lg:min-h-full"
              >
                <Download className="size-5" />
                Download skin
              </button>
            </motion.div>
          )}
        </section>
      </div>

      <footer className="relative flex flex-col gap-3 border-t border-white/8 px-4 py-4 text-[11px] leading-5 text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Exports standard 64×64 PNG skins for classic and slim player models.</p>
        <p>Not an official Minecraft product. Not associated with Mojang or Microsoft.</p>
      </footer>
    </div>
  );
}
