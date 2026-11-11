import type { LearningEvent } from "@/domain/models/learning-journey";
import { emitLearnvEvent } from "@/infrastructure/events/learnv-events";

export function trackLearning(event: LearningEvent) {
  emitLearnvEvent("learnv:learning-journey", event);
}
