import { describe, expect, it } from "vitest";
import { changeBoardTasks, cleanTaskTitle, emptyTaskBoard, getBoardSuggestions, isBoardTaskOverdue, localBoardDate, MAX_BOARD_TASKS, parseTaskBoard, taskInputIssue, validBoardDate, type BoardTask, type TaskBoard } from "./task-board";

const now = Date.UTC(2026,10,1,12);
const task = (id: string, overrides: Partial<BoardTask> = {}): BoardTask => ({ id, title: "Leer un aviso", area: "korean", status: "todo", dueDate: null, createdAt: now-1000, updatedAt: now-1000, ...overrides });
const encoded = (tasks: BoardTask[]) => JSON.stringify({ version: 1, revision: 2, tasks });

it("accepts a short Unicode action and collapses excess whitespace", () => {
  expect(cleanTaskTitle("  Leer\n 한국어  con calma  ")).toBe("Leer 한국어 con calma");
  expect(taskInputIssue({ title: "한국어를 연습하기", area: "korean", dueDate: null })).toBeNull();
  expect(taskInputIssue({ title: " ", area: "gks", dueDate: null })).toBe("title");
  expect(taskInputIssue({ title: "a".repeat(101), area: "gks", dueDate: null })).toBe("title");
});
it.each(["2026-02-29", "2026-11-31", "2026-13-01", "01/11/2026", "garbage", undefined])("rejects invalid calendar dates %s", (date) => {
  expect(validBoardDate(date)).toBe(false);
});
it("handles leap days, local calendar dates, optional dates and completed deadlines", () => {
  expect(validBoardDate("2028-02-29")).toBe(true);
  expect(localBoardDate(new Date(2026,10,1,23,45))).toBe("2026-11-01");
  expect(isBoardTaskOverdue(task("a", { dueDate: "2026-10-31" }), "2026-11-01")).toBe(true);
  expect(isBoardTaskOverdue(task("a", { dueDate: "2026-11-01" }), "2026-11-01")).toBe(false);
  expect(isBoardTaskOverdue(task("a", { dueDate: "2026-10-31", status: "done" }), "2026-11-01")).toBe(false);
  expect(isBoardTaskOverdue(task("a"), "2026-11-01")).toBe(false);
});
it("roundtrips a valid board while retaining plain user text and dropping unrelated fields", () => {
  const board = parseTaskBoard(JSON.stringify({ version: 1, revision: 2, extra: "not retained", tasks: [{ ...task("a", { title: '<svg onload="alert(1)"> 한국어' }), private: "not retained" }] }))!;
  expect(board.tasks[0].title).toBe('<svg onload="alert(1)"> 한국어');
  expect(JSON.stringify(board)).not.toContain("not retained");
  expect(parseTaskBoard(JSON.stringify(board))).toEqual(board);
});
it.each(["null", "[]", "{broken", JSON.stringify({ version: 2, revision: 0, tasks: [] }), JSON.stringify({ version: 1, revision: -1, tasks: [] })])("rejects damaged or unsupported boards without inventing replacements: %s", (raw) => {
  expect(parseTaskBoard(raw)).toBeNull();
});
it("rejects duplicate IDs, invalid categories, missing dates and reversed timestamps", () => {
  expect(parseTaskBoard(encoded([task("a"),task("a")]))).toBeNull();
  for (const overrides of [{ status: "unknown" }, { area: "unknown" }, { dueDate: undefined }, { dueDate: "2026-02-30" }, { updatedAt: -1 }, { updatedAt: now-2000 }, { id: "<bad>" }]) expect(parseTaskBoard(encoded([{ ...task("a"), ...overrides } as BoardTask]))).toBeNull();
});
it("limits the board without truncating imports or discarding existing notes", () => {
  const tasks = Array.from({ length: MAX_BOARD_TASKS }, (_, index) => task(`task-${index}`));
  expect(parseTaskBoard(encoded(tasks))?.tasks.length).toBe(MAX_BOARD_TASKS);
  expect(parseTaskBoard(encoded([...tasks,task("extra")]))).toBeNull();
  const result = changeBoardTasks(tasks, { type: "add", task: task("extra") }, now);
  expect(result.issue).toBe("limit"); expect(result.tasks).toBe(tasks);
});
it("creates, edits, moves, deletes and restores notes immutably with their essential content", () => {
  const first = task("a"); const second = task("b"); const initial = [first,second];
  const added = changeBoardTasks(initial, { type: "add", task: task("c") }, now).tasks;
  expect(added.map((entry) => entry.id)).toEqual(["c","a","b"]);
  const edited = changeBoardTasks(added, { type: "edit", id: "a", expectedUpdatedAt: first.updatedAt, input: { title: "  Comprobar  requisito ", area: "gks", dueDate: "2026-11-05" } }, now).tasks;
  const moved = changeBoardTasks(edited, { type: "move", id: "a", status: "done" }, now).tasks;
  expect(moved[1]).toMatchObject({ title: "Comprobar requisito", area: "gks", status: "done", dueDate: "2026-11-05", createdAt: first.createdAt });
  const deleted = changeBoardTasks(moved, { type: "remove", id: "a" }, now).tasks;
  const restored = changeBoardTasks(deleted, { type: "restore", task: moved[1], index: 1 }, now).tasks;
  expect(restored.map((entry) => entry.id)).toEqual(["c","a","b"]);
  expect(restored[1].status).toBe("done"); expect(initial).toEqual([first,second]); expect(first.title).toBe("Leer un aviso");
});
it("refuses stale edits and missing notes rather than silently recreating or overwriting them", () => {
  const tasks = [task("a", { updatedAt: now })];
  expect(changeBoardTasks(tasks, { type: "edit", id: "a", expectedUpdatedAt: now-1, input: { title: "Old draft", area: "english", dueDate: null } }, now).issue).toBe("stale");
  expect(changeBoardTasks(tasks, { type: "move", id: "missing", status: "doing" }, now).issue).toBe("missing");
  expect(changeBoardTasks(tasks, { type: "add", task: task("a") }, now).issue).toBe("conflict");
  expect(changeBoardTasks(tasks, { type: "move", id: "a", status: "unknown" as "doing" }, now).issue).toBe("invalid");
});
describe("board suggestions", () => {
  it("offers a small beginning or next cycle instead of inventing progress", () => {
    expect(getBoardSuggestions([],"2026-11-01",now)).toEqual([{ kind: "start", count: 0 }]);
    expect(getBoardSuggestions([task("a",{status:"done"})],"2026-11-01",now)).toEqual([{ kind: "complete", count: 1 }]);
  });
  it("identifies passed dates and too many simultaneous tasks without moving anything", () => {
    const tasks = [task("a", { dueDate:"2026-10-31", status:"doing" }), ...["b","c","d"].map((id) => task(id,{status:"doing"}))]; const before = JSON.stringify(tasks);
    expect(getBoardSuggestions(tasks,"2026-11-01",now)).toMatchObject([{kind:"overdue",count:1,taskId:"a"},{kind:"focus",count:4}]);
    expect(JSON.stringify(tasks)).toBe(before);
  });
  it("chooses the next step by date then age, leaving completed tasks out", () => {
    const tasks = [task("old",{createdAt:now-30000}),task("soon",{dueDate:"2026-11-02"}),task("later",{dueDate:"2026-12-02"}),task("done",{dueDate:"2020-01-01",status:"done"})];
    expect(getBoardSuggestions(tasks,"2026-11-01",now).find((item) => item.kind === "next")?.taskId).toBe("soon");
    expect(getBoardSuggestions(tasks,"2026-11-01",now).some((item) => item.kind === "overdue")).toBe(false);
  });
  it("suggests revisiting an old note and connecting culture with language only when relevant", () => {
    const tasks = [task("culture",{area:"culture",updatedAt:now-8*86400000,createdAt:now-8*86400000,status:"doing"})];
    expect(getBoardSuggestions(tasks,"2026-11-01",now).map((item) => item.kind)).toEqual(["stale","connect"]);
    expect(getBoardSuggestions([...tasks,task("language")],"2026-11-01",now).some((item) => item.kind === "connect")).toBe(false);
  });
  it("keeps a manageable plan quiet and never returns an unbounded list", () => {
    expect(getBoardSuggestions([task("a",{status:"doing"})],"2026-11-01",now)).toEqual([{kind:"steady",count:1}]);
    expect(getBoardSuggestions([task("a",{area:"culture",dueDate:"2026-10-30"}),task("b",{area:"culture",createdAt:0,updatedAt:0})],"2026-11-01",now).length).toBeLessThanOrEqual(3);
    expect(emptyTaskBoard()).toEqual({version:1,revision:0,tasks:[]});
  });
});
