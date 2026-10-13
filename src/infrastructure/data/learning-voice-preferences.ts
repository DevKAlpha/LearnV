import { sanitizeVoicePreference, type VoicePreference } from "@/domain/models/learning-voice";
import type { TestLanguage } from "@/domain/models/language-test";
import { scopedStorageKey } from "@/infrastructure/config/app-scope";

export const learningVoiceStorageKey = (language: TestLanguage) => scopedStorageKey(`learnv-study-voice-v1:${language}`);
export const learningVoicePreferenceEvent = "learnv:study-voice";
type PreferenceEvents = Pick<Window, "addEventListener" | "removeEventListener" | "dispatchEvent">;
export function readVoicePreference(language: TestLanguage, storage?: Pick<Storage, "getItem">): VoicePreference {
  try { return sanitizeVoicePreference(JSON.parse((storage ?? localStorage).getItem(learningVoiceStorageKey(language)) ?? "null"), language); }
  catch { return sanitizeVoicePreference(null, language); }
}
export function saveVoicePreference(language: TestLanguage, preference: VoicePreference, storage?: Pick<Storage, "setItem">, events?: PreferenceEvents) {
  const next = sanitizeVoicePreference(preference, language);
  try { (storage ?? localStorage).setItem(learningVoiceStorageKey(language), JSON.stringify(next)); }
  catch { /* Playback and in-memory preferences still work with blocked storage. */ }
  const target = events ?? (typeof window !== "undefined" && !storage ? window : undefined);
  target?.dispatchEvent(new CustomEvent(learningVoicePreferenceEvent, { detail: { language, preference: next } }));
}

/** Multiple audio players and tabs share settings, but never mix languages or QA scopes. */
export function observeVoicePreference(language: TestLanguage, update: (preference: VoicePreference) => void, events: PreferenceEvents = window) {
  const local = (event: Event) => {
    const detail = (event as CustomEvent).detail;
    if (detail?.language === language) update(sanitizeVoicePreference(detail.preference, language));
  };
  const stored = (event: Event) => {
    const change = event as StorageEvent;
    if (change.key !== null && change.key !== learningVoiceStorageKey(language)) return;
    try { update(sanitizeVoicePreference(JSON.parse(change.newValue ?? "null"), language)); }
    catch { update(sanitizeVoicePreference(null, language)); }
  };
  events.addEventListener(learningVoicePreferenceEvent, local);
  events.addEventListener("storage", stored);
  return () => { events.removeEventListener(learningVoicePreferenceEvent, local); events.removeEventListener("storage", stored); };
}
