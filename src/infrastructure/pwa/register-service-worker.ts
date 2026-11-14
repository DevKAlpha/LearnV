import { recordLearningError } from "@/infrastructure/data/learning-error-log";

/**
 * Registers the generated service worker (scripts/build-sw.mjs) in production builds, after
 * the page has loaded so it never competes with the first paint. Development and tests run
 * without it.
 */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const base = import.meta.env.BASE_URL;
  const register = () => {
    navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch((error: unknown) => {
      recordLearningError({ area: "study-overview", severity: "warning", code: "service-worker-registration-failed", error });
    });
  };
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}
