import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/application/i18n/I18nContext";
import type { TestLanguage } from "@/domain/models/language-test";
import { recordLearningError } from "@/infrastructure/data/learning-error-log";

type Props = {
  script: string;
  language: TestLanguage;
  stageId: string;
  onCompleted: () => void;
  onTranscript: () => void;
};

export function ScriptListeningPractice({ script, language, stageId, onCompleted, onTranscript }: Props) {
  const { copy } = useI18n();
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [transcript, setTranscript] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const clearWatchdog = () => { clearTimeout(watchdogRef.current); };
  const stop = () => {
    utteranceRef.current = null;
    clearWatchdog();
    window.speechSynthesis?.cancel();
    setPlaying(false);
  };
  useEffect(() => () => {
    utteranceRef.current = null;
    clearTimeout(watchdogRef.current);
    window.speechSynthesis?.cancel();
  }, []);
  useEffect(() => { window.speechSynthesis?.getVoices(); }, []);
  const showTranscript = () => {
    stop();
    setTranscript(true);
    onTranscript();
  };
  const play = () => {
    stop();
    const fail = (code: string) => {
      showTranscript();
      recordLearningError({ area: language === "ko" ? "korean-learning" : "english-learning", severity: "warning", code, context: { stageId } });
    };
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      fail("practice-dialogue-audio-unavailable");
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((candidate) => candidate.lang.toLowerCase().startsWith(language));
    if (!voice) { fail("practice-dialogue-language-voice-unavailable"); return; }
    const utterance = new SpeechSynthesisUtterance(script);
    utteranceRef.current = utterance;
    utterance.lang = language === "ko" ? "ko-KR" : "en-GB";
    if (voice) utterance.voice = voice;
    utterance.rate = 0.9;
    setPlaying(true);
    utterance.onend = () => {
      if (utteranceRef.current !== utterance) return;
      clearWatchdog();
      utteranceRef.current = null;
      setPlaying(false);
      setFinished(true);
      onCompleted();
    };
    utterance.onerror = () => {
      if (utteranceRef.current === utterance) fail("practice-dialogue-audio-failed");
    };
    watchdogRef.current = setTimeout(() => {
      if (utteranceRef.current === utterance) fail("practice-dialogue-audio-timeout");
    }, 90000);
    try { window.speechSynthesis.speak(utterance); }
    catch { fail("practice-dialogue-audio-failed"); }
  };
  return <section className="script-listening-practice">
    <strong>{copy.tests.syntheticAudio}</strong>
    <div className="script-listening-actions">
      <button type="button" className="model-audio-button" onClick={playing ? stop : play}>{playing ? copy.tests.stopAudio : copy.tests.playAudio}</button>
      <button type="button" className="test-text-action" onClick={showTranscript}>{copy.tests.transcriptPractice}</button>
    </div>
    <p role="status">{finished ? copy.tests.audioFinished : ""}</p>
    {transcript && <><p>{copy.tests.transcriptOnlyNotice}</p><blockquote className="question-passage">{script}</blockquote></>}
  </section>;
}
