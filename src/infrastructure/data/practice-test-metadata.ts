import type { TestLanguage, TestSkill, TestStage } from "../../domain/models/language-test";

/** The shell needs identity/progress only, never question banks or generated feedback. */
export type PracticeStageMetadata = Pick<TestStage, "id" | "skill" | "order" | "passScore">;
export const TESTS_PER_SKILL = 22;
export const ADVANCED_TESTS_PER_SKILL = 3;
export const practiceSkills: TestSkill[] = ["reading", "grammar", "vocabulary", "writing", "listening", "pronunciation"];
export const TESTS_PER_LANGUAGE = TESTS_PER_SKILL * practiceSkills.length;

function metadata(language: TestLanguage, advanced: boolean): PracticeStageMetadata[] {
  return practiceSkills.flatMap((skill) => Array.from({ length: advanced ? ADVANCED_TESTS_PER_SKILL : TESTS_PER_SKILL }, (_, index) => ({
    id: `${language}-${advanced ? "c1-" : ""}${skill}-${String(index + 1).padStart(2, "0")}`,
    skill, order: index + 1, passScore: advanced ? 80 : 70,
  })));
}

export const foundationStageMetadata = { en: metadata("en", false), ko: metadata("ko", false) };
export const advancedStageMetadata = { en: metadata("en", true), ko: metadata("ko", true) };
