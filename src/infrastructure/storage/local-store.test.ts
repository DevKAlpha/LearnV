import { describe, expect, it, vi } from "vitest";
import { createLocalStore } from "./local-store";

function memory(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return { map, getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => { map.set(key, value); } };
}

function eventTarget() {
  const target = new EventTarget();
  return Object.assign(target, {
    fire(key: string | null) { target.dispatchEvent(Object.assign(new Event("storage"), { key })); },
  });
}

const parseCount = (raw: unknown) => {
  if (typeof raw !== "object" || raw === null || typeof (raw as { count?: unknown }).count !== "number") throw new Error("bad");
  return { count: (raw as { count: number }).count };
};

describe("local store", () => {
  it("falls back on corrupted data and reports it", () => {
    const onError = vi.fn();
    const store = createLocalStore({ key: "k", parse: parseCount, fallback: { count: 0 }, storage: memory({ k: "{oops" }), events: null, onError });
    expect(store.get()).toEqual({ count: 0 });
    expect(onError).toHaveBeenCalledWith("read-failed", expect.anything());
  });

  it("writes, notifies subscribers and keeps a stable reference between reads", () => {
    const storage = memory();
    const store = createLocalStore({ key: "k", parse: parseCount, fallback: { count: 0 }, storage, events: null });
    const listener = vi.fn();
    store.subscribe(listener);
    expect(store.set((current) => ({ count: current.count + 1 }))).toBe(true);
    expect(storage.map.get("k")).toBe("{\"count\":1}");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.get()).toBe(store.get());
  });

  it("follows another tab through one shared storage listener", () => {
    const storage = memory({ k: "{\"count\":1}" });
    const events = eventTarget();
    const add = vi.spyOn(events, "addEventListener");
    const store = createLocalStore({ key: "k", parse: parseCount, fallback: { count: 0 }, storage, events });
    const first = vi.fn();
    const second = vi.fn();
    const offFirst = store.subscribe(first);
    store.subscribe(second);
    expect(add).toHaveBeenCalledTimes(1);
    storage.map.set("k", "{\"count\":5}");
    events.fire("k");
    expect(store.get()).toEqual({ count: 5 });
    expect(first).toHaveBeenCalledTimes(1);
    events.fire("other");
    expect(second).toHaveBeenCalledTimes(1);
    offFirst();
  });

  it("keeps the value in memory when storage refuses the write", () => {
    const store = createLocalStore({
      key: "k", parse: parseCount, fallback: { count: 0 }, events: null,
      storage: { getItem: () => null, setItem: () => { throw new Error("QuotaExceededError"); } },
    });
    expect(store.set({ count: 3 })).toBe(false);
    expect(store.get()).toEqual({ count: 3 });
  });
});
