import { describe, expect, it } from "vitest";
import { createInterviewAdaptation } from "@/domain/models/interview-adaptation";
import { getInterviewStudyRoute } from "@/domain/models/interview-learning-link";
import type { InterviewSignal } from "@/domain/models/interview-chatbot";
import { createLearningJourney, recordLearningEvent } from "@/domain/models/learning-journey";
import { interviewLearningLinkCopy } from "./interview-learning-link";
import { interviewQuestions } from "./interview-prep";

const SIGNALS: InterviewSignal[] = ["direct", "evidence", "connection", "reflection"];

describe("interview learning material link", () => {
  it("keeps every chatbot focus linked to a real question in the expected category", () => {
    for (const signal of SIGNALS) {
      const route = getInterviewStudyRoute(signal);
      const question = interviewQuestions.find((item) => item.id === route.questionId);
      expect(question, `${signal} must reference an existing interview question`).toBeDefined();
      expect(question?.category).toBe(route.category);
    }
  });

  it("provides the bidirectional learning actions in every supported language", () => {
    for (const locale of ["es", "en", "ko"] as const) {
      expect(interviewLearningLinkCopy[locale].review.length).toBeGreaterThan(5);
      expect(interviewLearningLinkCopy[locale].practise.length).toBeGreaterThan(5);
      expect(interviewLearningLinkCopy[locale].chatbotMaterialAction.length).toBeGreaterThan(5);
    }
  });

  it("keeps every dynamic level linked to a real interview question", () => {
    for (const score of [40, 60, 75, 90]) {
      let state = createLearningJourney();
      state = recordLearningEvent(state, { kind: "practice", language: "en", skill: "writing", score, passed: score >= 70 });
      for (const signal of SIGNALS) {
        const adaptation = createInterviewAdaptation(state, signal);
        const question = interviewQuestions.find((item) => item.id === adaptation.questionId);
        expect(question, `${signal} at ${score} must reference an existing question`).toBeDefined();
        expect(question?.category).toBe(adaptation.category);
      }
    }
  });
});
