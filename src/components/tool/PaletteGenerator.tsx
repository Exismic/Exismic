"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Palette,
  Shuffle,
  Copy,
  Check,
  Lock,
  Unlock,
  Download,
  Code2,
  Undo2,
  Redo2,
  Eye,
  Layers,
  Share2,
  ImageIcon,
  Upload,
  Sun,
  Moon,
  Cloud,
  Flame,
  Zap,
  Monitor,
  Smartphone,
  CheckCircle2,
  HelpCircle,
  Pipette,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ToolLaserDivider } from "@/components/tool/ToolLaserDivider";

// ============================================================================
// COLOR MATH & ACCESSIBILITY UTILITIES
// ============================================================================

interface ColorItem {
  id: string;
  hex: string;
  locked: boolean;
  name: string;
}

// Convert Hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 16, g: 185, b: 129 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Convert RGB to Hex
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Convert HSL to Hex
function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0").toUpperCase();
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Relative Luminance for WCAG Contrast Calculation
function getRelativeLuminance(r: number, g: number, b: number): number {
  const getsRGB = (c: number) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * getsRGB(r) + 0.7152 * getsRGB(g) + 0.0722 * getsRGB(b);
}

// Contrast ratio check
function getContrastRatio(hex: string): {
  isDark: boolean;
  textColor: string;
  contrastScore: string;
  ratingBadge: "AAA" | "AA" | "Good";
} {
  const { r, g, b } = hexToRgb(hex);
  const lum = getRelativeLuminance(r, g, b);

  // Decide if white or dark text is better
  const isDark = lum < 0.38;
  const textColor = isDark ? "#FFFFFF" : "#0A0D14";

  // Contrast against chosen text color
  const textLum = isDark ? 1.0 : 0.0;
  const ratio = isDark
    ? (textLum + 0.05) / (lum + 0.05)
    : (lum + 0.05) / (textLum + 0.05);

  let ratingBadge: "AAA" | "AA" | "Good" = "Good";
  if (ratio >= 7.0) ratingBadge = "AAA";
  else if (ratio >= 4.5) ratingBadge = "AA";

  return {
    isDark,
    textColor,
    contrastScore: `${ratio.toFixed(1)}:1`,
    ratingBadge,
  };
}

// Algorithmic Human Color Naming
function getColorName(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);

  if (s < 12) {
    if (l > 92) return "Pure Snow";
    if (l > 75) return "Platinum White";
    if (l > 55) return "Silver Mist";
    if (l > 35) return "Cool Slate";
    if (l > 18) return "Charcoal Gray";
    return "Obsidian Black";
  }

  // Hue matching
  if (h >= 345 || h < 15) {
    if (l < 30) return "Crimson Night";
    if (l < 55) return "Ruby Red";
    if (l < 75) return "Coral Blush";
    return "Soft Rose";
  }
  if (h >= 15 && h < 45) {
    if (l < 35) return "Burnt Umber";
    if (l < 55) return "Sunset Tangerine";
    if (l < 75) return "Warm Apricot";
    return "Peach Cream";
  }
  if (h >= 45 && h < 70) {
    if (l < 40) return "Golden Amber";
    if (l < 60) return "Honey Gold";
    if (l < 80) return "Sunflower Yellow";
    return "Vanilla Chiffon";
  }
  if (h >= 70 && h < 110) {
    if (l < 40) return "Olive Grove";
    if (l < 60) return "Bright Chartreuse";
    if (l < 80) return "Lime Spritz";
    return "Pale Mint";
  }
  if (h >= 110 && h < 155) {
    if (l < 30) return "Deep Forest";
    if (l < 55) return "Emerald Peak";
    if (l < 75) return "Fresh Mint";
    return "Pistachio";
  }
  if (h >= 155 && h < 190) {
    if (l < 30) return "Abyssal Teal";
    if (l < 55) return "Ocean Teal";
    if (l < 75) return "Electric Cyan";
    return "Aqua Breeze";
  }
  if (h >= 190 && h < 225) {
    if (l < 30) return "Midnight Navy";
    if (l < 55) return "Cobalt Blue";
    if (l < 75) return "Sky Aqua";
    return "Glacier Frost";
  }
  if (h >= 225 && h < 260) {
    if (l < 30) return "Deep Abyss";
    if (l < 55) return "Royal Indigo";
    if (l < 75) return "Iris Blue";
    return "Periwinkle Mist";
  }
  if (h >= 260 && h < 295) {
    if (l < 30) return "Imperial Plum";
    if (l < 55) return "Electric Violet";
    if (l < 75) return "Lavender Bloom";
    return "Lilac Whisper";
  }
  // 295-345
  if (l < 30) return "Velvet Orchid";
  if (l < 55) return "Hot Magenta";
  if (l < 75) return "Flamingo Pink";
  return "Cotton Candy";
}

// Generate 5 Tonal Shades for a color
function generateColorShades(hex: string): { label: string; hex: string }[] {
  const { r, g, b } = hexToRgb(hex);
  const { h, s } = rgbToHsl(r, g, b);
  return [
    { label: "100", hex: hslToHex(h, Math.max(20, s - 30), 92) },
    { label: "300", hex: hslToHex(h, Math.max(30, s - 10), 72) },
    { label: "500", hex: hex },
    { label: "700", hex: hslToHex(h, Math.min(100, s + 10), 38) },
    { label: "900", hex: hslToHex(h, Math.min(100, s + 20), 18) },
  ];
}

// ============================================================================
// CURATED 1-CLICK DESIGN BLUEPRINTS
// ============================================================================

interface Blueprint {
  id: string;
  name: string;
  mood: string;
  colors: string[];
}

const DESIGN_BLUEPRINTS: Blueprint[] = [
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    mood: "Electric & High Energy",
    colors: ["#0B0F19", "#06B6D4", "#EC4899", "#8B5CF6", "#10B981"],
  },
  {
    id: "forest",
    name: "Forest Evergreen",
    mood: "Natural & Grounded",
    colors: ["#14281D", "#274736", "#506F5A", "#8FAF8A", "#D8E4D5"],
  },
  {
    id: "sunset",
    name: "Sunset Horizon",
    mood: "Warm & Cinematic",
    colors: ["#2A0845", "#6441A5", "#F857A6", "#FF5858", "#FFB199"],
  },
  {
    id: "saas",
    name: "Modern Tech SaaS",
    mood: "Clean & Professional",
    colors: ["#0F172A", "#2563EB", "#38BDF8", "#F8FAFC", "#10B981"],
  },
  {
    id: "nordic",
    name: "Nordic Frost",
    mood: "Cool & Minimalist",
    colors: ["#1A2238", "#2E3B55", "#495874", "#9FB1BC", "#E8EEF2"],
  },
  {
    id: "velvet",
    name: "Royal Velvet",
    mood: "Luxury & Editorial",
    colors: ["#1E1B4B", "#4338CA", "#6366F1", "#A5B4FC", "#F5F3FF"],
  },
  {
    id: "cappuccino",
    name: "Warm Cappuccino",
    mood: "Cozy & Earthy",
    colors: ["#3D2619", "#6F4E37", "#A67B5B", "#ECB176", "#FED8B1"],
  },
  {
    id: "monochrome",
    name: "Minimalist Slate",
    mood: "Timeless & Sleek",
    colors: ["#090A0F", "#1F2430", "#4B5563", "#9CA3AF", "#F3F4F6"],
  },
];

// Color Harmony Modes
const HARMONY_MODES = [
  { id: "balanced", label: "Harmonious", icon: Palette },
  { id: "analogous", label: "Analogous", icon: Cloud },
  { id: "complementary", label: "High Contrast", icon: Flame },
  { id: "monochromatic", label: "Monochrome", icon: Layers },
  { id: "triadic", label: "Triadic", icon: Zap },
  { id: "pastel", label: "Soft Pastel", icon: Sun },
  { id: "dark", label: "Dark Mode", icon: Moon },
];

export function PaletteGenerator() {
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [history, setHistory] = useState<ColorItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [harmonyMode, setHarmonyMode] = useState<string>("balanced");
  const [paletteLength, setPaletteLength] = useState<number>(5);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isCopiedShareUrl, setIsCopiedShareUrl] = useState<boolean>(false);
  const [activeShadeIndex, setActiveShadeIndex] = useState<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const [exportMode, setExportMode] = useState<"css" | "tailwind" | "json" | "scss" | null>(null);
  const [previewTab, setPreviewTab] = useState<"website" | "mobile" | "brand">("website");
  const [isExtractingImage, setIsExtractingImage] = useState(false);
  const [imageExtractSuccess, setImageExtractSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate Hex based on Harmony Mode
  const generateColorHex = (mode = harmonyMode, index = 0, total = 5, baseHue?: number): string => {
    const rootHue = baseHue !== undefined ? baseHue : Math.floor(Math.random() * 360);

    if (mode === "pastel") {
      const h = (rootHue + index * 45) % 360;
      const s = 40 + Math.floor(Math.random() * 25);
      const l = 78 + Math.floor(Math.random() * 12);
      return hslToHex(h, s, l);
    }

    if (mode === "dark") {
      if (index === total - 1) {
        // Bright accent in dark mode
        const h = (rootHue + 180) % 360;
        return hslToHex(h, 85, 60);
      }
      const h = rootHue;
      const s = 25 + index * 8;
      const l = 8 + index * 7;
      return hslToHex(h, s, l);
    }

    if (mode === "analogous") {
      const spread = 25;
      const h = (rootHue + (index - Math.floor(total / 2)) * spread + 360) % 360;
      const s = 60 + Math.floor(Math.random() * 30);
      const l = 35 + index * 10;
      return hslToHex(h, s, l);
    }

    if (mode === "complementary") {
      const isOpposite = index % 2 === 1;
      const h = isOpposite ? (rootHue + 180) % 360 : rootHue;
      const s = 65 + Math.floor(Math.random() * 25);
      const l = 28 + (index / total) * 45;
      return hslToHex(h, s, l);
    }

    if (mode === "monochromatic") {
      const h = rootHue;
      const s = 65;
      const step = 65 / (total + 1);
      const l = Math.round(18 + index * step);
      return hslToHex(h, s, l);
    }

    if (mode === "triadic") {
      const hues = [rootHue, (rootHue + 120) % 360, (rootHue + 240) % 360];
      const h = hues[index % 3];
      const s = 65 + Math.floor(Math.random() * 25);
      const l = 35 + (index / total) * 35;
      return hslToHex(h, s, l);
    }

    // Default "balanced" mode: rich UI palette with hero, accent, and neutrals
    if (index === 0) {
      return hslToHex(rootHue, 35, 14);
    } else if (index === 1) {
      return hslToHex(rootHue, 78, 52);
    } else if (index === 2) {
      return hslToHex((rootHue + 38) % 360, 82, 56);
    } else if (index === 3) {
      return hslToHex((rootHue + 170) % 360, 75, 58);
    } else {
      return hslToHex(rootHue, 20, 94);
    }
  };

  // Master Palette Generator (Respects locked colors)
  const generatePalette = useCallback(
    (mode = harmonyMode, targetLength = paletteLength) => {
      setColors((prev) => {
        const baseHue = Math.floor(Math.random() * 360);
        let newItems: ColorItem[] = [];

        for (let i = 0; i < targetLength; i++) {
          const existing = prev[i];
          if (existing && existing.locked) {
            newItems.push(existing);
          } else {
            const hex = generateColorHex(mode, i, targetLength, baseHue);
            newItems.push({
              id: `color-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
              hex,
              locked: false,
              name: getColorName(hex),
            });
          }
        }

        setHistory((h) => [...h.slice(0, historyIndex + 1), newItems].slice(-25));
        setHistoryIndex((idx) => Math.min(24, idx + 1));

        return newItems;
      });
    },
    [harmonyMode, paletteLength, historyIndex]
  );

  // Initialize on mount: check URL search params for shared palette
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sharedColors = params.get("colors");
      if (sharedColors) {
        const hexList = sharedColors
          .split("-")
          .map((h) => `#${h.replace("#", "")}`.toUpperCase())
          .filter((h) => /^#[0-9A-F]{6}$/i.test(h));

        if (hexList.length >= 3 && hexList.length <= 6) {
          const loaded: ColorItem[] = hexList.map((hex, i) => ({
            id: `shared-${i}-${Date.now()}`,
            hex,
            locked: false,
            name: getColorName(hex),
          }));
          setPaletteLength(loaded.length);
          setColors(loaded);
          setHistory([loaded]);
          setHistoryIndex(0);
          return;
        }
      }
    }

    generatePalette("balanced", 5);
  }, []);

  // Keyboard Spacebar Shuffle Listener (Design standard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.code === "Space") {
        e.preventDefault();
        generatePalette();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [generatePalette]);

  // Undo / Redo Actions
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      if (prev) {
        setColors(prev);
        setHistoryIndex(historyIndex - 1);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      if (next) {
        setColors(next);
        setHistoryIndex(historyIndex + 1);
      }
    }
  };

  // Toggle Lock on specific swatch
  const toggleLock = (index: number) => {
    setColors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, locked: !c.locked } : c))
    );
  };

  // Update specific color manually via color picker
  const updateColorHex = (index: number, newHex: string) => {
    setColors((prev) =>
      prev.map((c, i) =>
        i === index ? { ...c, hex: newHex.toUpperCase(), name: getColorName(newHex) } : c
      )
    );
  };

  // Copy Color Hex
  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  // Copy Shareable URL with Instant Feedback
  const copyShareUrl = () => {
    if (typeof window === "undefined" || colors.length === 0) return;
    const hexCodes = colors.map((c) => c.hex.replace("#", "")).join("-");
    const url = `${window.location.origin}/tools/productivity/palette?colors=${hexCodes}`;
    navigator.clipboard.writeText(url);
    setIsCopiedShareUrl(true);
    setTimeout(() => setIsCopiedShareUrl(false), 2200);
  };

  // Apply Blueprint
  const applyBlueprint = (bp: Blueprint) => {
    const newItems: ColorItem[] = bp.colors.map((hex, i) => {
      if (colors[i]?.locked) return colors[i];
      return {
        id: `bp-${bp.id}-${i}-${Date.now()}`,
        hex: hex.toUpperCase(),
        locked: false,
        name: getColorName(hex),
      };
    });
    setPaletteLength(newItems.length);
    setColors(newItems);
    setHistory((h) => [...h.slice(0, historyIndex + 1), newItems].slice(-25));
    setHistoryIndex((idx) => Math.min(24, idx + 1));
  };

  // Natural Language Theme Generator
  const handlePromptGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const p = prompt.toLowerCase();

    let targetMode = "balanced";
    if (p.includes("pastel") || p.includes("soft") || p.includes("gentle")) targetMode = "pastel";
    else if (p.includes("dark") || p.includes("night") || p.includes("cyber") || p.includes("black"))
      targetMode = "dark";
    else if (p.includes("contrast") || p.includes("vibrant") || p.includes("bold") || p.includes("pop"))
      targetMode = "complementary";
    else if (p.includes("minimal") || p.includes("mono") || p.includes("slate") || p.includes("clean"))
      targetMode = "monochromatic";
    else if (p.includes("analog") || p.includes("soothing") || p.includes("nature"))
      targetMode = "analogous";

    setHarmonyMode(targetMode);
    generatePalette(targetMode);
  };

  // Extract Palette from Image using Canvas
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setIsExtractingImage(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setIsExtractingImage(false);
          return;
        }

        canvas.width = 64;
        canvas.height = 64;
        ctx.drawImage(img, 0, 0, 64, 64);
        const data = ctx.getImageData(0, 0, 64, 64).data;

        const rawSamples: { r: number; g: number; b: number; score: number }[] = [];
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const { s, l } = rgbToHsl(r, g, b);
          if (l > 8 && l < 92) {
            const score = s * (l > 25 && l < 75 ? 1.5 : 1.0);
            rawSamples.push({ r, g, b, score });
          }
        }

        rawSamples.sort((a, b) => b.score - a.score);

        const pickedHex: string[] = [];
        for (const sample of rawSamples) {
          const hex = rgbToHex(sample.r, sample.g, sample.b);
          const sampleHsl = rgbToHsl(sample.r, sample.g, sample.b);

          const isTooClose = pickedHex.some((existing) => {
            const exRgb = hexToRgb(existing);
            const exHsl = rgbToHsl(exRgb.r, exRgb.g, exRgb.b);
            const hueDiff = Math.abs(exHsl.h - sampleHsl.h);
            const lumDiff = Math.abs(exHsl.l - sampleHsl.l);
            return hueDiff < 28 && lumDiff < 25;
          });

          if (!isTooClose) {
            pickedHex.push(hex);
            if (pickedHex.length >= paletteLength) break;
          }
        }

        while (pickedHex.length < paletteLength) {
          pickedHex.push(generateColorHex("balanced", pickedHex.length, paletteLength));
        }

        const newItems: ColorItem[] = pickedHex.map((hex, i) => {
          if (colors[i]?.locked) return colors[i];
          return {
            id: `extracted-${Date.now()}-${i}`,
            hex,
            locked: false,
            name: getColorName(hex),
          };
        });

        setColors(newItems);
        setIsExtractingImage(false);
        setImageExtractSuccess(true);
        setTimeout(() => setImageExtractSuccess(false), 2500);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Sample Images Synthesizer for 1-Click Testing ($0 network, in-memory)
  const extractFromSample = (theme: "neon" | "nature" | "sunset") => {
    setIsExtractingImage(true);
    const canvas = document.createElement("canvas");
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (theme === "neon") {
      const grad = ctx.createLinearGradient(0, 0, 120, 120);
      grad.addColorStop(0, "#0B0C16");
      grad.addColorStop(0.3, "#06B6D4");
      grad.addColorStop(0.7, "#EC4899");
      grad.addColorStop(1, "#10B981");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 120, 120);
    } else if (theme === "nature") {
      const grad = ctx.createLinearGradient(0, 0, 0, 120);
      grad.addColorStop(0, "#2D4A22");
      grad.addColorStop(0.4, "#5B8E46");
      grad.addColorStop(0.8, "#9BC472");
      grad.addColorStop(1, "#E4EFCE");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 120, 120);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 120, 0);
      grad.addColorStop(0, "#310842");
      grad.addColorStop(0.35, "#8B244A");
      grad.addColorStop(0.7, "#DE5437");
      grad.addColorStop(1, "#F6A85B");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 120, 120);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "sample.png", { type: "image/png" });
        processImageFile(file);
      }
    });
  };

  // Export Code Generators
  const getExportString = () => {
    if (exportMode === "css") {
      const vars = colors
        .map((c, i) => `  --color-${i + 1}: ${c.hex}; /* ${c.name} */`)
        .join("\n");
      return `:root {\n${vars}\n}`;
    }
    if (exportMode === "tailwind") {
      const obj = colors
        .map((c, i) => `      'color-${i + 1}': '${c.hex}', // ${c.name}`)
        .join("\n");
      return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${obj}\n      }\n    }\n  }\n};`;
    }
    if (exportMode === "scss") {
      return colors.map((c, i) => `$color-${i + 1}: ${c.hex}; // ${c.name}`).join("\n");
    }
    if (exportMode === "json") {
      const formatted = colors.map((c, i) => ({
        index: i + 1,
        name: c.name,
        hex: c.hex,
        rgb: `rgb(${hexToRgb(c.hex).r}, ${hexToRgb(c.hex).g}, ${hexToRgb(c.hex).b})`,
      }));
      return JSON.stringify(formatted, null, 2);
    }
    return "";
  };

  // Download High-Resolution Studio PNG
  const downloadPalettePng = () => {
    if (colors.length === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 900;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#090B10";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 36px 'Inter', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Exismic Color Palette", 80, 85);

    ctx.fillStyle = "#6B7280";
    ctx.font = "600 20px 'Inter', sans-serif";
    ctx.fillText(`${colors.length}-Color Studio Harmony • exismic.com/tools/productivity/palette`, 80, 120);

    const cardY = 170;
    const cardHeight = 620;
    const totalMargin = 160;
    const gap = 20;
    const availableWidth = canvas.width - totalMargin - gap * (colors.length - 1);
    const cardWidth = availableWidth / colors.length;

    colors.forEach((c, i) => {
      const x = 80 + i * (cardWidth + gap);
      const { r, g, b } = hexToRgb(c.hex);
      const { isDark, ratingBadge } = getContrastRatio(c.hex);

      ctx.fillStyle = c.hex;
      ctx.beginPath();
      const radius = 24;
      ctx.roundRect ? ctx.roundRect(x, cardY, cardWidth, cardHeight, radius) : ctx.fillRect(x, cardY, cardWidth, cardHeight);
      ctx.fill();

      const plaqueHeight = 160;
      const plaqueY = cardY + cardHeight - plaqueHeight;

      ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.45)" : "rgba(255, 255, 255, 0.65)";
      ctx.beginPath();
      ctx.roundRect
        ? ctx.roundRect(x + 12, plaqueY, cardWidth - 24, plaqueHeight - 12, 16)
        : ctx.fillRect(x + 12, plaqueY, cardWidth - 24, plaqueHeight - 12);
      ctx.fill();

      ctx.fillStyle = isDark ? "#FFFFFF" : "#0A0D14";
      ctx.textAlign = "center";

      ctx.font = "800 20px 'Inter', sans-serif";
      ctx.fillText(c.name, x + cardWidth / 2, plaqueY + 45);

      ctx.font = "800 28px 'Inter', sans-serif";
      ctx.fillText(c.hex, x + cardWidth / 2, plaqueY + 85);

      ctx.font = "600 15px 'Inter', sans-serif";
      ctx.fillStyle = isDark ? "#9CA3AF" : "#4B5563";
      ctx.fillText(`RGB(${r}, ${g}, ${b}) • ${ratingBadge}`, x + cardWidth / 2, plaqueY + 122);
    });

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exismic-palette-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  };

  // Download SVG Vector File
  const downloadPaletteSvg = () => {
    if (colors.length === 0) return;
    const swatchWidth = 200;
    const totalWidth = colors.length * swatchWidth;
    const svgHeight = 400;

    const swatchesSvg = colors
      .map((c, i) => {
        const x = i * swatchWidth;
        const contrast = getContrastRatio(c.hex);
        return `
        <g transform="translate(${x}, 0)">
          <rect width="${swatchWidth}" height="${svgHeight}" fill="${c.hex}" />
          <text x="${swatchWidth / 2}" y="${svgHeight - 75}" text-anchor="middle" fill="${contrast.textColor}" font-family="system-ui, sans-serif" font-weight="700" font-size="16">${c.name}</text>
          <text x="${swatchWidth / 2}" y="${svgHeight - 45}" text-anchor="middle" fill="${contrast.textColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="20">${c.hex}</text>
        </g>`;
      })
      .join("\n");

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${svgHeight}" viewBox="0 0 ${totalWidth} ${svgHeight}">
      ${swatchesSvg}
    </svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exismic-palette-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-10">
      {/* ==================================================================== */}
      {/* 1. TOP UTILITY BAR: SHUFFLE, UNDO/REDO, COUNT & HARMONY */}
      {/* ==================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-[#0a0d14]/90 p-4 shadow-xl backdrop-blur-md sm:rounded-3xl sm:p-5">
        {/* Left: Shuffle & Quick Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => generatePalette()}
            className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all hover:scale-105 hover:brightness-110 active:scale-95"
          >
            <Shuffle size={16} className="text-emerald-950" />
            <span>Shuffle Colors</span>
            <span className="hidden rounded-md bg-emerald-950/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-950 md:inline-block">
              Space
            </span>
          </button>

          {/* Undo / Redo */}
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo last shuffle"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Undo2 size={16} />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo shuffle"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Redo2 size={16} />
            </button>
          </div>

          {/* Swatch Count Selector */}
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            <span className="hidden px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 lg:inline-block">
              Colors:
            </span>
            {[3, 4, 5, 6].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  setPaletteLength(num);
                  generatePalette(harmonyMode, num);
                }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black transition-all",
                  paletteLength === num
                    ? "bg-emerald-500 text-emerald-950 shadow-md"
                    : "text-zinc-400 hover:bg-white/10 hover:text-white"
                )}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Harmony Selector & Quick Share */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-1">
            {HARMONY_MODES.slice(0, 4).map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    setHarmonyMode(mode.id);
                    generatePalette(mode.id);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all",
                    harmonyMode === mode.id
                      ? "bg-white/15 text-emerald-400 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  <Icon size={13} />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>

          {/* Share Link Button with Dynamic "Link Copied!" Feedback */}
          <button
            type="button"
            onClick={copyShareUrl}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all active:scale-95",
              isCopiedShareUrl
                ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400/40"
                : "border-white/10 bg-white/5 text-zinc-300 hover:border-emerald-500/30 hover:bg-white/10 hover:text-white"
            )}
            title={isCopiedShareUrl ? "Link copied to clipboard!" : "Copy shareable palette link"}
          >
            {isCopiedShareUrl ? (
              <Check size={14} className="text-emerald-400 animate-in zoom-in-75 duration-200" />
            ) : (
              <Share2 size={14} className="text-emerald-400" />
            )}
            <span>{isCopiedShareUrl ? "Link Copied!" : "Share Link"}</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. MAIN SWATCHES STAGE */}
      {/* ==================================================================== */}
      <div className="relative overflow-hidden rounded-[2rem] border-2 border-emerald-500/25 bg-[#090b10] shadow-[0_0_50px_rgba(16,185,129,0.12)] sm:rounded-[2.5rem]">
        {/* Dynamic Swatch Grid */}
        <div
          className={cn(
            "grid min-h-[460px] grid-cols-1 divide-y divide-white/10 transition-all duration-500 sm:divide-x sm:divide-y-0 md:min-h-[500px]",
            paletteLength === 3 && "sm:grid-cols-3",
            paletteLength === 4 && "sm:grid-cols-4",
            paletteLength === 5 && "sm:grid-cols-5",
            paletteLength === 6 && "sm:grid-cols-6"
          )}
        >
          {colors.map((color, index) => {
            const contrast = getContrastRatio(color.hex);
            const { isDark, textColor, contrastScore, ratingBadge } = contrast;
            const shades = generateColorShades(color.hex);
            const isShadeOpen = activeShadeIndex === index;

            return (
              <motion.div
                key={color.id || index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="group relative flex flex-col justify-between overflow-hidden p-5 transition-all duration-300 sm:p-6"
                style={{ backgroundColor: color.hex }}
              >
                {/* Subtle Hover Ambient Sheen */}
                <div className="pointer-events-none absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Top Controls: Lock Status, Color Name & Accessibility Pill */}
                <div className="relative z-10 flex items-center justify-between gap-2">
                  {/* Lock / Unlock Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(index);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-md transition-all",
                      color.locked
                        ? "bg-white text-zinc-950 shadow-lg ring-2 ring-emerald-400"
                        : "bg-black/25 text-white opacity-80 hover:bg-black/40 hover:opacity-100"
                    )}
                    title={color.locked ? "Click to unlock color" : "Lock this color while shuffling"}
                  >
                    {color.locked ? <Lock size={12} className="text-emerald-700" /> : <Unlock size={12} />}
                    <span>{color.locked ? "Locked" : "Lock"}</span>
                  </button>

                  {/* Contrast Accessibility Pill */}
                  <span
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider backdrop-blur-md",
                      isDark ? "bg-black/30 text-white/90" : "bg-white/40 text-black/90"
                    )}
                    title={`WCAG contrast with ${isDark ? "white" : "dark"} text is ${contrastScore}`}
                  >
                    <Check size={11} className={isDark ? "text-emerald-400" : "text-emerald-700"} />
                    <span>{ratingBadge}</span>
                  </span>
                </div>

                {/* Center: Friendly Color Name & Click-to-Copy Feedback */}
                <div
                  onClick={() => copyColor(color.hex)}
                  className="relative z-10 my-8 flex cursor-pointer flex-col items-center justify-center text-center select-none"
                >
                  <span
                    style={{ color: textColor }}
                    className="mb-1 text-xs font-black uppercase tracking-widest opacity-80 drop-shadow-sm transition-transform group-hover:scale-105"
                  >
                    {color.name}
                  </span>

                  <AnimatePresence>
                    {copiedHex === color.hex && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <span className="flex items-center gap-1.5 rounded-full bg-zinc-950 px-4 py-2 text-xs font-black uppercase tracking-wider text-emerald-400 shadow-2xl ring-2 ring-emerald-400">
                          <CheckCircle2 size={14} />
                          Copied!
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bottom Plaque: Hex, RGB & Fine Tuning */}
                <div className="relative z-10 flex flex-col items-center space-y-3">
                  {/* Big Clickable Hex Code */}
                  <button
                    type="button"
                    onClick={() => copyColor(color.hex)}
                    style={{ color: textColor }}
                    className="group/hex flex items-center gap-1.5 rounded-xl px-3 py-1 font-mono text-2xl font-black tracking-tight drop-shadow-sm transition-all hover:scale-105 md:text-3xl"
                    title="Click to copy Hex code"
                  >
                    <span>{color.hex}</span>
                    <Copy
                      size={16}
                      className="opacity-40 transition-opacity group-hover/hex:opacity-100"
                    />
                  </button>

                  {/* Secondary RGB Readout */}
                  <span
                    style={{ color: textColor }}
                    className="text-[11px] font-mono font-medium opacity-65"
                  >
                    rgb({hexToRgb(color.hex).r}, {hexToRgb(color.hex).g}, {hexToRgb(color.hex).b})
                  </span>

                  {/* Quick Action Tools Row: Native Color Picker & Shades Drawer Toggle */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {/* Manual Native Color Picker Trigger */}
                    <label
                      className={cn(
                        "relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg backdrop-blur-md transition-all hover:scale-110",
                        isDark ? "bg-black/35 text-white/80 hover:text-white" : "bg-white/40 text-black/80 hover:text-black"
                      )}
                      title="Adjust or pick exact custom color"
                    >
                      <Pipette size={14} />
                      <input
                        type="color"
                        value={color.hex}
                        onChange={(e) => updateColorHex(index, e.target.value)}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                    </label>

                    {/* Shades Drawer Toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveShadeIndex(isShadeOpen ? null : index);
                      }}
                      className={cn(
                        "flex h-8 items-center gap-1 rounded-lg px-2.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-all hover:scale-105",
                        isDark ? "bg-black/35 text-white/80 hover:text-white" : "bg-white/40 text-black/80 hover:text-black",
                        isShadeOpen && "ring-2 ring-emerald-400"
                      )}
                      title="View tonal shades (100–900)"
                    >
                      <Layers size={13} />
                      <span>Shades</span>
                    </button>
                  </div>

                  {/* Tonal Shades Popover Drawer */}
                  <AnimatePresence>
                    {isShadeOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-24 left-3 right-3 z-30 flex flex-col gap-1 rounded-2xl border border-white/20 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-xl"
                      >
                        <div className="flex items-center justify-between px-2 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                          <span>Tonal Shades</span>
                          <span className="text-emerald-400">Click to Copy</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                          {shades.map((shade) => {
                            const shadeContrast = getContrastRatio(shade.hex);
                            return (
                              <button
                                key={shade.label}
                                type="button"
                                onClick={() => copyColor(shade.hex)}
                                style={{ backgroundColor: shade.hex }}
                                className="group/shade relative flex h-14 flex-col items-center justify-end rounded-lg p-1 transition-transform hover:scale-105"
                                title={`Copy ${shade.hex} (${shade.label})`}
                              >
                                <span
                                  style={{ color: shadeContrast.textColor }}
                                  className="text-[9px] font-black uppercase tracking-tighter"
                                >
                                  {shade.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. CURATED 1-CLICK DESIGNER BLUEPRINTS (Directly Below Swatches)    */}
      {/* ==================================================================== */}
      <div className="space-y-4 rounded-3xl border border-white/10 bg-[#0a0d14]/75 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
              <Palette size={16} className="text-emerald-400" />
              <span>Instant Palette Blueprints</span>
            </h3>
            <p className="text-xs font-medium text-zinc-400">
              Tested, cohesive color palettes balanced for websites, brand identities, and interfaces.
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
            1-Click Apply
          </span>
        </div>

        {/* 8 Blueprint Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {DESIGN_BLUEPRINTS.map((bp) => (
            <button
              key={bp.id}
              type="button"
              onClick={() => applyBlueprint(bp)}
              className="group flex flex-col justify-between rounded-2xl border border-white/5 bg-zinc-900/60 p-3 text-left transition-all hover:border-emerald-500/30 hover:bg-zinc-900 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              {/* Mini Color Stripes */}
              <div className="flex h-7 w-full overflow-hidden rounded-lg shadow-inner">
                {bp.colors.map((c, i) => (
                  <div key={i} className="h-full flex-1" style={{ backgroundColor: c }} />
                ))}
              </div>

              {/* Title & Tag */}
              <div className="mt-2.5">
                <p className="truncate text-xs font-bold text-zinc-200 group-hover:text-emerald-300">
                  {bp.name}
                </p>
                <p className="truncate text-[9px] font-medium text-zinc-500">{bp.mood}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. BALANCED SPLIT: MOOD GENERATOR & LIVE UI MOCKUP PREVIEW          */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left Column: Mood Generator & Photo Color Extractor */}
        <div className="space-y-6 lg:col-span-6">
          {/* Natural Language Mood Generator */}
          <div className="rounded-3xl border border-white/10 bg-[#0a0d14]/80 p-6 sm:p-7 shadow-xl">
            <div className="mb-4 space-y-1">
              <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
                <Palette size={16} className="text-emerald-400" />
                <span>Generate by Theme or Mood</span>
              </h3>
              <p className="text-xs font-medium text-zinc-400">
                Type any vibe, aesthetic, or industry keyword to instantly generate balanced colors.
              </p>
            </div>

            <form onSubmit={handlePromptGenerate} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the mood, vibe, or style (e.g. 'Warm Sunset', 'Minimalist SaaS', 'Cyberpunk Neon')..."
                  className="h-14 w-full rounded-2xl border border-white/10 bg-zinc-900/80 px-4 text-xs font-bold text-white placeholder-zinc-500 shadow-inner outline-none transition-all focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 sm:pr-36"
                />
                <button
                  type="submit"
                  className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-xs font-black uppercase tracking-wider text-emerald-950 shadow-md transition-all hover:bg-emerald-400 active:scale-95 sm:absolute sm:right-1.5 sm:top-1.5 sm:mt-0 sm:w-auto"
                >
                  <Palette size={14} />
                  <span>Generate</span>
                </button>
              </div>

              {/* 8 Quick Mood Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "Minimalist SaaS",
                  "Warm Sunset",
                  "Matcha Cafe",
                  "Cyberpunk Neon",
                  "Earthy Organic",
                  "Retro 80s",
                  "Cozy Autumn",
                  "Midnight Luxury",
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setPrompt(chip);
                      const lower = chip.toLowerCase();
                      let mode = "balanced";
                      if (lower.includes("sunset") || lower.includes("autumn")) mode = "complementary";
                      if (lower.includes("minimalist")) mode = "monochromatic";
                      if (lower.includes("neon") || lower.includes("midnight")) mode = "dark";
                      if (lower.includes("matcha") || lower.includes("earthy")) mode = "analogous";
                      setHarmonyMode(mode);
                      generatePalette(mode);
                    }}
                    className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-zinc-400 transition-all hover:border-emerald-500/30 hover:bg-white/10 hover:text-emerald-300"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Photo Color Extractor Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0a0d14]/80 p-6 sm:p-7 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
                  <ImageIcon size={16} className="text-emerald-400" />
                  <span>Extract Palette from Image</span>
                </h3>
                <p className="text-xs font-medium text-zinc-400">
                  Drop any photo or design screenshot to pull its 5 most prominent colors.
                </p>
              </div>
              {imageExtractSuccess && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 size={12} /> Extracted!
                </span>
              )}
            </div>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) processImageFile(file);
              }}
              className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-zinc-900/40 p-6 text-center transition-all hover:border-emerald-500/40 hover:bg-emerald-500/[0.02]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) processImageFile(file);
                }}
                className="hidden"
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition-all group-hover:scale-110 group-hover:text-emerald-400">
                <Upload size={20} />
              </div>
              <p className="mt-3 text-xs font-bold text-zinc-200">
                {isExtractingImage ? "Extracting dominant colors..." : "Drop photo here or browse image"}
              </p>
              <p className="mt-1 text-[10px] font-medium text-zinc-500">
                PNG, JPG, WebP • 100% in-browser on your device
              </p>
            </div>

            {/* 3 Instant Demo Sample Images */}
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/5 pt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Try Sample Photo:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => extractFromSample("neon")}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-zinc-300 hover:border-cyan-400/40 hover:text-cyan-300 transition-all"
                >
                  Neon Skyline
                </button>
                <button
                  type="button"
                  onClick={() => extractFromSample("nature")}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-zinc-300 hover:border-emerald-400/40 hover:text-emerald-300 transition-all"
                >
                  Alpine Forest
                </button>
                <button
                  type="button"
                  onClick={() => extractFromSample("sunset")}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-zinc-300 hover:border-amber-400/40 hover:text-amber-300 transition-all"
                >
                  Golden Sunset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Design Mockup Preview */}
        <div className="space-y-6 lg:col-span-6">
          <div className="rounded-3xl border border-white/10 bg-[#0a0d14]/80 p-6 sm:p-7 shadow-xl">
            {/* Header & Tabs */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
                  <Eye size={16} className="text-emerald-400" />
                  <span>Live Product Mockup</span>
                </h3>
                <p className="text-xs font-medium text-zinc-400">
                  See how your colors look when assembled in real user interfaces.
                </p>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setPreviewTab("website")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all",
                    previewTab === "website" ? "bg-white/15 text-emerald-400" : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  <Monitor size={12} />
                  <span>Website</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("mobile")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all",
                    previewTab === "mobile" ? "bg-white/15 text-emerald-400" : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  <Smartphone size={12} />
                  <span>Mobile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("brand")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all",
                    previewTab === "brand" ? "bg-white/15 text-emerald-400" : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  <Layers size={12} />
                  <span>Tokens</span>
                </button>
              </div>
            </div>

            {/* Dynamic Interactive Stage Mockup */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 p-6">
              {colors.length > 0 && (
                <>
                  {/* Mode 1: Website Card UI */}
                  {previewTab === "website" && (
                    <div
                      className="rounded-2xl p-6 transition-all duration-300"
                      style={{
                        backgroundColor: colors[0]?.hex || "#0F172A",
                        border: `1px solid ${colors[2]?.hex || "#38BDF8"}33`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider"
                          style={{
                            backgroundColor: `${colors[3]?.hex || "#10B981"}25`,
                            color: colors[3]?.hex || "#10B981",
                          }}
                        >
                          Design System Ready
                        </span>
                        <div className="flex gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[1]?.hex }} />
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[2]?.hex }} />
                        </div>
                      </div>

                      <h4
                        className="mt-4 text-xl font-black tracking-tight"
                        style={{ color: getContrastRatio(colors[0]?.hex || "#000").textColor }}
                      >
                        Launch Products Faster
                      </h4>
                      <p
                        className="mt-1 text-xs leading-relaxed"
                        style={{
                          color: getContrastRatio(colors[0]?.hex || "#000").textColor,
                          opacity: 0.75,
                        }}
                      >
                        Clean typography paired with accessible contrast delivers engaging, modern creative experiences.
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          className="rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-transform hover:scale-105"
                          style={{
                            backgroundColor: colors[1]?.hex || "#2563EB",
                            color: getContrastRatio(colors[1]?.hex || "#2563EB").textColor,
                          }}
                        >
                          Primary Action
                        </button>
                        <button
                          type="button"
                          className="rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all"
                          style={{
                            border: `1px solid ${colors[2]?.hex || "#ffffff"}55`,
                            color: getContrastRatio(colors[0]?.hex || "#000").textColor,
                          }}
                        >
                          Explore Details
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Mobile App Card UI */}
                  {previewTab === "mobile" && (
                    <div className="mx-auto max-w-sm rounded-3xl border border-white/10 bg-zinc-900/90 p-5 shadow-2xl">
                      <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-md"
                            style={{
                              backgroundColor: colors[1]?.hex,
                              color: getContrastRatio(colors[1]?.hex).textColor,
                            }}
                          >
                            EX
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">Daily Focus Goal</p>
                            <p className="text-[10px] text-zinc-400">84% completed today</p>
                          </div>
                        </div>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[9px] font-black"
                          style={{
                            backgroundColor: `${colors[3]?.hex}30`,
                            color: colors[3]?.hex,
                          }}
                        >
                          ACTIVE
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: "75%",
                            backgroundColor: colors[2]?.hex,
                          }}
                        />
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          className="flex-1 rounded-xl py-2 text-center text-xs font-bold transition-all"
                          style={{
                            backgroundColor: colors[1]?.hex,
                            color: getContrastRatio(colors[1]?.hex).textColor,
                          }}
                        >
                          View Report
                        </button>
                        <button
                          type="button"
                          className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode 3: Brand Identity Tokens */}
                  {previewTab === "brand" && (
                    <div className="space-y-3">
                      {colors.map((c, i) => {
                        const roles = ["Primary Brand", "Secondary Accent", "Vibrant Highlight", "Muted Complement", "Light Surface", "Dark Base"];
                        const role = roles[i] || `Color Token ${i + 1}`;
                        return (
                          <div
                            key={c.id || i}
                            className="flex items-center justify-between rounded-xl border border-white/5 bg-zinc-900/60 p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="h-9 w-9 rounded-xl shadow-md"
                                style={{ backgroundColor: c.hex }}
                              />
                              <div>
                                <p className="text-xs font-bold text-zinc-200">{role}</p>
                                <p className="text-[10px] text-zinc-500">{c.name}</p>
                              </div>
                            </div>
                            <span className="font-mono text-xs font-bold text-zinc-300">{c.hex}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Export Center Box */}
          <div className="rounded-3xl border border-white/10 bg-[#0a0d14]/80 p-6 sm:p-7 shadow-xl">
            <div className="mb-4 space-y-1">
              <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
                <Code2 size={16} className="text-emerald-400" />
                <span>Export & Downloads</span>
              </h3>
              <p className="text-xs font-medium text-zinc-400">
                Copy palette code for modern web projects or download image assets.
              </p>
            </div>

            {/* Format Selector Pills */}
            <div className="grid grid-cols-4 gap-2">
              {(["css", "tailwind", "scss", "json"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setExportMode(exportMode === mode ? null : mode)}
                  className={cn(
                    "rounded-xl py-2.5 text-center text-xs font-black uppercase tracking-wider transition-all",
                    exportMode === mode
                      ? "bg-emerald-500 text-emerald-950 shadow-md"
                      : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Code Output Drawer */}
            <AnimatePresence>
              {exportMode && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="relative mt-3 overflow-hidden"
                >
                  <textarea
                    readOnly
                    value={getExportString()}
                    className="h-32 w-full resize-none rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-[11px] text-emerald-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(getExportString());
                      setCopiedHex("CODE");
                      setTimeout(() => setCopiedHex(null), 1800);
                    }}
                    className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-zinc-800/90 px-2.5 py-1 text-[10px] font-bold text-zinc-200 transition-all hover:bg-emerald-500 hover:text-emerald-950"
                  >
                    {copiedHex === "CODE" ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedHex === "CODE" ? "Copied" : "Copy"}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Direct Image Downloads */}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={downloadPalettePng}
                disabled={colors.length === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 py-3.5 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-500/20 active:scale-95 disabled:opacity-40"
              >
                <Download size={14} />
                <span>Download PNG (1600x900)</span>
              </button>
              <button
                type="button"
                onClick={downloadPaletteSvg}
                disabled={colors.length === 0}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-xs font-bold text-zinc-300 transition-all hover:bg-white/10 hover:text-white active:scale-95"
                title="Download Scalable Vector SVG"
              >
                <Code2 size={14} />
                <span>SVG</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. WORKFLOW MASTERY & KEYBOARD TIPS BAR (Plain Everyday English)    */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.03] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <HelpCircle size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Designer Workflow Tips
            </h4>
            <p className="text-xs text-zinc-400">
              Press <strong className="text-zinc-200">Spacebar</strong> to roll fresh combinations. Click <strong className="text-zinc-200">Lock</strong> to freeze favorites while shuffling the rest.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-zinc-300">Space</span>
          <span>Shuffle</span>
          <span className="text-zinc-600">•</span>
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-zinc-300">Click Swatch</span>
          <span>Copy Hex</span>
        </div>
      </div>

    </div>
  );
}
