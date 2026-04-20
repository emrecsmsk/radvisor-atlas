"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  LOCALE_STORAGE_KEY,
  defaultLocale,
  isLocale,
  type Locale,
} from "./config";
import { tr } from "./messages/tr";
import { en } from "./messages/en";
import type { Dictionary } from "./messages/tr";

const dictionaries: Record<Locale, Dictionary> = { tr, en };

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isLocale(saved) && saved !== locale) {
        setLocaleState(saved);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mirror to <html lang>
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLocale(): { locale: Locale; setLocale: (l: Locale) => void } {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useLocale must be used within I18nProvider");
  return { locale: ctx.locale, setLocale: ctx.setLocale };
}

export function useT(): Dictionary {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used within I18nProvider");
  return ctx.t;
}
