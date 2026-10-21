import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LearningAudioPlayer } from "./LearningAudioPlayer";
import { learningVoiceCopy } from "@/infrastructure/i18n/learning-voice-copy";
import { selectLearningVoice, type LearningVoice } from "@/domain/models/learning-voice";

const scenario = vi.hoisted(() => ({ locale: "en" as "es" | "en" | "ko", voices: [] as LearningVoice[], loading: false, supported: true }));
vi.mock("@/application/i18n/I18nContext", () => ({ useI18n: () => ({ locale: scenario.locale }) }));
vi.mock("@/application/controllers/useLearningVoice", () => ({ useLearningVoice: (language: "en" | "ko") => {
  const preference = { accent: "auto", voiceURI: "", pace: "natural" as const };
  return { preference, update: vi.fn(), voices: scenario.voices, loading: scenario.loading, supported: scenario.supported, ...selectLearningVoice(scenario.voices, language, preference) };
} }));

const voice = { name: "Natural sample", voiceURI: "sample", lang: "en-GB", localService: true, default: false };
const render = (language: "en" | "ko", disabled = false) => renderToStaticMarkup(<LearningAudioPlayer text="Exercise sample." language={language} stageId="sample" disabled={disabled} />);

describe("study audio controls", () => {
  beforeEach(() => { scenario.locale = "en"; scenario.voices = [voice]; scenario.loading = false; scenario.supported = true; });
  it.each(["es", "en", "ko"] as const)("localises controls and keeps settings optional in %s", (locale) => {
    scenario.locale = locale;
    const html = render("en");
    const copy = learningVoiceCopy[locale];
    for (const label of [copy.play, copy.settings, copy.accent, copy.voice, copy.pace, copy.notice]) expect(html).toContain(label);
    expect(html).toContain("Natural sample · en-GB");
    expect(html).not.toContain("<details class=\"learning-audio-settings\" open");
    expect(html).not.toContain("Exercise sample."); // Transcript is not shown by default.
  });
  it("does not offer English audio as a Korean voice", () => {
    scenario.locale = "ko";
    const html = render("ko");
    expect(html).toContain(learningVoiceCopy.ko.unavailable);
    expect(html).toMatch(/class="model-audio-button" disabled=""/);
    expect(html).not.toContain("Natural sample");
  });
  it("disables model playback while recording", () => {
    expect(render("en", true)).toMatch(/class="model-audio-button" disabled=""/);
    expect(render("en", false)).not.toMatch(/class="model-audio-button" disabled=""/);
  });
  it("shows a bounded-loading message without pretending a voice exists", () => {
    scenario.voices = []; scenario.loading = true;
    expect(render("en")).toContain(learningVoiceCopy.en.loading);
    scenario.loading = false; scenario.supported = false;
    expect(render("en")).toContain(learningVoiceCopy.en.unavailable);
  });
});
