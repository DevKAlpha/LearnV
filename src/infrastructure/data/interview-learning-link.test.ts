import { describe, expect, it } from "vitest";
import { getInterviewStudyRoute } from "@/domain/models/interview-learning-link";
import type { InterviewSignal } from "@/domain/models/interview-chatbot";
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

  it("explains every linked focus in all supported languages", () => {
    for (const locale of ["es", "en", "ko"] as const) {
      for (const signal of SIGNALS) {
        expect(interviewLearningLinkCopy[locale].focusNames[signal].length).toBeGreaterThan(3);
        expect(interviewLearningLinkCopy[locale].materialNames[signal].length).toBeGreaterThan(10);
        expect(interviewLearningLinkCopy[locale].guidance[signal].length).toBeGreaterThan(25);
      }
    }
  });
});
