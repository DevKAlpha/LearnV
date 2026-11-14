import { normalizeDismissed } from "@/domain/models/board-plan";
import { scopedStorageKey } from "@/infrastructure/config/app-scope";
import { createLocalStore } from "@/infrastructure/storage/local-store";

/** Board suggestions the learner set aside ("Not now"), so they are not offered again. */
export const boardSuggestionStore = createLocalStore<string[]>({
  key: scopedStorageKey("learnv-board-suggestions-v1"),
  fallback: [],
  parse: normalizeDismissed,
});
