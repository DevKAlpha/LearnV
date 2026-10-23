import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { readFileSync } from "node:fs";
import { LanguageStudyPage } from "@/features/study/presentation/pages/LanguageStudyPage";
import { LanguageRestartModule } from "@/features/study/presentation/components/LanguageRestartModule";
import { translations } from "@/infrastructure/i18n/translations";
import { learningRestartCopy } from "@/infrastructure/i18n/learning-restart-copy";
import { getDefinition } from "@/app/layout/SectionTour";
import { RestartToolCard } from "@/features/study/presentation/components/RestartToolCard";
import { RestartToolNote } from "@/features/study/presentation/components/RestartToolNote";
import { TestSessionPage } from "@/features/study/presentation/pages/TestSessionPage";
import { restartLessons, restartTargetId } from "@/infrastructure/data/learning-restart-lessons";
import { getLanguageStageMetadata } from "@/infrastructure/data/language-path-summary";
import type { TestProgressState } from "@/domain/models/language-test";

const scenario = vi.hoisted(() => ({ locale: "es" as "es" | "en" | "ko", baseLocale: "es" as "es" | "en" | "ko", progress: { en: {}, ko: {} } as TestProgressState }));
vi.mock("@/application/i18n/I18nContext", () => ({ useI18n: () => ({ locale: scenario.locale, baseLocale: scenario.baseLocale, copy: translations[scenario.locale], setLocale: vi.fn() }) }));
vi.mock("@/application/controllers/useLanguageTestProgress", () => ({ useLanguageTestProgress: () => ({ totals: { en: 6, ko: 3 }, progress: scenario.progress, recordAttempt: vi.fn() }) }));
const render = (node: React.ReactNode) => renderToStaticMarkup(<MemoryRouter>{node}</MemoryRouter>);
afterEach(() => { vi.unstubAllGlobals(); scenario.progress = { en: {}, ko: {} }; });

describe.each(["es", "en", "ko"] as const)("restart module with %s help", (locale) => {
  it.each(["en", "ko"] as const)("appears before the existing %s track without resetting progress or eagerly mounting the exercise", (language) => {
    scenario.locale = language; scenario.baseLocale = locale;
    const html = render(<LanguageStudyPage language={language} />);
    expect(html.indexOf('class="learning-restart ')).toBeLessThan(html.indexOf('class="test-hub"'));
    expect(html).toContain(learningRestartCopy[locale].title[language]);
    expect(html).toContain(`lang="${locale}"`);
    expect(html).toContain('aria-expanded="false"');
    const bodyId = html.match(/aria-controls="([^"]+)"/)?.[1];
    expect(bodyId).toBeTruthy();
    expect(html).toContain(`id="${bodyId}" class="learning-restart__body" hidden=""`);
    expect(html).not.toContain('class="learning-restart__exercise"');
    expect(html).toContain(learningRestartCopy[locale].prerequisite[language]);
    expect(html).toContain('value="es"'); expect(html).toContain('value="en"'); expect(html).toContain('value="ko"');
    expect(html).toContain(`${language === "en" ? 6 : 3}/132`);
    expect(html).toContain(`href="/tests/${language}"`);
    for (const route of ["/gks", "/profile", "/checklist"]) expect(html).not.toContain(`href="${route}"`);
  });
  it.each(["en", "ko"] as const)("teaches and reuses the exact same %s tools, with valid practice and return links", (language) => {
    scenario.locale = language; scenario.baseLocale = locale;
    for (const lesson of restartLessons[language]) {
      const route = `/study/${language === "en" ? "english" : "korean"}?intro=${lesson.id}`;
      const intro = renderToStaticMarkup(<MemoryRouter initialEntries={[route]}><LanguageRestartModule language={language} /></MemoryRouter>);
      const tool = renderToStaticMarkup(<RestartToolCard lesson={lesson} locale={locale} language={language} />);
      expect(intro).toContain(tool);
      expect(intro).toContain('aria-expanded="true"');
      expect(intro).not.toContain('class="learning-restart__body" hidden=""');
      expect(intro).toContain(lesson.help[locale].title);
      expect(intro).toContain(lesson.targetTitle);
      const score = getLanguageStageMetadata(language, restartTargetId(language, lesson))!.passScore;
      expect(intro).toContain(learningRestartCopy[locale].method[2].replace("{score}", String(score)));
      expect(intro).not.toContain("{score}");
      const note = render(<RestartToolNote language={language} stageId={restartTargetId(language, lesson)} />);
      expect(note).toContain(tool);
      expect(note).toContain(`?intro=${lesson.id}#language-tests`);
      expect(note).not.toContain('open=""');
      expect(note).toContain('target="_blank"');
      expect(note).toContain('rel="noopener noreferrer"');
    }
  });
});
it.each(["en", "ko"] as const)("limits %s tool support to first-attempt production, not retakes or unrelated activities", (language) => {
  scenario.locale = language; scenario.baseLocale = "es";
  const session = (id: string) => renderToStaticMarkup(<MemoryRouter initialEntries={[`/tests/${language}/${id}`]}><Routes><Route path="/tests/:language/:stageId" element={<TestSessionPage />} /></Routes></MemoryRouter>);
  for (const lesson of restartLessons[language]) {
    const id = restartTargetId(language, lesson);
    expect(session(id)).toContain('class="restart-tool-note"');
    scenario.progress[language][id] = { attempts: 1, bestScore: 0, lastScore: 0, passed: false, lastCompletedAt: "2026-10-21T12:00:00Z" };
    expect(session(id)).not.toContain('class="restart-tool-note"');
  }
  expect(render(<RestartToolNote language={language} stageId={`${language}-reading-02`} />)).toBe("");
});
it("ignores an invalid deep-link lesson instead of mounting unknown content", () => {
  scenario.locale = "en"; scenario.baseLocale = "es";
  const html = renderToStaticMarkup(<MemoryRouter initialEntries={["/study/english?intro=unknown"]}><LanguageRestartModule language="en" /></MemoryRouter>);
  expect(html).toContain('aria-expanded="false"');
  expect(html).not.toContain('class="learning-restart__exercise"');
});
it.each(["en", "ko"] as const)("does not copy saved %s completion into test results or preselect a practice answer", (language) => {
  scenario.locale = language; scenario.baseLocale = "es";
  const values = new Map([[`learnv-restart-v1:${language}`, '["meaning","form","use"]']]);
  vi.stubGlobal("localStorage", { getItem: (key: string) => values.get(key) ?? null });
  const html = renderToStaticMarkup(<MemoryRouter initialEntries={[`/study/${language === "en" ? "english" : "korean"}?intro=use`]}><LanguageRestartModule language={language} /></MemoryRouter>);
  expect(html).toContain("3/3");
  expect(html).toContain(learningRestartCopy.es.done);
  expect(html).not.toMatch(/type="radio"[^>]*checked/);
  expect(html).toContain('disabled=""');
  expect(scenario.progress).toEqual({ en: {}, ko: {} });
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
