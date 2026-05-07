"use client";

import { ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n/config';

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initial sync of RTL and lang on mount
    const currentLang = i18n.language;
    const dir = ['ar'].includes(currentLang) ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = currentLang;
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
