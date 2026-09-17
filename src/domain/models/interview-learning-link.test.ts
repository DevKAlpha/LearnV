import { describe, expect, it } from "vitest";
import {
  createInterviewStudyPath,
  getInterviewStudyRoute,
  parseInterviewStudyFocus,
} from "./interview-learning-link";

describe("interview learning link", () => {
  it("maps each chatbot weakness to a concrete study question", () => {
    expect(getInterviewStudyRoute("direct")).toMatchObject({ category: "motivation", questionId: "introduce-yourself" });
    expect(getInterviewStudyRoute("evidence")).toMatchObject({ category: "adaptation", questionId: "pressure" });
    expect(getInterviewStudyRoute("connection")).toMatchObject({ category: "academic", questionId: "why-major" });
    expect(getInterviewStudyRoute("reflection")).toMatchObject({ category: "academic", questionId: "academic-weakness" });
  });

  it("only accepts supported focus values from a URL", () => {
    expect(parseInterviewStudyFocus("evidence")).toBe("evidence");
    expect(parseInterviewStudyFocus("unknown")).toBeNull();
    expect(parseInterviewStudyFocus(null)).toBeNull();
  });

  it("creates a deep link to the linked learning material", () => {
    expect(createInterviewStudyPath("connection")).toBe("/study/interviews?focus=connection#interview-learning-bridge");
  });
});
