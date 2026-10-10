import { useEffect, useId, useRef, useState } from "react";
import { useI18n } from "@/application/i18n/I18nContext";
import { useLearningVoice } from "@/application/controllers/useLearningVoice";
import type { TestLanguage } from "@/domain/models/language-test";
import { normalizeVoiceLanguage, voiceAccents, voicePaces, type VoicePreference } from "@/domain/models/learning-voice";
import { learningVoiceCopy } from "@/infrastructure/i18n/learning-voice-copy";
import { createLearningSpeech } from "@/infrastructure/audio/learning-speech";
import { recordLearningError } from "@/infrastructure/data/learning-error-log";

type Props = { text: string; language: TestLanguage; stageId: string; questionId?: string; label?: string; disabled?: boolean; onCompleted?: () => void; onTranscript?: () => void };

export function LearningAudioPlayer({ text, language, stageId, questionId, label, disabled = false, onCompleted, onTranscript }: Props) {
  const { locale } = useI18n();
  const copy = learningVoiceCopy[locale];
  const controls = useLearningVoice(language);
  const id = useId();
  const [status, setStatus] = useState<"idle" | "playing" | "finished" | "failed">("idle");
  const [transcript, setTranscript] = useState(false);
  const player = useRef<ReturnType<typeof createLearningSpeech> | null>(null);
  const callbacks = useRef({ onCompleted, onTranscript });
  callbacks.current = { onCompleted, onTranscript };
  useEffect(() => {
    if (!controls.supported) return;
    const engine = window.speechSynthesis;
    player.current = createLearningSpeech({
      speak: (utterance) => engine.speak(utterance as SpeechSynthesisUtterance),
      cancel: () => engine.cancel(), resume: () => engine.resume(), get paused() { return engine.paused; },
    }, (value) => new SpeechSynthesisUtterance(value));
    return () => { player.current?.stop(); player.current = null; };
  }, [controls.supported]);
  useEffect(() => { player.current?.stop(); setStatus("idle"); setTranscript(false); }, [text, language, stageId, questionId]);
  useEffect(() => { if (disabled) { player.current?.stop(); setStatus("idle"); } }, [disabled]);
  const stop = () => { player.current?.stop(); setStatus("idle"); };
  const reveal = () => { stop(); setTranscript(true); callbacks.current.onTranscript?.(); };
  const change = (value: Partial<VoicePreference>) => { stop(); controls.update(value); };
  const play = () => {
    if (disabled) return;
    if (!controls.voice || !player.current) { reveal(); return; }
    setStatus("playing");
    player.current.play({ text, voice: controls.voice, rate: voicePaces[controls.preference.pace],
      onComplete: () => { setStatus("finished"); callbacks.current.onCompleted?.(); },
      onFailure: (code) => {
        setStatus("failed"); setTranscript(true); callbacks.current.onTranscript?.();
        recordLearningError({ area: language === "ko" ? "korean-learning" : "english-learning", severity: "warning", code, context: { stageId, questionId, language, accent: controls.voice?.lang, pace: controls.preference.pace } });
      },
    });
  };
  const canPlay = controls.supported && Boolean(controls.voice);
  useEffect(() => {
    if (controls.loading || canPlay) return;
    recordLearningError({ area: language === "ko" ? "korean-learning" : "english-learning", severity: "warning", code: controls.supported ? "study-language-voice-unavailable" : "study-speech-unavailable", context: { stageId, questionId, language } });
  }, [controls.loading, controls.supported, canPlay, language, stageId, questionId]);
  return <section className="learning-audio-player" aria-label={label ?? copy.synthetic}>
    <strong>{label ?? copy.synthetic}</strong>
    <div className="learning-audio-player__actions">
      <button type="button" className="model-audio-button" onClick={status === "playing" ? stop : play} disabled={disabled || (!canPlay && status !== "playing")}><span aria-hidden="true">{status === "playing" ? "■" : "▶"}</span> {status === "playing" ? copy.stop : copy.play}</button>
      <button type="button" className="test-text-action" onClick={reveal}>{copy.transcript}</button>
    </div>
    <p className="learning-audio-player__voice">{controls.voice ? `${controls.voice.name} · ${controls.voice.lang} · ${controls.voice.localService ? copy.local : copy.online}` : controls.loading ? copy.loading : copy.unavailable}</p>
    {(controls.accentUnavailable || controls.voiceUnavailable) && <p role="status">{copy.fallback}</p>}
    <details className="learning-audio-settings">
      <summary>{copy.settings}</summary>
      <div className="learning-audio-settings__fields">
        <label htmlFor={`${id}-accent`}>{copy.accent}<select id={`${id}-accent`} value={controls.preference.accent} onChange={(event) => change({ accent: event.target.value, voiceURI: "" })}>
          <option value="auto">{copy.auto}</option>
          {voiceAccents[language].map((accent) => {
            const available = controls.voices.some((voice) => normalizeVoiceLanguage(voice.lang) === normalizeVoiceLanguage(accent));
            return <option key={accent} value={accent} disabled={!available}>{copy.accents[accent]}{available ? "" : ` · ${copy.unavailableOption}`}</option>;
          })}
        </select></label>
        <label htmlFor={`${id}-voice`}>{copy.voice}<select id={`${id}-voice`} disabled={!canPlay} value={controls.candidates.some((voice) => voice.voiceURI === controls.preference.voiceURI) ? controls.preference.voiceURI : ""} onChange={(event) => change({ voiceURI: event.target.value })}>
          <option value="">{copy.auto}</option>
          {controls.candidates.map((voice) => <option key={`${voice.voiceURI}-${voice.name}`} value={voice.voiceURI}>{voice.name} · {voice.lang}</option>)}
        </select></label>
        <label htmlFor={`${id}-pace`}>{copy.pace}<select id={`${id}-pace`} value={controls.preference.pace} onChange={(event) => change({ pace: event.target.value as VoicePreference["pace"] })}>
          <option value="clear">{copy.clear}</option><option value="natural">{copy.natural}</option><option value="challenge">{copy.challenge}</option>
        </select></label>
      </div>
      <p>{copy.tip}</p><p>{copy.notice}</p>
    </details>
    <p role="status" aria-live="polite">{status === "finished" ? copy.finished : status === "failed" ? copy.failed : ""}</p>
    {transcript && <blockquote className="question-passage">{text}</blockquote>}
  </section>;
}
