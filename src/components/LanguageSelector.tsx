"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import '@/lib/i18n/config'; // Import config to initialize

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪', dir: 'rtl' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', dir: 'ltr' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', dir: 'ltr' },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initial RTL check
    const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];
    document.documentElement.dir = currentLang.dir;
    document.documentElement.lang = currentLang.code;
  }, [i18n.language]);

  const handleLanguageChange = (lang: typeof LANGUAGES[0]) => {
    i18n.changeLanguage(lang.code);
    document.documentElement.dir = lang.dir;
    document.documentElement.lang = lang.code;
    setIsOpen(false);
    
    // Save to localStorage (i18next-browser-languagedetector does this automatically but we can be explicit)
    localStorage.setItem('i18nextLng', lang.code);
    
    // Potential Supabase sync could go here
    // syncWithSupabase(lang.code);
  };

  if (!mounted) return null;

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-all group border border-transparent hover:border-white/10"
        title="Change Language"
      >
        <Globe size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-3 w-48 rounded-2xl glass-dark border border-white/10 shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-2 space-y-1">
                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 mb-1">
                  Select Language
                </div>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang)}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl flex items-center justify-between transition-all group hover:bg-white/5",
                      i18n.language === lang.code ? "bg-accent-purple/10 text-white" : "text-zinc-400"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{lang.flag}</span>
                      <span className={cn(
                        "text-xs font-bold uppercase tracking-wider",
                        i18n.language === lang.code ? "text-accent-purple" : "group-hover:text-white"
                      )}>
                        {lang.name}
                      </span>
                    </div>
                    {i18n.language === lang.code && <Check size={14} className="text-accent-purple" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
