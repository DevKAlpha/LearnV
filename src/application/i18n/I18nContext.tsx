import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Locale } from "../../domain/models/i18n";
import { translations, type TranslationCatalog } from "../../infrastructure/i18n/translations";

const STORAGE_KEY = "learnv-locale-v1";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  setLearningLocale: (locale: Locale | null) => void;
  copy: TranslationCatalog;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function detectLocale(): Locale {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "es" || saved === "en" || saved === "ko") return saved;

  const browserLocale = navigator.language.toLowerCase();
  if (browserLocale.startsWith("ko")) return "ko";
  if (browserLocale.startsWith("en")) return "en";
  return "es";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [baseLocale, setBaseLocale] = useState<Locale>(detectLocale);
  const [learningLocale, setLearningLocale] = useState<Locale | null>(null);
  const locale = learningLocale ?? baseLocale;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, baseLocale);
  }, [baseLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
  }, [locale]);

  const value = useMemo(() => ({
    locale,
    setLocale: setBaseLocale,
    setLearningLocale,
    copy: translations[locale],
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}
