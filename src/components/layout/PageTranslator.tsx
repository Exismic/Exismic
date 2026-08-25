"use client";

import { useEffect, useState, useRef, useTransition, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, 
  Check, 
  Search, 
  X, 
  Sparkles, 
  ChevronDown, 
  RotateCcw, 
  Languages
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FlagIcon } from "../ui/FlagIcon";
import i18n from "@/lib/i18n/config";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
    __exismicTranslateInitialized?: boolean;
  }
}

export interface LanguageOption {
  code: string;
  country: string;
  name: string;
  nativeName: string;
  region: "popular" | "asia" | "europe" | "americas" | "middle_east";
  dir?: "ltr" | "rtl";
  popular?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", country: "us", name: "English", nativeName: "English", region: "americas", dir: "ltr", popular: true },
  { code: "hi", country: "in", name: "Hindi", nativeName: "हिन्दी", region: "asia", dir: "ltr", popular: true },
  { code: "es", country: "es", name: "Spanish", nativeName: "Español", region: "europe", dir: "ltr", popular: true },
  { code: "fr", country: "fr", name: "French", nativeName: "Français", region: "europe", dir: "ltr", popular: true },
  { code: "de", country: "de", name: "German", nativeName: "Deutsch", region: "europe", dir: "ltr", popular: true },
  { code: "ar", country: "sa", name: "Arabic", nativeName: "العربية", region: "middle_east", dir: "rtl", popular: true },
  { code: "ja", country: "jp", name: "Japanese", nativeName: "日本語", region: "asia", dir: "ltr", popular: true },
  { code: "ko", country: "kr", name: "Korean", nativeName: "한국어", region: "asia", dir: "ltr", popular: true },
  { code: "ru", country: "ru", name: "Russian", nativeName: "Русский", region: "europe", dir: "ltr", popular: true },
  { code: "pt", country: "pt", name: "Portuguese", nativeName: "Português", region: "europe", dir: "ltr", popular: true },
  { code: "it", country: "it", name: "Italian", nativeName: "Italiano", region: "europe", dir: "ltr" },
  { code: "zh-CN", country: "cn", name: "Chinese", nativeName: "简体中文", region: "asia", dir: "ltr", popular: true },
  { code: "tr", country: "tr", name: "Turkish", nativeName: "Türkçe", region: "middle_east", dir: "ltr" },
  { code: "id", country: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", region: "asia", dir: "ltr" },
  { code: "vi", country: "vn", name: "Vietnamese", nativeName: "Tiếng Việt", region: "asia", dir: "ltr" },
  { code: "nl", country: "nl", name: "Dutch", nativeName: "Nederlands", region: "europe", dir: "ltr" },
  { code: "pl", country: "pl", name: "Polish", nativeName: "Polski", region: "europe", dir: "ltr" },
  { code: "uk", country: "ua", name: "Ukrainian", nativeName: "Українська", region: "europe", dir: "ltr" },
  { code: "ur", country: "pk", name: "Urdu", nativeName: "اردو", region: "middle_east", dir: "rtl" },
  { code: "bn", country: "bd", name: "Bengali", nativeName: "বাংলা", region: "asia", dir: "ltr" },
];

const REGION_TABS = [
  { id: "all", label: "All" },
  { id: "popular", label: "Popular" },
  { id: "asia", label: "Asia" },
  { id: "europe", label: "Europe" },
  { id: "middle_east", label: "Middle East" },
];

function getCookieLang(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([^;]+)/);
  return match ? match[1] : null;
}

export function PageTranslator() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<string>("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isTranslating, setIsTranslating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  // Lazy load Google Translate script ONLY when needed
  const loadGoogleTranslateScript = useCallback(() => {
    if (typeof window === "undefined" || window.__exismicTranslateInitialized) return;
    window.__exismicTranslateInitialized = true;

    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              autoDisplay: false,
              includedLanguages: SUPPORTED_LANGUAGES.map((l) => l.code).join(","),
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            },
            "google_translate_element"
          );
        }
      } catch (e) {
        console.warn("[TRANSLATOR_INIT_ERROR]", e);
      }
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.type = "text/javascript";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Read saved language from cookie or localStorage
  useEffect(() => {
    const cookieLang = getCookieLang();
    const storedLang = localStorage.getItem("exismic_page_lang");
    const active = cookieLang || storedLang || i18n.language || "en";
    setCurrentLang(active);

    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === active);
    const dir = langObj?.dir || "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = active;

    if (active !== "en") {
      loadGoogleTranslateScript();
    }
  }, [loadGoogleTranslateScript]);

  // Lazy-load when user opens dropdown
  useEffect(() => {
    if (isOpen) {
      loadGoogleTranslateScript();
    }
  }, [isOpen, loadGoogleTranslateScript]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  function handleSelectLanguage(langCode: string) {
    setIsTranslating(true);

    startTransition(() => {
      setCurrentLang(langCode);
      const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
      const dir = langObj?.dir || "ltr";
      document.documentElement.dir = dir;
      document.documentElement.lang = langCode;

      // 1. i18n language change
      if (i18n.changeLanguage) {
        i18n.changeLanguage(langCode);
      }

      // 2. Set Cookies for Google engine sync
      if (langCode === "en") {
        localStorage.removeItem("exismic_page_lang");
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;

        const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
        if (select) {
          select.value = "en";
          select.dispatchEvent(new Event("change"));
        }
      } else {
        localStorage.setItem("exismic_page_lang", langCode);
        document.cookie = `googtrans=/en/${langCode}; path=/;`;
        document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${window.location.hostname};`;

        const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
        if (select) {
          select.value = langCode;
          select.dispatchEvent(new Event("change"));
        }
      }

      setTimeout(() => {
        setIsTranslating(false);
        setIsOpen(false);
      }, 200);
    });
  }

  const selectedLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const filteredLanguages = useMemo(() => {
    return SUPPORTED_LANGUAGES.filter((lang) => {
      const matchesSearch =
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.code.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === "all") return true;
      if (activeTab === "popular") return lang.popular;
      return lang.region === activeTab;
    });
  }, [searchQuery, activeTab]);

  return (
    <div className="relative inline-block notranslate" translate="no" ref={dropdownRef}>
      {/* Hidden container for background translate engine */}
      <div id="google_translate_element" className="hidden pointer-events-none opacity-0 select-none" />

      {/* Cyber Luxury Capsule Trigger Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "group/lang relative flex h-11 items-center gap-2.5 rounded-full p-[1px] shadow-[0_8px_25px_rgba(0,0,0,0.4)] transition-all duration-300 cursor-pointer select-none notranslate",
          isOpen
            ? "shadow-[0_0_25px_rgba(34,211,238,0.35)]"
            : currentLang !== "en"
            ? "shadow-[0_0_20px_rgba(168,85,247,0.35)]"
            : ""
        )}
        title="Translate Page"
        aria-label="Translate"
        translate="no"
      >
        {/* Animated Gradient Border Ring */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 rounded-full transition-all duration-500",
            isOpen
              ? "bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 p-[1px] opacity-100"
              : currentLang !== "en"
              ? "bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-500 p-[1px] opacity-90"
              : "bg-white/[0.12] group-hover/lang:bg-gradient-to-r group-hover/lang:from-cyan-400/80 group-hover/lang:to-purple-500/80 p-[1px] opacity-80"
          )}
        />

        {/* Inner Capsule Body */}
        <div className={cn(
          "relative flex h-full items-center gap-2 rounded-full px-3 backdrop-blur-2xl transition-colors duration-300 notranslate",
          isOpen
            ? "bg-[#0a0b14] text-white"
            : currentLang !== "en"
            ? "bg-[#0b0914]/95 text-cyan-200"
            : "bg-[#07080e]/90 text-zinc-300 group-hover/lang:bg-[#0a0a14] group-hover/lang:text-white"
        )} translate="no">
          
          {/* Custom Cool Translation Indicator Icon when translated */}
          {currentLang !== "en" ? (
            <div className="relative flex items-center gap-1.5 shrink-0">
              <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.4)]">
                <Languages size={13} className="animate-pulse" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
                </span>
              </span>
              <div className="w-5 h-4 shrink-0 rounded-[2px] overflow-hidden shadow-sm flex items-center justify-center bg-black/40">
                <FlagIcon country={selectedLangObj.country} size={16} />
              </div>
            </div>
          ) : (
            <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.05)] overflow-hidden">
              <Globe size={13} className="text-cyan-300" />
            </div>
          )}

          {/* Language Text */}
          <span className="font-outfit font-black tracking-tight text-[11px] text-white truncate max-w-[70px] sm:max-w-[85px] notranslate" translate="no">
            {selectedLangObj.nativeName}
          </span>

          {currentLang !== "en" && (
            <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-[8px] font-black text-cyan-300 uppercase notranslate font-mono">
              {selectedLangObj.code.toUpperCase()}
            </span>
          )}

          {/* Chevron */}
          <ChevronDown
            size={12}
            className={cn(
              "text-zinc-500 transition-transform duration-300 group-hover/lang:text-cyan-200",
              isOpen && "rotate-180 text-cyan-300"
            )}
          />
        </div>
      </motion.button>

      {/* Floating Obsidian Glassmorphic Translate Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="absolute left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 mt-3.5 w-[360px] max-w-[94vw] rounded-[2rem] border border-white/[0.12] bg-[#07070f]/98 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_50px_rgba(34,211,238,0.12)] backdrop-blur-3xl z-50 overflow-hidden notranslate"
            translate="no"
          >
            {/* Top Ambient Glow Orb */}
            <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 bg-cyan-500/15 blur-3xl rounded-full" />

            {/* Header */}
            <div className="relative flex items-center justify-between pb-3 border-b border-white/[0.06] notranslate" translate="no">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  <Languages size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 notranslate">
                    Translate
                    {currentLang !== "en" && (
                      <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
                    )}
                  </h4>
                  <p className="text-[9px] text-zinc-500 font-medium notranslate">Select language</p>
                </div>
              </div>

              {currentLang !== "en" && (
                <button
                  onClick={() => handleSelectLanguage("en")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.05] border border-white/10 text-[9px] font-black uppercase text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer notranslate"
                  title="Reset to English"
                  translate="no"
                >
                  <RotateCcw size={10} /> Reset
                </button>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative my-3 notranslate" translate="no">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search languages (Hindi, Spanish, Arabic...)"
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.06] transition-all notranslate"
                translate="no"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Region Filter Tabs */}
            <div className="flex items-center gap-1 pb-2 overflow-x-auto no-scrollbar notranslate" translate="no">
              {REGION_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer notranslate",
                    activeTab === tab.id
                      ? "bg-cyan-400/15 border border-cyan-400/30 text-cyan-300"
                      : "bg-white/[0.02] border border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]"
                  )}
                  translate="no"
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 2-Column Grid */}
            <div className="max-h-64 overflow-y-auto grid grid-cols-2 gap-1.5 pr-1 custom-scrollbar notranslate" translate="no">
              {filteredLanguages.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-zinc-500 text-xs font-bold notranslate">
                  No languages found for &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredLanguages.map((lang) => {
                  const isSelected = currentLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLanguage(lang.code)}
                      disabled={isTranslating}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-xl text-left transition-all duration-200 group cursor-pointer border notranslate",
                        isSelected
                          ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/15 border-cyan-400/40 text-white shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                          : "bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.04] hover:border-white/[0.1] text-zinc-400 hover:text-white"
                      )}
                      translate="no"
                    >
                      <div className="flex items-center gap-2 min-w-0 notranslate" translate="no">
                        <div className="w-5 h-4 shrink-0 rounded-[2px] overflow-hidden shadow-sm flex items-center justify-center bg-black/40">
                          <FlagIcon country={lang.country} size={18} />
                        </div>
                        <div className="flex flex-col truncate notranslate" translate="no">
                          <span className="text-[11px] font-black text-zinc-200 group-hover:text-white truncate notranslate" translate="no">
                            {lang.nativeName}
                          </span>
                          <span className="text-[8.5px] text-zinc-500 truncate notranslate" translate="no">
                            {lang.name}
                          </span>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.5)] shrink-0">
                          <Languages size={10} className="text-cyan-300" />
                        </div>
                      ) : (
                        <span className="text-[8px] font-mono text-zinc-600 group-hover:text-zinc-400 uppercase shrink-0 notranslate">
                          {lang.code}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[9px] text-zinc-500 px-1 notranslate" translate="no">
              <span className="inline-flex items-center gap-1 text-zinc-400 notranslate">
                <Sparkles size={10} className="text-cyan-400" /> Auto-translate
              </span>
              <span className="font-mono text-zinc-600 notranslate">{SUPPORTED_LANGUAGES.length} Languages</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
