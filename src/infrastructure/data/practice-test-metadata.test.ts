import { describe, expect, it } from "vitest";
import type { StageProgress } from "../../domain/models/language-test";
import { practiceTestTracks } from "./practice-tests";
import { advancedPracticeTracks } from "./advanced-practice-tests";
import { foundationStageMetadata, advancedStageMetadata } from "./practice-test-metadata";
import { getLanguagePathSummary, getLanguageStageMetadata, isLanguageStageMetadataUnlocked } from "./language-path-summary";
import { getLanguagePath, isLanguageStageUnlocked } from "./language-paths";

const passed: StageProgress = { attempts: 1, bestScore: 90, lastScore: 90, passed: true, lastCompletedAt: "2026-10-17T12:00:00Z" };
describe.each(["en", "ko"] as const)("lightweight progress catalogue for %s", (language) => {
  it("exactly matches every known foundation and C1 stage without carrying questions", () => {
    const full = [...practiceTestTracks[language].stages, ...advancedPracticeTracks[language].stages];
    const light = [...foundationStageMetadata[language], ...advancedStageMetadata[language]];
    expect(light).toHaveLength(150);
    expect(light).toEqual(full.map(({ id, skill, order, passScore }) => ({ id, skill, order, passScore })));
    for (const stage of light) expect(getLanguageStageMetadata(language, stage.id)).toEqual(stage);
    for (const id of ["__proto__", "constructor", `${language}-reading-23`, "invalid"]) expect(getLanguageStageMetadata(language, id)).toBeUndefined();
  });
  it("preserves every unlock, summary and promotion while completing all 150 stages", () => {
    const progress: Record<string, StageProgress> = {};
    const all = [...practiceTestTracks[language].stages, ...advancedPracticeTracks[language].stages];
    for (const current of all) {
      for (const stage of all) expect(isLanguageStageMetadataUnlocked(language, stage.id, progress))
        .toBe(isLanguageStageUnlocked(language, stage.id, progress));
      const summary = getLanguagePathSummary(language, progress);
      const original = getLanguagePath(language, progress);
      expect(summary.phase).toBe(original.phase);
      expect(summary.completed).toBe(original.completed);
      expect(summary.track.stages.map((stage) => stage.id)).toEqual(original.track.stages.map((stage) => stage.id));
      progress[current.id] = { ...passed };
    }
    expect(getLanguagePathSummary(language, progress)).toMatchObject({ phase: "advanced", completed: 18, complete: true });
    expect(getLanguagePathSummary(language, progress, "foundation")).toMatchObject({ phase: "foundation", completed: 132, complete: true });
  });
});
