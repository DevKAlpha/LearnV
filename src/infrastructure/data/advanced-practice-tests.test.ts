import { describe, expect, it } from "vitest";
import { gradeAttempt, getAttemptQuestions, listeningReadiness, meetsWritingRequirements, type StageProgress, type TestProgressState } from "../../domain/models/language-test";
import { completedStages, hasCompletedTrack, normalizeTestProgress, saveStageAttempt } from "../../domain/models/language-path";
import { advancedPracticeTracks } from "./advanced-practice-tests";
import { practiceTestTracks } from "./practice-tests";
import { getLanguagePath, getLanguageStage, getNextLanguageStage, isLanguageStageUnlocked } from "./language-paths";
import { advancedStageMetadata, getLanguagePathSummary, getLanguageStageMetadata, isLanguageStageMetadataUnlocked } from "./language-path-summary";

const passed: StageProgress = { attempts: 1, bestScore: 100, lastScore: 100, passed: true, lastCompletedAt: "2026-10-12T12:00:00.000Z" };
const complete = (language: "en" | "ko") => Object.fromEntries(practiceTestTracks[language].stages.map((stage) => [stage.id, { ...passed }]));

describe.each(["en", "ko"] as const)("automatic advanced path: %s", (language) => {
  const foundation = practiceTestTracks[language];
  const advanced = advancedPracticeTracks[language];
  it("requires all known foundation stages, not 132 arbitrary successes or one complete skill", () => {
    const progress = complete(language);
    const last = foundation.stages.at(-1)!;
    delete progress[last.id];
    progress["irrelevant-success"] = passed;
    expect(getLanguagePath(language, progress).phase).toBe("foundation");
    expect(isLanguageStageUnlocked(language, advanced.stages[0].id, progress)).toBe(false);
    progress[last.id] = { ...passed, passed: false };
    expect(getLanguagePath(language, progress).phase).toBe("foundation");
    progress[last.id] = passed;
    const path = getLanguagePath(language, progress);
    expect(path.phase).toBe("advanced");
    expect(path.completed).toBe(0);
    expect(path.track).toBe(advanced);
    expect(completedStages(foundation, progress)).toBe(132);
    const singleSkill = Object.fromEntries(foundation.stages.filter((stage) => stage.skill === "reading").map((stage) => [stage.id, passed]));
    expect(getLanguagePath(language, singleSkill).advancedUnlocked).toBe(false);
  });
  it("keeps lightweight entry metadata exactly aligned with the full lazy catalogue", () => {
    expect(advancedStageMetadata[language]).toEqual(advanced.stages.map(({ id, skill, order, passScore }) => ({ id, skill, order, passScore })));
    for (const progress of [{}, complete(language), { ...complete(language), [advanced.stages[0].id]: passed }]) {
      for (const phase of [undefined, "foundation", "advanced"] as const) {
        const full = getLanguagePath(language, progress, phase);
        const summary = getLanguagePathSummary(language, progress, phase);
        expect(summary).toMatchObject({ phase: full.phase, completed: full.completed, advancedUnlocked: full.advancedUnlocked, complete: full.complete });
      }
      for (const stage of [...foundation.stages, ...advanced.stages]) {
        expect(getLanguageStageMetadata(language, stage.id)).toMatchObject({ id: stage.id, skill: stage.skill, passScore: stage.passScore });
        expect(isLanguageStageMetadataUnlocked(language, stage.id, progress)).toBe(isLanguageStageUnlocked(language, stage.id, progress));
      }
      expect(isLanguageStageMetadataUnlocked(language, "unknown", progress)).toBe(false);
      expect(getLanguageStageMetadata(language, "unknown")).toBeUndefined();
    }
  });
  it("restores the automatic phase from v1 progress and keeps the foundation archive replayable", () => {
    const original: TestProgressState = { en: {}, ko: {}, [language]: complete(language) };
    const restored = normalizeTestProgress(JSON.parse(JSON.stringify(original)));
    expect(restored).toEqual(original);
    expect(getLanguagePath(language, restored[language]).phase).toBe("advanced");
    expect(getLanguagePath(language, restored[language], "foundation").track).toBe(foundation);
    expect(getLanguagePath(language, {}, "advanced").phase).toBe("foundation");
    expect(isLanguageStageUnlocked(language, foundation.stages[0].id, restored[language])).toBe(true);
    expect(getLanguagePath(language === "en" ? "ko" : "en", restored[language === "en" ? "ko" : "en"]).phase).toBe("foundation");
  });
  it("locks direct URLs and sequences each of the six advanced skills independently", () => {
    const progress = complete(language);
    for (const skill of ["reading", "grammar", "vocabulary", "writing", "listening", "pronunciation"] as const) {
      const stages = advanced.stages.filter((stage) => stage.skill === skill);
      expect(stages).toHaveLength(3);
      expect(stages.map((stage) => stage.order)).toEqual([1, 2, 3]);
      expect(isLanguageStageUnlocked(language, stages[0].id, {})).toBe(false);
      expect(isLanguageStageUnlocked(language, stages[0].id, progress)).toBe(true);
      expect(isLanguageStageUnlocked(language, stages[1].id, progress)).toBe(false);
      progress[stages[0].id] = passed;
      expect(isLanguageStageUnlocked(language, stages[1].id, progress)).toBe(true);
      expect(isLanguageStageUnlocked(language, stages[2].id, progress)).toBe(false);
    }
    expect(isLanguageStageUnlocked(language, "unknown", progress)).toBe(false);
    expect(getLanguageStage(language, `${language === "en" ? "ko" : "en"}-c1-reading-01`)).toBeUndefined();
  });
  it("promotes immediately on the last foundation success, regardless of which skill finishes last", () => {
    for (const last of foundation.stages.filter((stage) => stage.order === 22)) {
      const progress = complete(language);
      delete progress[last.id];
      expect(getLanguagePath(language, progress).phase).toBe("foundation");
      const state = saveStageAttempt({ en: {}, ko: {}, [language]: progress }, language, last, 100, true, passed.lastCompletedAt);
      expect(getLanguagePath(language, state[language]).phase).toBe("advanced");
      expect(getNextLanguageStage(language, last.id, state[language])?.id).toBe(advanced.stages[0].id);
      expect(state[language][foundation.stages[0].id]).toEqual(passed);
    }
  });
  it("keeps progress after a failed retake and does not invent endless new stages after completion", () => {
    const state: TestProgressState = { en: {}, ko: {}, [language]: { ...complete(language), ...Object.fromEntries(advanced.stages.map((stage) => [stage.id, passed])) } };
    const last = advanced.stages.at(-1)!;
    const retried = saveStageAttempt(state, language, last, 40, false, "2026-10-12T13:00:00.000Z");
    expect(retried[language][last.id]).toMatchObject({ attempts: 2, bestScore: 100, lastScore: 40, passed: true });
    expect(getLanguagePath(language, retried[language]).complete).toBe(true);
    expect(getNextLanguageStage(language, last.id, retried[language])).toBeUndefined();
    expect(getNextLanguageStage(language, "unknown", retried[language])).toBeUndefined();
    expect(getNextLanguageStage(language, advanced.stages[0].id, complete(language))).toBeUndefined();
  });
  it("has new, bounded, more demanding tasks and valid contextual coaching for every stage", () => {
    const ids = new Set(foundation.stages.flatMap((stage) => [stage.id, ...stage.questions.map((question) => question.id)]));
    const positions = new Set<number>();
    for (const stage of advanced.stages) {
      expect(ids.has(stage.id)).toBe(false);
      ids.add(stage.id);
      expect(stage.passScore).toBe(80);
      expect(stage.passScore).toBeGreaterThan(foundation.stages[0].passScore);
      expect(stage.questions).toHaveLength(5);
      expect(stage.challengeQuestions).toHaveLength(2);
      expect(stage.productionTask.checklist).toHaveLength(3);
      expect(getLanguageStage(language, stage.id)).toBe(stage);
      expect(stage.learningBridge).toBeDefined();
      expect(stage.learningBridge?.previousStageId).toBe(stage.order === 1 ? `${language}-${stage.skill}-22` : `${language}-c1-${stage.skill}-${String(stage.order - 1).padStart(2, "0")}`);
      for (const question of [...stage.questions, ...stage.challengeQuestions]) {
        expect(ids.has(question.id)).toBe(false);
        ids.add(question.id);
        expect(new Set(question.options).size).toBe(4);
        expect(question.correctIndex).toBeGreaterThanOrEqual(0);
        expect(question.correctIndex).toBeLessThan(4);
        expect(question.optionFeedback).toHaveLength(4);
        expect(question.optionFeedback.every((feedback) => feedback.length > (language === "ko" ? 5 : 15))).toBe(true);
        expect(new Set(question.optionFeedback).size).toBe(4);
        for (const key of ["lesson", "example", "transfer", "explanation", "improvement"] as const) expect(question[key].trim().length).toBeGreaterThan(10);
        positions.add(question.correctIndex);
      }
      if (stage.skill === "writing") {
        if (language === "en") expect(stage.productionTask.minimumWords).toBeGreaterThanOrEqual(220);
        else expect(stage.productionTask.minimumCharacters).toBeGreaterThanOrEqual(500);
      }
      if (stage.skill === "pronunciation") expect(stage.productionTask.targetSeconds).toBeGreaterThanOrEqual(90);
      if (stage.skill === "listening") {
        expect(stage.productionTask.listeningScript?.length).toBeGreaterThan(language === "ko" ? 400 : 900);
        expect(stage.questions.slice(0, 4).every((question) => !question.passage && !question.audioText)).toBe(true);
        expect(listeningReadiness(stage.productionTask, true, true, false, true)).toEqual({ canContinue: true, verified: false });
        expect(listeningReadiness(stage.productionTask, true, true, true, false).verified).toBe(true);
      }
    }
    expect(positions.size).toBe(4);
    expect(new Set(advanced.stages.map((stage) => stage.title)).size).toBe(18);
  });
  it("requires 4/5 and production evidence in every first attempt and retake", () => {
    for (const stage of advanced.stages) {
      for (const attempt of [1, 2, 3, 7]) {
        const questions = getAttemptQuestions(stage, attempt);
        expect(questions).toHaveLength(5);
        const correct = Object.fromEntries(questions.map((question) => [question.id, question.correctIndex]));
        expect(gradeAttempt(language, stage, questions, correct, false).passed).toBe(false);
        expect(gradeAttempt(language, stage, questions, correct, true).passed).toBe(true);
        delete correct[questions[0].id];
        expect(gradeAttempt(language, stage, questions, correct, true)).toMatchObject({ score: 80, passed: true });
        delete correct[questions[1].id];
        expect(gradeAttempt(language, stage, questions, correct, true)).toMatchObject({ score: 60, passed: false });
      }
    }
  });
});

describe.each(["en", "ko"] as const)("written advanced production: %s", (language) => {
  it("enforces bounded written production without changing legacy requirements", () => {
    for (const stage of advancedPracticeTracks[language].stages.filter((stage) => stage.productionTask.mode === "writing")) {
      const task = stage.productionTask;
      const min = language === "en" ? task.minimumWords! : task.minimumCharacters!;
      const max = language === "en" ? task.maximumWords! : task.maximumCharacters!;
      const draft = (length: number) => language === "en" ? Array(length).fill("evidence").join(" ") : "가".repeat(length);
      expect(meetsWritingRequirements(language, task, "")).toBe(false);
      expect(meetsWritingRequirements(language, task, draft(min - 1))).toBe(false);
      expect(meetsWritingRequirements(language, task, `  ${draft(min)}  `)).toBe(true);
      expect(meetsWritingRequirements(language, task, draft(max))).toBe(true);
      expect(meetsWritingRequirements(language, task, draft(max + 1))).toBe(false);
    }
    expect(meetsWritingRequirements(language, { mode: "writing", prompt: "", instructions: "", checklist: [], minimumCharacters: 40 }, "가".repeat(1000))).toBe(true);
  });
});

describe("safe completion and persistence boundaries", () => {
  it("rejects malformed success markers without discarding valid neighbouring results", () => {
    const progress = normalizeTestProgress({ en: { valid: passed, string: { ...passed, passed: "true" }, missing: { passed: true }, null: null, badScore: { ...passed, bestScore: 101 }, badAttempts: { ...passed, attempts: -1 } }, ko: [] });
    expect(progress).toEqual({ en: { valid: passed }, ko: {} });
    expect(normalizeTestProgress(null)).toEqual({ en: {}, ko: {} });
    expect(normalizeTestProgress([])).toEqual({ en: {}, ko: {} });
    expect(hasCompletedTrack({ ...practiceTestTracks.en, stages: [] }, {})).toBe(false);
    const flags = Object.fromEntries(practiceTestTracks.en.stages.map((stage) => [stage.id, { ...passed, passed: "true" }])) as unknown as Record<string, StageProgress>;
    expect(getLanguagePath("en", flags).advancedUnlocked).toBe(false);
  });
  it("ignores invalid scores and refuses to turn an under-threshold result into a pass", () => {
    const state: TestProgressState = { en: {}, ko: {} };
    const stage = advancedPracticeTracks.en.stages[0];
    for (const score of [NaN, Infinity, -1, 101]) expect(saveStageAttempt(state, "en", stage, score, true, passed.lastCompletedAt)).toBe(state);
    expect(saveStageAttempt(state, "en", stage, 75, true, passed.lastCompletedAt).en[stage.id].passed).toBe(false);
    expect(saveStageAttempt(state, "en", stage, 100, false, passed.lastCompletedAt).en[stage.id].passed).toBe(false);
    expect(saveStageAttempt(state, "en", stage, 80, true, passed.lastCompletedAt).en[stage.id].passed).toBe(true);
  });
});
