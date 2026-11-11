import type { Locale } from "@/domain/models/i18n";
import { emitLearnvEvent } from "@/infrastructure/events/learnv-events";

let pendingLocale: Locale | null = null;

/** Keep manual replay requests until the deferred tour has attached its listener. */
export function requestPageTour(locale: Locale) {
  pendingLocale = locale;
  emitLearnvEvent("learnv:start-tour");
}

export function consumePageTourRequest() {
  const locale = pendingLocale;
  pendingLocale = null;
  return locale;
}
