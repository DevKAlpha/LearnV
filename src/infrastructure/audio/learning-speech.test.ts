import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLearningSpeech } from "./learning-speech";

function fixture() {
  const utterances: SpeechSynthesisUtterance[] = [];
  const engine = { cancel: vi.fn(), resume: vi.fn(), paused: false, speak: vi.fn((utterance) => utterances.push(utterance)) };
  const player = createLearningSpeech(engine, (text) => ({ text } as SpeechSynthesisUtterance));
  const voice = { lang: "en-IN", name: "Natural Indian", voiceURI: "Indian", localService: false } as SpeechSynthesisVoice;
  const options = { text: "Listen carefully. Apply the previous idea.", voice, rate: 0.98, onComplete: vi.fn(), onFailure: vi.fn() };
  return { utterances, engine, player, options };
}
describe("owned, bounded study playback", () => {
  beforeEach(() => vi.useFakeTimers()); afterEach(() => vi.useRealTimers());
  it("uses the selected real locale and untouched pitch, completing only after all phrases", () => {
    const { player, utterances, options } = fixture(); player.play(options);
    expect(utterances[0]).toMatchObject({ lang: "en-IN", voice: options.voice, rate: 0.98, pitch: 1, volume: 1, text: "Listen carefully." });
    utterances[0].onend?.({} as SpeechSynthesisEvent);
    expect(options.onComplete).not.toHaveBeenCalled();
    expect(utterances[1].text).toBe("Apply the previous idea.");
    utterances[1].onend?.({} as SpeechSynthesisEvent);
    expect(options.onComplete).toHaveBeenCalledTimes(1); expect(vi.getTimerCount()).toBe(0);
  });
  it("ignores delayed callbacks after stop and never grants completion", () => {
    const { player, utterances, options } = fixture(); player.play(options);
    const staleEnd = utterances[0].onend, staleError = utterances[0].onerror;
    player.stop(); staleEnd?.call(utterances[0], {} as SpeechSynthesisEvent); staleError?.call(utterances[0], { error: "interrupted" } as SpeechSynthesisErrorEvent);
    expect(options.onComplete).not.toHaveBeenCalled(); expect(options.onFailure).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
  });
  it("starts another run without replaying old phrases or callbacks", () => {
    const { player, utterances, options } = fixture(); player.play(options);
    const oldEnd = utterances[0].onend; player.play({ ...options, text: "New run." }); oldEnd?.call(utterances[0], {} as SpeechSynthesisEvent);
    expect(utterances).toHaveLength(2); expect(utterances[1].text).toBe("New run.");
    utterances[1].onend?.({} as SpeechSynthesisEvent); expect(options.onComplete).toHaveBeenCalledTimes(1);
  });
  it("bounds a silent startup and lets the user retry", () => {
    const { player, options } = fixture(); player.play(options); vi.advanceTimersByTime(8000);
    expect(options.onFailure).toHaveBeenCalledWith("study-audio-start-timeout"); expect(options.onComplete).not.toHaveBeenCalled();
    player.play(options); expect(vi.getTimerCount()).toBe(1); player.stop();
  });
  it("replaces startup timeout with a bounded completion timeout", () => {
    const { player, utterances, options } = fixture(); player.play(options); utterances[0].onstart?.({} as SpeechSynthesisEvent);
    vi.advanceTimersByTime(8000); expect(options.onFailure).not.toHaveBeenCalled();
    vi.advanceTimersByTime(52000); expect(options.onFailure).toHaveBeenCalledWith("study-audio-completion-timeout");
  });
  it("does not falsely complete after synthesis errors", () => {
    const { player, utterances, options } = fixture(); player.play(options); utterances[0].onerror?.({ error: "network" } as SpeechSynthesisErrorEvent);
    expect(options.onFailure).toHaveBeenCalledWith("study-audio-network"); expect(options.onComplete).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
  });
  it("handles throwing engines, empty text and a previously paused engine", () => {
    const { player, engine, options } = fixture(); engine.paused = true; player.play(options); expect(engine.resume).toHaveBeenCalledTimes(1);
    engine.speak.mockImplementation(() => { throw new Error("No engine"); }); player.play(options);
    expect(options.onFailure).toHaveBeenCalledWith("study-audio-failed");
    player.play({ ...options, text: "  " }); expect(options.onFailure).toHaveBeenCalledWith("study-audio-empty");
    expect(vi.getTimerCount()).toBe(0);
  });
});
