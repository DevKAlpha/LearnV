import { describe, expect, it } from "vitest";
import { practiceTestTracks } from "@/infrastructure/data/practice-tests";
import { advancedPracticeTracks } from "@/infrastructure/data/advanced-practice-tests";
import type { StageProgress } from "@/domain/models/language-test";
import { getLanguagePathHref, getPathPlacement, getPathSkill, getPathWindow, pathSkillOrder } from "./learning-path-layout";

const passed: StageProgress = { attempts: 1, bestScore: 100, lastScore: 100, passed: true, lastCompletedAt: "2026-10-15T12:00:00Z" };

describe.each(["en", "ko"] as const)("story 55 route windows for %s", (language) => {
  for (const skill of pathSkillOrder) {
    it(`keeps the next ${skill} step visible, numbered in order, from first attempt to completion`, () => {
      const stages = practiceTestTracks[language].stages.filter((stage) => stage.skill === skill);
      for (let completed = 0; completed <= stages.length; completed++) {
        const progress = Object.fromEntries(stages.slice(0, completed).map((stage) => [stage.id, passed]));
        const before = JSON.stringify(progress);
        const compact = getPathWindow(stages, progress, false);
        const full = getPathWindow(stages, progress, true);
        expect(compact.visibleStages).toHaveLength(3);
        expect(compact.visibleStages).toContain(stages[Math.min(completed, stages.length - 1)]);
        expect(compact.visibleStages).toEqual(stages.slice(compact.start, compact.start + 3));
        expect(full.visibleStages.map((stage) => stage.id)).toEqual(stages.map((stage) => stage.id));
        expect(compact.completed).toBe(completed);
        expect(JSON.stringify(progress)).toBe(before);
      }
    });
    it(`never hides the third advanced ${skill} activity`, () => {
      const stages = advancedPracticeTracks[language].stages.filter((stage) => stage.skill === skill);
      expect(stages).toHaveLength(3);
      for (let completed = 0; completed <= stages.length; completed++) {
        const progress = Object.fromEntries(stages.slice(0, completed).map((stage) => [stage.id, passed]));
        expect(getPathWindow(stages, progress, false).visibleStages).toEqual(stages);
      }
    });
  }
});

it("fits every node on both layouts and places art in the free side, independent of its visible row", () => {
  const signatures = new Set<string>();
  for (const skill of pathSkillOrder) {
    const placements = Array.from({ length: 22 }, (_, index) => getPathPlacement(skill, index));
    signatures.add(placements.map((position) => position.x).join(","));
    for (const position of placements) {
      expect(position.x - 18).toBeGreaterThanOrEqual(0);
      expect(position.x + 18).toBeLessThanOrEqual(100);
      expect(position.mobileX - 34).toBeGreaterThanOrEqual(0);
      expect(position.mobileX + 34).toBeLessThanOrEqual(100);
      if (position.x !== 50) expect(position.decorationSide).toBe(position.x < 50 ? "right" : "left");
    }
  }
  expect(signatures.size).toBe(pathSkillOrder.length);
});

it("retains the selected skill and archive when returning from a practice", () => {
  for (const language of ["en", "ko"] as const) {
    for (const skill of pathSkillOrder) {
      const path = new URL(getLanguagePathHref(language, skill, "foundation"), "https://learnv.test");
      expect(path.pathname).toBe(`/tests/${language}`);
      expect(path.searchParams.get("phase")).toBe("foundation");
      expect(getPathSkill(path.searchParams.get("skill"))).toBe(skill);
      expect(getLanguagePathHref(language, skill, "advanced")).not.toContain("phase=foundation");
    }
  }
  expect(getPathSkill("unknown")).toBe("reading");
  expect(getPathSkill(null)).toBe("reading");
});
