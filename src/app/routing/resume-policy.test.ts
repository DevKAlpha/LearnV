import { describe, expect, it } from "vitest";
import {
  DESKTOP_VISUAL_LOADER_DELAY_MS,
  LONG_BACKGROUND_REVALIDATE_MS,
  MOBILE_VISUAL_LOADER_DELAY_MS,
  shouldRevalidateAfterResume,
  visualLoaderDelay,
} from "@/app/routing/resume-policy";

describe("resume policy", () => {
  it("keeps short app switches on the current document", () => {
    expect(shouldRevalidateAfterResume({ elapsedMs: 3_000, restoredFromPageCache: false, mobileDevice: true })).toBe(false);
  });

  it("revalidates a document restored from page cache without reloading healthy UI", () => {
    expect(shouldRevalidateAfterResume({
      elapsedMs: 4_000,
      restoredFromPageCache: true,
      mobileDevice: true,
    })).toBe(true);
  });

  it("revalidates after a long background period without reloading a healthy route", () => {
    expect(shouldRevalidateAfterResume({
      elapsedMs: LONG_BACKGROUND_REVALIDATE_MS,
      restoredFromPageCache: false,
      mobileDevice: true,
    })).toBe(true);
  });

  it("keeps desktop and laptop tabs visible after long background periods", () => {
    expect(shouldRevalidateAfterResume({
      elapsedMs: LONG_BACKGROUND_REVALIDATE_MS * 20,
      restoredFromPageCache: true,
      mobileDevice: false,
    })).toBe(false);
  });

  it("does not treat negative elapsed time as a stale session", () => {
    expect(shouldRevalidateAfterResume({ elapsedMs: -1, restoredFromPageCache: false, mobileDevice: true })).toBe(false);
  });

  it("gives fast routes time to paint before showing a loader", () => {
    expect(visualLoaderDelay(true)).toBe(MOBILE_VISUAL_LOADER_DELAY_MS);
    expect(visualLoaderDelay(false)).toBe(DESKTOP_VISUAL_LOADER_DELAY_MS);
    expect(DESKTOP_VISUAL_LOADER_DELAY_MS).toBeGreaterThan(MOBILE_VISUAL_LOADER_DELAY_MS);
    expect(MOBILE_VISUAL_LOADER_DELAY_MS).toBeGreaterThan(200);
  });
});
