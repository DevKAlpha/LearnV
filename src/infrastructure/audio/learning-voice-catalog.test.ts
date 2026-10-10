import { afterEach, describe, expect, it, vi } from "vitest";
import { observeLearningVoices } from "./learning-voice-catalog";

describe("late device voice discovery", () => {
  afterEach(() => vi.useRealTimers());
  const fixture = () => {
    const events = new EventTarget();
    let voices: SpeechSynthesisVoice[] = [];
    const engine = { getVoices: vi.fn(() => voices), addEventListener: events.addEventListener.bind(events), removeEventListener: events.removeEventListener.bind(events) };
    const update = vi.fn();
    const stop = observeLearningVoices(engine, update);
    return { engine, update, stop, publish: (value: SpeechSynthesisVoice[]) => { voices = value; events.dispatchEvent(new Event("voiceschanged")); } };
  };
  it("settles empty discovery and still accepts voices arriving after the deadline", () => {
    vi.useFakeTimers();
    const sample = fixture();
    expect(sample.update).toHaveBeenLastCalledWith([], true);
    vi.advanceTimersByTime(3000);
    expect(sample.update).toHaveBeenLastCalledWith([], false);
    const voice = { name: "한국어", lang: "ko-KR" } as SpeechSynthesisVoice;
    sample.publish([voice]);
    expect(sample.update).toHaveBeenLastCalledWith([voice], false);
    sample.publish([]);
    expect(sample.update).toHaveBeenLastCalledWith([], false);
    sample.stop();
  });
  it("cleans listeners and timeout on leaving the exercise", () => {
    vi.useFakeTimers();
    const sample = fixture(); sample.stop(); sample.update.mockClear();
    sample.publish([]); vi.advanceTimersByTime(5000);
    expect(sample.update).not.toHaveBeenCalled();
  });
  it("recovers if enumeration throws without keeping loading indefinitely", () => {
    vi.useFakeTimers();
    const sample = fixture();
    sample.engine.getVoices.mockImplementationOnce(() => { throw new Error("Unavailable"); });
    sample.publish([]);
    expect(sample.update).toHaveBeenLastCalledWith([], false);
    sample.stop();
  });
});
