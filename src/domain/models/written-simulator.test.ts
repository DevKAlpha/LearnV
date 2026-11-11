import { describe, expect, it } from "vitest";
import { emptyWrittenSimulator, getWrittenCharacterLimit, isWrittenSimulatorStarted, scoreWrittenSimulator } from "./written-simulator";

describe("written simulator", () => {
  it("only becomes active after the simulation starts", () => {
    expect(isWrittenSimulatorStarted(emptyWrittenSimulator)).toBe(false);
    expect(isWrittenSimulatorStarted({
      ...emptyWrittenSimulator,
      step: "knowledge",
      startedAt: "2026-08-23T12:00:00.000Z",
    })).toBe(true);
  });

  it("uses the official reference character limits", () => {
    expect(getWrittenCharacterLimit("ko")).toBe(3000);
    expect(getWrittenCharacterLimit("en")).toBe(5000);
  });

  it("scores knowledge, writing completion and review separately", () => {
    const result = scoreWrittenSimulator({
      ...emptyWrittenSimulator,
      answers: { first: 1, second: 0 },
      personalStatement: "a".repeat(600),
      studyPlan: "b".repeat(600),
      rubric: ["one", "two"],
    }, { first: 1, second: 1 }, 4);

    expect(result).toEqual({ total: 65, knowledge: 25, writing: 30, review: 10 });
  });

  it("caps writing completion at its maximum contribution", () => {
    const result = scoreWrittenSimulator({
      ...emptyWrittenSimulator,
      personalStatement: "a".repeat(5000),
      studyPlan: "b".repeat(5000),
    }, {}, 6);

    expect(result.writing).toBe(30);
  });
});

describe("written simulator storage", () => {
  it("rebuilds a usable state from corrupted storage", async () => {
    const { normalizeWrittenSimulator, emptyWrittenSimulator } = await import("./written-simulator");
    expect(normalizeWrittenSimulator(null)).toEqual(emptyWrittenSimulator);
    const repaired = normalizeWrittenSimulator({ step: "hack", personalStatement: 42, studyPlan: "Plan", answers: { q: 1, bad: "x" }, rubric: ["a", 3], attempts: -1, lastScore: 400 });
    expect(repaired.step).toBe("intro");
    expect(repaired.personalStatement).toBe("");
    expect(repaired.studyPlan).toBe("Plan");
    expect(repaired.answers).toEqual({ q: 1 });
    expect(repaired.rubric).toEqual(["a"]);
    expect(repaired.attempts).toBe(0);
    expect(repaired.lastScore).toBe(100);
  });
});
