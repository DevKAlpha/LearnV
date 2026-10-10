import { describe, expect, it } from "vitest";
import { defaultVoicePreference, languageVoices, learningSpeechChunks, sanitizeVoicePreference, selectLearningVoice, voiceAccents, voicePaces, type LearningVoice } from "./learning-voice";

const voice = (lang: string, name = lang, localService = true): LearningVoice => ({ lang, name, localService, default: false, voiceURI: name });
describe("native language and accent selection", () => {
  it("never uses a different language or matches a language substring", () => {
    expect(selectLearningVoice([voice("ko-KR"), voice("fr-FR"), voice("eng-US")], "en", defaultVoicePreference).voice).toBeNull();
    expect(languageVoices([voice("EN_gb"), voice("en"), voice("ko-KR")], "en")).toHaveLength(2);
  });
  it("prioritises natural/enhanced voice hints without inventing quality guarantees", () => {
    expect(selectLearningVoice([voice("en-GB", "Legacy"), voice("en-US", "Premium")], "en", defaultVoicePreference).voice?.name).toBe("Premium");
    expect(selectLearningVoice([voice("en-US", "Default"), voice("en-GB", "British")], "en", defaultVoicePreference).voice?.name).toBe("British");
  });
  it.each(voiceAccents.en)("selects real %s accent ahead of a different neural locale", (accent) => {
    const expected = voice(accent, "Selected accent");
    const result = selectLearningVoice([voice("en-ZA", "Neural"), expected], "en", { ...defaultVoicePreference, accent });
    expect(result.voice).toBe(expected); expect(result.accentUnavailable).toBe(false);
  });
  it("respects a manually chosen voice", () => {
    const result = selectLearningVoice([voice("en-US", "Legacy"), voice("en-US", "Neural")], "en", { ...defaultVoicePreference, accent: "en-US", voiceURI: "Legacy" });
    expect(result.voice?.name).toBe("Legacy");
  });
  it("reports an unavailable saved accent and displays the actual fallback", () => {
    const result = selectLearningVoice([voice("en-GB", "British")], "en", { ...defaultVoicePreference, accent: "en-SG", voiceURI: "Lost voice" });
    expect(result.accentUnavailable).toBe(true); expect(result.voiceUnavailable).toBe(true); expect(result.voice?.lang).toBe("en-GB");
  });
  it("keeps Korean synthesis in Korean and supports more than one speaker", () => {
    const voices = [voice("en-KR", "English in Korea"), voice("ko-KR", "Korean"), voice("ko-KR", "Enhanced Korean")];
    const result = selectLearningVoice(voices, "ko", defaultVoicePreference);
    expect(result.voice?.name).toBe("Enhanced Korean"); expect(result.candidates).toHaveLength(2);
    expect(voiceAccents.ko).toEqual(["ko-KR"]);
  });
  it("deduplicates voices and keeps input arrays untouched", () => {
    const voices = [voice("en-GB", "One"), voice("en-GB", "One"), voice("en-US", "Two")];
    const before = [...voices]; expect(languageVoices(voices, "en")).toHaveLength(2);
    selectLearningVoice(voices, "en", defaultVoicePreference); expect(voices).toEqual(before);
  });
  it("uses conservative pace presets and validates malformed preferences", () => {
    expect(voicePaces).toEqual({ clear: 0.85, natural: 0.98, challenge: 1.08 });
    expect(sanitizeVoicePreference({ accent: "en-US", pace: "extreme", voiceURI: 123 }, "ko")).toEqual(defaultVoicePreference);
    expect(sanitizeVoicePreference({ accent: "en-IN", pace: "clear", voiceURI: "Indian voice" }, "en")).toEqual({ accent: "en-IN", pace: "clear", voiceURI: "Indian voice" });
    expect(sanitizeVoicePreference(null, "en")).toEqual(defaultVoicePreference);
  });
});

describe("speech phrasing", () => {
  it.each([
    "We meet at 3.30 p.m. Bring your draft! Have you checked it?",
    "내일 세 시에 만나요. 초안을 가져오세요! 준비됐어요?",
    "Don’t memorise the script. Use your own evidence, and explain why it matters.",
  ])("preserves words, punctuation and ordering: %s", (text) => {
    expect(learningSpeechChunks(text).join(" ")).toBe(text);
  });
  it("bounds long utterances without dropping tokens", () => {
    const text = Array.from({ length: 100 }, (_, index) => `word${index}`).join(" ");
    const chunks = learningSpeechChunks(text);
    expect(chunks.length).toBeGreaterThan(1); expect(chunks.every((chunk) => chunk.length <= 260)).toBe(true);
    expect(chunks.join(" ")).toBe(text);
  });
  it("handles empty and unspaced Unicode without breaking characters", () => {
    expect(learningSpeechChunks(" \n ")).toEqual([]);
    const text = "한🙂".repeat(200);
    expect(learningSpeechChunks(text).join("")).toBe(text);
    expect(() => learningSpeechChunks("Test", 0)).toThrow();
  });
});
