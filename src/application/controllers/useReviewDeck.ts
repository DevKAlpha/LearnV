import { useCallback, useMemo } from "react";
import type { QuestionResult, TestLanguage } from "@/domain/models/language-test";
import {
  addMistakes,
  emptyReviewState,
  normalizeReviewState,
  recordReview,
  removeMistake,
  reviewSummary,
  type ReviewCard,
  type ReviewState,
} from "@/domain/models/review-deck";
import type { Rating } from "@/domain/models/srs";
import { scopedStorageKey } from "@/infrastructure/config/app-scope";
import { recordLearningError } from "@/infrastructure/data/learning-error-log";
import { createLocalStore } from "@/infrastructure/storage/local-store";
import { useLocalStore } from "./useLocalStore";

export const reviewStore = createLocalStore<ReviewState>({
  key: scopedStorageKey("learnv-review-v1"),
  fallback: emptyReviewState,
  parse: normalizeReviewState,
  onError: (code, error) => recordLearningError({ area: "study-overview", code: `review-${code}`, error }),
});

/**
 * Sends the questions answered wrongly in a practice test to the review deck. Called once
 * per finished attempt; questions already in the deck are not duplicated.
 */
export function recordTestMistakes(language: TestLanguage, results: readonly QuestionResult[]) {
  const wrong = results.filter((result) => !result.correct);
  if (!wrong.length) return;
  reviewStore.refresh();
  reviewStore.set((state) => addMistakes(state, wrong.map(({ question }) => ({
    questionId: question.id,
    language,
    prompt: question.prompt,
    passage: question.passage,
    audio: question.audioText,
    options: question.options,
    correctIndex: question.correctIndex,
    explanation: question.explanation,
  }))));
}

export function useReviewDeck(deck: readonly ReviewCard[]) {
  const state = useLocalStore(reviewStore);
  const rate = useCallback((cardId: string, rating: Rating) => {
    // Re-read first so a review saved in another tab is kept.
    reviewStore.refresh();
    reviewStore.set((current) => recordReview(current, cardId, rating, new Date()));
  }, []);
  const forget = useCallback((cardId: string) => reviewStore.set((current) => removeMistake(current, cardId)), []);
  // Recomputed when the stored state changes; "now" only needs minute precision here.
  const summary = useMemo(() => reviewSummary(deck, state, new Date()), [deck, state]);
  return { state, summary, rate, forget };
}
