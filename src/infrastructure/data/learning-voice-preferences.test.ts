import { describe, expect, it, vi } from "vitest";
import { defaultVoicePreference } from "@/domain/models/learning-voice";
import { learningVoiceStorageKey, readVoicePreference, saveVoicePreference } from "./learning-voice-preferences";
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
});
