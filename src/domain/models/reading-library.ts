import type { Locale } from "./i18n";

export const readingCategories = ["gks", "business", "health", "data", "writing", "language"] as const;
export type ReadingCategory = typeof readingCategories[number];
export type ReadingLanguage = "en" | "ko";
export type ReadingResource = {
  id: string;
  language: ReadingLanguage;
  title: string;
  author: string;
  category: ReadingCategory;
  kind: "book" | "guide" | "reading";
  url: string;
  sourceUrl: string;
  verifiedAt: string;
  level: "foundation" | "intermediate" | "advanced";
  note?: Partial<Record<Locale, string>>;
};

export function filterReadings(resources: readonly ReadingResource[], language: ReadingLanguage, category: ReadingCategory | "all", query: string, categoryLabels?: Record<ReadingCategory, string>) {
  const terms = query.normalize("NFKC").toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return resources.filter((resource) => resource.language === language && (category === "all" || resource.category === category)
    && terms.every((term) => `${resource.title} ${resource.author} ${resource.category} ${categoryLabels?.[resource.category] ?? ""}`.normalize("NFKC").toLocaleLowerCase().includes(term)));
}
