import type { LearningEvent } from "@/domain/models/learning-journey";
import type { InterviewSignal } from "@/domain/models/interview-chatbot";

/**
 * Every in-page event LearnV modules use to talk to each other, with its payload.
 * One typed map replaces scattered string names and untyped `CustomEvent` casts.
 * Payloads still cross a trust boundary (any script can dispatch), so receivers that
 * persist data validate them (see `normalizeLearningEvent`).
 */
export type LearnvEventMap = {
  "learnv:learning-journey": LearningEvent;
  "learnv:start-tour": undefined;
  "learnv:open-interview-chatbot": { focus: InterviewSignal | null };
  "learnv:written-state": { active: boolean };
  "learnv:written-reset": undefined;
  "learnv:open-task-board": { view: "today" | "board" };
};

export type LearnvEventName = keyof LearnvEventMap;

type EventTarget = Pick<Window, "addEventListener" | "removeEventListener" | "dispatchEvent">;

function browserTarget(): EventTarget | null {
  return typeof window === "undefined" ? null : window;
}

export function emitLearnvEvent<Name extends LearnvEventName>(
  name: Name,
  ...[detail]: LearnvEventMap[Name] extends undefined ? [] : [LearnvEventMap[Name]]
) {
  browserTarget()?.dispatchEvent(new CustomEvent(name, { detail }));
}

/** Subscribes to one event; the handler receives the raw detail (typed, but unverified). Returns an unsubscribe function. */
export function onLearnvEvent<Name extends LearnvEventName>(
  name: Name,
  handler: (detail: LearnvEventMap[Name] | undefined) => void,
  target: EventTarget | null = browserTarget(),
) {
  if (!target) return () => {};
  const listener = (event: Event) => handler((event as CustomEvent<LearnvEventMap[Name]>).detail);
  target.addEventListener(name, listener);
  return () => target.removeEventListener(name, listener);
}
