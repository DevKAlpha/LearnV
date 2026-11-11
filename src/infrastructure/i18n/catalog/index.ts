import type { Locale } from "@/domain/models/i18n";
import { es, type TranslationCatalog } from "./es";

export type { TranslationCatalog };

/**
 * Spanish ships with the entry bundle (primary audience and fallback). English and Korean
 * are separate chunks, fetched once when first needed, so the startup bundle carries one
 * language instead of three.
 */
const loaded: Partial<Record<Locale, TranslationCatalog>> = { es };
const pending: Partial<Record<Locale, Promise<TranslationCatalog>>> = {};

const loaders: Record<Exclude<Locale, "es">, () => Promise<TranslationCatalog>> = {
  en: () => import("./en").then((module) => module.en),
  ko: () => import("./ko").then((module) => module.ko),
};

export function getLoadedCatalog(locale: Locale): TranslationCatalog | undefined {
  return loaded[locale];
}

export function loadCatalog(locale: Locale): Promise<TranslationCatalog> {
  const ready = loaded[locale];
  if (ready) return Promise.resolve(ready);
  if (locale === "es") return Promise.resolve(es);
  pending[locale] ??= loaders[locale]().then((catalog) => {
    loaded[locale] = catalog;
    return catalog;
  }).finally(() => { delete pending[locale]; });
  return pending[locale];
}
