import { describe, expect, it } from "vitest";
import { gksFeedbackVideos } from "./gks-feedback-videos";
import { translations } from "../i18n/translations";

describe("GKS feedback videos", () => {
  it("preserves the three existing options and adds two distinct resources", () => {
    expect(gksFeedbackVideos).toHaveLength(5);
    expect(gksFeedbackVideos.slice(0, 3).map((video) => video.id)).toEqual(["application", "documents", "guidelines"]);
    expect(new Set(gksFeedbackVideos.map((video) => video.videoId)).size).toBe(5);
  });

  it("uses valid YouTube identifiers and matching source URLs", () => {
    for (const video of gksFeedbackVideos) {
      expect(video.videoId).toMatch(/^[\w-]{11}$/);
      expect(video.sourceUrl).toBe(`https://www.youtube.com/watch?v=${video.videoId}`);
    }
  });

  it.each(["es", "en", "ko"] as const)("provides guidance and a source-verification label in %s for all options", (locale) => {
    for (const video of gksFeedbackVideos) {
      const copy = translations[locale].gks.videoItems[video.id];
      expect(copy.title.length).toBeGreaterThan(5);
      expect(copy.badge.length).toBeGreaterThan(5);
      expect(copy.text.length).toBeGreaterThan(20);
    }
    expect(translations[locale].gks.verifyVideoSource.length).toBeGreaterThan(5);
    expect(translations[locale].gks.videoItems.onlineGuide.badge).toContain("2027");
    expect(translations[locale].gks.videoItems.applicationMistakes.badge).toContain("2021");
  });

  it("provides official traceability for the portal-linked guide without attributing community advice to the government", () => {
    const guide = gksFeedbackVideos.find((video) => video.id === "onlineGuide")!;
    expect(new URL(guide.referenceUrl!).hostname).toBe("www.studyinkorea.go.kr");
    expect(gksFeedbackVideos.find((video) => video.id === "applicationMistakes")!.referenceUrl).toBeNull();
  });
});
