export type ReminderStage = "start" | "momentum" | "planComplete" | "strong";

export function getReminderStage(
  score: number,
  completedTasks: number,
  totalTasks: number,
): ReminderStage {
  if (score >= 75) return "strong";
  if (totalTasks > 0 && completedTasks >= totalTasks) return "planComplete";
  if (score > 0 || completedTasks > 0) return "momentum";
  return "start";
}
