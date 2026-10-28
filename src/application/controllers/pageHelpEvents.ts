import type { Locale } from "@/domain/models/i18n";

export const START_PAGE_TOUR_EVENT = "learnv:start-tour";
let pendingLocale: Locale | null = null;

/** Keep manual replay requests until the deferred tour has attached its listener. */
export function requestPageTour(locale: Locale) {
  pendingLocale = locale;
  window.dispatchEvent(new Event(START_PAGE_TOUR_EVENT));
}

export function consumePageTourRequest() {
  const locale = pendingLocale;
  pendingLocale = null;
  return locale;
}
