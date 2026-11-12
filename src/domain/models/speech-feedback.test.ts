import { describe, expect, it } from "vitest";
import { analyzeSpeech, modelKeywords } from "./speech-feedback";

describe("speech feedback", () => {
  it("measures English pace and fillers", () => {
    const transcript = "Um I want to study engineering in Korea because uh you know batteries matter";
    const analysis = analyzeSpeech(transcript, 6, "en");
    expect(analysis.units).toBe(14);
    expect(analysis.rate).toBe(140);
    expect(analysis.pace).toBe("ok");
    expect(analysis.fillers).toEqual(expect.arrayContaining(["um", "uh", "you know"]));
    expect(analysis.fillerCount).toBe(3);
    expect(analyzeSpeech("I want to study", 10, "en").pace).toBe("slow");
  });

  it("counts Korean syllables, not spaces", () => {
    const analysis = analyzeSpeech("저는 한국에서 공학을 공부하고 싶습니다", 4, "ko");
    expect(analysis.units).toBe(17);
    expect(analysis.rateUnit).toBe("spm");
    expect(analysis.rate).toBe(255);
    expect(analysis.pace).toBe("ok");
  });

  it("compares the answer with the model's key words", () => {
    const keywords = modelKeywords("Studying International Business in Korea would let me examine trade decisions.", "en");
    expect(keywords).toEqual(["studying", "international", "business", "korea", "examine", "trade"]);
    const analysis = analyzeSpeech("I would study business in Korea to examine trade.", 5, "en", keywords);
    expect(analysis.saidKeywords).toEqual(expect.arrayContaining(["business", "korea", "examine", "trade", "studying"]));
    expect(analysis.missingKeywords).toEqual(["international"]);
  });

  it("matches Korean key words by stem, so particles may change", () => {
    const keywords = modelKeywords("저는 한국에서 공학을 공부하고 싶습니다.", "ko");
    expect(keywords).toContain("한국");
    expect(keywords).toContain("공학");
    const analysis = analyzeSpeech("한국은 공학이 강해요", 3, "ko", keywords);
    expect(analysis.saidKeywords).toEqual(expect.arrayContaining(["한국", "공학"]));
  });
});
