import { describe, expect, it } from "vitest";
import { gksFeedbackVideos } from "./gks-feedback-videos";

describe("GKS feedback videos", () => {
  it("offers exactly three selectable videos", () => {
    expect(gksFeedbackVideos).toHaveLength(3);
    expect(new Set(gksFeedbackVideos.map((video) => video.id)).size).toBe(3);
  });

  it("uses valid YouTube identifiers and matching source URLs", () => {
    for (const video of gksFeedbackVideos) {
      expect(video.videoId).toMatch(/^[\w-]{11}$/);
      expect(video.sourceUrl).toBe(`https://www.youtube.com/watch?v=${video.videoId}`);
    }
  });
});
