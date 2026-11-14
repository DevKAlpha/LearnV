import { describe, expect, it } from "vitest";
import { buildDailyPlan, planProgress, REVIEW_TARGET, type DailyPlanInput } from "./daily-plan";

const base: DailyPlanInput = {
  today: "2026-11-14",
  review: { pending: 25, reviewedToday: 0 },
  progress: { en: {}, ko: {} },
  nextStage: { en: "en-reading-1", ko: "ko-reading-1" },
  passed: { en: 0, ko: 0 },
  action: "language-exam",
  ticked: [],
};
const attempt = (lastCompletedAt: string) => ({ attempts: 1, bestScore: 60, lastScore: 60, passed: false, lastCompletedAt });

describe("daily plan", () => {
  it("builds review, one stage and the GKS step", () => {
    const plan = buildDailyPlan(base);
    expect(plan.map((item) => item.kind)).toEqual(["review", "stage", "gks"]);
    expect(plan[0]).toMatchObject({ target: REVIEW_TARGET, done: false });
    expect(plan[2]).toMatchObject({ id: "gks-language-exam", done: false });
    expect(planProgress(plan)).toEqual({ done: 0, total: 3 });
  });

  it("marks the review done from real reviews, capped by what is left", () => {
    expect(buildDailyPlan({ ...base, review: { pending: 15, reviewedToday: 10 } })[0]).toMatchObject({ done: true, target: 10 });
    expect(buildDailyPlan({ ...base, review: { pending: 0, reviewedToday: 4 } })[0]).toMatchObject({ done: true, target: 4 });
    expect(buildDailyPlan({ ...base, review: { pending: 3, reviewedToday: 0 } })[0]).toMatchObject({ done: false, target: 3 });
    expect(buildDailyPlan({ ...base, review: { pending: 0, reviewedToday: 0 } }).some((item) => item.kind === "review")).toBe(false);
  });

  it("offers the language that is behind and alternates on a tie", () => {
    expect(buildDailyPlan({ ...base, passed: { en: 4, ko: 1 } })[1]).toMatchObject({ language: "ko", stageId: "ko-reading-1" });
    expect(buildDailyPlan({ ...base, passed: { en: 1, ko: 4 } })[1]).toMatchObject({ language: "en" });
    const day1 = buildDailyPlan({ ...base, today: "2026-11-14" })[1];
    const day2 = buildDailyPlan({ ...base, today: "2026-11-15" })[1];
    expect(day1.kind === "stage" && day2.kind === "stage" && day1.language !== day2.language).toBe(true);
  });

  it("falls back to the other language when one path is complete", () => {
    expect(buildDailyPlan({ ...base, passed: { en: 0, ko: 9 }, nextStage: { ko: "ko-writing-4" } })[1]).toMatchObject({ language: "ko", stageId: "ko-writing-4" });
    expect(buildDailyPlan({ ...base, nextStage: {} }).some((item) => item.kind === "stage")).toBe(false);
  });

  it("keeps the stage a learner attempted today, done, even after it was passed", () => {
    const plan = buildDailyPlan({
      ...base,
      progress: { en: { "en-old": attempt("2026-11-10T09:00:00"), "en-grammar-2": attempt("2026-11-14T08:00:00") }, ko: { "ko-listening-1": attempt("2026-11-14T09:30:00") } },
    });
    expect(plan[1]).toMatchObject({ kind: "stage", language: "ko", stageId: "ko-listening-1", done: true });
  });

  it("only the GKS step can be ticked, and it hides in learning-only builds", () => {
    expect(buildDailyPlan({ ...base, ticked: ["gks-language-exam", "review"] }).map((item) => item.done)).toEqual([false, false, true]);
    expect(buildDailyPlan({ ...base, action: null }).some((item) => item.kind === "gks")).toBe(false);
  });
});
