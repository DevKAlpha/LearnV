import { describe, expect, it } from "vitest";
import { INTERVIEW_PERSONALITY_IDS } from "../../domain/models/interview-chatbot";
import { interviewPersonalities } from "./interview-chatbot";

describe("interview chatbot personalities", () => {
  it("provides a complete GKS interviewer identity in every language", () => {
    expect(Object.keys(interviewPersonalities)).toEqual([...INTERVIEW_PERSONALITY_IDS]);

    for (const id of INTERVIEW_PERSONALITY_IDS) {
      const profile = interviewPersonalities[id];
      expect(profile.id).toBe(id);
      for (const locale of ["es", "en", "ko"] as const) {
        expect(profile.name[locale].length).toBeGreaterThan(1);
        expect(profile.role[locale]).toContain("GKS");
        expect(profile.opening[locale].length).toBeGreaterThan(35);
        expect(profile.followUpIntro[locale].length).toBeGreaterThan(4);
        expect(profile.nextQuestionIntro[locale].length).toBeGreaterThan(3);
      }
    }
  });

  it("uses genuinely different openings rather than renaming one script", () => {
    const spanishOpenings = INTERVIEW_PERSONALITY_IDS.map((id) => interviewPersonalities[id].opening.es);
    expect(new Set(spanishOpenings).size).toBe(INTERVIEW_PERSONALITY_IDS.length);
  });
});
