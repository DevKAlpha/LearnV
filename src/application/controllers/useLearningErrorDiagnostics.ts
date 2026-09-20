import { useEffect } from "react";
import {
  recordLearningError,
  resolveLearningDiagnosticArea,
  type LearningDiagnosticArea,
} from "@/infrastructure/data/learning-error-log";

function activeArea(pathname: string): LearningDiagnosticArea | null {
  if (document.querySelector(".interview-chat")) return "interview-chatbot";
  return resolveLearningDiagnosticArea(pathname);
}

function safePath(url: string) {
  try { return url ? new URL(url, window.location.href).pathname : ""; } catch { return ""; }
}

function resourceContext(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return {};
  const url = target instanceof HTMLImageElement
    ? target.currentSrc || target.src
    : target instanceof HTMLScriptElement
      ? target.src
      : target instanceof HTMLLinkElement
        ? target.href
        : "";
  return { element: target.tagName.toLocaleLowerCase(), resourcePath: safePath(url) };
}

/** Captures runtime failures only while a learning surface is active. */
export function useLearningErrorDiagnostics(pathname: string) {
  useEffect(() => {
    const onError = (event: ErrorEvent | Event) => {
      const area = activeArea(pathname);
      if (!area) return;
      const runtimeEvent = event as ErrorEvent;
      const isResourceFailure = event.target !== window && event.target instanceof HTMLElement;
      recordLearningError({
        area,
        code: isResourceFailure ? "resource-load-failed" : "runtime-error",
        message: isResourceFailure ? "A learning resource failed to load." : undefined,
        error: runtimeEvent.error ?? runtimeEvent.message,
        route: pathname,
        context: isResourceFailure
          ? resourceContext(event.target)
          : { source: safePath(runtimeEvent.filename), line: runtimeEvent.lineno, column: runtimeEvent.colno },
      });
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const area = activeArea(pathname);
      if (!area) return;
      recordLearningError({
        area,
        code: "unhandled-promise-rejection",
        error: event.reason,
        route: pathname,
      });
    };

    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, [pathname]);
}
