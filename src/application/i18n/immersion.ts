import type { Locale } from "@/domain/models/i18n";
import { scopedStorageKey } from "@/infrastructure/config/app-scope";
import { createLocalStore } from "@/infrastructure/storage/local-store";
import { useLocalStore } from "@/application/controllers/useLocalStore";

export type ImmersionMode = "full" | "guided";
type PracticeLocale = Extract<Locale, "en" | "ko">;
export type ImmersionPreferences = Record<PracticeLocale, ImmersionMode>;

/**
 * "full": the whole interface switches to the practice language.
 * "guided": practice content stays in the target language, instructions stay in the
 * learner's own language. Korean starts guided because TOPIK I learners cannot yet read
 * interface Korean; English starts fully immersive (B1/B2+ audience).
 */
export const DEFAULT_IMMERSION: ImmersionPreferences = { en: "full", ko: "guided" };

const isMode = (value: unknown): value is ImmersionMode => value === "full" || value === "guided";

export function normalizeImmersion(raw: unknown): ImmersionPreferences {
  const record = typeof raw === "object" && raw !== null ? raw as Record<string, unknown> : {};
  return {
    en: isMode(record.en) ? record.en : DEFAULT_IMMERSION.en,
    ko: isMode(record.ko) ? record.ko : DEFAULT_IMMERSION.ko,
  };
}

export const immersionStore = createLocalStore<ImmersionPreferences>({
  key: scopedStorageKey("learnv-immersion-v1"),
  fallback: DEFAULT_IMMERSION,
  parse: normalizeImmersion,
});

/** The interface language to use on a practice route, or null to keep the learner's own. */
export function interfaceLocaleFor(practice: Locale | null, preferences: ImmersionPreferences): Locale | null {
  if (practice !== "en" && practice !== "ko") return null;
  return preferences[practice] === "full" ? practice : null;
}

export function useImmersion() {
  const preferences = useLocalStore(immersionStore);
  const toggle = (practice: PracticeLocale) =>
    immersionStore.set((current) => ({ ...current, [practice]: current[practice] === "full" ? "guided" : "full" }));
  return { preferences, toggle };
}
