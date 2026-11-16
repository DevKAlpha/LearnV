import { dayNumber } from "./learning-journey";

/**
 * Korean cultural calendar. Solar holidays repeat every year ("MM-DD"); lunar ones (설날, 추석)
 * and yearly events (수능) move, so they list explicit dates per year. A festival without a
 * date for a year simply does not appear that year: no guessed dates.
 */
export type FestivalId = "seollal" | "samiljeol" | "childrens-day" | "chuseok" | "hangeul-day" | "suneung" | "pepero-day" | "dongji";

export type Festival = {
  id: FestivalId;
  /** "MM-DD" for a fixed date, or explicit "YYYY-MM-DD" dates. */
  fixed?: string;
  dates?: readonly string[];
  /** Days shown as "active" before and after the day itself (holiday periods last several days). */
  around: number;
};

export type FestivalOccurrence = { id: FestivalId; date: string; start: string; end: string };

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const shift = (dateKey: string, days: number) => {
  const date = new Date(`${dateKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export function festivalOccurrences(festival: Festival, year: number): FestivalOccurrence[] {
  const days = festival.fixed ? [`${year}-${festival.fixed}`] : (festival.dates ?? []).filter((date) => date.startsWith(`${year}-`));
  return days.filter((date) => DATE.test(date)).map((date) => ({ id: festival.id, date, start: shift(date, -festival.around), end: shift(date, festival.around) }));
}

function occurrencesNear(today: string, festivals: readonly Festival[]): FestivalOccurrence[] {
  const year = Number(today.slice(0, 4));
  return festivals.flatMap((festival) => [year - 1, year, year + 1].flatMap((value) => festivalOccurrences(festival, value)))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** The festival whose period includes today (the closest day wins if two overlap). */
export function activeFestival(today: string, festivals: readonly Festival[]): FestivalOccurrence | null {
  const current = occurrencesNear(today, festivals).filter((item) => item.start <= today && today <= item.end);
  return current.sort((a, b) => Math.abs(dayNumber(a.date) - dayNumber(today)) - Math.abs(dayNumber(b.date) - dayNumber(today)))[0] ?? null;
}

/** The next festival day after today, within `horizon` days. */
export function upcomingFestival(today: string, festivals: readonly Festival[], horizon = 60): FestivalOccurrence | null {
  const limit = dayNumber(today) + horizon;
  return occurrencesNear(today, festivals).find((item) => item.date > today && dayNumber(item.date) <= limit) ?? null;
}

export function daysUntil(today: string, date: string): number {
  return dayNumber(date) - dayNumber(today);
}
