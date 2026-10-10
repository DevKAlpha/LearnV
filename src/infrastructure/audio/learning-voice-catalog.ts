type CatalogEngine = Pick<SpeechSynthesis, "getVoices" | "addEventListener" | "removeEventListener">;

/** Devices may expose their voices after mount; loading never blocks the exercise. */
export function observeLearningVoices(engine: CatalogEngine, update: (voices: SpeechSynthesisVoice[], loading: boolean) => void) {
  let active = true;
  let settled = false;
  let voices: SpeechSynthesisVoice[] = [];
  const timeout = setTimeout(() => { if (active) { settled = true; update(voices, false); } }, 3000);
  const refresh = () => {
    if (!active) return;
    try { voices = engine.getVoices(); if (voices.length) settled = true; }
    catch { voices = []; settled = true; }
    if (settled) clearTimeout(timeout);
    update(voices, !settled);
  };
  engine.addEventListener("voiceschanged", refresh);
  refresh();
  return () => { active = false; clearTimeout(timeout); engine.removeEventListener("voiceschanged", refresh); };
}
