import type { TestLanguage } from "@/domain/models/language-test";
import type { Locale } from "@/domain/models/i18n";
import { completeRestartLesson, normalizeRestartProgress, type RestartLessonId, type RestartProgress } from "@/domain/models/learning-restart";
import { scopedStorageKey } from "@/infrastructure/config/app-scope";

export const restartStorageKey = (language: TestLanguage) => scopedStorageKey(`learnv-restart-v1:${language}`);

/** Carry the chosen help language into the real exercise without changing immersion or app locale. */
export function readRestartHelpLocale(language: TestLanguage, fallback: Locale, storage?: Pick<Storage, "getItem">): Locale {
  try {
    const value = (storage ?? localStorage).getItem(`${restartStorageKey(language)}:help`);
    return value === "es" || value === "en" || value === "ko" ? value : fallback;
  } catch { return fallback; }
}
export function saveRestartHelpLocale(language: TestLanguage, locale: Locale, storage?: Pick<Storage, "setItem">) {
  try { (storage ?? localStorage).setItem(`${restartStorageKey(language)}:help`, locale); }
  catch { /* In-memory help still works if browser storage is blocked. */ }
}

export function readRestartProgress(language: TestLanguage, storage?: Pick<Storage, "getItem">): RestartProgress {
  try { return normalizeRestartProgress(JSON.parse((storage ?? localStorage).getItem(restartStorageKey(language)) ?? "null")); }
  catch { return []; }
}

/** Merge completed lessons across tabs; never read or migrate existing test results. */
export function saveRestartLesson(language: TestLanguage, lesson: RestartLessonId, current: RestartProgress, storage?: Pick<Storage, "getItem" | "setItem">) {
  const next = completeRestartLesson([...current, ...readRestartProgress(language, storage)], lesson);
  try { (storage ?? localStorage).setItem(restartStorageKey(language), JSON.stringify(next)); return { progress: next, saved: true }; }
  catch { return { progress: next, saved: false }; }
}
