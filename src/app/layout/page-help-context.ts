import type { HelpContext } from "./section-help";

/** Explicit UI state, never learner answers or drafts. */
export function readPageHelpContext(root: ParentNode = document): HelpContext {
  const practice = root.querySelector<HTMLElement>("[data-help-practice]");
  const written = root.querySelector<HTMLElement>("[data-help-written]")?.dataset.helpWritten;
  const phase = root.querySelector<HTMLElement>("[data-help-phase]")?.dataset.helpPhase;
  const mode = practice?.dataset.helpMode;
  return {
    phase: phase === "advanced" ? "advanced" : "foundation",
    practice: practice?.dataset.helpPractice === "result" ? "result" : practice?.dataset.helpPractice === "questions" ? "questions" : "production",
    mode: mode === "listening" || mode === "speaking" ? mode : "writing",
    retake: practice?.dataset.helpRetake === "true",
    written: written === "knowledge" || written === "personal" || written === "plan" || written === "review" || written === "result" ? written : "intro",
    introOpen: !!root.querySelector(".learning-restart__body:not([hidden])"),
    timerRunning: !!root.querySelector('[data-help-timed-running="true"]'),
  };
}

export function findHelpTarget(selector: string, root: ParentNode = document): HTMLElement | null {
  return [...root.querySelectorAll<HTMLElement>(selector)].find((element) => element.getClientRects().length > 0 && !element.closest('[hidden],[aria-hidden="true"]')) ?? null;
}

export function isFixedHelpTarget(element: HTMLElement) {
  for (let parent: HTMLElement | null = element; parent; parent = parent.parentElement) {
    if (getComputedStyle(parent).position === "fixed") return true;
  }
  return false;
}
