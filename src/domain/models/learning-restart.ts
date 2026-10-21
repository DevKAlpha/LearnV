export const restartLessonIds = ["meaning", "form", "use"] as const;
export type RestartLessonId = typeof restartLessonIds[number];
export type RestartProgress = RestartLessonId[];

export function normalizeRestartProgress(value: unknown): RestartProgress {
  return restartLessonIds.filter((id) => Array.isArray(value) && value.includes(id));
}

export function completeRestartLesson(value: unknown, lesson: RestartLessonId): RestartProgress {
  return normalizeRestartProgress([...normalizeRestartProgress(value), lesson]);
}

export function restartAnswerIsCorrect(correctIndex: number, selected: number | null): boolean {
  return selected !== null && Number.isInteger(selected) && selected === correctIndex;
}
