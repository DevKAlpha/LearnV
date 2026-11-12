import { describe, expect, it } from "vitest";
import { buildQueue, interleave, intervalDays, isDue, newCard, normalizeCard, previewIntervals, RELEARN_MINUTES, retrievability, review, type CardState } from "./srs";

const start = new Date("2026-11-12T09:00:00.000Z");
const days = (value: number) => new Date(start.getTime() + value * 86_400_000);

describe("FSRS scheduler", () => {
  it("gives the target interval when stability equals the elapsed time", () => {
    expect(retrievability(10, 10)).toBeCloseTo(0.9, 5);
    expect(intervalDays(10)).toBe(10);
    expect(intervalDays(0.1)).toBe(1);
    expect(intervalDays(10_000)).toBe(365);
  });

  it("schedules a new card by its first rating", () => {
    const card = newCard("ko:학교", start);
    const again = review(card, 1, start);
    const good = review(card, 3, start);
    const easy = review(card, 4, start);
    expect(Date.parse(again.due) - start.getTime()).toBe(RELEARN_MINUTES * 60_000);
    expect(again.lapses).toBe(1);
    expect(Date.parse(good.due)).toBeLessThan(Date.parse(easy.due));
    expect(good.difficulty).toBeGreaterThan(easy.difficulty);
  });

  it("grows the interval with each successful review and shrinks stability on a lapse", () => {
    let card = review(newCard("en:however", start), 3, start);
    const first = card.stability;
    card = review(card, 3, new Date(card.due));
    expect(card.stability).toBeGreaterThan(first);
    const beforeLapse = card.stability;
    const lapsed = review(card, 1, new Date(card.due));
    expect(lapsed.stability).toBeLessThan(beforeLapse);
    expect(lapsed.lapses).toBe(1);
    expect(isDue(lapsed, new Date(Date.parse(lapsed.due) + 1))).toBe(true);
  });

  it("orders rating previews from again to easy", () => {
    const card = review(newCard("x", start), 3, start);
    const preview = previewIntervals(card, days(3));
    expect(preview[1]).toBeLessThan(preview[2]);
    expect(preview[2]).toBeLessThanOrEqual(preview[3]);
    expect(preview[3]).toBeLessThanOrEqual(preview[4]);
  });

  it("rejects corrupted cards", () => {
    const valid = review(newCard("ok", start), 3, start);
    expect(normalizeCard(valid)).toEqual(valid);
    expect(normalizeCard({ ...valid, due: "tomorrow" })).toBeNull();
    expect(normalizeCard({ ...valid, stability: Number.NaN })).toBeNull();
    expect(normalizeCard({ ...valid, difficulty: 40 })).toBeNull();
    expect(normalizeCard(null)).toBeNull();
  });

  it("builds a queue of due reviews first, capped new cards after", () => {
    const states: Record<string, CardState> = {
      a: { ...review(newCard("a", start), 3, start), due: days(-1).toISOString() },
      b: { ...review(newCard("b", start), 3, start), due: days(5).toISOString() },
    };
    const queue = buildQueue(["a", "b", "c", "d", "e"], states, start, { newLimit: 2, reviewLimit: 50 });
    expect(queue.due).toEqual(["a"]);
    expect(queue.fresh).toEqual(["c", "d"]);
  });

  it("interleaves groups without losing items", () => {
    const items = ["v1", "v2", "v3", "g1", "g2", "l1"];
    expect(interleave(items, (item) => item[0])).toEqual(["v1", "g1", "l1", "v2", "g2", "v3"]);
  });
});
