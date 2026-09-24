"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import {
  QrCode,
  Globe,
  Wifi,
  FileText,
  User,
  Mail,
  Phone,
  Palette,
  Download,
  Copy,
  CheckCircle2,
  Smartphone,
  CreditCard,
  Store,
  Upload,
  Trash2,
  RotateCcw,
  ShieldCheck,
  ExternalLink,
  Eye,
  Sliders,
  Check,
  Maximize2,
  Lock,
  Layers,
  ChevronDown,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";

type ContentType = "url" | "wifi" | "text" | "vcard" | "email" | "phone";
type ErrorLevel = "L" | "M" | "Q" | "H";
type MockupView = "canvas" | "phone" | "card" | "tent";

// Clean, high-contrast brand icons for center logo presets (URL-encoded SVG strings)
const LOGO_PRESETS: Array<{ id: string; name: string; svgDataUrl: string }> = [
  {
    id: "exismic",
    name: "Exismic",
    svgDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="24" fill="#090a0f"/>
        <polygon points="50,15 82,33 82,67 50,85 18,67 18,33" stroke="#10b981" stroke-width="8" stroke-linejoin="round" fill="#042f24"/>
        <path d="M38,40 L62,40 L38,60 L62,60 M38,50 L56,50" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `)}`
  },
  {
    id: "globe",
    name: "Website",
    svgDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="24" fill="#0284c7"/>
        <circle cx="50" cy="50" r="32" stroke="#ffffff" stroke-width="6"/>
        <ellipse cx="50" cy="50" rx="14" ry="32" stroke="#ffffff" stroke-width="6"/>
        <line x1="18" y1="50" x2="82" y2="50" stroke="#ffffff" stroke-width="6"/>
      </svg>
    `)}`
  },
  {
    id: "wifi",
    name: "Wi-Fi",
    svgDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="24" fill="#10b981"/>
        <path d="M22,34 C38,20 62,20 78,34" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
        <path d="M32,48 C42,38 58,38 68,48" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
        <path d="M42,62 C46,57 54,57 58,62" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
        <circle cx="50" cy="74" r="5" fill="#ffffff"/>
      </svg>
    `)}`
  },
  {
    id: "instagram",
    name: "Instagram",
    svgDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#f59e0b"/>
            <stop offset="50%" stop-color="#f43f5e"/>
            <stop offset="100%" stop-color="#8b5cf6"/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="24" fill="url(#ig)"/>
        <rect x="24" y="24" width="52" height="52" rx="16" stroke="#ffffff" stroke-width="7"/>
        <circle cx="50" cy="50" r="13" stroke="#ffffff" stroke-width="7"/>
        <circle cx="64" cy="36" r="4" fill="#ffffff"/>
      </svg>
    `)}`
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    svgDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="24" fill="#0077b5"/>
        <circle cx="34" cy="34" r="7" fill="#ffffff"/>
        <rect x="27" y="46" width="14" height="28" fill="#ffffff"/>
        <path d="M47,46 L60,46 L60,51 C63,47 68,45 74,45 C83,45 87,51 87,61 L87,74 L73,74 L73,63 C73,59 71,56 67,56 C63,56 61,59 61,63 L61,74 L47,74 Z" fill="#ffffff"/>
      </svg>
    `)}`
  },
  {
    id: "github",
    name: "GitHub",
    svgDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="24" fill="#181717"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M50,20 C33.4,20 20,33.4 20,50 C20,63.3 28.6,74.5 40.6,78.5 C42.1,78.8 42.6,77.9 42.6,77.1 C42.6,76.4 42.6,74.6 42.5,72 C34.2,73.8 32.4,68 32.4,68 C31,64.6 29.1,63.7 29.1,63.7 C26.4,61.9 29.3,61.9 29.3,61.9 C32.3,62.1 33.9,64.9 33.9,64.9 C36.5,69.5 40.8,68.1 42.5,67.4 C42.8,65.5 43.5,64.2 44.4,63.4 C37.8,62.7 30.8,60.1 30.8,48.7 C30.8,45.4 32,42.8 33.9,40.7 C33.6,39.9 32.6,36.8 34.2,32.7 C34.2,32.7 36.7,31.9 42.5,35.8 C44.9,35.1 47.5,34.8 50,34.8 C52.5,34.8 55.1,35.1 57.5,35.8 C63.3,31.9 65.8,32.7 65.8,32.7 C67.4,36.8 66.4,39.9 66.1,40.7 C68,42.8 69.2,45.4 69.2,48.7 C69.2,60.2 62.2,62.6 55.5,63.4 C56.6,64.3 57.6,66.2 57.6,69.1 C57.6,73.2 57.6,76.5 57.6,77.1 C57.6,77.9 58.1,78.8 59.6,78.5 C71.4,74.5 80,63.3 80,50 C80,33.4 66.6,20 50,20 Z" fill="#ffffff"/>
      </svg>
    `)}`
  },
  {
    id: "youtube",
    name: "YouTube",
    svgDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="24" fill="#ff0000"/>
        <path d="M78,35 C77,31 74,28 70,27 C63,25 50,25 50,25 C50,25 37,25 30,27 C26,28 23,31 22,35 C20,42 20,50 20,50 C20,50 20,58 22,65 C23,69 26,72 30,73 C37,75 50,75 50,75 C50,75 63,75 70,73 C74,72 77,69 78,65 C80,58 80,50 80,50 C80,50 80,42 78,35 Z" fill="#ffffff"/>
        <polygon points="44,40 60,50 44,60" fill="#ff0000"/>
      </svg>
    `)}`
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    svgDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="24" fill="#25d366"/>
        <path d="M50,20 C33.4,20 20,33.4 20,50 C20,56 21.8,61.6 25,66.4 L21,80 L35,76.2 C39.5,78.6 44.6,80 50,80 C66.6,80 80,66.6 80,50 C80,33.4 66.6,20 50,20 Z" fill="#ffffff"/>
        <path d="M63.5,58.8 C62.8,60.8 59.9,62.4 57.5,62.8 C55.8,63.1 53.6,63.2 46.2,59.8 C37.8,55.9 32.3,47.3 31.9,46.7 C31.5,46.1 28.5,42.1 28.5,38 C28.5,33.9 30.6,31.9 31.4,31 C32.1,30.2 33.2,29.8 34.2,29.8 C34.6,29.8 35,29.8 35.3,29.8 C36.2,29.8 36.7,30 37.3,31.4 C38,33.1 39.8,37.5 40,37.9 C40.2,38.4 40.4,39 40.1,39.6 C39.8,40.2 39.5,40.5 39.1,41 C38.7,41.5 38.3,41.8 37.8,42.4 C37.4,42.9 36.9,43.4 37.4,44.3 C37.9,45.2 39.7,48.1 42.4,50.5 C45.8,53.5 48.7,54.5 49.6,54.9 C50.5,55.3 51,55.2 51.5,54.6 C52.1,54 53.8,51.9 54.5,50.9 C55.2,49.9 55.9,50.1 56.7,50.4 C57.5,50.7 62,52.9 62.8,53.4 C63.6,53.8 64.1,54.1 64.3,54.4 C64.5,54.9 64.2,56.8 63.5,58.8 Z" fill="#25d366"/>
      </svg>
    `)}`
  }
];

// Curated Style Palettes
const COLOR_PRESETS = [
  { id: "classic", name: "Classic Crisp", fg: "#000000", bg: "#ffffff" },
  { id: "emerald", name: "Emerald Mint", fg: "#10b981", bg: "#06130d" },
  { id: "cyan", name: "Cyan Midnight", fg: "#06b6d4", bg: "#040b17" },
  { id: "amber", name: "Solaris Amber", fg: "#f59e0b", bg: "#160e04" },
  { id: "purple", name: "Velvet Purple", fg: "#a855f7", bg: "#0e051a" },
  { id: "rose", name: "Crimson Rose", fg: "#f43f5e", bg: "#16050b" },
  { id: "sapphire", name: "Ocean Sapphire", fg: "#3b82f6", bg: "#050b18" },
  { id: "dark", name: "Inverted Dark", fg: "#ffffff", bg: "#0c0d14" },
];

// Dropdown Options
const WIFI_SECURITY_OPTIONS = [
  { value: "WPA", label: "WPA / WPA2 / WPA3", sublabel: "Recommended standard" },
  { value: "WEP", label: "WEP", sublabel: "Legacy network encryption" },
  { value: "nopass", label: "None (Open Network)", sublabel: "No password required" }
];

const ERROR_LEVEL_OPTIONS: Array<{ value: ErrorLevel; label: string; sublabel: string }> = [
  { value: "L", label: "Standard (7%)", sublabel: "Fastest scan for simple web links" },
  { value: "M", label: "Medium (15%)", sublabel: "Balanced protection for cards & menus" },
  { value: "Q", label: "High (25%)", sublabel: "High protection for rough print materials" },
  { value: "H", label: "Maximum (30%)", sublabel: "Best for codes with embedded center logos" }
];

const EXPORT_RESOLUTION_OPTIONS = [
  { value: 500, label: "500 px (Web)", sublabel: "Fast loading for digital displays" },
  { value: 1000, label: "1,000 px (HD)", sublabel: "Crisp retina sharpness for presentations" },
  { value: 2000, label: "2,000 px (Ultra-HD)", sublabel: "Ultra-sharp for posters, signs & billboards" }
];

// 4 Instant Demonstration Blueprints ($0 Compute Previews)
const BLUEPRINTS = [
  {
    id: "portfolio",
    title: "Portfolio Website",
    badge: "Creator Link",
    description: "Personal creative agency link styled in signature Emerald Mint.",
    type: "url" as ContentType,
    url: "https://exismic.com/portfolio",
    fg: "#10b981",
    bg: "#06130d",
    logoId: "exismic"
  },
  {
    id: "wifi",
    title: "Café Guest Wi-Fi",
    badge: "1-Tap Connect",
    description: "Scan to auto-join guest Wi-Fi on iPhone and Android without typing passwords.",
    type: "wifi" as ContentType,
    ssid: "Studio Guest WiFi",
    password: "create2026",
    encryption: "WPA",
    fg: "#f59e0b",
    bg: "#160e04",
    logoId: "wifi"
  },
  {
    id: "vcard",
    title: "Executive Business Card",
    badge: "Contact Card",
    description: "Instant address book import with name, phone, email, and company details.",
    type: "vcard" as ContentType,
    name: "Alex Vance",
    company: "Exismic Studio",
    role: "Lead Creative Designer",
    phone: "+1 (555) 234-5678",
    email: "alex@exismic.com",
    fg: "#000000",
    bg: "#ffffff",
    logoId: "exismic"
  },
  {
    id: "social",
    title: "Social Media Hub",
    badge: "Instagram / Linktree",
    description: "Clean link directly to multi-channel social profiles and store pages.",
    type: "url" as ContentType,
    url: "https://instagram.com/exismic",
    fg: "#06b6d4",
    bg: "#040b17",
    logoId: "instagram"
  }
];

// Reusable Luxury Studio Dropdown Component
interface DropdownOption<T extends string | number> {
  value: T;
  label: string;
  sublabel?: string;
}

function StudioDropdown<T extends string | number>({
  value,
  onChange,
  options,
  placeholder,
  className,
  direction = "down",
}: {
  value: T;
  onChange: (value: T) => void;
  options: DropdownOption<T>[];
  placeholder?: string;
  className?: string;
  direction?: "down" | "up";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div ref={dropdownRef} className={cn("relative w-full", isOpen ? "z-[100]" : "z-auto", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-[#0a0c12] hover:bg-[#121520] border border-white/15 hover:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white flex items-center justify-between transition-all cursor-pointer shadow-inner group",
          isOpen && "border-emerald-500 ring-1 ring-emerald-500/40"
        )}
      >
        <span className="truncate pr-2 font-semibold text-zinc-100">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-zinc-400 group-hover:text-emerald-400 transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-emerald-400"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: direction === "up" ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: direction === "up" ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute left-0 right-0 z-[9999] bg-[#12141c] border border-white/20 rounded-2xl p-1.5 shadow-[0_25px_60px_rgba(0,0,0,0.99),0_0_25px_rgba(16,185,129,0.2)] space-y-1 max-h-60 overflow-y-auto",
              direction === "up" ? "bottom-full mb-2" : "top-full mt-2"
            )}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer group",
                    isSelected
                      ? "bg-emerald-500/20 border border-emerald-500/40 text-white font-bold"
                      : "text-zinc-200 hover:bg-white/[0.08] hover:text-white border border-transparent"
                  )}
                >
                  <div className="flex flex-col min-w-0 pr-3">
                    <span
                      className={cn(
                        "text-xs font-semibold leading-tight",
                        isSelected ? "text-emerald-300" : "text-zinc-200 group-hover:text-white"
                      )}
                    >
                      {opt.label}
                    </span>
                    {opt.sublabel && (
                      <span className="text-[10px] text-zinc-400 group-hover:text-zinc-300 leading-tight mt-0.5">
                        {opt.sublabel}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function QRCodeGenerator() {
  // Content Type State
  const [contentType, setContentType] = useState<ContentType>("url");

  // Form Fields
  const [urlValue, setUrlValue] = useState("https://exismic.com");
  const [wifiSsid, setWifiSsid] = useState("Studio Guest WiFi");
  const [wifiPassword, setWifiPassword] = useState("create2026");
  const [wifiSecurity, setWifiSecurity] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);

  const [textValue, setTextValue] = useState("Scan to explore Exismic Creative Studio.");
  
  const [vcardName, setVcardName] = useState("Alex Vance");
  const [vcardCompany, setVcardCompany] = useState("Exismic Studio");
  const [vcardRole, setVcardRole] = useState("Lead Creative Designer");
  const [vcardPhone, setVcardPhone] = useState("+1 (555) 234-5678");
  const [vcardEmail, setVcardEmail] = useState("alex@exismic.com");

  const [emailTo, setEmailTo] = useState("hello@exismic.com");
  const [emailSubject, setEmailSubject] = useState("Partnership Inquiry");
  const [emailBody, setEmailBody] = useState("Hi Team,\n\nI'd like to collaborate with you on a project.");

  const [phoneNumber, setPhoneNumber] = useState("+15552345678");

  // Visual Styling State
  const [fgColor, setFgColor] = useState("#10b981");
  const [bgColor, setBgColor] = useState("#06130d");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("emerald");

  // Logo State
  const [logoSrc, setLogoSrc] = useState<string | null>(LOGO_PRESETS[0].svgDataUrl);
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>("exismic");
  const [includeLogo, setIncludeLogo] = useState(true);
  const [logoSize, setLogoSize] = useState(54);

  // Technical & Presentation
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("H");
  const [exportResolution, setExportResolution] = useState<number>(1000);
  const [mockupView, setMockupView] = useState<MockupView>("canvas");
  const [isCopied, setIsCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (logoSrc && logoSrc.startsWith("blob:")) {
        URL.revokeObjectURL(logoSrc);
      }
    };
  }, [logoSrc]);

  // Handle Logo File Drop
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (logoSrc && logoSrc.startsWith("blob:")) URL.revokeObjectURL(logoSrc);
      const url = URL.createObjectURL(file);
      setLogoSrc(url);
      setSelectedLogoId("custom");
      setIncludeLogo(true);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false
  });

  // Compute final QR String payload based on active content type
  const qrString = useMemo(() => {
    switch (contentType) {
      case "url": {
        let trimmed = urlValue.trim();
        if (!trimmed) return "https://exismic.com";
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
          trimmed = "https://" + trimmed;
        }
        return trimmed;
      }
      case "wifi": {
        const ssid = wifiSsid.trim() || "MyWiFi";
        if (wifiSecurity === "nopass") {
          return `WIFI:T:nopass;S:${ssid};;`;
        }
        const pass = wifiPassword.trim();
        const hidden = wifiHidden ? "H:true;" : "";
        return `WIFI:T:${wifiSecurity};S:${ssid};P:${pass};${hidden};`;
      }
      case "text":
        return textValue.trim() || "Welcome to Exismic.";
      case "vcard": {
        const n = vcardName.trim() || "Contact";
        const c = vcardCompany.trim();
        const r = vcardRole.trim();
        const p = vcardPhone.trim();
        const e = vcardEmail.trim();
        return `BEGIN:VCARD\nVERSION:3.0\nN:${n}\nFN:${n}${c ? `\nORG:${c}` : ""}${r ? `\nTITLE:${r}` : ""}${p ? `\nTEL:${p}` : ""}${e ? `\nEMAIL:${e}` : ""}\nEND:VCARD`;
      }
      case "email": {
        const to = emailTo.trim();
        const sub = encodeURIComponent(emailSubject.trim());
        const body = encodeURIComponent(emailBody.trim());
        return `mailto:${to}?subject=${sub}&body=${body}`;
      }
      case "phone": {
        const clean = phoneNumber.trim().replace(/[^0-9+]/g, "");
        return `tel:${clean || "+15550000000"}`;
      }
      default:
        return "https://exismic.com";
    }
  }, [contentType, urlValue, wifiSsid, wifiPassword, wifiSecurity, wifiHidden, textValue, vcardName, vcardCompany, vcardRole, vcardPhone, vcardEmail, emailTo, emailSubject, emailBody, phoneNumber]);

  // Load a demonstration blueprint
  const handleLoadBlueprint = (bp: typeof BLUEPRINTS[0]) => {
    setContentType(bp.type);
    setFgColor(bp.fg);
    setBgColor(bp.bg);
    setSelectedPresetId("custom");

    if (bp.logoId) {
      const preset = LOGO_PRESETS.find(p => p.id === bp.logoId);
      if (preset) {
        setLogoSrc(preset.svgDataUrl);
        setSelectedLogoId(preset.id);
        setIncludeLogo(true);
      }
    }

    if (bp.type === "url" && bp.url) {
      setUrlValue(bp.url);
    } else if (bp.type === "wifi") {
      setWifiSsid(bp.ssid || "Studio Guest WiFi");
      setWifiPassword(bp.password || "create2026");
      setWifiSecurity("WPA");
    } else if (bp.type === "vcard") {
      setVcardName(bp.name || "Alex Vance");
      setVcardCompany(bp.company || "Exismic Studio");
      setVcardRole(bp.role || "Lead Creative Designer");
      setVcardPhone(bp.phone || "+1 (555) 234-5678");
      setVcardEmail(bp.email || "alex@exismic.com");
    }
  };

  // High-Resolution PNG Download
  const downloadHighResPNG = () => {
    const offscreen = document.createElement("canvas");
    offscreen.width = exportResolution;
    offscreen.height = exportResolution;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    const sourceCanvas = canvasContainerRef.current?.querySelector("canvas");
    if (!sourceCanvas) return;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sourceCanvas, 0, 0, exportResolution, exportResolution);

    const a = document.createElement("a");
    a.href = offscreen.toDataURL("image/png");
    a.download = `exismic-qr-code-${exportResolution}px.png`;
    a.click();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2200);
  };

  // Scalable Vector SVG Download
  const downloadVectorSVG = () => {
    const svgElem = svgContainerRef.current?.querySelector("svg");
    if (!svgElem) return;

    const svgData = new XMLSerializer().serializeToString(svgElem);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `exismic-qr-vector.svg`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2200);
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    const canvas = canvasContainerRef.current?.querySelector("canvas");
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob })
          ]);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
          console.error("Clipboard copy error:", err);
        }
      }
    });
  };

  return (
    <div className="w-full space-y-8 lg:space-y-10">
      {/* Main Studio Dual-Pane Layout */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* LEFT COLUMN (5 COLS): Controls & Customization */}
        <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
          <div className="bg-[#0c0d14]/90 border border-white/10 rounded-[2rem] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative">
            {/* Ambient Background Aura isolated in its own overflow-hidden layer */}
            <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none" aria-hidden="true">
              <div 
                className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-[90px] opacity-15 transition-all duration-700"
                style={{ backgroundColor: fgColor }}
              />
            </div>

            {/* Title Header */}
            <div className="flex items-center justify-between pb-5 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-wider">Customize Your Code</h2>
                  <p className="text-xs text-zinc-400">Design high-contrast, camera-ready QR codes</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setContentType("url");
                  setUrlValue("https://exismic.com");
                  setFgColor("#10b981");
                  setBgColor("#06130d");
                  setSelectedPresetId("emerald");
                  setSelectedLogoId("exismic");
                  setLogoSrc(LOGO_PRESETS[0].svgDataUrl);
                  setIncludeLogo(true);
                  setErrorLevel("H");
                  setExportResolution(1000);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
                title="Reset to defaults"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* STEP 1: Content Type Switcher */}
            <div className="mt-6 space-y-3 relative z-10">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span>1. What Should This QR Open?</span>
                <span className="text-[10px] text-emerald-400 font-semibold">{contentType.toUpperCase()}</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "url", label: "Website Link", icon: Globe },
                  { id: "wifi", label: "Wi-Fi Network", icon: Wifi },
                  { id: "vcard", label: "Contact Card", icon: User },
                  { id: "text", label: "Plain Text", icon: FileText },
                  { id: "email", label: "Send Email", icon: Mail },
                  { id: "phone", label: "Call Phone", icon: Phone }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = contentType === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setContentType(item.id as ContentType)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer group",
                        isActive
                          ? "bg-emerald-500/15 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                          : "bg-black/30 border-white/5 text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/[0.03]"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 mb-1.5 transition-transform group-hover:scale-110", isActive ? "text-emerald-400" : "text-zinc-400")} />
                      <span className="text-[10px] font-bold tracking-tight leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: Content Inputs */}
            <div className="mt-5 space-y-4 relative z-30">
              {contentType === "url" && (
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-zinc-300">Website or Page Address (URL)</label>
                  <div className="relative">
                    <input
                      type="url"
                      value={urlValue}
                      onChange={(e) => setUrlValue(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 pl-10 text-sm font-medium text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-600"
                    />
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 opacity-70" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    {["https://exismic.com", "https://instagram.com/", "https://linkedin.com/in/"].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setUrlValue(preset)}
                        className="text-[9px] font-mono text-zinc-400 hover:text-emerald-300 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded border border-white/5 transition-colors cursor-pointer"
                      >
                        {preset.replace("https://", "")}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {contentType === "wifi" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1.5">Network Name (SSID)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        placeholder="e.g. CoffeeShop_Guest"
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 pl-10 text-sm font-medium text-white focus:border-emerald-500 outline-none"
                      />
                      <Wifi className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 opacity-70" />
                    </div>
                  </div>

                  {wifiSecurity !== "nopass" && (
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-300 block mb-1.5">Network Password</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          placeholder="Wi-Fi Password"
                          className="w-full bg-black/50 border border-white/10 rounded-xl p-3 pl-10 text-sm font-medium text-white focus:border-emerald-500 outline-none"
                        />
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 opacity-70" />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Security Type</label>
                      <StudioDropdown
                        value={wifiSecurity}
                        onChange={(val) => setWifiSecurity(val as "WPA" | "WEP" | "nopass")}
                        options={WIFI_SECURITY_OPTIONS}
                        direction="down"
                      />
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-black/30 border border-white/5 rounded-xl self-end h-[42px]">
                      <span className="text-[11px] font-semibold text-zinc-300">Hidden SSID</span>
                      <input
                        type="checkbox"
                        checked={wifiHidden}
                        onChange={(e) => setWifiHidden(e.target.checked)}
                        className="accent-emerald-500 w-4 h-4 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {contentType === "vcard" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold text-zinc-300 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={vcardName}
                        onChange={(e) => setVcardName(e.target.value)}
                        placeholder="Alex Vance"
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-zinc-300 block mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={vcardPhone}
                        onChange={(e) => setVcardPhone(e.target.value)}
                        placeholder="+1 555-234-5678"
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold text-zinc-300 block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={vcardEmail}
                        onChange={(e) => setVcardEmail(e.target.value)}
                        placeholder="alex@company.com"
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-zinc-300 block mb-1">Organization / Title</label>
                      <input
                        type="text"
                        value={vcardCompany}
                        onChange={(e) => setVcardCompany(e.target.value)}
                        placeholder="Exismic Creative"
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {contentType === "text" && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-semibold text-zinc-300">Plain Text Message</label>
                    <span className="text-[10px] font-mono text-zinc-500">{textValue.length} characters</span>
                  </div>
                  <textarea
                    rows={3}
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    placeholder="Enter any text, wifi instructions, or discount code..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-emerald-500 outline-none resize-none"
                  />
                </div>
              )}

              {contentType === "email" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-300 block mb-1">Recipient Email</label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="hello@exismic.com"
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-300 block mb-1">Default Subject</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Inquiry from QR code"
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {contentType === "phone" && (
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-zinc-300">Direct Dial Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 pl-10 text-sm font-medium text-white focus:border-emerald-500 outline-none"
                    />
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 opacity-70" />
                  </div>
                </div>
              )}
            </div>

            {/* STEP 3: Styling & Colors */}
            <div className="mt-8 pt-6 border-t border-white/10 space-y-4 relative z-10">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span>2. Style & Color Palette</span>
                <span className="text-[10px] font-mono text-zinc-500">{fgColor} / {bgColor}</span>
              </label>

              {/* Quick Palettes */}
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                {COLOR_PRESETS.map((p) => {
                  const isSelected = selectedPresetId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setFgColor(p.fg);
                        setBgColor(p.bg);
                        setSelectedPresetId(p.id);
                      }}
                      className={cn(
                        "px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 border transition-all cursor-pointer group bg-[#0a0c12] hover:bg-[#121520] min-w-0 text-left",
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                          : "border-white/10 hover:border-white/25"
                      )}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow flex items-center justify-center"
                        style={{ backgroundColor: p.bg }}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fg }} />
                      </div>
                      <span
                        className={cn(
                          "text-xs font-bold truncate select-none",
                          isSelected ? "text-white" : "text-zinc-400 group-hover:text-white"
                        )}
                      >
                        {p.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Pickers */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Code Color</span>
                    <span className="text-xs font-mono font-semibold text-white">{fgColor}</span>
                  </div>
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => {
                      setFgColor(e.target.value);
                      setSelectedPresetId("custom");
                    }}
                    className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-white/20"
                  />
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Background</span>
                    <span className="text-xs font-mono font-semibold text-white">{bgColor}</span>
                  </div>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => {
                      setBgColor(e.target.value);
                      setSelectedPresetId("custom");
                    }}
                    className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-white/20"
                  />
                </div>
              </div>
            </div>

            {/* STEP 4: Center Logo & Icon Suite */}
            <div className="mt-8 pt-6 border-t border-white/10 space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  3. Center Logo or Brand Icon
                </label>
                <button
                  onClick={() => setIncludeLogo(!includeLogo)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                    includeLogo
                      ? "bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                      : "bg-white/5 text-zinc-400 hover:text-white"
                  )}
                >
                  {includeLogo ? "Logo Active" : "No Logo"}
                </button>
              </div>

              {includeLogo && (
                <div className="space-y-3">
                  {/* Preset Logos with centered icon, clean full name, zero collision */}
                  <div className="grid grid-cols-4 gap-2.5">
                    {LOGO_PRESETS.map((logo) => {
                      const isSelected = selectedLogoId === logo.id;
                      return (
                        <button
                          key={logo.id}
                          onClick={() => {
                            setLogoSrc(logo.svgDataUrl);
                            setSelectedLogoId(logo.id);
                          }}
                          className={cn(
                            "relative p-3 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer group bg-[#0a0c12] hover:bg-[#121520]",
                            isSelected
                              ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_16px_rgba(16,185,129,0.35)] ring-1 ring-emerald-500"
                              : "border-white/10 hover:border-white/30"
                          )}
                          title={logo.name}
                        >
                          {/* Subtle corner check badge only if selected, placed in the top right corner so it never touches the text */}
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}

                          <img
                            src={logo.svgDataUrl}
                            alt={logo.name}
                            className="w-7 h-7 mb-2 object-contain transition-transform group-hover:scale-105"
                          />
                          <span
                            className={cn(
                              "text-[11px] font-bold text-center tracking-tight leading-tight block w-full truncate select-none",
                              isSelected ? "text-white" : "text-zinc-400 group-hover:text-white"
                            )}
                          >
                            {logo.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Upload Dropzone */}
                  <div
                    {...getRootProps()}
                    className={cn(
                      "border border-dashed rounded-2xl p-4 flex items-center justify-center gap-3 transition-all cursor-pointer",
                      isDragActive
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-white/15 bg-white/[0.02] hover:border-emerald-500/40 hover:bg-white/[0.04]"
                    )}
                  >
                    <input {...getInputProps()} />
                    {selectedLogoId === "custom" && logoSrc ? (
                      <div className="flex items-center gap-3 w-full justify-between px-2">
                        <div className="flex items-center gap-2.5">
                          <img src={logoSrc} alt="Custom Logo" className="w-7 h-7 rounded-lg object-contain bg-white/10 p-0.5" />
                          <span className="text-xs font-semibold text-emerald-400">Custom logo attached</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLogoSrc(null);
                            setSelectedLogoId(null);
                            setIncludeLogo(false);
                          }}
                          className="p-1 rounded-lg text-red-400 hover:bg-red-500/10 cursor-pointer"
                          title="Remove logo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-medium text-zinc-300">Drop your own logo or brand PNG / SVG here</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 5: Reliability & Export Settings with Custom Studio Dropdowns opening upwards */}
            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-30">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Camera Scan Reliability
                </label>
                <StudioDropdown
                  value={errorLevel}
                  onChange={(val) => setErrorLevel(val as ErrorLevel)}
                  options={ERROR_LEVEL_OPTIONS}
                  direction="up"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Export Clarity
                </label>
                <StudioDropdown
                  value={exportResolution}
                  onChange={(val) => setExportResolution(Number(val))}
                  options={EXPORT_RESOLUTION_OPTIONS}
                  direction="up"
                />
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN (7 COLS): Stage & Interactive Presentation Mockups */}
        <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
          
          {/* Top Stage Bar: Status & Mockup Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Ready to Scan
              </span>
            </div>

            {/* Mockup Mode Selector */}
            <div className="flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-xl backdrop-blur-md">
              {[
                { id: "canvas", label: "Studio Canvas", icon: QrCode },
                { id: "phone", label: "Phone Screen", icon: Smartphone },
                { id: "card", label: "Business Card", icon: CreditCard },
                { id: "tent", label: "Table Tent", icon: Store }
              ].map((m) => {
                const Icon = m.icon;
                const active = mockupView === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMockupView(m.id as MockupView)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      active
                        ? "bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN STAGE CONTAINER with macOS Window Titlebar */}
          <div className="relative bg-[#0c0d14]/90 border border-white/10 rounded-[2.5rem] p-6 sm:p-10 backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.6)] overflow-hidden">
            
            {/* macOS Window Controls */}
            <div className="flex items-center justify-between pb-6 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                <span className="ml-3 text-[11px] font-mono text-zinc-400">
                  exismic-qr-preview.png ({exportResolution}×{exportResolution}px)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyImage}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                  <span>{isCopied ? "Copied!" : "Copy Picture"}</span>
                </button>
              </div>
            </div>

            {/* PRESENTATION VIEWPORT AREA */}
            <div className="min-h-[380px] sm:min-h-[420px] flex items-center justify-center p-4">
              
              {/* VIEW 1: STUDIO CANVAS */}
              {mockupView === "canvas" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="relative flex flex-col items-center"
                >
                  {/* Outer Frame with Corner Reticles */}
                  <div className="relative p-6 sm:p-8 rounded-[2rem] shadow-2xl transition-all duration-300" style={{ backgroundColor: bgColor }}>
                    
                    {/* QR Code Canvas */}
                    <div ref={canvasContainerRef} className="relative z-10 flex items-center justify-center">
                      <QRCodeCanvas
                        value={qrString}
                        size={320}
                        level={errorLevel}
                        bgColor={bgColor}
                        fgColor={fgColor}
                        marginSize={2}
                        imageSettings={includeLogo && logoSrc ? {
                          src: logoSrc,
                          x: undefined,
                          y: undefined,
                          height: logoSize,
                          width: logoSize,
                          excavate: true
                        } : undefined}
                        style={{ width: "min(100%, 320px)", height: "auto", borderRadius: "12px" }}
                      />
                    </div>

                    {/* Hidden Scalable SVG Node for instant clean SVG export */}
                    <div ref={svgContainerRef} className="hidden" aria-hidden="true">
                      <QRCodeSVG
                        value={qrString}
                        size={exportResolution}
                        level={errorLevel}
                        bgColor={bgColor}
                        fgColor={fgColor}
                        marginSize={2}
                        imageSettings={includeLogo && logoSrc ? {
                          src: logoSrc,
                          x: undefined,
                          y: undefined,
                          height: logoSize * (exportResolution / 320),
                          width: logoSize * (exportResolution / 320),
                          excavate: true
                        } : undefined}
                      />
                    </div>
                  </div>

                  {/* Bottom Verification Badge */}
                  <div className="mt-5 flex items-center gap-2 text-xs text-zinc-400 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Point your smartphone camera to test scan immediately</span>
                  </div>
                </motion.div>
              )}

              {/* VIEW 2: SMARTPHONE MOCKUP */}
              {mockupView === "phone" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-[280px] sm:w-[320px] rounded-[3rem] border-[6px] border-[#22242b] bg-[#000000] p-4 shadow-2xl relative overflow-hidden"
                >
                  {/* Dynamic Island */}
                  <div className="w-24 h-5 bg-[#15161a] rounded-full mx-auto mb-4 flex items-center justify-end px-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500/70" />
                  </div>

                  {/* Camera Scanner Viewfinder */}
                  <div className="relative rounded-2xl bg-zinc-900/90 p-4 border border-white/10 overflow-hidden flex flex-col items-center">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Camera Scanner Active</span>
                    </div>

                    <div className="relative p-3 rounded-xl shadow-lg" style={{ backgroundColor: bgColor }}>
                      <QRCodeCanvas
                        value={qrString}
                        size={180}
                        level={errorLevel}
                        bgColor={bgColor}
                        fgColor={fgColor}
                        marginSize={1}
                        imageSettings={includeLogo && logoSrc ? {
                          src: logoSrc,
                          height: 32,
                          width: 32,
                          excavate: true
                        } : undefined}
                      />
                      {/* Corner Target Reticles */}
                      <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                      <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                      <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                      <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                    </div>

                    {/* Detected Link Banner */}
                    <div className="mt-4 w-full bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-2.5 flex items-center justify-between">
                      <div className="truncate pr-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 block">Link Detected</span>
                        <span className="text-[11px] font-medium text-white truncate block">{qrString}</span>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-500 text-black px-2 py-0.5 rounded-lg shrink-0">Open</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-zinc-500 mt-4 mb-2">Simulated iOS / Android scan screen</p>
                </motion.div>
              )}

              {/* VIEW 3: LUXURY BUSINESS CARD MOCKUP */}
              {mockupView === "card" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-[440px] aspect-[1.75/1] rounded-2xl bg-gradient-to-br from-[#1c1d24] via-[#101116] to-[#0a0a0f] border border-white/15 p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Subtle Gold Foil Hairline */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60" />

                  <div className="flex items-start justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                        <User className="w-4 h-4" />
                      </div>
                      <h4 className="text-base font-black text-white tracking-wide">{vcardName || "Alex Vance"}</h4>
                      <p className="text-[11px] text-emerald-400 font-medium">{vcardRole || "Lead Creative Designer"}</p>
                      <p className="text-[10px] text-zinc-400">{vcardCompany || "Exismic Studio"}</p>
                    </div>

                    {/* QR Code on Business Card */}
                    <div className="p-2 rounded-xl bg-white shadow-xl">
                      <QRCodeCanvas
                        value={qrString}
                        size={92}
                        level={errorLevel}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        marginSize={0}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[10px] text-zinc-400 font-mono">
                    <span>{vcardPhone || "+1 (555) 234-5678"}</span>
                    <span>{vcardEmail || "alex@exismic.com"}</span>
                  </div>
                </motion.div>
              )}

              {/* VIEW 4: ACRYLIC TABLE TENT MOCKUP */}
              {mockupView === "tent" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-[260px] sm:w-[300px] rounded-2xl border-4 border-white/20 bg-gradient-to-b from-[#181920] to-[#0d0e12] p-5 shadow-2xl text-center relative"
                >
                  <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />
                  
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
                    {contentType === "wifi" ? "Connect to Wi-Fi" : "Scan to Explore"}
                  </span>
                  <h4 className="text-sm font-bold text-white mb-4">
                    {contentType === "wifi" ? wifiSsid : "Exclusive Menu & Links"}
                  </h4>

                  <div className="p-3 rounded-2xl mx-auto inline-block shadow-2xl" style={{ backgroundColor: bgColor }}>
                    <QRCodeCanvas
                      value={qrString}
                      size={160}
                      level={errorLevel}
                      bgColor={bgColor}
                      fgColor={fgColor}
                      marginSize={1}
                      imageSettings={includeLogo && logoSrc ? {
                        src: logoSrc,
                        height: 32,
                        width: 32,
                        excavate: true
                      } : undefined}
                    />
                  </div>

                  <p className="text-[10px] text-zinc-400 mt-4 leading-snug">
                    Open your camera and aim at this code to load automatically
                  </p>

                  {/* Simulated Stand Base */}
                  <div className="w-full h-3 bg-zinc-800 rounded-b-xl mt-4 border-t border-white/10" />
                </motion.div>
              )}

            </div>

            {/* PRIMARY ACTION BUTTONS */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={downloadHighResPNG}
                  className="flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG ({exportResolution}px)</span>
                </button>

                <button
                  onClick={downloadVectorSVG}
                  className="flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white rounded-2xl text-xs font-black uppercase tracking-wider border border-white/10 transition-all active:scale-95 cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4 text-emerald-400" />
                  <span>Download SVG</span>
                </button>
              </div>

              <button
                onClick={handleCopyImage}
                className="flex items-center gap-2 px-5 py-3.5 bg-black/40 hover:bg-black/60 text-zinc-300 hover:text-white rounded-2xl text-xs font-bold border border-white/10 transition-all active:scale-95 cursor-pointer"
              >
                {isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? "Copied to Clipboard!" : "Copy Picture"}</span>
              </button>
            </div>

            {/* Download feedback banner */}
            {downloadSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-300"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Downloaded successfully! Ready for print, posters, and digital displays.</span>
              </motion.div>
            )}

          </div>

          {/* 4 INSTANT DEMONSTRATION BLUEPRINTS ($0 Compute Previews) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant Ready-to-Use Blueprints</span>
              </h3>
              <span className="text-[10px] text-zinc-500">1-click instant fill</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BLUEPRINTS.map((bp) => (
                <button
                  key={bp.id}
                  onClick={() => handleLoadBlueprint(bp)}
                  className="p-4 rounded-2xl bg-[#0c0d14]/70 hover:bg-[#0c0d14] border border-white/10 hover:border-emerald-500/50 text-left transition-all duration-200 cursor-pointer group flex items-start gap-3.5"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: bp.bg }}
                  >
                    <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: bp.fg }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                        {bp.title}
                      </h4>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 whitespace-nowrap">
                        {bp.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">{bp.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Result Retention & Vault Cloud Storage */}
          <ResultRetentionBar
            toolType="qr-code"
            toolName="QR Code Studio"
            title={`QR Code (${contentType.toUpperCase()} - ${qrString.slice(0, 30)}...)`}
            content={qrString}
            downloadAction={downloadHighResPNG}
            downloadLabel="Download PNG"
            onCopy={handleCopyImage}
          />

          {/* Cross-Tool Companion Workflow */}
          <ToolWorkflowChaining
            currentToolId="productivity-qr"
            categoryId="productivity"
            outputContent={qrString}
          />

        </div>

      </main>
    </div>
  );
}
