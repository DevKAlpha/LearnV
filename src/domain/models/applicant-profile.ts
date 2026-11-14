import type { ApplicationStatus } from "./gks-cycle";

/**
 * What the applicant tells LearnV about themselves. Everything stays on the device; the
 * birth date is used only to check the age limit locally.
 */
export const TRACKS = ["undecided", "university", "embassy"] as const;
export const KOREAN_LEVELS = ["none", "topik1", "topik2", "topik3", "topik4", "topik5", "topik6"] as const;
export const ENGLISH_LEVELS = ["none", "a2", "b1", "b2", "c1", "c2"] as const;
export type Track = typeof TRACKS[number];
export type DeclaredKorean = typeof KOREAN_LEVELS[number];
export type DeclaredEnglish = typeof ENGLISH_LEVELS[number];

export type ApplicantProfile = {
  version: 1;
  targetMajor: string;
  track: Track;
  applicationStatus: ApplicationStatus;
  birthDate: string | null;
  declaredKorean: DeclaredKorean;
  declaredEnglish: DeclaredEnglish;
};

export const MAX_MAJOR_LENGTH = 80;

export const emptyApplicantProfile: ApplicantProfile = {
  version: 1,
  targetMajor: "",
  track: "undecided",
  applicationStatus: "preparing",
  birthDate: null,
  declaredKorean: "none",
  declaredEnglish: "none",
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const oneOf = <T extends string>(values: readonly T[], value: unknown, fallback: T): T =>
  values.includes(value as T) ? value as T : fallback;

export function isValidBirthDate(value: unknown, today = new Date().toISOString().slice(0, 10)): value is string {
  if (typeof value !== "string" || !DATE.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && value >= "1950-01-01" && value <= today;
}

export function normalizeApplicantProfile(raw: unknown): ApplicantProfile {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return emptyApplicantProfile;
  const record = raw as Record<string, unknown>;
  return {
    version: 1,
    targetMajor: typeof record.targetMajor === "string" ? record.targetMajor.replace(/\s+/gu, " ").trim().slice(0, MAX_MAJOR_LENGTH) : "",
    track: oneOf(TRACKS, record.track, "undecided"),
    applicationStatus: oneOf(["preparing", "applied"] as const, record.applicationStatus, "preparing"),
    birthDate: isValidBirthDate(record.birthDate) ? record.birthDate : null,
    declaredKorean: oneOf(KOREAN_LEVELS, record.declaredKorean, "none"),
    declaredEnglish: oneOf(ENGLISH_LEVELS, record.declaredEnglish, "none"),
  };
}

/** Whole years of age on a date (both YYYY-MM-DD). */
export function ageOn(birthDate: string, date: string): number {
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const [y, m, d] = date.split("-").map(Number);
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
}

/** The 2027 guideline: under 25 on 1 March of the entry year. Recheck it in every new guideline. */
export const AGE_LIMIT = 25;

export type AgeCheck = { status: "unknown" } | { status: "ok" | "over"; age: number; cutoff: string };

export function checkAgeLimit(birthDate: string | null, entryYear: number): AgeCheck {
  if (!birthDate) return { status: "unknown" };
  const cutoff = `${entryYear}-03-01`;
  const age = ageOn(birthDate, cutoff);
  return { status: age < AGE_LIMIT ? "ok" : "over", age, cutoff };
}

/** Nearest cycle the applicant can still meet the age limit for, or null when none. */
export function lastEligibleEntryYear(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const [by, bm, bd] = birthDate.split("-").map(Number);
  // Turning 25 on or before 1 March of a year makes that year (and later) ineligible.
  const turns25 = by + AGE_LIMIT;
  const birthdayOnOrBeforeMarchFirst = bm < 3 || (bm === 3 && bd <= 1);
  return birthdayOnOrBeforeMarchFirst ? turns25 - 1 : turns25;
}
