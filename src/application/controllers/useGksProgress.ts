import { scopedStorageKey } from "@/infrastructure/config/app-scope";
import { useCallback, useMemo } from "react";
import { useLocalToday } from "./useLocalToday";
import { documents } from "../../infrastructure/data/gks-2026";
import { NEXT_ACTIONS } from "@/domain/models/gks-cycle";
import { gksPlanId } from "@/domain/models/daily-plan";
import { trackLearning } from "./learningJourneyEvents";
import { isLearningQa } from "@/application/qa/qa-learning-scope";
import { localDateKey } from "@/domain/models/learning-journey";
import { normalizeGksProgress, readinessScore, resolveDailyTasks, type StoredGksProgress } from "@/domain/models/home-plan";
import { TESTS_PER_LANGUAGE } from "@/infrastructure/data/practice-test-metadata";
import { createLocalStore } from "@/infrastructure/storage/local-store";
import { recordLearningError } from "@/infrastructure/data/learning-error-log";
import { useLanguageTestProgress } from "./useLanguageTestProgress";
import { useLocalStore } from "./useLocalStore";

const STORAGE_KEY = scopedStorageKey("learnv-progress-v1");
const LEGACY_STORAGE_KEY = scopedStorageKey("gks-path-progress-v1");

/** Only the GKS step of the daily plan is ticked by hand; the rest comes from real practice. */
const taskIds = NEXT_ACTIONS.map(gksPlanId);
const documentIds = documents.map((document) => document.id);

// One-time move of the oldest key, so the shared store below only has to read one key.
try {
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy !== null && localStorage.getItem(STORAGE_KEY) === null) localStorage.setItem(STORAGE_KEY, legacy);
} catch { /* Storage unavailable: the store falls back to an empty plan. */ }

/** One shared store, so Home, documents and the board see the same ticks in the same tab. */
export const gksProgressStore = createLocalStore<StoredGksProgress>({
  key: STORAGE_KEY,
  fallback: normalizeGksProgress(null, taskIds, documentIds),
  parse: (raw) => normalizeGksProgress(raw, taskIds, documentIds),
  onError: (code, error) => recordLearningError({ area: "study-overview", code: `gks-progress-${code}`, error }),
});

export function useGksProgress() {
  const stored = useLocalStore(gksProgressStore);
  const today = useLocalToday();

  const completedTasks = useMemo(() => resolveDailyTasks(stored, today), [stored, today]);
  const progress = useMemo(
    () => ({ completedTasks, completedDocuments: stored.completedDocuments }),
    [completedTasks, stored.completedDocuments],
  );

  const toggleTask = useCallback((id: string) => {
    const day = localDateKey(new Date());
    const current = gksProgressStore.refresh();
    const todays = resolveDailyTasks(current, day);
    const completing = !todays.includes(id);
    // Recorded for the history, but a tick is not practice: it keeps no streak.
    if (completing) trackLearning({ kind: "task", itemId: id, language: "general", skill: "application", passed: true });
    gksProgressStore.set({
      ...current,
      taskDate: day,
      completedTasks: completing ? [...new Set([...todays, id])] : todays.filter((taskId) => taskId !== id),
    });
  }, []);

  const toggleDocument = useCallback((id: string) => {
    const current = gksProgressStore.refresh();
    const completing = !current.completedDocuments.includes(id);
    if (completing) trackLearning({ kind: "document", itemId: id, language: "general", skill: "documents", passed: true });
    gksProgressStore.set({
      ...current,
      completedDocuments: completing
        ? [...new Set([...current.completedDocuments, id])]
        : current.completedDocuments.filter((documentId) => documentId !== id),
    });
  }, []);

  const { totals } = useLanguageTestProgress();
  const score = useMemo(() => {
    const stages = { stagesPassed: totals.en + totals.ko, stagesTotal: TESTS_PER_LANGUAGE * 2 };
    // Learning-only builds have no documents: readiness is the language path alone.
    if (isLearningQa) return readinessScore({ documentsDone: 0, documentsTotal: 0, ...stages }) * 2;
    return readinessScore({ documentsDone: progress.completedDocuments.length, documentsTotal: documents.length, ...stages });
  }, [progress.completedDocuments, totals]);

  return { progress, score, toggleTask, toggleDocument };
}
