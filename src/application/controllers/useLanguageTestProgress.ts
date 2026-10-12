import { scopedStorageKey } from "@/infrastructure/config/app-scope";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  emptyTestProgress,
  type TestLanguage,
  type TestProgressState,
} from "../../domain/models/language-test";
import { practiceTestTracks } from "../../infrastructure/data/practice-tests";
import { getLanguageStageMetadata as getLanguageStage, isLanguageStageMetadataUnlocked as isLanguageStageUnlocked } from "../../infrastructure/data/language-path-summary";
import { normalizeTestProgress, saveStageAttempt } from "../../domain/models/language-path";
import { recordLearningError, resolveLearningDiagnosticArea } from "../../infrastructure/data/learning-error-log";
import { trackLearning } from "./learningJourneyEvents";

const STORAGE_KEY = scopedStorageKey("learnv-language-tests-v1");

function readProgress(): TestProgressState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return emptyTestProgress;
    const parsed = JSON.parse(stored) as Partial<TestProgressState>;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid language progress shape");
    return normalizeTestProgress(parsed);
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
  const mounted = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      recordLearningError({
        area: resolveLearningDiagnosticArea(window.location.pathname) ?? "study-overview",
        code: "language-progress-write-failed",
        error,
      });
    }
    if (mounted.current) window.dispatchEvent(new CustomEvent("learnv:progress"));
    else mounted.current = true;
  }, [progress]);

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
    if (!Number.isFinite(score) || score < 0 || score > 100 || !isLanguageStageUnlocked(language, stageId, progress[language])) {
      recordLearningError({ area: language === "ko" ? "korean-learning" : "english-learning", severity: "warning", code: "invalid-or-locked-test-attempt", context: { stageId, score } });
      return;
    }
    const verifiedPass = passed && score >= stage.passScore;
    trackLearning({ kind: "practice", itemId: stageId, language, skill: stage.skill, score, passed: verifiedPass });
    setProgress((current) => saveStageAttempt(current, language, stage, score, verifiedPass, new Date().toISOString()));
  }, [progress]);

  const totals = useMemo(() => ({
    en: practiceTestTracks.en.stages.filter((stage) => progress.en[stage.id]?.passed).length,
    ko: practiceTestTracks.ko.stages.filter((stage) => progress.ko[stage.id]?.passed).length,
  }), [progress]);

  return { progress, totals, recordAttempt };
}
