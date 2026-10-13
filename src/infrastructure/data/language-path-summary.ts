import { isStageUnlocked, type StageProgress, type TestLanguage, type TestSkill } from "../../domain/models/language-test";
import { hasCompletedTrack, type LanguagePathPhase } from "../../domain/models/language-path";
import { practiceTestTracks } from "./practice-tests";

export const ADVANCED_TESTS_PER_SKILL = 3;
const skills: TestSkill[] = ["reading", "grammar", "vocabulary", "writing", "listening", "pronunciation"];
export const advancedStageMetadata = Object.fromEntries((["en", "ko"] as const).map((language) => [language,
  skills.flatMap((skill) => Array.from({ length: ADVANCED_TESTS_PER_SKILL }, (_, index) => ({
    id: `${language}-c1-${skill}-${String(index + 1).padStart(2, "0")}`, skill, order: index + 1, passScore: 80,
  }))),
])) as Record<TestLanguage, Array<{ id: string; skill: TestSkill; order: number; passScore: number }>>;

/** Entry pages need IDs/counters only. Full advanced texts stay in the lazy test-page graph. */
export function getLanguagePathSummary(language: TestLanguage, progress: Record<string, StageProgress>, requested?: LanguagePathPhase) {
  const foundation = practiceTestTracks[language];
  const advancedUnlocked = hasCompletedTrack(foundation, progress);
  const phase: LanguagePathPhase = advancedUnlocked && requested !== "foundation" ? "advanced" : "foundation";
  const stages = phase === "advanced" ? advancedStageMetadata[language] : foundation.stages;
  const completed = stages.filter((stage) => progress[stage.id]?.passed === true).length;
  return { phase, advancedUnlocked, track: { stages }, completed, complete: completed === stages.length };
}

export function getLanguageStageMetadata(language: TestLanguage, stageId: string) {
  return practiceTestTracks[language].stages.find((stage) => stage.id === stageId)
    ?? advancedStageMetadata[language].find((stage) => stage.id === stageId);
}

export function isLanguageStageMetadataUnlocked(language: TestLanguage, stageId: string, progress: Record<string, StageProgress>) {
  const foundation = practiceTestTracks[language];
  const baseIndex = foundation.stages.findIndex((stage) => stage.id === stageId);
  if (baseIndex >= 0) return isStageUnlocked(foundation.stages, baseIndex, progress);
  if (!hasCompletedTrack(foundation, progress)) return false;
  const stage = advancedStageMetadata[language].find((candidate) => candidate.id === stageId);
  if (!stage) return false;
  return advancedStageMetadata[language]
    .filter((candidate) => candidate.skill === stage.skill && candidate.order < stage.order)
    .every((previous) => progress[previous.id]?.passed === true);
}
