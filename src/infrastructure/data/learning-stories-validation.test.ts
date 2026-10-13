import { describe, expect, it } from "vitest";
import { getAttemptQuestions, gradeAttempt, type TestProgressState } from "../../domain/models/language-test";
import { mergeTestProgress, normalizeTestProgress, saveStageAttempt } from "../../domain/models/language-path";
import { practiceTestTracks } from "./practice-tests";
import { advancedPracticeTracks } from "./advanced-practice-tests";
import { getLanguagePath, getNextLanguageStage, isLanguageStageUnlocked } from "./language-paths";
import { getLanguageStageMetadata } from "./language-path-summary";

describe.each(["en", "ko"] as const)("stories 51–54: full curriculum regression %s", (language) => {
  it("validates every first attempt and retake across all 150 activities", () => {
    const stages = [...practiceTestTracks[language].stages, ...advancedPracticeTracks[language].stages];
    expect(stages).toHaveLength(150);
    for (const stage of stages) {
      const original = JSON.stringify(stage);
      for (const attempt of [1, 2, 3, 7]) {
        const questions = getAttemptQuestions(stage, attempt);
        expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length);
        const answers = Object.fromEntries(questions.map((question) => [question.id, question.correctIndex]));
        expect(gradeAttempt(language, stage, questions, answers, true)).toMatchObject({ score: 100, passed: true });
        expect(gradeAttempt(language, stage, questions, answers, false)).toMatchObject({ score: 100, passed: false });
        expect(gradeAttempt(language, stage, questions, {}, true)).toMatchObject({ score: 0, passed: false });
        for (const question of questions) {
          expect(question.options[question.correctIndex]).toBeTruthy();
          expect(question.optionFeedback).toHaveLength(question.options.length);
          expect(question.optionFeedback.every((feedback) => feedback.trim().length > 0)).toBe(true);
          expect(question.lesson).toBeTruthy(); expect(question.example).toBeTruthy(); expect(question.transfer).toBeTruthy();
        }
      }
      expect(JSON.stringify(stage)).toBe(original);
    }
  });
  it("completes the full foundation in reverse skill order, promotes once and restores every result", () => {
    let progress: TestProgressState = { en: {}, ko: {} };
    const groups = ["pronunciation", "listening", "writing", "vocabulary", "grammar", "reading"] as const;
    const sequence = groups.flatMap((skill) => practiceTestTracks[language].stages.filter((stage) => stage.skill === skill));
    for (const [index, stage] of sequence.entries()) {
      expect(isLanguageStageUnlocked(language, stage.id, progress[language])).toBe(true);
      const questions = getAttemptQuestions(stage, 1);
      const answers = Object.fromEntries(questions.map((question) => [question.id, question.correctIndex]));
      const result = gradeAttempt(language, stage, questions, answers, true);
      progress = saveStageAttempt(progress, language, stage, result.score, result.passed, "2026-10-13T12:00:00.000Z");
      expect(getLanguagePath(language, progress[language]).phase).toBe(index === 131 ? "advanced" : "foundation");
    }
    const next = getNextLanguageStage(language, sequence.at(-1)!.id, progress[language]);
    expect(next?.id).toBe(`${language}-c1-reading-01`);
    for (const stage of advancedPracticeTracks[language].stages) {
      expect(isLanguageStageUnlocked(language, stage.id, progress[language])).toBe(true);
      progress = saveStageAttempt(progress, language, stage, 80, true, "2026-10-13T12:30:00.000Z");
    }
    const restored = normalizeTestProgress(JSON.parse(JSON.stringify(progress)), (lang, id) => getLanguageStageMetadata(lang, id)?.passScore);
    expect(restored).toEqual(progress);
    expect(getLanguagePath(language, restored[language])).toMatchObject({ phase: "advanced", complete: true, completed: 18 });
    expect(getLanguagePath(language, restored[language], "foundation")).toMatchObject({ completed: 132, complete: true });
    expect(getLanguagePath(language === "en" ? "ko" : "en", restored[language === "en" ? "ko" : "en"]).phase).toBe("foundation");
  });
});

describe("progress preservation across views", () => {
  const old = { attempts: 1, bestScore: 100, lastScore: 100, passed: true, lastCompletedAt: "2026-10-13T12:00:00.000Z" };
  it("keeps independently completed languages from a stale tab", () => {
    const current: TestProgressState = { en: { first: old }, ko: {} };
    const stored: TestProgressState = { en: {}, ko: { another: old } };
    const combined = mergeTestProgress(current, stored);
    expect(combined).toEqual({ en: { first: old }, ko: { another: old } });
    expect(current.ko).toEqual({}); expect(stored.en).toEqual({});
  });
  it("retains passed status and best score while taking the latest failed retake", () => {
    const current: TestProgressState = { en: { first: old }, ko: {} };
    const newer = { ...old, attempts: 2, bestScore: 40, lastScore: 40, passed: false, lastCompletedAt: "2026-10-13T13:00:00.000Z" };
    const merged = mergeTestProgress(current, { en: { first: newer }, ko: {} });
    expect(merged.en.first).toEqual({ ...newer, bestScore: 100, passed: true });
    const next = saveStageAttempt(merged, "en", { id: "first", passScore: 80 }, 80, true, "2026-10-13T14:00:00.000Z");
    expect(next.en.first).toMatchObject({ attempts: 3, bestScore: 100, lastScore: 80, passed: true });
    expect(mergeTestProgress(merged, current).en.first).toEqual(merged.en.first);
  });
});
