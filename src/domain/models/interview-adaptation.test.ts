import { describe, expect, it } from "vitest";
import { createInterviewAdaptation } from "./interview-adaptation";
import { createLearningJourney, recordLearningEvent } from "./learning-journey";

describe("dynamic interview adaptation", () => {
  it("uses the latest chatbot weakness while language progress controls difficulty", () => {
    let state = createLearningJourney();
    state = recordLearningEvent(state, { kind: "practice", itemId: "en-writing-1", language: "en", skill: "writing", score: 78, passed: true });
    state = recordLearningEvent(state, { kind: "practice", itemId: "ko-listening-1", language: "ko", skill: "listening", score: 48, passed: false });
    state = recordLearningEvent(state, { kind: "practice", itemId: "gks-interview-chatbot", language: "general", skill: "interview", score: 56, passed: false, interviewFocus: "connection" });

    expect(createInterviewAdaptation(state)).toMatchObject({
      focus: "connection",
      language: "ko",
      level: "starting",
      category: "academic",
      questionId: "why-major",
    });
  });

  it("derives the focus from the weakest language skill when no chatbot diagnosis exists", () => {
    let state = createLearningJourney();
    state = recordLearningEvent(state, { kind: "practice", language: "en", skill: "writing", score: 49, passed: false });
    state = recordLearningEvent(state, { kind: "practice", language: "en", skill: "reading", score: 72, passed: true });

    expect(createInterviewAdaptation(state)).toMatchObject({ focus: "evidence", language: "en", level: "developing" });
  });

  it("advances to more demanding questions as language mastery improves", () => {
    let state = createLearningJourney();
    state = recordLearningEvent(state, { kind: "practice", language: "ko", skill: "listening", score: 90, passed: true });
    state = recordLearningEvent(state, { kind: "practice", itemId: "gks-interview-chatbot", language: "ko", skill: "interview", score: 82, passed: true, interviewFocus: "reflection" });

    expect(createInterviewAdaptation(state)).toMatchObject({
      focus: "reflection",
      language: "ko",
      level: "strong",
      category: "contribution",
      questionId: "return-plan",
    });
  });

  it("allows a fresh chatbot report to override an older stored focus", () => {
    let state = createLearningJourney();
    state = recordLearningEvent(state, { kind: "practice", language: "en", skill: "grammar", score: 62, passed: false });
    state = recordLearningEvent(state, { kind: "practice", itemId: "gks-interview-chatbot", language: "en", skill: "interview", score: 60, passed: false, interviewFocus: "reflection" });

    expect(createInterviewAdaptation(state, "direct").focus).toBe("direct");
  });

  it("rotates compatible questions as interview practices accumulate", () => {
    let state = createLearningJourney();
    state = recordLearningEvent(state, { kind: "practice", language: "en", skill: "grammar", score: 62, passed: false });
    const first = createInterviewAdaptation(state, "connection");
    state = recordLearningEvent(state, { kind: "practice", itemId: first.questionId, language: "en", skill: "interview", score: 75, passed: true, interviewFocus: "connection" });
    const second = createInterviewAdaptation(state, "connection");

    expect(second.questionId).not.toBe(first.questionId);
    expect(["why-major", "study-plan"]).toContain(second.questionId);
  });

  it("starts from concrete evidence without exposing an invented language level", () => {
    expect(createInterviewAdaptation(createLearningJourney())).toMatchObject({
      focus: "evidence",
      language: "general",
      level: "starting",
    });
  });
});
