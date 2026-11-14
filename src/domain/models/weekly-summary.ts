import { dayNumber, localDateKey, type LearningJourneyState, type LearningSkill } from "./learning-journey";

export type WeekTotals = { minutes: number; practiceDays: number; practices: number; reviewed: number };

export type WeeklySummary = WeekTotals & {
  from: string;
  to: string;
  previous: WeekTotals;
  /** Lowest average score among the skills practised this week; null without scored practice. */
  weakest: { skill: LearningSkill; score: number } | null;
};

function shift(day: string, days: number) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * The last seven local days (today included) against the seven before. Built only from
 * recorded evidence: active time, practice events and spaced reviews. Ticked tasks are not
 * practice and do not appear here.
 */
export function weeklySummary(journey: LearningJourneyState, reviewDays: Readonly<Record<string, number>>, today: string): WeeklySummary {
  const end = dayNumber(today);
  const inWeek = (day: string, weeksBack: number) => {
    const offset = end - dayNumber(day);
    return offset >= weeksBack * 7 && offset < (weeksBack + 1) * 7;
  };
  const practice = journey.recentActivities.filter((event) => event.kind === "practice" && event.occurredAt);
  const totals = (weeksBack: number): WeekTotals => {
    const events = practice.filter((event) => inWeek(localDateKey(event.occurredAt!), weeksBack));
    const seconds = Object.entries(journey.dailySeconds).filter(([day]) => inWeek(day, weeksBack)).reduce((sum, [, value]) => sum + value, 0);
    return {
      minutes: Math.round(seconds / 60),
      practiceDays: journey.activeDates.filter((day) => inWeek(day, weeksBack)).length,
      practices: events.length,
      reviewed: Object.entries(reviewDays).filter(([day]) => inWeek(day, weeksBack)).reduce((sum, [, value]) => sum + value, 0),
    };
  };

  const scores = new Map<LearningSkill, number[]>();
  for (const event of practice) {
    if (!event.skill || typeof event.score !== "number" || !inWeek(localDateKey(event.occurredAt!), 0)) continue;
    scores.set(event.skill, [...(scores.get(event.skill) ?? []), event.score]);
  }
  const weakest = [...scores.entries()]
    .map(([skill, list]) => ({ skill, score: Math.round(list.reduce((sum, value) => sum + value, 0) / list.length) }))
    .sort((a, b) => a.score - b.score)[0] ?? null;

  return { ...totals(0), from: shift(today, -6), to: today, previous: totals(1), weakest };
}
