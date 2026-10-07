import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { translations } from "@/infrastructure/i18n/translations";
import type { LearningJourneyController } from "@/application/controllers/useLearningJourney";
import { HomePage } from "@/features/home/presentation/HomePage";
import { StudyPage } from "@/features/study/presentation/pages/StudyPage";
import { ChecklistPage } from "@/features/documents/presentation/ChecklistPage";
import { GksPage } from "@/features/scholarship/presentation/GksPage";
import { getDefinition } from "@/app/layout/SectionTour";
import { documentStages } from "@/domain/models/document-plan";
import { TESTS_PER_LANGUAGE, TESTS_PER_SKILL } from "@/infrastructure/data/practice-tests";

const scenario = vi.hoisted(() => ({ qa: false, locale: "es" as "es" | "en" | "ko" }));
vi.mock("@/application/i18n/I18nContext", () => ({
  useI18n: () => ({ locale: scenario.locale, copy: translations[scenario.locale] }),
}));
vi.mock("@/application/qa/qa-learning-scope", async (original) => {
  const actual = await original<typeof import("@/application/qa/qa-learning-scope")>();
  return { ...actual, get isLearningQa() { return scenario.qa; }, resolveAppRoute: (path: string) => actual.resolveAppRoute(path, scenario.qa) };
});
vi.mock("@/application/controllers/useLanguageTestProgress", () => ({ useLanguageTestProgress: () => ({ totals: { en: 0, ko: 0 } }) }));
vi.mock("@/application/controllers/useGksRadar", () => ({ useGksRadar: () => ({ checkedAt: "2026-10-07T12:00:00Z", sourceChecks: [], callDetected: false, isLoading: false }) }));

const learning = {
  journey: { currentStreak: 0, longestStreak: 0, sessionCount: 1 },
  recommendation: { id: "documents", route: "/checklist" }, activeMinutes: 0, practicedSkills: 0,
  analysis: { totalAttempts: 0 },
} as unknown as LearningJourneyController;
const render = (element: React.ReactNode) => renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>);
const hasOrder = (html: string, markers: string[]) => {
  const positions = markers.map((marker) => html.indexOf(marker));
  expect(positions.every((position) => position >= 0)).toBe(true);
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
};

describe.each(["es", "en", "ko"] as const)("progressive first visit in %s", (locale) => {
  it("keeps the home action ahead of support, scholarship status and objectives", () => {
    scenario.locale = locale; scenario.qa = false;
    const html = render(<HomePage score={0} progress={{ completedTasks: [] }} toggleTask={() => {}} learning={learning} />);
    hasOrder(html, ["hero-grid", "home-today", "learning-journey", "alert-card", "objectives-drawer", "quote-card"]);
    expect(html).toContain('class="task-card__body"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('class="home-plan-drawer"');
    expect(html).not.toContain('class="home-plan-drawer" open');
  });
  it("preserves all-complete and resumed home plans", () => {
    scenario.locale = locale; scenario.qa = false;
    const all = ["topik-reading-01", "english-writing-01", "gks-story-01"];
    const completed = render(<HomePage score={100} progress={{ completedTasks: all }} toggleTask={() => {}} learning={learning} />);
    expect(completed).toContain("home-plan-complete");
    expect(completed).not.toContain("task-card--priority");
    const resumed = render(<HomePage score={30} progress={{ completedTasks: all.slice(0, 1) }} toggleTask={() => {}} learning={learning} />);
    expect(resumed).toContain('class="primary-button" href="/study/english"');
  });
  it("orders study from starter actions to languages and advanced practice; no hidden heavy content is mounted", () => {
    scenario.locale = locale; scenario.qa = false;
    const html = render(<StudyPage learning={learning} />);
    hasOrder(html, ["study-start-card", "study-language-spaces", "study-next-step", "study-support-drawer", "study-practice-labs"]);
    expect(html).not.toContain("study-support-drawer__content");
    expect(html).toContain(`0/${TESTS_PER_LANGUAGE}`);
    expect(html).toContain('href="/study/interviews"');
    expect(html).toContain('href="/study/written-simulator"');
  });
  it("keeps QA learning links useful without exposing restricted scholarship pages", () => {
    scenario.locale = locale; scenario.qa = true;
    const html = render(<HomePage score={0} progress={{ completedTasks: [] }} toggleTask={() => {}} learning={learning} />) + render(<StudyPage learning={learning} />);
    for (const route of ["/gks", "/checklist", "/profile"]) expect(html).not.toContain(`href="${route}"`);
    expect(html).toContain(translations[locale].study.qaWeekText);
    expect(html).toContain(translations[locale].journey.recommendations.continue);
  });
  it("keeps scholarship essentials ahead of optional certificates and video; advanced content starts unmounted", () => {
    scenario.locale = locale; scenario.qa = false;
    const html = render(<GksPage />);
    hasOrder(html, ["gks-daily-radar", "gks-pathway", 'id="gks-details"', 'id="gks-certifications"', "gks-guidance-stage"]);
    expect(html).not.toContain('class="gks-certification-grid"');
    expect(html).not.toContain("<iframe");
    expect(html).toContain('href="#gks-certifications"');
  });
  it("opens only the current document stage and gives timing advice without hiding later stages", () => {
    scenario.locale = locale; scenario.qa = false;
    const html = render(<ChecklistPage progress={{ completedDocuments: [] }} toggleDocument={() => {}} />);
    hasOrder(html, documentStages.map((stage) => `id="document-stage-${stage.id}"`));
    expect((html.match(/ open=""/g) ?? [])).toHaveLength(1);
    expect((html.match(/class="document-card/g) ?? [])).toHaveLength(3);
    expect(html).toContain(translations[locale].checklist.routeTiming);
  });
  it("handles finished, duplicate and resumed document progress without exceeding 100%", () => {
    scenario.locale = locale; scenario.qa = false;
    const ids = documentStages.flatMap((stage) => [...stage.documentIds]);
    const done = render(<ChecklistPage progress={{ completedDocuments: [...ids, "application", "obsolete"] }} toggleDocument={() => {}} />);
    expect(done).toContain("100%");
    expect(done).not.toContain('open=""');
    const resumed = render(<ChecklistPage progress={{ completedDocuments: ids.slice(0, 3) }} toggleDocument={() => {}} />);
    expect(resumed).toContain('id="document-stage-academic" class="document-stage document-stage--academic" open=""');
    expect((resumed.match(/class="document-card/g) ?? [])).toHaveLength(2);
  });
  it("describes six skills and derives activity counts from the actual catalogue", () => {
    const skills = getDefinition("/tests/en").steps.find((step) => step.selector === ".test-skill-tabs");
    expect(skills?.title[locale]).toBe({ es: "Seis habilidades", en: "Six skills", ko: "여섯 가지 기능" }[locale]);
    const path = getDefinition("/study/korean").steps.find((step) => step.selector === ".test-hub");
    expect(path?.text[locale]).toContain(String(TESTS_PER_LANGUAGE));
    expect(path?.text[locale]).toContain(String(TESTS_PER_SKILL));
  });
});
