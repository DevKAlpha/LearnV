import { describe, expect, it } from "vitest";
import { radarFreshness } from "./gks-radar";

describe("radar freshness", () => {
  const now = new Date("2026-11-10T12:00:00.000Z");
  it("is fresh within 48 hours", () => {
    expect(radarFreshness("2026-11-09T12:00:00.000Z", now)).toEqual({ stale: false, daysAgo: 1 });
  });
  it("flags snapshots older than 48 hours", () => {
    expect(radarFreshness("2026-09-21T12:00:00.000Z", now)).toEqual({ stale: true, daysAgo: 50 });
  });
  it("treats an unreadable date as stale", () => {
    expect(radarFreshness("not a date", now)).toEqual({ stale: true, daysAgo: null });
  });
});
