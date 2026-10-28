import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { getDefinition, type HelpContext } from "@/app/layout/section-help";
import { readSeenTours } from "@/app/layout/SectionTour";
import { readPageHelpContext, isFixedHelpTarget } from "@/app/layout/page-help-context";
import { consumePageTourRequest, requestPageTour, START_PAGE_TOUR_EVENT } from "@/application/controllers/pageHelpEvents";
import { translations } from "@/infrastructure/i18n/translations";
import { HomePage } from "@/features/home/presentation/HomePage";
import { StudyPage } from "@/features/study/presentation/pages/StudyPage";
import { LanguageStudyPage } from "@/features/study/presentation/pages/LanguageStudyPage";
import { InterviewPrepPage } from "@/features/study/presentation/pages/InterviewPrepPage";
import { WrittenSimulatorPage } from "@/features/study/presentation/pages/WrittenSimulatorPage";
import { TestPathPage } from "@/features/study/presentation/pages/TestPathPage";
import { TestSessionPage } from "@/features/study/presentation/pages/TestSessionPage";
import { ChecklistPage } from "@/features/documents/presentation/ChecklistPage";
import { ProfilePage } from "@/features/profile/presentation/ProfilePage";
import { GksPage } from "@/features/scholarship/presentation/GksPage";
import { LearningQuickAccess } from "@/app/layout/LearningQuickAccess";
import { InterviewChatbotLauncher } from "@/features/interview-chatbot/presentation/InterviewChatbotLauncher";
import { createLearningJourney, getLearningRecommendation } from "@/domain/models/learning-journey";
import { analyzeLearningResults } from "@/domain/models/learning-analysis";
import { createInterviewAdaptation } from "@/domain/models/interview-adaptation";
import { emptyWrittenSimulator, type WrittenSimulatorStep } from "@/domain/models/written-simulator";
import { foundationStageMetadata } from "@/infrastructure/data/practice-test-metadata";
import type { TestProgressState } from "@/domain/models/language-test";
import { isImmersiveLearningRoute } from "@/application/i18n/learning-locale";

const scenario = vi.hoisted(() => ({ locale: "es" as "es" | "en" | "ko", qa: false, progress: { en: {}, ko: {} } as TestProgressState, written: "intro" as WrittenSimulatorStep }));
vi.mock("@/application/i18n/I18nContext", () => ({ useI18n: () => ({ locale: scenario.locale, baseLocale: scenario.locale, copy: translations[scenario.locale], setLocale: vi.fn() }) }));
vi.mock("@/application/qa/qa-learning-scope", async (original) => ({ ...await original<typeof import("@/application/qa/qa-learning-scope")>(), get isLearningQa() { return scenario.qa; } }));
vi.mock("@/application/controllers/useLanguageTestProgress", () => ({ useLanguageTestProgress: () => ({ totals: { en: 0, ko: 0 }, progress: scenario.progress, recordAttempt: vi.fn() }) }));
vi.mock("@/application/controllers/useGksRadar", () => ({ useGksRadar: () => ({ checkedAt: "2026-10-27T12:00:00Z", sourceChecks: [], callDetected: false, isLoading: false }) }));
vi.mock("@/application/controllers/useWrittenSimulator", () => ({ useWrittenSimulator: () => ({ state: { ...emptyWrittenSimulator, step: scenario.written, startedAt: scenario.written === "intro" ? null : "2026-10-27T12:00:00Z", completedAt: scenario.written === "result" ? "2026-10-27T12:05:00Z" : null }, secondsLeft: 2600, score: { total: 0, knowledge: 0, writing: 0, review: 0 }, setLanguage: vi.fn(), begin: vi.fn(), goTo: vi.fn(), reset: vi.fn(), answer: vi.fn(), updateDraft: vi.fn(), toggleRubric: vi.fn(), finish: vi.fn() }) }));

const journey = createLearningJourney();
const learning = { journey, recommendation: getLearningRecommendation(journey), analysis: analyzeLearningResults(journey), interviewAdaptation: createInterviewAdaptation(journey), activeMinutes: 0, practicedSkills: 0 };
afterEach(() => { vi.unstubAllGlobals(); scenario.progress = { en: {}, ko: {} }; scenario.written = "intro"; scenario.qa = false; consumePageTourRequest(); });
const pages = ["/", "/study", "/study/english", "/study/korean", "/study/interviews", "/study/written-simulator", "/tests/en", "/tests/ko", "/gks", "/checklist", "/profile"];

function renderPage(path: string) {
  const element = path === "/" ? <HomePage score={0} progress={{ completedTasks: [] }} toggleTask={() => {}} learning={learning} />
    : path === "/study" ? <StudyPage learning={learning} />
    : path === "/study/english" ? <LanguageStudyPage language="en" />
    : path === "/study/korean" ? <LanguageStudyPage language="ko" />
    : path === "/study/interviews" ? <InterviewPrepPage learning={learning} />
    : path === "/study/written-simulator" ? <WrittenSimulatorPage />
    : path === "/gks" ? <GksPage />
    : path === "/checklist" ? <ChecklistPage progress={{ completedDocuments: [] }} toggleDocument={() => {}} />
    : path === "/profile" ? <ProfilePage score={0} learning={learning} />
    : <Routes><Route path="/tests/:language" element={<TestPathPage />} /><Route path="/tests/:language/:stageId" element={<TestSessionPage />} /></Routes>;
  return renderToStaticMarkup(<MemoryRouter initialEntries={[path]}>{element}<LearningQuickAccess learning={learning} />{!isImmersiveLearningRoute(path) && <InterviewChatbotLauncher />}</MemoryRouter>);
}

function expectTargets(html: string, path: string, context: HelpContext = {}) {
  const classes = new Set([...html.matchAll(/class="([^"]*)"/g)].flatMap((match) => match[1].split(/\s+/)));
  for (const item of getDefinition(path, context).steps) {
    if (item.selector === ".bottom-nav") continue; // Global navigation is verified in the browser map.
    for (const match of item.selector.matchAll(/\.([\w-]+)/g)) expect(classes.has(match[1]), `${path}: missing ${item.selector}`).toBe(true);
    for (const locale of ["es", "en", "ko"] as const) {
      expect(item.title[locale].trim().length).toBeGreaterThan(0);
      expect(item.text[locale].trim().length).toBeGreaterThan(20);
    }
  }
}

describe.each(["es", "en", "ko"] as const)("help page map in %s", (locale) => {
  it.each(pages)("maps %s to actual page content", (path) => {
    scenario.locale = locale;
    expectTargets(renderPage(path), path);
  });
  it.each(["en", "ko"] as const)("explains the real production mode for all six %s skills", (language) => {
    scenario.locale = locale;
    for (const stage of foundationStageMetadata[language].filter((item) => item.order === 1)) {
      const path = `/tests/${language}/${stage.id}`;
      const mode = stage.skill === "listening" ? "listening" : stage.skill === "pronunciation" ? "speaking" : "writing";
      const html = renderPage(path);
      expectTargets(html, path, { practice: "production", mode });
      expect(html).toContain(`data-help-mode="${mode}"`);
    }
  });
  it.each(["intro", "knowledge", "personal", "plan", "review", "result"] as const)("maps written %s to its active UI", (written) => {
    scenario.locale = locale; scenario.written = written;
    const html = renderPage("/study/written-simulator");
    expectTargets(html, "/study/written-simulator", { written, timerRunning: written !== "intro" && written !== "result" });
    expect(html).toContain(`data-help-written="${written}"`);
  });
  it.each(["en", "ko"] as const)("uses advanced counts and criteria for %s without replacing them by foundation counts", (language) => {
    scenario.locale = locale;
    for (const stage of foundationStageMetadata[language]) scenario.progress[language][stage.id] = { attempts: 1, bestScore: 100, lastScore: 100, passed: true, lastCompletedAt: "2026-10-27T12:00:00Z" };
    const path = `/study/${language === "en" ? "english" : "korean"}`;
    expectTargets(renderPage(path), path, { phase: "advanced" });
    const help = getDefinition(path, { phase: "advanced" }).steps.find((item) => item.selector === ".test-track-card")!;
    expect(help.text[locale]).toContain("18"); expect(help.text[locale]).not.toContain("132");
    expectTargets(renderPage(`/tests/${language}`), `/tests/${language}`, { phase: "advanced" });
    expect(getDefinition(`/tests/${language}`, { phase: "advanced" }).steps.find((item) => item.selector === ".advanced-path-notice")!.text[locale]).toContain("80");
  });
});

it("changes practice help for questions, timed retakes and results instead of showing production-only targets", () => {
  for (const language of ["en", "ko"]) {
    const path = `/tests/${language}/${language}-reading-01`;
    for (const retake of [false, true]) {
      const questions = getDefinition(path, { practice: "questions", retake });
      expect(questions.steps.map((item) => item.selector)).not.toContain(".production-stage");
      expect(questions.steps.map((item) => item.selector)).not.toContain(".production-checklist");
      expect(questions.steps[0].text.en).toContain(retake ? "keeps running" : "untimed");
    }
    const result = getDefinition(path, { practice: "result" }).steps.map((item) => item.selector);
    expect(result).toContain(".answer-review"); expect(result).toContain(".result-actions"); expect(result).not.toContain(".session-topbar");
  }
});

it("does not advertise hidden interview chat or unavailable QA scholarship content", () => {
  scenario.qa = true;
  expect(getDefinition("/").steps.map((item) => item.selector)).not.toContain(".alert-card");
  for (const path of ["/study/english", "/study/korean", "/tests/en", "/tests/ko/ko-reading-01"]) {
    const selectors = getDefinition(path).steps.map((item) => item.selector);
    expect(selectors).toContain(".learning-quick-trigger"); expect(selectors).not.toContain(".interview-chat-launcher");
  }
});

it("keeps a replay request made before the deferred tour attaches and consumes it only once", () => {
  const dispatchEvent = vi.fn(); vi.stubGlobal("window", { dispatchEvent });
  requestPageTour("ko");
  expect(dispatchEvent.mock.calls[0][0].type).toBe(START_PAGE_TOUR_EVENT);
  expect(consumePageTourRequest()).toBe("ko"); expect(consumePageTourRequest()).toBeNull();
});

it.each(["null", "[]", "1", "true", '"seen"', "{broken"])("recovers invalid tour preferences %s", (stored) => {
  vi.stubGlobal("localStorage", { getItem: () => stored }); expect(readSeenTours()).toEqual({});
});
it("preserves valid seen-tour flags and ignores invalid flag values", () => {
  vi.stubGlobal("localStorage", { getItem: () => '{"home":true,"study":"yes","practice":false}' });
  expect(readSeenTours()).toEqual({ home: true });
});

it("reads explicit practice state without consulting answers or learner drafts", () => {
  const querySelector = vi.fn((selector: string) => ({
    "[data-help-practice]": { dataset: { helpPractice: "questions", helpMode: "listening", helpRetake: "true" } },
    "[data-help-phase]": { dataset: { helpPhase: "advanced" } },
    '[data-help-timed-running="true"]': {},
  } as Record<string, unknown>)[selector] ?? null);
  const context = readPageHelpContext({ querySelector } as unknown as ParentNode);
  expect(context).toMatchObject({ practice: "questions", mode: "listening", phase: "advanced", retake: true, timerRunning: true });
  expect(querySelector.mock.calls.every(([selector]) => !/textarea|input|answer|draft/.test(selector))).toBe(true);
});

it("uses safe defaults for absent or unsupported page state", () => {
  const root = { querySelector: (selector: string) => ["[data-help-practice]", "[data-help-written]", "[data-help-phase]"].includes(selector) ? { dataset: { helpPractice: "unknown", helpWritten: "unknown", helpPhase: "unknown", helpMode: "unknown" } } : null } as unknown as ParentNode;
  expect(readPageHelpContext(root)).toEqual({ practice: "production", mode: "writing", phase: "foundation", written: "intro", retake: false, introOpen: false, timerRunning: false });
});

it("recognises a floating target through its fixed ancestor", () => {
  const fixed = { parentElement: null };
  const target = { parentElement: fixed };
  vi.stubGlobal("getComputedStyle", (element: unknown) => ({ position: element === fixed ? "fixed" : "static" }));
  expect(isFixedHelpTarget(target as unknown as HTMLElement)).toBe(true);
  expect(isFixedHelpTarget({ parentElement: null } as unknown as HTMLElement)).toBe(false);
});

it("explains opened refresher controls separately from path completion in every language", () => {
  for (const path of ["/study/english", "/study/korean"]) {
    const steps = getDefinition(path, { introOpen: true }).steps;
    const progress = steps.find((item) => item.selector === ".learning-restart__toolbar")!;
    expect(steps.some((item) => item.selector === ".learning-restart__exercise")).toBe(true);
    for (const locale of ["es", "en", "ko"] as const) expect(progress.text[locale]).toContain("0/3");
  }
});
