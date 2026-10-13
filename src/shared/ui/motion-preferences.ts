/** Read at interaction time so changing the OS preference applies immediately. */
export function getMotionScrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "auto";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.matchMedia("(update: slow)").matches ? "auto" : "smooth";
}

export function scrollToLearningTop(): void {
  if (typeof window === "undefined" || typeof window.scrollTo !== "function") return;
  window.scrollTo({ top: 0, left: 0, behavior: getMotionScrollBehavior() });
}
