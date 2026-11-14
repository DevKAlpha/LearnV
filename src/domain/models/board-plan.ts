import type { NextActionId } from "./gks-cycle";
import type { BoardArea, BoardTask } from "./task-board";

/** Documents whose start date falls within this many days are suggested for the board. */
export const DOCUMENT_HORIZON_DAYS = 21;
export const MAX_SUGGESTIONS = 4;

export type BoardCandidate =
  | { kind: "document"; id: string; area: "gks"; dueDate: string; documentId: string }
  | { kind: "review"; id: string; area: BoardArea; dueDate: string; count: number }
  | { kind: "cycle"; id: string; area: "gks"; dueDate: string | null; action: NextActionId };

export type BoardPlanInput = {
  today: string;
  entryYear: number;
  /** Pending documents with the day to start them, in any order. */
  documents: readonly { id: string; start: string }[];
  review: { pending: number; language: "en" | "ko" };
  /** Null hides the cycle step (learning-only builds). */
  action: NextActionId | null;
  actionDue: string | null;
  existing: readonly Pick<BoardTask, "id">[];
  dismissed: readonly string[];
};

export const documentTaskId = (documentId: string, entryYear: number) => `gks-doc-${documentId}-${entryYear}`;
export const reviewTaskId = (today: string) => `srs-review-${today}`;
export const cycleTaskId = (action: NextActionId, entryYear: number) => `gks-step-${action}-${entryYear}`;

function addDays(day: string, days: number) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Tasks the board can offer with one tap, from what the rest of the app already knows:
 * documents that should start soon, today's review queue and the step for the cycle phase.
 * Each id is stable (per document and cycle, per review day), so accepting or dismissing a
 * suggestion is remembered and nothing is offered twice.
 */
export function suggestBoardTasks(input: BoardPlanInput): BoardCandidate[] {
  const taken = new Set([...input.existing.map((task) => task.id), ...input.dismissed]);
  const horizon = addDays(input.today, DOCUMENT_HORIZON_DAYS);
  const candidates: BoardCandidate[] = [];

  if (input.review.pending > 0) {
    candidates.push({ kind: "review", id: reviewTaskId(input.today), area: input.review.language === "ko" ? "korean" : "english", dueDate: input.today, count: input.review.pending });
  }
  if (input.action) {
    candidates.push({ kind: "cycle", id: cycleTaskId(input.action, input.entryYear), area: "gks", dueDate: input.actionDue, action: input.action });
  }
  const soon = [...input.documents]
    .filter((document) => document.start <= horizon)
    .sort((a, b) => a.start.localeCompare(b.start));
  for (const document of soon) {
    candidates.push({ kind: "document", id: documentTaskId(document.id, input.entryYear), area: "gks", dueDate: document.start, documentId: document.id });
  }
  return candidates.filter((candidate) => !taken.has(candidate.id)).slice(0, MAX_SUGGESTIONS);
}

/** Keeps a bounded list of valid ids, newest last. */
export function normalizeDismissed(value: unknown): string[] {
  const list = Array.isArray(value) ? value : (value as { dismissed?: unknown } | null)?.dismissed;
  if (!Array.isArray(list)) return [];
  return [...new Set(list.filter((id): id is string => typeof id === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(id)))].slice(-200);
}
