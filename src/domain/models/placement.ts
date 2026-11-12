import type { TestLanguage, TestSkill } from "./language-test";

/**
 * Level test. It only *unlocks* stages, it never marks them as passed: progress, streaks and
 * readiness still need real attempts. Production skills (writing, listening, speaking) are
 * not placed, because a multiple-choice check cannot verify production.
 */
export const PLACEMENT_SKILLS = ["reading", "grammar", "vocabulary"] as const;
export type PlacementSkill = typeof PLACEMENT_SKILLS[number];
/** Skill-path indices checked, easiest first. Each checkpoint asks this stage and the next. */
export const PLACEMENT_CHECKPOINTS = [2, 5, 9, 13, 17] as const;

/** Per language and skill: how many stages from the start of the skill path are unlocked. */
export type PlacedSkills = Partial<Record<TestSkill, number>>;
export type PlacementState = Record<TestLanguage, PlacedSkills>;

export const emptyPlacement: PlacementState = { en: {}, ko: {} };

function normalizeSkills(raw: unknown): PlacedSkills {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return {};
  const result: PlacedSkills = {};
  for (const skill of PLACEMENT_SKILLS) {
    const value = (raw as Record<string, unknown>)[skill];
    if (typeof value === "number" && Number.isInteger(value) && value > 0 && value <= PLACEMENT_CHECKPOINTS.at(-1)! + 1) result[skill] = value;
  }
  return result;
}

export function normalizePlacement(raw: unknown): PlacementState {
  const record = typeof raw === "object" && raw !== null && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
  return { en: normalizeSkills(record.en), ko: normalizeSkills(record.ko) };
}

/**
 * Result of one skill: checkpoints are passed in order (both questions right) until the
 * first miss. Passing checkpoint `c` unlocks the stages up to and including index `c`.
 */
export function placedStages(checkpointsPassed: readonly boolean[]): number {
  let placed = 0;
  for (const [index, passed] of checkpointsPassed.entries()) {
    if (!passed || index >= PLACEMENT_CHECKPOINTS.length) break;
    placed = PLACEMENT_CHECKPOINTS[index] + 1;
  }
  return placed;
}

/** A new test never takes away what an earlier one unlocked. */
export function applyPlacement(state: PlacementState, language: TestLanguage, results: Partial<Record<PlacementSkill, number>>): PlacementState {
  const current = state[language];
  const next: PlacedSkills = { ...current };
  for (const skill of PLACEMENT_SKILLS) {
    const value = results[skill] ?? 0;
    if (value > (current[skill] ?? 0)) next[skill] = value;
  }
  return { ...state, [language]: next };
}
