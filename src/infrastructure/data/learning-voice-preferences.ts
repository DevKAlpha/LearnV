import { sanitizeVoicePreference, type VoicePreference } from "@/domain/models/learning-voice";
import type { TestLanguage } from "@/domain/models/language-test";
import { scopedStorageKey } from "@/infrastructure/config/app-scope";

export const learningVoiceStorageKey = (language: TestLanguage) => scopedStorageKey(`learnv-study-voice-v1:${language}`);
export function readVoicePreference(language: TestLanguage, storage?: Pick<Storage, "getItem">): VoicePreference {
  try { return sanitizeVoicePreference(JSON.parse((storage ?? localStorage).getItem(learningVoiceStorageKey(language)) ?? "null"), language); }
  catch { return sanitizeVoicePreference(null, language); }
}
export function saveVoicePreference(language: TestLanguage, preference: VoicePreference, storage?: Pick<Storage, "setItem">) {
  try { (storage ?? localStorage).setItem(learningVoiceStorageKey(language), JSON.stringify(sanitizeVoicePreference(preference, language))); }
  catch { /* Playback and in-memory preferences still work with blocked storage. */ }
}
