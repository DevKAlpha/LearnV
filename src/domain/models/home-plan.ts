export type HomeTaskPlanEntry<T> = {
  task: T;
  originalIndex: number;
  completed: boolean;
};

export type HomeTaskPlan<T> = {
  completedCount: number;
  primary: HomeTaskPlanEntry<T> | null;
  remaining: HomeTaskPlanEntry<T>[];
};

export function buildHomeTaskPlan<T extends { id: string }>(
  tasks: readonly T[],
  completedTaskIds: readonly string[],
): HomeTaskPlan<T> {
  const completedIds = new Set(completedTaskIds);
  const entries = tasks.map((task, originalIndex) => ({
    task,
    originalIndex,
    completed: completedIds.has(task.id),
  }));
  const primary = entries.find((entry) => !entry.completed) ?? null;

  return {
    completedCount: entries.filter((entry) => entry.completed).length,
    primary,
    remaining: primary
      ? entries.filter((entry) => entry.task.id !== primary.task.id)
      : entries,
  };
}

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
  todayDone: number;
  todayTotal: number;
};

/**
 * Readiness rewards durable evidence: documents (45%) and passed language stages (40%).
 * Today's plan adds a small daily signal (15%) so ticking three boxes cannot dominate.
 */
export function readinessScore(input: ReadinessInput) {
  const share = (done: number, total: number) => total > 0 ? Math.min(1, Math.max(0, done / total)) : 0;
  return Math.round((
    share(input.documentsDone, input.documentsTotal) * 0.45
    + share(input.stagesPassed, input.stagesTotal) * 0.40
    + share(input.todayDone, input.todayTotal) * 0.15
  ) * 100);
}
