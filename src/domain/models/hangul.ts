/**
 * Hangul building blocks: syllable composition (Unicode arithmetic), letter-by-letter
 * Revised Romanization, the seven final-consonant sounds and the 2-set keyboard layout.
 *
 * Romanization here is a *reading aid* per letter. It does not apply sound-change rules
 * (liaison, nasalisation, tensing), which the Hangul module teaches with curated examples.
 */
import { shuffle } from "./random";

export const INITIALS = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"] as const;
export const VOWELS = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"] as const;
export const FINALS = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"] as const;

const INITIAL_RR = ["g", "kk", "n", "d", "tt", "r", "m", "b", "pp", "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h"];
const VOWEL_RR = ["a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i"];
const FINAL_RR = ["", "k", "k", "k", "n", "n", "n", "t", "l", "k", "m", "l", "l", "l", "p", "l", "m", "p", "p", "t", "t", "ng", "t", "t", "k", "t", "p", "t"];

/** The seven sounds a final consonant (받침) can have, named by their representative letter. */
export type FinalSound = "ㄱ" | "ㄴ" | "ㄷ" | "ㄹ" | "ㅁ" | "ㅂ" | "ㅇ";
const FINAL_SOUND: Record<string, FinalSound> = {
  k: "ㄱ", n: "ㄴ", t: "ㄷ", l: "ㄹ", m: "ㅁ", p: "ㅂ", ng: "ㅇ",
};

const BASE = 0xac00;
const LAST = 0xd7a3;

export type Syllable = { initial: string; vowel: string; final: string };

export function isSyllable(char: string) {
  const code = char.codePointAt(0) ?? 0;
  return char.length === 1 && code >= BASE && code <= LAST;
}

export function compose(initial: string, vowel: string, final = ""): string | null {
  const l = INITIALS.indexOf(initial as typeof INITIALS[number]);
  const v = VOWELS.indexOf(vowel as typeof VOWELS[number]);
  const t = FINALS.indexOf(final as typeof FINALS[number]);
  if (l < 0 || v < 0 || t < 0) return null;
  return String.fromCharCode(BASE + (l * 21 + v) * 28 + t);
}

function indices(char: string) {
  const offset = (char.codePointAt(0) ?? 0) - BASE;
  return { l: Math.floor(offset / 588), v: Math.floor((offset % 588) / 28), t: offset % 28 };
}

export function decompose(char: string): Syllable | null {
  if (!isSyllable(char)) return null;
  const { l, v, t } = indices(char);
  return { initial: INITIALS[l], vowel: VOWELS[v], final: FINALS[t] };
}

/** Letter-by-letter Revised Romanization; non-Hangul characters pass through unchanged. */
export function romanize(text: string): string {
  return [...text].map((char) => {
    if (!isSyllable(char)) return char;
    const { l, v, t } = indices(char);
    return INITIAL_RR[l] + VOWEL_RR[v] + FINAL_RR[t];
  }).join("");
}

/** The sound of a syllable's final consonant, or null when it has none. */
export function finalSound(char: string): FinalSound | null {
  if (!isSyllable(char)) return null;
  const rr = FINAL_RR[indices(char).t];
  return rr ? FINAL_SOUND[rr] : null;
}

export function hasFinal(char: string) {
  return finalSound(char) !== null;
}

/** 2-set (두벌식) layout: QWERTY key → jamo. Shift variants give the tense consonants. */
export const KEYBOARD_ROWS: readonly (readonly [key: string, jamo: string, shifted?: string][])[] = [
  [["q", "ㅂ", "ㅃ"], ["w", "ㅈ", "ㅉ"], ["e", "ㄷ", "ㄸ"], ["r", "ㄱ", "ㄲ"], ["t", "ㅅ", "ㅆ"], ["y", "ㅛ"], ["u", "ㅕ"], ["i", "ㅑ"], ["o", "ㅐ", "ㅒ"], ["p", "ㅔ", "ㅖ"]],
  [["a", "ㅁ"], ["s", "ㄴ"], ["d", "ㅇ"], ["f", "ㄹ"], ["g", "ㅎ"], ["h", "ㅗ"], ["j", "ㅓ"], ["k", "ㅏ"], ["l", "ㅣ"]],
  [["z", "ㅋ"], ["x", "ㅌ"], ["c", "ㅊ"], ["v", "ㅍ"], ["b", "ㅠ"], ["n", "ㅜ"], ["m", "ㅡ"]],
];

export type ReadingQuestion = { syllable: string; options: string[]; correctIndex: number };

/**
 * "Read this syllable" questions. Distractors differ from the answer by one letter, so the
 * learner must read every part of the block instead of guessing from the first letter.
 */
export function readingQuiz(pool: readonly string[], count: number, random: () => number): ReadingQuestion[] {
  const syllables = shuffle(pool.filter(isSyllable), random).slice(0, count);
  return syllables.map((syllable) => {
    const parts = decompose(syllable)!;
    const answer = romanize(syllable);
    const variants = new Set<string>();
    const tries = [
      () => compose(INITIALS[Math.floor(random() * INITIALS.length)], parts.vowel, parts.final),
      () => compose(parts.initial, VOWELS[Math.floor(random() * VOWELS.length)], parts.final),
      () => compose(parts.initial, parts.vowel, FINALS[Math.floor(random() * FINALS.length)]),
    ];
    for (let attempt = 0; variants.size < 3 && attempt < 60; attempt++) {
      const candidate = tries[attempt % tries.length]();
      const reading = candidate ? romanize(candidate) : "";
      if (reading && reading !== answer) variants.add(reading);
    }
    const options = shuffle([answer, ...variants], random);
    return { syllable, options, correctIndex: options.indexOf(answer) };
  });
}
