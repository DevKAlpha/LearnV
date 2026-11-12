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

  const essay = [
    "I want to study materials engineering in Korea because my region depends on a battery factory that is growing quickly.",
    "However, local companies still import most of their research, so engineers who understand both markets are scarce.",
    "For example, during my internship I compared two recycling methods and presented the results to the plant manager.",
    "Therefore, the GKS programme would let me learn advanced techniques, build contacts with Korean laboratories and return with practical skills.",
    "In addition, studying Korean has taught me patience, discipline and respect for a different working culture.",
  ].join(" ");

  it("scores knowledge, writing and review separately", () => {
    const result = scoreWrittenSimulator({
      ...emptyWrittenSimulator,
      answers: { first: 1, second: 0 },
      personalStatement: essay,
      studyPlan: essay,
      rubric: ["one", "two"],
    }, { first: 1, second: 1 }, 4);

    expect(result.knowledge).toBe(25);
    expect(result.review).toBe(10);
    expect(result.writing).toBe(30);
    expect(result.total).toBe(65);
  });

  it("does not give full writing marks for length alone", () => {
    const padded = scoreWrittenSimulator({
      ...emptyWrittenSimulator,
      personalStatement: "a".repeat(5000),
      studyPlan: "word ".repeat(1000),
    }, {}, 6);

    expect(padded.writing).toBeLessThanOrEqual(15);
    expect(scoreWrittenSimulator({ ...emptyWrittenSimulator, personalStatement: essay, studyPlan: essay }, {}, 6).writing).toBeGreaterThan(padded.writing);
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
