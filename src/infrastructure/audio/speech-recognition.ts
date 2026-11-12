/**
 * Thin wrapper over the browser's Web Speech recognition. It is opt-in: in most browsers
 * the audio is processed by the browser vendor's online service, which the UI states
 * before the learner starts.
 */
type RecognitionResultList = ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
type RecognitionEvent = { resultIndex: number; results: RecognitionResultList };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};
type RecognitionConstructor = new () => Recognition;

function recognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const candidate = (window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor });
  return candidate.SpeechRecognition ?? candidate.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionAvailable() {
  return recognitionConstructor() !== null;
}

export type SpeechCapture = { stop(): void; abort(): void };

/** Starts listening; `onDone` receives the final transcript and the speaking time in seconds. */
export function startSpeechCapture(
  lang: string,
  { onDone, onError }: { onDone: (transcript: string, seconds: number) => void; onError: (code: string) => void },
): SpeechCapture | null {
  const Constructor = recognitionConstructor();
  if (!Constructor) return null;
  const recognition = new Constructor();
  recognition.lang = lang;
  recognition.continuous = true;
  recognition.interimResults = false;
  const parts: string[] = [];
  const startedAt = Date.now();
  let failed = false;
  recognition.onresult = (event) => {
    for (let index = event.resultIndex; index < event.results.length; index++) {
      const result = event.results[index];
      if (result.isFinal) parts.push(result[0].transcript);
    }
  };
  recognition.onerror = (event) => { failed = true; onError(event.error || "speech-recognition-failed"); };
  recognition.onend = () => { if (!failed) onDone(parts.join(" ").trim(), (Date.now() - startedAt) / 1000); };
  try { recognition.start(); } catch { onError("speech-recognition-start-failed"); return null; }
  return { stop: () => recognition.stop(), abort: () => { failed = true; recognition.abort(); } };
}
