import { scopedStorageKey } from "@/infrastructure/config/app-scope";
import { useCallback, useMemo } from "react";
import {
  emptyTestProgress,
  type TestLanguage,
  type TestProgressState,
} from "../../domain/models/language-test";
import { foundationStageMetadata } from "../../infrastructure/data/practice-test-metadata";
import { getLanguageStageMetadata as getLanguageStage, isLanguageStageMetadataUnlocked as isLanguageStageUnlocked } from "../../infrastructure/data/language-path-summary";
import { mergeTestProgress, normalizeTestProgress, saveStageAttempt } from "../../domain/models/language-path";
import { recordLearningError, resolveLearningDiagnosticArea } from "../../infrastructure/data/learning-error-log";
import { createLocalStore } from "@/infrastructure/storage/local-store";
import { trackLearning } from "./learningJourneyEvents";
import { useLocalStore } from "./useLocalStore";

const STORAGE_KEY = scopedStorageKey("learnv-language-tests-v1");

function diagnosticArea() {
  return resolveLearningDiagnosticArea(window.location.pathname) ?? "study-overview";
}

/** One shared store for every screen that shows language progress (favicon, paths, profile…). */
export const languageTestProgressStore = createLocalStore<TestProgressState>({
  key: STORAGE_KEY,
  fallback: emptyTestProgress,
  parse: (raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Invalid language progress shape");
    return normalizeTestProgress(raw, (language, id) => getLanguageStage(language, id)?.passScore);
  },
  onError: (code, error) => recordLearningError({ area: diagnosticArea(), code: `language-progress-${code}`, error }),
});

export function useLanguageTestProgress() {
  const progress = useLocalStore(languageTestProgressStore);

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
    // Merge with the latest stored value so a result saved in another tab is never lost.
    const current = mergeTestProgress(languageTestProgressStore.get(), languageTestProgressStore.refresh());
    if (!Number.isFinite(score) || score < 0 || score > 100 || !isLanguageStageUnlocked(language, stageId, current[language])) {
      recordLearningError({ area: language === "ko" ? "korean-learning" : "english-learning", severity: "warning", code: "invalid-or-locked-test-attempt", context: { stageId, score } });
      return;
    }
    const verifiedPass = passed && score >= stage.passScore;
    languageTestProgressStore.set(saveStageAttempt(current, language, stage, score, verifiedPass, new Date().toISOString()));
    trackLearning({ kind: "practice", itemId: stageId, language, skill: stage.skill, score, passed: verifiedPass });
  }, []);

  const totals = useMemo(() => ({
    en: foundationStageMetadata.en.filter((stage) => progress.en[stage.id]?.passed).length,
    ko: foundationStageMetadata.ko.filter((stage) => progress.ko[stage.id]?.passed).length,
  }), [progress]);

  return { progress, totals, recordAttempt };
}
