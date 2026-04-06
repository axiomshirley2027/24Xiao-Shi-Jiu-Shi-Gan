import { useState, useCallback } from 'react';

export type Lang = 'en' | 'zh';

const LANG_KEY = '24h_hustle_lang';

function getStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'en' || stored === 'zh') return stored;
  } catch {}
  return 'en';
}

export function useLang() {
  const [lang, setLangState] = useState<Lang>(getStoredLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(LANG_KEY, l); } catch {}
  }, []);

  const toggle = useCallback(() => {
    setLangState(prev => {
      const next = prev === 'en' ? 'zh' : 'en';
      try { localStorage.setItem(LANG_KEY, next); } catch {}
      return next;
    });
  }, []);

  const t = useCallback((en: string, zh: string) => lang === 'zh' ? zh : en, [lang]);

  return { lang, setLang, toggle, t };
}
