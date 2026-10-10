import type { TestLanguage } from "./language-test";

export type LearningVoice = { name: string; lang: string; voiceURI: string; localService: boolean; default: boolean };
export type VoicePreference = { accent: string; voiceURI: string; pace: "clear" | "natural" | "challenge" };
export const defaultVoicePreference: VoicePreference = { accent: "auto", voiceURI: "", pace: "natural" };
export const voicePaces = { clear: 0.85, natural: 0.98, challenge: 1.08 } as const;
export const voiceAccents = {
  en: ["en-GB", "en-US", "en-AU", "en-CA", "en-IE", "en-NZ", "en-IN", "en-SG", "en-HK", "en-PH"],
  ko: ["ko-KR"],
} as const;

export function normalizeVoiceLanguage(tag: string) { return tag.replaceAll("_", "-").toLowerCase(); }
export function languageVoices<T extends LearningVoice>(voices: readonly T[], language: TestLanguage): T[] {
  const seen = new Set<string>();
  return voices.filter((voice) => {
    const lang = normalizeVoiceLanguage(voice.lang);
    const id = `${voice.voiceURI}|${voice.name}|${lang}`;
    if (!(lang === language || lang.startsWith(`${language}-`)) || seen.has(id)) return false;
    seen.add(id); return true;
  });
}

// Name hints are preferences, not a guarantee of neural quality or an accent detector.
export function voiceQualityHint(voice: LearningVoice): number {
  return /neural|natural|enhanced|premium/i.test(voice.name) ? 30 : /google|online/i.test(voice.name) ? 15 : 0;
}

export function selectLearningVoice<T extends LearningVoice>(voices: readonly T[], language: TestLanguage, preference: VoicePreference) {
  const available = languageVoices(voices, language);
  const matching = preference.accent === "auto" ? available : available.filter((voice) => normalizeVoiceLanguage(voice.lang) === normalizeVoiceLanguage(preference.accent));
  const accentUnavailable = preference.accent !== "auto" && matching.length === 0;
  const candidates = accentUnavailable ? available : matching;
  const saved = candidates.find((voice) => preference.voiceURI && voice.voiceURI === preference.voiceURI);
  const preferredLang = language === "ko" ? "ko-kr" : "en-gb";
  const ranked = [...candidates].sort((a, b) => {
    const score = (voice: LearningVoice) => voiceQualityHint(voice) + (normalizeVoiceLanguage(voice.lang) === preferredLang ? 5 : 0) + (voice.default ? 1 : 0);
    return score(b) - score(a) || a.name.localeCompare(b.name) || a.voiceURI.localeCompare(b.voiceURI);
  });
  return { voice: saved ?? ranked[0] ?? null, candidates: ranked, accentUnavailable, voiceUnavailable: Boolean(preference.voiceURI && !saved) };
}

export function sanitizeVoicePreference(value: unknown, language: TestLanguage): VoicePreference {
  if (!value || typeof value !== "object") return { ...defaultVoicePreference };
  const candidate = value as Partial<VoicePreference>;
  return {
    accent: candidate.accent === "auto" || voiceAccents[language].some((accent) => accent === candidate.accent) ? candidate.accent! : "auto",
    voiceURI: typeof candidate.voiceURI === "string" ? candidate.voiceURI.slice(0, 300) : "",
    pace: candidate.pace && Object.hasOwn(voicePaces, candidate.pace) ? candidate.pace : "natural",
  };
}

/** Short utterances avoid long browser queues; punctuation, words and order are retained. */
export function learningSpeechChunks(text: string, limit = 260): string[] {
  if (limit < 40) throw new Error("Speech chunk limit is too small");
  const sentences = text.trim().split(/(?<=[.!?。！？])\s+(?=[\p{Lu}\p{Script=Hangul}“"])/u);
  return sentences.flatMap((sentence) => {
    const words = sentence.trim().split(/\s+/u);
    const chunks: string[] = []; let current = "";
    for (const word of words) {
      if (current && current.length + word.length + 1 > limit) { chunks.push(current); current = ""; }
      if (word.length > limit) {
        const characters = Array.from(word);
        while (characters.length) chunks.push(characters.splice(0, limit).join(""));
      } else current = current ? `${current} ${word}` : word;
    }
    if (current) chunks.push(current);
    return chunks.filter(Boolean);
  });
}
