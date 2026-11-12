/**
 * Spaced repetition scheduler (FSRS-4.5, default parameters).
 *
 * Each card keeps a memory *stability* (days until recall probability falls to 90 %) and a
 * *difficulty* (1–10). A rating updates both and sets the next due date. "Again" also
 * re-queues the card for the same session after a short learning step.
 *
 * Reference: https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm
 */
export type Rating = 1 | 2 | 3 | 4; // again | hard | good | easy

export type CardState = {
  id: string;
  /** ISO timestamp when the card is next due. */
  due: string;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  /** ISO timestamp of the last review, null while the card is new. */
  lastReview: string | null;
};

const W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755] as const;
const DECAY = -0.5;
const FACTOR = 19 / 81;
const DAY_MS = 86_400_000;
export const TARGET_RETENTION = 0.9;
export const MAX_INTERVAL_DAYS = 365;
/** Minutes before a forgotten card comes back in the same session. */
export const RELEARN_MINUTES = 10;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const clampDifficulty = (value: number) => clamp(value, 1, 10);

export function retrievability(elapsedDays: number, stability: number) {
  if (stability <= 0) return 0;
  return Math.pow(1 + FACTOR * Math.max(0, elapsedDays) / stability, DECAY);
}

function initialDifficulty(rating: Rating) {
  return clampDifficulty(W[4] - (rating - 3) * W[5]);
}

function nextDifficulty(difficulty: number, rating: Rating) {
  const updated = difficulty - W[6] * (rating - 3);
  // Mean reversion towards the "good" default keeps difficulty from drifting to the bounds.
  return clampDifficulty(W[7] * initialDifficulty(3) + (1 - W[7]) * updated);
}

function recallStability(difficulty: number, stability: number, recall: number, rating: Rating) {
  const hardPenalty = rating === 2 ? W[15] : 1;
  const easyBonus = rating === 4 ? W[16] : 1;
  return stability * (1 + Math.exp(W[8]) * (11 - difficulty) * Math.pow(stability, -W[9])
    * (Math.exp(W[10] * (1 - recall)) - 1) * hardPenalty * easyBonus);
}

function forgetStability(difficulty: number, stability: number, recall: number) {
  const next = W[11] * Math.pow(difficulty, -W[12]) * (Math.pow(stability + 1, W[13]) - 1) * Math.exp(W[14] * (1 - recall));
  // A lapse can never make a memory more stable than it was.
  return Math.min(next, stability);
}

/** Days until recall probability reaches the target retention, at least one. */
export function intervalDays(stability: number, retention = TARGET_RETENTION) {
  const days = stability / FACTOR * (Math.pow(retention, 1 / DECAY) - 1);
  return clamp(Math.round(days), 1, MAX_INTERVAL_DAYS);
}

export function newCard(id: string, now: Date): CardState {
  return { id, due: now.toISOString(), stability: 0, difficulty: 0, reps: 0, lapses: 0, lastReview: null };
}

export function isNew(card: CardState) {
  return card.reps === 0;
}

export function isDue(card: CardState, now: Date) {
  return Date.parse(card.due) <= now.getTime();
}

export function review(card: CardState, rating: Rating, now: Date): CardState {
  const nowIso = now.toISOString();
  if (isNew(card)) {
    const stability = W[rating - 1];
    const due = rating === 1
      ? new Date(now.getTime() + RELEARN_MINUTES * 60_000)
      : new Date(now.getTime() + intervalDays(stability) * DAY_MS);
    return { ...card, stability, difficulty: initialDifficulty(rating), reps: 1, lapses: rating === 1 ? 1 : 0, lastReview: nowIso, due: due.toISOString() };
  }

  const elapsed = card.lastReview ? Math.max(0, (now.getTime() - Date.parse(card.lastReview)) / DAY_MS) : 0;
  const recall = retrievability(elapsed, card.stability);
  const difficulty = nextDifficulty(card.difficulty, rating);
  if (rating === 1) {
    return {
      ...card,
      stability: forgetStability(card.difficulty, card.stability, recall),
      difficulty,
      reps: card.reps + 1,
      lapses: card.lapses + 1,
      lastReview: nowIso,
      due: new Date(now.getTime() + RELEARN_MINUTES * 60_000).toISOString(),
    };
  }
  const stability = recallStability(card.difficulty, card.stability, recall, rating);
  return {
    ...card,
    stability,
    difficulty,
    reps: card.reps + 1,
    lastReview: nowIso,
    due: new Date(now.getTime() + intervalDays(stability) * DAY_MS).toISOString(),
  };
}

/** The interval each rating would give, for the labels on the rating buttons. */
export function previewIntervals(card: CardState, now: Date): Record<Rating, number> {
  const minutes = (state: CardState) => Math.round((Date.parse(state.due) - now.getTime()) / 60_000);
  return {
    1: minutes(review(card, 1, now)),
    2: minutes(review(card, 2, now)),
    3: minutes(review(card, 3, now)),
    4: minutes(review(card, 4, now)),
  };
}

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
const finite = (value: unknown, min: number, max: number) =>
  typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;

/** Validates one stored card; returns null for anything that could break scheduling. */
export function normalizeCard(raw: unknown): CardState | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const card = raw as Record<string, unknown>;
  if (typeof card.id !== "string" || !card.id || card.id.length > 160) return null;
  if (typeof card.due !== "string" || !ISO.test(card.due)) return null;
  if (card.lastReview !== null && (typeof card.lastReview !== "string" || !ISO.test(card.lastReview))) return null;
  if (!finite(card.stability, 0, 36_500) || !finite(card.reps, 0, 100_000) || !finite(card.lapses, 0, 100_000)) return null;
  const reps = Math.floor(card.reps as number);
  if (reps > 0 && !finite(card.difficulty, 1, 10)) return null;
  return {
    id: card.id,
    due: card.due,
    stability: card.stability as number,
    difficulty: reps > 0 ? card.difficulty as number : 0,
    reps,
    lapses: Math.floor(card.lapses as number),
    lastReview: card.lastReview as string | null,
  };
}

export type QueueOptions = { newLimit: number; reviewLimit: number };

/**
 * Today's queue: due reviews first (most overdue relative to stability first), then up to
 * `newLimit` new cards in deck order. Cards never seen have no state yet.
 */
export function buildQueue(
  deckIds: readonly string[],
  states: Readonly<Record<string, CardState>>,
  now: Date,
  { newLimit, reviewLimit }: QueueOptions,
): { due: string[]; fresh: string[] } {
  const due = deckIds
    .map((id) => states[id])
    .filter((card): card is CardState => Boolean(card) && !isNew(card) && isDue(card, now))
    .sort((a, b) => {
      const ra = retrievability(a.lastReview ? (now.getTime() - Date.parse(a.lastReview)) / DAY_MS : 0, a.stability);
      const rb = retrievability(b.lastReview ? (now.getTime() - Date.parse(b.lastReview)) / DAY_MS : 0, b.stability);
      return ra - rb;
    })
    .slice(0, reviewLimit)
    .map((card) => card.id);
  const fresh = deckIds.filter((id) => !states[id] || isNew(states[id])).slice(0, newLimit);
  return { due, fresh };
}

/**
 * Interleaving: alternates groups so consecutive cards rarely share a group (skill or
 * language). Order inside each group is preserved.
 */
export function interleave<T>(items: readonly T[], groupOf: (item: T) => string): T[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = groupOf(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  const lanes = [...groups.values()];
  const result: T[] = [];
  for (let index = 0; result.length < items.length; index++) {
    for (const lane of lanes) if (lane[index] !== undefined) result.push(lane[index]);
  }
  return result;
}
