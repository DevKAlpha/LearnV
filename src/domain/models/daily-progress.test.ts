import { describe, expect, it } from "vitest";
import { normalizeGksProgress, readinessScore, resolveDailyTasks } from "./home-plan";

const taskIds = ["a", "b", "c"];
const documentIds = ["passport", "essay"];

describe("daily GKS progress", () => {
  it("only counts task ticks on the local day they were made", () => {
    const stored = normalizeGksProgress({ taskDate: "2026-11-10", completedTasks: ["a", "b"], completedDocuments: [] }, taskIds, documentIds);
    expect(resolveDailyTasks(stored, "2026-11-10")).toEqual(["a", "b"]);
    expect(resolveDailyTasks(stored, "2026-11-11")).toEqual([]);
  });

  it("drops undated legacy task ticks but keeps documents", () => {
    const stored = normalizeGksProgress({ completedTasks: ["a"], completedDocuments: ["essay", "unknown"] }, taskIds, documentIds);
    expect(stored.completedTasks).toEqual([]);
    expect(stored.completedDocuments).toEqual(["essay"]);
  });

  it("survives corrupted storage", () => {
    for (const value of [null, 3, "x", [], { taskDate: 12, completedTasks: "a", completedDocuments: {} }]) {
      expect(normalizeGksProgress(value, taskIds, documentIds)).toEqual({ taskDate: null, completedTasks: [], completedDocuments: [] });
    }
  });

  it("weights readiness towards durable evidence rather than today's checkboxes", () => {
    const todayOnly = readinessScore({ documentsDone: 0, documentsTotal: 10, stagesPassed: 0, stagesTotal: 264, todayDone: 3, todayTotal: 3 });
    expect(todayOnly).toBe(15);
    expect(readinessScore({ documentsDone: 10, documentsTotal: 10, stagesPassed: 264, stagesTotal: 264, todayDone: 3, todayTotal: 3 })).toBe(100);
    expect(readinessScore({ documentsDone: 0, documentsTotal: 0, stagesPassed: 0, stagesTotal: 0, todayDone: 0, todayTotal: 0 })).toBe(0);
  });
});
