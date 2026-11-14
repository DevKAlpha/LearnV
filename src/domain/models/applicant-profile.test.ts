import { describe, expect, it } from "vitest";
import { ageOn, checkAgeLimit, emptyApplicantProfile, isValidBirthDate, lastEligibleEntryYear, normalizeApplicantProfile } from "./applicant-profile";
import { measureLevel } from "./measured-level";

describe("applicant profile", () => {
  it("validates every field and falls back safely", () => {
    expect(normalizeApplicantProfile("x")).toEqual(emptyApplicantProfile);
    const profile = normalizeApplicantProfile({ targetMajor: "  Ingeniería   de materiales ", track: "university", applicationStatus: "applied", birthDate: "2005-02-30", declaredKorean: "topik3", declaredEnglish: "z9" });
    expect(profile).toMatchObject({ targetMajor: "Ingeniería de materiales", track: "university", applicationStatus: "applied", birthDate: null, declaredKorean: "topik3", declaredEnglish: "none" });
    expect(normalizeApplicantProfile({ targetMajor: "x".repeat(200) }).targetMajor).toHaveLength(80);
    expect(isValidBirthDate("2005-02-28", "2026-11-13")).toBe(true);
    expect(isValidBirthDate("2030-01-01", "2026-11-13")).toBe(false);
  });

  it("computes age on the cut-off date", () => {
    expect(ageOn("2003-03-01", "2028-03-01")).toBe(25);
    expect(ageOn("2003-03-02", "2028-03-01")).toBe(24);
    expect(checkAgeLimit("2003-03-02", 2028)).toEqual({ status: "ok", age: 24, cutoff: "2028-03-01" });
    expect(checkAgeLimit("2003-03-01", 2028)).toMatchObject({ status: "over", age: 25 });
    expect(checkAgeLimit(null, 2028)).toEqual({ status: "unknown" });
  });

  it("finds the last cycle within the age limit", () => {
    expect(lastEligibleEntryYear("2003-03-01")).toBe(2027);
    expect(lastEligibleEntryYear("2003-03-02")).toBe(2028);
    expect(lastEligibleEntryYear("2003-12-31")).toBe(2028);
    expect(checkAgeLimit("2003-12-31", 2028).status).toBe("ok");
    expect(checkAgeLimit("2003-12-31", 2029).status).toBe("over");
  });
});

describe("measured level", () => {
  const stages = (["reading", "grammar"] as const).flatMap((skill) => Array.from({ length: 22 }, (_, index) => ({ id: `${skill}-${index + 1}`, skill, order: index + 1 })));
  const pass = { attempts: 1, bestScore: 90, lastScore: 90, passed: true, lastCompletedAt: "2026-11-13T09:00:00.000Z" };

  it("uses the furthest stage per skill, not the average score", () => {
    expect(measureLevel(stages, {}).band).toBe("none");
    const level = measureLevel(stages, { "reading-1": pass, "reading-2": pass, "grammar-1": pass });
    expect(level.perSkill).toEqual({ reading: 2, grammar: 1 });
    expect(level.band).toBe("band1");
    expect(level.passed).toBe(3);
  });

  it("counts stages unlocked by the level test", () => {
    const level = measureLevel(stages, {}, { reading: 18, grammar: 10 });
    expect(level.reach).toBe(14);
    expect(level.band).toBe("band2");
  });
});
