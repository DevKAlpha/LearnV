import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { translations } from "@/infrastructure/i18n/translations";
import type { LearningJourneyController } from "@/application/controllers/useLearningJourney";
import { HomePage } from "@/features/home/presentation/HomePage";
import { StudyPage } from "@/features/study/presentation/pages/StudyPage";
import { ChecklistPage } from "@/features/documents/presentation/ChecklistPage";
import { GksPage } from "@/features/scholarship/presentation/GksPage";
import { ProfilePage } from "@/features/profile/presentation/ProfilePage";
import { storybookCopy } from "@/infrastructure/i18n/storybook-copy";
import { getDefinition } from "@/app/layout/SectionTour";
import { documentStages } from "@/domain/models/document-plan";
import { TESTS_PER_LANGUAGE, TESTS_PER_SKILL } from "@/infrastructure/data/practice-tests";
import { LearningJourneyPanel } from "@/shared/ui/LearningJourneyPanel";
import { DailyPlanCard } from "@/features/home/presentation/DailyPlanCard";
import { createLearningJourney } from "@/domain/models/learning-journey";

const scenario = vi.hoisted(() => ({ qa: false, locale: "es" as "es" | "en" | "ko" }));
vi.mock("@/application/i18n/I18nContext", () => ({
  useI18n: () => ({ locale: scenario.locale, copy: translations[scenario.locale] }),
}));
vi.mock("@/application/qa/qa-learning-scope", async (original) => {
  const actual = await original<typeof import("@/application/qa/qa-learning-scope")>();
  return { ...actual, get isLearningQa() { return scenario.qa; }, resolveAppRoute: (path: string) => actual.resolveAppRoute(path, scenario.qa) };
});
vi.mock("@/application/controllers/useLanguageTestProgress", () => ({ useLanguageTestProgress: () => ({ totals: { en: 0, ko: 0 }, progress: { en: {}, ko: {} } }) }));
vi.mock("@/application/controllers/useGksRadar", () => ({ useGksRadar: () => ({ checkedAt: "2026-10-07T12:00:00Z", sourceChecks: [], callDetected: false, isLoading: false }) }));

const learning = {
  journey: { ...createLearningJourney(), sessionCount: 1 },
  recommendation: { id: "documents", route: "/checklist" }, activeMinutes: 0, practicedSkills: 0, shieldUsedThisWeek: false,
  analysis: { totalAttempts: 0 },
} as unknown as LearningJourneyController;
const render = (element: React.ReactNode) => renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>);
const hasOrder = (html: string, markers: string[]) => {
  const positions = markers.map((marker) => html.indexOf(marker));
  expect(positions.every((position) => position >= 0)).toBe(true);
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
};

describe.each(["es", "en", "ko"] as const)("progressive first visit in %s", (locale) => {
  it("renders illustrated panels, working language volumes and distinct section scenes", () => {
    scenario.locale = locale; scenario.qa = false;
    const home = render(<HomePage score={37} progress={{ completedTasks: [] }} toggleTask={() => {}} learning={learning} />);
    expect(home).toContain(storybookCopy[locale].shelf);
    hasOrder(home, ["hero-copy", "story-panels", "story-cover__footer", "home-today", "story-shelf"]);
    for (const language of ["english", "korean"]) expect(home).toContain(`href="/study/${language}"`);
    const study = render(<StudyPage learning={learning} />);
    for (const scene of ["reader", "london", "seoul", "desk", "journey", "garden"]) expect(study).toContain(`illustrations/storybook/${scene}.svg`);
    expect(study).toContain('class="study-volume-art"');
    expect(study).not.toContain('class="study-character');
    expect(render(<GksPage />)).toContain('illustrations/storybook/journey.svg');
    expect(render(<ChecklistPage progress={{ completedDocuments: [] }} toggleDocument={() => {}} />)).toContain('illustrations/storybook/desk.svg');
    const profile = render(<ProfilePage score={37} learning={learning} />);
    expect(profile).toContain('illustrations/storybook/garden.svg');
    expect(profile).toContain('class="profile-avatar"');
  });
  it("keeps the home action ahead of support, scholarship status and objectives", () => {
    scenario.locale = locale; scenario.qa = false;
    const html = render(<HomePage score={0} progress={{ completedTasks: [] }} toggleTask={() => {}} learning={learning} />);
    hasOrder(html, ["hero-grid", "home-today", "learning-journey", "alert-card", "objectives-drawer", "quote-card"]);
    // The generated plan loads lazily inside its section, after the hero.
    expect(html).toContain('id="today-title"');
    const plan = render(<DailyPlanCard ticked={[]} toggle={() => {}} streak={0} shieldUsed={false} onStatus={() => {}} />);
    expect(plan).toContain('class="task-card__body"');
    expect(plan).toContain('aria-pressed="false"');
    expect(plan).not.toContain("home-plan-drawer");
  });
  it("preserves all-complete and resumed home plans", () => {
    scenario.locale = locale; scenario.qa = false;
    // Only the GKS step is ticked by hand; review and stage wait for real practice.
    const ticked = render(<DailyPlanCard ticked={["gks-language-exam"]} toggle={() => {}} streak={2} shieldUsed={false} onStatus={() => {}} />);
    expect(ticked).toContain('aria-pressed="true"');
    expect(ticked).not.toContain("home-plan-complete");
    expect(ticked).toMatch(/task-card--priority" data-plan-item="review"/);
    expect(ticked).toContain('href="/study/review"');
  });
  it("orders study from starter actions to languages and advanced practice; no hidden heavy content is mounted", () => {
    scenario.locale = locale; scenario.qa = false;
    const html = render(<StudyPage learning={learning} />);
    hasOrder(html, ["study-start-card", "study-language-spaces", "study-support-drawer", "study-practice-labs"]);
    expect(html).not.toContain('class="study-next-step"');
    expect(html).not.toContain('class="learning-journey');
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
  it("keeps the complete illustrated learning summary in profile with the same data and recommendation", () => {
    scenario.locale = locale; scenario.qa = false;
    const profile = render(<ProfilePage score={37} learning={learning} />);
    const panel = render(<LearningJourneyPanel learning={learning} illustrated />);
    expect(profile).toContain(panel);
    expect(panel).toContain(translations[locale].journey.practicedSkills);
    expect(panel).toContain(translations[locale].journey.privacy);
    expect((profile.match(/class="learning-journey /g) ?? []).length).toBe(1);
    expect((panel.match(/class="journey-stat-art"/g) ?? []).length).toBe(5);
    expect(panel).toContain('class="journey-cover-art"');
    expect(panel).toContain('href="/checklist"');
    expect(profile).not.toMatch(/learning-quick|role="dialog"/);
    for (const path of ["/", "/study", "/profile", "/gks", "/checklist", "/tests/en", "/tests/ko"]) expect(getDefinition(path).steps.map((item) => item.selector)).not.toContain(".learning-quick-trigger");
    const together = render(<><LearningJourneyPanel learning={learning} compact /><LearningJourneyPanel learning={learning} compact headingId="floating-learning-title" /></>);
    const ids = [...together.matchAll(/ id="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
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
    expect((html.match(/class="document-card/g) ?? [])).toHaveLength(4);
    expect(html).toContain(translations[locale].checklist.routeTiming);
  });
  it("handles finished, duplicate and resumed document progress without exceeding 100%", () => {
    scenario.locale = locale; scenario.qa = false;
    const ids = documentStages.flatMap((stage) => [...stage.documentIds]);
    const done = render(<ChecklistPage progress={{ completedDocuments: [...ids, "application", "obsolete"] }} toggleDocument={() => {}} />);
    expect(done).toContain("100%");
    expect(done).not.toContain('open=""');
    const resumed = render(<ChecklistPage progress={{ completedDocuments: ids.slice(0, 4) }} toggleDocument={() => {}} />);
    expect(resumed).toContain('id="document-stage-academic" class="document-stage document-stage--academic" open=""');
    expect((resumed.match(/class="document-card/g) ?? [])).toHaveLength(3);
  });
  it("describes six skills and derives activity counts from the actual catalogue", () => {
    const skills = getDefinition("/tests/en").steps.find((step) => step.selector === ".test-skill-tabs");
    expect(skills?.title[locale]).toBe({ es: "Seis habilidades", en: "Six skills", ko: "여섯 가지 기능" }[locale]);
    const path = getDefinition("/study/korean").steps.find((step) => step.selector === ".test-track-card");
    expect(path?.text[locale]).toContain(String(TESTS_PER_LANGUAGE));
    expect(path?.text[locale]).toContain(String(TESTS_PER_SKILL));
  });
});
