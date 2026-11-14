/** Persisted GKS plan state. Daily task ticks belong to one local day (`taskDate`). */
export type StoredGksProgress = {
  taskDate: string | null;
  completedTasks: string[];
  completedDocuments: string[];
};

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

function knownIds(value: unknown, ids: readonly string[]) {
  return Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === "string" && ids.includes(id)))]
    : [];
}

/**
 * Validates stored progress. Legacy data (no `taskDate`) keeps its documents but its task
 * ticks are dropped: they were never tied to a day, so they cannot count as "today".
 */
export function normalizeGksProgress(value: unknown, taskIds: readonly string[], documentIds: readonly string[]): StoredGksProgress {
  const record = typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const taskDate = typeof record.taskDate === "string" && DATE_KEY.test(record.taskDate) ? record.taskDate : null;
  return {
    taskDate,
    completedTasks: taskDate ? knownIds(record.completedTasks, taskIds) : [],
    completedDocuments: knownIds(record.completedDocuments, documentIds),
  };
}

/** Task ticks only apply on the day they were made; a new local day starts an empty plan. */
export function resolveDailyTasks(progress: StoredGksProgress, today: string): string[] {
  return progress.taskDate === today ? progress.completedTasks : [];
}

export type ReadinessInput = {
  documentsDone: number;
  documentsTotal: number;
  stagesPassed: number;
  stagesTotal: number;
};

/**
 * Readiness only rewards durable evidence: documents (50%) and passed language stages (50%).
 * Today's plan is shown on its own and never inflates this score.
 */
export function readinessScore(input: ReadinessInput) {
  const share = (done: number, total: number) => total > 0 ? Math.min(1, Math.max(0, done / total)) : 0;
  return Math.round((
    share(input.documentsDone, input.documentsTotal) * 0.5
    + share(input.stagesPassed, input.stagesTotal) * 0.5
  ) * 100);
}
