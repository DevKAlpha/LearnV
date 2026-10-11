import { afterEach, describe, expect, it, vi } from "vitest";
import { getMotionScrollBehavior } from "./motion-preferences";

afterEach(() => vi.unstubAllGlobals());

describe("language navigation motion preference", () => {
  it("scrolls immediately when reduced motion is requested", () => {
    vi.stubGlobal("window", { matchMedia: vi.fn(() => ({ matches: true })) });
    expect(getMotionScrollBehavior()).toBe("auto");
    expect(window.matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
  });
  it("keeps smooth navigation when motion is allowed", () => {
    vi.stubGlobal("window", { matchMedia: () => ({ matches: false }) });
    expect(getMotionScrollBehavior()).toBe("smooth");
  });
  it("rechecks changed preferences rather than caching them", () => {
    let reduced = false;
    vi.stubGlobal("window", { matchMedia: () => ({ matches: reduced }) });
    expect(getMotionScrollBehavior()).toBe("smooth");
    reduced = true;
    expect(getMotionScrollBehavior()).toBe("auto");
  });
  it("has a safe fallback without browser media queries", () => {
    vi.stubGlobal("window", {});
    expect(getMotionScrollBehavior()).toBe("auto");
  });
  it("does not require a browser when rendering on the server", () => {
    vi.stubGlobal("window", undefined);
    expect(getMotionScrollBehavior()).toBe("auto");
  });
});
