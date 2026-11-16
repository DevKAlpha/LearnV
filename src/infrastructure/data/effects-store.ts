import { DEFAULT_EFFECTS, normalizeEffects, type EffectsPreferences } from "@/domain/models/effects";
import { scopedStorageKey } from "@/infrastructure/config/app-scope";
import { createLocalStore } from "@/infrastructure/storage/local-store";

/** Celebrations, sound, vibration and seasonal theme. Device-only: never synchronised. */
export const effectsStore = createLocalStore<EffectsPreferences>({
  key: scopedStorageKey("learnv-effects-v1"),
  fallback: DEFAULT_EFFECTS,
  parse: normalizeEffects,
});
