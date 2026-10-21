import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "node:fs";
import { LanguageStudyPage } from "@/features/study/presentation/pages/LanguageStudyPage";
import { LanguageRestartModule } from "@/features/study/presentation/components/LanguageRestartModule";
import { translations } from "@/infrastructure/i18n/translations";
import { learningRestartCopy } from "@/infrastructure/i18n/learning-restart-copy";
import { getDefinition } from "@/app/layout/SectionTour";

const scenario = vi.hoisted(() => ({ locale: "es" as "es" | "en" | "ko", baseLocale: "es" as "es" | "en" | "ko", progress: [] as string[] }));
vi.mock("@/application/i18n/I18nContext", () => ({ useI18n: () => ({ locale: scenario.locale, baseLocale: scenario.baseLocale, copy: translations[scenario.locale], setLocale: vi.fn() }) }));
vi.mock("@/application/controllers/useLanguageTestProgress", () => ({ useLanguageTestProgress: () => ({ totals: { en: 6, ko: 3 }, progress: { en: {}, ko: {} } }) }));
const render = (node: React.ReactNode) => renderToStaticMarkup(<MemoryRouter>{node}</MemoryRouter>);
afterEach(() => { vi.unstubAllGlobals(); });

describe.each(["es", "en", "ko"] as const)("restart module with %s help", (locale) => {
  it.each(["en", "ko"] as const)("appears before the existing %s track without resetting progress or eagerly mounting the exercise", (language) => {
    scenario.locale = language; scenario.baseLocale = locale;
    const html = render(<LanguageStudyPage language={language} />);
    expect(html.indexOf('class="learning-restart ')).toBeLessThan(html.indexOf('class="test-hub"'));
    expect(html).toContain(learningRestartCopy[locale].title[language]);
    expect(html).toContain(`lang="${locale}"`);
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('class="learning-restart__exercise"');
    expect(html).toContain('value="es"'); expect(html).toContain('value="en"'); expect(html).toContain('value="ko"');
    expect(html).toContain(`${language === "en" ? 6 : 3}/132`);
    expect(html).toContain(`href="/tests/${language}"`);
    for (const route of ["/gks", "/profile", "/checklist"]) expect(html).not.toContain(`href="${route}"`);
  });
});
it("restores independent completion and offers review instead of deleting progress", () => {
  scenario.locale = "ko"; scenario.baseLocale = "es";
  vi.stubGlobal("localStorage", { getItem: (key: string) => key.includes("restart-v1:ko") ? '["meaning","form","use"]' : null });
  const html = render(<LanguageRestartModule language="ko" />);
  expect(html).toContain("3/3"); expect(html).toContain(learningRestartCopy.es.review);
});
it("introduces the refresher before the full track in the contextual tour", () => {
  for (const route of ["/study/english", "/study/korean"]) {
    const steps = getDefinition(route).steps;
    expect(steps.findIndex((step) => step.selector === ".learning-restart")).toBeLessThan(steps.findIndex((step) => step.selector === ".test-hub"));
  }
});
it("keeps the component off startup imports, with no new QA routes or heavy visual effects", () => {
  const css = readFileSync(new URL("../styles/learning-restart.css", import.meta.url), "utf8");
  expect(css).not.toMatch(/url\(|animation:|backdrop-filter|will-change/);
  expect(css).toContain("forced-colors: active");
  expect(css).toContain("max-width: 719px");
  expect(css).toContain("outline: 3px solid var(--story-ink)");
  expect(readFileSync(new URL("../main.tsx", import.meta.url), "utf8")).not.toContain("learning-restart");
});
