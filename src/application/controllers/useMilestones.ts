import { useMemo } from "react";
import { hasCompletedTrack } from "@/domain/models/language-path";
import { collectStickers, reachedVolumes, type MilestoneInput } from "@/domain/models/milestones";
import { foundationStageMetadata } from "@/infrastructure/data/practice-test-metadata";
import { stickerStore } from "@/infrastructure/data/sticker-store";
import { useLanguageTestProgress } from "./useLanguageTestProgress";
import { useLocalStore } from "./useLocalStore";
import { useMeasuredLevels } from "./useMeasuredLevels";

/** What the learner has achieved, from saved practice: the input for volumes and stickers. */
export function useMilestoneInput(longestStreak: number): MilestoneInput {
  const { progress } = useLanguageTestProgress();
  const levels = useMeasuredLevels();
  return useMemo(() => {
    const passed = new Set<string>();
    for (const track of [progress.en, progress.ko]) {
      for (const [id, stage] of Object.entries(track)) if (stage?.passed) passed.add(id);
    }
    return {
      passed,
      koreanBand: levels.ko.band,
      englishAdvancedUnlocked: hasCompletedTrack({ stages: foundationStageMetadata.en }, progress.en),
      longestStreak,
    };
  }, [progress, levels.ko.band, longestStreak]);
}

export function useVolumes(longestStreak: number) {
  const input = useMilestoneInput(longestStreak);
  return useMemo(() => reachedVolumes(input), [input]);
}

export function useStickers(longestStreak: number) {
  const input = useMilestoneInput(longestStreak);
  const stored = useLocalStore(stickerStore);
  return useMemo(() => collectStickers(input, stored), [input, stored]);
}
