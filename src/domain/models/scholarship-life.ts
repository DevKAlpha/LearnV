import type { LocalizedText } from "./i18n";

export const scholarshipLifeIds = ["residence", "settling", "topik", "attendance", "semester", "integrity", "wellbeing", "travel", "work", "changes", "completion", "career"] as const;
export type ScholarshipLifeId = typeof scholarshipLifeIds[number];
export type ScholarshipStage = "arrival" | "language" | "degree" | "permissions" | "finish";
export type ScholarshipLifeCase = {
  id: ScholarshipLifeId;
  stage: ScholarshipStage;
  title: LocalizedText;
  situation: LocalizedText;
  rule: LocalizedText;
  actions: [LocalizedText, LocalizedText, LocalizedText];
  recovery: LocalizedText;
  contact: LocalizedText;
  question: LocalizedText;
  references: { source: "regulations" | "residence" | "employment" | "cycle"; section: string }[];
};

/** Preparation only: never a certificate of compliance or a scholarship risk score. */
export function normalizeScholarshipPreparation(value: unknown): ScholarshipLifeId[] {
  return Array.isArray(value) ? scholarshipLifeIds.filter((id) => value.includes(id)) : [];
}
