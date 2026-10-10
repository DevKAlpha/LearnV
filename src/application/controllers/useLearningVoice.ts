import { useEffect, useMemo, useState } from "react";
import type { TestLanguage } from "@/domain/models/language-test";
import { selectLearningVoice, type VoicePreference } from "@/domain/models/learning-voice";
import { readVoicePreference, saveVoicePreference } from "@/infrastructure/data/learning-voice-preferences";
import { observeLearningVoices } from "@/infrastructure/audio/learning-voice-catalog";

export function useLearningVoice(language: TestLanguage) {
  const [preference, setPreference] = useState(() => readVoicePreference(language));
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
  useEffect(() => { setPreference(readVoicePreference(language)); }, [language]);
  useEffect(() => {
    if (!supported) { setLoading(false); return; }
    return observeLearningVoices(window.speechSynthesis, (available, pending) => { setVoices(available); setLoading(pending); });
  }, [supported]);
  const selection = useMemo(() => selectLearningVoice(voices, language, preference), [voices, language, preference]);
  const update = (change: Partial<VoicePreference>) => {
    const next = { ...preference, ...change };
    setPreference(next); saveVoicePreference(language, next);
  };
  return { preference, update, voices, ...selection, supported, loading };
}
