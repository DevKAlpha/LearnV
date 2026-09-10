import { describe, expect, it } from "vitest";
import {
  ASSET_RECOVERY_QUERY,
  createRecoveryUrl,
  resemblesAssetFailure,
} from "@/app/routing/asset-recovery";

describe("asset recovery", () => {
  it("recognises stale chunk and module failures", () => {
    expect(resemblesAssetFailure(new TypeError("Failed to fetch dynamically imported module"))).toBe(true);
    expect(resemblesAssetFailure(new Error("Importing a module script failed"))).toBe(true);
    expect(resemblesAssetFailure(new Error("Asset load timed out"))).toBe(true);
    expect(resemblesAssetFailure(new Error("Invalid form value"))).toBe(false);
  });

  it("creates a cache-busting recovery URL without losing route state", () => {
    const recovery = new URL(createRecoveryUrl("https://example.com/LearnV/study?tab=en#plan", 1234));
    expect(recovery.pathname).toBe("/LearnV/study");
    expect(recovery.searchParams.get("tab")).toBe("en");
    expect(recovery.searchParams.get(ASSET_RECOVERY_QUERY)).toBe("1234");
    expect(recovery.hash).toBe("#plan");
  });
});
