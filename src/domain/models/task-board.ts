export const boardAreas = ["english", "korean", "gks", "culture"] as const;
export const boardStatuses = ["todo", "doing", "done"] as const;
export type BoardArea = typeof boardAreas[number];
export type BoardStatus = typeof boardStatuses[number];
export const MAX_BOARD_TASKS = 120;
export const MAX_TASK_TITLE = 100;
export type BoardTask = { id: string; title: string; area: BoardArea; status: BoardStatus; dueDate: string | null; createdAt: number; updatedAt: number };
export type TaskInput = Pick<BoardTask, "title" | "area" | "dueDate">;
export type TaskBoard = { version: 1; revision: number; tasks: BoardTask[] };
export type BoardIssue = "title" | "date" | "limit" | "missing" | "stale" | "invalid" | "unavailable" | "conflict" | "file";
export const emptyTaskBoard = (): TaskBoard => ({ version: 1, revision: 0, tasks: [] });
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const timestamp = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= 8640000000000000;
export const cleanTaskTitle = (title: string) => title.replace(/\s+/gu, " ").trim();
export function validBoardDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === value;
}
export function taskInputIssue(input: TaskInput): BoardIssue | null {
  if (!cleanTaskTitle(input.title) || cleanTaskTitle(input.title).length > MAX_TASK_TITLE) return "title";
  if (input.dueDate !== null && !validBoardDate(input.dueDate)) return "date";
  if (!boardAreas.includes(input.area)) return "invalid";
  return null;
}
export function parseTaskBoard(raw: string): TaskBoard | null {
  try {
    if (raw.length > 512000) return null;
    const value: unknown = JSON.parse(raw);
    if (!record(value) || value.version !== 1 || !Number.isSafeInteger(value.revision) || (value.revision as number) < 0 || !Array.isArray(value.tasks) || value.tasks.length > MAX_BOARD_TASKS) return null;
    const tasks: BoardTask[] = []; const ids = new Set<string>();
    for (const task of value.tasks) {
      if (!record(task) || typeof task.id !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(task.id) || ids.has(task.id) || typeof task.title !== "string" || !boardAreas.includes(task.area as BoardArea) || !boardStatuses.includes(task.status as BoardStatus) || !timestamp(task.createdAt) || !timestamp(task.updatedAt) || task.updatedAt < task.createdAt) return null;
      const input = { title: task.title, area: task.area as BoardArea, dueDate: task.dueDate as string | null };
      if (taskInputIssue(input)) return null;
      ids.add(task.id);
      tasks.push({ id: task.id, title: cleanTaskTitle(task.title), area: input.area, status: task.status as BoardStatus, dueDate: input.dueDate, createdAt: task.createdAt, updatedAt: task.updatedAt });
    }
    return { version: 1, revision: value.revision as number, tasks };
  } catch { return null; }
}
export type BoardChange =
  | { type: "add"; task: BoardTask }
  | { type: "edit"; id: string; input: TaskInput; expectedUpdatedAt: number }
  | { type: "move"; id: string; status: BoardStatus }
  | { type: "remove"; id: string }
  | { type: "restore"; task: BoardTask; index: number };
export function changeBoardTasks(tasks: BoardTask[], change: BoardChange, now: number): { tasks: BoardTask[]; issue: BoardIssue | null } {
  const fail = (issue: BoardIssue) => ({ tasks, issue });
  if (change.type === "add" || change.type === "restore") {
    if (tasks.length >= MAX_BOARD_TASKS) return fail("limit");
    if (tasks.some((task) => task.id === change.task.id)) return fail("conflict");
    const issue = taskInputIssue(change.task); if (issue) return fail(issue);
    const next = [...tasks];
    next.splice(change.type === "add" ? 0 : Math.max(0, Math.min(change.index, tasks.length)), 0, { ...change.task, title: cleanTaskTitle(change.task.title), updatedAt: Math.max(now, change.task.updatedAt + 1) });
    return { tasks: next, issue: null };
  }
  const task = tasks.find((item) => item.id === change.id);
  if (!task) return fail("missing");
  if (change.type === "remove") return { tasks: tasks.filter((item) => item.id !== change.id), issue: null };
  if (change.type === "edit") {
    if (task.updatedAt !== change.expectedUpdatedAt) return fail("stale");
    const issue = taskInputIssue(change.input); if (issue) return fail(issue);
    return { tasks: tasks.map((item) => item.id === change.id ? { ...item, ...change.input, title: cleanTaskTitle(change.input.title), updatedAt: Math.max(now, item.updatedAt + 1) } : item), issue: null };
  }
  if (!boardStatuses.includes(change.status)) return fail("invalid");
  return { tasks: tasks.map((item) => item.id === change.id ? { ...item, status: change.status, updatedAt: Math.max(now, item.updatedAt + 1) } : item), issue: null };
}
/** Local calendar date: UTC conversion would change the day for some learners. */
export function localBoardDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
export const isBoardTaskOverdue = (task: BoardTask, today: string) => task.status !== "done" && task.dueDate !== null && task.dueDate < today;
export type BoardSuggestion = { kind: "start" | "overdue" | "focus" | "stale" | "next" | "connect" | "complete" | "steady"; count: number; taskId?: string };
export function getBoardSuggestions(tasks: BoardTask[], today: string, now: number): BoardSuggestion[] {
  if (!tasks.length) return [{ kind: "start", count: 0 }];
  const open = tasks.filter((task) => task.status !== "done");
  if (!open.length) return [{ kind: "complete", count: tasks.length }];
  const suggestions: BoardSuggestion[] = [];
  const overdue = open.filter((task) => isBoardTaskOverdue(task, today)).sort((a,b) => a.dueDate!.localeCompare(b.dueDate!));
  const doing = open.filter((task) => task.status === "doing");
  if (overdue.length) suggestions.push({ kind: "overdue", count: overdue.length, taskId: overdue[0].id });
  if (doing.length > 3) suggestions.push({ kind: "focus", count: doing.length });
  if (!doing.length) {
    const next = [...open].sort((a,b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999") || a.createdAt-b.createdAt)[0];
    suggestions.push({ kind: "next", count: open.length, taskId: next.id });
  }
  const stale = [...open].filter((task) => now-task.updatedAt >= 7*86400000 && !overdue.some((item) => item.id === task.id)).sort((a,b) => a.updatedAt-b.updatedAt)[0];
  if (stale) suggestions.push({ kind: "stale", count: 7, taskId: stale.id });
  if (open.some((task) => task.area === "culture") && !open.some((task) => task.area === "korean" || task.area === "english")) suggestions.push({ kind: "connect", count: open.filter((task) => task.area === "culture").length });
  return suggestions.length ? suggestions.slice(0,3) : [{ kind: "steady", count: doing.length }];
}
