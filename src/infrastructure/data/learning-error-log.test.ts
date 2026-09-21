import { describe, expect, it } from "vitest";
import {
  LEARNING_ERROR_LOG_LIMIT,
  LEARNING_DIAGNOSTIC_AREAS,
  learningErrorStorageKey,
  readLearningErrorLog,
  recordLearningError,
  resolveLearningDiagnosticArea,
} from "./learning-error-log";

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem(key: string) { return values.get(key) ?? null; },
    setItem(key: string, value: string) { values.set(key, value); },
  };
}

describe("learning error log", () => {
  it("uses a different storage key for every hidden learning log", () => {
    const keys = LEARNING_DIAGNOSTIC_AREAS.map(learningErrorStorageKey);
    expect(new Set(keys).size).toBe(LEARNING_DIAGNOSTIC_AREAS.length);
  });

  it.each([
    ["/study", "study-overview"],
    ["/study/english", "english-learning"],
    ["/tests/en/en-reading-01", "english-learning"],
    ["/study/korean", "korean-learning"],
    ["/tests/ko/ko-listening-01", "korean-learning"],
    ["/study/written-simulator", "written-simulator"],
    ["/study/interviews", "interview-preparation"],
    ["/profile", null],
  ] as const)("maps %s to its independent diagnostic area", (pathname, expected) => {
    expect(resolveLearningDiagnosticArea(pathname)).toBe(expected);
  });

  it("keeps independent logs for each learning area", () => {
    const storage = createMemoryStorage();
    recordLearningError({
      area: "english-learning",
      code: "english-failure",
      error: new Error("English module failed"),
      route: "/tests/en/en-reading-01",
    }, storage);
    recordLearningError({
      area: "korean-learning",
      code: "korean-failure",
      error: new Error("Korean module failed"),
      route: "/tests/ko/ko-reading-01",
    }, storage);

    expect(readLearningErrorLog("english-learning", storage).map((entry) => entry.code)).toEqual(["english-failure"]);
    expect(readLearningErrorLog("korean-learning", storage).map((entry) => entry.code)).toEqual(["korean-failure"]);
    expect(storage.getItem(learningErrorStorageKey("english-learning"))).not.toBe(storage.getItem(learningErrorStorageKey("korean-learning")));
  });

  it("omits sensitive learning content from diagnostic context", () => {
    const storage = createMemoryStorage();
    recordLearningError({
      area: "written-simulator",
      code: "save-failed",
      message: "The state could not be saved.",
      route: "/study/written-simulator",
      context: {
        step: "study-plan",
        draftText: "private candidate statement",
        answer: "private answer",
        attempt: 2,
      },
    }, storage);

    const raw = storage.getItem(learningErrorStorageKey("written-simulator")) ?? "";
    expect(raw).toContain("study-plan");
    expect(raw).toContain("attempt");
    expect(raw).not.toContain("private candidate statement");
    expect(raw).not.toContain("private answer");
  });

  it("groups repeated failures so one noisy issue cannot hide other diagnostics", () => {
    const storage = createMemoryStorage();
    for (let index = 0; index < 4; index += 1) {
      recordLearningError({
        area: "interview-chatbot",
        code: "chatbot-render-failed",
        message: "The panel failed to render.",
        route: "/",
        occurredAt: new Date(2026, 8, 19, 11, 0, index).toISOString(),
      }, storage);
    }

    const entries = readLearningErrorLog("interview-chatbot", storage);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      occurrences: 4,
      firstOccurredAt: new Date(2026, 8, 19, 11, 0, 0).toISOString(),
      lastOccurredAt: new Date(2026, 8, 19, 11, 0, 3).toISOString(),
    });
  });

  it("bounds each module log and recovers from corrupted data", () => {
    const storage = createMemoryStorage();
    storage.setItem(learningErrorStorageKey("study-overview"), "invalid-json");
    expect(readLearningErrorLog("study-overview", storage)).toEqual([]);

    for (let index = 0; index < LEARNING_ERROR_LOG_LIMIT + 4; index += 1) {
      recordLearningError({
        area: "study-overview",
        code: `failure-${index}`,
        route: "/study",
        occurredAt: new Date(2026, 8, 19, 10, 0, index).toISOString(),
      }, storage);
    }
    const entries = readLearningErrorLog("study-overview", storage);
    expect(entries).toHaveLength(LEARNING_ERROR_LOG_LIMIT);
    expect(entries[0].code).toBe(`failure-${LEARNING_ERROR_LOG_LIMIT + 3}`);
  });
});
