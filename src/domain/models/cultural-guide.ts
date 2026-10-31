import type { LocalizedText } from "./i18n";

export const cultureCaseIds = ["greetings", "campus", "community", "food", "housing", "mobility", "scholarship", "health"] as const;
export type CultureCaseId = typeof cultureCaseIds[number];
export type CulturePreparation = CultureCaseId[];
export type CultureSource = { id: string; title: string; publisher: string; url: string; kind: "testimony" | "official"; checkedAt: string; context: LocalizedText };
export type CultureStory = { id: string; person: string; context: LocalizedText; summary: LocalizedText; sourceId: string };
export type CultureCase = {
  id: CultureCaseId;
  title: LocalizedText;
  spain: LocalizedText;
  korea: LocalizedText;
  actions: [LocalizedText, LocalizedText];
  phrase: { ko: string; meaning: LocalizedText };
  preparation: LocalizedText;
  storyId?: string;
  sourceIds: string[];
  practice: { prompt: LocalizedText; options: [LocalizedText, LocalizedText]; correct: 0 | 1; explanation: LocalizedText };
};

/** Only preparation IDs are retained: no names, travel dates, health data or quiz answers. */
export function normalizeCulturePreparation(value: unknown): CulturePreparation {
  return Array.isArray(value) ? cultureCaseIds.filter((id) => value.includes(id)) : [];
}
