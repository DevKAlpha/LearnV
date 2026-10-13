import { isStageUnlocked, type StageProgress, type TestLanguage, type TestProgressState, type TestStage, type TestTrack } from "./language-test";

export type LanguagePathPhase = "foundation" | "advanced";

/** Completion is derived from known IDs, never a stored level flag or a raw count. */
export function completedStages(track: TestTrack, progress: Record<string, StageProgress>): number {
  return track.stages.filter((stage) => progress[stage.id]?.passed === true).length;
}

export function hasCompletedTrack(track: TestTrack, progress: Record<string, StageProgress>): boolean {
  return track.stages.length > 0 && completedStages(track, progress) === track.stages.length;
}

export function resolveLanguagePath(foundation: TestTrack, advanced: TestTrack, progress: Record<string, StageProgress>, requested?: LanguagePathPhase) {
  const advancedUnlocked = hasCompletedTrack(foundation, progress);
  const phase: LanguagePathPhase = advancedUnlocked && requested !== "foundation" ? "advanced" : "foundation";
  const track = phase === "advanced" ? advanced : foundation;
  return { phase, track, advancedUnlocked, completed: completedStages(track, progress), complete: hasCompletedTrack(track, progress) };
}

export function canOpenLanguageStage(foundation: TestTrack, advanced: TestTrack, stageId: string, progress: Record<string, StageProgress>): boolean {
  const foundationIndex = foundation.stages.findIndex((stage) => stage.id === stageId);
  if (foundationIndex >= 0) return isStageUnlocked(foundation.stages, foundationIndex, progress);
  const advancedIndex = advanced.stages.findIndex((stage) => stage.id === stageId);
  const stage = advanced.stages[advancedIndex];
  return Boolean(stage && hasCompletedTrack(foundation, progress) && advanced.stages
    .filter((previous) => previous.skill === stage.skill && previous.order < stage.order)
    .every((previous) => progress[previous.id]?.passed === true));
}

/** The final foundation result leads into advanced practice, even if skills were done out of order. */
export function nextLanguageStage(foundation: TestTrack, advanced: TestTrack, stage: TestStage, progress: Record<string, StageProgress>): TestStage | undefined {
  if (progress[stage.id]?.passed !== true) return undefined;
  const track = foundation.stages.some((candidate) => candidate.id === stage.id) ? foundation : advanced;
  const next = track.stages.find((candidate) => candidate.skill === stage.skill && candidate.order === stage.order + 1);
  if (next && canOpenLanguageStage(foundation, advanced, next.id, progress)) return next;
  const active = resolveLanguagePath(foundation, advanced, progress).track;
  return active.stages.find((candidate) => progress[candidate.id]?.passed !== true && canOpenLanguageStage(foundation, advanced, candidate.id, progress));
}

/** Keep valid v1 results; discard malformed entries individually instead of resetting a whole language. */
export function normalizeTestProgress(value: unknown, passScoreFor?: (language: TestLanguage, id: string) => number | undefined): TestProgressState {
  const result: TestProgressState = { en: {}, ko: {} };
  if (!value || typeof value !== "object" || Array.isArray(value)) return result;
  for (const language of ["en", "ko"] as const) {
    const entries = (value as Record<string, unknown>)[language];
    if (!entries || typeof entries !== "object" || Array.isArray(entries)) continue;
    for (const [id, entry] of Object.entries(entries)) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
      const stage = entry as StageProgress;
      if (!Number.isSafeInteger(stage.attempts) || stage.attempts < 1 || typeof stage.passed !== "boolean"
        || ![stage.bestScore, stage.lastScore].every((score) => typeof score === "number" && Number.isFinite(score) && score >= 0 && score <= 100)
        || typeof stage.lastCompletedAt !== "string" || !Number.isFinite(Date.parse(stage.lastCompletedAt))) continue;
      const bestScore = Math.max(stage.bestScore, stage.lastScore);
      const threshold = passScoreFor?.(language, id);
      Object.defineProperty(result[language], id, { value: {
        attempts: stage.attempts, bestScore, lastScore: stage.lastScore,
        passed: stage.passed && (threshold === undefined || bestScore >= threshold), lastCompletedAt: stage.lastCompletedAt,
      }, enumerable: true, writable: true, configurable: true });
    }
  }
  return result;
}

export function saveStageAttempt(current: TestProgressState, language: "en" | "ko", stage: Pick<TestStage, "id" | "passScore">, score: number, passed: boolean, occurredAt: string): TestProgressState {
  if (!Number.isFinite(score) || score < 0 || score > 100) return current;
  const previous = current[language][stage.id];
  const nextStage: StageProgress = {
    attempts: (previous?.attempts ?? 0) + 1,
    bestScore: Math.max(previous?.bestScore ?? 0, score),
    lastScore: score,
    passed: previous?.passed === true || (passed && score >= stage.passScore),
    lastCompletedAt: occurredAt,
  };
  return { ...current, [language]: { ...current[language], [stage.id]: nextStage } };
}

/** Merge a stale in-memory snapshot with saved results before recording a new attempt. */
export function mergeTestProgress(current: TestProgressState, stored: TestProgressState): TestProgressState {
  const merged: TestProgressState = { en: { ...current.en }, ko: { ...current.ko } };
  for (const language of ["en", "ko"] as const) {
    for (const [id, saved] of Object.entries(stored[language])) {
      const previous = current[language][id];
      if (!previous) { Object.defineProperty(merged[language], id, { value: { ...saved }, enumerable: true, writable: true, configurable: true }); continue; }
      const latest = Date.parse(saved.lastCompletedAt) >= Date.parse(previous.lastCompletedAt) ? saved : previous;
      Object.defineProperty(merged[language], id, { value: {
        ...latest, attempts: Math.max(saved.attempts, previous.attempts), bestScore: Math.max(saved.bestScore, previous.bestScore), passed: saved.passed || previous.passed,
      }, enumerable: true, writable: true, configurable: true });
    }
  }
  return merged;
}
