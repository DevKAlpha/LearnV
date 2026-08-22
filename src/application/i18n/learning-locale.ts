import type { Locale } from "../../domain/models/i18n";

export function resolveLearningLocale(pathname: string): Locale | null {
  if (/^\/study\/english(?:\/|$)/.test(pathname) || /^\/tests\/en(?:\/|$)/.test(pathname)) return "en";
  if (/^\/study\/korean(?:\/|$)/.test(pathname) || /^\/tests\/ko(?:\/|$)/.test(pathname)) return "ko";
  return null;
}

export function isImmersiveLearningRoute(pathname: string) {
  return pathname.startsWith("/tests/") || resolveLearningLocale(pathname) !== null;
}
