import { learningSpeechChunks } from "@/domain/models/learning-voice";

type Utterance = Pick<SpeechSynthesisUtterance, "text" | "voice" | "lang" | "rate" | "pitch" | "volume" | "onstart" | "onend" | "onerror">;
type Engine = { cancel: () => void; speak: (utterance: Utterance) => void; resume: () => void; paused: boolean };
type Options = { text: string; voice: SpeechSynthesisVoice; rate: number; onComplete: () => void; onFailure: (code: string) => void };

/** One owned playback, bounded startup/completion, and no stale callbacks after stop. */
export function createLearningSpeech(engine: Engine, makeUtterance: (text: string) => Utterance) {
  let generation = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let current: Utterance | null = null;
  const stop = () => {
    generation++; clearTimeout(timer);
    if (current) { current.onstart = null; current.onend = null; current.onerror = null; }
    current = null;
    try { engine.cancel(); } catch { /* Broken engines must not block navigation. */ }
  };
  const play = (options: Options) => {
    stop();
    const run = generation;
    const chunks = learningSpeechChunks(options.text);
    let index = 0;
    const fail = (code: string) => {
      if (generation !== run) return;
      stop(); options.onFailure(code);
    };
    const next = () => {
      if (generation !== run) return;
      if (index === chunks.length) { current = null; clearTimeout(timer); options.onComplete(); return; }
      try {
        const utterance = makeUtterance(chunks[index++]);
        current = utterance;
        utterance.voice = options.voice; utterance.lang = options.voice.lang;
        utterance.rate = options.rate; utterance.pitch = 1; utterance.volume = 1;
        const active = () => generation === run && current === utterance;
        utterance.onstart = () => {
          if (!active()) return;
          clearTimeout(timer);
          timer = setTimeout(() => fail("study-audio-completion-timeout"), 60000);
        };
        utterance.onend = () => { if (active()) { clearTimeout(timer); next(); } };
        utterance.onerror = (event) => { if (active()) fail(`study-audio-${event.error || "failed"}`); };
        timer = setTimeout(() => fail("study-audio-start-timeout"), 8000);
        if (engine.paused) engine.resume();
        engine.speak(utterance);
      } catch { fail("study-audio-failed"); }
    };
    if (!chunks.length) { fail("study-audio-empty"); return; }
    next();
  };
  return { play, stop };
}
