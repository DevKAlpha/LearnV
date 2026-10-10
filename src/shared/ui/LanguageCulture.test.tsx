import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { LanguageCulture } from "./LanguageCulture";
import { languageCultureCopy } from "@/infrastructure/i18n/language-culture-copy";

const scenario = vi.hoisted(() => ({ locale: "es" as "es" | "en" | "ko" }));
vi.mock("@/application/i18n/I18nContext", () => ({ useI18n: () => ({ locale: scenario.locale }) }));

describe.each(["es", "en", "ko"] as const)("language identity in %s", (locale) => {
  it.each(["en", "ko"] as const)("keeps the learning language explicit for %s in every variant", (language) => {
    scenario.locale = locale;
    for (const variant of ["card", "hero", "badge"] as const) {
      const html = renderToStaticMarkup(<LanguageCulture language={language} variant={variant} />);
      expect(html).toContain(`data-language="${language}"`);
      expect(html).toContain(`lang="${language}"`);
      expect(html).toContain(language === "en" ? "English" : "한국어");
      expect(html).toContain(languageCultureCopy[locale][language].name);
      expect(html).not.toMatch(/<img|<iframe|https?:\/\//);
      if (variant === "badge") {
        expect(html).not.toContain("<svg");
        expect(html).not.toContain("language-culture__greeting");
      } else {
        expect(html).toMatch(/<svg[^>]*aria-hidden="true"[^>]*focusable="false"/);
        expect(html).toContain(languageCultureCopy[locale][language].greetingMeaning);
        expect(html).toContain(language === "en" ? "Hello!" : "안녕하세요");
      }
      expect(html.includes(languageCultureCopy[locale][language].detail)).toBe(variant === "hero");
    }
  });
});

describe("lightweight responsive culture styles", () => {
  const css = readFileSync(new URL("../../styles/language-culture.css", import.meta.url), "utf8");
  it("has local dark palettes and narrow/desktop layouts without global scaling", () => {
    expect(css).toContain('[data-theme="dark"] .language-culture');
    expect(css).toContain('@media (max-width: 380px)');
    expect(css).toContain('@media (min-width: 900px)');
    expect(css).toContain("minmax(0,1fr)");
    expect(css).not.toMatch(/animation:|backdrop-filter:|url\(|\b(?:html|body)\s*\{/);
  });
  it("does not hide cultural identity or add fixed image dimensions on mobile", () => {
    expect(css).not.toMatch(/display:\s*none|position:\s*(absolute|fixed)|height:\s*\d+(px|vh)/);
    expect(css).toContain("overflow-wrap: anywhere");
    expect(css).toContain("height: auto");
  });
});
