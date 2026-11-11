import { scopedStorageKey } from "@/infrastructure/config/app-scope";
import { useCallback, useEffect, useMemo, useState } from "react";
import { dailyTasks, documents } from "../../infrastructure/data/gks-2026";
import { trackLearning } from "./learningJourneyEvents";
import { isLearningQa } from "@/application/qa/qa-learning-scope";
import { localDateKey } from "@/domain/models/learning-journey";
import { normalizeGksProgress, readinessScore, resolveDailyTasks, type StoredGksProgress } from "@/domain/models/home-plan";
import { TESTS_PER_LANGUAGE } from "@/infrastructure/data/practice-test-metadata";
import { useLanguageTestProgress } from "./useLanguageTestProgress";

const STORAGE_KEY = scopedStorageKey("learnv-progress-v1");
const LEGACY_STORAGE_KEY = scopedStorageKey("gks-path-progress-v1");

const taskIds = dailyTasks.map((task) => task.id);
const documentIds = documents.map((document) => document.id);

function readProgress(): StoredGksProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    return normalizeGksProgress(stored ? JSON.parse(stored) : null, taskIds, documentIds);
  } catch {
    return normalizeGksProgress(null, taskIds, documentIds);
  }
}

/** Re-renders when the local day changes (midnight, or when a sleeping tab wakes up). */
function useLocalToday() {
  const [today, setToday] = useState(() => localDateKey(new Date()));
  useEffect(() => {
    const refresh = () => setToday(localDateKey(new Date()));
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5).getTime() - now.getTime();
    const timer = window.setTimeout(refresh, nextMidnight);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [today]);
  return today;
}

export function useGksProgress() {
  const [stored, setStored] = useState<StoredGksProgress>(readProgress);
  const today = useLocalToday();

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stored)); } catch { /* Progress remains available for this session. */ }
  }, [stored]);

  // Cross-tab: another tab may tick a task or document.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setStored(readProgress());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const completedTasks = useMemo(() => resolveDailyTasks(stored, today), [stored, today]);
  const progress = useMemo(
    () => ({ completedTasks, completedDocuments: stored.completedDocuments }),
    [completedTasks, stored.completedDocuments],
  );

  const toggleTask = useCallback((id: string) => {
    const day = localDateKey(new Date());
    const completing = !resolveDailyTasks(stored, day).includes(id);
    if (completing) {
      const task = dailyTasks.find((item) => item.id === id);
      trackLearning({
        kind: "task",
        itemId: id,
        language: task?.category === "topik" ? "ko" : task?.category === "english" ? "en" : "general",
        skill: task?.category === "application" ? "application" : task?.category === "english" ? "writing" : "reading",
        passed: true,
      });
    }
    setStored((current) => {
      const todays = resolveDailyTasks(current, day);
      return {
        ...current,
        taskDate: day,
        completedTasks: completing ? [...new Set([...todays, id])] : todays.filter((taskId) => taskId !== id),
      };
    });
  }, [stored]);

  const toggleDocument = useCallback((id: string) => {
    const completing = !stored.completedDocuments.includes(id);
    if (completing) trackLearning({ kind: "document", itemId: id, language: "general", skill: "documents", passed: true });
    setStored((current) => ({
      ...current,
      completedDocuments: completing
        ? [...new Set([...current.completedDocuments, id])]
        : current.completedDocuments.filter((documentId) => documentId !== id),
    }));
  }, [stored]);

  const { totals } = useLanguageTestProgress();
  const score = useMemo(() => {
    if (isLearningQa) return Math.round((completedTasks.length / dailyTasks.length) * 100);
    return readinessScore({
      documentsDone: progress.completedDocuments.length,
      documentsTotal: documents.length,
      stagesPassed: totals.en + totals.ko,
      stagesTotal: TESTS_PER_LANGUAGE * 2,
      todayDone: completedTasks.length,
      todayTotal: dailyTasks.length,
    });
  }, [completedTasks, progress.completedDocuments, totals]);

  return { progress, score, toggleTask, toggleDocument };
}
