import { describe, expect, it } from "vitest";
import { isQaLearningRoute, resolveQaLearningRoute } from "./qa-learning-scope";

describe("QA learning scope", () => {
  it.each([
    "/",
    "/study",
    "/study/english",
    "/study/korean",
    "/study/interviews",
    "/study/written-simulator",
    "/tests/en",
    "/tests/ko",
    "/tests/en/reading-01",
    "/tests/ko/listening-01/",
  ])("keeps the learning route %s available", (route) => {
    expect(isQaLearningRoute(route)).toBe(true);
  });

  it.each(["/gks", "/checklist", "/profile", "/unknown"])("blocks %s from the QA branch", (route) => {
    expect(isQaLearningRoute(route)).toBe(false);
    expect(resolveQaLearningRoute(route)).toBe("/study");
  });
});
