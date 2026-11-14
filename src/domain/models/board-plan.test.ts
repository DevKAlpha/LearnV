import { describe, expect, it } from "vitest";
import { MAX_SUGGESTIONS, normalizeDismissed, suggestBoardTasks, type BoardPlanInput } from "./board-plan";
import { todayBoardTasks, type BoardTask } from "./task-board";

const input: BoardPlanInput = {
  today: "2026-11-14",
  entryYear: 2028,
  documents: [{ id: "language", start: "2026-11-14" }, { id: "passport", start: "2027-06-17" }, { id: "family", start: "2026-12-01" }],
  review: { pending: 12, language: "ko" },
  action: "language-exam",
  actionDue: "2027-09-01",
  existing: [],
  dismissed: [],
};

const task = (id: string, status: BoardTask["status"], dueDate: string | null, createdAt = 1): BoardTask => ({ id, title: id, area: "gks", status, dueDate, createdAt, updatedAt: createdAt });

describe("board plan", () => {
  it("suggests today's review, the cycle step and documents that start soon", () => {
    const suggestions = suggestBoardTasks(input);
    expect(suggestions.map((item) => item.id)).toEqual(["srs-review-2026-11-14", "gks-step-language-exam-2028", "gks-doc-language-2028", "gks-doc-family-2028"]);
    expect(suggestions[0]).toMatchObject({ area: "korean", dueDate: "2026-11-14", count: 12 });
    expect(suggestions.length).toBeLessThanOrEqual(MAX_SUGGESTIONS);
  });

  it("never offers a task already on the board or dismissed", () => {
    const suggestions = suggestBoardTasks({ ...input, existing: [{ id: "gks-doc-language-2028" }], dismissed: ["srs-review-2026-11-14"] });
    expect(suggestions.map((item) => item.id)).toEqual(["gks-step-language-exam-2028", "gks-doc-family-2028"]);
  });

  it("offers a new review task each day and skips empty queues", () => {
    expect(suggestBoardTasks({ ...input, today: "2026-11-15", dismissed: ["srs-review-2026-11-14"] })[0].id).toBe("srs-review-2026-11-15");
    expect(suggestBoardTasks({ ...input, review: { pending: 0, language: "en" } }).some((item) => item.kind === "review")).toBe(false);
    expect(suggestBoardTasks({ ...input, action: null }).some((item) => item.kind === "cycle")).toBe(false);
  });

  it("keeps a bounded list of valid dismissed ids", () => {
    expect(normalizeDismissed({ dismissed: ["ok-1", "ok-1", "bad id", 4, "x".repeat(81)] })).toEqual(["ok-1"]);
    expect(normalizeDismissed("nope")).toEqual([]);
    expect(normalizeDismissed(Array.from({ length: 250 }, (_, index) => `id-${index}`))).toHaveLength(200);
  });

  it("the Today view lists overdue and due tasks, then work in progress", () => {
    const tasks = [task("later", "todo", "2026-11-20"), task("doing", "doing", null), task("due", "todo", "2026-11-14"), task("late", "doing", "2026-11-01"), task("done", "done", "2026-11-02")];
    expect(todayBoardTasks(tasks, "2026-11-14").map((item) => item.id)).toEqual(["late", "due", "doing"]);
  });
});
