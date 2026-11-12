import { emptyPlacement, normalizePlacement, type PlacementState } from "@/domain/models/placement";
import { scopedStorageKey } from "@/infrastructure/config/app-scope";
import { createLocalStore } from "@/infrastructure/storage/local-store";

/** Level-test results. Read by the unlock checks, so it lives next to the path data. */
export const placementStore = createLocalStore<PlacementState>({
  key: scopedStorageKey("learnv-placement-v1"),
  fallback: emptyPlacement,
  parse: normalizePlacement,
});
