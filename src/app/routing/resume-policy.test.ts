import { describe, expect, it } from "vitest";
import {
  LONG_BACKGROUND_RELOAD_MS,
  PAGE_CACHE_RELOAD_MS,
  shouldReloadAfterResume,
} from "@/app/routing/resume-policy";

describe("resume policy", () => {
  it("keeps short app switches on the current document", () => {
    expect(shouldReloadAfterResume({ elapsedMs: 3_000, restoredFromPageCache: false })).toBe(false);
  });

  it("reloads a document restored from page cache after the browser was away", () => {
    expect(shouldReloadAfterResume({
      elapsedMs: PAGE_CACHE_RELOAD_MS,
      restoredFromPageCache: true,
    })).toBe(true);
  });

  it("reloads after a long background period even without page cache", () => {
    expect(shouldReloadAfterResume({
      elapsedMs: LONG_BACKGROUND_RELOAD_MS,
      restoredFromPageCache: false,
    })).toBe(true);
  });

  it("does not treat negative elapsed time as a stale session", () => {
    expect(shouldReloadAfterResume({ elapsedMs: -1, restoredFromPageCache: true })).toBe(false);
  });
});
