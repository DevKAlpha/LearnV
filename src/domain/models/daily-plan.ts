import type { NextActionId } from "./gks-cycle";
import { dayNumber, localDateKey } from "./learning-journey";
import type { StageProgress, TestLanguage } from "./language-test";

/** Cards per day in the plan: 5–10 minutes of spaced review. */
export const REVIEW_TARGET = 10;

export type DailyPlanItem =
  | { kind: "review"; id: "review"; target: number; done: boolean; minutes: number }
  | { kind: "stage"; id: string; language: TestLanguage; stageId: string; done: boolean; minutes: number }
  | { kind: "gks"; id: string; action: NextActionId; done: boolean; minutes: number };

export type DailyPlanInput = {
  /** Local day, YYYY-MM-DD. */
  today: string;
  /** Cards waiting now (due + new allowed today) and cards already reviewed today. */
  review: { pending: number; reviewedToday: number };
  progress: Record<TestLanguage, Record<string, StageProgress>>;
  /** The next stage to open in each language; missing when a path is complete. */
  nextStage: Partial<Record<TestLanguage, string>>;
  /** Passed stages per language: the plan favours the language that is behind. */
  passed: Record<TestLanguage, number>;
  /** The GKS action for the current cycle phase; null hides it (learning-only builds). */
  action: NextActionId | null;
  /** Manual ticks made today (only the GKS step has one: it cannot be measured). */
  ticked: readonly string[];
};

export const gksPlanId = (action: NextActionId) => `gks-${action}`;

/** The stage attempted most recently today, if any. */
function stageAttemptedToday(progress: DailyPlanInput["progress"], today: string) {
  let latest: { language: TestLanguage; stageId: string; at: string } | null = null;
  for (const language of ["en", "ko"] as const) {
    for (const [stageId, result] of Object.entries(progress[language])) {
      if (!result.lastCompletedAt || localDateKey(result.lastCompletedAt) !== today) continue;
      if (!latest || result.lastCompletedAt > latest.at) latest = { language, stageId, at: result.lastCompletedAt };
    }
  }
  return latest;
}

/**
 * Today's plan, rebuilt from evidence every time it is shown, so it resets at local midnight
 * and cannot be faked by ticking boxes:
 * 1. spaced review: done when today's reviews reach the target (or the queue is empty);
 * 2. one stage: done when a stage attempt is saved today. Until then the plan offers the next
 *    stage of the language that is behind (ties alternate by day);
 * 3. one GKS step that fits the cycle phase: the only item ticked by hand.
 */
export function buildDailyPlan(input: DailyPlanInput): DailyPlanItem[] {
  const items: DailyPlanItem[] = [];
  const target = Math.min(REVIEW_TARGET, input.review.reviewedToday + input.review.pending);
  if (target > 0) {
    items.push({ kind: "review", id: "review", target, done: input.review.reviewedToday >= target, minutes: Math.max(3, Math.ceil(target * 0.6)) });
  }

  const attempted = stageAttemptedToday(input.progress, input.today);
  if (attempted) {
    items.push({ kind: "stage", id: `stage-${attempted.stageId}`, language: attempted.language, stageId: attempted.stageId, done: true, minutes: 15 });
  } else {
    const even = dayNumber(input.today) % 2 === 0;
    const preferred: TestLanguage = input.passed.en === input.passed.ko ? (even ? "ko" : "en") : input.passed.en < input.passed.ko ? "en" : "ko";
    const language = input.nextStage[preferred] ? preferred : preferred === "en" ? "ko" : "en";
    const stageId = input.nextStage[language];
    if (stageId) items.push({ kind: "stage", id: `stage-${stageId}`, language, stageId, done: false, minutes: 15 });
  }

  if (input.action) {
    const id = gksPlanId(input.action);
    items.push({ kind: "gks", id, action: input.action, done: input.ticked.includes(id), minutes: 20 });
  }
  return items;
}

export function planProgress(items: readonly DailyPlanItem[]) {
  return { done: items.filter((item) => item.done).length, total: items.length };
}
