import type { Locale } from "../../domain/models/i18n";
import { es, type TranslationCatalog } from "./catalog/es";
import { en } from "./catalog/en";
import { ko } from "./catalog/ko";

export type { TranslationCatalog };

/** Every catalog at once. For tests and tooling only: the app loads catalogs per locale (see catalog/index.ts). */
export const translations: Record<Locale, TranslationCatalog> = { es, en, ko };
