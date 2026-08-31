import type { LearningEvent } from "@/domain/models/learning-journey";

export const LEARNING_JOURNEY_EVENT = "learnv:learning-journey";

export function trackLearning(event: LearningEvent) {
  window.dispatchEvent(new CustomEvent<LearningEvent>(LEARNING_JOURNEY_EVENT, { detail: event }));
}
