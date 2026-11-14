import { useMemo } from "react";
import { measureLevel } from "@/domain/models/measured-level";
import { placementStore } from "@/infrastructure/data/placement-store";
import { foundationStageMetadata, TESTS_PER_SKILL } from "@/infrastructure/data/practice-test-metadata";
import { useLanguageTestProgress } from "./useLanguageTestProgress";
import { useLocalStore } from "./useLocalStore";

/** Orientative levels from stages passed and the level test, per language. */
export function useMeasuredLevels() {
  const { progress } = useLanguageTestProgress();
  const placement = useLocalStore(placementStore);
  return useMemo(() => ({
    en: measureLevel(foundationStageMetadata.en, progress.en, placement.en, TESTS_PER_SKILL),
    ko: measureLevel(foundationStageMetadata.ko, progress.ko, placement.ko, TESTS_PER_SKILL),
  }), [progress, placement]);
}
