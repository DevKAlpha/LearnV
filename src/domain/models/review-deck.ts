import { localDateKey } from "./learning-journey";
import { buildQueue, interleave, newCard, normalizeCard, review, type CardState, type Rating } from "./srs";

export type ReviewLanguage = "en" | "ko";
export type ReviewGroup = "vocabulary" | "grammar" | "word-order" | "listening" | "mistake";
/**
 * - recall: see the item, think, reveal, rate yourself.
 * - cloze: type the missing piece of a sentence.
 * - order: rebuild a sentence from shuffled blocks (word order, particles, endings).
 * - dictation: listen (TTS) and type what you hear; nothing is shown before answering.
 * - choice: a practice-test question you got wrong, asked again.
 */
export type ReviewExercise = "recall" | "cloze" | "order" | "dictation" | "choice";
export type Localized = { es: string; en: string };

export type ReviewCard = {
  id: string;
  language: ReviewLanguage;
  group: ReviewGroup;
  exercise: ReviewExercise;
  /** What the learner sees: a word, or a sentence with "___" for cloze. Empty for dictation. */
  prompt: string;
  /** The target-language answer (cloze gap, full sentence for order/dictation). */
  answer: string;
  /** Other accepted typed answers. */
  accept?: string[];
  /** Meaning or translation, shown as a hint (cloze/order) or on reveal (recall). */
  meaning: Localized;
  /** Why it matters, with the typical mistake of a Spanish speaker where there is one. */
  note: Localized;
  /** Text for speech synthesis, in the target language. */
  audio?: string;
  /** Correct block order for "order" cards. */
  tokens?: string[];
  /** Options for "choice" cards. */
  options?: string[];
  correctIndex?: number;
  passage?: string;
};

export type MistakeSource = {
  questionId: string;
  language: ReviewLanguage;
  prompt: string;
  passage?: string;
  /** Text of an audio-only question, replayed with speech synthesis. */
  audio?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type ReviewState = {
  version: 1;
  cards: Record<string, CardState>;
  mistakes: ReviewCard[];
  /** Reviews done per local day (last 60 days). */
  days: Record<string, number>;
  /** New cards introduced per local day (last 7 days), to cap new work. */
  introduced: Record<string, number>;
};

export const MAX_MISTAKES = 150;
export const NEW_CARDS_PER_DAY = 10;
export const MAX_REVIEWS_PER_SESSION = 40;

export const emptyReviewState: ReviewState = { version: 1, cards: {}, mistakes: [], days: {}, introduced: {} };

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown, max: number) => typeof value === "string" && value.length > 0 && value.length <= max ? value : null;

function counts(value: unknown, keep: number): Record<string, number> {
  if (!isRecord(value)) return {};
  const entries = Object.entries(value)
    .filter((entry): entry is [string, number] => DATE_KEY.test(entry[0]) && typeof entry[1] === "number" && Number.isInteger(entry[1]) && entry[1] >= 0 && entry[1] < 100_000)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, keep);
  return Object.fromEntries(entries);
}

function normalizeMistake(raw: unknown): ReviewCard | null {
  if (!isRecord(raw)) return null;
  const id = text(raw.id, 200);
  const prompt = text(raw.prompt, 1_000);
  const answer = text(raw.answer, 600);
  const options = Array.isArray(raw.options) ? raw.options.filter((option): option is string => typeof option === "string" && option.length <= 600) : [];
  const correctIndex = raw.correctIndex;
  if (!id?.startsWith("mistake:") || !prompt || !answer || (raw.language !== "en" && raw.language !== "ko")) return null;
  if (options.length < 2 || typeof correctIndex !== "number" || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) return null;
  const note = isRecord(raw.note) ? { es: text(raw.note.es, 1_500) ?? "", en: text(raw.note.en, 1_500) ?? "" } : { es: "", en: "" };
  return {
    id, language: raw.language, group: "mistake", exercise: "choice", prompt, answer, options, correctIndex,
    passage: text(raw.passage, 3_000) ?? undefined,
    audio: text(raw.audio, 3_000) ?? undefined,
    meaning: { es: "", en: "" },
    note,
  };
}

export function normalizeReviewState(raw: unknown): ReviewState {
  if (!isRecord(raw)) return emptyReviewState;
  const cards: Record<string, CardState> = {};
  if (isRecord(raw.cards)) {
    for (const [id, value] of Object.entries(raw.cards)) {
      const card = normalizeCard(value);
      if (card && card.id === id) cards[id] = card;
    }
  }
  const mistakes = Array.isArray(raw.mistakes)
    ? raw.mistakes.map(normalizeMistake).filter((card): card is ReviewCard => card !== null).slice(-MAX_MISTAKES)
    : [];
  return { version: 1, cards, mistakes, days: counts(raw.days, 60), introduced: counts(raw.introduced, 7) };
}

/** Turns wrong practice-test answers into review cards (the learner's own mistake log). */
export function addMistakes(state: ReviewState, sources: readonly MistakeSource[]): ReviewState {
  if (!sources.length) return state;
  const known = new Set(state.mistakes.map((card) => card.id));
  const added: ReviewCard[] = [];
  for (const source of sources) {
    const id = `mistake:${source.language}:${source.questionId}`.slice(0, 200);
    if (known.has(id) || !source.options[source.correctIndex]) continue;
    known.add(id);
    added.push({
      id, language: source.language, group: "mistake", exercise: "choice",
      prompt: source.prompt.slice(0, 1_000),
      passage: source.passage?.slice(0, 3_000),
      audio: source.audio?.slice(0, 3_000),
      answer: source.options[source.correctIndex].slice(0, 600),
      options: source.options.map((option) => option.slice(0, 600)),
      correctIndex: source.correctIndex,
      meaning: { es: "", en: "" },
      note: { es: source.explanation.slice(0, 1_500), en: source.explanation.slice(0, 1_500) },
    });
  }
  if (!added.length) return state;
  // A mistake that is already scheduled keeps its history; new ones start as new cards.
  return { ...state, mistakes: [...state.mistakes, ...added].slice(-MAX_MISTAKES) };
}

export function recordReview(state: ReviewState, cardId: string, rating: Rating, now: Date): ReviewState {
  const previous = state.cards[cardId];
  const wasNew = !previous || previous.reps === 0;
  const today = localDateKey(now);
  const next = review(previous ?? newCard(cardId, now), rating, now);
  return {
    ...state,
    cards: { ...state.cards, [cardId]: next },
    days: counts({ ...state.days, [today]: (state.days[today] ?? 0) + 1 }, 60),
    introduced: wasNew ? counts({ ...state.introduced, [today]: (state.introduced[today] ?? 0) + 1 }, 7) : state.introduced,
  };
}

export function removeMistake(state: ReviewState, cardId: string): ReviewState {
  const cards = { ...state.cards };
  delete cards[cardId];
  return { ...state, cards, mistakes: state.mistakes.filter((card) => card.id !== cardId) };
}

/**
 * Today's session: due cards (mistakes included) first, then new cards up to the daily
 * cap, interleaved by group so the same kind of exercise rarely appears twice in a row.
 */
export function buildSession(deck: readonly ReviewCard[], state: ReviewState, now: Date, language?: ReviewLanguage): ReviewCard[] {
  const all = [...state.mistakes, ...deck].filter((card) => !language || card.language === language);
  const byId = new Map(all.map((card) => [card.id, card]));
  const newLeft = Math.max(0, NEW_CARDS_PER_DAY - (state.introduced[localDateKey(now)] ?? 0));
  const queue = buildQueue(all.map((card) => card.id), state.cards, now, { newLimit: newLeft, reviewLimit: MAX_REVIEWS_PER_SESSION });
  const due = queue.due.map((id) => byId.get(id)!);
  const fresh = interleave(queue.fresh.map((id) => byId.get(id)!), (card) => `${card.language}:${card.group}`);
  return interleave(due, (card) => `${card.language}:${card.group}`).concat(fresh).slice(0, MAX_REVIEWS_PER_SESSION);
}

export type ReviewSummary = { due: number; fresh: number; reviewedToday: number; mistakes: number; learned: number };

export function reviewSummary(deck: readonly ReviewCard[], state: ReviewState, now: Date): ReviewSummary {
  const all = [...state.mistakes, ...deck];
  const session = buildSession(deck, state, now);
  const isFresh = (card: ReviewCard) => !state.cards[card.id] || state.cards[card.id].reps === 0;
  return {
    due: session.filter((card) => !isFresh(card)).length,
    fresh: session.filter(isFresh).length,
    reviewedToday: state.days[localDateKey(now)] ?? 0,
    mistakes: state.mistakes.length,
    learned: all.filter((card) => (state.cards[card.id]?.stability ?? 0) >= 21).length,
  };
}

/** Lenient comparison for typed answers: case, spacing and final punctuation do not count. */
export function normalizeTyped(value: string) {
  return value.normalize("NFC").toLocaleLowerCase("en").replace(/[’']/gu, "'").replace(/[.,!?。…\s]+$/u, "").replace(/\s+/gu, " ").trim();
}

export function isTypedAnswerCorrect(input: string, card: Pick<ReviewCard, "answer" | "accept">) {
  const typed = normalizeTyped(input);
  if (!typed) return false;
  return [card.answer, ...(card.accept ?? [])].some((candidate) => normalizeTyped(candidate) === typed);
}

/** Blocks are compared by text, so two identical blocks may appear in either position. */
export function isOrderCorrect(blocks: readonly string[], card: Pick<ReviewCard, "tokens">) {
  return Boolean(card.tokens) && blocks.length === card.tokens!.length && blocks.every((block, index) => block === card.tokens![index]);
}
