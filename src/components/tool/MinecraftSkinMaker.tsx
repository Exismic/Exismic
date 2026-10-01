"use client";

import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  Box,
  Check,
  ChevronDown,
  Dices,
  Download,
  Eye,
  Footprints,
  Image as ImageIcon,
  Loader2,
  Palette,
  RefreshCw,
  ScanFace,
  Shirt,
  Upload,
  User,
  X,
  Zap,
  SlidersHorizontal,
  Scale,
  Paintbrush,
  Feather,
  Square,
  CircleDot,
  Glasses,
  Flame,
  Copy,
  LayoutGrid,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCredits } from "@/hooks/useCredits";
import { MinecraftIcon } from "@/components/ui/MinecraftIcon";
import { MinecraftSkinEditor } from "@/components/tool/MinecraftSkinEditor";
import { Minecraft3DStudioViewer } from "@/components/tool/Minecraft3DStudioViewer";
import { CreditModal } from "@/components/ui/CreditModal";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import { MinecraftBetaModal } from "@/components/tool/MinecraftBetaModal";
import {
  compileMinecraftSkin,
  createFallbackSkinDesign,
  type MinecraftArmModel,
  type MinecraftSkinDesign,
  type MinecraftSkinPalette,
  type MinecraftSkinPart,
  type MinecraftSkinStyle,
} from "@/lib/minecraft-skin";
import { compileMinecraftSkinBlueprint } from "@/lib/minecraft-skin-blueprint";

type PreviewMode = "character" | "texture" | "editor";
type StyleMode =
  | "balanced"
  | "detailed"
  | "anime"
  | "pixel-artist"
  | "minimal"
  | "pixel-detailed"
  | "high-contrast";

function toLegacySkinStyle(styleMode: StyleMode): MinecraftSkinStyle {
  switch (styleMode) {
    case "detailed":
    case "pixel-detailed":
    case "pixel-artist":
      return "pixel-detailed";
    case "minimal":
      return "minimal";
    case "anime":
      return "balanced";
    case "high-contrast":
      return "high-contrast";
    case "balanced":
    default:
      return "balanced";
  }
}
type ReferenceMode = "rebuild" | "guided" | "inspire";

interface GeneratedSkin {
  skinUrl: string;
  design: MinecraftSkinDesign;
  armModel: MinecraftArmModel;
  targetPart: MinecraftSkinPart;
  seed: number;
  referenceRebuilt?: boolean;
  referenceGuided?: boolean;
  renderer?: "blueprint" | "procedural";
  action?: "generate" | "variation" | "remix";
  parentGenerationId?: string | null;
  remixInstruction?: string | null;
  isVariation?: boolean;
}

export type EyeStyleMode = "anime" | "classic" | "glowing" | "minimal" | "visor";
export type MouthStyleMode = "smile" | "neutral" | "smirk" | "open" | "none";

export interface SkinBlueprint {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  prompt: string;
  armModel: MinecraftArmModel;
  style: StyleMode;
  eyeStyle: EyeStyleMode;
  mouthStyle: MouthStyleMode;
  palette: MinecraftSkinPalette;
  description: string;
  traits: string[];
}

export const MINECRAFT_BLUEPRINTS: SkinBlueprint[] = [
  {
    id: "cyber-samurai",
    name: "Cyber Samurai",
    subtitle: "High-Tech Katana Assassin",
    badge: "Cyberpunk",
    prompt: "Cyberpunk cyber samurai warrior with neon cyan glowing visor, matte black carbon armor, katana harness, and glowing circuitry trims",
    armModel: "classic",
    style: "balanced",
    eyeStyle: "visor",
    mouthStyle: "none",
    palette: {
      skin: "#f5d0b5",
      skinShade: "#d4a385",
      hair: "#0f172a",
      hairHighlight: "#38bdf8",
      eyes: "#06b6d4",
      top: "#090d16",
      topAccent: "#06b6d4",
      pants: "#0f172a",
      shoes: "#0284c7",
      detail: "#22d3ee",
    },
    description: "High-tech katana operative in matte carbon plate armor with glowing cyan visor and cybernetic harness.",
    traits: ["cyber visor", "carbon armor", "techwear straps", "cyan glow"],
  },
  {
    id: "frost-knight",
    name: "Frost Knight",
    subtitle: "Glacial Rune Guardian",
    badge: "Fantasy",
    prompt: "Frost knight in cracked glacial plate armor, pale crystalline visor, chilled ice pauldrons, fur cowl, and silver rune engravings",
    armModel: "classic",
    style: "detailed",
    eyeStyle: "glowing",
    mouthStyle: "neutral",
    palette: {
      skin: "#e2e8f0",
      skinShade: "#94a3b8",
      hair: "#f8fafc",
      hairHighlight: "#7dd3fc",
      eyes: "#38bdf8",
      top: "#1e293b",
      topAccent: "#38bdf8",
      pants: "#0f172a",
      shoes: "#0284c7",
      detail: "#bae6fd",
    },
    description: "Glacial warrior encased in chilled arctic steel with glowing runes and an armored helm.",
    traits: ["glacial armor", "chilled visor", "arctic fur", "rune pauldrons"],
  },
  {
    id: "astral-wizard",
    name: "Astral Wizard",
    subtitle: "Celestial Star Sorcerer",
    badge: "Mystic",
    prompt: "Celestial star wizard with midnight indigo hooded robes, gold constellation trims, starlight glow, and deep cosmic cowl",
    armModel: "slim",
    style: "anime",
    eyeStyle: "anime",
    mouthStyle: "smile",
    palette: {
      skin: "#fde2d0",
      skinShade: "#e2b8a0",
      hair: "#312e81",
      hairHighlight: "#818cf8",
      eyes: "#c084fc",
      top: "#1e1b4b",
      topAccent: "#fbbf24",
      pants: "#0f172a",
      shoes: "#4338ca",
      detail: "#fef08a",
    },
    description: "Astral spellcaster draped in deep midnight robes with gold star constellations and celestial eyes.",
    traits: ["star cowl", "gold trim", "constellation robe", "cosmic aura"],
  },
  {
    id: "cottagecore-alchemist",
    name: "Cottagecore Alchemist",
    subtitle: "Forest Botanist & Potion Crafter",
    badge: "Aesthetic",
    prompt: "Cozy cottagecore frog alchemist girl with pastel sage overalls, braided blonde bangs, potion pouch satchel, and gentle floral clips",
    armModel: "slim",
    style: "balanced",
    eyeStyle: "minimal",
    mouthStyle: "smile",
    palette: {
      skin: "#fde8d8",
      skinShade: "#e5c5b0",
      hair: "#fde047",
      hairHighlight: "#fef08a",
      eyes: "#10b981",
      top: "#84cc16",
      topAccent: "#fde047",
      pants: "#3f6212",
      shoes: "#78350f",
      detail: "#a3e635",
    },
    description: "Peaceful woodland herbalist in soft sage dungarees with braided hair and an alchemy satchel.",
    traits: ["sage overalls", "braided bangs", "potion satchel", "floral clips"],
  },
  {
    id: "shadow-shinobi",
    name: "Shadow Shinobi",
    subtitle: "Silent Night Infiltrator",
    badge: "Stealth",
    prompt: "Shadow ninja assassin with matte black cloth cowl, charcoal tactical wraps, crimson sash, and fingerless kunai gloves",
    armModel: "classic",
    style: "pixel-artist",
    eyeStyle: "classic",
    mouthStyle: "none",
    palette: {
      skin: "#e2c4b0",
      skinShade: "#c49f88",
      hair: "#18181b",
      hairHighlight: "#3f3f46",
      eyes: "#ef4444",
      top: "#09090b",
      topAccent: "#dc2626",
      pants: "#18181b",
      shoes: "#09090b",
      detail: "#ef4444",
    },
    description: "Stealth operative wrapped in charcoal cowl and matte shinobi bindings with a crimson sash.",
    traits: ["stealth cowl", "crimson sash", "tactical wraps", "kunai gloves"],
  },
  {
    id: "steampunk-aviator",
    name: "Steampunk Aviator",
    subtitle: "Skyfleet Gear Engineer",
    badge: "Industrial",
    prompt: "Steampunk sky pilot with distressed leather shearling bomber jacket, brass goggles over dark tousled hair, brass buckles, and rolled denim",
    armModel: "classic",
    style: "detailed",
    eyeStyle: "anime",
    mouthStyle: "smirk",
    palette: {
      skin: "#fad0b5",
      skinShade: "#d4a485",
      hair: "#292524",
      hairHighlight: "#78716c",
      eyes: "#0ea5e9",
      top: "#451a03",
      topAccent: "#d97706",
      pants: "#1e3a8a",
      shoes: "#292524",
      detail: "#f59e0b",
    },
    description: "Sky vessel mechanic in a sheepskin bomber jacket with brass flying goggles and utility gear.",
    traits: ["brass goggles", "leather bomber", "utility belt", "denim trousers"],
  },
];

function compileBlueprintToSkin(blueprint: SkinBlueprint): GeneratedSkin {
  const design: MinecraftSkinDesign = {
    name: blueprint.name,
    description: blueprint.description,
    hairStyle: "short",
    outfit: "casual",
    expression: "calm-confident",
    eyeShape: "normal",
    eyeStyle: blueprint.eyeStyle,
    mouthStyle: blueprint.mouthStyle,
    facialHair: "none",
    faceStyle: blueprint.id === "cyber-samurai" ? "visor" : "open",
    sleeves: "long",
    gloves: true,
    footwear: "boots",
    pattern: "clean",
    emblem: "",
    traits: blueprint.traits,
    palette: blueprint.palette,
  };
  const seed = 998877;
  let newPixels: Uint8Array;
  try {
    newPixels = compileMinecraftSkinBlueprint(
      design,
      seed,
      blueprint.armModel,
      blueprint.style,
      blueprint.prompt
    );
  } catch {
    newPixels = compileMinecraftSkin(
      design,
      seed,
      blueprint.armModel,
      toLegacySkinStyle(blueprint.style),
      blueprint.prompt
    );
  }
  let skinUrl = "";
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const imgData = ctx.createImageData(64, 64);
      imgData.data.set(newPixels);
      ctx.putImageData(imgData, 0, 0);
      skinUrl = canvas.toDataURL("image/png");
    }
  }
  return {
    skinUrl,
    design,
    armModel: blueprint.armModel,
    targetPart: "all",
    seed,
    renderer: "blueprint",
  };
}

const PARTS: Array<{
  id: MinecraftSkinPart;
  label: string;
  description: string;
  icon: typeof User;
}> = [
  { id: "all", label: "Full Skin", description: "Rebuild entire texture", icon: User },
  { id: "head", label: "Head", description: "Face, hair, and headwear", icon: ScanFace },
  { id: "torso", label: "Torso", description: "Jacket, armor, or hoodie", icon: Shirt },
  { id: "arms", label: "Arms", description: "Sleeves, bracers, and gloves", icon: SlidersHorizontal },
  { id: "legs", label: "Legs", description: "Pants and combat boots", icon: Footprints },
];

const STYLE_OPTIONS: Array<{
  id: StyleMode;
  label: string;
  desc: string;
  icon: typeof Scale;
}> = [
  { id: "balanced", label: "Balanced", desc: "Harmonious anime shading & 3D contours", icon: Scale },
  { id: "detailed", label: "Detailed", desc: "High texture density & rich accessories", icon: SlidersHorizontal },
  { id: "anime", label: "Anime Aesthetic", desc: "Vibrant blocks & specular hair highlights", icon: Flame },
  { id: "pixel-artist", label: "Pixel Artist", desc: "Artisanal readability & crisp contours", icon: Paintbrush },
  { id: "minimal", label: "Minimal Clean", desc: "Clean flat aesthetic & subtle ambient shade", icon: Feather },
];

const EYE_OPTIONS: Array<{
  id: EyeStyleMode;
  label: string;
  desc: string;
  icon: typeof Eye;
}> = [
  { id: "anime", label: "Anime 2×2", desc: "Multi-tone iris gradient & specular shine", icon: Eye },
  { id: "classic", label: "Classic 2×1", desc: "Horizontal white sclera & colored pupil", icon: Square },
  { id: "glowing", label: "Glowing Solid", desc: "Solid luminous energy blocks", icon: Zap },
  { id: "minimal", label: "Minimal Dot", desc: "1×2 sleek indie dots under bangs", icon: CircleDot },
  { id: "visor", label: "Cyber Visor", desc: "Futuristic optic HUD & glowing beam", icon: Glasses },
];

const MOUTH_OPTIONS: Array<{
  id: MouthStyleMode;
  label: string;
  desc: string;
}> = [
  { id: "smile", label: "Smile", desc: "Soft friendly smile" },
  { id: "neutral", label: "Neutral", desc: "Subtle calm lip line" },
  { id: "smirk", label: "Smirk", desc: "Confident upward smirk" },
  { id: "open", label: "Open", desc: "Energetic open expression" },
  { id: "none", label: "Masked", desc: "Clean under-mask or faceless look" },
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

export function MinecraftSkinMaker() {
  const { credits, isPro, userId, refreshCredits, showUpsell, setShowUpsell } = useCredits();
  const [activeBlueprintId, setActiveBlueprintId] = useState<string>("cyber-samurai");
  const [prompt, setPrompt] = useState(MINECRAFT_BLUEPRINTS[0].prompt);
  const [gamertag, setGamertag] = useState("");
  const [isFetchingGamertag, setIsFetchingGamertag] = useState(false);
  const [armModel, setArmModel] = useState<MinecraftArmModel>("classic");
  const [style, setStyle] = useState<StyleMode>("balanced");
  const [eyeStyle, setEyeStyle] = useState<EyeStyleMode>("visor");
  const [mouthStyle, setMouthStyle] = useState<MouthStyleMode>("none");
  const [targetPart, setTargetPart] = useState<MinecraftSkinPart>("all");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceName, setReferenceName] = useState<string | null>(null);
  const [referenceMode, setReferenceMode] = useState<ReferenceMode>("guided");
  const [result, setResult] = useState<GeneratedSkin | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("character");
  const [autoRotate, setAutoRotate] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const styleDropdownRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState("Analyzing character design...");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [remixModalOpen, setRemixModalOpen] = useState(false);
  const [remixPrompt, setRemixPrompt] = useState("");
  const [isRemixing, setIsRemixing] = useState(false);
  const [isVarying, setIsVarying] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"craft" | "import">("craft");

  // Initial mount: Pre-load Blueprint #1 (Standard 3: Zero Dead Void)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const p = sp.get("prompt");
    if (p) {
      setPrompt(p);
      return;
    }
    const initialBp = MINECRAFT_BLUEPRINTS[0];
    const initialSkin = compileBlueprintToSkin(initialBp);
    setResult(initialSkin);
  }, []);

  const handleSelectBlueprint = (blueprint: SkinBlueprint) => {
    setActiveBlueprintId(blueprint.id);
    setPrompt(blueprint.prompt);
    setArmModel(blueprint.armModel);
    setStyle(blueprint.style);
    setEyeStyle(blueprint.eyeStyle);
    setMouthStyle(blueprint.mouthStyle);
    setReferenceImage(null);
    setReferenceName(null);
    setError(null);
    setNotice(null);

    const compiled = compileBlueprintToSkin(blueprint);
    setResult(compiled);
    setPreviewMode("character");
    setNotice(`Loaded ${blueprint.name}! You can spin the 3D model, customize face details, or download it immediately.`);
  };

  const handleImportGamertag = async (targetUsername?: string) => {
    const cleanUsername = (targetUsername || gamertag).trim();
    if (!cleanUsername) {
      setError("Enter a Minecraft player username first (e.g. Dream, Technoblade).");
      return;
    }
    setGamertag(cleanUsername);
    setIsFetchingGamertag(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/tools/image/minecraft-skin/fetch-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Could not find player "${cleanUsername}".`);
      }

      const skinUrl = data.dataUrl || data.skinUrl;
      const fallbackDesign = createFallbackSkinDesign(cleanUsername);
      fallbackDesign.name = `${cleanUsername}'s Skin`;

      setArmModel(data.armModel || "classic");
      setResult({
        skinUrl,
        design: fallbackDesign,
        armModel: data.armModel || "classic",
        targetPart: "all",
        seed: Math.floor(Math.random() * 1000000),
        referenceGuided: true,
      });
      setReferenceImage(skinUrl);
      setReferenceName(`${cleanUsername}.png`);
      setReferenceMode("guided");
      setPreviewMode("character");
      setNotice(`Imported ${cleanUsername}'s skin! You can view it in 3D studio or type instructions to remix it.`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to import player skin.";
      setError(errorMsg);
    } finally {
      setIsFetchingGamertag(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const s = sp.get("style") as StyleMode;
    if (s && ["balanced", "detailed", "anime", "pixel-artist", "minimal"].includes(s)) {
      setStyle(s);
    }
    const m = sp.get("armModel") as MinecraftArmModel;
    if (m === "classic" || m === "slim") {
      setArmModel(m);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (styleDropdownRef.current && !styleDropdownRef.current.contains(event.target as Node)) {
        setIsStyleDropdownOpen(false);
      }
    }
    if (isStyleDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isStyleDropdownOpen]);

  const enhancePromptWithAi = async () => {
    if (!prompt.trim()) {
      setError("Type a character idea first, e.g. 'shadow ninja' or 'frost knight'");
      return;
    }
    if (credits < 1) {
      setShowUpsell(true);
      setError("Prompt enhancement requires 1 credit.");
      return;
    }
    setIsEnhancingPrompt(true);
    setError(null);
    try {
      const response = await fetch("/api/tools/image/minecraft-skin/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        if (response.status === 403 || data.error?.toLowerCase().includes("credit")) {
          setShowUpsell(true);
        }
        throw new Error(data.error || "Could not optimize prompt.");
      }
      setPrompt(data.enhancedPrompt);
      setNotice("Prompt enhanced with AI! (1 credit used)");
      refreshCredits();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to enhance prompt.";
      setError(errorMsg);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  const handleSelectEyeStyle = (newEyeStyle: EyeStyleMode) => {
    setEyeStyle(newEyeStyle);
    if (result) {
      const updatedDesign: MinecraftSkinDesign = {
        ...result.design,
        eyeStyle: newEyeStyle,
      };
      let newPixels: Uint8Array;
      if (result.renderer === "blueprint") {
        try {
          newPixels = compileMinecraftSkinBlueprint(updatedDesign, result.seed, armModel, style, prompt);
        } catch {
          newPixels = compileMinecraftSkin(updatedDesign, result.seed, armModel, toLegacySkinStyle(style), prompt);
        }
      } else {
        newPixels = compileMinecraftSkin(updatedDesign, result.seed, armModel, toLegacySkinStyle(style), prompt);
      }
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const imgData = ctx.createImageData(64, 64);
        imgData.data.set(newPixels);
        ctx.putImageData(imgData, 0, 0);
        setResult({
          ...result,
          design: updatedDesign,
          skinUrl: canvas.toDataURL("image/png"),
        });
      }
    }
  };

  const handleSelectMouthStyle = (newMouthStyle: MouthStyleMode) => {
    setMouthStyle(newMouthStyle);
    if (result) {
      const updatedDesign: MinecraftSkinDesign = {
        ...result.design,
        mouthStyle: newMouthStyle,
      };
      let newPixels: Uint8Array;
      if (result.renderer === "blueprint") {
        try {
          newPixels = compileMinecraftSkinBlueprint(updatedDesign, result.seed, armModel, style, prompt);
        } catch {
          newPixels = compileMinecraftSkin(updatedDesign, result.seed, armModel, toLegacySkinStyle(style), prompt);
        }
      } else {
        newPixels = compileMinecraftSkin(updatedDesign, result.seed, armModel, toLegacySkinStyle(style), prompt);
      }
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const imgData = ctx.createImageData(64, 64);
        imgData.data.set(newPixels);
        ctx.putImageData(imgData, 0, 0);
        setResult({
          ...result,
          design: updatedDesign,
          skinUrl: canvas.toDataURL("image/png"),
        });
      }
    }
  };

  // Standard 4: Continuous Dynamic Progress Feedback Ticker
  useEffect(() => {
    if (!isGenerating && !isVarying && !isRemixing) {
      setProgress(0);
      return;
    }
    setProgress(12);
    setProgressStage("Interpreting character design...");

    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 95) return current;
        const increment = current < 35 ? 7 : current < 65 ? 4 : current < 85 ? 2 : 1;
        const next = Math.min(95, current + increment);
        if (next < 25) setProgressStage("Interpreting character concept...");
        else if (next < 50) setProgressStage("Composing 3D clothing, armor & colors...");
        else if (next < 75) setProgressStage("Mapping 64×64 UV texture coordinates...");
        else if (next < 90) setProgressStage("Shading lighting & specular highlights...");
        else setProgressStage("Rigging 3D player model in live studio...");
        return next;
      });
    }, 180);
    return () => window.clearInterval(timer);
  }, [isGenerating, isVarying, isRemixing]);

  useEffect(() => {
    if (result && targetPart !== "all" && armModel !== result.armModel) {
      setTargetPart("all");
      setNotice("Body silhouette changed. The next render will rebuild the full character.");
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
          ? "Skin-layout reference detected. Guided remix is active so Exismic preserves original pixels while applying prompt modifications."
          : "Reference photo added. Guided remix will capture color palette and character cues from your image."
      );
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not process this reference image.");
    }
  };

  const generate = async (overrideTargetPart?: MinecraftSkinPart) => {
    const activeTargetPart = overrideTargetPart || targetPart;
    if (!userId) {
      setError("Sign in to generate and save custom Minecraft skins.");
      return;
    }
    if (prompt.trim().length < 3) {
      setError("Describe the character you want to create.");
      return;
    }
    if (activeTargetPart !== "all" && !result) {
      setError("Generate a full skin before changing individual body parts.");
      return;
    }
    const partCost = referenceImage && referenceMode === "rebuild"
      ? (isPro ? 6 : 10)
      : activeTargetPart === "all"
        ? (isPro ? 16 : 25)
        : (isPro ? 2 : 4);

    if (credits < partCost) {
      setShowUpsell(true);
      setError(`This generation needs ${partCost} credits. Your balance is ${credits}.`);
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
          eyeStyle,
          mouthStyle,
          targetPart: activeTargetPart,
          baseSkinUrl: activeTargetPart === "all" ? undefined : result?.skinUrl,
          referenceImage: referenceImage || undefined,
          referenceMode,
        }),
      });
      const payload = await response.json() as GeneratedSkin & {
        success?: boolean;
        error?: string;
        needsUpgrade?: boolean;
      };
      if (!response.ok || !payload.success) {
        if (response.status === 403 || payload.needsUpgrade || payload.error?.toLowerCase().includes("credit") || payload.error?.toLowerCase().includes("balance")) {
          setShowUpsell(true);
        }
        throw new Error(payload.error || "Could not generate this skin.");
      }

      setProgress(100);
      setProgressStage("Character ready!");
      setResult(payload);
      setArmModel(payload.armModel);
      setPreviewMode("character");
      setNotice(
        payload.referenceRebuilt
          ? "Reference rebuilt as a clean, game-ready 64×64 texture."
          : payload.referenceGuided
            ? "Reference texture preserved. Prompt edits applied accurately to 3D model."
            : targetPart === "all"
              ? "Skin compiled and validated at 64×64."
              : `${PARTS.find((part) => part.id === targetPart)?.label} updated without changing other body parts.`
      );
      refreshCredits();
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Skin generation failed.");
    } finally {
      window.setTimeout(() => setIsGenerating(false), 300);
    }
  };

  const regenerateVariation = async () => {
    if (!userId) {
      setError("Sign in to generate and save Minecraft skins.");
      return;
    }
    if (!result) {
      setError("Generate a character first before regenerating variations.");
      return;
    }
    const cost = isPro ? 16 : 25;
    if (credits < cost) {
      setShowUpsell(true);
      setError(`Regenerating a variation needs ${cost} credits. Your balance is ${credits}.`);
      return;
    }

    setIsVarying(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/tools/image/minecraft-skin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim() || result.design.name,
          armModel,
          style,
          targetPart: "all",
          action: "variation",
          parentDesign: result.design,
          seed: result.seed,
        }),
      });
      const payload = (await response.json()) as GeneratedSkin & {
        success?: boolean;
        error?: string;
        needsUpgrade?: boolean;
      };
      if (!response.ok || !payload.success) {
        if (
          response.status === 403 ||
          payload.needsUpgrade ||
          payload.error?.toLowerCase().includes("credit")
        ) {
          setShowUpsell(true);
        }
        throw new Error(payload.error || "Could not generate variation.");
      }

      setProgress(100);
      setResult(payload);
      setArmModel(payload.armModel);
      setNotice(
        "Generated a fresh visual variation! Character identity, palette, and outfit preserved with new composition details."
      );
      refreshCredits();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to generate variation.";
      setError(errorMsg);
    } finally {
      setIsVarying(false);
    }
  };

  const handleRemix = async () => {
    if (!userId) {
      setError("Sign in to remix Minecraft skins.");
      return;
    }
    if (!result) {
      setError("Generate a character first before remixing.");
      return;
    }
    if (!remixPrompt.trim()) {
      setError("Describe the specific change you want to make.");
      return;
    }
    const cost = isPro ? 16 : 25;
    if (credits < cost) {
      setShowUpsell(true);
      setError(`Remixing needs ${cost} credits. Your balance is ${credits}.`);
      return;
    }

    setIsRemixing(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/tools/image/minecraft-skin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim() || result.design.name,
          armModel,
          style,
          targetPart: "all",
          action: "remix",
          parentDesign: result.design,
          remixInstruction: remixPrompt.trim(),
        }),
      });
      const payload = (await response.json()) as GeneratedSkin & {
        success?: boolean;
        error?: string;
        needsUpgrade?: boolean;
      };
      if (!response.ok || !payload.success) {
        if (
          response.status === 403 ||
          payload.needsUpgrade ||
          payload.error?.toLowerCase().includes("credit")
        ) {
          setShowUpsell(true);
        }
        throw new Error(payload.error || "Could not remix skin.");
      }

      setResult(payload);
      setArmModel(payload.armModel);
      setRemixModalOpen(false);
      setRemixPrompt("");
      setNotice(
        `Remix applied: "${payload.remixInstruction || remixPrompt.trim()}"! Unspecified features and character identity preserved.`
      );
      refreshCredits();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to remix skin.";
      setError(errorMsg);
    } finally {
      setIsRemixing(false);
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
      link.download = `${result.design.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "exismic-minecraft-skin"}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setNotice("Minecraft-ready 64×64 PNG texture downloaded.");
    } catch {
      setError("The skin could not be downloaded. Please try again.");
    }
  };

  const copyHex = (hex: string) => {
    void navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1800);
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
      throw new Error(payload.error || "Could not apply pixel edits.");
    }
    setResult(payload);
    setNotice("Pixel edits applied while preserving other body texture coordinates.");
    refreshCredits();
  };

  const currentCost = referenceImage && referenceMode === "rebuild"
    ? (isPro ? 6 : 10)
    : targetPart === "all"
      ? (isPro ? 16 : 25)
      : (isPro ? 2 : 4);

  const selectedStyleObj = STYLE_OPTIONS.find((s) => s.id === style) || STYLE_OPTIONS[0];
  const StyleIcon = selectedStyleObj.icon;

  return (
    <div className="space-y-8">
      {/* Studio Top Stage Frame */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#070913] shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
        {/* Subtle Cyber Grid Mask */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

        {/* Studio Command Header */}
        <header className="relative border-b border-white/[0.06] px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 sm:gap-5 min-w-0">
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-transparent shadow-[0_0_35px_rgba(6,182,212,0.25)]">
                <MinecraftIcon className="size-8 text-cyan-200" />
              </div>
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-black text-emerald-300">
                    <Check className="size-3" />
                    Java & Bedrock Ready
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-black text-cyan-200">
                    <Box className="size-3" />
                    64×64 HD Texture
                  </span>
                  {isPro && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-violet-500/15 px-3 py-1 text-[11px] font-black text-violet-200">
                      <Zap className="size-3" />
                      Priority Studio
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-black text-white sm:text-3xl tracking-tight">
                  Minecraft Skin Studio
                </h1>
                <p className="mt-1 text-sm text-zinc-400 max-w-2xl leading-relaxed">
                  Craft authentic custom Minecraft character skins. Inspect in interactive 3D, customize poses, and export game-ready textures.
                </p>
              </div>
            </div>

            {/* Telemetry Counter Cards */}
            <div className="flex items-center gap-3 shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5 backdrop-blur-xl shadow-inner">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Available Vault</p>
                <p className="mt-0.5 text-base font-black text-white">{credits.toLocaleString()} credits</p>
              </div>
              <div className="h-9 w-px bg-white/10" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Generation Cost</p>
                <p className="mt-0.5 text-base font-black text-cyan-300">{currentCost} credits</p>
              </div>
            </div>
          </div>
        </header>

        {/* Spacious 12-Column Two-Column Studio Layout */}
        <div className="relative grid min-w-0 grid-cols-1 xl:grid-cols-12 gap-8 p-6 sm:p-8 lg:p-10">
          {/* =========================================================================
              LEFT COLUMN: Craft Console (5 cols on 2xl, 6 on xl)
             ========================================================================= */}
          <section className="xl:col-span-6 2xl:col-span-5 space-y-6">
            {/* Card 1: Describe Character Concept */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#090c17]/90 p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-white">Describe Your Character</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Specify outfit, armor, hairstyle, accessories, or themes.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={enhancePromptWithAi}
                    disabled={isEnhancingPrompt || !prompt.trim()}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-cyan-400/35 bg-cyan-500/15 hover:bg-cyan-500/25 px-3 py-1.5 text-xs font-black text-cyan-200 shadow-md transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                    title="Expand your idea into a detailed, aesthetic Minecraft prompt using AI (1 credit)"
                  >
                    {isEnhancingPrompt ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin text-cyan-300" />
                        <span>Optimizing...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="size-3.5 text-cyan-300" />
                        <span>Enhance with AI</span>
                        <span className="rounded-full bg-cyan-400/25 px-1.5 py-0.5 text-[9px] font-black">1 cr</span>
                      </>
                    )}
                  </button>
                  <span className="text-xs font-semibold text-zinc-500">{prompt.length}/2000</span>
                </div>
              </div>

              <div className="relative">
                <textarea
                  id="skin-prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value.slice(0, 2000))}
                  placeholder="Example: Cyberpunk cyber samurai warrior with neon cyan glowing visor, matte black carbon armor, katana harness, and glowing circuitry trims..."
                  className="min-h-32 w-full resize-y rounded-xl border border-white/10 bg-black/40 p-4 text-sm leading-relaxed text-white placeholder-zinc-500 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/15"
                />
              </div>

              {/* 1-Tap Quick Style Starters */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Quick Prompt Inspirations:</p>
                <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                  {MINECRAFT_BLUEPRINTS.map((bp) => (
                    <button
                      key={bp.id}
                      type="button"
                      onClick={() => setPrompt(bp.prompt)}
                      className="shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-cyan-500/10 hover:border-cyan-400/30 px-3 py-1.5 text-left text-xs font-medium text-zinc-300 hover:text-cyan-200 transition-colors cursor-pointer"
                    >
                      {bp.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 2: Character Aesthetics & Silhouette */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#090c17]/90 p-5 sm:p-6 shadow-xl space-y-5">
              <h3 className="text-sm font-black text-white">Body Silhouette & Art Style</h3>

              {/* Arm Model (Silhouette) */}
              <div>
                <p className="mb-2.5 text-xs font-bold text-zinc-400">Body Silhouette (Arm Model)</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {(["classic", "slim"] as const).map((model) => {
                    const isSelected = armModel === model;
                    return (
                      <button
                        key={model}
                        type="button"
                        onClick={() => setArmModel(model)}
                        className={cn(
                          "rounded-xl border p-3.5 text-left transition cursor-pointer flex items-center justify-between",
                          isSelected
                            ? "border-cyan-400/50 bg-cyan-500/15 text-white shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                            : "border-white/10 bg-black/30 text-zinc-400 hover:border-white/20 hover:text-white"
                        )}
                      >
                        <div>
                          <p className="text-xs font-black capitalize text-white">
                            {model === "classic" ? "Classic (Steve)" : "Slim (Alex)"}
                          </p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {model === "classic" ? "Standard 4-pixel arms" : "Narrow 3-pixel arms"}
                          </p>
                        </div>
                        {isSelected && <Check className="size-4 text-cyan-300 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visual Art Style Dropdown */}
              <div className="relative" ref={styleDropdownRef}>
                <p className="mb-2 text-xs font-bold text-zinc-400">Visual Art Style</p>
                <button
                  type="button"
                  onClick={() => setIsStyleDropdownOpen((prev) => !prev)}
                  className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-left transition hover:border-cyan-400/30 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <StyleIcon className="size-4 text-cyan-300 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">{selectedStyleObj.label}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{selectedStyleObj.desc}</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "size-4 text-zinc-400 transition-transform shrink-0",
                      isStyleDropdownOpen && "rotate-180 text-cyan-300"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {isStyleDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 6 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute left-0 right-0 top-full z-50 mt-2 space-y-1 rounded-2xl border border-white/15 bg-[#090b14]/98 p-2 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(6,182,212,0.15)] backdrop-blur-2xl"
                    >
                      {STYLE_OPTIONS.map((option) => {
                        const isSelected = style === option.id;
                        const OptIcon = option.icon;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setStyle(option.id);
                              setIsStyleDropdownOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left transition cursor-pointer",
                              isSelected
                                ? "border border-cyan-400/30 bg-cyan-500/15 text-white"
                                : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <OptIcon className={cn("size-4 shrink-0", isSelected ? "text-cyan-300" : "text-zinc-400")} />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white">{option.label}</p>
                                <p className="text-[10px] text-zinc-400 truncate">{option.desc}</p>
                              </div>
                            </div>
                            {isSelected && <Check className="size-4 shrink-0 text-cyan-300" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Eye Style & Facial Expression */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-zinc-400">Eye Aesthetics (Instant Switching: 0 Credits)</p>
                  <span className="text-[10px] text-emerald-400 font-bold">Free Live Recompile</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EYE_OPTIONS.map((option) => {
                    const isSelected = eyeStyle === option.id;
                    const OptIcon = option.icon;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelectEyeStyle(option.id)}
                        className={cn(
                          "flex items-center justify-between gap-2.5 rounded-xl border p-2.5 text-left transition cursor-pointer",
                          isSelected
                            ? "border-cyan-400/50 bg-cyan-500/15 text-white shadow-sm"
                            : "border-white/5 bg-black/30 text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <OptIcon className={cn("size-3.5 shrink-0", isSelected ? "text-cyan-300" : "text-zinc-400")} />
                          <p className="text-xs font-bold text-white whitespace-nowrap">{option.label}</p>
                        </div>
                        {isSelected && <Check className="size-3.5 text-cyan-300 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Mouth & Expression Row */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-zinc-400">Mouth & Lip Line:</span>
                    <span className="text-[11px] text-cyan-300 font-bold capitalize">{mouthStyle}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 rounded-xl border border-white/10 bg-black/40 p-1.5">
                    {MOUTH_OPTIONS.map((option) => {
                      const isSelected = mouthStyle === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleSelectMouthStyle(option.id)}
                          className={cn(
                            "rounded-lg py-2 px-1 text-center text-xs font-bold capitalize transition cursor-pointer",
                            isSelected
                              ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/30 shadow-sm"
                              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                          )}
                          title={option.desc}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Gamertag Importer & Reference Photo (Drawer Tabs) */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#090c17]/90 p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("craft")}
                    className={cn(
                      "text-xs font-bold pb-1 transition border-b-2 cursor-pointer",
                      activeTab === "craft"
                        ? "border-cyan-400 text-white"
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    Import Player Skin
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("import")}
                    className={cn(
                      "text-xs font-bold pb-1 transition border-b-2 cursor-pointer",
                      activeTab === "import"
                        ? "border-cyan-400 text-white"
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    Image Reference
                  </button>
                </div>
                <span className="text-[10px] text-zinc-500 font-medium">Optional Tools</span>
              </div>

              {activeTab === "craft" ? (
                /* Gamertag Importer */
                <div className="space-y-3">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Fetch any public Java or Bedrock Minecraft skin instantly into your 3D workspace.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={gamertag}
                      onChange={(e) => setGamertag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void handleImportGamertag();
                        }
                      }}
                      placeholder="Enter Minecraft username (e.g. Dream)"
                      className="h-11 flex-1 rounded-xl border border-white/10 bg-black/40 px-3.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                    />
                    <button
                      type="button"
                      onClick={() => void handleImportGamertag()}
                      disabled={isFetchingGamertag || !gamertag.trim()}
                      className="h-11 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-xs font-black text-white flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      {isFetchingGamertag ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Download className="size-4" />
                      )}
                      <span>Import</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                    <span className="text-[11px] text-zinc-500 font-semibold shrink-0">Popular:</span>
                    {["Dream", "Technoblade", "MumboJumbo", "GeorgeNotFound"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => void handleImportGamertag(tag)}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-400/30 text-[11px] text-zinc-300 hover:text-cyan-200 transition-colors shrink-0 cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Reference Image Upload */
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(event) => void handleReference(event.target.files?.[0])}
                  />
                  {referenceImage ? (
                    <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/[0.05] p-3.5 space-y-3">
                      <div className="flex items-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={referenceImage}
                          alt=""
                          className="size-16 rounded-lg border border-white/10 object-cover [image-rendering:pixelated]"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-black text-white">{referenceName}</p>
                          <p className="mt-1 text-[11px] text-zinc-400 leading-normal">
                            {referenceMode === "rebuild"
                              ? "Clean 64×64 rebuild preserving exact UV textures."
                              : referenceMode === "guided"
                                ? "Guided remix applying your prompt edits."
                                : "Used as color and theme inspiration."}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setReferenceImage(null);
                            setReferenceName(null);
                            setReferenceMode("guided");
                          }}
                          className="grid size-10 shrink-0 place-items-center rounded-lg border border-white/10 text-zinc-400 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                          aria-label="Remove reference image"
                        >
                          <X className="size-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-white/10 bg-black/40 p-1">
                        <button
                          type="button"
                          onClick={() => setReferenceMode("rebuild")}
                          className={cn(
                            "py-2 px-1 text-center rounded-lg text-xs font-bold transition cursor-pointer",
                            referenceMode === "rebuild"
                              ? "bg-cyan-500/25 text-white"
                              : "text-zinc-500 hover:text-zinc-300"
                          )}
                        >
                          Rebuild Skin
                        </button>
                        <button
                          type="button"
                          onClick={() => setReferenceMode("guided")}
                          className={cn(
                            "py-2 px-1 text-center rounded-lg text-xs font-bold transition cursor-pointer",
                            referenceMode === "guided"
                              ? "bg-cyan-500/25 text-white"
                              : "text-zinc-500 hover:text-zinc-300"
                          )}
                        >
                          Guided Remix
                        </button>
                        <button
                          type="button"
                          onClick={() => setReferenceMode("inspire")}
                          className={cn(
                            "py-2 px-1 text-center rounded-lg text-xs font-bold transition cursor-pointer",
                            referenceMode === "inspire"
                              ? "bg-cyan-500/25 text-white"
                              : "text-zinc-500 hover:text-zinc-300"
                          )}
                        >
                          Inspiration
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex min-h-24 w-full items-center gap-4 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-left transition hover:border-cyan-400/40 hover:bg-cyan-500/[0.03] cursor-pointer"
                    >
                      <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/40">
                        <Upload className="size-5 text-cyan-300" />
                      </span>
                      <span>
                        <span className="block text-xs font-black text-white">Upload Reference Texture or Art</span>
                        <span className="mt-1 block text-[11px] text-zinc-500">PNG, JPG or WEBP · 8MB maximum</span>
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Card 4: Target Area & Primary Action Button */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#090c17]/90 p-5 sm:p-6 shadow-xl space-y-4">
              <div>
                <p className="mb-2.5 text-xs font-bold text-zinc-400">Target Body Part</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2">
                  {PARTS.map((part) => {
                    const Icon = part.icon;
                    const disabled = part.id !== "all" && !result;
                    const isSelected = targetPart === part.id;
                    return (
                      <button
                        key={part.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => setTargetPart(part.id)}
                        title={part.description}
                        className={cn(
                          "flex items-center justify-center sm:justify-start gap-2 rounded-xl border px-3 py-2.5 text-left transition cursor-pointer select-none",
                          isSelected
                            ? "border-cyan-400/50 bg-cyan-500/15 text-white shadow-[0_0_12px_rgba(6,182,212,0.18)]"
                            : "border-white/10 bg-black/30 text-zinc-400 hover:border-white/20 hover:text-white",
                          disabled && "cursor-not-allowed opacity-35"
                        )}
                      >
                        <Icon className="size-4 shrink-0 text-cyan-300/80" />
                        <span className="text-xs font-bold whitespace-nowrap">{part.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status and Error Banners */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-xs leading-relaxed text-red-200"
                  >
                    <X className="mt-0.5 size-4 shrink-0 text-red-400" />
                    <span>{error}</span>
                  </motion.div>
                )}
                {!error && notice && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-xs leading-relaxed text-emerald-200"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                    <span>{notice}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={() => void generate()}
                disabled={isGenerating}
                className="group relative flex min-h-14 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 px-6 text-sm font-black text-white shadow-[0_10px_35px_rgba(6,182,212,0.35)] transition-all hover:shadow-[0_15px_45px_rgba(6,182,212,0.5)] hover:brightness-110 active:scale-[0.99] cursor-pointer disabled:opacity-60"
              >
                <span className="relative flex items-center justify-center gap-2.5 whitespace-nowrap">
                  {isGenerating ? (
                    <>
                      <Loader2 className="size-5 shrink-0 animate-spin" />
                      <span>{progressStage} [{progress}%]</span>
                    </>
                  ) : (
                    <>
                      <MinecraftIcon className="size-5 shrink-0" />
                      <span>
                        {referenceImage && referenceMode === "rebuild" && targetPart === "all"
                          ? "Rebuild Reference Skin"
                          : referenceImage && referenceMode === "guided" && targetPart === "all"
                            ? "Create Guided Remix"
                            : targetPart === "all"
                              ? "Generate Minecraft Character"
                              : `Regenerate ${targetPart}`}
                      </span>
                      <span className="rounded-full bg-black/40 px-2 py-0.5 text-xs font-black">
                        {currentCost} credits
                      </span>
                    </>
                  )}
                </span>
              </button>

              {/* Standard 4: High Frequency Smooth Asymptotic Progress Ticker */}
              {isGenerating && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>{progressStage}</span>
                    <span className="font-bold text-cyan-300">{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500"
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: "easeOut", duration: 0.2 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* =========================================================================
              RIGHT COLUMN: Spacious 3D Interactive Stage & Result Deck (7 cols on 2xl, 6 on xl)
             ========================================================================= */}
          <section className="xl:col-span-6 2xl:col-span-7 space-y-6">
            {/* Viewport Control Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/[0.07] bg-[#090c17]/90 px-5 py-3.5 shadow-xl">
              <div>
                <p className="text-xs font-black text-white">Live 3D Studio Stage</p>
                <p className="text-[11px] text-zinc-400">Spin, animate, inspect, and export your 64×64 texture.</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="grid grid-cols-3 rounded-xl border border-white/10 bg-black/40 p-1">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("character")}
                    className={cn(
                      "flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition cursor-pointer",
                      previewMode === "character" ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    <Eye className="size-3.5" />
                    3D View
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("texture")}
                    className={cn(
                      "flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition cursor-pointer",
                      previewMode === "texture" ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    <ImageIcon className="size-3.5" />
                    Texture
                  </button>
                  <button
                    type="button"
                    disabled={!result}
                    onClick={() => setPreviewMode("editor")}
                    className={cn(
                      "flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-30",
                      previewMode === "editor" ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    <Paintbrush className="size-3.5" />
                    Edit
                  </button>
                </div>

                {previewMode === "character" && result && (
                  <button
                    type="button"
                    onClick={() => setAutoRotate((current) => !current)}
                    className={cn(
                      "grid size-10 place-items-center rounded-xl border transition cursor-pointer",
                      autoRotate
                        ? "border-cyan-400/40 bg-cyan-500/20 text-cyan-200 shadow-sm"
                        : "border-white/10 bg-black/40 text-zinc-400 hover:text-white"
                    )}
                    aria-label={autoRotate ? "Stop automatic rotation" : "Start automatic rotation"}
                    title={autoRotate ? "Stop automatic rotation" : "Start automatic rotation"}
                  >
                    <RefreshCw className={cn("size-4", autoRotate && "animate-[spin_8s_linear_infinite]")} />
                  </button>
                )}
              </div>
            </div>

            {/* Spacious 3D Canvas / Texture / Pixel Editor */}
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#060812] shadow-2xl">
              {previewMode === "character" ? (
                <div className="relative">
                  <Minecraft3DStudioViewer
                    skinUrl={result ? result.skinUrl : "https://minotar.net/skin/MHF_Steve"}
                    armModel={result ? result.armModel : armModel}
                    autoRotate={autoRotate}
                    onAutoRotateChange={setAutoRotate}
                  />
                  {!result && (
                    <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-10">
                      <span className="rounded-full border border-cyan-400/30 bg-black/80 px-4 py-1.5 text-xs font-bold text-cyan-200 backdrop-blur-md shadow-2xl flex items-center gap-2">
                        <Box size={13} className="text-cyan-300" />
                        <span>Interactive 3D Studio</span>
                      </span>
                    </div>
                  )}
                </div>
              ) : previewMode === "texture" && result ? (
                <div className="relative flex min-h-[500px] sm:min-h-[580px] xl:min-h-[640px] items-center justify-center p-8">
                  <div className="absolute left-6 top-6 rounded-full border border-white/10 bg-black/60 px-4 py-1.5 text-xs font-semibold text-zinc-300 backdrop-blur-md">
                    Standard 64 × 64 PNG Pixel Map
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.skinUrl}
                    alt={`${result.design.name} skin texture`}
                    className="h-auto w-full max-w-[440px] border border-white/15 bg-black shadow-[0_25px_60px_rgba(0,0,0,0.6)] [image-rendering:pixelated]"
                  />
                </div>
              ) : previewMode === "editor" && result ? (
                <MinecraftSkinEditor
                  skinUrl={result.skinUrl}
                  skinName={result.design.name}
                  armModel={result.armModel}
                  onSaved={(skinUrl) => {
                    setResult((current) => current ? { ...current, skinUrl } : current);
                    setNotice("Pixel edits saved. The 3D preview and download now use your modified texture.");
                  }}
                  onAiEdit={applyEditorAiEdit}
                />
              ) : null}
            </div>

            {/* Result Inspector & Quick Action Deck */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/[0.08] bg-[#090c17]/95 p-6 shadow-2xl space-y-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Left: Info & Traits */}
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-emerald-400/30 bg-emerald-500/15">
                        <BadgeCheck className="size-5 text-emerald-300" />
                      </span>
                      <h2 className="text-lg font-black text-white">{result.design.name}</h2>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs font-semibold text-zinc-300 capitalize">
                        {result.armModel} model
                      </span>
                      {result.isVariation && (
                        <span className="rounded-full border border-violet-400/30 bg-violet-500/15 px-2.5 py-0.5 text-xs font-bold text-violet-200">
                          Variation
                        </span>
                      )}
                      {result.action === "remix" && (
                        <span className="rounded-full border border-cyan-400/30 bg-cyan-500/15 px-2.5 py-0.5 text-xs font-bold text-cyan-200">
                          Remixed
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">{result.design.description}</p>

                    {result.remixInstruction && (
                      <p className="text-xs text-cyan-300 font-semibold">
                        Remix request: &ldquo;{result.remixInstruction}&rdquo;
                      </p>
                    )}

                    {/* Detected Traits */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
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
                          className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold capitalize text-cyan-200"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>

                    {/* Color Swatches with 1-click Hex Copy */}
                    <div className="pt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Palette className="size-4 text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-400">Palette Swatches (Click to copy hex):</span>
                        {copiedColor && (
                          <span className="text-[11px] font-bold text-emerald-400">Copied {copiedColor}!</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {Object.entries(result.design.palette).slice(0, 10).map(([name, color]) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => copyHex(color)}
                            className="size-7 rounded-full border border-white/20 shadow-md transition-transform hover:scale-125 cursor-pointer relative group"
                            style={{ backgroundColor: color }}
                            title={`${name}: ${color} (Click to copy)`}
                          >
                            <span className="sr-only">{name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col shrink-0 justify-center">
                    {/* Download Skin */}
                    <button
                      type="button"
                      onClick={() => void downloadSkin()}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white hover:bg-zinc-100 text-black px-6 text-xs font-black shadow-lg transition-all active:scale-95 cursor-pointer"
                    >
                      <Download className="size-4" />
                      <span>Download 64×64 PNG</span>
                    </button>

                    {/* Regenerate Variation */}
                    <button
                      type="button"
                      onClick={() => void regenerateVariation()}
                      disabled={isVarying || isGenerating}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-violet-400/35 bg-violet-600/20 hover:bg-violet-600/30 text-violet-200 px-5 text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                      title="Generate a new visual variation while preserving character identity"
                    >
                      {isVarying ? (
                        <>
                          <Loader2 className="size-4 animate-spin text-violet-300" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Dices className="size-4 text-violet-300" />
                          <span>Regenerate Variation</span>
                          <span className="rounded-full bg-violet-400/20 px-1.5 py-0.5 text-[10px] font-black">{isPro ? 16 : 25} cr</span>
                        </>
                      )}
                    </button>

                    {/* Remix Features */}
                    <button
                      type="button"
                      onClick={() => {
                        setRemixPrompt("");
                        setRemixModalOpen(true);
                      }}
                      disabled={isGenerating || isVarying}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-cyan-400/35 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 px-5 text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                      title="Modify specific character features while preserving the rest of the skin"
                    >
                      <SlidersHorizontal className="size-4 text-cyan-300" />
                      <span>Remix Features</span>
                      <span className="rounded-full bg-cyan-400/20 px-1.5 py-0.5 text-[10px] font-black">{isPro ? 16 : 25} cr</span>
                    </button>
                  </div>
                </div>

                {/* Integrated Retention & Export Bar */}
                <div className="pt-2 border-t border-white/5">
                  <ResultRetentionBar
                    toolType="minecraft-skin-maker"
                    toolName="Minecraft Skin Studio"
                    title={result.design.name}
                    content={`Character: ${result.design.name}\nDescription: ${result.design.description}\nSilhouette: ${result.armModel}\nStyle: ${style}\nPalette: ${Object.entries(result.design.palette).map(([k, v]) => `${k}: ${v}`).join(", ")}`}
                    fileUrl={result.skinUrl}
                    downloadLabel="Download PNG"
                    downloadAction={downloadSkin}
                    onCopy={() => {
                      void navigator.clipboard.writeText(result.skinUrl);
                      setNotice("Texture data copied to clipboard.");
                    }}
                  />
                </div>
              </motion.div>
            )}
          </section>
        </div>

        {/* =========================================================================
            1-CLICK BLUEPRINTS GALLERY (Standard 3: Zero Dead Void Policy)
            Placed directly below the workspace to inspire immediate exploration!
           ========================================================================= */}
        <div className="border-t border-white/[0.08] bg-[#060811] px-6 py-8 sm:px-8 sm:py-10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <LayoutGrid className="size-4 text-cyan-400" />
                <h3 className="text-base font-black text-white">Curated Character Blueprints</h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Instant 1-click popular character archetypes ready for 3D inspection and immediate download.
              </p>
            </div>
            <span className="text-[11px] text-zinc-500 font-semibold">1-Tap Fast Switch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
            {MINECRAFT_BLUEPRINTS.map((bp) => {
              const isActive = activeBlueprintId === bp.id;
              return (
                <button
                  key={bp.id}
                  type="button"
                  onClick={() => handleSelectBlueprint(bp)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-all cursor-pointer relative group flex flex-col justify-between",
                    isActive
                      ? "border-cyan-400/50 bg-cyan-500/15 shadow-[0_0_25px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/30"
                      : "border-white/10 bg-[#090c17] hover:border-white/20 hover:bg-white/[0.04]"
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-cyan-500/15 border border-cyan-400/30 px-2 py-0.5 text-[10px] font-black text-cyan-200">
                        {bp.badge}
                      </span>
                      {isActive && <Check className="size-3.5 text-cyan-300" />}
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-white group-hover:text-cyan-200 transition-colors">
                        {bp.name}
                      </h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {bp.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-2 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center -space-x-1.5">
                      {[bp.palette.topAccent, bp.palette.eyes, bp.palette.shoes].map((col, idx) => (
                        <span
                          key={idx}
                          className="size-3.5 rounded-full border border-black"
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-cyan-300 group-hover:underline">
                      Load & Render
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <footer className="relative flex flex-col gap-2 border-t border-white/[0.06] px-6 py-4 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>Exports standard 64×64 PNG textures for Minecraft Java & Bedrock Edition.</p>
          <p>Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.</p>
        </footer>
      </div>

      {/* Character Remix Modal */}
      <AnimatePresence>
        {remixModalOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRemixModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-[#090b14] p-6 sm:p-7 shadow-[0_30px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(6,182,212,0.2)]"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl border border-cyan-400/30 bg-cyan-500/15 text-cyan-300">
                    <SlidersHorizontal className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Remix Character Features</h3>
                    <p className="text-xs text-zinc-400">Modify specific elements while locking the core character look.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRemixModalOpen(false)}
                  className="grid size-8 place-items-center rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {result && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.skinUrl}
                    alt=""
                    className="size-12 rounded-lg border border-white/15 bg-black object-cover [image-rendering:pixelated]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{result.design.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{result.design.description}</p>
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-3">
                <label htmlFor="remix-input" className="text-xs font-bold text-white">
                  What would you like to modify?
                </label>
                <textarea
                  id="remix-input"
                  value={remixPrompt}
                  onChange={(e) => setRemixPrompt(e.target.value.slice(0, 500))}
                  placeholder="Examples: 'Change the hoodie to a red bomber jacket', 'Make hair silver and shorter', 'Add cyberpunk headphones', 'Remove glasses'..."
                  className="min-h-24 w-full resize-none rounded-xl border border-white/10 bg-black/40 p-3.5 text-xs leading-relaxed text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                />

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-zinc-500 font-semibold self-center">Try:</span>
                  {[
                    "Change hoodie to red bomber jacket",
                    "Make hair silver and shorter",
                    "Add cyberpunk headphones",
                    "Remove glasses",
                    "Change pants to wide cargos",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRemixPrompt(preset)}
                      className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] text-zinc-400 hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-200 transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <span>Cost:</span>
                  <span className="font-bold text-cyan-300">{isPro ? 16 : 25} credits</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRemixModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRemix}
                    disabled={isRemixing || !remixPrompt.trim()}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-black text-white shadow-lg hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isRemixing ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Remixing...</span>
                      </>
                    ) : (
                      <>
                        <SlidersHorizontal className="size-3.5" />
                        <span>Apply Remix</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Out of Credits / Pro Upsell Modal */}
      <CreditModal
        isOpen={showUpsell}
        onClose={() => setShowUpsell(false)}
        plan={isPro ? "pro" : "free"}
        credits={credits}
      />

      {/* Beta Feedback & Welcome Modal */}
      <MinecraftBetaModal />
    </div>
  );
}
