import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { translations } from "@/infrastructure/i18n/translations";
import { TESTS_PER_LANGUAGE, TESTS_PER_SKILL } from "@/infrastructure/data/practice-tests";
import { LanguageStudyPage } from "@/features/study/presentation/pages/LanguageStudyPage";
import { TestPathPage } from "@/features/study/presentation/pages/TestPathPage";
import { LanguageGoals } from "@/features/home/presentation/LanguageGoals";

const scenario = vi.hoisted(() => ({ locale: "es" as "es" | "en" | "ko" }));
vi.mock("@/application/i18n/I18nContext", () => ({ useI18n: () => ({ locale: scenario.locale, copy: translations[scenario.locale], setLocale: vi.fn() }) }));
vi.mock("@/application/controllers/useLanguageTestProgress", () => ({ useLanguageTestProgress: () => ({ totals: { en: 6, ko: 3 }, progress: { en: {}, ko: {} } }) }));
vi.mock("@/infrastructure/data/learning-error-log", () => ({ recordLearningError: vi.fn() }));

describe.each(["es", "en", "ko"] as const)("culture identity integration in %s", (locale) => {
  it.each(["en", "ko"] as const)("keeps progress, language isolation and learning links for %s", (language) => {
    scenario.locale = locale;
    const hub = renderToStaticMarkup(<MemoryRouter><LanguageStudyPage language={language} /></MemoryRouter>);
    expect(hub.match(new RegExp(`data-language="${language}"`, "g"))).toHaveLength(2);
    expect(hub).not.toContain(`data-language="${language === "en" ? "ko" : "en"}"`);
    expect(hub).toContain(`href="/tests/${language}"`);
    expect(hub).toContain(`${language === "en" ? 6 : 3}/${TESTS_PER_LANGUAGE}`);
    expect(hub).toContain('id="language-tests"');
    expect(hub).toContain('id="language-materials"');
    expect(hub).toContain(`illustrations/storybook/${language === "en" ? "london" : "seoul"}.svg`);
    const path = renderToStaticMarkup(<MemoryRouter initialEntries={[`/tests/${language}`]}><Routes><Route path="/tests/:language" element={<TestPathPage />} /></Routes></MemoryRouter>);
    expect(path).toContain(`data-language="${language}"`);
    expect(path).toContain('language-culture--badge');
    expect(path).not.toContain('language-culture__art');
    expect(path).toContain(`0/${TESTS_PER_SKILL}`);
    expect(path).toContain('aria-disabled="true"'); // Locked stages stay locked.
  });
  it("keeps both home objectives and their entry actions", () => {
    scenario.locale = locale;
    const html = renderToStaticMarkup(<MemoryRouter><LanguageGoals /></MemoryRouter>);
    for (const language of ["en", "ko"]) expect(html).toContain(`data-language="${language}"`);
    for (const route of ["english", "korean"]) expect(html).toContain(`href="/study/${route}"`);
    expect(html.match(/class="band-row"/g)?.length).toBeGreaterThan(0);
  });
});
