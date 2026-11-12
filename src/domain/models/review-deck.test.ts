import { describe, expect, it } from "vitest";
import {
  addMistakes, buildSession, emptyReviewState, isOrderCorrect, isTypedAnswerCorrect, MAX_MISTAKES,
  NEW_CARDS_PER_DAY, normalizeReviewState, recordReview, removeMistake, reviewSummary, type ReviewCard,
} from "./review-deck";

const now = new Date(2026, 10, 12, 9, 0, 0);
const card = (id: string, extra: Partial<ReviewCard> = {}): ReviewCard => ({
  id, language: "ko", group: "vocabulary", exercise: "recall", prompt: id, answer: id, meaning: { es: "", en: "" }, note: { es: "", en: "" }, ...extra,
});
const deck = Array.from({ length: 15 }, (_, index) => card(`ko:v:${index}`, { group: index % 2 ? "grammar" : "vocabulary" }));
const mistake = { questionId: "ko-reading-01-main", language: "ko" as const, prompt: "Q?", options: ["a", "b", "c"], correctIndex: 1, explanation: "Because b." };

describe("review deck", () => {
  it("caps new cards per day and counts the ones introduced", () => {
    const session = buildSession(deck, emptyReviewState, now);
    expect(session).toHaveLength(NEW_CARDS_PER_DAY);
    let state = emptyReviewState;
    for (const item of session.slice(0, 4)) state = recordReview(state, item.id, 3, now);
    expect(buildSession(deck, state, now)).toHaveLength(NEW_CARDS_PER_DAY - 4);
    expect(reviewSummary(deck, state, now).reviewedToday).toBe(4);
  });

  it("brings a forgotten card back as due after its learning step", () => {
    const state = recordReview(emptyReviewState, deck[0].id, 1, now);
    const later = new Date(now.getTime() + 11 * 60_000);
    const session = buildSession(deck, state, later);
    expect(session[0].id).toBe(deck[0].id);
  });

  it("turns wrong practice answers into choice cards without duplicates", () => {
    let state = addMistakes(emptyReviewState, [mistake]);
    state = addMistakes(state, [mistake]);
    expect(state.mistakes).toHaveLength(1);
    expect(state.mistakes[0]).toMatchObject({ id: "mistake:ko:ko-reading-01-main", exercise: "choice", answer: "b", correctIndex: 1 });
    expect(buildSession([], state, now).map((item) => item.id)).toEqual(["mistake:ko:ko-reading-01-main"]);
    const many = Array.from({ length: MAX_MISTAKES + 5 }, (_, index) => ({ ...mistake, questionId: `q-${index}` }));
    expect(addMistakes(emptyReviewState, many).mistakes).toHaveLength(MAX_MISTAKES);
    expect(removeMistake(state, state.mistakes[0].id).mistakes).toHaveLength(0);
  });

  it("survives corrupted storage", () => {
    expect(normalizeReviewState("nope")).toEqual(emptyReviewState);
    const reviewed = recordReview(addMistakes(emptyReviewState, [mistake]), "ko:v:1", 3, now);
    const restored = normalizeReviewState(JSON.parse(JSON.stringify(reviewed)));
    expect(restored).toEqual(reviewed);
    const broken = normalizeReviewState({ cards: { a: { id: "b" }, "ko:v:1": reviewed.cards["ko:v:1"] }, mistakes: [{ id: "x" }], days: { bad: 1, "2026-11-12": -1 } });
    expect(Object.keys(broken.cards)).toEqual(["ko:v:1"]);
    expect(broken.mistakes).toEqual([]);
    expect(broken.days).toEqual({});
  });

  it("accepts typed answers leniently but never empty", () => {
    const target = { answer: "Although", accept: ["even though"] };
    expect(isTypedAnswerCorrect("  although ", target)).toBe(true);
    expect(isTypedAnswerCorrect("Even  though.", target)).toBe(true);
    expect(isTypedAnswerCorrect("despite", target)).toBe(false);
    expect(isTypedAnswerCorrect("", target)).toBe(false);
    expect(isTypedAnswerCorrect("는", { answer: "는" })).toBe(true);
    expect(isOrderCorrect(["저는", "가요"], { tokens: ["저는", "가요"] })).toBe(true);
    expect(isOrderCorrect(["가요", "저는"], { tokens: ["저는", "가요"] })).toBe(false);
  });
});
