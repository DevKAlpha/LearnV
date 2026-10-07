import { describe, expect, it } from "vitest";
import { isQaLearningRoute, resolveQaLearningRoute, isAppRouteAvailable, resolveAppRoute } from "./qa-learning-scope";
import { scopedStorageKey } from "@/infrastructure/config/app-scope";

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
  it.each(["/gks/", "/profile/edit", "/checklist/", "/study/random", "/tests/fr", "/tests/en/a/b"])("cannot bypass the QA scope via %s", (route) => {
    expect(isAppRouteAvailable(route, true)).toBe(false);
    expect(resolveAppRoute(route, true)).toBe("/study");
  });
  it.each(["/gks", "/checklist", "/profile", "/study", "/tests/ko/ko-reading-01"])("preserves %s in the full app", (route) => {
    expect(isAppRouteAvailable(route, false)).toBe(true);
    expect(resolveAppRoute(route, false)).toBe(route);
  });
  it("normalizes allowed QA paths and isolates progress without migrating or deleting production data", () => {
    expect(resolveAppRoute("/study/korean/", true)).toBe("/study/korean");
    for (const key of ["learnv-progress-v1", "learnv-language-tests-v1", "learnv-learning-journey-v1", "learnv-resource-progress-v1", "learnv-written-simulator-v1", "learnv-interview-practice-v1", "learnv-interview-score-log-v1"]) {
      expect(scopedStorageKey(key, true)).toBe(`qa:${key}`);
      expect(scopedStorageKey(key, false)).toBe(key);
    }
  });
});
