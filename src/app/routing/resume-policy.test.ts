import { describe, expect, it } from "vitest";
import {
  DESKTOP_VISUAL_LOADER_DELAY_MS,
  MOBILE_VISUAL_LOADER_DELAY_MS,
  visualLoaderDelay,
} from "@/app/routing/resume-policy";

describe("visual loader policy", () => {
  it("gives fast routes time to paint before showing a loader", () => {
    expect(visualLoaderDelay(true)).toBe(MOBILE_VISUAL_LOADER_DELAY_MS);
    expect(visualLoaderDelay(false)).toBe(DESKTOP_VISUAL_LOADER_DELAY_MS);
    expect(DESKTOP_VISUAL_LOADER_DELAY_MS).toBeGreaterThan(MOBILE_VISUAL_LOADER_DELAY_MS);
    expect(MOBILE_VISUAL_LOADER_DELAY_MS).toBeGreaterThan(200);
  });
});
