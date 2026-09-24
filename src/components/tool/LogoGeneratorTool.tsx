"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stamp,
  Download,
  RefreshCw,
  Image as ImageIcon,
  History,
  Maximize2,
  X,
  Palette,
  Laptop,
  Eye,
  Check,
  LayoutGrid,
  Type,
  Shapes,
  Gem,
  Crown,
  Cpu,
  Flame,
  Boxes,
  Award,
  Sun,
  Moon,
  Grid,
  SlidersHorizontal,
  Shuffle,
  Zap,
  Sliders,
  FileText,
  Copy,
  CheckCircle2,
  Share2,
  Lock,
  Layers,
  Smartphone,
  CreditCard,
  Shirt,
  Monitor,
  Globe,
  SlidersVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getFunctionalStorageItem, setFunctionalStorageItem } from "@/lib/cookie-consent";
import axios from "axios";
import { useCredits } from "@/hooks/useCredits";
import { saveFileHistory } from "@/lib/history";
import { MediaPipelineBar } from "./MediaPipelineBar";
import { ResultRetentionBar } from "./ResultRetentionBar";

interface LogoGeneratorOptions {
  brandName: string;
  slogan: string;
  concept: string;
  layout: "combination" | "icon-only" | "text-only";
  stylePreset: string;
  backgroundType: "transparent" | "solid-dark" | "solid-light" | "solid-custom" | "gradient";
  colorPalette: string;
  customColors: string;
  bgCustomColor: string;
  tolerance: number;
}

const TOOL_CREDIT_COST = 20;

const LOGO_LAYOUTS = [
  { id: "combination", name: "Icon + Name", icon: LayoutGrid, desc: "Balanced symbol and brand name typography" },
  { id: "icon-only", name: "Icon Only", icon: Shapes, desc: "Pure symbol, ideal for app icons & favicons" },
  { id: "text-only", name: "Wordmark Only", icon: Type, desc: "Custom typography & stylized brand lettering" }
];

const STYLE_PRESETS = [
  {
    id: "minimal",
    name: "Minimalist",
    icon: Layers,
    badge: "Clean Geometry",
    suffix: "minimalist vector design, simple clean geometry, negative space, flat vector style, Swiss design style, pure and clean logo concept",
    desc: "Clean shapes & negative space"
  },
  {
    id: "modern",
    name: "Modern Sleek",
    icon: Gem,
    badge: "Contemporary",
    suffix: "sleek modern style, high contrast, clean lines, contemporary branding, professional aesthetic, corporate identity",
    desc: "Contemporary sleek lines"
  },
  {
    id: "vintage",
    name: "Vintage Emblem",
    icon: Stamp,
    badge: "Heritage",
    suffix: "vintage retro style, heritage emblem, classic engraving, rustic insignia, hand-drawn vector detailing, stamps style",
    desc: "Classic crests & badges"
  },
  {
    id: "tech",
    name: "Tech & Digital",
    icon: Cpu,
    badge: "Cybernetic",
    suffix: "cutting-edge technology branding, digital microchip elements, circuit geometric lines, cybernetic theme, abstract tech design",
    desc: "Circuit lines & software marks"
  },
  {
    id: "luxury",
    name: "Luxury & Gold",
    icon: Crown,
    badge: "Prestige",
    suffix: "luxury gold and dark premium brand identity, elegant thin lines, prestigious emblem, high-end high-class sophistication, premium crest",
    desc: "Prestigious crests & gold accents"
  },
  {
    id: "gaming",
    name: "Gaming Mascot",
    icon: Flame,
    badge: "Esports",
    suffix: "gaming team esports logo, bold mascot, sharp energetic vector graphics, high contrast, aggressive shapes, cool team badge",
    desc: "Bold esports & character marks"
  },
  {
    id: "abstract",
    name: "Abstract Concept",
    icon: Boxes,
    badge: "Conceptual",
    suffix: "abstract conceptual symbol, artistic shape, creative double meaning, modern art branding, unique symbol",
    desc: "Creative symbols & dynamic forms"
  }
];

const BACKGROUND_TYPES = [
  {
    id: "transparent",
    name: "Pure White",
    icon: Sun,
    desc: "Solid white backdrop, 1-click transparency ready",
    suffix: "isolated on a clean, solid, pure white background, flat graphic design, centered"
  },
  {
    id: "solid-dark",
    name: "Obsidian Charcoal",
    icon: Moon,
    desc: "High-contrast dark presentation",
    suffix: "set against a solid, clean, flat charcoal dark gray background, centered"
  },
  {
    id: "solid-light",
    name: "Neutral Gray",
    icon: Grid,
    desc: "Clean light corporate presentation",
    suffix: "set against a solid, clean, flat neutral light gray background, centered"
  },
  {
    id: "gradient",
    name: "Glow Gradient",
    icon: Palette,
    desc: "Modern dynamic studio backdrop",
    suffix: "set against a smooth, modern, elegant gradient background with vibrant colorful tones, aesthetic branding presentation"
  },
  {
    id: "solid-custom",
    name: "Custom Color",
    icon: SlidersHorizontal,
    desc: "Specify your custom brand color or hex",
    suffix: "set against a solid, clean, flat custom color background, centered"
  }
];

const COLOR_PALETTES = [
  { id: "luxury", name: "Luxury Obsidian", colors: ["#f59e0b", "#d97706", "#18181b"], desc: "Solaris amber gold and deep carbon" },
  { id: "tech", name: "Cool Tech", colors: ["#06b6d4", "#3b82f6", "#6366f1"], desc: "Cyan, royal cobalt, and indigo" },
  { id: "emerald", name: "Nordic Emerald", colors: ["#10b981", "#059669", "#064e3b"], desc: "Lush greens and fresh organic mint" },
  { id: "sunset", name: "Solar Flare", colors: ["#f43f5e", "#fb923c", "#facc15"], desc: "Warm coral, tangerine, and gold" },
  { id: "cyber", name: "Neon Cyber", colors: ["#a855f7", "#06b6d4", "#ec4899"], desc: "Electric purple, cyan, and magenta" },
  { id: "nordic", name: "Titanium Slate", colors: ["#ffffff", "#94a3b8", "#0f172a"], desc: "Pure white, slate, and deep onyx" }
];

const INSPIRATION_PROMPTS = [
  "A futuristic geometric falcon head composed of precision circuit lines, sharp angular aerodynamics, tech startup emblem.",
  "Minimalist line-art coffee bean sprouting an organic leaf with clean circular negative space, single line stroke.",
  "Prestigious luxury crest featuring an architectural pillar and geometric gold shield, thin elegant lines.",
  "Dynamic stylized robotic cyber wolf head with aggressive geometric angles and high-contrast bold silhouette.",
  "Minimalist mountain peak intersecting a rising sun inside a continuous circular vector path.",
  "Abstract interlocking origami letter mark with translucent gradient shadows and sharp facets.",
  "Modern fintech monogram featuring two intersecting diamond shields with clean negative space.",
  "Cybernetic electric hummingbird hovering in mid-flight with neon circuit tail feathers."
];

interface Blueprint {
  id: string;
  brandName: string;
  slogan: string;
  tag: string;
  concept: string;
  layout: "combination" | "icon-only" | "text-only";
  stylePreset: string;
  colorPalette: string;
  backgroundType: "transparent" | "solid-dark" | "solid-light" | "solid-custom" | "gradient";
  svgDataUri: string;
}

// 4 High-fidelity $0 compute demonstration blueprints encoded as clean vector SVGs
const INSTANT_BLUEPRINTS: Blueprint[] = [
  {
    id: "apex-cybernetics",
    brandName: "Apex",
    slogan: "Autonomous Intelligence",
    tag: "AI & Tech Startup",
    concept: "A futuristic geometric falcon head composed of gold and obsidian circuit lines, sharp angular aerodynamics, tech startup icon",
    layout: "combination",
    stylePreset: "tech",
    colorPalette: "luxury",
    backgroundType: "solid-dark",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%"><rect width="800" height="800" fill="%230c0d12"/><g transform="translate(400, 310)"><path d="M0 -140 L120 -40 L90 70 L0 140 L-90 70 L-120 -40 Z" fill="none" stroke="%23f59e0b" stroke-width="8" stroke-linejoin="round"/><path d="M0 -110 L90 -25 L65 55 L0 105 L-65 55 L-90 -25 Z" fill="rgba(245,158,11,0.12)" stroke="%23fbbf24" stroke-width="4" stroke-linejoin="round"/><path d="M0 -80 L60 -15 L0 60 L-60 -15 Z" fill="%23f59e0b"/><circle cx="0" cy="-15" r="14" fill="%230c0d12"/><line x1="0" y1="-140" x2="0" y2="-180" stroke="%23f59e0b" stroke-width="4" stroke-linecap="round"/><line x1="120" y1="-40" x2="160" y2="-60" stroke="%23f59e0b" stroke-width="4" stroke-linecap="round"/><line x1="-120" y1="-40" x2="-160" y2="-60" stroke="%23f59e0b" stroke-width="4" stroke-linecap="round"/></g><text x="400" y="550" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="52" fill="%23ffffff" letter-spacing="14" text-anchor="middle">APEX</text><text x="400" y="600" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="16" fill="%23f59e0b" letter-spacing="8" text-anchor="middle">AUTONOMOUS INTELLIGENCE</text></svg>`
  },
  {
    id: "aura-coffee",
    brandName: "Aura",
    slogan: "Artisanal Craft Coffee",
    tag: "Artisan & Organic",
    concept: "Minimalist line-art coffee bean sprouting an organic leaf with clean circular negative space, single line stroke",
    layout: "combination",
    stylePreset: "minimal",
    colorPalette: "emerald",
    backgroundType: "solid-dark",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%"><rect width="800" height="800" fill="%2305130d"/><g transform="translate(400, 310)"><circle cx="0" cy="0" r="130" fill="none" stroke="%2310b981" stroke-width="6" stroke-dasharray="8 6" opacity="0.4"/><circle cx="0" cy="0" r="115" fill="none" stroke="%2334d399" stroke-width="4"/><path d="M-40 40 C-80 -20, -20 -90, 40 -80 C80 -20, 20 70, -40 40 Z" fill="rgba(16,185,129,0.15)" stroke="%2334d399" stroke-width="6" stroke-linejoin="round"/><path d="M-30 30 Q0 -10, 30 -70" fill="none" stroke="%2334d399" stroke-width="6" stroke-linecap="round"/><path d="M30 -70 C60 -110, 90 -110, 95 -90 C95 -70, 70 -55, 30 -70 Z" fill="%2310b981"/></g><text x="400" y="550" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="48" fill="%23ffffff" letter-spacing="12" text-anchor="middle">AURA</text><text x="400" y="600" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="15" fill="%2334d399" letter-spacing="7" text-anchor="middle">ARTISANAL CRAFT COFFEE</text></svg>`
  },
  {
    id: "vanguard-capital",
    brandName: "Vanguard",
    slogan: "Private Wealth Partners",
    tag: "Finance & Prestige",
    concept: "Prestigious luxury crest featuring an architectural pillar and geometric gold shield, thin elegant lines",
    layout: "combination",
    stylePreset: "luxury",
    colorPalette: "luxury",
    backgroundType: "solid-dark",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%"><rect width="800" height="800" fill="%230d0c0b"/><g transform="translate(400, 310)"><path d="M0 -130 L110 -60 L110 30 Q110 110, 0 150 Q-110 110, -110 30 L-110 -60 Z" fill="rgba(245,158,11,0.08)" stroke="%23f59e0b" stroke-width="6" stroke-linejoin="round"/><path d="M0 -110 L90 -50 L90 25 Q90 90, 0 130 Q-90 90, -90 25 L-90 -50 Z" fill="none" stroke="%23fbbf24" stroke-width="2"/><path d="M-40 -50 L40 -50 L30 -35 L-30 -35 Z" fill="%23fbbf24"/><line x1="-25" y1="-35" x2="-25" y2="40" stroke="%23fbbf24" stroke-width="6" stroke-linecap="round"/><line x1="0" y1="-35" x2="0" y2="40" stroke="%23fbbf24" stroke-width="6" stroke-linecap="round"/><line x1="25" y1="-35" x2="25" y2="40" stroke="%23fbbf24" stroke-width="6" stroke-linecap="round"/><path d="M-45 50 L45 50 L35 40 L-35 40 Z" fill="%23fbbf24"/><polygon points="0,-90 -25,-60 25,-60" fill="%23f59e0b"/></g><text x="400" y="550" font-family="Georgia, serif" font-weight="700" font-size="44" fill="%23ffffff" letter-spacing="10" text-anchor="middle">VANGUARD</text><text x="400" y="600" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="14" fill="%23f59e0b" letter-spacing="6" text-anchor="middle">PRIVATE WEALTH PARTNERS</text></svg>`
  },
  {
    id: "titan-gaming",
    brandName: "Titan",
    slogan: "Pro Esports League",
    tag: "Esports Mascot",
    concept: "Dynamic stylized robotic cyber wolf head with aggressive geometric angles and high-contrast bold silhouette",
    layout: "icon-only",
    stylePreset: "gaming",
    colorPalette: "cyber",
    backgroundType: "solid-dark",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%"><rect width="800" height="800" fill="%23090514"/><g transform="translate(400, 310)"><polygon points="0,-140 120,-60 120,60 0,140 -120,60 -120,-60" fill="none" stroke="%23a855f7" stroke-width="6" stroke-linejoin="round"/><path d="M0 -100 L45 -40 L90 -70 L65 0 L80 50 L0 110 L-80 50 L-65 0 L-90 -70 L-45 -40 Z" fill="rgba(168,85,247,0.2)" stroke="%2306b6d4" stroke-width="6" stroke-linejoin="round"/><polygon points="25,-10 40,-5 25,0" fill="%2306b6d4"/><polygon points="-25,-10 -40,-5 -25,0" fill="%2306b6d4"/><path d="M0 30 L15 65 L0 85 L-15 65 Z" fill="%23a855f7"/></g><text x="400" y="550" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="52" fill="%23ffffff" letter-spacing="12" text-anchor="middle">TITAN</text><text x="400" y="600" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="15" fill="%2306b6d4" letter-spacing="7" text-anchor="middle">PRO ESPORTS LEAGUE</text></svg>`
  }
];

export function LogoGeneratorTool() {
  const { deductCredits, credits, isPro, userId, loading: creditsLoading, setShowUpsell } = useCredits();
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [history, setHistory] = useState<{ url: string; brandName: string; prompt: string; createdAt: string }[]>([]);
  const [activeTab, setActiveTab] = useState<"generate" | "mockups" | "history">("generate");
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [estimatedTime, setEstimatedTime] = useState(4.5);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Background removal / transparency states
  const [transparentLogoUrl, setTransparentLogoUrl] = useState<string | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgRemovalEnabled, setBgRemovalEnabled] = useState(false);

  // Decimal countdown timer
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

  // Load history from localStorage
  useEffect(() => {
    const stored = getFunctionalStorageItem("exismic_logo_history");
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
      colorPalette: "luxury",
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
  const concept = watch("concept");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

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
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
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
          const g = data[i + 1];
          const b = data[i + 2];

          // Color distance formula
          const dist = Math.sqrt(
            Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
          );

          if (dist < currentTolerance) {
            data[i + 3] = 0; // set alpha to fully transparent
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

  const handleApplyBlueprint = (blueprint: Blueprint) => {
    setValue("brandName", blueprint.brandName);
    setValue("slogan", blueprint.slogan);
    setValue("concept", blueprint.concept);
    setValue("layout", blueprint.layout);
    setValue("stylePreset", blueprint.stylePreset);
    setValue("colorPalette", blueprint.colorPalette);
    setValue("backgroundType", blueprint.backgroundType);
    setResults([blueprint.svgDataUri]);
    setBgRemovalEnabled(false);
    showToast(`Loaded "${blueprint.brandName}" blueprint ($0 preview)`);
  };

  const onSubmit = async (data: LogoGeneratorOptions) => {
    if (!data.concept.trim()) {
      setError("Please describe your logo concept before generating.");
      return;
    }

    if (!userId && !creditsLoading) {
      setError(
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1">
          <div>
            <p className="font-bold text-white text-sm">Account sign-in required</p>
            <p className="text-xs text-zinc-400">Please sign in to your Exismic account to design and save brand logos.</p>
          </div>
          <a
            href="/auth"
            className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all shadow-md"
          >
            Sign In
          </a>
        </div>
      );
      return;
    }

    if (credits < TOOL_CREDIT_COST) {
      setError(
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1">
          <div>
            <p className="font-bold text-white text-sm">Low credit balance</p>
            <p className="text-xs text-zinc-400">
              You need {TOOL_CREDIT_COST} credits to generate a brand logo. Your current balance is {credits} credits.
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
    setBgRemovalEnabled(false);

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
      const styleObj = STYLE_PRESETS.find((s) => s.id === data.stylePreset);
      const styleText = styleObj ? styleObj.suffix : "modern clean style";

      // 3. Background type
      let bgText = "";
      if (data.backgroundType === "solid-custom" && data.bgCustomColor.trim()) {
        bgText = `set against a solid, clean, flat ${data.bgCustomColor.trim()} background, centered`;
      } else {
        const bgObj = BACKGROUND_TYPES.find((b) => b.id === data.backgroundType);
        bgText = bgObj ? bgObj.suffix : "solid white background";
      }

      // 4. Color Palette
      let colorText = "";
      if (data.customColors.trim()) {
        colorText = `utilizing a professional brand color scheme of ${data.customColors.trim()}`;
      } else {
        const paletteObj = COLOR_PALETTES.find((p) => p.id === data.colorPalette);
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
        n: 1,
        toolId: "ai-logo"
      });

      if (resp.data.success) {
        const newUrl = resp.data.imageUrl;
        setResults([newUrl]);

        // Auto-enable transparent background key-out on transparent layouts
        if (data.backgroundType === "transparent") {
          setBgRemovalEnabled(true);
        }

        const newHistoryItem = {
          url: newUrl,
          brandName: data.brandName || "Brand Logo",
          prompt: finalPrompt,
          createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };

        setHistory((prev) => {
          const updated = [newHistoryItem, ...prev];
          setFunctionalStorageItem("exismic_logo_history", JSON.stringify(updated.slice(0, 30)));
          return updated;
        });

        // Deduct client-side cache credits
        deductCredits(TOOL_CREDIT_COST);

        // Record to master file history
        saveFileHistory({
          toolType: "logo-generator",
          originalName: data.brandName ? `${data.brandName} Logo` : "Brand Logo Concept",
          resultUrl: newUrl,
          fileType: "image",
          status: "completed",
          metadata: {
            prompt: finalPrompt,
            brandName: data.brandName,
            slogan: data.slogan,
            style: data.stylePreset,
            palette: data.colorPalette,
            layout: data.layout,
            targetHref: "/tools/ai/logo",
            toolName: "AI Logo Generator"
          }
        });

        showToast("Brand logo created successfully!");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError(
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1">
            <div>
              <p className="font-bold text-white text-sm">Account sign-in required</p>
              <p className="text-xs text-zinc-400">Please sign in to your Exismic account to design and save brand logos.</p>
            </div>
            <a
              href="/auth"
              className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all shadow-md"
            >
              Sign In
            </a>
          </div>
        );
        return;
      }

      let errorMsg = "Failed to generate logo. Please try again.";
      let needsUpgrade = false;

      if (axios.isAxiosError(err)) {
        needsUpgrade = Boolean(err.response?.data?.needsUpgrade) || err.response?.status === 403;
        if (err.response?.data && typeof err.response.data === "object" && "error" in err.response.data) {
          errorMsg = String(err.response.data.error);
        } else if (err.response?.status === 404) {
          errorMsg = "Generation service is initializing. Please try again.";
        } else if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
          errorMsg = "Generation took longer than usual. Please try again with a simpler concept.";
        } else if (!err.response) {
          errorMsg = "Network connection interrupted. Please check your internet connection.";
        }
      }

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

  const handleDownload = async (url: string, transparent = false) => {
    const targetUrl = transparent && transparentLogoUrl ? transparentLogoUrl : url;
    try {
      const response = await fetch(targetUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const safeName = (brandName || "brand").toLowerCase().replace(/\s+/g, "-");
      link.download = `${safeName}-logo${transparent ? "-transparent" : ""}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      showToast("Download started!");
    } catch (err) {
      console.error("Download failed", err);
      showToast("Download failed. Please try again.");
    }
  };

  const handleCopyImage = async (url: string) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 1024;
      canvas.height = img.naturalHeight || 1024;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No canvas context");
      ctx.drawImage(img, 0, 0);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Blob conversion failed");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      showToast("Picture copied to clipboard!");
    } catch (e) {
      console.error(e);
      showToast("Failed to copy picture.");
    }
  };

  const handleExportSvg = () => {
    if (!logoToRender) return;
    const safeName = brandName || "Brand";
    const safeSlogan = slogan || "";
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <style>
      .brand-title { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-weight: 800; font-size: 44px; fill: #ffffff; text-anchor: middle; letter-spacing: 6px; }
      .brand-slogan { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-weight: 600; font-size: 16px; fill: #f59e0b; text-anchor: middle; letter-spacing: 4px; }
    </style>
  </defs>
  <rect width="1024" height="1024" fill="${selectedBg === "transparent" ? "none" : selectedBg === "solid-light" ? "#f4f4f5" : "#0c0d12"}" />
  <image href="${logoToRender}" x="112" y="112" width="800" height="800" preserveAspectRatio="xMidYMid meet" />
  ${safeName ? `<text x="512" y="930" class="brand-title">${safeName.toUpperCase()}</text>` : ""}
  ${safeSlogan ? `<text x="512" y="965" class="brand-slogan">${safeSlogan.toUpperCase()}</text>` : ""}
</svg>`;
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${safeName.toLowerCase().replace(/\s+/g, "-")}-vector-logo.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    showToast("SVG wrapper exported!");
  };

  const handleShufflePrompt = () => {
    const random = INSPIRATION_PROMPTS[Math.floor(Math.random() * INSPIRATION_PROMPTS.length)];
    setValue("concept", random);
  };

  const logoToRender = transparentLogoUrl || (results.length > 0 ? results[0] : null);

  return (
    <div className="w-full space-y-6 pb-6 lg:pb-2 text-left selection:bg-amber-500/30">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* ========================================================================= */}
        {/* 1. LEFT COLUMN: STUDIO CONTROLS CONSOLE (xl:col-span-4)                  */}
        {/* ========================================================================= */}
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
                <Stamp className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300/90">
                  Logo Studio Config
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Brand Name & Tagline */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2">
                  <Type className="w-3.5 h-3.5 text-amber-400" />
                  Brand Identity
                </label>
                <input
                  type="text"
                  {...register("brandName")}
                  placeholder="Brand Name (e.g. Apex, Aura, Horizon)"
                  className="w-full bg-[#07070a] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-zinc-650 outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 transition-all font-medium"
                />
                <input
                  type="text"
                  {...register("slogan")}
                  placeholder="Tagline or Slogan (e.g. Autonomous Intelligence)"
                  className="w-full bg-[#07070a] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-zinc-650 outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 transition-all font-medium"
                />
              </div>

              <div className="h-px bg-white/5" />

              {/* Logo Layout Type */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2">
                    <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
                    Layout Structure
                  </label>
                  <span className="text-[10px] font-bold text-amber-400/80 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    {LOGO_LAYOUTS.find((l) => l.id === selectedLayout)?.name}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {LOGO_LAYOUTS.map((lay) => {
                    const isSelected = selectedLayout === lay.id;
                    const LayIcon = lay.icon;
                    return (
                      <button
                        key={lay.id}
                        type="button"
                        onClick={() => setValue("layout", lay.id as LogoGeneratorOptions["layout"])}
                        className={cn(
                          "p-3 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between group",
                          isSelected
                            ? "bg-amber-500/15 border-amber-400/60 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                            : "bg-white/[0.03] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] hover:border-white/10"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                              isSelected
                                ? "bg-amber-400/20 text-amber-300"
                                : "bg-white/5 text-zinc-500 group-hover:text-zinc-300"
                            )}
                          >
                            <LayIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[11px] font-black uppercase tracking-wider">{lay.name}</div>
                            <div className="text-[9px] text-zinc-500 font-medium">{lay.desc}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-white/5" />

              {/* Style Presets */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2">
                    <Gem className="w-3.5 h-3.5 text-amber-400" />
                    Branding Style
                  </label>
                  <span className="text-[10px] font-bold text-amber-400/80 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    {STYLE_PRESETS.find((s) => s.id === selectedStyle)?.name}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {STYLE_PRESETS.map((preset) => {
                    const isSelected = selectedStyle === preset.id;
                    const PresetIcon = preset.icon;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setValue("stylePreset", preset.id)}
                        className={cn(
                          "p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all duration-300 group",
                          isSelected
                            ? "bg-amber-500/15 border-amber-400/60 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                            : "bg-white/[0.03] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] hover:border-white/10"
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div
                            className={cn(
                              "w-7 h-7 rounded-xl flex items-center justify-center transition-colors",
                              isSelected
                                ? "bg-amber-400/20 text-amber-300"
                                : "bg-white/5 text-zinc-500 group-hover:text-zinc-300"
                            )}
                          >
                            <PresetIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500">
                            {preset.badge}
                          </span>
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-wider leading-tight">
                            {preset.name}
                          </div>
                          <div className="text-[8px] text-zinc-500 truncate leading-relaxed mt-0.5">
                            {preset.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-white/5" />

              {/* Color Palette */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                    Color Palette
                  </label>
                  <span className="text-[10px] font-bold text-amber-400/80 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    {COLOR_PALETTES.find((p) => p.id === selectedPalette)?.name}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {COLOR_PALETTES.map((pal) => {
                    const isSelected = selectedPalette === pal.id && !customColors;
                    return (
                      <button
                        key={pal.id}
                        type="button"
                        onClick={() => {
                          setValue("colorPalette", pal.id);
                          setValue("customColors", "");
                        }}
                        className={cn(
                          "p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all duration-300",
                          isSelected
                            ? "bg-amber-500/15 border-amber-400/60 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                            : "bg-white/[0.03] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] hover:border-white/10"
                        )}
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider truncate">
                          {pal.name}
                        </span>
                        <div className="flex gap-1.5 items-center">
                          {pal.colors.map((c, i) => (
                            <div
                              key={i}
                              className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  {...register("customColors")}
                  placeholder="Or enter custom colors (e.g. Gold, Midnight Navy, White)"
                  className="w-full bg-[#07070a] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-650 outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 transition-all font-medium mt-1"
                />
              </div>

              <div className="h-px bg-white/5" />

              {/* Background Backdrop Selection */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Canvas Background
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {BACKGROUND_TYPES.map((bg) => {
                    const isSelected = selectedBg === bg.id;
                    const BgIcon = bg.icon;
                    return (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => setValue("backgroundType", bg.id as LogoGeneratorOptions["backgroundType"])}
                        className={cn(
                          "p-3 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between group",
                          isSelected
                            ? "bg-amber-500/15 border-amber-400/60 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                            : "bg-white/[0.03] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] hover:border-white/10"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                              isSelected
                                ? "bg-amber-400/20 text-amber-300"
                                : "bg-white/5 text-zinc-500 group-hover:text-zinc-300"
                            )}
                          >
                            <BgIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[11px] font-black uppercase tracking-wider">{bg.name}</div>
                            <div className="text-[9px] text-zinc-500 font-medium">{bg.desc}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                {selectedBg === "solid-custom" && (
                  <input
                    type="text"
                    {...register("bgCustomColor")}
                    placeholder="Custom color name or hex (e.g. #0a0f1d, Emerald Green)"
                    className="w-full bg-[#07070a] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-650 outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 transition-all font-medium mt-1"
                  />
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-amber-500/15 bg-white/[0.02] flex items-center justify-between">
              <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">
                Exismic Brand Engine
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                <span className="text-[9px] font-bold text-zinc-400 uppercase">Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. RIGHT COLUMN: CONCEPT DRAFT & INTERACTIVE WORKSPACE (xl:col-span-8)   */}
        {/* ========================================================================= */}
        <div className="xl:col-span-8 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Concept Input Card */}
            <div className="rounded-[2.5rem] bg-[#0c0d12]/90 border border-amber-500/20 backdrop-blur-2xl shadow-[0_0_50px_rgba(245,158,11,0.06)] p-6 sm:p-7 relative overflow-hidden group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    Describe Your Logo Concept
                  </label>
                  <button
                    type="button"
                    onClick={handleShufflePrompt}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider transition-all border border-amber-400/20"
                  >
                    <Shuffle className="w-3 h-3" />
                    Inspire Me
                  </button>
                </div>
                <textarea
                  {...register("concept")}
                  rows={4}
                  placeholder="Describe your logo concept in detail (e.g. 'A sleek geometric falcon head composed of precision circuit lines, sharp angular aerodynamics, tech startup emblem' or 'Minimalist coffee bean sprouting an organic leaf with clean circular negative space')..."
                  className="w-full bg-[#07070a] border border-white/10 rounded-2xl p-4 text-sm sm:text-base text-white placeholder:text-zinc-650 outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    {concept.length} Characters
                  </span>
                  <div className="h-3 w-px bg-white/10" />
                  <span className="text-[10px] font-bold text-emerald-400/90 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" />
                    High Quality Vector Preset
                  </span>
                </div>

                {/* Primary Generate Button */}
                <button
                  type="submit"
                  disabled={isGenerating}
                  className={cn(
                    "px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-amber-950 font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all flex items-center gap-3 relative overflow-hidden group border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]",
                    isGenerating
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:scale-[1.02] active:scale-95 hover:shadow-[0_0_40px_rgba(245,158,11,0.7)]"
                  )}
                >
                  {/* Sheen sweep */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-950" />
                      <span>Designing Logo...</span>
                    </>
                  ) : (
                    <>
                      <Stamp className="w-4 h-4 text-amber-950" />
                      <span>Design Brand Logo</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-950/20 text-amber-950 text-[9px] font-black tracking-widest border border-amber-950/20">
                        {TOOL_CREDIT_COST} Credits
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center bg-[#09090c] border border-white/5 p-1 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("generate")}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === "generate"
                    ? "bg-amber-400/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] border border-amber-400/30"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Eye className="w-3.5 h-3.5" />
                Studio Canvas
              </button>
              <button
                type="button"
                disabled={results.length === 0}
                onClick={() => setActiveTab("mockups")}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed",
                  activeTab === "mockups"
                    ? "bg-amber-400/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] border border-amber-400/30"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Laptop className="w-3.5 h-3.5" />
                Mockup Previews
                {results.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === "history"
                    ? "bg-amber-400/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] border border-amber-400/30"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <History className="w-3.5 h-3.5" />
                History
                {history.length > 0 && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/10 text-zinc-400 font-bold">
                    {history.length}
                  </span>
                )}
              </button>
            </div>

            {results.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyImage(logoToRender || results[0])}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-[10px] font-black uppercase tracking-wider transition-all border border-white/5 flex items-center gap-2"
                >
                  <Copy className="w-3 h-3 text-amber-400" />
                  Copy Picture
                </button>
                <button
                  type="button"
                  onClick={() => setFullscreenImage(logoToRender || results[0])}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-white/5"
                  title="Expand Fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 3. DISPLAY STAGE (TAB CONTENT)                                            */}
          {/* ========================================================================= */}
          <div className="min-h-[480px]">
            <AnimatePresence mode="wait">
              {/* TAB A: STUDIO CANVAS */}
              {activeTab === "generate" && (
                <motion.div
                  key="canvas-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {error && (
                    <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold animate-shake">
                      {error}
                    </div>
                  )}

                  {/* Main Studio Canvas Frame */}
                  <div className="rounded-[2.5rem] bg-[#0c0d12]/90 border border-amber-500/20 backdrop-blur-2xl shadow-[0_0_50px_rgba(245,158,11,0.06)] overflow-hidden">
                    {/* macOS Titlebar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/15 bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-amber-400/80 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-widest">
                          1024 × 1024 Vector Frame
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
                          {brandName || "Logo Stage"}
                        </span>
                      </div>
                    </div>

                    {/* Canvas Stage Body */}
                    <div className="p-6 sm:p-10 flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden">
                      {isGenerating ? (
                        <div className="text-center space-y-6 relative z-10 p-8 max-w-md">
                          <div className="relative w-28 h-28 mx-auto">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 rounded-full border-t-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                            />
                            <motion.div
                              animate={{ rotate: -360 }}
                              transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-2 rounded-full border-b-2 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Stamp className="w-7 h-7 text-amber-400 animate-pulse" />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h3 className="text-xl font-black text-white tracking-tight uppercase italic">
                              Designing Brand Logo...
                            </h3>
                            <div className="flex flex-col items-center gap-2">
                              {isPro && (
                                <div className="px-3.5 py-1 rounded-full bg-amber-300/10 border border-amber-300/30 flex items-center gap-2 text-[9px] font-black tracking-widest uppercase text-amber-200 shadow-[0_0_22px_rgba(251,191,36,0.12)]">
                                  <Zap className="w-3 h-3 fill-amber-200" />
                                  Priority Mode
                                </div>
                              )}
                              <div className="px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-amber-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                <span>Estimated wait: ~{estimatedTime}s</span>
                              </div>
                              <p className="text-zinc-500 font-bold text-[9px] uppercase tracking-[0.2em] mt-1">
                                Synthesizing sharp vector shapes on clean background
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : results.length > 0 ? (
                        <div className="w-full flex flex-col items-center gap-8 relative z-10">
                          {/* Centered Logo Preview Container */}
                          <div
                            className={cn(
                              "w-72 h-72 sm:w-88 sm:h-88 rounded-3xl flex items-center justify-center p-8 transition-all duration-300 relative shadow-2xl overflow-hidden group",
                              bgRemovalEnabled
                                ? "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-[#121216]/40 border border-white/10"
                                : selectedBg === "transparent"
                                ? "bg-white border border-white/10"
                                : selectedBg === "solid-dark"
                                ? "bg-zinc-950 border border-white/10"
                                : selectedBg === "solid-light"
                                ? "bg-zinc-100 border border-zinc-300"
                                : "bg-gradient-to-br from-amber-950/40 via-zinc-950 to-amber-900/30 border border-white/10"
                            )}
                          >
                            {isRemovingBg ? (
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20">
                                <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                                <span className="text-[9px] font-black uppercase tracking-wider text-amber-300">
                                  Cleaning Background...
                                </span>
                              </div>
                            ) : (
                              <img
                                src={logoToRender || ""}
                                alt="Generated AI Logo"
                                className="max-w-full max-h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                              />
                            )}
                          </div>

                          {/* Live Brand Identity Details Bar */}
                          <div className="w-full max-w-lg flex items-center justify-between px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/5">
                            <div>
                              <p className="text-xs font-black uppercase text-white tracking-widest">
                                {brandName || "Brand Name"}
                              </p>
                              <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-medium mt-0.5">
                                {slogan || "Brand Tagline"}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] font-mono text-amber-400/90 uppercase tracking-wider font-bold">
                                Exismic Vector Engine
                              </span>
                              <p className="text-[8px] text-zinc-500 font-medium">1024 × 1024 px</p>
                            </div>
                          </div>

                          {/* Refine & Export Suite Console */}
                          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-white/5">
                            {/* Left: Background Transparency Controls */}
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-xs font-black uppercase text-zinc-200 tracking-wider">
                                    Transparent Background
                                  </span>
                                  <p className="text-[9px] text-zinc-500 font-medium mt-0.5">
                                    Clean solid background into instant PNG alpha
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setBgRemovalEnabled(!bgRemovalEnabled)}
                                  className={cn(
                                    "w-11 h-6 rounded-full transition-all flex items-center p-0.5 relative border",
                                    bgRemovalEnabled
                                      ? "bg-amber-400/20 border-amber-400 justify-end"
                                      : "bg-[#07070a] border-white/10 justify-start"
                                  )}
                                >
                                  <motion.div
                                    layout
                                    className={cn(
                                      "w-4.5 h-4.5 rounded-full shadow-sm",
                                      bgRemovalEnabled ? "bg-amber-400" : "bg-zinc-600"
                                    )}
                                  />
                                </button>
                              </div>

                              {bgRemovalEnabled && (
                                <div className="space-y-2 pt-2 border-t border-white/5">
                                  <div className="flex justify-between items-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                                    <span>Color Sensitivity</span>
                                    <span className="text-amber-400">{tolerance}</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="5"
                                    max="120"
                                    value={tolerance}
                                    onChange={(e) => setValue("tolerance", parseInt(e.target.value))}
                                    className="w-full accent-amber-400 bg-zinc-800 rounded-lg h-1.5 cursor-pointer"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Right: Export Actions */}
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5 flex flex-col justify-between">
                              <span className="text-xs font-black uppercase text-zinc-200 tracking-wider">
                                Export Branding Assets
                              </span>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleDownload(results[0], false)}
                                  className="py-2.5 px-3 bg-white hover:bg-zinc-200 text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                                >
                                  <Download className="w-3 h-3" />
                                  Original PNG
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownload(results[0], true)}
                                  className="py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-amber-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 font-bold shadow-md"
                                >
                                  <Download className="w-3 h-3" />
                                  Transparent PNG
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={handleExportSvg}
                                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                              >
                                <Shapes className="w-3.5 h-3.5 text-amber-400" />
                                Export Scalable SVG (Vector Wrapper)
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Initial State: 4 Instant Demonstration Blueprints ($0 Compute Previews) */
                        <div className="w-full space-y-6 text-center py-4">
                          <div className="space-y-1">
                            <h4 className="text-lg font-black text-white uppercase italic tracking-wider">
                              Instant Demonstration Blueprints ($0 Previews)
                            </h4>
                            <p className="text-xs text-zinc-500 font-medium max-w-md mx-auto">
                              Click any blueprint to instantly load sample brand parameters and preview mockups with zero credit cost.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                            {INSTANT_BLUEPRINTS.map((bp) => (
                              <div
                                key={bp.id}
                                onClick={() => handleApplyBlueprint(bp)}
                                className="group relative rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-400/40 p-4 transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col justify-between overflow-hidden shadow-lg"
                              >
                                <div className="space-y-3">
                                  {/* Blueprint Image Preview */}
                                  <div className="w-full aspect-square rounded-xl bg-black/40 border border-white/5 flex items-center justify-center p-3 overflow-hidden relative">
                                    <img
                                      src={bp.svgDataUri}
                                      alt={bp.brandName}
                                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <span className="absolute top-2 right-2 text-[8px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-widest">
                                      $0 Demo
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[9px] font-bold text-amber-400/90 uppercase tracking-wider">
                                      {bp.tag}
                                    </span>
                                    <h5 className="text-sm font-black text-white uppercase tracking-tight">
                                      {bp.brandName}
                                    </h5>
                                    <p className="text-[10px] text-zinc-500 line-clamp-2 mt-0.5 leading-relaxed font-medium">
                                      {bp.concept}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                  <span className="text-[9px] font-mono text-zinc-500 uppercase">
                                    {bp.slogan}
                                  </span>
                                  <span className="text-[9px] font-black uppercase text-amber-400 group-hover:underline flex items-center gap-1">
                                    Load <ChevronRight className="w-2.5 h-2.5 inline" />
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pipeline Chaining & Retention Bars (Visible when a logo is ready) */}
                  {results.length > 0 && (
                    <div className="space-y-6 pt-2">
                      <MediaPipelineBar
                        sourceToolId="ai-logo"
                        sourceToolName="AI Logo Generator"
                        imageName={`${(brandName || "brand").toLowerCase().replace(/\s+/g, "-")}-logo.png`}
                        imageUrl={logoToRender || results[0]}
                        actions={["eraser", "resizer", "converter", "compressor"]}
                      />

                      <ResultRetentionBar
                        toolType="logo-generator"
                        toolName="AI Logo Generator"
                        title={brandName ? `${brandName} Logo` : "Brand Logo Concept"}
                        fileUrl={logoToRender || results[0]}
                        downloadAction={() => handleDownload(results[0], bgRemovalEnabled)}
                        downloadLabel={bgRemovalEnabled ? "Download Transparent PNG" : "Download PNG"}
                        onCopy={() => handleCopyImage(logoToRender || results[0])}
                      />
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB B: MOCKUP PREVIEWS */}
              {activeTab === "mockups" && results.length > 0 && (
                <motion.div
                  key="mockups-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between px-2">
                    <div>
                      <h4 className="text-base font-black text-white uppercase italic tracking-wider">
                        Real-World Brand Mockups
                      </h4>
                      <p className="text-xs text-zinc-500 font-medium">
                        Preview how your brand mark performs across luxury stationery, mobile devices, apparel, and SaaS interfaces.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 1. Luxury Matte Black Business Card */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                        Luxury Matte Business Card (Embossed Foil)
                      </span>
                      <div className="w-full aspect-[1.586/1] bg-gradient-to-br from-[#0e0f14] via-[#14151d] to-[#0a0b10] border border-amber-500/20 rounded-3xl p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden select-none">
                        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 blur-3xl rounded-full" />
                        <div className="absolute bottom-0 left-0 w-44 h-44 bg-yellow-500/10 blur-3xl rounded-full" />

                        <div className="flex justify-between items-start relative z-10">
                          <div className="w-10 h-7 bg-amber-400/15 border border-amber-400/30 rounded-md flex items-center justify-center">
                            <div className="w-5 h-4 border border-amber-400/20 rounded-xs" />
                          </div>
                          <span className="text-[8px] font-mono tracking-[0.25em] text-amber-400/80">
                            EXISMIC PRESTIGE
                          </span>
                        </div>

                        <div className="flex items-center gap-4 relative z-10">
                          {logoToRender && (
                            <div className="w-14 h-14 bg-black/40 border border-white/10 rounded-2xl p-1.5 shadow-lg flex items-center justify-center">
                              <img src={logoToRender} className="max-w-full max-h-full object-contain" alt="Logo preview" />
                            </div>
                          )}
                          <div>
                            <h4 className="text-lg font-black tracking-tight text-white uppercase leading-tight">
                              {brandName || "Brand Identity"}
                            </h4>
                            <p className="text-[9px] text-amber-400 font-bold uppercase tracking-widest leading-none mt-1">
                              {slogan || "Brand Tagline"}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-end border-t border-white/5 pt-4 relative z-10">
                          <div>
                            <p className="text-[7px] text-zinc-500 uppercase tracking-wider">Executive Representative</p>
                            <p className="text-[10px] font-black text-white uppercase tracking-wider mt-0.5">
                              Founder & CEO
                            </p>
                          </div>
                          <span className="text-[8px] font-mono text-zinc-400 tracking-widest">
                            •••• 4892
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 2. iPhone 16 Pro Splash Mockup */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2">
                        <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                        Smartphone App Splash Screen
                      </span>
                      <div className="w-full aspect-[1.586/1] bg-[#0c0d12] border border-white/5 rounded-3xl flex items-center justify-center p-6 shadow-2xl relative overflow-hidden">
                        <div className="w-32 h-52 bg-black border-[3px] border-zinc-800 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col justify-between p-3.5 select-none">
                          {/* Dynamic Island */}
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-2.5 bg-zinc-900 rounded-full flex items-center justify-center" />

                          <div className="flex justify-between items-center text-[6px] font-bold text-zinc-400 pt-1">
                            <span>9:41</span>
                            <span>100%</span>
                          </div>

                          <div className="flex-1 flex flex-col items-center justify-center gap-2">
                            {logoToRender && (
                              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center p-1.5 shadow-md">
                                <img src={logoToRender} className="max-w-full max-h-full object-contain" alt="Logo preview" />
                              </div>
                            )}
                            <h4 className="text-[9px] font-black tracking-widest text-white uppercase">
                              {brandName || "App"}
                            </h4>
                            <span className="text-[6px] text-amber-400 font-bold uppercase tracking-wide animate-pulse">
                              Connecting...
                            </span>
                          </div>

                          <div className="w-16 h-0.5 bg-zinc-700 rounded-full mx-auto" />
                        </div>
                      </div>
                    </div>

                    {/* 3. Branded Apparel (Chest Embroidery) */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2">
                        <Shirt className="w-3.5 h-3.5 text-amber-400" />
                        Branded Apparel (Chest Print)
                      </span>
                      <div className="w-full aspect-[1.586/1] bg-[#0c0d12] border border-white/5 rounded-3xl flex items-center justify-center relative p-6 overflow-hidden shadow-2xl">
                        <div className="w-40 h-52 bg-[#171821] border border-zinc-800 rounded-xl relative flex flex-col items-center justify-start pt-10 shadow-3xl">
                          {/* Sleeve Left */}
                          <div className="absolute -left-9 top-0 w-9 h-14 bg-[#171821] border-l border-t border-b border-zinc-800 rounded-l-md rotate-12 origin-top-right" />
                          {/* Sleeve Right */}
                          <div className="absolute -right-9 top-0 w-9 h-14 bg-[#171821] border-r border-t border-b border-zinc-800 rounded-r-md -rotate-12 origin-top-left" />
                          {/* Collar */}
                          <div className="w-14 h-6 bg-[#0c0d12] border-b border-zinc-800 rounded-b-full absolute top-0" />

                          {/* Logo chest embroidery */}
                          {logoToRender && (
                            <div className="flex flex-col items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
                              <img src={logoToRender} className="w-12 h-12 object-contain drop-shadow" alt="Logo preview" />
                              <span className="text-[7px] font-black text-zinc-300 uppercase tracking-widest">
                                {brandName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 4. Modern SaaS Website Hero */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2">
                        <Monitor className="w-3.5 h-3.5 text-amber-400" />
                        SaaS Platform Navbar & Hero
                      </span>
                      <div className="w-full aspect-[1.586/1] bg-[#090a0f] border border-white/5 rounded-3xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden select-none">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                          <div className="flex items-center gap-2">
                            {logoToRender && <img src={logoToRender} className="w-5 h-5 object-contain" alt="Logo preview" />}
                            <span className="text-[9px] font-black text-white uppercase tracking-tight">
                              {brandName || "Brand"}
                            </span>
                          </div>
                          <div className="flex gap-3 text-[7px] font-bold text-zinc-400 uppercase">
                            <span>Features</span>
                            <span>Pricing</span>
                            <span>Docs</span>
                          </div>
                          <button className="px-2.5 py-1 bg-amber-400 text-amber-950 text-[6px] font-black uppercase rounded-md shadow-sm">
                            Get Started
                          </button>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-2 mt-2">
                          <h2 className="text-[12px] font-black text-white leading-tight uppercase italic">
                            Deploy with{" "}
                            <span className="text-transparent bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text">
                              {brandName || "Brand"}
                            </span>
                          </h2>
                          <p className="text-[6px] text-zinc-400 font-medium max-w-xs">
                            {slogan || "Build, scale, and launch with next-generation automated workflows."}
                          </p>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 text-[5px] font-black uppercase rounded shadow-md">
                              Start Free Trial
                            </button>
                            <button className="px-3 py-1 bg-white/5 border border-white/10 text-zinc-300 text-[5px] font-black uppercase rounded">
                              View Documentation
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 5. Browser Favicon Tab (Wide Span) */}
                    <div className="md:col-span-2 space-y-2">
                      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-amber-400" />
                        Browser Tab & 32×32 Favicon Preview
                      </span>
                      <div className="w-full bg-[#12131a] border border-white/10 rounded-2xl p-4 shadow-xl select-none space-y-3">
                        {/* Chrome/Safari Tab Bar */}
                        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                          <div className="flex items-center gap-1.5 px-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                          </div>

                          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-xl bg-[#090a0f] border border-white/10 max-w-xs">
                            {logoToRender && (
                              <img src={logoToRender} className="w-4 h-4 object-contain rounded-xs" alt="Favicon preview" />
                            )}
                            <span className="text-[10px] font-bold text-white truncate">
                              {brandName || "Brand"} — Official Website
                            </span>
                            <X className="w-2.5 h-2.5 text-zinc-500 ml-auto" />
                          </div>
                        </div>

                        {/* URL Bar */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090a0f]/60 border border-white/5 text-[10px] text-zinc-400 font-mono">
                          <Lock className="w-3 h-3 text-emerald-400" />
                          <span className="text-zinc-500">https://</span>
                          <span className="text-zinc-200">
                            {(brandName || "mybrand").toLowerCase().replace(/\s+/g, "")}.com
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB C: LOGO HISTORY */}
              {activeTab === "history" && (
                <motion.div
                  key="history-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between px-2">
                    <div>
                      <h4 className="text-base font-black text-white uppercase italic tracking-wider">
                        Session Logo History
                      </h4>
                      <p className="text-xs text-zinc-500 font-medium">
                        Logos you design during this session are saved locally for instant reload and export.
                      </p>
                    </div>
                  </div>

                  {history.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {history.map((item, i) => (
                        <div
                          key={i}
                          className="group relative aspect-square rounded-[2rem] overflow-hidden bg-black/40 border border-white/10 shadow-xl select-none flex flex-col justify-between p-4"
                        >
                          <img
                            src={item.url}
                            alt={item.brandName}
                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-5 flex flex-col justify-end text-left">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1 leading-none">
                              {item.brandName}
                            </span>
                            <p className="text-[9px] text-zinc-300 line-clamp-2 font-medium mb-4 leading-relaxed">
                              &ldquo;{item.prompt}&rdquo;
                            </p>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setResults([item.url]);
                                  setValue("brandName", item.brandName);
                                  setValue("concept", item.prompt);
                                  setActiveTab("generate");
                                  showToast(`Loaded ${item.brandName}`);
                                }}
                                className="flex-1 py-2.5 rounded-xl bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all font-bold"
                              >
                                Load Into Canvas
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownload(item.url)}
                                className="p-2.5 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-all border border-white/10"
                                title="Download"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
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
                        <h4 className="text-sm font-black text-white tracking-wide uppercase">
                          No Logo History Yet
                        </h4>
                        <p className="text-xs text-zinc-500 max-w-sm">
                          Logos created in this session will automatically appear here for 1-click re-loading and downloading.
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
            <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
              <button
                type="button"
                onClick={() => setFullscreenImage(null)}
                className="absolute -top-12 right-0 p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={fullscreenImage}
                alt="Logo Fullscreen"
                className="max-h-[85vh] w-auto object-contain rounded-3xl border border-white/10 shadow-2xl p-4 bg-[#0c0d12]"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating In-App Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-zinc-900/95 border border-amber-400/40 text-amber-200 text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2"
          >
            <Check className="w-3.5 h-3.5 text-amber-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
