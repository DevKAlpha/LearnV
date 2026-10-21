import { isStageUnlocked, type StageProgress, type TestLanguage } from "../../domain/models/language-test";
import { hasCompletedTrack, type LanguagePathPhase } from "../../domain/models/language-path";
import { foundationStageMetadata, advancedStageMetadata } from "./practice-test-metadata";
export { ADVANCED_TESTS_PER_SKILL, advancedStageMetadata } from "./practice-test-metadata";

const stagesById = {
  en: new Map([...foundationStageMetadata.en, ...advancedStageMetadata.en].map((stage) => [stage.id, stage])),
  ko: new Map([...foundationStageMetadata.ko, ...advancedStageMetadata.ko].map((stage) => [stage.id, stage])),
};

/** Entry pages need IDs/counters only. Full advanced texts stay in the lazy test-page graph. */
export function getLanguagePathSummary(language: TestLanguage, progress: Record<string, StageProgress>, requested?: LanguagePathPhase) {
  const foundation = { stages: foundationStageMetadata[language] };
  const advancedUnlocked = hasCompletedTrack(foundation, progress);
  const phase: LanguagePathPhase = advancedUnlocked && requested !== "foundation" ? "advanced" : "foundation";
  const stages = phase === "advanced" ? advancedStageMetadata[language] : foundation.stages;
  const completed = stages.filter((stage) => progress[stage.id]?.passed === true).length;
  return { phase, advancedUnlocked, track: { stages }, completed, complete: completed === stages.length };
}

export function getLanguageStageMetadata(language: TestLanguage, stageId: string) {
  return stagesById[language].get(stageId);
}

export function isLanguageStageMetadataUnlocked(language: TestLanguage, stageId: string, progress: Record<string, StageProgress>) {
  const foundation = { stages: foundationStageMetadata[language] };
  const baseIndex = foundation.stages.findIndex((stage) => stage.id === stageId);
  if (baseIndex >= 0) return isStageUnlocked(foundation.stages, baseIndex, progress);
  if (!hasCompletedTrack(foundation, progress)) return false;
  const stage = advancedStageMetadata[language].find((candidate) => candidate.id === stageId);
  if (!stage) return false;
  return advancedStageMetadata[language]
    .filter((candidate) => candidate.skill === stage.skill && candidate.order < stage.order)
    .every((previous) => progress[previous.id]?.passed === true);
}
