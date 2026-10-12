import type { StageProgress, TestLanguage } from "../../domain/models/language-test";
import { canOpenLanguageStage, nextLanguageStage, resolveLanguagePath, type LanguagePathPhase } from "../../domain/models/language-path";
import { practiceTestTracks } from "./practice-tests";
import { advancedPracticeTracks } from "./advanced-practice-tests";

export function getLanguagePath(language: TestLanguage, progress: Record<string, StageProgress>, requested?: LanguagePathPhase) {
  return resolveLanguagePath(practiceTestTracks[language], advancedPracticeTracks[language], progress, requested);
}

export function getLanguageStage(language: TestLanguage, stageId: string) {
  return [...practiceTestTracks[language].stages, ...advancedPracticeTracks[language].stages].find((stage) => stage.id === stageId);
}

export function isLanguageStageUnlocked(language: TestLanguage, stageId: string, progress: Record<string, StageProgress>) {
  return canOpenLanguageStage(practiceTestTracks[language], advancedPracticeTracks[language], stageId, progress);
}

export function getNextLanguageStage(language: TestLanguage, stageId: string, progress: Record<string, StageProgress>) {
  const stage = getLanguageStage(language, stageId);
  return stage ? nextLanguageStage(practiceTestTracks[language], advancedPracticeTracks[language], stage, progress) : undefined;
}
