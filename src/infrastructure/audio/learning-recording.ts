type Options = {
  getStream: () => Promise<MediaStream>;
  makeRecorder: (stream: MediaStream) => MediaRecorder;
  onPending: () => void;
  onStarted: () => void;
  onRecorded: (recording: Blob) => void;
  onFailure: (code: string, error?: unknown) => void;
};

/** Permission and recorder callbacks belong to one exercise/run, never its successor. */
export function createLearningRecording(options: Options) {
  let generation = 0;
  let pending = false;
  let stopping = false;
  let stopTimer: ReturnType<typeof setTimeout> | undefined;
  let recorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  const releaseStream = (value: MediaStream | null) => value?.getTracks().forEach((track) => track.stop());
  const releaseCurrentStream = () => { const previous = stream; stream = null; releaseStream(previous); };
  const detach = (value: MediaRecorder | null) => {
    if (value) { value.ondataavailable = null; value.onstop = null; value.onerror = null; }
  };
  const dispose = () => {
    generation++; pending = false; stopping = false; clearTimeout(stopTimer); stopTimer = undefined;
    const previous = recorder; recorder = null; detach(previous);
    try { if (previous?.state !== "inactive") previous?.stop(); } catch { /* Always release tracks. */ }
    releaseCurrentStream();
  };
  const start = async () => {
    if (pending || recorder) return;
    dispose(); const run = generation; pending = true; options.onPending();
    const active = () => run === generation;
    const fail = (code: string, error?: unknown) => { if (active()) { dispose(); options.onFailure(code, error); } };
    try {
      const acquired = await options.getStream();
      if (!active()) { releaseStream(acquired); return; }
      stream = acquired; pending = false;
      const current = options.makeRecorder(acquired); recorder = current;
      const chunks: Blob[] = [];
      current.ondataavailable = (event) => { if (active() && event.data.size) chunks.push(event.data); };
      current.onerror = (event) => fail("microphone-recording-failed", event);
      current.onstop = () => {
        if (!active()) return;
        clearTimeout(stopTimer); stopTimer = undefined; stopping = false;
        detach(current); recorder = null; releaseCurrentStream();
        const recording = new Blob(chunks, { type: current.mimeType || "audio/webm" });
        if (!recording.size) { fail("microphone-recording-empty"); return; }
        generation++;
        options.onRecorded(recording);
      };
      current.start(); options.onStarted();
    } catch (error) { fail("microphone-start-failed", error); }
  };
  const stop = () => {
    if (!recorder || stopping) return;
    stopping = true;
    const run = generation;
    // stop() queues final data/stop events. A broken recorder must not keep
    // the controls or microphone active forever if those events never arrive.
    stopTimer = setTimeout(() => {
      if (generation !== run) return;
      dispose(); options.onFailure("microphone-stop-timeout");
    }, 5000);
    try {
      if (recorder.state !== "inactive") recorder.stop();
      releaseCurrentStream();
    }
    catch (error) { dispose(); options.onFailure("microphone-stop-failed", error); }
  };
  return { start, stop, dispose };
}
