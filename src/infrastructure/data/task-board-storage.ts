import { emptyTaskBoard, parseTaskBoard, type BoardTask, type TaskBoard } from "@/domain/models/task-board";
import { scopedStorageKey } from "@/infrastructure/config/app-scope";

type BoardStorage = Pick<Storage, "getItem" | "setItem">;
export const taskBoardStorageKey = scopedStorageKey("learnv-task-board-v1");
export const taskBoardBackupKey = `${taskBoardStorageKey}:before-restore`;
export type BoardLoad = { board: TaskBoard; raw: string | null; issue: "invalid" | "unavailable" | null };
export function readTaskBoard(storage?: Pick<Storage,"getItem">): BoardLoad {
  try {
    const raw = (storage ?? localStorage).getItem(taskBoardStorageKey);
    if (raw === null) return { board: emptyTaskBoard(), raw, issue: null };
    const board = parseTaskBoard(raw);
    return { board: board ?? emptyTaskBoard(), raw, issue: board ? null : "invalid" };
  } catch { return { board: emptyTaskBoard(), raw: null, issue: "unavailable" }; }
}
export type BoardWrite = BoardLoad & { saved: boolean; conflict?: boolean };
/** An unavailable store permits in-memory work; damaged or changed copies are never overwritten. */
export function writeTaskBoard(tasks: BoardTask[], revision: number, storage?: BoardStorage): BoardWrite {
  const latest = readTaskBoard(storage);
  const pending = { version: 1 as const, revision, tasks };
  if (latest.issue === "unavailable") return { board: pending, raw: null, issue: "unavailable", saved: false };
  if (latest.issue === "invalid") return { ...latest, saved: false };
  if (!latest.issue && latest.board.revision !== revision) return { ...latest, saved: false, conflict: true };
  const board = { ...pending, revision: revision + 1 };
  const raw = JSON.stringify(board);
  try {
    (storage ?? localStorage).setItem(taskBoardStorageKey, raw);
    return { board, raw, issue: null, saved: true };
  } catch { return { board: pending, raw: latest.raw, issue: "unavailable", saved: false }; }
}
export function restoreTaskBoard(incoming: TaskBoard, expectedRaw: string | null, storage?: BoardStorage): BoardWrite {
  const latest = readTaskBoard(storage);
  if (latest.issue === "unavailable") return { ...latest, saved: false };
  if (latest.raw !== expectedRaw) return { ...latest, saved: false, conflict: true };
  const board = { version: 1 as const, revision: latest.board.revision + 1, tasks: incoming.tasks };
  const raw = JSON.stringify(board);
  try {
    const target = storage ?? localStorage;
    if (latest.raw !== null) target.setItem(taskBoardBackupKey, latest.raw);
    target.setItem(taskBoardStorageKey, raw);
    return { board, raw, issue: null, saved: true };
  } catch { return { ...latest, issue: "unavailable", saved: false }; }
}
export function readTaskBoardBackup(storage?: Pick<Storage,"getItem">) {
  try { const raw = (storage ?? localStorage).getItem(taskBoardBackupKey); return raw ? parseTaskBoard(raw) : null; }
  catch { return null; }
}
