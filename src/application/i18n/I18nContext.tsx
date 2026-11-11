import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Locale } from "../../domain/models/i18n";
import { getLoadedCatalog, loadCatalog, type TranslationCatalog } from "../../infrastructure/i18n/catalog";
import { appRelativePath } from "@/infrastructure/config/app-scope";
import { resolveLearningLocale } from "./learning-locale";

const STORAGE_KEY = "learnv-locale-v1";

type I18nContextValue = {
  baseLocale: Locale;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  setLearningLocale: (locale: Locale | null) => void;
  copy: TranslationCatalog;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function detectLocale(): Locale {
  let saved;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch { /* Use the browser language. */ }
  if (saved === "es" || saved === "en" || saved === "ko") return saved;

  const browserLocale = navigator.language.toLowerCase();
  if (browserLocale.startsWith("ko")) return "ko";
  if (browserLocale.startsWith("en")) return "en";
  return "es";
}

/** Loads the start-up language before the first render, so nobody sees a flash of Spanish. */
export function preloadInitialLocale() {
  // A directly opened immersive route (e.g. /tests/ko) also needs its practice language.
  const learning = typeof window === "undefined" ? null : resolveLearningLocale(appRelativePath(window.location.pathname));
  const locales = new Set<Locale>([detectLocale(), ...(learning ? [learning] : [])]);
  return Promise.all([...locales].map((locale) => loadCatalog(locale).catch(() => undefined)));
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [baseLocale, setBaseLocale] = useState<Locale>(detectLocale);
  const [learningLocale, setLearningLocale] = useState<Locale | null>(null);
  const requested = learningLocale ?? baseLocale;
  // The language on screen only changes once its catalog has arrived.
  const [shown, setShown] = useState<{ locale: Locale; copy: TranslationCatalog }>(() => {
    const ready = getLoadedCatalog(requested);
    return ready ? { locale: requested, copy: ready } : { locale: "es", copy: getLoadedCatalog("es")! };
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, baseLocale); } catch { /* Keep the preference in memory. */ }
  }, [baseLocale]);

  useEffect(() => {
    let active = true;
    const ready = getLoadedCatalog(requested);
    if (ready) setShown((current) => current.locale === requested ? current : { locale: requested, copy: ready });
    else void loadCatalog(requested).then((copy) => { if (active) setShown({ locale: requested, copy }); }, () => { /* Keep the current language if the chunk fails. */ });
    return () => { active = false; };
  }, [requested]);

  useEffect(() => {
    document.documentElement.lang = shown.locale;
    document.documentElement.dataset.locale = shown.locale;
  }, [shown.locale]);

  const value = useMemo(() => ({
    baseLocale,
    locale: shown.locale,
    setLocale: setBaseLocale,
    setLearningLocale,
    copy: shown.copy,
  }), [shown, baseLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}

/** Warms a catalog (e.g. Korean before opening a Korean practice) without switching to it. */
export function prefetchLocale(locale: Locale) {
  void loadCatalog(locale).catch(() => undefined);
}
