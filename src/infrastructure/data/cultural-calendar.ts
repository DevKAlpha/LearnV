import type { Festival } from "@/domain/models/cultural-calendar";

/*
 * Dates checked on 2026-11-16. Lunar dates (설날, 추석) follow Korean Standard Time, which can
 * differ by one day from the Chinese calendar (설날 2027 and 2028). The 수능 date is the one
 * announced by the Korean Ministry of Education; later years are added once announced.
 * Extend `dates` each year; a missing year hides that festival instead of guessing.
 */
export const festivals: readonly Festival[] = [
  { id: "seollal", dates: ["2026-02-17", "2027-02-07", "2028-01-27"], around: 2 },
  { id: "samiljeol", fixed: "03-01", around: 0 },
  { id: "childrens-day", fixed: "05-05", around: 0 },
  { id: "chuseok", dates: ["2026-09-25", "2027-09-15", "2028-10-03"], around: 2 },
  { id: "hangeul-day", fixed: "10-09", around: 1 },
  { id: "pepero-day", fixed: "11-11", around: 0 },
  { id: "suneung", dates: ["2025-11-13", "2026-11-19"], around: 1 },
  { id: "dongji", dates: ["2026-12-22", "2027-12-22", "2028-12-21"], around: 1 },
];

/** Last year with every moving date filled in; a test fails when the calendar runs out. */
export const CALENDAR_COVERED_UNTIL = 2028;
