import { describe, expect, it } from "vitest";
import {
  getAttemptQuestions,
  gradeAttempt,
  isStageUnlocked,
  type StageProgress,
} from "../../domain/models/language-test";
import { languageTestTracks } from "./language-tests";

describe("language test paths", () => {
  it("provides five sequential tests for English and Korean", () => {
    Object.values(languageTestTracks).forEach((track) => {
      expect(track.stages).toHaveLength(5);
      expect(track.stages.map((stage) => stage.order)).toEqual([1, 2, 3, 4, 5]);
    });
  });

  it("uses valid original question sets and harder retake questions", () => {
    Object.values(languageTestTracks).forEach((track) => {
      const ids = new Set<string>();
      track.stages.forEach((stage) => {
        expect(stage.questions).toHaveLength(4);
        expect(stage.challengeQuestions).toHaveLength(2);
        const retake = getAttemptQuestions(stage, 2);
        expect(retake).toHaveLength(5);
        expect(retake.some((question) => stage.challengeQuestions.includes(question))).toBe(true);

        [...stage.questions, ...stage.challengeQuestions].forEach((question) => {
          expect(ids.has(question.id)).toBe(false);
          ids.add(question.id);
          expect(question.options).toHaveLength(4);
          expect(question.correctIndex).toBeGreaterThanOrEqual(0);
          expect(question.correctIndex).toBeLessThan(question.options.length);
          expect(question.explanation.trim()).not.toBe("");
          expect(question.improvement.trim()).not.toBe("");
        });
      });
    });
  });

  it("unlocks stages only after the previous one is passed", () => {
    const stages = languageTestTracks.en.stages;
    const progress: Record<string, StageProgress> = {};
    expect(isStageUnlocked(stages, 0, progress)).toBe(true);
    expect(isStageUnlocked(stages, 1, progress)).toBe(false);

    progress[stages[0].id] = {
      attempts: 1,
      bestScore: 75,
      lastScore: 75,
      passed: true,
      lastCompletedAt: "2026-08-18T00:00:00.000Z",
    };
    expect(isStageUnlocked(stages, 1, progress)).toBe(true);
  });

  it("grades answers and labels the result as an estimate", () => {
    const stage = languageTestTracks.ko.stages[0];
    const answers = Object.fromEntries(stage.questions.map((question) => [question.id, question.correctIndex]));
    const result = gradeAttempt("ko", stage, stage.questions, answers);
    expect(result.score).toBe(100);
    expect(result.correctCount).toBe(4);
    expect(result.passed).toBe(true);
    expect(result.estimate).toContain("5급");
  });
});
