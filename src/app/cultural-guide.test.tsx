import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CulturalGuideEntry } from "@/features/scholarship/presentation/CulturalGuideEntry";
import { CulturalGuide } from "@/features/scholarship/presentation/CulturalGuide";
import { cultureEntryCopy } from "@/infrastructure/i18n/culture-entry-copy";
import { culturalGuideCopy } from "@/infrastructure/i18n/cultural-guide-copy";
import { cultureCases, cultureSources, cultureStories } from "@/infrastructure/data/cultural-guide";
import { getDefinition } from "./layout/section-help";

const scenario = vi.hoisted(() => ({ locale: "es" as "es" | "en" | "ko" }));
vi.mock("@/application/i18n/I18nContext", () => ({ useI18n: () => ({ locale: scenario.locale }) }));
afterEach(() => { vi.unstubAllGlobals(); scenario.locale = "es"; });

describe.each(["es", "en", "ko"] as const)("cultural guide in %s", (locale) => {
  it("keeps the catalogue, quiz and storage out of the unopened entry", () => {
    scenario.locale = locale;
    const getItem = vi.fn(); vi.stubGlobal("localStorage", { getItem });
    const html = renderToStaticMarkup(<CulturalGuideEntry />);
    expect(html).toContain('id="gks-culture"');
    expect(html).toContain(cultureEntryCopy[locale].title.replaceAll("&", "&amp;"));
    expect(html).not.toMatch(/<fieldset|<input|https:|<iframe|<details[^>]* open=/);
    expect(getItem).not.toHaveBeenCalled();
  });
  it("renders accessible practice and contextualised first-hand stories without external embeds", () => {
    scenario.locale = locale;
    const html = renderToStaticMarkup(<CulturalGuide />);
    expect((html.match(/aria-controls="culture-case-panel"/g) ?? []).length).toBe(cultureCases.length);
    expect((html.match(/type="radio"/g) ?? []).length).toBe(2);
    expect((html.match(/type="checkbox"/g) ?? []).length).toBe(1);
    expect(html).not.toMatch(/<iframe|<img|checked=""/);
    expect(html).toContain(culturalGuideCopy[locale].simulation);
    expect(html).toContain(culturalGuideCopy[locale].local);
    for (const story of cultureStories) {
      expect(html).toContain(`id="culture-story-${story.id}"`);
      expect(html).toContain(story.person);
    }
    for (const source of cultureSources) expect(html).toContain(`href="${source.url.replaceAll("&", "&amp;")}" target="_blank" rel="noopener noreferrer"`);
    expect(html).toContain("112"); expect(html).toContain("119");
  });
  it("explains the cultural section in the scholarship help map", () => {
    expect(getDefinition("/gks").steps.find((step) => step.selector === ".culture-entry")?.text[locale]).toBeTruthy();
  });
});
