import { describe, expect, it } from "vitest";
import {
  getAttemptQuestions,
  gradeAttempt,
  isStageUnlocked,
  type StageProgress,
} from "../../domain/models/language-test";
import { practiceTestTracks as languageTestTracks } from "./practice-tests";

describe("language test paths", () => {
  it("provides ten tests for each of the three skills in both languages", () => {
    Object.values(languageTestTracks).forEach((track) => {
      expect(track.stages).toHaveLength(30);
      (["writing", "listening", "pronunciation"] as const).forEach((skill) => {
        const stages = track.stages.filter((stage) => stage.skill === skill);
        expect(stages).toHaveLength(10);
        expect(stages.map((stage) => stage.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      });
      expect(track.stages.some((stage) => stage.productionTask.mode === "speaking")).toBe(true);
      expect(track.stages.some((stage) => stage.productionTask.mode === "writing")).toBe(true);
      expect(track.stages.some((stage) => stage.productionTask.mode === "listening")).toBe(true);
      track.stages.forEach((stage) => {
        expect(stage.productionTask.prompt.trim()).not.toBe("");
        expect(stage.productionTask.instructions.trim()).not.toBe("");
        expect(stage.productionTask.checklist).toHaveLength(3);
        if (stage.productionTask.mode === "speaking") {
          expect(stage.productionTask.targetSeconds).toBeGreaterThanOrEqual(30);
        } else if (stage.productionTask.mode === "writing") {
          expect(stage.productionTask.minimumCharacters).toBeGreaterThanOrEqual(40);
        }
      });
    });
  });

  it("models Korean as a TOPIK I to TOPIK II level 3 bridge", () => {
    expect(languageTestTracks.ko.label).toContain("TOPIK I → II");
    expect(languageTestTracks.ko.target).toContain("TOPIK I");
    expect(languageTestTracks.ko.target).toContain("3급");
    expect(languageTestTracks.ko.stages[0].title).toContain("TOPIK I");
    expect(languageTestTracks.ko.stages.at(-1)?.title).toContain("GKS");
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
    expect(isStageUnlocked(stages, 10, progress)).toBe(true);
    expect(isStageUnlocked(stages, 20, progress)).toBe(true);

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
    expect(result.estimate).toContain("3급");
  });
});
