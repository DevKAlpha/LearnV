import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { afterEach, describe, expect, it, vi } from "vitest";

// Exercise the actual pre-React scripts, including failures where React never starts.
const html = readFileSync(new URL("../../../index.html", import.meta.url), "utf8");
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);

function boot({ deniedStorage = false, href = "https://example.com/LearnV/study", online = true } = {}) {
  const events = new Map<string, (() => void)[]>();
  const documentEvents = new Map<string, (() => void)[]>();
  const on = (target: Map<string, (() => void)[]>, type: string, listener: () => void) => {
    target.set(type, [...target.get(type) ?? [], listener]);
  };
  const off = (target: Map<string, (() => void)[]>, type: string, listener: () => void) => {
    target.set(type, (target.get(type) ?? []).filter((item) => item !== listener));
  };
  const classes = new Set<string>();
  const classList = { add: (...values: string[]) => values.forEach((value) => classes.add(value)), remove: (...values: string[]) => values.forEach((value) => classes.delete(value)) };
  const status = { textContent: "LearnV" };
  const retry = { hidden: true, textContent: "", addEventListener: vi.fn() };
  const loader = {
    isConnected: true, classList, setAttribute: vi.fn(),
    querySelector: (selector: string) => selector === "strong" ? status : retry,
    remove: () => { loader.isConnected = false; },
  };
  const stored = new Map<string, string>();
  const storage = {
    getItem: (key: string) => { if (deniedStorage) throw new Error("Storage denied"); return stored.get(key) ?? null; },
    setItem: (key: string, value: string) => { if (deniedStorage) throw new Error("Storage denied"); stored.set(key, value); },
  };
  const document = {
    documentElement: { dataset: {} as Record<string, string>, style: {}, classList, lang: "" },
    getElementById: () => loader,
    visibilityState: "visible",
    addEventListener: (type: string, listener: () => void) => on(documentEvents, type, listener),
    removeEventListener: (type: string, listener: () => void) => off(documentEvents, type, listener),
  };
  const location = { href, search: new URL(href).search, replace: vi.fn() };
  const window = { setTimeout, clearTimeout } as Record<string, unknown>;
  const navigator = { onLine: online };
  const context = {
    window, document, location, navigator, localStorage: storage, sessionStorage: storage,
    URL, Date, clearTimeout, matchMedia: () => ({ matches: false }),
    HTMLScriptElement: class {}, HTMLLinkElement: class {},
    addEventListener: (type: string, listener: () => void) => on(events, type, listener),
    removeEventListener: (type: string, listener: () => void) => off(events, type, listener),
  };
  scripts.forEach((script) => runInNewContext(script, context));
  return {
    document, navigator, window, location, loader, retry, classes,
    fire: (type: string) => (events.get(type) ?? []).forEach((listener) => listener()),
    visible: () => (documentEvents.get("visibilitychange") ?? []).forEach((listener) => listener()),
  };
}

afterEach(() => vi.useRealTimers());

describe("mobile bootstrap recovery", () => {
  it("automatically refreshes a startup that never reaches React", () => {
    vi.useFakeTimers();
    const app = boot();
    vi.advanceTimersByTime(6_000);
    expect(app.location.replace).toHaveBeenCalledOnce();
    expect(new URL(app.location.replace.mock.calls[0][0]).pathname).toBe("/LearnV/study");
    expect(app.retry.hidden).toBe(true);
  });

  it("does not refresh repeatedly after a failed recovery", () => {
    vi.useFakeTimers();
    const app = boot({ href: `https://example.com/LearnV/study?learnv-recover=${Date.now()}` });
    vi.advanceTimersByTime(6_000);
    expect(app.location.replace).not.toHaveBeenCalled();
    expect(app.retry.hidden).toBe(false);
    expect(app.classes.has("is-stalled")).toBe(true);
  });

  it("can start and automatically recover when storage access is denied", () => {
    vi.useFakeTimers();
    const app = boot({ deniedStorage: true });
    vi.advanceTimersByTime(6_000);
    expect(app.location.replace).toHaveBeenCalledOnce();
    expect(app.document.documentElement.dataset.theme).toBe("light");
  });

  it("checks wall time when a frozen mobile tab returns before its timers run", () => {
    vi.useFakeTimers();
    const app = boot();
    vi.setSystemTime(Date.now() + 3 * 24 * 60 * 60 * 1_000);
    app.fire("pageshow");
    app.visible();
    expect(app.location.replace).toHaveBeenCalledOnce();
  });

  it("reveals an already usable restored tab without reloading", () => {
    vi.useFakeTimers();
    const app = boot();
    app.document.documentElement.dataset.learnvReady = "true";
    app.classes.add("app-visual-loading");
    app.fire("pageshow");
    vi.advanceTimersByTime(10_000);
    expect(app.loader.isConnected).toBe(false);
    expect(app.classes.has("app-visual-loading")).toBe(false);
    expect(app.location.replace).not.toHaveBeenCalled();
  });

  it("waits for connectivity before retrying an offline startup", () => {
    vi.useFakeTimers();
    const app = boot({ online: false });
    vi.advanceTimersByTime(6_000);
    expect(app.location.replace).not.toHaveBeenCalled();
    expect(app.retry.hidden).toBe(false);
    app.navigator.onLine = true;
    app.fire("online");
    expect(app.location.replace).toHaveBeenCalledOnce();
  });

  it("cleans up bootstrap timers and lifecycle listeners after the app commits", () => {
    vi.useFakeTimers();
    const app = boot();
    (app.window.__learnvBootstrapCleanup as () => void)();
    vi.advanceTimersByTime(10_000);
    app.fire("online");
    expect(app.location.replace).not.toHaveBeenCalled();
  });
});
