import { describe, expect, it } from "vitest";
import { gradeAttempt, getAttemptQuestions, isStageUnlocked, listeningReadiness, writingLengthFromPrompt, type StageProgress } from "../../domain/models/language-test";
import { practiceTestTracks, TESTS_PER_LANGUAGE, TESTS_PER_SKILL } from "./practice-tests";
import { connectPracticeStages } from "./spiral-practice";
import { translations } from "../i18n/translations";

const tracks = Object.values(practiceTestTracks);
const passed: StageProgress = { attempts: 1, bestScore: 100, lastScore: 100, passed: true, lastCompletedAt: "2026-10-06T12:00:00Z" };

describe("bounded spiral learning", () => {
  it("adds 24 original exercises without removing any existing stage identifier", () => {
    expect(TESTS_PER_LANGUAGE).toBe(132);
    expect(TESTS_PER_SKILL).toBe(22);
    const oldIds = new Set(tracks.flatMap((track) => ["reading", "grammar", "vocabulary", "writing", "listening", "pronunciation"].flatMap((skill) => Array.from({ length: 20 }, (_, i) => `${track.language}-${skill}-${String(i + 1).padStart(2, "0")}`))));
    const all = tracks.flatMap((track) => track.stages);
    expect(all.filter((stage) => oldIds.has(stage.id))).toHaveLength(240);
    expect(all.filter((stage) => !oldIds.has(stage.id))).toHaveLength(24);
  });

  it("only carries one immediate same-skill prerequisite, keeping session size constant", () => {
    for (const track of tracks) {
      for (const stage of track.stages) {
        if (stage.order === 1) { expect(stage.learningBridge).toBeUndefined(); continue; }
        const previous = track.stages.find((candidate) => candidate.id === stage.learningBridge?.previousStageId)!;
        expect(previous.skill).toBe(stage.skill);
        expect(previous.order).toBe(stage.order - 1);
        expect(stage.learningBridge?.recall).toBe(previous.skill === "listening" && previous.order <= 20 ? previous.productionTask.checklist[1] : previous.focus);
        expect(stage.questions).toHaveLength(4);
        expect(stage.productionTask.checklist).toHaveLength(3);
        expect(stage.productionTask.checklist[2]).toBe(stage.learningBridge?.application);
        expect(stage.questions.filter((question) => question.id.endsWith("-recall"))).toHaveLength(1);
        const retrieval = stage.questions.at(-1)!;
        expect(retrieval.transfer).toBe(stage.learningBridge?.application);
        const source = previous.questions.find((question) => question.options[question.correctIndex] === retrieval.options[retrieval.correctIndex])!;
        expect(source).toBeDefined();
        expect(retrieval.optionFeedback[retrieval.correctIndex]).toBe(source.optionFeedback[source.correctIndex]);
      }
    }
  });

  it("does not carry unrelated skill content when joining separate paths", () => {
    const reading = practiceTestTracks.en.stages.find((stage) => stage.id === "en-reading-01")!;
    const grammar = practiceTestTracks.en.stages.find((stage) => stage.id === "en-grammar-01")!;
    expect(connectPracticeStages("en", [reading, grammar])[1].learningBridge).toBeUndefined();
  });

  it("unlocks new practice from old saved progress without resetting anything", () => {
    for (const track of tracks) {
      for (const stage of track.stages.filter((candidate) => candidate.order === 21)) {
        const index = track.stages.indexOf(stage);
        const oldId = `${track.language}-${stage.skill}-20`;
        const progress = { [oldId]: passed };
        expect(isStageUnlocked(track.stages, index, progress)).toBe(true);
        expect(isStageUnlocked(track.stages, index + 1, progress)).toBe(false);
        expect(progress).toEqual({ [oldId]: passed });
        progress[stage.id] = passed;
        expect(isStageUnlocked(track.stages, index + 1, progress)).toBe(true);
      }
    }
  });

  it("keeps feedback aligned with rotated answers and assigns new question IDs to recall", () => {
    const ids = new Set<string>();
    for (const track of tracks) {
      for (const stage of track.stages) {
        for (const question of [...stage.questions, ...stage.challengeQuestions]) {
          expect(ids.has(question.id)).toBe(false);
          ids.add(question.id);
          expect(new Set(question.options).size).toBe(4);
          if (stage.order > 20 && !question.id.endsWith("-recall")) {
            expect(question.optionFeedback[question.correctIndex]).toBe(question.explanation);
            expect(new Set(question.optionFeedback).size).toBe(4);
          }
        }
      }
    }
  });

  it("can complete every new exercise and its retakes without changing grading thresholds", () => {
    for (const track of tracks) {
      for (const stage of track.stages.filter((candidate) => candidate.order > 20)) {
        for (let attempt = 1; attempt <= 4; attempt++) {
          const questions = getAttemptQuestions(stage, attempt);
          const answers = Object.fromEntries(questions.map((question) => [question.id, question.correctIndex]));
          expect(gradeAttempt(track.language, stage, questions, answers, true).passed).toBe(true);
          expect(gradeAttempt(track.language, stage, questions, answers, false).passed).toBe(false);
        }
        expect(stage.estimatedMinutes).toBeLessThanOrEqual(10);
        expect(stage.productionTask.context || stage.productionTask.listeningScript || stage.questions[0].passage).toBeTruthy();
        expect(stage.challengeQuestions.every((challenge) => !stage.questions.some((question) => question.prompt === challenge.prompt))).toBe(true);
        expect(stage.challengeQuestions[0].example).not.toBe(stage.challengeQuestions[0].options[stage.challengeQuestions[0].correctIndex]);
      }
    }
  });

  it("aligns all existing writing limits with the quantity requested in the prompt", () => {
    for (const track of tracks) {
      for (const stage of track.stages.filter((candidate) => candidate.skill === "writing" && candidate.order <= 20)) {
        const length = writingLengthFromPrompt(stage.productionTask.prompt)!;
        if (!length) {
          expect(track.language).toBe("ko");
          expect(stage.productionTask.minimumCharacters).toBe(80);
          continue;
        }
        if (track.language === "en") {
          expect(stage.productionTask.minimumWords).toBe(length.minimum);
          expect(stage.productionTask.maximumWords).toBe(length.maximum);
        } else expect(stage.productionTask.minimumCharacters).toBe(length.minimum);
      }
    }
  });

  it("parses exact targets, ranges and hyphenated word limits rather than unrelated numbers", () => {
    expect(writingLengthFromPrompt("In 35 minutes, write 250 words.")).toEqual({ minimum: 250, maximum: 275 });
    expect(writingLengthFromPrompt("Write a 180-word abstract.")).toEqual({ minimum: 180, maximum: 198 });
    expect(writingLengthFromPrompt("100~120자로 쓰세요.")).toEqual({ minimum: 100, maximum: 120 });
    expect(writingLengthFromPrompt("Write 180–200 words.")).toEqual({ minimum: 180, maximum: 200 });
    expect(writingLengthFromPrompt("Write a paragraph.")).toBeUndefined();
  });

  it("updates the exercise counts in all three UI languages", () => {
    for (const copy of Object.values(translations)) {
      const label = copy.tests.thirtyTests.replace("{total}", String(TESTS_PER_LANGUAGE)).replace("{perSkill}", String(TESTS_PER_SKILL));
      expect(label).toContain("132");
      expect(label).toContain("22");
      expect(label).not.toContain("{");
    }
  });
});

describe("original listening evidence", () => {
  const task = practiceTestTracks.en.stages.find((stage) => stage.id === "en-listening-21")!.productionTask;
  it("allows transcript practice but never calls it verified listening", () => {
    expect(listeningReadiness(task, true, true, false, true)).toEqual({ canContinue: true, verified: false });
    expect(listeningReadiness(task, true, true, false, false)).toEqual({ canContinue: false, verified: false });
  });
  it("requires completed audio, the self-check and a reviewed excerpt", () => {
    expect(listeningReadiness(task, true, true, true, false)).toEqual({ canContinue: true, verified: true });
    expect(listeningReadiness(task, false, true, true, true).verified).toBe(false);
    expect(listeningReadiness(task, true, false, true, true).canContinue).toBe(false);
  });
  it("preserves the existing external media verification workflow", () => {
    const external = practiceTestTracks.en.stages.find((stage) => stage.id === "en-listening-01")!.productionTask;
    expect(listeningReadiness(external, true, true, false, false)).toEqual({ canContinue: true, verified: true });
    expect(listeningReadiness(external, false, true, false, true).canContinue).toBe(false);
  });
  it("provides distinct short authored scripts in both languages with no guessed media URLs", () => {
    const scripts = tracks.flatMap((track) => track.stages.filter((stage) => stage.productionTask.listeningScript));
    expect(scripts).toHaveLength(4);
    expect(new Set(scripts.map((stage) => stage.productionTask.listeningScript)).size).toBe(4);
    scripts.forEach((stage) => {
      expect(stage.media).toBeUndefined();
      expect(stage.productionTask.listeningScript!.length).toBeLessThan(700);
      expect(stage.questions[0].passage).toBe(stage.productionTask.listeningScript);
    });
  });
});
