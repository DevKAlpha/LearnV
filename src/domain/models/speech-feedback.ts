/**
 * Objective checks on a spoken answer, from a speech-to-text transcript and its duration:
 * pace, filler words and which key words of the model answer were said. Like the writing
 * checks, it never claims to grade pronunciation; recognition errors are possible and the
 * learner sees the transcript the checks are based on.
 */
export type SpeechLanguage = "en" | "ko";
export type PaceStatus = "slow" | "ok" | "fast";

export type SpeechAnalysis = {
  units: number;
  /** Words per minute (English) or syllables per minute (Korean). */
  rate: number;
  rateUnit: "wpm" | "spm";
  pace: PaceStatus;
  fillers: string[];
  fillerCount: number;
  keywords: string[];
  saidKeywords: string[];
  missingKeywords: string[];
};

/** Comfortable exam pace for learners: IELTS Speaking ~110–160 wpm; Korean ~180–330 syllables/min. */
const PACE: Record<SpeechLanguage, { min: number; max: number }> = {
  en: { min: 100, max: 170 },
  ko: { min: 170, max: 340 },
};
const FILLERS: Record<SpeechLanguage, string[]> = {
  en: ["um", "uh", "erm", "er", "like", "you know", "i mean", "basically", "actually", "kind of", "sort of"],
  ko: ["음", "어", "그", "저기", "그니까", "그러니까", "약간", "뭐지", "막"],
};
const EN_STOPWORDS = new Set(("the a an and or but of to in on at for with from by is are was were be been it its this that these those "
  + "i you he she we they my your our their me him her us them as not so do does did have has had will would can could should "
  + "there here than then also very more most some any all each which who what when where how why about into because").split(" "));
const KO_ENDINGS = /(?:입니다|습니다|ㅂ니다|에서는|에서|에게|으로|하고|이에요|예요|이다|은|는|이|가|을|를|에|의|도|로|와|과|요|다)$/u;

const words = (text: string) => text.toLocaleLowerCase("en").match(/[\p{L}\p{N}']+/gu) ?? [];
const hangulSyllables = (text: string) => (text.match(/[가-힣]/gu) ?? []).length;
/** Crude English stem so "study" matches "studying" or "studied". */
const enStem = (word: string) => word.replace(/(?:ing|ed|es|s)$/u, "").replace(/(?:ie|i|y)$/u, "");
const koStem = (word: string) => {
  const stem = word.replace(KO_ENDINGS, "");
  return stem.length >= 2 ? stem : word;
};

/** Up to `limit` distinctive words of the model answer, in order of appearance. */
export function modelKeywords(model: string, language: SpeechLanguage, limit = 6): string[] {
  const candidates = words(model)
    .filter((word) => language === "en" ? word.length >= 5 && !EN_STOPWORDS.has(word) : hangulSyllables(word) >= 2)
    .map((word) => language === "en" ? word : koStem(word));
  return [...new Set(candidates)].slice(0, limit);
}

export function analyzeSpeech(transcript: string, seconds: number, language: SpeechLanguage, keywords: readonly string[] = []): SpeechAnalysis {
  const text = transcript.toLocaleLowerCase("en");
  const tokens = words(text);
  const units = language === "en" ? tokens.length : hangulSyllables(text);
  const minutes = Math.max(seconds, 1) / 60;
  const rate = Math.round(units / minutes);
  const { min, max } = PACE[language];
  const found = FILLERS[language].flatMap((filler) => {
    const pattern = new RegExp(`(?:^|[^\\p{L}])${filler.replace(/ /gu, "\\s+")}(?=[^\\p{L}]|$)`, "gu");
    const count = (text.match(pattern) ?? []).length;
    return count ? [{ filler, count }] : [];
  });
  const saidKeywords = keywords.filter((keyword) => language === "en"
    ? tokens.some((token) => enStem(token) === enStem(keyword))
    : text.includes(keyword));
  return {
    units,
    rate,
    rateUnit: language === "en" ? "wpm" : "spm",
    pace: rate < min ? "slow" : rate > max ? "fast" : "ok",
    fillers: found.map(({ filler }) => filler),
    fillerCount: found.reduce((total, { count }) => total + count, 0),
    keywords: [...keywords],
    saidKeywords,
    missingKeywords: keywords.filter((keyword) => !saidKeywords.includes(keyword)),
  };
}
