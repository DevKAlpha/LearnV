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
