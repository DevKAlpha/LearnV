import "@/styles/tailwind-study.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/application/i18n/I18nContext";
import { analyzeSpeech, modelKeywords, type SpeechAnalysis, type SpeechLanguage } from "@/domain/models/speech-feedback";
import { isSpeechRecognitionAvailable, startSpeechCapture, type SpeechCapture } from "@/infrastructure/audio/speech-recognition";
import { recordLearningError } from "@/infrastructure/data/learning-error-log";
import { speechCheckCopy } from "@/infrastructure/i18n/speech-check-copy";

type Props = { language: SpeechLanguage; model: string; stageId: string };
type Status = "idle" | "listening" | "done" | "error";

const button = "min-h-11 w-fit cursor-pointer rounded-full border-2 px-5 py-2 font-extrabold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current";

/** Optional speech-to-text check for the shadowing loop: model → own version → compare. */
export function SpeechCheck({ language, model, stageId }: Props) {
  const { locale } = useI18n();
  const copy = speechCheckCopy[locale];
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<{ transcript: string; analysis: SpeechAnalysis } | null>(null);
  const capture = useRef<SpeechCapture | null>(null);
  const keywords = useMemo(() => modelKeywords(model, language), [model, language]);
  const [available] = useState(isSpeechRecognitionAvailable);
  useEffect(() => () => capture.current?.abort(), []);

  const start = () => {
    setResult(null);
    capture.current = startSpeechCapture(language === "ko" ? "ko-KR" : "en-GB", {
      onDone: (transcript, seconds) => {
        capture.current = null;
        setResult({ transcript, analysis: analyzeSpeech(transcript, seconds, language, keywords) });
        setStatus("done");
      },
      onError: (code) => {
        capture.current = null;
        setStatus("error");
        recordLearningError({ area: language === "ko" ? "korean-learning" : "english-learning", severity: "warning", code: `speech-check-${code}`, context: { stageId } });
      },
    });
    if (capture.current) setStatus("listening");
  };

  return (
    <section className="grid gap-2.5 rounded-2xl border-2 border-edge bg-paper p-3.5 text-left text-fg" aria-labelledby={`${stageId}-speech-check`}>
      <strong id={`${stageId}-speech-check`}>{copy.title}</strong>
      <p className="m-0 text-[0.95rem]">{copy.intro}</p>
      {!available ? <p className="m-0 text-sm">{copy.unavailable}</p> : (
        <>
          <p className="m-0 text-sm">{copy.privacy}</p>
          {status === "listening"
            ? <button type="button" className={`${button} border-ink bg-accent text-ink`} onClick={() => capture.current?.stop()}>■ {copy.stop}</button>
            : <button type="button" className={`${button} border-edge bg-cream text-fg`} onClick={start}>{status === "idle" ? copy.start : copy.again}</button>}
          <p className="m-0 text-sm font-bold" role="status" aria-live="polite">
            {status === "listening" ? copy.listening : status === "error" ? copy.error : status === "done" && !result?.transcript ? copy.empty : ""}
          </p>
        </>
      )}
      {result && result.transcript && (
        <div className="grid gap-2">
          <p className="m-0"><strong>{copy.transcript}:</strong> <span lang={language}>{result.transcript}</span></p>
          <ul className="m-0 grid gap-1 pl-5">
            <li>{copy.rate(result.analysis.rate, result.analysis.rateUnit)} · {copy.pace[result.analysis.pace]}</li>
            <li>{copy.fillers(result.analysis.fillers.join(", "), result.analysis.fillerCount)}</li>
            {keywords.length > 0 && (
              <li>
                {copy.keywords(result.analysis.saidKeywords.length, keywords.length)}
                {result.analysis.missingKeywords.length > 0 && <> {copy.missing}: <span lang={language}>{result.analysis.missingKeywords.join(", ")}</span>.</>}
              </li>
            )}
          </ul>
          <small>{copy.caveat}</small>
        </div>
      )}
    </section>
  );
}
