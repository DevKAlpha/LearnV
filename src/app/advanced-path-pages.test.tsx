import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { translations } from "@/infrastructure/i18n/translations";
import { advancedPathCopy } from "@/infrastructure/i18n/advanced-path-copy";
import { practiceTestTracks } from "@/infrastructure/data/practice-tests";
import { advancedPracticeTracks } from "@/infrastructure/data/advanced-practice-tests";
import { TestPathPage } from "@/features/study/presentation/pages/TestPathPage";
import { TestSessionPage } from "@/features/study/presentation/pages/TestSessionPage";
import { LanguageStudyPage } from "@/features/study/presentation/pages/LanguageStudyPage";
import { TestTrackCards } from "@/features/study/presentation/components/TestTrackCards";
import type { TestProgressState } from "@/domain/models/language-test";

const scenario = vi.hoisted(() => ({ locale: "es" as "es" | "en" | "ko", progress: { en: {}, ko: {} } as TestProgressState }));
vi.mock("@/application/i18n/I18nContext", () => ({ useI18n: () => ({ locale: scenario.locale, copy: translations[scenario.locale], setLocale: vi.fn() }) }));
vi.mock("@/application/controllers/useLanguageTestProgress", () => ({ useLanguageTestProgress: () => ({ progress: scenario.progress, totals: { en: 132, ko: 132 }, recordAttempt: vi.fn() }) }));
vi.mock("@/infrastructure/data/learning-error-log", () => ({ recordLearningError: vi.fn() }));

const complete = (language: "en" | "ko", advanced = false) => Object.fromEntries([...practiceTestTracks[language].stages, ...(advanced ? advancedPracticeTracks[language].stages : [])].map((stage) => [stage.id, { attempts: 1, bestScore: 100, lastScore: 100, passed: true, lastCompletedAt: "2026-10-12T12:00:00.000Z" }]));
const pathHtml = (route: string) => renderToStaticMarkup(<MemoryRouter initialEntries={[route]}><Routes><Route path="/tests/:language" element={<TestPathPage />} /></Routes></MemoryRouter>);
const sessionHtml = (route: string) => renderToStaticMarkup(<MemoryRouter initialEntries={[route]}><Routes><Route path="/tests/:language/:stageId" element={<TestSessionPage />} /></Routes></MemoryRouter>);

beforeEach(() => { scenario.progress = { en: {}, ko: {} }; });
describe.each(["es", "en", "ko"] as const)("advanced navigation in %s", (locale) => {
  it.each(["en", "ko"] as const)("automatically shows new content and retains an archive for %s", (language) => {
    scenario.locale = locale;
    scenario.progress[language] = complete(language);
    const html = pathHtml(`/tests/${language}`);
    expect(html).toContain("0/18");
    expect(html).not.toContain("<main"); // The route already lives inside the app's main landmark.
    expect(html).toContain('class="test-skill-sections"');
    expect(html).toContain(`test-path-page--advanced`);
    expect(html).toContain('class="test-map"');
    expect(html).toContain('class="test-path-connector"');
    expect(html.match(/class="test-path-c1-label">C1<\/span>/g)).toHaveLength(2);
    expect(html).toContain('aria-current="step"');
    expect(html).toContain('class="test-map-node test-map-node--locked" aria-disabled="true"');
    expect(html).toContain("0/3");
    expect(html).toContain(advancedPathCopy[locale].notice);
    expect(html).toContain(`href="/tests/${language}/${language}-c1-reading-01"`);
    expect(html).not.toContain(`href="/tests/${language}/${language}-c1-reading-02"`);
    expect(html).toContain(`href="/tests/${language}?phase=foundation"`);
    expect(html).not.toContain("test-path-expand"); // Only a few steps, no lengthy advanced wall.
    const archive = pathHtml(`/tests/${language}?phase=foundation`);
    expect(archive).toContain("132/132");
    expect(archive).toContain("test-path-page--foundation");
    expect(archive).not.toContain('class="test-path-c1-label"');
    expect(archive).toContain(advancedPathCopy[locale].archive);
    expect(archive).toContain(`href="/tests/${language}/${language}-reading-22"`);
    expect(archive).not.toContain(`href="/tests/${language}/${language}-c1-reading-01"`);
    expect(pathHtml(`/tests/${language === "en" ? "ko" : "en"}`)).toContain("0/132");
  });
  it.each(["en", "ko"] as const)("updates the hub and entry card for %s", (language) => {
    scenario.locale = locale;
    scenario.progress[language] = complete(language);
    const title = language === "en" ? advancedPathCopy[locale].title : advancedPathCopy[locale].koreanTitle;
    const hub = renderToStaticMarkup(<MemoryRouter><LanguageStudyPage language={language} /></MemoryRouter>);
    expect(hub).toContain(title);
    expect(hub).toContain("0/18");
    expect(hub).not.toContain("132/132");
    const card = renderToStaticMarkup(<MemoryRouter><TestTrackCards languages={[language]} /></MemoryRouter>);
    expect(card).toContain(title);
    expect(card).toContain(advancedPathCopy[locale].baseDone);
    expect(card).toContain(advancedPathCopy[locale].notice);
  });
  it.each(["en", "ko"] as const)("renders advanced written tasks and a disabled continue button before evidence for %s", (language) => {
    scenario.locale = locale;
    scenario.progress[language] = complete(language);
    const html = sessionHtml(`/tests/${language}/${language}-c1-writing-01`);
    expect(html).not.toContain("<main");
    expect(html).toContain(advancedPathCopy[locale].criteria);
    expect(html).toContain(advancedPathCopy[locale].notice);
    expect(html).toContain(language === "en" ? "220–260 words" : "500–700");
    expect(html).toContain("<textarea");
    expect(html).toContain("disabled=\"\"");
    expect(html).toContain("language-culture--badge"); // Keep the existing badge; no extra hero animation in exercises.
  });
});

it.each(["en", "ko"] as const)("keeps the foundation route ordered and its cultural art decorative for %s", (language) => {
  scenario.locale = "es";
  const html = pathHtml(`/tests/${language}`);
  expect(html).toContain("test-path-page--foundation");
  expect(html).toContain('class="test-map"');
  expect(html).toContain('class="test-path-culture-accent"');
  expect(html).toContain('aria-hidden="true" focusable="false"');
  expect(html).not.toContain('class="test-path-c1-label"');
  expect(html).toContain('aria-current="step"');
  expect(html).toContain(`href="/tests/${language}/${language}-reading-01"`);
  expect(html).not.toContain(`href="/tests/${language}/${language}-reading-02"`);
  expect(html.indexOf(`${language}-reading-01`)).toBeLessThan(html.indexOf("test-map-node--locked"));
});

it("retains advanced completion and replay links rather than resetting to the initial chain", () => {
  scenario.locale = "es";
  scenario.progress.en = complete("en", true);
  const html = pathHtml("/tests/en");
  expect(html).toContain("18/18");
  expect(html).toContain(advancedPathCopy.es.finished);
  expect(html).toContain("href=\"/tests/en/en-c1-reading-03\"");
});
