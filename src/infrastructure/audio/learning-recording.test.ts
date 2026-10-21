import { afterEach, describe, expect, it, vi } from "vitest";
import { createLearningRecording } from "./learning-recording";

afterEach(() => vi.useRealTimers());

function fixture() {
  const tracks = [{ stop: vi.fn() }]; const stream = { getTracks: () => tracks } as unknown as MediaStream;
  const recorder = {
    state: "inactive", mimeType: "audio/webm", ondataavailable: null, onstop: null, onerror: null,
    start: vi.fn(() => { Object.assign(recorder, { state: "recording" }); }),
    stop: vi.fn(() => { Object.assign(recorder, { state: "inactive" }); recorder.onstop?.({} as Event); }),
  } as unknown as MediaRecorder;
  const options = { getStream: vi.fn(async () => stream), makeRecorder: vi.fn(() => recorder), onPending: vi.fn(), onStarted: vi.fn(), onRecorded: vi.fn(), onFailure: vi.fn() };
  const player = createLearningRecording(options);
  const data = () => recorder.ondataavailable?.({ data: new Blob(["recording"]) } as BlobEvent);
  return { tracks, stream, recorder, options, player, data };
}

describe("exercise-owned recording", () => {
  it("produces one non-empty recording and always releases the microphone", async () => {
    const f = fixture(); await f.player.start(); const oldStop = f.recorder.onstop;
    f.data(); f.player.stop(); oldStop?.call(f.recorder, {} as Event);
    expect(f.options.onRecorded).toHaveBeenCalledTimes(1);
    expect(f.options.onRecorded.mock.calls[0][0].size).toBeGreaterThan(0);
    expect(f.tracks[0].stop).toHaveBeenCalledTimes(1); expect(f.options.onFailure).not.toHaveBeenCalled();
  });
  it("cancels a pending permission result after leaving without recording or leaking tracks", async () => {
    const f = fixture(); let resolve!: (stream: MediaStream) => void;
    f.options.getStream.mockImplementation(() => new Promise((done) => { resolve = done; }));
    const start = f.player.start(); f.player.dispose(); resolve(f.stream); await start;
    expect(f.options.makeRecorder).not.toHaveBeenCalled(); expect(f.options.onStarted).not.toHaveBeenCalled();
    expect(f.options.onRecorded).not.toHaveBeenCalled(); expect(f.tracks[0].stop).toHaveBeenCalledTimes(1);
  });
  it("deduplicates double clicks during permission requests and recording", async () => {
    const f = fixture(); const start = f.player.start(); await f.player.start(); await start;
    await f.player.start(); expect(f.options.getStream).toHaveBeenCalledTimes(1);
    f.player.dispose(); expect(f.tracks[0].stop).toHaveBeenCalledTimes(1);
  });
  it("rejects empty recordings rather than granting speaking evidence", async () => {
    const f = fixture(); await f.player.start(); f.player.stop();
    expect(f.options.onRecorded).not.toHaveBeenCalled(); expect(f.options.onFailure).toHaveBeenCalledWith("microphone-recording-empty", undefined);
    expect(f.tracks[0].stop).toHaveBeenCalledTimes(1);
  });
  it("ignores delayed data/stop/error callbacks from an old exercise", async () => {
    const f = fixture(); await f.player.start();
    const oldStop = f.recorder.onstop, oldData = f.recorder.ondataavailable, oldError = f.recorder.onerror;
    f.player.dispose();
    oldData?.call(f.recorder, { data: new Blob(["late"]) } as BlobEvent);
    oldStop?.call(f.recorder, {} as Event); oldError?.call(f.recorder, new Event("error") as ErrorEvent);
    expect(f.options.onRecorded).not.toHaveBeenCalled(); expect(f.options.onFailure).not.toHaveBeenCalled();
    await f.player.start(); f.data(); f.player.stop(); expect(f.options.onRecorded).toHaveBeenCalledTimes(1);
  });
  it("recovers from denied permissions and throwing recorder construction/start", async () => {
    const f = fixture(); f.options.getStream.mockRejectedValueOnce(new Error("denied")); await f.player.start();
    expect(f.options.onFailure).toHaveBeenCalledWith("microphone-start-failed", expect.any(Error));
    f.options.makeRecorder.mockImplementationOnce(() => { throw new Error("codec"); }); await f.player.start();
    expect(f.tracks[0].stop).toHaveBeenCalledTimes(1);
    vi.mocked(f.recorder.start).mockImplementationOnce(() => { throw new Error("start"); }); await f.player.start();
    expect(f.tracks[0].stop).toHaveBeenCalledTimes(2);
    await f.player.start(); f.data(); f.player.stop(); expect(f.options.onRecorded).toHaveBeenCalledTimes(1);
  });
  it("releases tracks and surfaces mid-recording and stop failures", async () => {
    const f = fixture(); await f.player.start(); f.recorder.onerror?.(new Event("error") as ErrorEvent);
    expect(f.options.onFailure).toHaveBeenCalledWith("microphone-recording-failed", expect.any(Event));
    await f.player.start(); vi.mocked(f.recorder.stop).mockImplementationOnce(() => { throw new Error("stop"); }); f.player.stop();
    expect(f.options.onFailure).toHaveBeenCalledWith("microphone-stop-failed", expect.any(Error));
    expect(f.tracks[0].stop).toHaveBeenCalledTimes(2);
  });
  it("bounds a missing stop callback, releases tracks and permits a fresh recording", async () => {
    vi.useFakeTimers();
    const f = fixture(); await f.player.start(); f.data();
    const oldStop = f.recorder.onstop;
    vi.mocked(f.recorder.stop).mockImplementationOnce(() => { Object.assign(f.recorder, { state: "inactive" }); });
    f.player.stop(); f.player.stop();
    expect(f.tracks[0].stop).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(5000);
    expect(f.options.onFailure).toHaveBeenCalledWith("microphone-stop-timeout");
    expect(f.options.onFailure).toHaveBeenCalledTimes(1);
    oldStop?.call(f.recorder, {} as Event);
    expect(f.options.onRecorded).not.toHaveBeenCalled();
    await f.player.start(); f.data(); f.player.stop();
    expect(f.options.onRecorded).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(5000);
    expect(f.options.onFailure).toHaveBeenCalledTimes(1);
  });
  it("clears the stop watchdog when leaving before the queued callback", async () => {
    vi.useFakeTimers();
    const f = fixture(); await f.player.start();
    vi.mocked(f.recorder.stop).mockImplementationOnce(() => { Object.assign(f.recorder, { state: "inactive" }); });
    f.player.stop(); f.player.dispose();
    await vi.advanceTimersByTimeAsync(5000);
    expect(f.options.onFailure).not.toHaveBeenCalled();
    expect(f.options.onRecorded).not.toHaveBeenCalled();
    expect(f.tracks[0].stop).toHaveBeenCalledTimes(1);
  });
});
