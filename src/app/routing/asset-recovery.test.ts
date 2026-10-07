import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ASSET_RECOVERY_QUERY,
  createRecoveryUrl,
  resemblesAssetFailure,
  loadWithAssetRecovery,
  ASSET_LOAD_TIMEOUT_MS,
} from "@/app/routing/asset-recovery";

vi.mock("@/infrastructure/data/learning-error-log", () => ({ recordLearningError: vi.fn(), resolveLearningDiagnosticArea: () => null }));
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

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

  it("settles a hung import and requests one automatic refresh instead of returning an endless promise", async () => {
    vi.useFakeTimers();
    const replace = vi.fn();
    vi.stubGlobal("window", {
      setTimeout, clearTimeout,
      location: { href: "https://example.com/study", pathname: "/study", replace },
      sessionStorage: { getItem: () => null, setItem: vi.fn() },
    });
    vi.stubGlobal("document", { documentElement: { classList: { add: vi.fn() } } });
    const result = loadWithAssetRecovery(() => new Promise(() => undefined));
    const rejection = expect(result).rejects.toThrow("Asset load timed out");
    await vi.advanceTimersByTimeAsync(ASSET_LOAD_TIMEOUT_MS);
    await rejection;
    expect(replace).toHaveBeenCalledOnce();
  });

  it("honours the recovery URL even when the storage marker is missing", async () => {
    const replace = vi.fn();
    vi.stubGlobal("window", {
      setTimeout, clearTimeout,
      location: { href: `https://example.com/study?learnv-recover=${Date.now()}`, pathname: "/study", replace },
      sessionStorage: { getItem: () => null },
    });
    await expect(loadWithAssetRecovery(() => Promise.reject(new Error("Failed to fetch dynamically imported module")))).rejects.toThrow();
    expect(replace).not.toHaveBeenCalled();
  });

  it("reports an offline chunk failure without trying to reload", async () => {
    const replace = vi.fn();
    vi.stubGlobal("navigator", { onLine: false });
    vi.stubGlobal("window", { setTimeout, clearTimeout, location: { replace } });
    await expect(loadWithAssetRecovery(() => Promise.reject(new Error("Failed to fetch dynamically imported module")))).rejects.toThrow();
    expect(replace).not.toHaveBeenCalled();
  });

  it("clears its deadline as soon as a route loads successfully", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("window", { setTimeout, clearTimeout });
    await expect(loadWithAssetRecovery(() => Promise.resolve("ready"))).resolves.toBe("ready");
    expect(vi.getTimerCount()).toBe(0);
  });
});
