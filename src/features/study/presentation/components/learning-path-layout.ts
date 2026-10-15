import type { StageProgress, TestLanguage, TestSkill, TestStage } from "@/domain/models/language-test";
import type { LanguagePathPhase } from "@/domain/models/language-path";

export const pathSkillOrder: TestSkill[] = ["reading", "grammar", "vocabulary", "writing", "listening", "pronunciation"];

const silhouettes: Record<TestSkill, readonly number[]> = {
  reading: [30, 68, 50, 72, 32, 50],
  grammar: [70, 50, 30, 50, 70, 50],
  vocabulary: [50, 28, 50, 72, 50, 28],
  writing: [30, 50, 70, 50, 30, 50],
  listening: [68, 32, 50, 68, 50, 32],
  pronunciation: [50, 70, 50, 30, 50, 70],
};
const shapes = ["round", "arch", "soft-square", "petal"] as const;

/** Absolute skill positions keep the route stable when its visible window changes. */
export function getPathPlacement(skill: TestSkill, index: number) {
  const x = silhouettes[skill][index % silhouettes[skill].length];
  return {
    x,
    mobileX: x < 50 ? 34 : x > 50 ? 66 : 50,
    shape: shapes[index % shapes.length],
    decorationSide: x < 50 || (x === 50 && index % 2 === 0) ? "right" : "left",
  };
}

export function getPathWindow(stages: TestStage[], progress: Record<string, StageProgress>, expanded: boolean) {
  const firstIncomplete = stages.findIndex((stage) => !progress[stage.id]?.passed);
  const currentIndex = firstIncomplete < 0 ? Math.max(0, stages.length - 1) : firstIncomplete;
  const start = expanded || stages.length <= 3 ? 0 : Math.min(Math.max(0, currentIndex - 1), stages.length - 3);
  const visibleStages = expanded || stages.length <= 3 ? stages : stages.slice(start, start + 3);
  return { currentIndex, start, visibleStages, completed: stages.filter((stage) => progress[stage.id]?.passed).length };
}

export function getPathSkill(value: string | null): TestSkill {
  return pathSkillOrder.find((skill) => skill === value) ?? "reading";
}

export function getLanguagePathHref(language: TestLanguage, skill: TestSkill, phase?: LanguagePathPhase) {
  const params = new URLSearchParams();
  if (phase === "foundation") params.set("phase", "foundation");
  if (skill !== "reading") params.set("skill", skill);
  const query = params.toString();
  return `/tests/${language}${query ? `?${query}` : ""}`;
}
