import { afterEach, expect, it, vi } from "vitest";
import { copyText } from "./copy-text";

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

it("copies the supplied text and clears its timer on success", async () => {
  vi.useFakeTimers(); const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal("navigator", { clipboard: { writeText } });
  await copyText("도움이 필요해요.");
  expect(writeText).toHaveBeenCalledWith("도움이 필요해요.");
  expect(vi.getTimerCount()).toBe(0);
});
it("preserves a denied permission failure and clears its timer", async () => {
  vi.useFakeTimers(); const error = new Error("Not allowed");
  vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockRejectedValue(error) } });
  await expect(copyText("Draft")).rejects.toBe(error);
  expect(vi.getTimerCount()).toBe(0);
});
it("rejects a request that stays pending so the guide can show manual-copy instructions", async () => {
  vi.useFakeTimers(); vi.stubGlobal("navigator", { clipboard: { writeText: () => new Promise<void>(() => {}) } });
  const outcome = expect(copyText("Draft")).rejects.toThrow("timed out");
  await vi.advanceTimersByTimeAsync(5000); await outcome;
  expect(vi.getTimerCount()).toBe(0);
});
it("lets callers show their fallback when clipboard access is unavailable", async () => {
  vi.stubGlobal("navigator", {});
  await expect(copyText("Draft")).rejects.toBeInstanceOf(Error);
});
