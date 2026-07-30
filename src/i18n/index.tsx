'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Lang = 'zh' | 'fi' | 'en';

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (texts: TextMap) => string;
}>({
  lang: 'zh',
  setLang: () => {},
  t: () => '',
});

export type TextMap = {
  zh: string;
  fi?: string;
  en?: string;
};

export function useLang() {
  return useContext(LangContext);
}

const COOKIE_NAME = 'lang';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

export function LangProvider({ children, initialLang }: { children: React.ReactNode; initialLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(initialLang || 'zh');

  useEffect(() => {
    const saved = getCookie(COOKIE_NAME) as Lang | null;
    if (saved && ['zh', 'fi', 'en'].includes(saved)) {
      setLangState(saved);
    } else if (initialLang) {
      setLangState(initialLang);
    }
  }, [initialLang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    setCookie(COOKIE_NAME, l);
  }, []);

  const t = useCallback((texts: TextMap) => {
    if (lang === 'zh') return texts.zh;
    if (lang === 'fi' && texts.fi) return texts.fi;
    if (lang === 'en' && texts.en) return texts.en;
    // fallback to zh
    return texts.zh;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

// Helper: wrap an object field that has zh/fi/en variants
// e.g. { title: '中文', titleFi: 'Suomi', titleEn: 'English' }
// => { title: { zh: '中文', fi: 'Suomi', en: 'English' } }
export function translateField<T extends Record<string, any>>(obj: T, field: string): string {
  const lang = (typeof window !== 'undefined' ? getCookie('lang') : null) || 'zh';
  if (lang === 'fi' && obj[`${field}Fi`]) return obj[`${field}Fi`];
  if (lang === 'en' && obj[`${field}En`]) return obj[`${field}En`];
  return obj[field] || '';
}

// Server-side: pick language from cookie/middleware header
export function pickLang(request?: { headers?: Headers }): Lang {
  // Try cookie first
  if (request?.headers) {
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(new RegExp('(?:^|; )lang=([^;]*)'));
    if (match && ['fi', 'en'].includes(match[1])) return match[1] as Lang;
  }
  return 'zh';
}
