import { describe, expect, it } from "vitest";
import { normalizeWritingLab } from "./useWritingLab";

describe("writing lab storage", () => {
  it("drops corrupted drafts and keeps at most five versions", () => {
    expect(normalizeWritingLab(null)).toEqual({});
    const state = normalizeWritingLab({ "topik-53-students": { draft: "초안", versions: ["1", "2", "3", "4", "5", "6", 7] }, "../bad": { draft: "x" } });
    expect(Object.keys(state)).toEqual(["topik-53-students"]);
    expect(state["topik-53-students"].versions).toEqual(["2", "3", "4", "5", "6"]);
  });
});
