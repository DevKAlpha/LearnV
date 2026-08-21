import { useCallback, useMemo, useState } from "react";
import {
  emptyTestProgress,
  type StageProgress,
  type TestLanguage,
  type TestProgressState,
} from "../../domain/models/language-test";
import { practiceTestTracks } from "../../infrastructure/data/practice-tests";

const STORAGE_KEY = "learnv-language-tests-v1";

function readProgress(): TestProgressState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return emptyTestProgress;
    const parsed = JSON.parse(stored) as Partial<TestProgressState>;
    return { en: parsed.en ?? {}, ko: parsed.ko ?? {} };
  } catch {
    return emptyTestProgress;
  }
}

export function useLanguageTestProgress() {
  const [progress, setProgress] = useState<TestProgressState>(readProgress);

  const recordAttempt = useCallback((language: TestLanguage, stageId: string, score: number) => {
    setProgress((current) => {
      const previous = current[language][stageId];
      const nextStage: StageProgress = {
        attempts: (previous?.attempts ?? 0) + 1,
        bestScore: Math.max(previous?.bestScore ?? 0, score),
        lastScore: score,
        passed: Boolean(previous?.passed) || score >= 70,
        lastCompletedAt: new Date().toISOString(),
      };
      const next = {
        ...current,
        [language]: { ...current[language], [stageId]: nextStage },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const totals = useMemo(() => ({
    en: practiceTestTracks.en.stages.filter((stage) => progress.en[stage.id]?.passed).length,
    ko: practiceTestTracks.ko.stages.filter((stage) => progress.ko[stage.id]?.passed).length,
  }), [progress]);

  return { progress, totals, recordAttempt };
}
