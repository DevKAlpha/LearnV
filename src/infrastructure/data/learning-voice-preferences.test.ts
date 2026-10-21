import { describe, expect, it, vi } from "vitest";
import { defaultVoicePreference } from "@/domain/models/learning-voice";
import { learningVoiceStorageKey, observeVoicePreference, readVoicePreference, saveVoicePreference } from "./learning-voice-preferences";
const environment = vi.hoisted(() => ({ qa: false }));
vi.mock("@/infrastructure/config/app-scope", () => ({ scopedStorageKey: (key: string) => environment.qa ? `qa:${key}` : key }));
describe("voice preferences", () => {
  it("isolates languages and QA from production", () => {
    const values = new Map<string, string>(); const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) };
    environment.qa = false;
    saveVoicePreference("en", { accent: "en-IN", voiceURI: "Indian", pace: "clear" }, storage);
    expect(readVoicePreference("ko", storage)).toEqual(defaultVoicePreference);
    environment.qa = true; expect(learningVoiceStorageKey("en")).toMatch(/^qa:/);
    expect(readVoicePreference("en", storage)).toEqual(defaultVoicePreference);
    saveVoicePreference("en", { accent: "en-US", voiceURI: "American", pace: "natural" }, storage);
    environment.qa = false; expect(readVoicePreference("en", storage).accent).toBe("en-IN");
  });
  it("keeps working with malformed JSON and denied storage", () => {
    expect(readVoicePreference("en", { getItem: () => "{invalid" })).toEqual(defaultVoicePreference);
    expect(readVoicePreference("en", { getItem: () => { throw new Error("denied"); } })).toEqual(defaultVoicePreference);
    expect(() => saveVoicePreference("ko", defaultVoicePreference, { setItem: () => { throw new Error("denied"); } })).not.toThrow();
  });
  it("synchronises same-language players even when persistence is denied", () => {
    environment.qa = false;
    const events = new EventTarget(); const en = vi.fn(), ko = vi.fn();
    const disposeEn = observeVoicePreference("en", en, events);
    const disposeKo = observeVoicePreference("ko", ko, events);
    const next = { accent: "en-SG", voiceURI: "Singapore", pace: "clear" as const };
    saveVoicePreference("en", next, { setItem: () => { throw new Error("denied"); } }, events);
    expect(en).toHaveBeenLastCalledWith(next); expect(ko).not.toHaveBeenCalled();
    disposeEn(); disposeKo(); en.mockClear();
    saveVoicePreference("en", next, { setItem: vi.fn() }, events);
    expect(en).not.toHaveBeenCalled();
  });
  it("accepts matching storage events, resets malformed settings and ignores other scopes", () => {
    environment.qa = false;
    const events = new EventTarget(); const update = vi.fn();
    const stop = observeVoicePreference("ko", update, events);
    const publish = (key: string, newValue: string | null) => events.dispatchEvent(Object.assign(new Event("storage"), { key, newValue }));
    publish(learningVoiceStorageKey("en"), '{}'); publish(`qa:${learningVoiceStorageKey("ko")}`, '{}');
    expect(update).not.toHaveBeenCalled();
    publish(learningVoiceStorageKey("ko"), JSON.stringify({ accent: "ko-KR", voiceURI: "Korean", pace: "challenge" }));
    expect(update).toHaveBeenLastCalledWith({ accent: "ko-KR", voiceURI: "Korean", pace: "challenge" });
    publish(learningVoiceStorageKey("ko"), "invalid"); expect(update).toHaveBeenLastCalledWith(defaultVoicePreference);
    publish(learningVoiceStorageKey("ko"), null); expect(update).toHaveBeenLastCalledWith(defaultVoicePreference);
    stop(); update.mockClear(); publish(learningVoiceStorageKey("ko"), '{}'); expect(update).not.toHaveBeenCalled();
  });
  it("resets every language after storage is cleared in another tab", () => {
    environment.qa = false;
    const events = new EventTarget(); const en = vi.fn(), ko = vi.fn();
    const stopEn = observeVoicePreference("en", en, events);
    const stopKo = observeVoicePreference("ko", ko, events);
    events.dispatchEvent(Object.assign(new Event("storage"), { key: null, newValue: null }));
    expect(en).toHaveBeenLastCalledWith(defaultVoicePreference);
    expect(ko).toHaveBeenLastCalledWith(defaultVoicePreference);
    stopEn(); stopKo();
  });
});
