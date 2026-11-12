import { useCallback, useEffect, useRef } from "react";
import type { TestLanguage } from "@/domain/models/language-test";
import { voicePaces } from "@/domain/models/learning-voice";
import { createLearningSpeech } from "@/infrastructure/audio/learning-speech";
import { useLearningVoice } from "./useLearningVoice";

/**
 * One-tap pronunciation for short items (letters, syllables, words). It shares the learner's
 * voice settings with the full audio player; failures are silent because the text is
 * always visible next to the button.
 */
export function useQuickSpeech(language: TestLanguage) {
  const controls = useLearningVoice(language);
  const player = useRef<ReturnType<typeof createLearningSpeech> | null>(null);
  useEffect(() => {
    if (!controls.supported) return;
    const engine = window.speechSynthesis;
    player.current = createLearningSpeech({
      speak: (utterance) => engine.speak(utterance as SpeechSynthesisUtterance),
      cancel: () => engine.cancel(), resume: () => engine.resume(), get paused() { return engine.paused; },
    }, (value) => new SpeechSynthesisUtterance(value), engine);
    const stop = () => player.current?.stop();
    window.addEventListener("pagehide", stop);
    return () => { window.removeEventListener("pagehide", stop); stop(); player.current = null; };
  }, [controls.supported]);
  const voice = controls.voice;
  const pace = controls.preference.pace;
  const speak = useCallback((text: string) => {
    if (!voice || !player.current) return;
    player.current.play({ text, voice, rate: voicePaces[pace], onComplete: () => undefined, onFailure: () => undefined });
  }, [voice, pace]);
  return { speak, available: Boolean(controls.supported && voice) };
}
