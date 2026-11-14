import type { StageProgress, TestSkill } from "./language-test";
import type { PlacedSkills } from "./placement";

/**
 * Orientative level from what the learner actually did in LearnV: the furthest stage passed
 * (or unlocked by the level test) in each skill, averaged over the six skills. It replaces
 * the old "average best score", which rewarded retaking easy stages.
 */
export type LevelBand = "none" | "band1" | "band2" | "band3" | "band4";
export type StageRef = { id: string; skill: TestSkill; order: number };

export type MeasuredLevel = {
  band: LevelBand;
  /** Average furthest stage across skills (0–stagesPerSkill). */
  reach: number;
  perSkill: Partial<Record<TestSkill, number>>;
  passed: number;
};

export function measureLevel(
  stages: readonly StageRef[],
  progress: Readonly<Record<string, StageProgress>>,
  placed: PlacedSkills = {},
  stagesPerSkill = 22,
): MeasuredLevel {
  const skills = [...new Set(stages.map((stage) => stage.skill))];
  const perSkill: Partial<Record<TestSkill, number>> = {};
  let passed = 0;
  for (const skill of skills) {
    const passedOrders = stages.filter((stage) => stage.skill === skill && progress[stage.id]?.passed).map((stage) => stage.order);
    passed += passedOrders.length;
    perSkill[skill] = Math.max(0, ...passedOrders, placed[skill] ?? 0);
  }
  const values = Object.values(perSkill);
  const reach = values.length ? values.reduce((total, value) => total + (value ?? 0), 0) / values.length : 0;
  const share = reach / stagesPerSkill;
  const band: LevelBand = reach === 0 ? "none" : share < 1 / 3 ? "band1" : share < 2 / 3 ? "band2" : share < 1 ? "band3" : "band4";
  return { band, reach: Math.round(reach * 10) / 10, perSkill, passed };
}
