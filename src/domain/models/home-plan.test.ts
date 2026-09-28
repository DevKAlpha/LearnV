import { describe, expect, it } from "vitest";
import { buildHomeTaskPlan } from "./home-plan";

const tasks = [
  { id: "first", label: "First" },
  { id: "second", label: "Second" },
  { id: "third", label: "Third" },
];

describe("home task plan", () => {
  it("prioritises the first unfinished task without changing the source order", () => {
    const plan = buildHomeTaskPlan(tasks, ["first"]);

    expect(plan.primary?.task.id).toBe("second");
    expect(plan.primary?.originalIndex).toBe(1);
    expect(plan.remaining.map((entry) => entry.task.id)).toEqual(["first", "third"]);
    expect(tasks.map((task) => task.id)).toEqual(["first", "second", "third"]);
  });

  it("reports the plan as complete when every task is done", () => {
    const plan = buildHomeTaskPlan(tasks, ["first", "second", "third"]);

    expect(plan.completedCount).toBe(3);
    expect(plan.primary).toBeNull();
    expect(plan.remaining).toHaveLength(3);
  });

  it("ignores completed identifiers that do not belong to today's plan", () => {
    const plan = buildHomeTaskPlan(tasks, ["unknown"]);

    expect(plan.completedCount).toBe(0);
    expect(plan.primary?.task.id).toBe("first");
  });
});
