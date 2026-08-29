import { describe, expect, it } from "vitest";
import {
  getAttemptQuestions,
  gradeAttempt,
  isStageUnlocked,
  type StageProgress,
} from "../../domain/models/language-test";
import { practiceTestTracks as languageTestTracks } from "./practice-tests";

describe("language test paths", () => {
  it("provides twenty tests for each of the three skills in both languages", () => {
    Object.values(languageTestTracks).forEach((track) => {
      expect(track.stages).toHaveLength(60);
      (["writing", "listening", "pronunciation"] as const).forEach((skill) => {
        const stages = track.stages.filter((stage) => stage.skill === skill);
        expect(stages).toHaveLength(20);
        expect(stages.map((stage) => stage.order)).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
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
          if (track.language === "en") {
            expect(stage.productionTask.minimumWords).toBeGreaterThanOrEqual(100);
            expect(stage.productionTask.maximumWords).toBeGreaterThan(stage.productionTask.minimumWords ?? 0);
          }
        }
        expect(stage.productionTask.retakeInstruction?.trim()).not.toBe("");
      });
    });
  });

  it("keeps all 120 activities and 40 listening resources distinct", () => {
    const tracks = Object.values(languageTestTracks);
    const stages = tracks.flatMap((track) => track.stages);
    const listeningMedia = stages.flatMap((stage) => stage.media ? [stage.media] : []);

    expect(stages).toHaveLength(120);
    expect(new Set(stages.map((stage) => stage.id)).size).toBe(120);
    expect(listeningMedia).toHaveLength(40);
    expect(new Set(listeningMedia.map((media) => media.videoId)).size).toBe(40);

    tracks.forEach((track) => {
      (["writing", "listening", "pronunciation"] as const).forEach((skill) => {
        const skillStages = track.stages.filter((stage) => stage.skill === skill);
        expect(new Set(skillStages.map((stage) => stage.title)).size).toBe(20);
        expect(new Set(skillStages.map((stage) => stage.description)).size).toBe(20);
        expect(new Set(skillStages.map((stage) => stage.productionTask.prompt)).size).toBe(20);
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

  it("uses a verified YouTube story or song in every listening stage", () => {
    Object.values(languageTestTracks).forEach((track) => {
      const listening = track.stages.filter((stage) => stage.skill === "listening");
      expect(listening.filter((stage) => stage.media?.kind === "story")).toHaveLength(10);
      expect(listening.filter((stage) => stage.media?.kind === "song")).toHaveLength(10);
      listening.forEach((stage) => {
        expect(stage.media?.provider).toBe("youtube");
        expect(stage.media?.videoId).toMatch(/^[\w-]{11}$/);
        expect(stage.media?.sourceUrl).toContain(stage.media?.videoId);
        expect(stage.media?.variety.trim()).not.toBe("");
        expect(stage.media?.endSeconds).toBeGreaterThan(stage.media?.startSeconds ?? -1);
        expect(stage.media?.excerptMinutes).toBeLessThanOrEqual(5);
        expect(stage.questions.every((question) => !question.audioText)).toBe(true);
      });
    });
  });

  it("varies correct answer positions instead of teaching a fixed pattern", () => {
    Object.values(languageTestTracks).forEach((track) => {
      const positions = new Set(track.stages.flatMap((stage) => stage.questions.map((question) => question.correctIndex)));
      expect(positions.size).toBeGreaterThanOrEqual(3);
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
    expect(isStageUnlocked(stages, 20, progress)).toBe(true);
    expect(isStageUnlocked(stages, 40, progress)).toBe(true);

    progress[stages[0].id] = {
      attempts: 1,
      bestScore: 75,
      lastScore: 75,
      passed: true,
      lastCompletedAt: "2026-08-18T00:00:00.000Z",
    };
    expect(isStageUnlocked(stages, 1, progress)).toBe(true);
  });

  it("requires productive evidence before a perfect quiz can unlock the next stage", () => {
    const stage = languageTestTracks.ko.stages[0];
    const answers = Object.fromEntries(stage.questions.map((question) => [question.id, question.correctIndex]));
    const incomplete = gradeAttempt("ko", stage, stage.questions, answers, false);
    const verified = gradeAttempt("ko", stage, stage.questions, answers, true);
    expect(incomplete.score).toBe(100);
    expect(incomplete.correctCount).toBe(4);
    expect(incomplete.passed).toBe(false);
    expect(incomplete.productionVerified).toBe(false);
    expect(verified.passed).toBe(true);
  });
});
