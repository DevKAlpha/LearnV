import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LibraryQuickAccess } from "./layout/LibraryQuickAccess";
import { LibraryPanel } from "@/features/library/presentation/LibraryPanel";
import { readingLibrary } from "@/infrastructure/data/reading-library";
import { libraryLabels } from "@/infrastructure/i18n/library-copy";
import { libraryTriggerLabels } from "@/infrastructure/i18n/library-trigger-copy";
import { readingCategories } from "@/domain/models/reading-library";
import { getDefinition } from "./layout/section-help";

const scenario = vi.hoisted(() => ({ locale: "es" as "es" | "en" | "ko" }));
vi.mock("@/application/i18n/I18nContext", () => ({ useI18n: () => ({ locale: scenario.locale }) }));
afterEach(() => { scenario.locale = "es"; });

it("has unique public reading targets and meaningful coverage in both languages", () => {
  expect(readingLibrary.length).toBeGreaterThanOrEqual(35);
  expect(new Set(readingLibrary.map((item) => item.id)).size).toBe(readingLibrary.length);
  for (const language of ["en", "ko"] as const) {
    const catalogue = readingLibrary.filter((item) => item.language === language);
    expect(catalogue.length).toBeGreaterThanOrEqual(15);
    expect(new Set(catalogue.map((item) => item.url)).size).toBe(catalogue.length);
    for (const topic of ["gks", "business", "health", "data", "language"]) expect(catalogue.some((item) => item.category === topic)).toBe(true);
    for (const item of catalogue) {
      expect(new URL(item.url).protocol).toBe("https:");
      expect(item.url).not.toMatch(/\.(zip|docx?|exe)(\?|$)|\/book\/|login|signup|checkout/);
      expect(item.author.trim()).not.toBe("");
      expect(item.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  }
});

describe.each(["es", "en", "ko"] as const)("library in %s", (locale) => {
  it("starts as one quiet button without mounting or requesting reading resources", () => {
    scenario.locale = locale;
    const html = renderToStaticMarkup(<LibraryQuickAccess />);
    expect(html).toContain(`aria-label="${libraryLabels[locale].open}"`);
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toMatch(/<a |<iframe|<img|reading-library|https:/);
  });
  it("renders real SVG books as single direct links, with no intermediate action", () => {
    scenario.locale = locale;
    const html = renderToStaticMarkup(<LibraryPanel />);
    const language = locale === "ko" ? "ko" : "en";
    const entries = readingLibrary.filter((item) => item.language === language);
    expect((html.match(/<a /g) ?? []).length).toBe(entries.length);
    expect((html.match(/class="library-book-art"/g) ?? []).length).toBe(entries.length);
    expect(html).not.toMatch(/<iframe|<img/);
    for (const item of entries) expect(html).toContain(`href="${item.url.replaceAll("&", "&amp;")}" target="_blank" rel="noopener noreferrer"`);
    for (const category of readingCategories) {
      expect(libraryLabels[locale].categories[category].length).toBeGreaterThan(0);
      expect(libraryLabels[locale].purpose[category].length).toBeGreaterThan(10);
    }
    expect(html).toContain(libraryLabels[locale].newTab);
  });
  it("keeps deferred and trigger copy consistent and documents the floating library in help", () => {
    for (const key of Object.keys(libraryTriggerLabels[locale]) as Array<keyof typeof libraryTriggerLabels[typeof locale]>) expect(libraryLabels[locale][key]).toBe(libraryTriggerLabels[locale][key]);
    expect(getDefinition("/study/english").steps.find((step) => step.selector === ".library-quick-trigger")?.text[locale]).toBeTruthy();
  });
});
