import { scopedStorageKey } from "@/infrastructure/config/app-scope";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  emptyTestProgress,
  type TestLanguage,
  type TestProgressState,
} from "../../domain/models/language-test";
import { foundationStageMetadata } from "../../infrastructure/data/practice-test-metadata";
import { getLanguageStageMetadata as getLanguageStage, isLanguageStageMetadataUnlocked as isLanguageStageUnlocked } from "../../infrastructure/data/language-path-summary";
import { mergeTestProgress, normalizeTestProgress, saveStageAttempt } from "../../domain/models/language-path";
import { recordLearningError, resolveLearningDiagnosticArea } from "../../infrastructure/data/learning-error-log";
import { trackLearning } from "./learningJourneyEvents";

const STORAGE_KEY = scopedStorageKey("learnv-language-tests-v1");

function readProgress(): TestProgressState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return emptyTestProgress;
    const parsed = JSON.parse(stored) as Partial<TestProgressState>;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid language progress shape");
    return normalizeTestProgress(parsed, (language, id) => getLanguageStage(language, id)?.passScore);
  } catch (error) {
    recordLearningError({
      area: resolveLearningDiagnosticArea(window.location.pathname) ?? "study-overview",
      code: "language-progress-read-failed",
      error,
    });
    return emptyTestProgress;
  }
}

export function useLanguageTestProgress() {
  const [progress, setProgress] = useState<TestProgressState>(readProgress);
  const progressRef = useRef(progress);

  useEffect(() => {
    const apply = (next: TestProgressState) => { progressRef.current = next; setProgress(next); };
    const stored = (event: StorageEvent) => { if (event.key === STORAGE_KEY || event.key === null) apply(readProgress()); };
    const local = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail?.storageKey === STORAGE_KEY) apply(normalizeTestProgress(detail.progress, (language, id) => getLanguageStage(language, id)?.passScore));
    };
    window.addEventListener("storage", stored); window.addEventListener("learnv:progress", local);
    // Reading a view never writes an old snapshot back to storage.
    apply(readProgress());
    return () => { window.removeEventListener("storage", stored); window.removeEventListener("learnv:progress", local); };
  }, []);

  const recordAttempt = useCallback((language: TestLanguage, stageId: string, score: number, passed: boolean) => {
    const stage = getLanguageStage(language, stageId);
    if (!stage) {
      recordLearningError({
        area: language === "ko" ? "korean-learning" : "english-learning",
        severity: "warning",
        code: "test-stage-skill-not-found",
        context: { stageId, score, passed },
      });
      return;
    }
    const current = mergeTestProgress(progressRef.current, readProgress());
    if (!Number.isFinite(score) || score < 0 || score > 100 || !isLanguageStageUnlocked(language, stageId, current[language])) {
      recordLearningError({ area: language === "ko" ? "korean-learning" : "english-learning", severity: "warning", code: "invalid-or-locked-test-attempt", context: { stageId, score } });
      return;
    }
    const verifiedPass = passed && score >= stage.passScore;
    const next = saveStageAttempt(current, language, stage, score, verifiedPass, new Date().toISOString());
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch (error) {
      recordLearningError({ area: resolveLearningDiagnosticArea(window.location.pathname) ?? "study-overview", code: "language-progress-write-failed", error });
    }
    progressRef.current = next; setProgress(next);
    window.dispatchEvent(new CustomEvent("learnv:progress", { detail: { storageKey: STORAGE_KEY, progress: next } }));
    trackLearning({ kind: "practice", itemId: stageId, language, skill: stage.skill, score, passed: verifiedPass });
  }, []);

  const totals = useMemo(() => ({
    en: foundationStageMetadata.en.filter((stage) => progress.en[stage.id]?.passed).length,
    ko: foundationStageMetadata.ko.filter((stage) => progress.ko[stage.id]?.passed).length,
  }), [progress]);

  return { progress, totals, recordAttempt };
}
