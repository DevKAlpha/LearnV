import { EMPTY_STICKERS, normalizeStickers, type StickerState } from "@/domain/models/milestones";
import { scopedStorageKey } from "@/infrastructure/config/app-scope";
import { createLocalStore } from "@/infrastructure/storage/local-store";

/** Stickers that cannot be derived from practice (festivals, easter eggs), with the date earned. */
export const stickerStore = createLocalStore<StickerState>({
  key: scopedStorageKey("learnv-stickers-v1"),
  fallback: EMPTY_STICKERS,
  parse: normalizeStickers,
});
