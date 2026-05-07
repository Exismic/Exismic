import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files
const resources = {
  en: {
    translation: {
      common: {
        search: "Search...",
        dashboard: "Dashboard",
        favorites: "Favorites",
        history: "History",
        tools: "Tools",
        settings: "Settings",
        logout: "Logout",
        pro: "Go Pro",
        active: "Pro Active",
        start_over: "Start Over",
        generate: "Generate",
        download: "Download",
        success: "Success",
        error: "Error",
        browse_all: "Browse All Tools",
        upgrade: "Upgrade to Pro"
      },
      nav: {
        image_tools: "Image Tools",
        video_tools: "Video Tools",
        audio_music: "Audio & Music",
        pdf_tools: "PDF Tools",
        ai_magic: "AI Magic",
        productivity: "Productivity"
      },
      hero: {
        title_top: "Powerful",
        title_bottom: "AI Tools",
        subtitle_top: "All your tools in one simple place.",
        subtitle_bottom: "Create, edit, and work faster."
      }
    }
  },
  hi: {
    translation: {
      common: {
        search: "खोजें...",
        dashboard: "डैशबोर्ड",
        favorites: "पसंदीदा",
        history: "इतिहास",
        tools: "उपकरण",
        settings: "सेटिंग्स",
        logout: "लॉगआउट",
        pro: "प्रो बनें",
        active: "प्रो सक्रिय",
        start_over: "फिर से शुरू करें",
        generate: "बनाएं",
        download: "डाउनलोड",
        success: "सफलता",
        error: "त्रुटि",
        browse_all: "सभी उपकरण देखें",
        upgrade: "प्रो में अपग्रेड करें"
      },
      nav: {
        image_tools: "इमेज टूल्स",
        video_tools: "वीडियो टूल्स",
        audio_music: "ऑडियो और संगीत",
        pdf_tools: "पीडीएफ टूल्स",
        ai_magic: "एआई मैजिक",
        productivity: "उत्पादकता"
      },
      hero: {
        title_top: "शक्तिशाली",
        title_bottom: "एआई उपकरण",
        subtitle_top: "एक ही स्लीक प्लेटफॉर्म पर आपके सभी उपकरण।",
        subtitle_bottom: "बनाएं, संपादित करें और तेज़ी से काम करें।"
      }
    }
  },
  ar: {
    translation: {
      common: {
        search: "بحث...",
        dashboard: "لوحة القيادة",
        favorites: "المفضلات",
        history: "السجل",
        tools: "الأدوات",
        settings: "الإعدادات",
        logout: "تسجيل الخروج",
        pro: "اشترك في برو",
        active: "برو نشط",
        start_over: "البدء من جديد",
        generate: "توليد",
        download: "تحميل",
        success: "نجاح",
        error: "خطأ",
        browse_all: "تصفح جميع الأدوات",
        upgrade: "الترقية إلى برو"
      },
      nav: {
        image_tools: "أدوات الصور",
        video_tools: "أدوات الفيديو",
        audio_music: "الصوت والموسيقى",
        pdf_tools: "أدوات PDF",
        ai_magic: "سحر الذكاء الاصطناعي",
        productivity: "الإنتاجية"
      },
      hero: {
        title_top: "قوية",
        title_bottom: "أدوات الذكاء الاصطناعي",
        subtitle_top: "جميع أدواتك في مكان واحد بسيط.",
        subtitle_bottom: "أنشئ وحرر واعمل بشكل أسرع."
      }
    }
  },
  de: {
    translation: {
      common: {
        search: "Suchen...",
        dashboard: "Dashboard",
        favorites: "Favoriten",
        history: "Verlauf",
        tools: "Tools",
        settings: "Einstellungen",
        logout: "Abmelden"
      }
    }
  },
  ru: {
    translation: {
      common: {
        search: "Поиск...",
        dashboard: "Панель",
        favorites: "Избранное",
        history: "История",
        tools: "Инструменты",
        settings: "Настройки",
        logout: "Выйти"
      }
    }
  },
  ko: {
    translation: {
      common: {
        search: "검색...",
        dashboard: "대시보드",
        favorites: "즐겨찾기",
        history: "기록",
        tools: "도구",
        settings: "설정",
        logout: "로그아웃"
      }
    }
  },
  ja: {
    translation: {
      common: {
        search: "検索...",
        dashboard: "ダッシュボード",
        favorites: "お気に入り",
        history: "履歴",
        tools: "ツール",
        settings: "設定",
        logout: "ログアウト"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: ['localStorage', 'cookie', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
    }
  });

export default i18n;
